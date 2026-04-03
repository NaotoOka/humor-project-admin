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

interface CreateLlmProviderModalProps {
  onClose: () => void;
  onCreated: (newProvider: LlmProviderData) => void;
}

export function CreateLlmProviderModal({
  onClose,
  onCreated,
}: CreateLlmProviderModalProps) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/llm-providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create provider");
      }

      const { provider } = await response.json();
      onCreated(provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="max-w-md" borderColor="border-green-500/50" closeOnBackdropClick={!saving}>
      <ModalHeader bgColor="bg-green-500/10" borderColor="border-green-500/30">
        <div className="flex items-center gap-3">
          <ModalIcon color="text-green-500" bgColor="bg-green-500/20">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </ModalIcon>
          <div>
            <h2 className="text-xl font-semibold text-green-600 dark:text-green-400">Add LLM Provider</h2>
            <p className="text-sm text-muted">Create a new provider</p>
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
            className="w-full px-4 py-3 rounded-lg border border-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-colors"
            placeholder="e.g., OpenAI, Anthropic, Google..."
          />
        </div>
        <ModalError message={error} />
      </ModalContent>

      <ModalFooter className="flex justify-end gap-3">
        <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50">
          Cancel
        </button>
        <button type="button" onClick={handleCreate} disabled={saving || !name.trim()} className="px-4 py-2 text-sm font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
          {saving && <ModalSpinner />}
          {saving ? "Creating..." : "Create Provider"}
        </button>
      </ModalFooter>
    </Modal>
  );
}
