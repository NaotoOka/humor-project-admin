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
  name: string;
}

interface LlmModelData {
  id: number;
  created_datetime_utc: string;
  name: string;
  llm_provider_id: number;
  provider_model_id: string;
  is_temperature_supported: boolean;
  llm_providers: LlmProviderData | null;
}

interface CreateLlmModelModalProps {
  providers: LlmProviderData[];
  onClose: () => void;
  onCreated: (newModel: LlmModelData) => void;
}

export function CreateLlmModelModal({
  providers,
  onClose,
  onCreated,
}: CreateLlmModelModalProps) {
  const [name, setName] = useState("");
  const [providerId, setProviderId] = useState<number | null>(providers[0]?.id || null);
  const [providerModelId, setProviderModelId] = useState("");
  const [isTemperatureSupported, setIsTemperatureSupported] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim() || !providerId || !providerModelId.trim()) {
      setError("Name, provider, and provider model ID are required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/llm-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          llm_provider_id: providerId,
          provider_model_id: providerModelId.trim(),
          is_temperature_supported: isTemperatureSupported,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create model");
      }

      const { model } = await response.json();
      onCreated(model);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setSaving(false);
    }
  };

  const isValid = name.trim() && providerId && providerModelId.trim();

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="max-w-lg" borderColor="border-green-500/50" closeOnBackdropClick={!saving}>
      <ModalHeader bgColor="bg-green-500/10" borderColor="border-green-500/30">
        <div className="flex items-center gap-3">
          <ModalIcon color="text-green-500" bgColor="bg-green-500/20">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </ModalIcon>
          <div>
            <h2 className="text-xl font-semibold text-green-600 dark:text-green-400">Add LLM Model</h2>
            <p className="text-sm text-muted">Create a new model</p>
          </div>
        </div>
      </ModalHeader>

      <ModalContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Model Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-colors"
            placeholder="e.g., GPT-4o, Claude 3.5 Sonnet..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Provider <span className="text-red-500">*</span>
          </label>
          <select
            value={providerId ?? ""}
            onChange={(e) => setProviderId(e.target.value ? parseInt(e.target.value, 10) : null)}
            className="w-full px-4 py-3 rounded-lg border border-border bg-card-bg text-foreground focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-colors"
          >
            <option value="">Select provider...</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Provider Model ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={providerModelId}
            onChange={(e) => setProviderModelId(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-colors font-mono text-sm"
            placeholder="e.g., gpt-4o, claude-3-5-sonnet-20241022..."
          />
          <p className="mt-1 text-xs text-muted">The model ID used by the provider&apos;s API</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="tempSupported"
            checked={isTemperatureSupported}
            onChange={(e) => setIsTemperatureSupported(e.target.checked)}
            className="h-4 w-4 rounded border-border text-green-500 focus:ring-green-500"
          />
          <label htmlFor="tempSupported" className="text-sm text-foreground">
            Temperature parameter supported
          </label>
        </div>

        <ModalError message={error} />
      </ModalContent>

      <ModalFooter className="flex justify-end gap-3">
        <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50">
          Cancel
        </button>
        <button type="button" onClick={handleCreate} disabled={saving || !isValid} className="px-4 py-2 text-sm font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
          {saving && <ModalSpinner />}
          {saving ? "Creating..." : "Create Model"}
        </button>
      </ModalFooter>
    </Modal>
  );
}
