"use client";

import { useState, useEffect, useCallback } from "react";
import { DeleteCaptionModal } from "./DeleteCaptionModal";
import { EditCaptionModal } from "./EditCaptionModal";
import { CreateCaptionModal } from "./CreateCaptionModal";
import { BulkDeleteCaptionsModal } from "./BulkDeleteCaptionsModal";

interface CaptionWithDetails {
  id: string;
  content: string | null;
  profile_id: string;
  created_datetime_utc: string;
  is_public: boolean;
  is_featured: boolean;
  image_id?: string;
  humor_flavor_id?: number | null;
  llm_prompt_chain_id: number | null;
  creatorName: string;
  llmResponse: string | null;
}

const ITEMS_PER_PAGE = 20;

export function GeneratedCaptionsList() {
  const [captions, setCaptions] = useState<CaptionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [captionToDelete, setCaptionToDelete] = useState<CaptionWithDetails | null>(null);
  const [captionToEdit, setCaptionToEdit] = useState<CaptionWithDetails | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const fetchCaptions = useCallback(async (offset: number = 0, append: boolean = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(`/api/captions?offset=${offset}&limit=${ITEMS_PER_PAGE}&type=all`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch captions");
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
    // Remove the deleted caption from the list
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

  const handleCreated = (newCaption: any) => {
    setShowCreateModal(false);
    // Add the new caption to the top of the list
    setCaptions(prev => [
      {
        ...newCaption,
        creatorName: "You",
        llmResponse: null,
      },
      ...prev,
    ]);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === captions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(captions.map(c => c.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleBulkDeleted = (deletedIds: string[]) => {
    setShowBulkDeleteModal(false);
    setCaptions(prev => prev.filter(c => !deletedIds.includes(c.id)));
    setSelectedIds(new Set());
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
      {/* Header with Create Button and Bulk Actions */}
      <div className="flex items-center justify-between mb-4">
        {selectedIds.size > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
              {selectedIds.size} selected
            </span>
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Selected
            </button>
          </div>
        ) : (
          <div />
        )}
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Caption
        </button>
      </div>

      <div className="glass-card overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-purple-500/5">
                <th className="px-4 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={captions.length > 0 && selectedIds.size === captions.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted">Caption</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted">Creator</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted">Created</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted">Status</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {captions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted">
                    No captions found.
                  </td>
                </tr>
              ) : (
                captions.map((caption) => (
                  <tr key={caption.id} className={`transition-colors hover:bg-purple-500/5 ${selectedIds.has(caption.id) ? "bg-purple-500/10" : ""}`}>
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(caption.id)}
                        onChange={() => handleSelectOne(caption.id)}
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </td>
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
                      <div className="flex flex-wrap gap-1">
                        {caption.is_featured && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            Featured
                          </span>
                        )}
                        {caption.is_public ? (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Public
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            Private
                          </span>
                        )}
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
            Showing {captions.length} captions
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

      {/* Create Modal */}
      {showCreateModal && (
        <CreateCaptionModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}

      {/* Bulk Delete Modal */}
      {showBulkDeleteModal && (
        <BulkDeleteCaptionsModal
          captions={captions
            .filter(c => selectedIds.has(c.id))
            .map(c => ({ id: c.id, content: getCaptionText(c) }))}
          onClose={() => setShowBulkDeleteModal(false)}
          onDeleted={handleBulkDeleted}
        />
      )}
    </>
  );
}
