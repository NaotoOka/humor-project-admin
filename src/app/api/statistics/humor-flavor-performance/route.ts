import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const PAGE_SIZE = 1000;

// Type definitions for query results
interface HumorFlavorRow {
  id: number;
  slug: string;
  description: string | null;
}

interface CaptionRow {
  id: string;
  humor_flavor_id: number | null;
}

interface ReportRow {
  caption_id: string | null;
}

interface VoteRow {
  caption_id: string;
  vote_value: number;
}

// Confidence levels based on vote count
export type ConfidenceLevel = "low" | "medium" | "high";

export interface HumorFlavorPerformance {
  id: number;
  slug: string;
  description: string | null;
  totalCaptions: number;
  totalVotes: number;
  totalUpvotes: number;
  totalDownvotes: number;
  avgRating: number | null; // null when insufficient data
  votesPerCaption: number | null; // null when insufficient data
  confidence: ConfidenceLevel;
  totalReports: number;
  reportRate: number;
  status: "high_activity_low_quality" | "promising_underexposed" | "needs_review" | "normal";
}

// Configurable thresholds
const THRESHOLDS = {
  // Minimum votes to compute meaningful metrics
  MIN_VOTES_FOR_METRICS: 5,
  // Confidence levels
  LOW_CONFIDENCE_MAX: 4,
  MEDIUM_CONFIDENCE_MAX: 19,
  // Status badge thresholds (only apply when votes >= this)
  MIN_VOTES_FOR_STATUS: 10,
  // Status determination
  HIGH_ACTIVITY_VOTES: 20,
  LOW_AVG_RATING: -0.2, // More downvotes than upvotes
  HIGH_AVG_RATING: 0.5, // Significantly more upvotes
  LOW_ACTIVITY_VOTES: 15,
  HIGH_REPORT_RATE: 0.1, // 10% of captions reported
};

function getConfidenceLevel(totalVotes: number): ConfidenceLevel {
  if (totalVotes <= THRESHOLDS.LOW_CONFIDENCE_MAX) return "low";
  if (totalVotes <= THRESHOLDS.MEDIUM_CONFIDENCE_MAX) return "medium";
  return "high";
}

async function fetchAllCaptions(adminClient: ReturnType<typeof createAdminClient>) {
  const rows: CaptionRow[] = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await adminClient
      .from("captions")
      .select("id, humor_flavor_id")
      .order("id", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw error;

    rows.push(...((data || []) as CaptionRow[]));

    if (!data || data.length < PAGE_SIZE) break;
  }

  return rows;
}

async function fetchAllVotes(adminClient: ReturnType<typeof createAdminClient>) {
  const rows: VoteRow[] = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await adminClient
      .from("caption_votes")
      .select("caption_id, vote_value")
      .order("id", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw error;

    rows.push(...((data || []) as VoteRow[]));

    if (!data || data.length < PAGE_SIZE) break;
  }

  return rows;
}

