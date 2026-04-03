"use client";

import { useState, useEffect, useCallback } from "react";
import { CreateCaptionExampleModal } from "./CreateCaptionExampleModal";
import { EditCaptionExampleModal } from "./EditCaptionExampleModal";
import { DeleteCaptionExampleModal } from "./DeleteCaptionExampleModal";

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

export function CaptionExamplesList() {
  const [examples, setExamples] = useState<CaptionExampleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingExample, setEditingExample] = useState<CaptionExampleData | null>(null);
  const [deletingExample, setDeletingExample] = useState<CaptionExampleData | null>(null);

  const fetchExamples = useCallback(async (offset = 0, append = false) => {
    if (offset === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const response = await fetch(`/api/caption-examples?offset=${offset}&limit=50`);
      if (!response.ok) {
        throw new Error("Failed to fetch caption examples");
      }
      const data = await response.json();

      if (append) {
        setExamples((prev) => [...prev, ...data.examples]);
      } else {
        setExamples(data.examples);
      }
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchExamples();
  }, [fetchExamples]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchExamples(examples.length, true);
    }
  };

  const handleCreated = (newExample: CaptionExampleData) => {
    setExamples((prev) => [newExample, ...prev]);
    setShowCreateModal(false);
  };

  const handleUpdated = (updatedExample: CaptionExampleData) => {
    setExamples((prev) =>
      prev.map((e) => (e.id === updatedExample.id ? updatedExample : e))
    );
    setEditingExample(null);
  };

  const handleDeleted = (id: number) => {
    setExamples((prev) => prev.filter((e) => e.id !== id));
    setDeletingExample(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => fetchExamples()}
          className="mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Create button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          {examples.length} caption example{examples.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Example
        </button>
      </div>

      {/* Examples list */}
      {examples.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground">No Caption Examples</h3>
          <p className="mt-1 text-muted">Add caption examples to help train the AI.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {examples.map((example) => (
            <div key={example.id} className="glass-card rounded-xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                      Priority: {example.priority}
                    </span>
                    <span className="text-xs text-muted">
                      #{example.id}
                    </span>
                  </div>

                  {/* Image Description */}
                  <div className="mb-3">
                    <p className="text-xs font-medium text-muted mb-1">Image Description</p>
                    <p className="text-sm text-foreground">{example.image_description}</p>
                  </div>

                  {/* Caption */}
                  <div className="mb-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30">
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">Caption</p>
                    <p className="text-sm text-foreground font-medium">{example.caption}</p>
                  </div>

                  {/* Explanation */}
                  <div className="mb-3">
                    <p className="text-xs font-medium text-muted mb-1">Explanation</p>
                    <p className="text-sm text-foreground">{example.explanation}</p>
                  </div>

                  {/* Linked Image */}
                  {example.images && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                      <span>Linked to image: {example.image_id?.slice(0, 8)}...</span>
                    </div>
                  )}

                  <p className="mt-3 text-xs text-muted">
                    Created {new Date(example.created_datetime_utc).toLocaleDateString()}
                    {example.modified_datetime_utc && (
                      <> &middot; Modified {new Date(example.modified_datetime_utc).toLocaleDateString()}</>
                    )}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setEditingExample(example)}
                    className="p-2 rounded-lg text-purple-600 hover:bg-purple-100 dark:text-purple-400 dark:hover:bg-purple-900/30 transition-colors"
                    title="Edit"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeletingExample(example)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                    title="Delete"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Load more button */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-2 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateCaptionExampleModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}

      {editingExample && (
        <EditCaptionExampleModal
          example={editingExample}
          onClose={() => setEditingExample(null)}
          onUpdated={handleUpdated}
        />
      )}

      {deletingExample && (
        <DeleteCaptionExampleModal
          example={deletingExample}
          onClose={() => setDeletingExample(null)}
          onDeleted={() => handleDeleted(deletingExample.id)}
        />
      )}
    </div>
  );
}
