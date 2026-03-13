import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET all LLM models with pagination
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const providerId = searchParams.get("provider_id");

  const adminClient = createAdminClient();

  try {
    let query = adminClient
      .from("llm_models")
      .select(`
        *,
        llm_providers (
          id,
          name
        )
      `)
      .order("name", { ascending: true })
      .range(offset, offset + limit - 1);

    if (providerId) {
      query = query.eq("llm_provider_id", parseInt(providerId, 10));
    }

    const { data: models, error } = await query;

    if (error) throw error;

    const hasMore = (models?.length || 0) === limit;

    return NextResponse.json({ models: models || [], hasMore });
  } catch (error) {
    console.error("Error fetching LLM models:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch LLM models" },
      { status: 500 }
    );
  }
}

// POST - Create new LLM model
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, llm_provider_id, provider_model_id, is_temperature_supported } = body;

    if (!name || !llm_provider_id || !provider_model_id) {
      return NextResponse.json(
        { error: "name, llm_provider_id, and provider_model_id are required" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newModel, error } = await (adminClient as any)
      .from("llm_models")
      .insert({
        name,
        llm_provider_id,
        provider_model_id,
        is_temperature_supported: is_temperature_supported ?? true,
      })
      .select(`
        *,
        llm_providers (
          id,
          name
        )
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ model: newModel }, { status: 201 });
  } catch (error) {
    console.error("Error creating LLM model:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create LLM model" },
      { status: 500 }
    );
  }
}
