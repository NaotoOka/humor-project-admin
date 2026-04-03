"use client";

import { useState, useEffect, useCallback } from "react";

interface LlmPromptChainData {
  id: number;
  created_datetime_utc: string;
  caption_request_id: number;
  caption_requests: {
    id: number;
    profile_id: string;
    image_id: string;
    created_datetime_utc: string;
  } | null;
  llm_model_responses: Array<{
    id: string;
    llm_model_response: string | null;
    processing_time_seconds: number;
    llm_temperature: number | null;
    llm_system_prompt: string;
    llm_user_prompt: string;
    llm_models: {
      id: number;
      name: string;
      llm_providers: { id: number; name: string } | null;
    } | null;
    humor_flavors: {
      id: number;
      slug: string;
      description: string | null;
    } | null;
  }>;
}

export function LlmPromptChainsList() {
  const [chains, setChains] = useState<LlmPromptChainData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [expandedChain, setExpandedChain] = useState<number | null>(null);

  const fetchChains = useCallback(async (offset = 0, append = false) => {
    if (offset === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const response = await fetch(`/api/llm-prompt-chains?offset=${offset}&limit=25`);
      if (!response.ok) throw new Error("Failed to fetch prompt chains");

      const data = await response.json();

      if (append) {
        setChains((prev) => [...prev, ...data.chains]);
      } else {
        setChains(data.chains);
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
    fetchChains();
  }, [fetchChains]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchChains(chains.length, true);
    }
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
          onClick={() => fetchChains()}
          className="mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        {chains.length} prompt chain{chains.length !== 1 ? "s" : ""}
      </p>

      {chains.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground">No Prompt Chains</h3>
          <p className="mt-1 text-muted">Prompt chains will appear here when captions are generated.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {chains.map((chain) => (
            <div key={chain.id} className="glass-card rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedChain(expandedChain === chain.id ? null : chain.id)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">Chain #{chain.id}</span>
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                      {chain.llm_model_responses?.length || 0} responses
                    </span>
                  </div>
                  <p className="text-sm text-muted mt-1">
                    Request #{chain.caption_request_id} &middot; {new Date(chain.created_datetime_utc).toLocaleString()}
                  </p>
                </div>
                <svg
                  className={`h-5 w-5 text-muted transition-transform ${expandedChain === chain.id ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {expandedChain === chain.id && (
                <div className="border-t border-border p-4 space-y-3">
                  {chain.llm_model_responses?.length > 0 ? (
                    chain.llm_model_responses.map((response, idx) => (
                      <div key={response.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted">Step {idx + 1}</span>
                            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                              {response.llm_models?.name || "Unknown Model"}
                            </span>
                            {response.humor_flavors && (
                              <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                {response.humor_flavors.slug}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted">
                            {response.processing_time_seconds.toFixed(2)}s
                          </span>
                        </div>
                        {response.llm_model_response && (
                          <p className="text-sm text-foreground line-clamp-3">{response.llm_model_response}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted">No responses in this chain.</p>
                  )}
                </div>
              )}
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
    </div>
  );
}
