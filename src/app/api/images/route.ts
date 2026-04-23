import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user;
  const accessToken = session.access_token;

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
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/heic"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported image type. Supported: JPEG, PNG, WebP, GIF, HEIC" }, { status: 400 });
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
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contentType: file.type,
      }),
    });

    if (!presignedResponse.ok) {
      const errorData = await presignedResponse.json().catch(() => ({}));
      console.error("Failed to get presigned URL:", errorData);
      return NextResponse.json({ error: "Failed to get upload URL" }, { status: 500 });
    }

    const presignedData = await presignedResponse.json();
    const { presignedUrl, cdnUrl } = presignedData;

    if (!presignedUrl) {
      return NextResponse.json({ error: "Invalid presigned URL response" }, { status: 500 });
    }

    // Step 2: Upload image to presigned URL
    const fileBuffer = await file.arrayBuffer();
    const uploadResponse = await fetch(presignedUrl, {
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

    // Step 3: Register the image with the pipeline to get final CDN URL
    const registerResponse = await fetch(`${PIPELINE_API_URL}/pipeline/upload-image-from-url`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrl: cdnUrl,
        isCommonUse: isCommonUse,
      }),
    });

    if (!registerResponse.ok) {
      const errorData = await registerResponse.json().catch(() => ({}));
      console.error("Failed to register image with pipeline:", errorData);
      return NextResponse.json({ error: "Failed to register image" }, { status: 500 });
    }

    const registerData = await registerResponse.json();
    const pipelineImageId = registerData.imageId;

    // The pipeline already inserted the image record into the database
    // We just need to update it with additional fields (is_public, additional_context, image_description)
    const adminClient = createAdminClient();

    const { data: updatedImage, error: updateError } = await (adminClient
      .from("images") as any)
      .update({
        is_public: isPublic,
        additional_context: additionalContext || null,
        image_description: imageDescription || null,
        modified_by_user_id: user.id,
      })
      .eq("id", pipelineImageId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ image: updatedImage }, { status: 201 });
  } catch (error) {
    console.error("Error creating image:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create image" },
      { status: 500 }
    );
  }
}
