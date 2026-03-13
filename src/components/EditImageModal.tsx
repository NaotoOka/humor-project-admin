"use client";

import { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
  ModalError,
  ModalSpinner,
} from "./Modal";
import type { Database } from "@/lib/supabase/database.types";

type Image = Database["public"]["Tables"]["images"]["Row"];

interface EditImageModalProps {
  image: Image;
  onClose: () => void;
  onUpdated: () => void;
}

export function EditImageModal({ image, onClose, onUpdated }: EditImageModalProps) {
  const [isCommonUse, setIsCommonUse] = useState(image.is_common_use ?? false);
  const [isPublic, setIsPublic] = useState(image.is_public ?? false);
  const [description, setDescription] = useState(image.image_description ?? "");
  const [additionalContext, setAdditionalContext] = useState(image.additional_context ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/images/${image.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_common_use: isCommonUse,
          is_public: isPublic,
          image_description: description || null,
          additional_context: additionalContext || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update image");
      }

      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update image");
      setSaving(false);
    }
  };

  const hasChanges =
    isCommonUse !== (image.is_common_use ?? false) ||
    isPublic !== (image.is_public ?? false) ||
    description !== (image.image_description ?? "") ||
    additionalContext !== (image.additional_context ?? "");

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      maxWidth="max-w-xl"
      borderColor="border-purple-500/50"
    >
      <ModalHeader
        showCloseButton
        onClose={onClose}
        bgColor="bg-purple-500/5"
        borderColor="border-purple-500/30"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500/20">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Edit Image</h3>
            <p className="text-sm text-muted">Update image metadata</p>
          </div>
        </div>
      </ModalHeader>

      <ModalContent className="space-y-4">
        {/* Image preview */}
        <div className="flex justify-center">
          {image.url ? (
            <img
              src={image.url}
              alt={image.image_description || "Image preview"}
              className="max-h-48 rounded-lg object-contain"
            />
          ) : (
            <div className="w-48 h-48 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <svg className="w-12 h-12 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Image ID */}
        <div className="text-center">
          <p className="text-xs text-muted">ID: {image.id}</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the image..."
            rows={2}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none"
          />
        </div>

        {/* Additional context */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Additional Context
          </label>
          <textarea
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder="Any additional context for caption generation..."
            rows={2}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none"
          />
        </div>

        {/* Options */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isCommonUse}
              onChange={(e) => setIsCommonUse(e.target.checked)}
              className="w-4 h-4 rounded border-border text-purple-500 focus:ring-purple-500"
            />
            <span className="text-sm text-foreground">Template (Common Use)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 rounded border-border text-purple-500 focus:ring-purple-500"
            />
            <span className="text-sm text-foreground">Public</span>
          </label>
        </div>

        {/* Celebrity recognition (read-only) */}
        {image.celebrity_recognition && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Celebrity Recognition
            </label>
            <p className="text-sm text-muted bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
              {image.celebrity_recognition}
            </p>
          </div>
        )}

        <ModalError message={error} />
      </ModalContent>

      <ModalFooter className="flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving && <ModalSpinner />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </ModalFooter>
    </Modal>
  );
}
