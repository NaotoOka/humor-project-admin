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
} from "@/components/Modal";

interface LlmProviderData {
  id: number;
  created_datetime_utc: string;
  name: string;
}

interface EditLlmProviderModalProps {
  provider: LlmProviderData;
  onClose: () => void;
  onUpdated: (updatedProvider: LlmProviderData) => void;
}

export function EditLlmProviderModal({
  provider,
  onClose,
  onUpdated,
}: EditLlmProviderModalProps) {
  const [name, setName] = useState(provider.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/llm-providers/${provider.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update provider");
      }

      const { provider: updatedProvider } = await response.json();
      onUpdated(updatedProvider);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setSaving(false);
    }
  };

  const hasChanges = name !== provider.name;

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="max-w-md" borderColor="border-purple-500/50" closeOnBackdropClick={!saving}>
      <ModalHeader bgColor="bg-purple-500/10" borderColor="border-purple-500/30">
        <div className="flex items-center gap-3">
          <ModalIcon color="text-purple-500" bgColor="bg-purple-500/20">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </ModalIcon>
          <div>
            <h2 className="text-xl font-semibold text-purple-600 dark:text-purple-400">Edit Provider</h2>
            <p className="text-sm text-muted">Modify provider details</p>
          </div>
        </div>
      </ModalHeader>

      <ModalContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Provider Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors"
            placeholder="Provider name..."
          />
        </div>
        <ModalError message={error} />
      </ModalContent>

      <ModalFooter className="flex justify-end gap-3">
        <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50">
          Cancel
        </button>
        <button type="button" onClick={handleSave} disabled={saving || !hasChanges} className="px-4 py-2 text-sm font-medium rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
          {saving && <ModalSpinner />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </ModalFooter>
    </Modal>
  );
}
