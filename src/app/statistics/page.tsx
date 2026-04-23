import { createClient } from "@/lib/supabase/server";
import { AdminLayout } from "@/components/AdminLayout";
import { HumorFlavorPerformance } from "@/components/HumorFlavorPerformance";

export default async function StatisticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AdminLayout user={user}>
      <div className="space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Statistics</h1>
          <p className="mt-1 text-muted">
            Analytics and insights on caption performance and user engagement.
          </p>
        </div>

        {/* Humor Flavor Performance Dashboard */}
        <HumorFlavorPerformance />
      </div>
    </AdminLayout>
  );
}
