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

interface CaptionExampleData {
  id: number;
  image_description: string;
  caption: string;
  explanation: string;
  priority: number;
}

interface DeleteCaptionExampleModalProps {
  example: CaptionExampleData;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteCaptionExampleModal({
  example,
  onClose,
  onDeleted,
}: DeleteCaptionExampleModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/caption-examples/${example.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete caption example");
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
              Delete Caption Example
            </h2>
            <p className="text-sm text-muted">This action cannot be undone</p>
          </div>
        </div>
      </ModalHeader>

      <ModalContent className="space-y-4">
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-border">
          <div className="mb-3">
            <p className="text-xs font-medium text-muted mb-1">Image Description</p>
            <p className="text-sm text-foreground line-clamp-2">{example.image_description}</p>
          </div>
          <div className="mb-3 p-2 rounded bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">Caption</p>
            <p className="text-sm text-foreground line-clamp-2">{example.caption}</p>
          </div>
          <div className="flex gap-2">
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
              Priority: {example.priority}
            </span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              #{example.id}
            </span>
          </div>
        </div>

        <p className="text-sm text-muted">
          This will permanently delete this caption example from the database.
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
          {deleting ? "Deleting..." : "Delete Example"}
        </button>
      </ModalFooter>
    </Modal>
  );
}
