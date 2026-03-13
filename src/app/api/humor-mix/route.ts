import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface HumorMixEntry {
  id: number;
  created_datetime_utc: string;
  humor_flavor_id: number;
  caption_count: number;
  humor_flavors: {
    id: number;
    slug: string;
    description: string | null;
  } | null;
}

// GET all humor mix entries
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();

  try {
    const { data: mix, error } = await adminClient
      .from("humor_flavor_mix")
      .select(`
        id,
        created_datetime_utc,
        humor_flavor_id,
        caption_count,
        humor_flavors (
          id,
          slug,
          description
        )
      `)
      .order("humor_flavor_id", { ascending: true }) as { data: HumorMixEntry[] | null; error: Error | null };

    if (error) throw error;

    // Calculate total caption count for percentage display
    const totalCaptionCount = (mix || []).reduce((sum, m) => sum + m.caption_count, 0);

    return NextResponse.json({
      mix: mix || [],
      totalCaptionCount
    });
  } catch (error) {
    console.error("Error fetching humor mix:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch humor mix" },
      { status: 500 }
    );
  }
}

// PUT - Update humor mix entry (caption_count)
export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, caption_count } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing mix entry ID" }, { status: 400 });
    }

    if (typeof caption_count !== "number" || caption_count < 0) {
      return NextResponse.json({ error: "Invalid caption_count value" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // First update the caption_count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (adminClient as any)
      .from("humor_flavor_mix")
      .update({ caption_count })
      .eq("id", id);

    if (updateError) {
      if ((updateError as { code?: string }).code === "PGRST116") {
        return NextResponse.json({ error: "Mix entry not found" }, { status: 404 });
      }
      throw updateError;
    }

    // Then fetch the updated entry with relations
    const { data: updatedMix, error } = await adminClient
      .from("humor_flavor_mix")
      .select(`
        id,
        created_datetime_utc,
        humor_flavor_id,
        caption_count,
        humor_flavors (
          id,
          slug,
          description
        )
      `)
      .eq("id", id)
      .single() as { data: HumorMixEntry | null; error: Error | null };

    if (error) throw error;

    return NextResponse.json({ mix: updatedMix });
  } catch (error) {
    console.error("Error updating humor mix:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update humor mix" },
      { status: 500 }
    );
  }
}
