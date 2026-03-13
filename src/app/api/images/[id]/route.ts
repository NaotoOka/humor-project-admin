import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteImageWithCaptions } from "@/lib/captions/deletionCascade";
import type { Database } from "@/lib/supabase/database.types";

// GET single image by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: imageId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();

  try {
    const { data: image, error } = await adminClient
      .from("images")
      .select("*")
      .eq("id", imageId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Image not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ image });
  } catch (error) {
    console.error("Error fetching image:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch image" },
      { status: 500 }
    );
  }
}

// PUT - Update image metadata
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: imageId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      is_common_use,
      is_public,
      additional_context,
      image_description,
    } = body;

    const adminClient = createAdminClient();

    // Build update object with only provided fields
    const updateData: Database["public"]["Tables"]["images"]["Update"] = {
      modified_datetime_utc: new Date().toISOString(),
    };

    if (typeof is_common_use === "boolean") {
      updateData.is_common_use = is_common_use;
    }
    if (typeof is_public === "boolean") {
      updateData.is_public = is_public;
    }
    if (additional_context !== undefined) {
      updateData.additional_context = additional_context;
    }
    if (image_description !== undefined) {
      updateData.image_description = image_description;
    }

    const { data: updatedImage, error } = await (adminClient
      .from("images" as any) as any)
      .update(updateData as any)
      .eq("id", imageId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Image not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ image: updatedImage });
  } catch (error) {
    console.error("Error updating image:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update image" },
      { status: 500 }
    );
  }
}

// DELETE - Delete image and all related data
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: imageId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();

  // Get all captions for this image first to handle cascade deletion
  const { data: captions } = await adminClient
    .from("captions")
    .select("id")
    .eq("image_id", imageId);

  const captionIds = captions?.map(c => (c as { id: string }).id) || [];

  const { error } = await deleteImageWithCaptions(adminClient, imageId, captionIds);

  if (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
