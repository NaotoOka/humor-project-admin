import { createClient } from "@/lib/supabase/server";
import { AdminLayout } from "@/components/AdminLayout";
import type { Database } from "@/lib/supabase/database.types";

type Caption = Database["public"]["Tables"]["captions"]["Row"];

export default async function CaptionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch captions
  const { data: captions, error } = await supabase
    .from("captions")
    .select("*")
    .order("created_datetime_utc", { ascending: false })
    .limit(50) as { data: Caption[] | null; error: unknown };

  return (
    <AdminLayout user={user}>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Captions</h1>
          <p className="mt-1 text-muted">
            View AI-generated and user-created captions.
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="glass-card rounded-xl p-4">
            <p className="text-sm text-muted">Total Captions</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {captions?.length || 0}
            </p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <p className="text-sm text-muted">Public Captions</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {captions?.filter(c => c.is_public).length || 0}
            </p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <p className="text-sm text-muted">Featured</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {captions?.filter(c => c.is_featured).length || 0}
            </p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <p className="text-sm text-muted">Total Likes</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {captions?.reduce((sum, c) => sum + (c.like_count || 0), 0).toLocaleString() || 0}
            </p>
          </div>
        </div>

        {/* Captions table */}
        <div className="glass-card overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-purple-500/5">
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted">
                    Caption
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted">
                    Likes
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {error ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted">
                      Failed to load captions. Please try again.
                    </td>
                  </tr>
                ) : captions && captions.length > 0 ? (
                  captions.map((caption) => (
                    <tr
                      key={caption.id}
                      className="transition-colors hover:bg-purple-500/5"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                              />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm font-medium text-foreground">
                              {caption.content || "No content"}
                            </p>
                            <p className="mt-1 text-xs text-muted">
                              ID: {caption.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {caption.is_featured && (
                            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                              Featured
                            </span>
                          )}
                          {caption.is_public ? (
                            <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              Public
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              Private
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-foreground">
                          <svg
                            className="h-4 w-4 text-red-500"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                          </svg>
                          {caption.like_count || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted">
                        {caption.created_datetime_utc
                          ? new Date(caption.created_datetime_utc).toLocaleDateString()
                          : "Unknown"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted">
                      No captions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="border-t border-border px-6 py-4">
            <p className="text-sm text-muted">
              Showing {captions?.length || 0} captions
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
