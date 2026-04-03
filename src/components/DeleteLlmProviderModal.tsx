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

interface LlmProviderData {
  id: number;
  name: string;
}

interface DeleteLlmProviderModalProps {
  provider: LlmProviderData;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteLlmProviderModal({
  provider,
  onClose,
  onDeleted,
}: DeleteLlmProviderModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/llm-providers/${provider.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete provider");
      }

      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setDeleting(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="max-w-md" borderColor="border-red-500/50" closeOnBackdropClick={!deleting}>
      <ModalHeader bgColor="bg-red-500/10" borderColor="border-red-500/30">
        <div className="flex items-center gap-3">
          <ModalIcon color="text-red-500" bgColor="bg-red-500/20">
            <DeleteIcon />
          </ModalIcon>
          <div>
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">Delete Provider</h2>
            <p className="text-sm text-muted">This action cannot be undone</p>
          </div>
        </div>
      </ModalHeader>

      <ModalContent className="space-y-4">
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-border">
          <p className="text-lg font-semibold text-foreground">{provider.name}</p>
          <p className="text-xs text-muted mt-1">ID: {provider.id}</p>
        </div>
        <p className="text-sm text-muted">
          This will permanently delete this provider. Any models using this provider may be affected.
        </p>
        <ModalError message={error} />
      </ModalContent>

      <ModalFooter className="flex justify-end gap-3">
        <button type="button" onClick={onClose} disabled={deleting} className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50">
          Cancel
        </button>
        <button type="button" onClick={handleDelete} disabled={deleting} className="px-4 py-2 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
          {deleting && <ModalSpinner />}
          {deleting ? "Deleting..." : "Delete Provider"}
        </button>
      </ModalFooter>
    </Modal>
  );
}
