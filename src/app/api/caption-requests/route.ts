import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveDisplayNames } from "@/lib/utils/nameResolution";

// GET all caption requests with pagination
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const profileId = searchParams.get("profile_id");
  const imageId = searchParams.get("image_id");

  const adminClient = createAdminClient();

  try {
    let query = adminClient
      .from("caption_requests")
      .select(`
        *,
        images (
          id,
          url,
          image_description
        )
      `)
      .order("created_datetime_utc", { ascending: false })
      .range(offset, offset + limit - 1);

    if (profileId) {
      query = query.eq("profile_id", profileId);
    }
    if (imageId) {
      query = query.eq("image_id", imageId);
    }

    interface CaptionRequestRow {
      id: number;
      created_datetime_utc: string;
      profile_id: string;
      image_id: string;
      images: { id: string; url: string | null; image_description: string | null } | null;
    }

    const { data: requests, error } = await query as { data: CaptionRequestRow[] | null; error: Error | null };

    if (error) throw error;

    const hasMore = (requests?.length || 0) === limit;

    // Resolve profile names
    const uniqueProfileIds = [...new Set(requests?.map(r => r.profile_id) || [])];
    const profileNames = await resolveDisplayNames(adminClient, uniqueProfileIds);

    const requestsWithNames = requests?.map(request => ({
      ...request,
      requesterName: profileNames.get(request.profile_id) || "Unknown",
    })) || [];

    return NextResponse.json({ requests: requestsWithNames, hasMore });
  } catch (error) {
    console.error("Error fetching caption requests:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch caption requests" },
      { status: 500 }
    );
  }
}
