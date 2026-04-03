"use client";

import { useState, useEffect, useCallback } from "react";
import { CreateLlmModelModal } from "./CreateLlmModelModal";
import { EditLlmModelModal } from "./EditLlmModelModal";
import { DeleteLlmModelModal } from "./DeleteLlmModelModal";

interface LlmProviderData {
  id: number;
  name: string;
}

interface LlmModelData {
  id: number;
  created_datetime_utc: string;
  name: string;
  llm_provider_id: number;
  provider_model_id: string;
  is_temperature_supported: boolean;
  llm_providers: LlmProviderData | null;
}

export function LlmModelsList() {
  const [models, setModels] = useState<LlmModelData[]>([]);
  const [providers, setProviders] = useState<LlmProviderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingModel, setEditingModel] = useState<LlmModelData | null>(null);
  const [deletingModel, setDeletingModel] = useState<LlmModelData | null>(null);

  const fetchModels = useCallback(async (offset = 0, append = false) => {
    if (offset === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const [modelsRes, providersRes] = await Promise.all([
        fetch(`/api/llm-models?offset=${offset}&limit=50`),
        offset === 0 ? fetch("/api/llm-providers") : Promise.resolve(null),
      ]);

      if (!modelsRes.ok) throw new Error("Failed to fetch LLM models");

      const modelsData = await modelsRes.json();

      if (append) {
        setModels((prev) => [...prev, ...modelsData.models]);
      } else {
        setModels(modelsData.models);
      }
      setHasMore(modelsData.hasMore);

      if (providersRes) {
        const providersData = await providersRes.json();
        setProviders(providersData.providers || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchModels(models.length, true);
    }
  };

  const handleCreated = (newModel: LlmModelData) => {
    setModels((prev) => [newModel, ...prev]);
    setShowCreateModal(false);
  };

  const handleUpdated = (updatedModel: LlmModelData) => {
    setModels((prev) =>
      prev.map((m) => (m.id === updatedModel.id ? updatedModel : m))
    );
    setEditingModel(null);
  };

  const handleDeleted = (id: number) => {
    setModels((prev) => prev.filter((m) => m.id !== id));
    setDeletingModel(null);
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
          onClick={() => fetchModels()}
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
          {models.length} model{models.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Model
        </button>
      </div>

      {/* Models list */}
      {models.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground">No LLM Models</h3>
          <p className="mt-1 text-muted">Add your first LLM model to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {models.map((model) => (
            <div key={model.id} className="glass-card rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{model.name}</h3>
                    {model.is_temperature_supported && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Temp
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
                    <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                      {model.llm_providers?.name || "Unknown Provider"}
                    </span>
                    <span className="text-xs">&middot;</span>
                    <span className="text-xs font-mono">{model.provider_model_id}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    ID: {model.id} &middot; Created {new Date(model.created_datetime_utc).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingModel(model)}
                    className="p-2 rounded-lg text-purple-600 hover:bg-purple-100 dark:text-purple-400 dark:hover:bg-purple-900/30 transition-colors"
                    title="Edit"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeletingModel(model)}
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
        <CreateLlmModelModal
          providers={providers}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}

      {editingModel && (
        <EditLlmModelModal
          model={editingModel}
          providers={providers}
          onClose={() => setEditingModel(null)}
          onUpdated={handleUpdated}
        />
      )}

      {deletingModel && (
        <DeleteLlmModelModal
          model={deletingModel}
          onClose={() => setDeletingModel(null)}
          onDeleted={() => handleDeleted(deletingModel.id)}
        />
      )}
    </div>
  );
}
