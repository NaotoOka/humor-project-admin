import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveDisplayNames } from "@/lib/utils/nameResolution";

// GET single LLM model response by ID
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
    interface LLMResponseRow {
      id: string;
      created_datetime_utc: string;
      llm_model_response: string | null;
      processing_time_seconds: number;
      llm_model_id: number;
      profile_id: string;
      caption_request_id: number;
      llm_system_prompt: string;
      llm_user_prompt: string;
      llm_temperature: number | null;
      humor_flavor_id: number;
      llm_prompt_chain_id: number | null;
      humor_flavor_step_id: number | null;
      llm_models: { id: number; name: string; provider_model_id: string; llm_providers: { id: number; name: string } | null } | null;
      humor_flavors: { id: number; slug: string; description: string | null } | null;
      humor_flavor_steps: { id: number; description: string | null; order_by: number } | null;
    }

    const { data: llmResponse, error } = await adminClient
      .from("llm_model_responses")
      .select(`
        *,
        llm_models (
          id,
          name,
          provider_model_id,
          llm_providers (
            id,
            name
          )
        ),
        humor_flavors (
          id,
          slug,
          description
        ),
        humor_flavor_steps (
          id,
          description,
          order_by
        )
      `)
      .eq("id", id)
      .single() as { data: LLMResponseRow | null; error: Error & { code?: string } | null };

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "LLM response not found" }, { status: 404 });
      }
      throw error;
    }

    if (!llmResponse) {
      return NextResponse.json({ error: "LLM response not found" }, { status: 404 });
    }

    // Resolve profile name
    const profileNames = await resolveDisplayNames(adminClient, [llmResponse.profile_id]);

    return NextResponse.json({
      response: {
        ...llmResponse,
        requesterName: profileNames.get(llmResponse.profile_id) || "Unknown",
      },
    });
  } catch (error) {
    console.error("Error fetching LLM response:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch LLM response" },
      { status: 500 }
    );
  }
}
