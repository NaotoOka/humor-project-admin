"use client";

import { useState, useRef } from "react";
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
  ModalError,
  ModalSpinner,
} from "./Modal";

interface UploadImageModalProps {
  onClose: () => void;
  onUploaded: () => void;
}

export function UploadImageModal({ onClose, onUploaded }: UploadImageModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isCommonUse, setIsCommonUse] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [description, setDescription] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        input.files = dataTransfer.files;
        handleFileChange({ target: input } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an image to upload");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("is_common_use", isCommonUse.toString());
      formData.append("is_public", isPublic.toString());
      if (description) formData.append("image_description", description);
      if (additionalContext) formData.append("additional_context", additionalContext);

      const response = await fetch("/api/images", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload image");
      }

      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
      setUploading(false);
    }
  };

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Upload Image</h3>
            <p className="text-sm text-muted">Add a new image to the system</p>
          </div>
        </div>
      </ModalHeader>

      <ModalContent className="space-y-4">
        {/* File drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            preview
              ? "border-purple-500/50 bg-purple-500/5"
              : "border-border hover:border-purple-500/50 hover:bg-purple-500/5"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {preview ? (
            <div className="space-y-3">
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 mx-auto rounded-lg object-contain"
              />
              <p className="text-sm text-muted">{file?.name}</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setPreview(null);
                }}
                className="text-sm text-red-500 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <svg className="w-12 h-12 mx-auto text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-muted">
                Drop an image here or click to browse
              </p>
              <p className="text-xs text-muted">
                Max file size: 10MB
              </p>
            </div>
          )}
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

        <ModalError message={error} />
      </ModalContent>

      <ModalFooter className="flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={uploading}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {uploading && <ModalSpinner />}
          {uploading ? "Uploading..." : "Upload Image"}
        </button>
      </ModalFooter>
    </Modal>
  );
}
