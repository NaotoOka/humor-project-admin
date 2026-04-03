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

interface EditLlmModelModalProps {
  model: LlmModelData;
  providers: LlmProviderData[];
  onClose: () => void;
  onUpdated: (updatedModel: LlmModelData) => void;
}

export function EditLlmModelModal({
  model,
  providers,
  onClose,
  onUpdated,
}: EditLlmModelModalProps) {
  const [name, setName] = useState(model.name);
  const [providerId, setProviderId] = useState<number>(model.llm_provider_id);
  const [providerModelId, setProviderModelId] = useState(model.provider_model_id);
  const [isTemperatureSupported, setIsTemperatureSupported] = useState(model.is_temperature_supported);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim() || !providerId || !providerModelId.trim()) {
      setError("Name, provider, and provider model ID are required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/llm-models/${model.id}`, {
        method: "PUT",
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
        throw new Error(data.error || "Failed to update model");
      }

      const { model: updatedModel } = await response.json();
      onUpdated(updatedModel);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setSaving(false);
    }
  };

  const hasChanges =
    name !== model.name ||
    providerId !== model.llm_provider_id ||
    providerModelId !== model.provider_model_id ||
    isTemperatureSupported !== model.is_temperature_supported;

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="max-w-lg" borderColor="border-purple-500/50" closeOnBackdropClick={!saving}>
      <ModalHeader bgColor="bg-purple-500/10" borderColor="border-purple-500/30">
        <div className="flex items-center gap-3">
          <ModalIcon color="text-purple-500" bgColor="bg-purple-500/20">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </ModalIcon>
          <div>
            <h2 className="text-xl font-semibold text-purple-600 dark:text-purple-400">Edit Model</h2>
            <p className="text-sm text-muted">Modify model details</p>
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
            className="w-full px-4 py-3 rounded-lg border border-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors"
            placeholder="Model name..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Provider <span className="text-red-500">*</span>
          </label>
          <select
            value={providerId}
            onChange={(e) => setProviderId(parseInt(e.target.value, 10))}
            className="w-full px-4 py-3 rounded-lg border border-border bg-card-bg text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors"
          >
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
            className="w-full px-4 py-3 rounded-lg border border-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors font-mono text-sm"
            placeholder="Provider model ID..."
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="tempSupported"
            checked={isTemperatureSupported}
            onChange={(e) => setIsTemperatureSupported(e.target.checked)}
            className="h-4 w-4 rounded border-border text-purple-500 focus:ring-purple-500"
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
        <button type="button" onClick={handleSave} disabled={saving || !hasChanges} className="px-4 py-2 text-sm font-medium rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
          {saving && <ModalSpinner />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </ModalFooter>
    </Modal>
  );
}
