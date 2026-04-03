"use client";

import { useState } from "react";
import { LlmProvidersList } from "./LlmProvidersList";
import { LlmModelsList } from "./LlmModelsList";
import { LlmPromptChainsList } from "./LlmPromptChainsList";
import { LlmResponsesList } from "./LlmResponsesList";

type TabType = "providers" | "models" | "chains" | "responses";

interface LlmTabsProps {
  initialTab?: TabType;
}

export function LlmTabs({ initialTab = "providers" }: LlmTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const tabs: { id: TabType; label: string }[] = [
    { id: "providers", label: "Providers" },
    { id: "models", label: "Models" },
    { id: "chains", label: "Prompt Chains" },
    { id: "responses", label: "Responses" },
  ];

  return (
    <div className="space-y-6">
      {/* Tab buttons */}
      <div className="flex gap-2 border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === tab.id
                ? "text-purple-600 dark:text-purple-400"
                : "text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "providers" && <LlmProvidersList />}
      {activeTab === "models" && <LlmModelsList />}
      {activeTab === "chains" && <LlmPromptChainsList />}
      {activeTab === "responses" && <LlmResponsesList />}
    </div>
  );
}
