import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET all whitelist emails with pagination
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
    const { data: emails, error } = await adminClient
      .from("whitelist_email_addresses")
      .select("*")
      .order("email_address", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const hasMore = (emails?.length || 0) === limit;

    return NextResponse.json({ emails: emails || [], hasMore });
  } catch (error) {
    console.error("Error fetching whitelist emails:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch whitelist emails" },
      { status: 500 }
    );
  }
}

// POST - Create new whitelist email
export async function POST(request: NextRequest) {
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

    // Check if email already exists
    const { data: existing } = await adminClient
      .from("whitelist_email_addresses")
      .select("id")
      .eq("email_address", email_address.toLowerCase().trim())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "This email address is already whitelisted" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newEmail, error } = await (adminClient as any)
      .from("whitelist_email_addresses")
      .insert({
        email_address: email_address.toLowerCase().trim(),
      })
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ email: newEmail }, { status: 201 });
  } catch (error) {
    console.error("Error creating whitelist email:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create whitelist email" },
      { status: 500 }
    );
  }
}
