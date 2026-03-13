"use client";

import { useState, useEffect, useCallback, Fragment } from "react";

interface HumorFlavorStep {
  id: number;
  created_datetime_utc: string;
  humor_flavor_id: number;
  llm_temperature: number | null;
  order_by: number;
  description: string | null;
  llm_system_prompt: string | null;
  llm_user_prompt: string | null;
  humor_flavors: {
    id: number;
    slug: string;
    description: string | null;
  } | null;
  llm_models: {
    id: number;
    name: string;
    provider_model_id: string;
    is_temperature_supported: boolean;
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

export function HumorStepsList() {
  const [steps, setSteps] = useState<HumorFlavorStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const fetchSteps = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/humor-flavor-steps");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch humor flavor steps");
      }

      const { steps: stepsData } = await response.json();
      setSteps(stepsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load humor flavor steps");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSteps();
  }, [fetchSteps]);

  // Group steps by flavor
  const stepsByFlavor = steps.reduce((acc, step) => {
    const flavorSlug = step.humor_flavors?.slug || "Unknown";
    if (!acc[flavorSlug]) {
      acc[flavorSlug] = [];
    }
    acc[flavorSlug].push(step);
    return acc;
  }, {} as Record<string, HumorFlavorStep[]>);

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
    <div className="glass-card overflow-hidden rounded-xl">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-purple-500/5">
              <th className="px-6 py-4 text-left text-sm font-medium text-muted">Order</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-muted">Flavor</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-muted">Type</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-muted">Model</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-muted">I/O Types</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-muted">Temperature</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-muted">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {steps.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-muted">
                  No humor flavor steps found.
                </td>
              </tr>
            ) : (
              steps.map((step) => (
                <Fragment key={step.id}>
                  <tr className="transition-colors hover:bg-purple-500/5">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 font-semibold text-sm">
                        {step.order_by}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-sm font-medium rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        {step.humor_flavors?.slug || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {step.humor_flavor_step_types?.slug || "Unknown"}
                        </p>
                        <p className="text-xs text-muted mt-0.5">
                          {step.description || step.humor_flavor_step_types?.description || "-"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {step.llm_models ? (
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {step.llm_models.name}
                          </p>
                          <p className="text-xs text-muted mt-0.5">
                            {step.llm_models.llm_providers?.name || "Unknown provider"}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-muted">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {step.llm_input_types && (
                          <span className="inline-flex px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 w-fit">
                            In: {step.llm_input_types.slug}
                          </span>
                        )}
                        {step.llm_output_types && (
                          <span className="inline-flex px-2 py-0.5 text-xs rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 w-fit">
                            Out: {step.llm_output_types.slug}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {step.llm_temperature !== null ? (
                        <span className="px-2 py-1 text-sm rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          {step.llm_temperature}
                        </span>
                      ) : (
                        <span className="text-sm text-muted">Default</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-colors"
                      >
                        {expandedStep === step.id ? "Hide" : "View"} Prompts
                        <svg
                          className={`w-3.5 h-3.5 transition-transform ${expandedStep === step.id ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  {expandedStep === step.id && (
                    <tr key={`${step.id}-expanded`}>
                      <td colSpan={7} className="px-6 py-4 bg-purple-500/5">
                        <div className="space-y-4">
                          {step.llm_system_prompt && (
                            <div>
                              <p className="text-sm font-medium text-foreground mb-2">System Prompt:</p>
                              <pre className="text-sm p-4 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-x-auto whitespace-pre-wrap max-h-48">
                                {step.llm_system_prompt}
                              </pre>
                            </div>
                          )}
                          {step.llm_user_prompt && (
                            <div>
                              <p className="text-sm font-medium text-foreground mb-2">User Prompt:</p>
                              <pre className="text-sm p-4 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-x-auto whitespace-pre-wrap max-h-48">
                                {step.llm_user_prompt}
                              </pre>
                            </div>
                          )}
                          {!step.llm_system_prompt && !step.llm_user_prompt && (
                            <p className="text-sm text-muted">No prompts configured for this step.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-border px-6 py-4">
        <p className="text-sm text-muted">
          Total: {steps.length} steps across {Object.keys(stepsByFlavor).length} flavors
        </p>
      </div>
    </div>
  );
}
