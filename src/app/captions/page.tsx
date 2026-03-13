import { createClient } from "@/lib/supabase/server";
import { AdminLayout } from "@/components/AdminLayout";
import { CaptionsTabs } from "@/components/CaptionsTabs";

export default async function CaptionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AdminLayout user={user}>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Captions</h1>
          <p className="mt-1 text-muted">
            View and manage AI-generated and user-created captions.
          </p>
        </div>

        {/* Tabs */}
        <CaptionsTabs />
      </div>
    </AdminLayout>
  );
}
