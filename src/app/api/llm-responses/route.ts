import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveDisplayNames } from "@/lib/utils/nameResolution";

// GET all LLM model responses with pagination
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const promptChainId = searchParams.get("prompt_chain_id");
  const captionRequestId = searchParams.get("caption_request_id");
  const humorFlavorId = searchParams.get("humor_flavor_id");
  const modelId = searchParams.get("model_id");

  const adminClient = createAdminClient();

  try {
    let query = adminClient
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
      .order("created_datetime_utc", { ascending: false })
      .range(offset, offset + limit - 1);

    if (promptChainId) {
      query = query.eq("llm_prompt_chain_id", parseInt(promptChainId, 10));
    }
    if (captionRequestId) {
      query = query.eq("caption_request_id", parseInt(captionRequestId, 10));
    }
    if (humorFlavorId) {
      query = query.eq("humor_flavor_id", parseInt(humorFlavorId, 10));
    }
    if (modelId) {
      query = query.eq("llm_model_id", parseInt(modelId, 10));
    }

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

    const { data: responses, error } = await query as { data: LLMResponseRow[] | null; error: Error | null };

    if (error) throw error;

    const hasMore = (responses?.length || 0) === limit;

    // Resolve profile names
    const uniqueProfileIds = [...new Set(responses?.map(r => r.profile_id) || [])];
    const profileNames = await resolveDisplayNames(adminClient, uniqueProfileIds);

    const responsesWithNames = responses?.map(response => ({
      ...response,
      requesterName: profileNames.get(response.profile_id) || "Unknown",
    })) || [];

    return NextResponse.json({ responses: responsesWithNames, hasMore });
  } catch (error) {
    console.error("Error fetching LLM responses:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch LLM responses" },
      { status: 500 }
    );
  }
}
