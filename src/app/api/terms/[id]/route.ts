import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET single term by ID
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
    const { data: term, error } = await adminClient
      .from("terms")
      .select(`
        *,
        term_types (
          id,
          name
        )
      `)
      .eq("id", parseInt(id, 10))
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Term not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ term });
  } catch (error) {
    console.error("Error fetching term:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch term" },
      { status: 500 }
    );
  }
}

// PUT - Update term
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { term, definition, example, priority, term_type_id } = body;

    const adminClient = createAdminClient();

    const updateData: Record<string, unknown> = {
      modified_datetime_utc: new Date().toISOString(),
    };

    if (term !== undefined) {
      updateData.term = term;
    }
    if (definition !== undefined) {
      updateData.definition = definition;
    }
    if (example !== undefined) {
      updateData.example = example;
    }
    if (priority !== undefined) {
      updateData.priority = priority;
    }
    if (term_type_id !== undefined) {
      updateData.term_type_id = term_type_id || null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updatedTerm, error } = await (adminClient as any)
      .from("terms")
      .update(updateData)
      .eq("id", parseInt(id, 10))
      .select(`
        *,
        term_types (
          id,
          name
        )
      `)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Term not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ term: updatedTerm });
  } catch (error) {
    console.error("Error updating term:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update term" },
      { status: 500 }
    );
  }
}

// DELETE - Delete term
export async function DELETE(
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
    const { error } = await adminClient
      .from("terms")
      .delete()
      .eq("id", parseInt(id, 10));

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Term not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting term:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete term" },
      { status: 500 }
    );
  }
}
