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

interface EditCaptionExampleModalProps {
  example: CaptionExampleData;
  onClose: () => void;
  onUpdated: (updatedExample: CaptionExampleData) => void;
}

export function EditCaptionExampleModal({
  example,
  onClose,
  onUpdated,
}: EditCaptionExampleModalProps) {
  const [imageDescription, setImageDescription] = useState(example.image_description);
  const [caption, setCaption] = useState(example.caption);
  const [explanation, setExplanation] = useState(example.explanation);
  const [priority, setPriority] = useState(example.priority);
  const [imageId, setImageId] = useState(example.image_id || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!imageDescription.trim() || !caption.trim() || !explanation.trim()) {
      setError("Image description, caption, and explanation are required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/caption-examples/${example.id}`, {
        method: "PUT",
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
        throw new Error(data.error || "Failed to update caption example");
      }

      const { example: updatedExample } = await response.json();
      onUpdated(updatedExample);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setSaving(false);
    }
  };

  const hasChanges =
    imageDescription !== example.image_description ||
    caption !== example.caption ||
    explanation !== example.explanation ||
    priority !== example.priority ||
    imageId !== (example.image_id || "");

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
              Edit Caption Example
            </h2>
            <p className="text-sm text-muted">Modify example #{example.id}</p>
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
            className="w-full px-4 py-3 rounded-lg border border-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors resize-none"
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
            className="w-full px-4 py-3 rounded-lg border border-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors resize-none"
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
            className="w-full px-4 py-3 rounded-lg border border-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors resize-none"
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
            className="w-full px-4 py-3 rounded-lg border border-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors"
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
