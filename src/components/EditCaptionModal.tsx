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

interface CaptionData {
  id: string;
  content: string | null;
  profile_id: string;
  created_datetime_utc: string;
  is_public: boolean;
  is_featured: boolean;
  image_id?: string;
  humor_flavor_id?: number | null;
}

interface EditCaptionModalProps<T extends CaptionData = CaptionData> {
  caption: T;
  creatorName: string;
  onClose: () => void;
  onUpdated: (updatedCaption: T) => void;
}

export function EditCaptionModal<T extends CaptionData>({
  caption,
  creatorName,
  onClose,
  onUpdated,
}: EditCaptionModalProps<T>) {
  const [content, setContent] = useState(caption.content || "");
  const [isPublic, setIsPublic] = useState(caption.is_public);
  const [isFeatured, setIsFeatured] = useState(caption.is_featured);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/captions/${caption.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content || null,
          is_public: isPublic,
          is_featured: isFeatured,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update caption");
      }

      const { caption: updatedCaption } = await response.json();
      onUpdated({
        ...caption,
        ...updatedCaption,
      } as T);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setSaving(false);
    }
  };

  const hasChanges =
    content !== (caption.content || "") ||
    isPublic !== caption.is_public ||
    isFeatured !== caption.is_featured;

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
              Edit Caption
            </h2>
            <p className="text-sm text-muted">Modify caption content and settings</p>
          </div>
        </div>
      </ModalHeader>

      <ModalContent className="space-y-4">
        {/* Caption Info */}
        <div className="text-xs text-muted space-y-1 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-border">
          <p>
            <span className="font-medium">ID:</span> {caption.id}
          </p>
          <p>
            <span className="font-medium">Created by:</span> {creatorName}
          </p>
          <p>
            <span className="font-medium">Created:</span>{" "}
            {new Date(caption.created_datetime_utc).toLocaleString()}
          </p>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Caption Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors resize-none"
            placeholder="Enter caption content..."
          />
        </div>

        {/* Toggles */}
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-5 h-5 rounded border-border text-purple-500 focus:ring-purple-500/50 bg-card-bg"
            />
            <div>
              <span className="text-sm font-medium text-foreground">Public</span>
              <p className="text-xs text-muted">Make this caption visible to everyone</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-5 h-5 rounded border-border text-amber-500 focus:ring-amber-500/50 bg-card-bg"
            />
            <div>
              <span className="text-sm font-medium text-foreground">Featured</span>
              <p className="text-xs text-muted">Highlight this caption as featured content</p>
            </div>
          </label>
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
