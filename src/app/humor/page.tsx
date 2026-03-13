import { createClient } from "@/lib/supabase/server";
import { AdminLayout } from "@/components/AdminLayout";
import { HumorTabs } from "@/components/HumorTabs";

export default async function HumorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AdminLayout user={user}>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Humor Settings</h1>
          <p className="mt-1 text-muted">
            View and configure humor flavors, generation steps, and caption mix ratios.
          </p>
        </div>

        {/* Tabs */}
        <HumorTabs />
      </div>
    </AdminLayout>
  );
}
