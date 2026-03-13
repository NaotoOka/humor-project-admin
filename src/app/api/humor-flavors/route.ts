import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface HumorFlavorStep {
  id: number;
  order_by: number;
  description: string | null;
  llm_temperature: number | null;
  llm_system_prompt: string | null;
  llm_user_prompt: string | null;
  llm_models: {
    id: number;
    name: string;
    provider_model_id: string;
    llm_providers: { id: number; name: string } | null;
  } | null;
  humor_flavor_step_types: { id: number; slug: string; description: string } | null;
  llm_input_types: { id: number; slug: string; description: string } | null;
  llm_output_types: { id: number; slug: string; description: string } | null;
}

interface HumorFlavor {
  id: number;
  created_datetime_utc: string;
  description: string | null;
  slug: string;
  humor_flavor_steps: HumorFlavorStep[];
}

// GET all humor flavors
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();

  try {
    // Fetch humor flavors with their related data
    const { data: flavors, error } = await adminClient
      .from("humor_flavors")
      .select(`
        id,
        created_datetime_utc,
        description,
        slug,
        humor_flavor_steps (
          id,
          order_by,
          description,
          llm_temperature,
          llm_system_prompt,
          llm_user_prompt,
          llm_models (
            id,
            name,
            provider_model_id,
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
        )
      `)
      .order("slug", { ascending: true }) as { data: HumorFlavor[] | null; error: Error | null };

    if (error) throw error;

    // Sort steps by order_by within each flavor
    const flavorsWithSortedSteps = (flavors || []).map(flavor => ({
      ...flavor,
      humor_flavor_steps: [...flavor.humor_flavor_steps].sort((a, b) => a.order_by - b.order_by),
    }));

    return NextResponse.json({ flavors: flavorsWithSortedSteps });
  } catch (error) {
    console.error("Error fetching humor flavors:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch humor flavors" },
      { status: 500 }
    );
  }
}
