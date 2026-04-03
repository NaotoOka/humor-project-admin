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

interface CaptionExampleData {
  id: number;
  created_datetime_utc: string;
  modified_datetime_utc: string | null;
  image_description: string;
  caption: string;
  explanation: string;
  priority: number;
  image_id: string | null;
  images: {
    id: string;
    url: string;
    image_description: string;
  } | null;
}

interface CreateCaptionExampleModalProps {
  onClose: () => void;
  onCreated: (newExample: CaptionExampleData) => void;
}

export function CreateCaptionExampleModal({
  onClose,
  onCreated,
}: CreateCaptionExampleModalProps) {
  const [imageDescription, setImageDescription] = useState("");
  const [caption, setCaption] = useState("");
  const [explanation, setExplanation] = useState("");
  const [priority, setPriority] = useState(0);
  const [imageId, setImageId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!imageDescription.trim() || !caption.trim() || !explanation.trim()) {
      setError("Image description, caption, and explanation are required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/caption-examples", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_description: imageDescription.trim(),
          caption: caption.trim(),
          explanation: explanation.trim(),
          priority,
          image_id: imageId.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create caption example");
      }

      const { example } = await response.json();
      onCreated(example);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setSaving(false);
    }
  };

  const isValid = imageDescription.trim() && caption.trim() && explanation.trim();

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      maxWidth="max-w-lg"
      borderColor="border-green-500/50"
      closeOnBackdropClick={!saving}
    >
      <ModalHeader bgColor="bg-green-500/10" borderColor="border-green-500/30">
        <div className="flex items-center gap-3">
          <ModalIcon color="text-green-500" bgColor="bg-green-500/20">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </ModalIcon>
          <div>
            <h2 className="text-xl font-semibold text-green-600 dark:text-green-400">
              Create Caption Example
            </h2>
            <p className="text-sm text-muted">Add a new example for AI training</p>
          </div>
        </div>
      </ModalHeader>

      <ModalContent className="space-y-4">
        {/* Image Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Image Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={imageDescription}
            onChange={(e) => setImageDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-colors resize-none"
            placeholder="Describe the image content..."
          />
        </div>

        {/* Caption */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Caption <span className="text-red-500">*</span>
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={2}
            className="w-full px-4 py-3 rounded-lg border border-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-colors resize-none"
            placeholder="Enter the example caption..."
          />
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Explanation <span className="text-red-500">*</span>
          </label>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-colors resize-none"
            placeholder="Explain why this caption works..."
          />
        </div>

        {/* Image ID (optional) */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Image ID (optional)
          </label>
          <input
            type="text"
            value={imageId}
            onChange={(e) => setImageId(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-colors"
            placeholder="Link to an existing image..."
          />
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
            className="w-full px-4 py-3 rounded-lg border border-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-colors"
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
          onClick={handleCreate}
          disabled={saving || !isValid}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving && <ModalSpinner />}
          {saving ? "Creating..." : "Create Example"}
        </button>
      </ModalFooter>
    </Modal>
  );
}
