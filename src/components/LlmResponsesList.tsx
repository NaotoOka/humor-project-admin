"use client";

import { useState, useEffect, useCallback } from "react";

interface LlmResponseData {
  id: string;
  created_datetime_utc: string;
  llm_model_response: string | null;
  processing_time_seconds: number;
  llm_model_id: number;
  profile_id: string;
  caption_request_id: number;
  llm_system_prompt: string;
  llm_user_prompt: string;
  llm_temperature: number | null;
  humor_flavor_id: number;
  llm_prompt_chain_id: number | null;
  humor_flavor_step_id: number | null;
  requesterName: string;
  llm_models: {
    id: number;
    name: string;
    provider_model_id: string;
    llm_providers: { id: number; name: string } | null;
  } | null;
  humor_flavors: {
    id: number;
    slug: string;
    description: string | null;
  } | null;
  humor_flavor_steps: {
    id: number;
    description: string | null;
    order_by: number;
  } | null;
}

export function LlmResponsesList() {
  const [responses, setResponses] = useState<LlmResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [expandedResponse, setExpandedResponse] = useState<string | null>(null);

  const fetchResponses = useCallback(async (offset = 0, append = false) => {
    if (offset === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const response = await fetch(`/api/llm-responses?offset=${offset}&limit=25`);
      if (!response.ok) throw new Error("Failed to fetch LLM responses");

      const data = await response.json();

      if (append) {
        setResponses((prev) => [...prev, ...data.responses]);
      } else {
        setResponses(data.responses);
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
    fetchResponses();
  }, [fetchResponses]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchResponses(responses.length, true);
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
          onClick={() => fetchResponses()}
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
        {responses.length} response{responses.length !== 1 ? "s" : ""}
      </p>

      {responses.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground">No LLM Responses</h3>
          <p className="mt-1 text-muted">Responses will appear here when captions are generated.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {responses.map((resp) => (
            <div key={resp.id} className="glass-card rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedResponse(expandedResponse === resp.id ? null : resp.id)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {resp.llm_models?.name || "Unknown Model"}
                    </span>
                    {resp.humor_flavors && (
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        {resp.humor_flavors.slug}
                      </span>
                    )}
                    {resp.humor_flavor_steps && (
                      <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Step {resp.humor_flavor_steps.order_by}
                      </span>
                    )}
                    <span className="text-xs text-muted">
                      {resp.processing_time_seconds.toFixed(2)}s
                    </span>
                  </div>
                  <p className="text-sm text-foreground mt-2 line-clamp-2">
                    {resp.llm_model_response || "No response content"}
                  </p>
                  <p className="text-xs text-muted mt-2">
                    By {resp.requesterName} &middot; {new Date(resp.created_datetime_utc).toLocaleString()}
                  </p>
                </div>
                <svg
                  className={`h-5 w-5 text-muted transition-transform flex-shrink-0 ml-4 ${expandedResponse === resp.id ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {expandedResponse === resp.id && (
                <div className="border-t border-border p-4 space-y-4">
                  {/* Response */}
                  <div>
                    <p className="text-xs font-medium text-muted mb-1">Response</p>
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30">
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {resp.llm_model_response || "No response"}
                      </p>
                    </div>
                  </div>

                  {/* System Prompt */}
                  <div>
                    <p className="text-xs font-medium text-muted mb-1">System Prompt</p>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-border max-h-40 overflow-y-auto">
                      <p className="text-xs text-foreground whitespace-pre-wrap font-mono">
                        {resp.llm_system_prompt}
                      </p>
                    </div>
                  </div>

                  {/* User Prompt */}
                  <div>
                    <p className="text-xs font-medium text-muted mb-1">User Prompt</p>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-border max-h-40 overflow-y-auto">
                      <p className="text-xs text-foreground whitespace-pre-wrap font-mono">
                        {resp.llm_user_prompt}
                      </p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-4 text-xs text-muted">
                    <span>Temperature: {resp.llm_temperature ?? "N/A"}</span>
                    <span>Request ID: {resp.caption_request_id}</span>
                    {resp.llm_prompt_chain_id && <span>Chain ID: {resp.llm_prompt_chain_id}</span>}
                    <span>Provider: {resp.llm_models?.llm_providers?.name || "Unknown"}</span>
                  </div>
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
