"use client";

import { useState, useEffect, useCallback } from "react";
import { CreateLlmProviderModal } from "./CreateLlmProviderModal";
import { EditLlmProviderModal } from "./EditLlmProviderModal";
import { DeleteLlmProviderModal } from "./DeleteLlmProviderModal";

interface LlmProviderData {
  id: number;
  created_datetime_utc: string;
  name: string;
}

export function LlmProvidersList() {
  const [providers, setProviders] = useState<LlmProviderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<LlmProviderData | null>(null);
  const [deletingProvider, setDeletingProvider] = useState<LlmProviderData | null>(null);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/llm-providers");
      if (!response.ok) {
        throw new Error("Failed to fetch LLM providers");
      }
      const data = await response.json();
      setProviders(data.providers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleCreated = (newProvider: LlmProviderData) => {
    setProviders((prev) => [...prev, newProvider].sort((a, b) => a.name.localeCompare(b.name)));
    setShowCreateModal(false);
  };

  const handleUpdated = (updatedProvider: LlmProviderData) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === updatedProvider.id ? updatedProvider : p)).sort((a, b) => a.name.localeCompare(b.name))
    );
    setEditingProvider(null);
  };

  const handleDeleted = (id: number) => {
    setProviders((prev) => prev.filter((p) => p.id !== id));
    setDeletingProvider(null);
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
          onClick={() => fetchProviders()}
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
          {providers.length} provider{providers.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Provider
        </button>
      </div>

      {/* Providers list */}
      {providers.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground">No LLM Providers</h3>
          <p className="mt-1 text-muted">Add your first LLM provider to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <div key={provider.id} className="glass-card rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-foreground">{provider.name}</h3>
                  <p className="mt-1 text-xs text-muted">
                    ID: {provider.id} &middot; Created {new Date(provider.created_datetime_utc).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingProvider(provider)}
                    className="p-2 rounded-lg text-purple-600 hover:bg-purple-100 dark:text-purple-400 dark:hover:bg-purple-900/30 transition-colors"
                    title="Edit"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeletingProvider(provider)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                    title="Delete"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateLlmProviderModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}

      {editingProvider && (
        <EditLlmProviderModal
          provider={editingProvider}
          onClose={() => setEditingProvider(null)}
          onUpdated={handleUpdated}
        />
      )}

      {deletingProvider && (
        <DeleteLlmProviderModal
          provider={deletingProvider}
          onClose={() => setDeletingProvider(null)}
          onDeleted={() => handleDeleted(deletingProvider.id)}
        />
      )}
    </div>
  );
}
