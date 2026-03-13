"use client";

import { useState, useEffect, useCallback } from "react";
import { DeleteCaptionModal } from "./DeleteCaptionModal";
import { EditCaptionModal } from "./EditCaptionModal";
import { VotersModal } from "./VotersModal";

interface Caption {
  id: string;
  content: string | null;
  profile_id: string;
  created_datetime_utc: string;
  is_public: boolean;
  is_featured: boolean;
  image_id?: string;
  humor_flavor_id?: number | null;
  llm_prompt_chain_id: number | null;
}

interface CaptionWithDetails extends Caption {
  creatorName: string;
  llmResponse: string | null;
  upvotes: number;
  downvotes: number;
}

const ITEMS_PER_PAGE = 20;

export function RatedCaptionsList() {
  const [captions, setCaptions] = useState<CaptionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [captionToDelete, setCaptionToDelete] = useState<CaptionWithDetails | null>(null);
  const [captionToEdit, setCaptionToEdit] = useState<CaptionWithDetails | null>(null);
  const [captionToShowVoters, setCaptionToShowVoters] = useState<CaptionWithDetails | null>(null);

  const fetchCaptions = useCallback(async (offset: number = 0, append: boolean = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(`/api/captions?offset=${offset}&limit=${ITEMS_PER_PAGE}&type=rated`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch rated captions");
      }

      const { captions: captionsData, hasMore: moreAvailable } = await response.json();

      setHasMore(moreAvailable);

      if (append) {
        setCaptions(prev => {
          const existingIds = new Set(prev.map(c => c.id));
          const newCaptions = captionsData.filter((c: CaptionWithDetails) => !existingIds.has(c.id));
          return [...prev, ...newCaptions];
        });
      } else {
        setCaptions(captionsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load captions");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchCaptions();
  }, [fetchCaptions]);

  const handleLoadMore = () => {
    fetchCaptions(captions.length, true);
  };

  const handleDeleted = () => {
    setCaptionToDelete(null);
    if (captionToDelete) {
      setCaptions(prev => prev.filter(c => c.id !== captionToDelete.id));
    }
  };

  const handleUpdated = (updatedCaption: CaptionWithDetails) => {
    setCaptionToEdit(null);
    // Update the caption in the list
    setCaptions(prev =>
      prev.map(c => (c.id === updatedCaption.id ? { ...c, ...updatedCaption } : c))
    );
  };

  const getCaptionText = (caption: CaptionWithDetails) => {
    return caption.content || caption.llmResponse || null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="glass-card overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-purple-500/5">
                <th className="px-6 py-4 text-left text-sm font-medium text-muted">Caption</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted">Creator</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted">Created</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted">Votes</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {captions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted">
                    No rated captions found.
                  </td>
                </tr>
              ) : (
                captions.map((caption) => (
                  <tr key={caption.id} className="transition-colors hover:bg-purple-500/5">
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <p className="text-sm font-medium text-foreground line-clamp-2">
                          {getCaptionText(caption) || <span className="italic text-muted">No content</span>}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          ID: {caption.id.slice(0, 8)}...
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`/users/${caption.profile_id}`}
                        className="text-sm font-medium text-foreground hover:text-purple-500 transition-colors"
                      >
                        {caption.creatorName}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {new Date(caption.created_datetime_utc).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-green-500">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          {caption.upvotes}
                        </span>
                        <span className="flex items-center gap-1 text-red-500">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          {caption.downvotes}
                        </span>
                        <button
                          onClick={() => setCaptionToShowVoters(caption)}
                          className="text-xs text-purple-500 hover:text-purple-600 hover:underline"
                        >
                          View voters
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setCaptionToEdit(caption)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => setCaptionToDelete(caption)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with Load More */}
        <div className="border-t border-border px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-muted">
            Showing {captions.length} rated captions
          </p>
          {hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loadingMore && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500" />
              )}
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {captionToDelete && (
        <DeleteCaptionModal
          caption={{
            ...captionToDelete,
            content: getCaptionText(captionToDelete),
          }}
          creatorName={captionToDelete.creatorName}
          onClose={() => setCaptionToDelete(null)}
          onDeleted={handleDeleted}
        />
      )}

      {/* Edit Modal */}
      {captionToEdit && (
        <EditCaptionModal
          caption={{
            ...captionToEdit,
            content: getCaptionText(captionToEdit),
          }}
          creatorName={captionToEdit.creatorName}
          onClose={() => setCaptionToEdit(null)}
          onUpdated={handleUpdated}
        />
      )}

      {/* Voters Modal */}
      {captionToShowVoters && (
        <VotersModal
          captionId={captionToShowVoters.id}
          captionText={getCaptionText(captionToShowVoters)}
          onClose={() => setCaptionToShowVoters(null)}
        />
      )}
    </>
  );
}
