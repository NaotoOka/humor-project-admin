import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveDisplayNames } from "@/lib/utils/nameResolution";

// GET single caption request by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();

  try {
    interface CaptionRequestRow {
      id: number;
      created_datetime_utc: string;
      profile_id: string;
      image_id: string;
      images: { id: string; url: string | null; image_description: string | null } | null;
    }

    const { data: captionRequest, error } = await adminClient
      .from("caption_requests")
      .select(`
        *,
        images (
          id,
          url,
          image_description
        )
      `)
      .eq("id", parseInt(id, 10))
      .single() as { data: CaptionRequestRow | null; error: Error & { code?: string } | null };

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Caption request not found" }, { status: 404 });
      }
      throw error;
    }

    if (!captionRequest) {
      return NextResponse.json({ error: "Caption request not found" }, { status: 404 });
    }

    // Resolve profile name
    const profileNames = await resolveDisplayNames(adminClient, [captionRequest.profile_id]);

    return NextResponse.json({
      request: {
        ...captionRequest,
        requesterName: profileNames.get(captionRequest.profile_id) || "Unknown",
      },
    });
  } catch (error) {
    console.error("Error fetching caption request:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch caption request" },
      { status: 500 }
    );
  }
}
