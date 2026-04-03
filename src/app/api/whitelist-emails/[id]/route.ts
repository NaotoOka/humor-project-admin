import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET single whitelist email by ID
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
    const { data: email, error } = await adminClient
      .from("whitelist_email_addresses")
      .select("*")
      .eq("id", parseInt(id, 10))
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Whitelist email not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ email });
  } catch (error) {
    console.error("Error fetching whitelist email:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch whitelist email" },
      { status: 500 }
    );
  }
}

// PUT - Update whitelist email
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
    const { email_address } = body;

    if (!email_address) {
      return NextResponse.json(
        { error: "email_address is required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email_address)) {
      return NextResponse.json(
        { error: "Invalid email address format" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Check if email already exists (excluding current record)
    const { data: existing } = await adminClient
      .from("whitelist_email_addresses")
      .select("id")
      .eq("email_address", email_address.toLowerCase().trim())
      .neq("id", parseInt(id, 10))
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "This email address is already whitelisted" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updatedEmail, error } = await (adminClient as any)
      .from("whitelist_email_addresses")
      .update({
        email_address: email_address.toLowerCase().trim(),
        modified_datetime_utc: new Date().toISOString(),
      })
      .eq("id", parseInt(id, 10))
      .select("*")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Whitelist email not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ email: updatedEmail });
  } catch (error) {
    console.error("Error updating whitelist email:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update whitelist email" },
      { status: 500 }
    );
  }
}

// DELETE - Delete whitelist email
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
      .from("whitelist_email_addresses")
      .delete()
      .eq("id", parseInt(id, 10));

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Whitelist email not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting whitelist email:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete whitelist email" },
      { status: 500 }
    );
  }
}
