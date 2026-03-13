"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  deleteCaptions,
  deleteImageWithCaptions,
} from "@/lib/captions/deletionCascade";
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
  ModalIcon,
  ModalError,
  ModalSpinner,
  DeleteIcon,
} from "@/components/Modal";
import type { Database } from "@/lib/supabase/database.types";

type Image = Database["public"]["Tables"]["images"]["Row"];
type Caption = Database["public"]["Tables"]["captions"]["Row"];

interface DeleteImageModalProps {
  image: Image;
  onClose: () => void;
  onDeleted: () => void;
  uploaderName?: string | null;
}

export function DeleteImageModal({
  image,
  onClose,
  onDeleted,
  uploaderName: initialUploaderName,
}: DeleteImageModalProps) {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [selectedCaptions, setSelectedCaptions] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteImage, setDeleteImage] = useState(true);
  const [uploaderName, setUploaderName] = useState<string | null>(
    initialUploaderName ?? null
  );

  // Fetch captions and uploader info
  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      // Fetch captions
      const { data: captionsData, error: captionsError } = await supabase
        .from("captions")
        .select("*")
        .eq("image_id", image.id)
        .order("created_datetime_utc", { ascending: false });

      if (captionsError) {
        setError(`Failed to load captions: ${captionsError.message}`);
      } else {
        setCaptions(captionsData || []);
        // Auto-select all captions since deleteImage starts as true
        if (captionsData) {
          setSelectedCaptions(new Set(captionsData.map((c: Caption) => c.id)));
        }
      }

      // Fetch uploader info via API (uses admin client server-side to get auth metadata)
      if (image.profile_id && !initialUploaderName) {
        try {
          const response = await fetch(`/api/users/${image.profile_id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.uploaderName) {
              setUploaderName(data.uploaderName);
            }
          }
        } catch (err) {
          console.error("Failed to fetch uploader info:", err);
        }
      }

      setLoading(false);
    }

    fetchData();
  }, [image.id, image.profile_id, initialUploaderName]);

  // When deleteImage is toggled, select/deselect all captions
  const handleDeleteImageToggle = (checked: boolean) => {
    setDeleteImage(checked);
    if (checked) {
      setSelectedCaptions(new Set(captions.map((c) => c.id)));
    } else {
      setSelectedCaptions(new Set());
    }
  };

  const toggleCaption = (captionId: string) => {
    setSelectedCaptions((prev) => {
      const next = new Set(prev);
      if (next.has(captionId)) {
        next.delete(captionId);
      } else {
        next.add(captionId);
      }
      return next;
    });
  };

  const selectAllCaptions = () => {
    setSelectedCaptions(new Set(captions.map((c) => c.id)));
  };

  const deselectAllCaptions = () => {
    setSelectedCaptions(new Set());
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    const supabase = createClient();

    try {
      if (deleteImage) {
        // Delete image and all its captions
        const allCaptionIds = captions.map((c) => c.id);
        const { error: deleteError } = await deleteImageWithCaptions(
          supabase,
          image.id,
          allCaptionIds
        );
        if (deleteError) {
          throw new Error(deleteError);
        }
      } else if (selectedCaptions.size > 0) {
        // Only delete selected captions
        const captionIds = Array.from(selectedCaptions);
        const { error: deleteError } = await deleteCaptions(
          supabase,
          captionIds
        );
        if (deleteError) {
          throw new Error(deleteError);
        }
      }

      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setDeleting(false);
    }
  };

  const hasSelection = deleteImage || selectedCaptions.size > 0;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      maxWidth="max-w-2xl"
      borderColor="border-red-500/50"
      closeOnBackdropClick={!deleting}
    >
      <ModalHeader bgColor="bg-red-500/10" borderColor="border-red-500/30">
        <div className="flex items-center gap-3">
          <ModalIcon color="text-red-500" bgColor="bg-red-500/20">
            <DeleteIcon />
          </ModalIcon>
          <div>
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">
              Delete Image
            </h2>
            <p className="text-sm text-muted">Select what to delete</p>
          </div>
        </div>
      </ModalHeader>

      <ModalContent className="space-y-6">
        {/* Image Preview */}
        <div className="flex gap-4">
          <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
            {image.url ? (
              <img
                src={image.url}
                alt={image.image_description || "Image"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted text-sm">
                No preview
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="delete-image"
                checked={deleteImage}
                onChange={(e) => handleDeleteImageToggle(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-border text-red-500 focus:ring-red-500"
              />
              <label htmlFor="delete-image" className="cursor-pointer">
                <span className="font-medium text-foreground">
                  Delete this image
                </span>
                <p className="text-sm text-muted mt-1">
                  This will permanently remove the image and all its associated
                  data.
                </p>
              </label>
            </div>
            <div className="mt-3 text-xs text-muted space-y-1">
              <p>
                <span className="font-medium">ID:</span> {image.id}
              </p>
              {uploaderName && (
                <p>
                  <span className="font-medium">Uploaded by:</span>{" "}
                  {uploaderName}
                </p>
              )}
              {image.image_description && (
                <p>
                  <span className="font-medium">Description:</span>{" "}
                  {image.image_description}
                </p>
              )}
              <p>
                <span className="font-medium">Created:</span>{" "}
                {new Date(image.created_datetime_utc).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Captions Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground">
              Attached Captions ({captions.length})
            </h3>
            {captions.length > 0 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAllCaptions}
                  className="text-xs text-purple-500 hover:text-purple-600"
                >
                  Select all
                </button>
                <span className="text-muted">|</span>
                <button
                  type="button"
                  onClick={deselectAllCaptions}
                  className="text-xs text-purple-500 hover:text-purple-600"
                >
                  Deselect all
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500" />
            </div>
          ) : captions.length === 0 ? (
            <p className="text-sm text-muted py-4 text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              No captions attached to this image
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {captions.map((caption) => (
                <label
                  key={caption.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedCaptions.has(caption.id)
                      ? "border-red-500/50 bg-red-500/5"
                      : "border-border hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCaptions.has(caption.id)}
                    onChange={() => toggleCaption(caption.id)}
                    className="mt-0.5 w-4 h-4 rounded border-border text-red-500 focus:ring-red-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground line-clamp-2">
                      {caption.content || (
                        <span className="italic text-muted">Empty caption</span>
                      )}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                      <span>
                        {new Date(
                          caption.created_datetime_utc
                        ).toLocaleDateString()}
                      </span>
                      <span>{caption.like_count} likes</span>
                      {caption.is_featured && (
                        <span className="text-amber-600 dark:text-amber-400">
                          Featured
                        </span>
                      )}
                      {caption.is_public && (
                        <span className="text-green-600 dark:text-green-400">
                          Public
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {deleteImage &&
            captions.length > 0 &&
            selectedCaptions.size < captions.length && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                Note: Deleting the image will also delete all{" "}
                {captions.length - selectedCaptions.size} unselected caption(s).
              </p>
            )}
        </div>

        <ModalError message={error} />
      </ModalContent>

      <ModalFooter>
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted">
            {deleteImage
              ? `Deleting image${captions.length > 0 ? ` and all ${captions.length} caption(s)` : ""}`
              : selectedCaptions.size > 0
                ? `Deleting ${selectedCaptions.size} caption(s)`
                : "Nothing selected"}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || !hasSelection}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {deleting && <ModalSpinner />}
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
}
