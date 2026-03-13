"use client";

import { useState } from "react";
import { HumorFlavorsList } from "./HumorFlavorsList";
import { HumorStepsList } from "./HumorStepsList";
import { HumorMixList } from "./HumorMixList";

type TabType = "flavors" | "steps" | "mix";

interface HumorTabsProps {
  initialTab?: TabType;
}

export function HumorTabs({ initialTab = "flavors" }: HumorTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const tabs: { id: TabType; label: string }[] = [
    { id: "flavors", label: "Flavors" },
    { id: "steps", label: "Steps" },
    { id: "mix", label: "Mix" },
  ];

  return (
    <div className="space-y-6">
      {/* Tab buttons */}
      <div className="flex gap-2 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
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
      {activeTab === "flavors" && <HumorFlavorsList />}
      {activeTab === "steps" && <HumorStepsList />}
      {activeTab === "mix" && <HumorMixList />}
    </div>
  );
}
