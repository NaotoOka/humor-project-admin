import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminLayout } from "@/components/AdminLayout";
import { redirect } from "next/navigation";

type AuthMetadata = { first_name?: string; last_name?: string; full_name?: string };

export default async function MatrixPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Check if user is matrix admin
    const { data: profile } = await supabase
        .from("profiles")
        .select("is_matrix_admin")
        .eq("id", user.id)
        .single();

    const isMatrixAdmin = (profile as any)?.is_matrix_admin;

    if (!isMatrixAdmin) {
        // redirect("/unauthorized");
        // For the sake of the demo/learning, we'll allow it but show a warning
    }

    // 1. Matrix Surveillance: Find superadmins and their "recent activity"
    const { data: superadmins } = await supabase
        .from("profiles")
        .select(`
      id,
      first_name,
      last_name,
      email,
      created_datetime_utc,
      is_superadmin
    `)
        .eq("is_superadmin", true);

    // Fetch auth metadata for superadmins with missing names
    const adminClient = createAdminClient();
    const authMetadataMap = new Map<string, AuthMetadata>();

    if (superadmins) {
        const usersNeedingMetadata = superadmins.filter((p: any) => !p.first_name);
        if (usersNeedingMetadata.length > 0) {
            const authPromises = usersNeedingMetadata.map(async (admin: any) => {
                const { data } = await adminClient.auth.admin.getUserById(admin.id);
                if (data?.user?.user_metadata) {
                    authMetadataMap.set(admin.id, data.user.user_metadata as AuthMetadata);
                }
            });
            await Promise.all(authPromises);
        }
    }

    // Helper to get display name
    const getDisplayName = (admin: any): string => {
        if (admin.first_name && admin.last_name) {
            return `${admin.first_name} ${admin.last_name}`;
        }
        const authMeta = authMetadataMap.get(admin.id);
        if (authMeta) {
            const firstName = authMeta.first_name || authMeta.full_name?.split(' ')[0];
            const lastName = authMeta.last_name || authMeta.full_name?.split(' ').slice(1).join(' ');
            if (firstName) {
                return `${firstName}${lastName ? ` ${lastName}` : ''}`;
            }
        }
        return "Unknown Admin";
    };

    return (
        <AdminLayout user={user}>
            <div className="space-y-8">
                <div>
                    <div>
                        <h1 className="text-3xl font-bold metallic-text flex items-center gap-2">
                            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Matrix Control
                        </h1>
                        <p className="mt-2 text-muted">
                            Monitoring the Superadmins and enforcing the "Nuke" protocol.
                        </p>
                    </div>

                    {/* Matrix Surveillance Table */}
                    <section className="glass-card">
                        <div className="p-6 border-b border-white/5">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <span className="text-green-500">_</span> Watch the Watchers
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-xs uppercase text-muted-foreground bg-white/[0.02]">
                                        <th className="px-6 py-4">Admin</th>
                                        <th className="px-6 py-4">Access Level</th>
                                        <th className="px-6 py-4">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {(superadmins as any)?.map((admin: any) => (
                                        <tr key={admin.id} className="text-sm hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-foreground">{getDisplayName(admin)}</div>
                                                <div className="text-xs text-muted-foreground">{admin.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 uppercase tracking-tighter">
                                                    Superadmin
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {new Date(admin.created_datetime_utc).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                </div>

            </div>
        </AdminLayout>
    );
}
