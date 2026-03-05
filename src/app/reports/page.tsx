import { createClient } from "@/lib/supabase/server";
import { AdminLayout } from "@/components/AdminLayout";
import type { Database } from "@/lib/supabase/database.types";

type ReportedCaption = Database["public"]["Tables"]["reported_captions"]["Row"];
type ReportedImage = Database["public"]["Tables"]["reported_images"]["Row"];

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch reported captions
  const { data: reportedCaptions, error: captionError } = await supabase
    .from("reported_captions")
    .select("*")
    .order("created_datetime_utc", { ascending: false })
    .limit(25) as { data: ReportedCaption[] | null; error: unknown };

  // Fetch reported images
  const { data: reportedImages } = await supabase
    .from("reported_images")
    .select("*")
    .order("created_datetime_utc", { ascending: false })
    .limit(25) as { data: ReportedImage[] | null; error: unknown };

  const totalReports = (reportedCaptions?.length || 0) + (reportedImages?.length || 0);

  return (
    <AdminLayout user={user}>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            <p className="mt-1 text-muted">
              Review and moderate reported content.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {totalReports} pending
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-100 p-2 text-red-600 dark:bg-red-900/30 dark:text-red-400">
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
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-muted">Total Reports</p>
                <p className="text-xl font-bold text-foreground">{totalReports}</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
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
              <div>
                <p className="text-sm text-muted">Caption Reports</p>
                <p className="text-xl font-bold text-foreground">
                  {reportedCaptions?.length || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
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
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-muted">Image Reports</p>
                <p className="text-xl font-bold text-foreground">
                  {reportedImages?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section header */}
        <h2 className="text-lg font-semibold text-foreground">
          Caption Reports ({reportedCaptions?.length || 0})
        </h2>

        {/* Reports list */}
        <div className="space-y-4">
          {captionError ? (
            <div className="glass-card rounded-xl p-8 text-center text-muted">
              Failed to load reports. Please try again.
            </div>
          ) : reportedCaptions && reportedCaptions.length > 0 ? (
            reportedCaptions.map((report) => (
              <div
                key={report.id}
                className="glass-card rounded-xl p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">
                          Caption Report #{report.id}
                        </h3>
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          Pending Review
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        Caption ID: {report.caption_id?.slice(0, 8) || "Unknown"}...
                      </p>
                      <div className="mt-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                        <p className="text-sm font-medium text-muted">Reason:</p>
                        <p className="mt-1 text-sm text-foreground">
                          {report.reason || "No reason provided"}
                        </p>
                      </div>
                      <p className="mt-3 text-xs text-muted">
                        Reported on{" "}
                        {report.created_datetime_utc
                          ? new Date(report.created_datetime_utc).toLocaleString()
                          : "Unknown date"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-card rounded-xl p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-foreground">
                All Clear!
              </h3>
              <p className="mt-1 text-muted">
                No caption reports to review at this time.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
