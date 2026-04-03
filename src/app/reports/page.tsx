import { createClient } from "@/lib/supabase/server";
import { AdminLayout } from "@/components/AdminLayout";
import { ReportsTabs } from "@/components/ReportsTabs";
import type { Database } from "@/lib/supabase/database.types";

type ReportedCaption = Database["public"]["Tables"]["reported_captions"]["Row"];
type ReportedImage = Database["public"]["Tables"]["reported_images"]["Row"];
type BugReport = Database["public"]["Tables"]["bug_reports"]["Row"];

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

  // Fetch bug reports
  const { data: bugReports, error: bugError } = await supabase
    .from("bug_reports")
    .select("*")
    .order("created_datetime_utc", { ascending: false })
    .limit(50) as { data: BugReport[] | null; error: unknown };

  const totalReports =
    (reportedCaptions?.length || 0) +
    (reportedImages?.length || 0) +
    (bugReports?.length || 0);

  return (
    <AdminLayout user={user}>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            <p className="mt-1 text-muted">
              Review and moderate reported content and bug reports.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {totalReports} pending
            </span>
          </div>
        </div>

        <ReportsTabs
          reportedCaptions={reportedCaptions}
          reportedImages={reportedImages}
          bugReports={bugReports}
          captionError={!!captionError}
          bugError={!!bugError}
        />
      </div>
    </AdminLayout>
  );
}
