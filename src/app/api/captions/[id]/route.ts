import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteCaption } from "@/lib/captions/deletionCascade";
import { resolveDisplayNames } from "@/lib/utils/nameResolution";
import type { Database } from "@/lib/supabase/database.types";

// GET single caption by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: captionId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();

  try {
    interface CaptionRow {
      id: string;
      content: string | null;
      profile_id: string;
      created_datetime_utc: string;
      modified_datetime_utc: string | null;
      is_public: boolean;
      is_featured: boolean;
      image_id: string;
      humor_flavor_id: number | null;
      caption_request_id: number | null;
      like_count: number;
      llm_prompt_chain_id: number | null;
      images: { id: string; url: string | null; image_description: string | null } | null;
      humor_flavors: { id: number; slug: string; description: string | null } | null;
      llm_prompt_chains: { llm_model_responses: { llm_model_response: string | null }[] } | null;
    }

    const { data: caption, error } = await adminClient
      .from("captions")
      .select(`
        *,
        images (
          id,
          url,
          image_description
        ),
        humor_flavors (
          id,
          slug,
          description
        ),
        llm_prompt_chains (
          llm_model_responses (
            llm_model_response
          )
        )
      `)
      .eq("id", captionId)
      .single() as { data: CaptionRow | null; error: Error & { code?: string } | null };

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Caption not found" }, { status: 404 });
      }
      throw error;
    }

    if (!caption) {
      return NextResponse.json({ error: "Caption not found" }, { status: 404 });
    }

    // Get vote counts for this caption
    const { data: votes } = await adminClient
      .from("caption_votes")
      .select("vote_value")
      .eq("caption_id", captionId) as { data: { vote_value: number }[] | null };

    let upvotes = 0;
    let downvotes = 0;
    votes?.forEach(vote => {
      if (vote.vote_value > 0) upvotes++;
      else if (vote.vote_value < 0) downvotes++;
    });

    // Resolve creator name
    const creatorNames = await resolveDisplayNames(adminClient, [caption.profile_id]);

    return NextResponse.json({
      caption: {
        ...caption,
        creatorName: creatorNames.get(caption.profile_id) || "Anonymous",
        llmResponse: caption.llm_prompt_chains?.llm_model_responses?.[0]?.llm_model_response || null,
        upvotes,
        downvotes,
      },
    });
  } catch (error) {
    console.error("Error fetching caption:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch caption" },
      { status: 500 }
    );
  }
}

// PUT - Update caption
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: captionId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      content,
      is_public,
      is_featured,
      humor_flavor_id,
    } = body;

    const adminClient = createAdminClient();

    const updateData: Database["public"]["Tables"]["captions"]["Update"] = {
      modified_datetime_utc: new Date().toISOString(),
    };

    if (content !== undefined) {
      updateData.content = content;
    }
    if (typeof is_public === "boolean") {
      updateData.is_public = is_public;
    }
    if (typeof is_featured === "boolean") {
      updateData.is_featured = is_featured;
    }
    if (humor_flavor_id !== undefined) {
      updateData.humor_flavor_id = humor_flavor_id || null;
    }

    const { data: updatedCaption, error } = await (adminClient
      .from("captions") as any)
      .update(updateData as any)
      .eq("id", captionId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Caption not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ caption: updatedCaption });
  } catch (error) {
    console.error("Error updating caption:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update caption" },
      { status: 500 }
    );
  }
}

// DELETE - Delete caption and all related data
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: captionId } = await params;

  // Verify the requesting user is authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use admin client to bypass RLS for deletion
  const adminClient = createAdminClient();

  const { error } = await deleteCaption(adminClient, captionId);

  if (error) {
    console.error("Error deleting caption:", error);
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
