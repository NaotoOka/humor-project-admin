import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveDisplayNames } from "@/lib/utils/nameResolution";
import type { Database } from "@/lib/supabase/database.types";

export async function GET(request: NextRequest) {
  // Verify the requesting user is authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const type = searchParams.get("type") || "all"; // "all" or "rated"

  const adminClient = createAdminClient();

  try {
    interface CaptionRow {
      id: string;
      content: string | null;
      profile_id: string;
      created_datetime_utc: string;
      is_public: boolean;
      is_featured: boolean;
      image_id: string;
      humor_flavor_id: number | null;
      llm_prompt_chain_id: number | null;
      llm_prompt_chains: { llm_model_responses: { llm_model_response: string | null }[] } | null;
    }

    let captionsData: CaptionRow[] | null = null;
    let hasMore = false;

    if (type === "rated") {
      // For rated captions: get vote counts aggregated by caption_id, then fetch those captions
      // First, get all votes grouped by caption
      const { data: allVotes, error: votesError } = await adminClient
        .from("caption_votes")
        .select("caption_id, vote_value") as { data: { caption_id: string; vote_value: number }[] | null; error: Error | null };

      if (votesError) throw votesError;

      if (!allVotes || allVotes.length === 0) {
        return NextResponse.json({ captions: [], hasMore: false });
      }

      // Aggregate votes per caption
      const voteAggregation = new Map<string, { upvotes: number; downvotes: number; total: number }>();
      allVotes.forEach(vote => {
        const current = voteAggregation.get(vote.caption_id) || { upvotes: 0, downvotes: 0, total: 0 };
        if (vote.vote_value > 0) {
          current.upvotes++;
          current.total += vote.vote_value;
        } else if (vote.vote_value < 0) {
          current.downvotes++;
          current.total += vote.vote_value;
        }
        voteAggregation.set(vote.caption_id, current);
      });

      // Sort by total votes (upvotes - downvotes) descending, then paginate
      const sortedCaptionIds = [...voteAggregation.entries()]
        .sort((a, b) => (b[1].upvotes - b[1].downvotes) - (a[1].upvotes - a[1].downvotes))
        .map(([id]) => id);

      const paginatedIds = sortedCaptionIds.slice(offset, offset + limit);
      hasMore = sortedCaptionIds.length > offset + limit;

      if (paginatedIds.length === 0) {
        return NextResponse.json({ captions: [], hasMore: false });
      }

      // Fetch the captions for these IDs
      const { data, error: captionsError } = await adminClient
        .from("captions")
        .select("id, content, profile_id, created_datetime_utc, is_public, is_featured, image_id, humor_flavor_id, llm_prompt_chain_id, llm_prompt_chains(llm_model_responses(llm_model_response))")
        .in("id", paginatedIds) as { data: CaptionRow[] | null; error: Error | null };

      if (captionsError) throw captionsError;

      // Sort the results to match the vote-sorted order
      const captionMap = new Map(data?.map(c => [c.id, c]) || []);
      captionsData = paginatedIds.map(id => captionMap.get(id)).filter((c): c is CaptionRow => c !== undefined);

      // Fetch creator names
      const uniqueProfileIds = [...new Set(captionsData?.map(c => c.profile_id) || [])];
      const creatorNames = await resolveDisplayNames(adminClient, uniqueProfileIds);

      // Map captions with vote counts
      const captions = captionsData.map(caption => {
        const votes = voteAggregation.get(caption.id) || { upvotes: 0, downvotes: 0 };
        return {
          id: caption.id,
          content: caption.content,
          profile_id: caption.profile_id,
          created_datetime_utc: caption.created_datetime_utc,
          is_public: caption.is_public,
          is_featured: caption.is_featured,
          image_id: caption.image_id,
          humor_flavor_id: caption.humor_flavor_id,
          llm_prompt_chain_id: caption.llm_prompt_chain_id,
          creatorName: creatorNames.get(caption.profile_id) || "Anonymous",
          llmResponse: caption.llm_prompt_chains?.llm_model_responses?.[0]?.llm_model_response || null,
          upvotes: votes.upvotes,
          downvotes: votes.downvotes,
        };
      });

      return NextResponse.json({ captions, hasMore });
    }

    // For "all" type: standard pagination
    const { data, error: captionsError } = await adminClient
      .from("captions")
      .select("id, content, profile_id, created_datetime_utc, is_public, is_featured, image_id, humor_flavor_id, llm_prompt_chain_id, llm_prompt_chains(llm_model_responses(llm_model_response))")
      .order("created_datetime_utc", { ascending: false })
      .range(offset, offset + limit - 1) as { data: CaptionRow[] | null; error: Error | null };

    if (captionsError) throw captionsError;

    captionsData = data;
    hasMore = (captionsData?.length || 0) === limit;

    // Fetch creator names using shared utility
    const uniqueProfileIds = [...new Set(captionsData?.map(c => c.profile_id) || [])];
    const creatorNames = await resolveDisplayNames(adminClient, uniqueProfileIds);

    // Map captions with details (no vote counts for "all" type to keep it fast)
    const captions = captionsData?.map(caption => ({
      id: caption.id,
      content: caption.content,
      profile_id: caption.profile_id,
      created_datetime_utc: caption.created_datetime_utc,
      is_public: caption.is_public,
      is_featured: caption.is_featured,
      image_id: caption.image_id,
      humor_flavor_id: caption.humor_flavor_id,
      llm_prompt_chain_id: caption.llm_prompt_chain_id,
      creatorName: creatorNames.get(caption.profile_id) || "Anonymous",
      llmResponse: caption.llm_prompt_chains?.llm_model_responses?.[0]?.llm_model_response || null,
      upvotes: 0,
      downvotes: 0,
    })) || [];

    return NextResponse.json({ captions, hasMore });
  } catch (error) {
    console.error("Error fetching captions:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch captions" },
      { status: 500 }
    );
  }
}

// POST - Create new caption
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      content,
      image_id,
      is_public,
      is_featured,
      humor_flavor_id,
      caption_request_id,
      llm_prompt_chain_id,
    } = body;

    if (!image_id) {
      return NextResponse.json(
        { error: "image_id is required" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    const insertPayload: Database["public"]["Tables"]["captions"]["Insert"] = {
      content: content || null,
      image_id,
      profile_id: user.id,
      is_public: is_public ?? false,
      is_featured: is_featured ?? false,
      humor_flavor_id: humor_flavor_id || null,
      caption_request_id: caption_request_id || null,
      llm_prompt_chain_id: llm_prompt_chain_id || null,
    };

    const { data: newCaption, error } = await adminClient
      .from("captions")
      .insert(insertPayload as any)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ caption: newCaption }, { status: 201 });
  } catch (error) {
    console.error("Error creating caption:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create caption" },
      { status: 500 }
    );
  }
}
