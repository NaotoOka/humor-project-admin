"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MemesGrid } from "./MemesGrid";
import { UploadImageModal } from "./UploadImageModal";
import type { Database } from "@/lib/supabase/database.types";

type Image = Database["public"]["Tables"]["images"]["Row"];

interface MemesPageContentProps {
  images: Image[];
  page: number;
  hasMore: boolean;
  totalCount: number;
}

export function MemesPageContent({ images, page, hasMore, totalCount }: MemesPageContentProps) {
  const router = useRouter();
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleUploaded = () => {
    setShowUploadModal(false);
    router.refresh();
  };

  const goToPage = (newPage: number) => {
    router.push(`/memes?page=${newPage}`);
  };

  return (
    <div className="space-y-6">
      {/* Page header with upload button */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Memes</h1>
          <p className="mt-1 text-muted">
            Browse and manage uploaded meme images.
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload Image
        </button>
      </div>

      {/* Memes grid */}
      {images.length > 0 ? (
        <MemesGrid images={images} />
      ) : (
        <div className="glass-card rounded-xl p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-muted mb-4">No memes found.</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload Your First Image
          </button>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex items-center justify-between border-t border-border pt-6">
        <p className="text-sm text-muted">
          Showing <span className="font-medium text-foreground">{(page - 1) * 50 + 1}</span> to{" "}
          <span className="font-medium text-foreground">{(page - 1) * 50 + images.length}</span> of{" "}
          <span className="font-medium text-foreground">{totalCount}</span> memes
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className="p-2 rounded-lg border border-border bg-background text-foreground hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-background transition-colors"
            title="Previous page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-600 font-medium text-sm">
            Page {page}
          </div>

          <button
            onClick={() => goToPage(page + 1)}
            disabled={!hasMore}
            className="p-2 rounded-lg border border-border bg-background text-foreground hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-background transition-colors"
            title="Next page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadImageModal
          onClose={() => setShowUploadModal(false)}
          onUploaded={handleUploaded}
        />
      )}
    </div>
  );
}
