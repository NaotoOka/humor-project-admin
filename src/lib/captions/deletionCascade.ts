import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type SupabaseClientType = SupabaseClient<Database>;

/**
 * Tables that have foreign key relationships to captions.
 * Order matters - delete from these tables before deleting the caption.
 */
const CAPTION_RELATED_TABLES = [
  "caption_likes",
  "caption_saved",
  "caption_votes",
  "screenshots",
  "shares",
  "reported_captions",
  "study_caption_mappings",
] as const;

/**
 * Tables that have foreign key relationships to images.
 * Order matters - delete from these tables before deleting the image.
 */
const IMAGE_RELATED_TABLES = [
  "reported_images",
  "study_image_set_image_mappings",
  "common_use_category_image_mappings",
  "caption_examples",
] as const;

/**
 * Deletes all related data for a single caption.
 * This handles the cascade deletion to respect foreign key constraints.
 */
export async function deleteCaptionRelatedData(
  client: SupabaseClientType,
  captionId: string
): Promise<void> {
  for (const table of CAPTION_RELATED_TABLES) {
    await client.from(table).delete().eq("caption_id", captionId);
  }
}

/**
 * Deletes all related data for multiple captions.
 * More efficient than calling deleteCaptionRelatedData multiple times.
 */
export async function deleteCaptionsRelatedData(
  client: SupabaseClientType,
  captionIds: string[]
): Promise<void> {
  if (captionIds.length === 0) return;

  for (const table of CAPTION_RELATED_TABLES) {
    await client.from(table).delete().in("caption_id", captionIds);
  }
}

/**
 * Deletes a single caption and all its related data.
 * Returns an error message if deletion fails, null on success.
 */
export async function deleteCaption(
  client: SupabaseClientType,
  captionId: string
): Promise<{ error: string | null }> {
  try {
    // Delete related data first
    await deleteCaptionRelatedData(client, captionId);

    // Delete the caption
    const { error } = await client
      .from("captions")
      .delete()
      .eq("id", captionId);

    if (error) {
      return { error: `Failed to delete caption: ${error.message}` };
    }

    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to delete caption",
    };
  }
}

/**
 * Deletes multiple captions and all their related data.
 * Returns an error message if deletion fails, null on success.
 */
export async function deleteCaptions(
  client: SupabaseClientType,
  captionIds: string[]
): Promise<{ error: string | null }> {
  if (captionIds.length === 0) return { error: null };

  try {
    // Delete related data first
    await deleteCaptionsRelatedData(client, captionIds);

    // Delete the captions
    const { error } = await client
      .from("captions")
      .delete()
      .in("id", captionIds);

    if (error) {
      return { error: `Failed to delete captions: ${error.message}` };
    }

    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to delete captions",
    };
  }
}

/**
 * Deletes all related data for an image (not including captions).
 */
export async function deleteImageRelatedData(
  client: SupabaseClientType,
  imageId: string
): Promise<void> {
  for (const table of IMAGE_RELATED_TABLES) {
    await client.from(table).delete().eq("image_id", imageId);
  }
}

/**
 * Deletes an image and all its related data, including all captions.
 * Returns an error message if deletion fails, null on success.
 */
export async function deleteImageWithCaptions(
  client: SupabaseClientType,
  imageId: string,
  captionIds: string[]
): Promise<{ error: string | null }> {
  try {
    // Delete all captions and their related data
    if (captionIds.length > 0) {
      const { error: captionsError } = await deleteCaptions(client, captionIds);
      if (captionsError) {
        return { error: captionsError };
      }
    }

    // Delete image-related data
    await deleteImageRelatedData(client, imageId);

    // Delete the image
    const { error } = await client
      .from("images")
      .delete()
      .eq("id", imageId);

    if (error) {
      return { error: `Failed to delete image: ${error.message}` };
    }

    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to delete image",
    };
  }
}
