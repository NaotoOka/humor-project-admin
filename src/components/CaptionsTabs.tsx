"use client";

import { useState } from "react";
import { GeneratedCaptionsList } from "./GeneratedCaptionsList";
import { RatedCaptionsList } from "./RatedCaptionsList";

interface CaptionsTabsProps {
  initialTab?: "generated" | "rated";
}

export function CaptionsTabs({ initialTab = "generated" }: CaptionsTabsProps) {
  const [activeTab, setActiveTab] = useState<"generated" | "rated">(initialTab);

  return (
    <div className="space-y-6">
      {/* Tab buttons */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("generated")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === "generated"
              ? "text-purple-600 dark:text-purple-400"
              : "text-muted hover:text-foreground"
          }`}
        >
          Generated Captions
          {activeTab === "generated" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("rated")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === "rated"
              ? "text-purple-600 dark:text-purple-400"
              : "text-muted hover:text-foreground"
          }`}
        >
          Rated Captions
          {activeTab === "rated" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
          )}
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "generated" ? (
        <GeneratedCaptionsList />
      ) : (
        <RatedCaptionsList />
      )}
    </div>
  );
}
