import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET all humor flavor steps (optionally filtered by flavor_id)
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const flavorId = searchParams.get("flavor_id");

  const adminClient = createAdminClient();

  try {
    let query = adminClient
      .from("humor_flavor_steps")
      .select(`
        id,
        created_datetime_utc,
        humor_flavor_id,
        llm_temperature,
        order_by,
        description,
        llm_system_prompt,
        llm_user_prompt,
        humor_flavors (
          id,
          slug,
          description
        ),
        llm_models (
          id,
          name,
          provider_model_id,
          is_temperature_supported,
          llm_providers (
            id,
            name
          )
        ),
        humor_flavor_step_types (
          id,
          slug,
          description
        ),
        llm_input_types (
          id,
          slug,
          description
        ),
        llm_output_types (
          id,
          slug,
          description
        )
      `)
      .order("humor_flavor_id", { ascending: true })
      .order("order_by", { ascending: true });

    if (flavorId) {
      query = query.eq("humor_flavor_id", parseInt(flavorId, 10));
    }

    const { data: steps, error } = await query;

    if (error) throw error;

    return NextResponse.json({ steps: steps || [] });
  } catch (error) {
    console.error("Error fetching humor flavor steps:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch humor flavor steps" },
      { status: 500 }
    );
  }
}
