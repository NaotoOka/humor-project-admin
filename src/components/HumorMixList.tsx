"use client";

import { useState, useEffect, useCallback } from "react";

interface HumorMixEntry {
  id: number;
  created_datetime_utc: string;
  humor_flavor_id: number;
  caption_count: number;
  humor_flavors: {
    id: number;
    slug: string;
    description: string | null;
  } | null;
}

export function HumorMixList() {
  const [mix, setMix] = useState<HumorMixEntry[]>([]);
  const [totalCaptionCount, setTotalCaptionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const fetchMix = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/humor-mix");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch humor mix");
      }

      const { mix: mixData, totalCaptionCount: total } = await response.json();
      setMix(mixData);
      setTotalCaptionCount(total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load humor mix");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMix();
  }, [fetchMix]);

  const startEditing = (entry: HumorMixEntry) => {
    setEditingId(entry.id);
    setEditValue(entry.caption_count.toString());
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEdit = async (id: number) => {
    const newCount = parseInt(editValue, 10);
    if (isNaN(newCount) || newCount < 0) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/humor-mix", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, caption_count: newCount }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update");
      }

      const { mix: updatedEntry } = await response.json();

      // Update local state
      setMix((prev) =>
        prev.map((m) => (m.id === id ? updatedEntry : m))
      );

      // Recalculate total
      setTotalCaptionCount((prev) => {
        const oldEntry = mix.find((m) => m.id === id);
        const oldCount = oldEntry?.caption_count || 0;
        return prev - oldCount + newCount;
      });

      setEditingId(null);
      setEditValue("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const getPercentage = (count: number) => {
    if (totalCaptionCount === 0) return "0";
    return ((count / totalCaptionCount) * 100).toFixed(1);
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
    <div className="space-y-6">
      {/* Visual mix representation */}
      <div className="glass-card p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-foreground mb-4">Caption Mix Distribution</h3>
        <div className="flex h-8 rounded-lg overflow-hidden">
          {mix.map((entry, index) => {
            const percentage = parseFloat(getPercentage(entry.caption_count));
            if (percentage === 0) return null;

            const colors = [
              "bg-purple-500",
              "bg-blue-500",
              "bg-green-500",
              "bg-amber-500",
              "bg-pink-500",
              "bg-cyan-500",
              "bg-red-500",
              "bg-indigo-500",
            ];
            const color = colors[index % colors.length];

            return (
              <div
                key={entry.id}
                className={`${color} flex items-center justify-center text-white text-xs font-medium`}
                style={{ width: `${percentage}%` }}
                title={`${entry.humor_flavors?.slug}: ${percentage}%`}
              >
                {percentage >= 8 && entry.humor_flavors?.slug}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-4 mt-4">
          {mix.map((entry, index) => {
            const colors = [
              "bg-purple-500",
              "bg-blue-500",
              "bg-green-500",
              "bg-amber-500",
              "bg-pink-500",
              "bg-cyan-500",
              "bg-red-500",
              "bg-indigo-500",
            ];
            const color = colors[index % colors.length];

            return (
              <div key={entry.id} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <span className="text-sm text-muted">
                  {entry.humor_flavors?.slug}: {getPercentage(entry.caption_count)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-purple-500/5">
                <th className="px-6 py-4 text-left text-sm font-medium text-muted">Flavor</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted">Description</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-muted">Caption Count</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-muted">Percentage</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mix.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted">
                    No humor mix entries found.
                  </td>
                </tr>
              ) : (
                mix.map((entry) => (
                  <tr key={entry.id} className="transition-colors hover:bg-purple-500/5">
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-sm font-medium rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        {entry.humor_flavors?.slug || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {entry.humor_flavors?.description || "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {editingId === entry.id ? (
                        <input
                          type="number"
                          min="0"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-20 px-2 py-1 text-center text-sm rounded-lg border border-border bg-background focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="text-sm font-medium text-foreground">
                          {entry.caption_count}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 transition-all"
                            style={{ width: `${getPercentage(entry.caption_count)}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted w-12">
                          {getPercentage(entry.caption_count)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editingId === entry.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => saveEdit(entry.id)}
                            disabled={saving}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                          >
                            {saving ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={saving}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-500/10 text-slate-600 dark:text-slate-400 hover:bg-slate-500/20 transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(entry)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-muted">
            Total: {mix.length} entries
          </p>
          <p className="text-sm font-medium text-foreground">
            Total Captions: {totalCaptionCount}
          </p>
        </div>
      </div>
    </div>
  );
}
