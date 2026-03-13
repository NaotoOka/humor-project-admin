"use client";

import { useState, useEffect, useCallback } from "react";

interface HumorFlavorStep {
  id: number;
  order_by: number;
  description: string | null;
  llm_temperature: number | null;
  llm_system_prompt: string | null;
  llm_user_prompt: string | null;
  llm_models: {
    id: number;
    name: string;
    provider_model_id: string;
    llm_providers: {
      id: number;
      name: string;
    } | null;
  } | null;
  humor_flavor_step_types: {
    id: number;
    slug: string;
    description: string;
  } | null;
  llm_input_types: {
    id: number;
    slug: string;
    description: string;
  } | null;
  llm_output_types: {
    id: number;
    slug: string;
    description: string;
  } | null;
}

interface HumorFlavor {
  id: number;
  created_datetime_utc: string;
  description: string | null;
  slug: string;
  humor_flavor_steps: HumorFlavorStep[];
}

export function HumorFlavorsList() {
  const [flavors, setFlavors] = useState<HumorFlavor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFlavor, setExpandedFlavor] = useState<number | null>(null);

  const fetchFlavors = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/humor-flavors");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch humor flavors");
      }

      const { flavors: flavorsData } = await response.json();
      setFlavors(flavorsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load humor flavors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlavors();
  }, [fetchFlavors]);

  const toggleExpand = (flavorId: number) => {
    setExpandedFlavor(expandedFlavor === flavorId ? null : flavorId);
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
    <div className="space-y-4">
      {flavors.length === 0 ? (
        <div className="glass-card p-8 text-center text-muted rounded-xl">
          No humor flavors found.
        </div>
      ) : (
        flavors.map((flavor) => (
          <div key={flavor.id} className="glass-card rounded-xl overflow-hidden">
            {/* Flavor header */}
            <button
              onClick={() => toggleExpand(flavor.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-purple-500/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/10">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-foreground">{flavor.slug}</h3>
                  <p className="text-sm text-muted">{flavor.description || "No description"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  {flavor.humor_flavor_steps.length} steps
                </span>
                <svg
                  className={`w-5 h-5 text-muted transition-transform ${expandedFlavor === flavor.id ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Expanded steps */}
            {expandedFlavor === flavor.id && (
              <div className="border-t border-border">
                {flavor.humor_flavor_steps.length === 0 ? (
                  <div className="px-6 py-4 text-sm text-muted">
                    No steps configured for this flavor.
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {flavor.humor_flavor_steps.map((step, index) => (
                      <div key={step.id} className="px-6 py-4 bg-purple-500/5">
                        <div className="flex items-start gap-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 font-semibold text-sm flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-foreground">
                                {step.humor_flavor_step_types?.slug || "Unknown type"}
                              </span>
                              {step.llm_models && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                  {step.llm_models.name}
                                </span>
                              )}
                              {step.llm_temperature !== null && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                  Temp: {step.llm_temperature}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted mb-2">
                              {step.description || "No description"}
                            </p>
                            <div className="flex flex-wrap gap-2 text-xs">
                              {step.llm_input_types && (
                                <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                  Input: {step.llm_input_types.slug}
                                </span>
                              )}
                              {step.llm_output_types && (
                                <span className="px-2 py-1 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                  Output: {step.llm_output_types.slug}
                                </span>
                              )}
                            </div>
                            {/* Show prompts if available */}
                            {(step.llm_system_prompt || step.llm_user_prompt) && (
                              <details className="mt-3">
                                <summary className="text-xs text-muted cursor-pointer hover:text-foreground">
                                  View prompts
                                </summary>
                                <div className="mt-2 space-y-2">
                                  {step.llm_system_prompt && (
                                    <div>
                                      <p className="text-xs font-medium text-muted mb-1">System Prompt:</p>
                                      <pre className="text-xs p-2 rounded bg-slate-100 dark:bg-slate-800 overflow-x-auto whitespace-pre-wrap max-h-32">
                                        {step.llm_system_prompt}
                                      </pre>
                                    </div>
                                  )}
                                  {step.llm_user_prompt && (
                                    <div>
                                      <p className="text-xs font-medium text-muted mb-1">User Prompt:</p>
                                      <pre className="text-xs p-2 rounded bg-slate-100 dark:bg-slate-800 overflow-x-auto whitespace-pre-wrap max-h-32">
                                        {step.llm_user_prompt}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </details>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}

      {/* Footer */}
      <div className="text-sm text-muted">
        Total: {flavors.length} humor flavors
      </div>
    </div>
  );
}
