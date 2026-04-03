import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET all LLM prompt chains with pagination
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const captionRequestId = searchParams.get("caption_request_id");

  const adminClient = createAdminClient();

  try {
    let query = adminClient
      .from("llm_prompt_chains")
      .select(`
        *,
        caption_requests (
          id,
          profile_id,
          image_id,
          created_datetime_utc
        )
      `)
      .order("created_datetime_utc", { ascending: false })
      .range(offset, offset + limit - 1);

    if (captionRequestId) {
      query = query.eq("caption_request_id", parseInt(captionRequestId, 10));
    }

    const { data: chains, error } = await query;

    if (error) throw error;

    // Fetch related llm_model_responses for each chain
    const chainIds = chains?.map(c => c.id) || [];
    let responsesMap: Record<number, Array<{
      id: string;
      llm_model_response: string | null;
      processing_time_seconds: number;
      llm_temperature: number | null;
      llm_system_prompt: string;
      llm_user_prompt: string;
      llm_models: { id: number; name: string; llm_providers: { id: number; name: string } | null } | null;
      humor_flavors: { id: number; slug: string; description: string | null } | null;
    }>> = {};

    if (chainIds.length > 0) {
      const { data: responses } = await adminClient
        .from("llm_model_responses")
        .select(`
          id,
          llm_model_response,
          processing_time_seconds,
          llm_temperature,
          llm_system_prompt,
          llm_user_prompt,
          llm_prompt_chain_id,
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
        `)
        .in("llm_prompt_chain_id", chainIds);

      // Group responses by chain ID
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (responses || []).forEach((resp: any) => {
        const chainId = resp.llm_prompt_chain_id;
        if (!responsesMap[chainId]) {
          responsesMap[chainId] = [];
        }
        responsesMap[chainId].push(resp);
      });
    }

    // Attach responses to chains
    const chainsWithResponses = chains?.map(chain => ({
      ...chain,
      llm_model_responses: responsesMap[chain.id] || [],
    })) || [];

    const hasMore = (chains?.length || 0) === limit;

    return NextResponse.json({ chains: chainsWithResponses, hasMore });
  } catch (error) {
    console.error("Error fetching LLM prompt chains:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch LLM prompt chains" },
      { status: 500 }
    );
  }
}
