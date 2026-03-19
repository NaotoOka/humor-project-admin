import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteCaptions } from "@/lib/captions/deletionCascade";

// POST - Bulk delete captions
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { captionIds } = body;

    if (!Array.isArray(captionIds) || captionIds.length === 0) {
      return NextResponse.json(
        { error: "captionIds must be a non-empty array" },
        { status: 400 }
      );
    }

    if (captionIds.length > 100) {
      return NextResponse.json(
        { error: "Cannot delete more than 100 captions at once" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();
    const { error } = await deleteCaptions(adminClient, captionIds);

    if (error) {
      console.error("Error bulk deleting captions:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      deletedCount: captionIds.length
    });
  } catch (error) {
    console.error("Error in bulk delete:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete captions" },
      { status: 500 }
    );
  }
}
