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
}

interface BulkDeleteCaptionsModalProps {
  captions: CaptionData[];
  onClose: () => void;
  onDeleted: (deletedIds: string[]) => void;
}

export function BulkDeleteCaptionsModal({
  captions,
  onClose,
  onDeleted,
}: BulkDeleteCaptionsModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch("/api/captions/bulk-delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          captionIds: captions.map(c => c.id),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete captions");
      }

      onDeleted(captions.map(c => c.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      maxWidth="max-w-lg"
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
              Delete {captions.length} Caption{captions.length !== 1 ? "s" : ""}
            </h2>
            <p className="text-sm text-muted">This action cannot be undone</p>
          </div>
        </div>
      </ModalHeader>

      <ModalContent className="space-y-4">
        <p className="text-sm text-foreground">
          You are about to delete <span className="font-semibold">{captions.length}</span> caption{captions.length !== 1 ? "s" : ""}.
          This will permanently remove all selected captions and their related data (votes, likes, saves, reports, etc.).
        </p>

        <div className="max-h-60 overflow-y-auto rounded-lg border border-border divide-y divide-border">
          {captions.map((caption) => (
            <div key={caption.id} className="p-3 bg-slate-50 dark:bg-slate-800/50">
              <p className="text-sm text-foreground line-clamp-2">
                {caption.content || (
                  <span className="italic text-muted">Empty caption</span>
                )}
              </p>
              <p className="mt-1 text-xs text-muted">
                ID: {caption.id.slice(0, 8)}...
              </p>
            </div>
          ))}
        </div>

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
          {deleting ? "Deleting..." : `Delete ${captions.length} Caption${captions.length !== 1 ? "s" : ""}`}
        </button>
      </ModalFooter>
    </Modal>
  );
}
