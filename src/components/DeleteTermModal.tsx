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

interface TermData {
  id: number;
  term: string;
  definition: string;
  example: string;
  priority: number;
  term_types?: {
    id: number;
    name: string;
  } | null;
}

interface DeleteTermModalProps {
  term: TermData;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteTermModal({
  term,
  onClose,
  onDeleted,
}: DeleteTermModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/terms/${term.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete term");
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
              Delete Term
            </h2>
            <p className="text-sm text-muted">This action cannot be undone</p>
          </div>
        </div>
      </ModalHeader>

      <ModalContent className="space-y-4">
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-border">
          <p className="text-lg font-semibold text-foreground mb-2">
            {term.term}
          </p>
          <p className="text-sm text-foreground line-clamp-2 mb-2">
            {term.definition}
          </p>
          <div className="text-xs text-muted space-y-1">
            <p>
              <span className="font-medium">Example:</span> {term.example}
            </p>
            <div className="flex gap-2 mt-2">
              {term.term_types && (
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  {term.term_types.name}
                </span>
              )}
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                Priority: {term.priority}
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted">
          This will permanently delete this term from the database.
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
          {deleting ? "Deleting..." : "Delete Term"}
        </button>
      </ModalFooter>
    </Modal>
  );
}
