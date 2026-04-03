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

interface TermData {
  id: number;
  created_datetime_utc: string;
  modified_datetime_utc: string | null;
  term: string;
  definition: string;
  example: string;
  priority: number;
  term_type_id: number | null;
  term_types: {
    id: number;
    name: string;
  } | null;
}

interface EditTermModalProps {
  term: TermData;
  termTypes: { id: number; name: string }[];
  onClose: () => void;
  onUpdated: (updatedTerm: TermData) => void;
}

export function EditTermModal({
  term,
  termTypes,
  onClose,
  onUpdated,
}: EditTermModalProps) {
  const [termValue, setTermValue] = useState(term.term);
  const [definition, setDefinition] = useState(term.definition);
  const [example, setExample] = useState(term.example);
  const [priority, setPriority] = useState(term.priority);
  const [termTypeId, setTermTypeId] = useState<number | null>(term.term_type_id ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!termValue.trim() || !definition.trim() || !example.trim()) {
      setError("Term, definition, and example are required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/terms/${term.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          term: termValue.trim(),
          definition: definition.trim(),
          example: example.trim(),
          priority,
          term_type_id: termTypeId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update term");
      }

      const { term: updatedTerm } = await response.json();
      onUpdated(updatedTerm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setSaving(false);
    }
  };

  const hasChanges =
    termValue !== term.term ||
    definition !== term.definition ||
    example !== term.example ||
    priority !== term.priority ||
    termTypeId !== (term.term_type_id ?? null);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      maxWidth="max-w-lg"
      borderColor="border-purple-500/50"
      closeOnBackdropClick={!saving}
    >
      <ModalHeader bgColor="bg-purple-500/10" borderColor="border-purple-500/30">
        <div className="flex items-center gap-3">
          <ModalIcon color="text-purple-500" bgColor="bg-purple-500/20">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </ModalIcon>
          <div>
            <h2 className="text-xl font-semibold text-purple-600 dark:text-purple-400">
              Edit Term
            </h2>
            <p className="text-sm text-muted">Modify term details</p>
          </div>
        </div>
      </ModalHeader>

      <ModalContent className="space-y-4">
        {/* Term */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Term <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={termValue}
            onChange={(e) => setTermValue(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors"
            placeholder="Enter term..."
          />
        </div>

        {/* Definition */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Definition <span className="text-red-500">*</span>
          </label>
          <textarea
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors resize-none"
            placeholder="Enter definition..."
          />
        </div>

        {/* Example */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Example <span className="text-red-500">*</span>
          </label>
          <textarea
            value={example}
            onChange={(e) => setExample(e.target.value)}
            rows={2}
            className="w-full px-4 py-3 rounded-lg border border-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors resize-none"
            placeholder="Enter example usage..."
          />
        </div>

        {/* Term Type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Term Type
          </label>
          <select
            value={termTypeId ?? ""}
            onChange={(e) => setTermTypeId(e.target.value ? parseInt(e.target.value, 10) : null)}
            className="w-full px-4 py-3 rounded-lg border border-border bg-card-bg text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors"
          >
            <option value="">No type</option>
            {termTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Priority
          </label>
          <input
            type="number"
            value={priority}
            onChange={(e) => setPriority(parseInt(e.target.value, 10) || 0)}
            min={0}
            className="w-full px-4 py-3 rounded-lg border border-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors"
            placeholder="0"
          />
          <p className="mt-1 text-xs text-muted">Lower numbers appear first</p>
        </div>

        <ModalError message={error} />
      </ModalContent>

      <ModalFooter className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving && <ModalSpinner />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </ModalFooter>
    </Modal>
  );
}
