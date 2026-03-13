import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET single caption example by ID
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
    const { data: example, error } = await adminClient
      .from("caption_examples")
      .select(`
        *,
        images (
          id,
          url,
          image_description
        )
      `)
      .eq("id", parseInt(id, 10))
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Caption example not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ example });
  } catch (error) {
    console.error("Error fetching caption example:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch caption example" },
      { status: 500 }
    );
  }
}

// PUT - Update caption example
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { image_description, caption, explanation, priority, image_id } = body;

    const adminClient = createAdminClient();

    const updateData: Record<string, unknown> = {
      modified_datetime_utc: new Date().toISOString(),
    };

    if (image_description !== undefined) {
      updateData.image_description = image_description;
    }
    if (caption !== undefined) {
      updateData.caption = caption;
    }
    if (explanation !== undefined) {
      updateData.explanation = explanation;
    }
    if (priority !== undefined) {
      updateData.priority = priority;
    }
    if (image_id !== undefined) {
      updateData.image_id = image_id || null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updatedExample, error } = await (adminClient as any)
      .from("caption_examples")
      .update(updateData)
      .eq("id", parseInt(id, 10))
      .select(`
        *,
        images (
          id,
          url,
          image_description
        )
      `)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Caption example not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ example: updatedExample });
  } catch (error) {
    console.error("Error updating caption example:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update caption example" },
      { status: 500 }
    );
  }
}

// DELETE - Delete caption example
export async function DELETE(
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
    const { error } = await adminClient
      .from("caption_examples")
      .delete()
      .eq("id", parseInt(id, 10));

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Caption example not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting caption example:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete caption example" },
      { status: 500 }
    );
  }
}
