"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DeleteImageModal } from "./DeleteImageModal";
import { EditImageModal } from "./EditImageModal";
import type { Database } from "@/lib/supabase/database.types";

type Image = Database["public"]["Tables"]["images"]["Row"];

interface MemesGridProps {
  images: Image[];
}

export function MemesGrid({ images }: MemesGridProps) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleDeleteClick = (image: Image, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImage(image);
    setShowDeleteModal(true);
  };

  const handleEditClick = (image: Image, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImage(image);
    setShowEditModal(true);
  };

  const handleDeleted = () => {
    setShowDeleteModal(false);
    setSelectedImage(null);
    router.refresh();
  };

  const handleUpdated = () => {
    setShowEditModal(false);
    setSelectedImage(null);
    router.refresh();
  };

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="glass-card overflow-hidden rounded-xl group relative"
          >
            {/* Image preview */}
            <div className="relative aspect-square bg-purple-100 dark:bg-purple-900/30">
              {image.url ? (
                <img
                  src={image.url}
                  alt={image.image_description || "Meme image"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <svg
                    className="h-12 w-12 text-purple-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </div>
              )}

              {/* Action buttons overlay */}
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleEditClick(image, e)}
                  className="p-2 rounded-lg bg-purple-500/90 text-white hover:bg-purple-600 transition-colors"
                  title="Edit image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => handleDeleteClick(image, e)}
                  className="p-2 rounded-lg bg-red-500/90 text-white hover:bg-red-600 transition-colors"
                  title="Delete image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <p className="line-clamp-2 text-sm font-medium text-foreground">
                {image.image_description || "No description"}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-2">
                  {image.is_common_use && (
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                      Template
                    </span>
                  )}
                  {image.is_public ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Public
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                      Private
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted">
                  {image.created_datetime_utc
                    ? new Date(image.created_datetime_utc).toLocaleDateString()
                    : "Unknown"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && selectedImage && (
        <DeleteImageModal
          image={selectedImage}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedImage(null);
          }}
          onDeleted={handleDeleted}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedImage && (
        <EditImageModal
          image={selectedImage}
          onClose={() => {
            setShowEditModal(false);
            setSelectedImage(null);
          }}
          onUpdated={handleUpdated}
        />
      )}
    </>
  );
}
