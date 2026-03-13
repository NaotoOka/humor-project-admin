import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET all caption examples with pagination
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  const adminClient = createAdminClient();

  try {
    const { data: examples, error } = await adminClient
      .from("caption_examples")
      .select(`
        *,
        images (
          id,
          url,
          image_description
        )
      `)
      .order("priority", { ascending: true })
      .order("created_datetime_utc", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const hasMore = (examples?.length || 0) === limit;

    return NextResponse.json({ examples: examples || [], hasMore });
  } catch (error) {
    console.error("Error fetching caption examples:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch caption examples" },
      { status: 500 }
    );
  }
}

// POST - Create new caption example
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { image_description, caption, explanation, priority, image_id } = body;

    if (!image_description || !caption || !explanation) {
      return NextResponse.json(
        { error: "image_description, caption, and explanation are required" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newExample, error } = await (adminClient as any)
      .from("caption_examples")
      .insert({
        image_description,
        caption,
        explanation,
        priority: priority ?? 0,
        image_id: image_id || null,
      })
      .select(`
        *,
        images (
          id,
          url,
          image_description
        )
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ example: newExample }, { status: 201 });
  } catch (error) {
    console.error("Error creating caption example:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create caption example" },
      { status: 500 }
    );
  }
}
