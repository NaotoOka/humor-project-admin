"use client";

import { useState, useEffect, useMemo } from "react";
import type {
  HumorFlavorPerformance as HumorFlavorPerformanceData,
  ConfidenceLevel,
} from "@/app/api/statistics/humor-flavor-performance/route";

type SortKey = "totalVotes" | "votesPerCaption";
type SortDirection = "asc" | "desc";
type ViewMode = "most_active" | "most_engaging";

// Minimum votes to highlight top 3
const MIN_VOTES_FOR_HIGHLIGHT = 10;
// Minimum votes to show chart
const MIN_VOTES_FOR_CHART = 5;

const CONFIDENCE_BADGES: Record<ConfidenceLevel, { label: string; className: string }> = {
  low: {
    label: "Low",
    className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  },
  medium: {
    label: "Medium",
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  high: {
    label: "High",
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
};

const STATUS_BADGES: Record<HumorFlavorPerformanceData["status"], { label: string; className: string }> = {
  high_activity_low_quality: {
    label: "High Activity, Low Quality",
    className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  promising_underexposed: {
    label: "Promising",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  needs_review: {
    label: "Needs Review",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  normal: {
    label: "",
    className: "",
  },
};

interface BarChartProps {
  data: { label: string; value: number }[];
  title: string;
}

function MiniBarChart({ data, title }: BarChartProps) {
  const meaningfulData = data.filter((d) => d.value >= MIN_VOTES_FOR_CHART);

  if (meaningfulData.length === 0) {
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted">{title}</h4>
        <p className="text-xs text-muted italic py-4">Not enough data to display chart</p>
      </div>
    );
  }

  const maxValue = Math.max(...meaningfulData.map((d) => d.value));

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted">{title}</h4>
      <div className="space-y-1.5">
        {meaningfulData.slice(0, 6).map((item, index) => (
          <div key={item.label} className="flex items-center gap-2 text-xs">
            <span className="w-32 truncate text-muted" title={item.label}>
              {item.label}
            </span>
            <div className="flex-1 h-5 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
              <div
                className={`h-full transition-all ${
                  index < 3 ? "bg-purple-500" : "bg-purple-300 dark:bg-purple-700"
                }`}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
            <span className="w-12 text-right text-foreground font-mono text-xs">
              {item.value < 1 ? item.value.toFixed(2) : item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HumorFlavorPerformance() {
  const [data, setData] = useState<HumorFlavorPerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAnyData, setHasAnyData] = useState(false);
  const [hasAnyMeaningfulData, setHasAnyMeaningfulData] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("totalVotes");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("most_active");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/statistics/humor-flavor-performance");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      setData(result.data || []);
      setHasAnyData(result.hasAnyData || false);
      setHasAnyMeaningfulData(result.hasAnyMeaningfulData || false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode === "most_active") {
      setSortKey("totalVotes");
    } else {
      setSortKey("votesPerCaption");
    }
    setSortDirection("desc");
  };

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let aVal: number;
      let bVal: number;

      if (sortKey === "votesPerCaption") {
        // Sort by votesPerCaption, with nulls at the end
        aVal = a.votesPerCaption ?? -Infinity;
        bVal = b.votesPerCaption ?? -Infinity;
      } else {
        aVal = a.totalVotes;
        bVal = b.totalVotes;
      }

      const modifier = sortDirection === "desc" ? -1 : 1;
      return (aVal - bVal) * modifier;
    });
  }, [data, sortKey, sortDirection]);

  // Check if we should highlight top 3 (only if top item has enough votes)
  const shouldHighlightTop3 = useMemo(() => {
    if (sortedData.length === 0) return false;
    return sortedData[0].totalVotes >= MIN_VOTES_FOR_HIGHLIGHT;
  }, [sortedData]);

  const chartDataByVotes = useMemo(() => {
    return [...data]
      .filter((f) => f.totalVotes > 0)
      .sort((a, b) => b.totalVotes - a.totalVotes)
      .map((f) => ({ label: f.slug, value: f.totalVotes }));
  }, [data]);

  const chartDataByEngagement = useMemo(() => {
    return [...data]
      .filter((f) => f.votesPerCaption !== null && f.votesPerCaption > 0)
      .sort((a, b) => (b.votesPerCaption ?? 0) - (a.votesPerCaption ?? 0))
      .map((f) => ({ label: f.slug, value: f.votesPerCaption ?? 0 }));
  }, [data]);

  const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
      onClick={() => handleSort(sortKeyName)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortKey === sortKeyName && (
          <span className="text-purple-500">{sortDirection === "desc" ? "↓" : "↑"}</span>
        )}
      </div>
    </th>
  );

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="text-red-500 flex items-center gap-2">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Humor Flavor Performance</h2>
        <p className="text-sm text-muted mt-1">
          Caption rating analytics grouped by humor flavor
        </p>
      </div>

      {/* View Mode Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => handleViewModeChange("most_active")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            viewMode === "most_active"
              ? "border-purple-500 text-purple-500"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          Most Active
        </button>
        <button
          onClick={() => handleViewModeChange("most_engaging")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            viewMode === "most_engaging"
              ? "border-purple-500 text-purple-500"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          Most Engaging
        </button>
      </div>

      {/* Chart - only show one based on view mode */}
      <div className="py-2">
        {viewMode === "most_active" ? (
          <MiniBarChart data={chartDataByVotes} title="Total Votes by Flavor" />
        ) : (
          <MiniBarChart data={chartDataByEngagement} title="Votes per Caption by Flavor" />
        )}
      </div>

      {/* Empty State */}
      {!hasAnyData ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-foreground">No data available</h3>
          <p className="mt-2 text-sm text-muted">
            No humor flavors have captions or votes yet.
          </p>
        </div>
      ) : !hasAnyMeaningfulData ? (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Limited data available
              </h4>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                No humor flavors have enough engagement yet. Metrics will become meaningful once flavors receive at least 5 votes.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Table */}
      {hasAnyData && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                  Humor Flavor
                </th>
                <SortHeader label="Total Votes" sortKeyName="totalVotes" />
                <SortHeader label="Votes/Caption" sortKeyName="votesPerCaption" />
                <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                  Avg Rating
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedData.map((flavor, index) => {
                const isTopThree = shouldHighlightTop3 && index < 3;
                const isLowData = flavor.confidence === "low";

                return (
                  <tr
                    key={flavor.id}
                    className={`hover:bg-purple-500/5 transition-colors ${
                      isTopThree ? "bg-purple-500/5" : ""
                    }`}
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {isTopThree ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 text-white text-xs font-bold">
                          {index + 1}
                        </span>
                      ) : (
                        <span className="text-muted">{index + 1}</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{flavor.slug}</span>
                        <span className="text-xs text-muted">
                          {flavor.totalCaptions} caption{flavor.totalCaptions !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col">
                        <span className="text-foreground font-medium">
                          {flavor.totalVotes.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted">
                          +{flavor.totalUpvotes} / -{flavor.totalDownvotes}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {isLowData ? (
                        <span className="text-muted italic">Low data</span>
                      ) : (
                        <span className="text-foreground">
                          {flavor.votesPerCaption?.toFixed(2) ?? "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {isLowData ? (
                        <span className="text-muted italic">Low data</span>
                      ) : (
                        <span
                          className={
                            flavor.avgRating !== null && flavor.avgRating > 0.3
                              ? "text-green-600 dark:text-green-400 font-medium"
                              : flavor.avgRating !== null && flavor.avgRating < -0.1
                              ? "text-red-600 dark:text-red-400 font-medium"
                              : "text-foreground"
                          }
                        >
                          {flavor.avgRating !== null ? flavor.avgRating.toFixed(2) : "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          CONFIDENCE_BADGES[flavor.confidence].className
                        }`}
                      >
                        {CONFIDENCE_BADGES[flavor.confidence].label}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {flavor.status !== "normal" && (
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            STATUS_BADGES[flavor.status].className
                          }`}
                        >
                          {STATUS_BADGES[flavor.status].label}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend - only show if there's meaningful data */}
      {hasAnyMeaningfulData && (
        <div className="flex flex-wrap gap-4 pt-4 border-t border-border text-xs text-muted">
          <div className="flex items-center gap-2">
            <span className="font-medium">Confidence:</span>
            <span className={`px-2 py-0.5 rounded-full ${CONFIDENCE_BADGES.low.className}`}>Low</span>
            <span>{"<"}5 votes</span>
            <span className={`px-2 py-0.5 rounded-full ${CONFIDENCE_BADGES.medium.className}`}>Medium</span>
            <span>5-19 votes</span>
            <span className={`px-2 py-0.5 rounded-full ${CONFIDENCE_BADGES.high.className}`}>High</span>
            <span>20+ votes</span>
          </div>
        </div>
      )}
    </div>
  );
}
