"use client";

import { useState } from "react";
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

interface CaptionData {
  id: string;
  content: string | null;
  profile_id: string;
  created_datetime_utc: string;
  is_public: boolean;
  is_featured: boolean;
}

interface DeleteCaptionModalProps {
  caption: CaptionData;
  creatorName: string;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteCaptionModal({
  caption,
  creatorName,
  onClose,
  onDeleted,
}: DeleteCaptionModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/captions/${caption.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete caption");
      }

      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      maxWidth="max-w-md"
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
              Delete Caption
            </h2>
            <p className="text-sm text-muted">This action cannot be undone</p>
          </div>
        </div>
      </ModalHeader>

      <ModalContent className="space-y-4">
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-border">
          <p className="text-sm text-foreground line-clamp-3">
            {caption.content || (
              <span className="italic text-muted">Empty caption</span>
            )}
          </p>
          <div className="mt-3 text-xs text-muted space-y-1">
            <p>
              <span className="font-medium">ID:</span> {caption.id}
            </p>
            <p>
              <span className="font-medium">Created by:</span> {creatorName}
            </p>
            <p>
              <span className="font-medium">Created:</span>{" "}
              {new Date(caption.created_datetime_utc).toLocaleString()}
            </p>
            <div className="flex gap-2 mt-2">
              {caption.is_featured && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  Featured
                </span>
              )}
              {caption.is_public ? (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  Public
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Private
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="text-sm text-muted">
          This will permanently delete this caption and all related data (votes,
          likes, saves, reports, etc.).
        </p>

        <ModalError message={error} />
      </ModalContent>

      <ModalFooter className="flex justify-end gap-3">
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
          disabled={deleting}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {deleting && <ModalSpinner />}
          {deleting ? "Deleting..." : "Delete Caption"}
        </button>
      </ModalFooter>
    </Modal>
  );
}
