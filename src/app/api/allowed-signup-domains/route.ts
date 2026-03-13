import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

// GET all allowed signup domains with pagination
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
    const { data: domains, error } = await adminClient
      .from("allowed_signup_domains")
      .select("*")
      .order("apex_domain", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const hasMore = (domains?.length || 0) === limit;

    return NextResponse.json({ domains: domains || [], hasMore });
  } catch (error) {
    console.error("Error fetching allowed signup domains:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch allowed signup domains" },
      { status: 500 }
    );
  }
}

// POST - Create new allowed signup domain
export async function POST(request: NextRequest) {
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

    const insertPayload: Database["public"]["Tables"]["allowed_signup_domains"]["Insert"] = {
      apex_domain: apex_domain.toLowerCase(),
    };

    const { data: newDomain, error } = await adminClient
      .from("allowed_signup_domains")
      .insert(insertPayload as any)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Domain already exists" },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ domain: newDomain }, { status: 201 });
  } catch (error) {
    console.error("Error creating allowed signup domain:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create allowed signup domain" },
      { status: 500 }
    );
  }
}
