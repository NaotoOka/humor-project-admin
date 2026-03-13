import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminLayout } from "@/components/AdminLayout";
import { AccessControlManager } from "@/components/AccessControlManager";
import { redirect } from "next/navigation";

export default async function CampusControlPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const adminClient = createAdminClient();

    // Fetch University stats
    const { data: universities } = await supabase
        .from("universities")
        .select(`
      id,
      name,
      profiles:profile_university_mappings(count)
    `);

    // Fetch Dorm engagement (simulated join for high-level view)
    const { data: dorms } = await supabase
        .from("dorms")
        .select(`
      id,
      full_name,
      university:universities(name),
      members:profile_dorm_mappings(count)
    `)
        .limit(10);

    // Fetch Allowed Domains
    const { data: domains } = await adminClient
        .from("allowed_signup_domains")
        .select("*")
        .order("apex_domain");

    return (
        <AdminLayout user={user}>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5-10.5l-22.5 9.001" />
                        </svg>
                        Campus Control Center
                    </h1>
                    <p className="mt-2 text-muted">
                        Managing the educational theater. Monitor university clusters, dorm engagement, and email domain gatekeeping.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* University Clusters */}
                    <section className="lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <span className="h-2 w-2 bg-indigo-500 rounded-full"></span>
                            University Engagement
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {(universities as any)?.map((uni: any) => (
                                <div key={uni.id} className="glass-card p-6 flex items-center justify-between group hover:border-indigo-500/50 transition-all">
                                    <div>
                                        <p className="text-lg font-bold text-foreground">{uni.name}</p>
                                        <p className="text-xs text-muted uppercase tracking-widest font-bold mt-1">
                                            {uni.profiles?.[0]?.count || 0} Registered Subjects
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h2 className="text-xl font-semibold flex items-center gap-2 pt-4">
                            <span className="h-2 w-2 bg-amber-500 rounded-full"></span>
                            Top Dorm Activity
                        </h2>
                        <div className="glass-card overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-3 font-bold text-xs uppercase tracking-widest text-muted">Dorm / Residence</th>
                                        <th className="px-6 py-3 font-bold text-xs uppercase tracking-widest text-muted">University</th>
                                        <th className="px-6 py-3 font-bold text-xs uppercase tracking-widest text-muted">Subjects</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {(dorms as any)?.map((dorm: any) => (
                                        <tr key={dorm.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4 font-medium text-foreground">{dorm.full_name}</td>
                                            <td className="px-6 py-4 text-muted">{dorm.university?.name}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                                    {dorm.members?.[0]?.count || 0}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Access Control - Domains */}
                    <section>
                        <AccessControlManager
                            domains={domains || []}
                        />
                    </section>
                </div>
            </div>
        </AdminLayout>
    );
}
