import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET single LLM provider by ID
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
    const { data: provider, error } = await adminClient
      .from("llm_providers")
      .select("*")
      .eq("id", parseInt(id, 10))
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "LLM provider not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ provider });
  } catch (error) {
    console.error("Error fetching LLM provider:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch LLM provider" },
      { status: 500 }
    );
  }
}

// PUT - Update LLM provider
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
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updatedProvider, error } = await (adminClient as any)
      .from("llm_providers")
      .update({ name })
      .eq("id", parseInt(id, 10))
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "LLM provider not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ provider: updatedProvider });
  } catch (error) {
    console.error("Error updating LLM provider:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update LLM provider" },
      { status: 500 }
    );
  }
}

// DELETE - Delete LLM provider
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
      .from("llm_providers")
      .delete()
      .eq("id", parseInt(id, 10));

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "LLM provider not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting LLM provider:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete LLM provider" },
      { status: 500 }
    );
  }
}
