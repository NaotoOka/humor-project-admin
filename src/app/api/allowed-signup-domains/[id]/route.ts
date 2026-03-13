import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

// GET single allowed signup domain by ID
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
    const { data: domain, error } = await adminClient
      .from("allowed_signup_domains")
      .select("*")
      .eq("id", parseInt(id, 10))
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Domain not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ domain });
  } catch (error) {
    console.error("Error fetching allowed signup domain:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch allowed signup domain" },
      { status: 500 }
    );
  }
}

// PUT - Update allowed signup domain
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
    const { apex_domain } = body;

    if (!apex_domain) {
      return NextResponse.json(
        { error: "apex_domain is required" },
        { status: 400 }
      );
    }

    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(apex_domain) && !/^[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/.test(apex_domain)) {
      return NextResponse.json(
        { error: "Invalid domain format" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    const updatePayload: Database["public"]["Tables"]["allowed_signup_domains"]["Update"] = {
      apex_domain: apex_domain.toLowerCase(),
    };

    const { data: updatedDomain, error } = await (adminClient
      .from("allowed_signup_domains" as any) as any)
      .update(updatePayload as any)
      .eq("id", parseInt(id, 10))
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Domain not found" }, { status: 404 });
      }
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Domain already exists" },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ domain: updatedDomain });
  } catch (error) {
    console.error("Error updating allowed signup domain:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update allowed signup domain" },
      { status: 500 }
    );
  }
}

// DELETE - Delete allowed signup domain
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
      .from("allowed_signup_domains")
      .delete()
      .eq("id", parseInt(id, 10));

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Domain not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting allowed signup domain:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete allowed signup domain" },
      { status: 500 }
    );
  }
}
