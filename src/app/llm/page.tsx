import { createClient } from "@/lib/supabase/server";
import { AdminLayout } from "@/components/AdminLayout";
import { LlmTabs } from "@/components/LlmTabs";

export default async function LlmPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AdminLayout user={user}>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">LLM Management</h1>
          <p className="mt-1 text-muted">
            Manage LLM providers, models, and view prompt chains and responses.
          </p>
        </div>

        {/* Tabs */}
        <LlmTabs />
      </div>
    </AdminLayout>
  );
}
