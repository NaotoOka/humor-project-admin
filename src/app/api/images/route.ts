import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

const PIPELINE_API_URL = "https://api.almostcrackd.ai";

// GET all images with pagination
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const filter = searchParams.get("filter") || "all"; // "all", "common_use", "public", "private"

  const adminClient = createAdminClient();

  try {
    let query = adminClient
      .from("images")
      .select("*")
      .order("created_datetime_utc", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (filter === "common_use") {
      query = query.eq("is_common_use", true);
    } else if (filter === "public") {
      query = query.eq("is_public", true);
    } else if (filter === "private") {
      query = query.eq("is_public", false);
    }

    const { data: images, error } = await query;

    if (error) throw error;

    const hasMore = (images?.length || 0) === limit;

    return NextResponse.json({ images: images || [], hasMore });
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch images" },
      { status: 500 }
    );
  }
}

// POST - Upload new image via pipeline API
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const isCommonUse = formData.get("is_common_use") === "true";
    const isPublic = formData.get("is_public") === "true";
    const additionalContext = formData.get("additional_context") as string | null;
    const imageDescription = formData.get("image_description") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 });
    }

    // Step 1: Get presigned URL from pipeline API
    const presignedResponse = await fetch(`${PIPELINE_API_URL}/pipeline/generate-presigned-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filename: file.name,
        content_type: file.type,
      }),
    });

    if (!presignedResponse.ok) {
      const errorData = await presignedResponse.json().catch(() => ({}));
      console.error("Failed to get presigned URL:", errorData);
      return NextResponse.json({ error: "Failed to get upload URL" }, { status: 500 });
    }

    const presignedData = await presignedResponse.json();
    const { presigned_url, cdn_url } = presignedData;

    if (!presigned_url) {
      return NextResponse.json({ error: "Invalid presigned URL response" }, { status: 500 });
    }

    // Step 2: Upload image to presigned URL
    const fileBuffer = await file.arrayBuffer();
    const uploadResponse = await fetch(presigned_url, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: fileBuffer,
    });

    if (!uploadResponse.ok) {
      console.error("Failed to upload to presigned URL:", uploadResponse.status);
      return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
    }

    // Step 3: Register the image with the pipeline (if cdn_url not returned directly)
    let imageUrl = cdn_url;
    if (!imageUrl) {
      const registerResponse = await fetch(`${PIPELINE_API_URL}/pipeline/upload-image-from-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: presigned_url.split("?")[0], // URL without query params
        }),
      });

      if (!registerResponse.ok) {
        console.error("Failed to register image with pipeline");
        return NextResponse.json({ error: "Failed to register image" }, { status: 500 });
      }

      const registerData = await registerResponse.json();
      imageUrl = registerData.cdn_url || registerData.url;
    }

    if (!imageUrl) {
      return NextResponse.json({ error: "Failed to get CDN URL" }, { status: 500 });
    }

    // Step 4: Insert image record into Supabase
    const adminClient = createAdminClient();

    const insertPayload: Database["public"]["Tables"]["images"]["Insert"] = {
      url: imageUrl,
      is_common_use: isCommonUse,
      is_public: isPublic,
      profile_id: user.id,
      additional_context: additionalContext || null,
      image_description: imageDescription || null,
    };

    const { data: newImage, error: insertError } = await adminClient
      .from("images")
      .insert(insertPayload as any)
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({ image: newImage }, { status: 201 });
  } catch (error) {
    console.error("Error creating image:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create image" },
      { status: 500 }
    );
  }
}
