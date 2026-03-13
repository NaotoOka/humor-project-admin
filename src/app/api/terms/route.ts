import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET all terms with pagination
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const termTypeId = searchParams.get("term_type_id");

  const adminClient = createAdminClient();

  try {
    let query = adminClient
      .from("terms")
      .select(`
        *,
        term_types (
          id,
          name
        )
      `)
      .order("priority", { ascending: true })
      .order("term", { ascending: true })
      .range(offset, offset + limit - 1);

    if (termTypeId) {
      query = query.eq("term_type_id", parseInt(termTypeId, 10));
    }

    const { data: terms, error } = await query;

    if (error) throw error;

    const hasMore = (terms?.length || 0) === limit;

    return NextResponse.json({ terms: terms || [], hasMore });
  } catch (error) {
    console.error("Error fetching terms:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch terms" },
      { status: 500 }
    );
  }
}

// POST - Create new term
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { term, definition, example, priority, term_type_id } = body;

    if (!term || !definition || !example) {
      return NextResponse.json(
        { error: "term, definition, and example are required" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newTerm, error } = await (adminClient as any)
      .from("terms")
      .insert({
        term,
        definition,
        example,
        priority: priority ?? 0,
        term_type_id: term_type_id || null,
      })
      .select(`
        *,
        term_types (
          id,
          name
        )
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ term: newTerm }, { status: 201 });
  } catch (error) {
    console.error("Error creating term:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create term" },
      { status: 500 }
    );
  }
}