async function fetchAllReports(adminClient: ReturnType<typeof createAdminClient>) {
  const rows: ReportRow[] = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await adminClient
      .from("reported_captions")
      .select("caption_id")
      .not("caption_id", "is", null)
      .order("id", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw error;

    rows.push(...((data || []) as ReportRow[]));

    if (!data || data.length < PAGE_SIZE) break;
  }

  return rows;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const showAll = searchParams.get("showAll") === "true";

  const adminClient = createAdminClient();

  try {
    // Fetch all humor flavors
    const { data: humorFlavorsData, error: flavorsError } = await adminClient
      .from("humor_flavors")
      .select("id, slug, description");

    if (flavorsError) throw flavorsError;
    const humorFlavors = humorFlavorsData as HumorFlavorRow[] | null;
    if (!humorFlavors || humorFlavors.length === 0) {
      return NextResponse.json({ data: [], hasAnyData: false });
    }

    // Fetch all captions. Supabase caps plain selects, so page through every row.
    const captions = await fetchAllCaptions(adminClient);

    // Build caption ID set per flavor
    const captionsByFlavor = new Map<number, Set<string>>();
    captions?.forEach((caption) => {
      if (caption.humor_flavor_id !== null) {
        const flavorId = caption.humor_flavor_id;
        if (!captionsByFlavor.has(flavorId)) {
          captionsByFlavor.set(flavorId, new Set());
        }
        captionsByFlavor.get(flavorId)!.add(caption.id);
      }
    });

    // Fetch all votes. A partial page would badly undercount high-volume data.
    const votes = await fetchAllVotes(adminClient);

    // Build a map of caption_id -> humor_flavor_id for quick lookup
    const captionToFlavor = new Map<string, number>();
    captions?.forEach((caption) => {
      if (caption.humor_flavor_id !== null) {
        captionToFlavor.set(caption.id, caption.humor_flavor_id);
      }
    });

    // Aggregate votes by caption (only for captions that have a humor_flavor_id)
    const votesByCaption = new Map<string, { upvotes: number; downvotes: number }>();
    votes?.forEach((vote) => {
      // Only count votes for captions that have a humor flavor assigned
      if (captionToFlavor.has(vote.caption_id)) {
        const current = votesByCaption.get(vote.caption_id) || { upvotes: 0, downvotes: 0 };
        if (vote.vote_value > 0) {
          current.upvotes++;
        } else if (vote.vote_value < 0) {
          current.downvotes++;
        }
        votesByCaption.set(vote.caption_id, current);
      }
    });

    // Fetch all reports for the same reason as captions/votes.
    const reports = await fetchAllReports(adminClient);

    // Count reports by caption
    const reportsByCaption = new Map<string, number>();
    reports?.forEach((report) => {
      if (report.caption_id) {
        reportsByCaption.set(report.caption_id, (reportsByCaption.get(report.caption_id) || 0) + 1);
      }
    });

    // Aggregate by humor flavor
    const flavorPerformance: HumorFlavorPerformance[] = humorFlavors.map((flavor) => {
      const captionIds = captionsByFlavor.get(flavor.id) || new Set();
      const totalCaptions = captionIds.size;

      let totalUpvotes = 0;
      let totalDownvotes = 0;
      let totalReports = 0;

      captionIds.forEach((captionId) => {
        const voteData = votesByCaption.get(captionId);
        if (voteData) {
          totalUpvotes += voteData.upvotes;
          totalDownvotes += voteData.downvotes;
        }
        totalReports += reportsByCaption.get(captionId) || 0;
      });

      const totalVotes = totalUpvotes + totalDownvotes;
      const confidence = getConfidenceLevel(totalVotes);
      const hasEnoughData = totalVotes >= THRESHOLDS.MIN_VOTES_FOR_METRICS;

      // Only compute metrics if we have enough data
      const avgRating = hasEnoughData ? (totalUpvotes - totalDownvotes) / totalVotes : null;
      const votesPerCaption = hasEnoughData && totalCaptions > 0 ? totalVotes / totalCaptions : null;
      const reportRate = totalCaptions > 0 ? totalReports / totalCaptions : 0;

      // Only determine status if we have enough votes
      let status: HumorFlavorPerformance["status"] = "normal";
      if (totalVotes >= THRESHOLDS.MIN_VOTES_FOR_STATUS) {
        if (reportRate >= THRESHOLDS.HIGH_REPORT_RATE) {
          status = "needs_review";
        } else if (totalVotes >= THRESHOLDS.HIGH_ACTIVITY_VOTES && avgRating !== null && avgRating < THRESHOLDS.LOW_AVG_RATING) {
          status = "high_activity_low_quality";
        } else if (totalVotes <= THRESHOLDS.LOW_ACTIVITY_VOTES && avgRating !== null && avgRating >= THRESHOLDS.HIGH_AVG_RATING) {
          status = "promising_underexposed";
        }
      }

      return {
        id: flavor.id,
        slug: flavor.slug,
        description: flavor.description,
        totalCaptions,
        totalVotes,
        totalUpvotes,
        totalDownvotes,
        avgRating,
        votesPerCaption,
        confidence,
        totalReports,
        reportRate,
        status,
      };
    });

    // Filter: only show flavors with at least 1 caption OR 1 vote (unless showAll)
    const filteredData = showAll
      ? flavorPerformance
      : flavorPerformance.filter((f) => f.totalCaptions > 0 || f.totalVotes > 0);

    // Check if any flavor has meaningful data
    const hasAnyMeaningfulData = flavorPerformance.some(
      (f) => f.totalVotes >= THRESHOLDS.MIN_VOTES_FOR_METRICS
    );

    return NextResponse.json({
      data: filteredData,
      hasAnyData: filteredData.length > 0,
      hasAnyMeaningfulData,
      thresholds: THRESHOLDS,
    });
  } catch (error) {
    console.error("Error fetching humor flavor performance:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
