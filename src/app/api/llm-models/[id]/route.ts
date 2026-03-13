import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET single LLM model by ID
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
    const { data: model, error } = await adminClient
      .from("llm_models")
      .select(`
        *,
        llm_providers (
          id,
          name
        )
      `)
      .eq("id", parseInt(id, 10))
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "LLM model not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ model });
  } catch (error) {
    console.error("Error fetching LLM model:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch LLM model" },
      { status: 500 }
    );
  }
}

// PUT - Update LLM model
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
    const { name, llm_provider_id, provider_model_id, is_temperature_supported } = body;

    const adminClient = createAdminClient();

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) {
      updateData.name = name;
    }
    if (llm_provider_id !== undefined) {
      updateData.llm_provider_id = llm_provider_id;
    }
    if (provider_model_id !== undefined) {
      updateData.provider_model_id = provider_model_id;
    }
    if (is_temperature_supported !== undefined) {
      updateData.is_temperature_supported = is_temperature_supported;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updatedModel, error } = await (adminClient as any)
      .from("llm_models")
      .update(updateData)
      .eq("id", parseInt(id, 10))
      .select(`
        *,
        llm_providers (
          id,
          name
        )
      `)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "LLM model not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ model: updatedModel });
  } catch (error) {
    console.error("Error updating LLM model:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update LLM model" },
      { status: 500 }
    );
  }
}

// DELETE - Delete LLM model
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
      .from("llm_models")
      .delete()
      .eq("id", parseInt(id, 10));

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "LLM model not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting LLM model:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete LLM model" },
      { status: 500 }
    );
  }
}
