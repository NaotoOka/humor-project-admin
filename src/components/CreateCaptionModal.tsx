"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
  ModalIcon,
  ModalError,
  ModalSpinner,
} from "@/components/Modal";

interface Image {
  id: string;
  url: string | null;
  image_description: string | null;
}

interface CreateCaptionModalProps {
  onClose: () => void;
  onCreated: (newCaption: any) => void;
}

export function CreateCaptionModal({
  onClose,
  onCreated,
}: CreateCaptionModalProps) {
  const [content, setContent] = useState("");
  const [imageId, setImageId] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Image search/selection
  const [images, setImages] = useState<Image[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [imageSearchQuery, setImageSearchQuery] = useState("");
  const [showImageDropdown, setShowImageDropdown] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);

  // Fetch images for selection
  useEffect(() => {
    const fetchImages = async () => {
      setLoadingImages(true);
      try {
        const response = await fetch("/api/images?limit=50&filter=all");
        if (response.ok) {
          const data = await response.json();
          setImages(data.images || []);
        }
      } catch (err) {
        console.error("Failed to fetch images:", err);
      } finally {
        setLoadingImages(false);
      }
    };
    fetchImages();
  }, []);

  const filteredImages = images.filter((img) => {
    if (!imageSearchQuery) return true;
    const query = imageSearchQuery.toLowerCase();
    return (
      img.id.toLowerCase().includes(query) ||
      (img.image_description?.toLowerCase().includes(query) ?? false)
    );
  });

  const handleSelectImage = (image: Image) => {
    setSelectedImage(image);
    setImageId(image.id);
    setShowImageDropdown(false);
    setImageSearchQuery("");
  };

  const handleCreate = async () => {
    if (!imageId) {
      setError("Please select an image for the caption");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/captions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content || null,
          image_id: imageId,
          is_public: isPublic,
          is_featured: isFeatured,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create caption");
      }

      const { caption } = await response.json();
      onCreated(caption);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setSaving(false);
    }
  };

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
              Create Caption
            </h2>
            <p className="text-sm text-muted">Add a new caption to an image</p>
          </div>
        </div>
      </ModalHeader>

      <ModalContent className="space-y-4">
        {/* Image Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Select Image <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowImageDropdown(!showImageDropdown)}
              className="w-full px-4 py-3 rounded-lg border border-border bg-card-bg text-foreground text-left focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-colors flex items-center justify-between"
            >
              {selectedImage ? (
                <div className="flex items-center gap-3">
                  {selectedImage.url && (
                    <img
                      src={selectedImage.url}
                      alt=""
                      className="w-10 h-10 rounded object-cover"
                    />
                  )}
                  <span className="text-sm truncate">
                    {selectedImage.image_description || `Image ${selectedImage.id.slice(0, 8)}...`}
                  </span>
                </div>
              ) : (
                <span className="text-muted">Click to select an image...</span>
              )}
              <svg
                className={`w-5 h-5 text-muted transition-transform ${showImageDropdown ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showImageDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-card-bg border border-border rounded-lg shadow-lg max-h-64 overflow-hidden">
                <div className="p-2 border-b border-border">
                  <input
                    type="text"
                    value={imageSearchQuery}
                    onChange={(e) => setImageSearchQuery(e.target.value)}
                    placeholder="Search images..."
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card-bg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto max-h-48">
                  {loadingImages ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500" />
                    </div>
                  ) : filteredImages.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-muted text-center">
                      No images found
                    </div>
                  ) : (
                    filteredImages.slice(0, 20).map((image) => (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => handleSelectImage(image)}
                        className="w-full px-4 py-2 text-left hover:bg-green-500/10 transition-colors flex items-center gap-3"
                      >
                        {image.url && (
                          <img
                            src={image.url}
                            alt=""
                            className="w-10 h-10 rounded object-cover flex-shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-foreground truncate">
                            {image.image_description || "No description"}
                          </p>
                          <p className="text-xs text-muted truncate">
                            ID: {image.id.slice(0, 8)}...
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
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
            className="w-full px-4 py-3 rounded-lg border border-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-colors resize-none"
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
              className="w-5 h-5 rounded border-border text-green-500 focus:ring-green-500/50 bg-card-bg"
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
          onClick={handleCreate}
          disabled={saving || !imageId}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving && <ModalSpinner />}
          {saving ? "Creating..." : "Create Caption"}
        </button>
      </ModalFooter>
    </Modal>
  );
}
