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
      .order("created_datetime_utc", { ascending: false })
      .range(offset, offset + limit - 1);

    if (captionRequestId) {
      query = query.eq("caption_request_id", parseInt(captionRequestId, 10));
    }

    const { data: chains, error } = await query;

    if (error) throw error;

    const hasMore = (chains?.length || 0) === limit;

    return NextResponse.json({ chains: chains || [], hasMore });
  } catch (error) {
    console.error("Error fetching LLM prompt chains:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch LLM prompt chains" },
      { status: 500 }
    );
  }
}
