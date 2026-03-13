import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET single LLM prompt chain by ID
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
    const { data: chain, error } = await adminClient
      .from("llm_prompt_chains")
      .select(`
        *,
        caption_requests (
          id,
          profile_id,
          image_id,
          created_datetime_utc
        ),
        llm_model_responses (
          id,
          llm_model_response,
          processing_time_seconds,
          llm_temperature,
          llm_system_prompt,
          llm_user_prompt,
          llm_models (
            id,
            name,
            llm_providers (
              id,
              name
            )
          ),
          humor_flavors (
            id,
            slug,
            description
          )
        )
      `)
      .eq("id", parseInt(id, 10))
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "LLM prompt chain not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ chain });
  } catch (error) {
    console.error("Error fetching LLM prompt chain:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch LLM prompt chain" },
      { status: 500 }
    );
  }
}
