import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET all LLM providers with pagination
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
    const { data: providers, error } = await adminClient
      .from("llm_providers")
      .select("*")
      .order("name", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const hasMore = (providers?.length || 0) === limit;

    return NextResponse.json({ providers: providers || [], hasMore });
  } catch (error) {
    console.error("Error fetching LLM providers:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch LLM providers" },
      { status: 500 }
    );
  }
}

// POST - Create new LLM provider
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newProvider, error } = await (adminClient as any)
      .from("llm_providers")
      .insert({ name })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ provider: newProvider }, { status: 201 });
  } catch (error) {
    console.error("Error creating LLM provider:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create LLM provider" },
      { status: 500 }
    );
  }
}
