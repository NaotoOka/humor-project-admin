import { createClient } from "@/lib/supabase/server";
import { AdminLayout } from "@/components/AdminLayout";
import { redirect } from "next/navigation";

export default async function PropagandaPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch news snippets
    const { data: news } = await supabase
        .from("news_snippets")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

    // Fetch community contexts
    const { data: contexts } = await supabase
        .from("community_contexts")
        .select(`
      *,
      community:communities(name)
    `)
        .order("created_datetime_utc", { ascending: false })
        .limit(10);

    return (
        <AdminLayout user={user}>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                        </svg>
                        Propaganda Workshop
                    </h1>
                    <p className="mt-2 text-muted">
                        Shape the collective narrative. Feed topical news and community contexts directly into the AI caption engine.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* News Injector */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <span className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></span>
                                News Injector
                            </h2>
                        </div>

                        <div className="glass-card divide-y divide-white/5">
                            {news?.map((item) => (
                                <div key={item.id} className="p-4 hover:bg-white/[0.02] transition-colors group">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-foreground truncate">{item.headline}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 uppercase font-bold tracking-tighter">
                                                    {item.category}
                                                </span>
                                                <span className="text-[10px] text-muted">
                                                    Priority {item.priority}/10
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!news || news.length === 0) && (
                                <div className="p-8 text-center text-muted text-sm italic">
                                    No active news propaganda. The narrative is empty.
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Context Scheduler */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <span className="h-2 w-2 bg-purple-500 rounded-full animate-pulse"></span>
                                Context Scheduler
                            </h2>
                        </div>

                        <div className="glass-card divide-y divide-white/5">
                            {contexts?.map((context: any) => (
                                <div key={context.id} className="p-4 hover:bg-white/[0.02] transition-colors group">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20 uppercase font-bold tracking-tighter">
                                                    {context.community?.name || "Global"}
                                                </span>
                                                <span className="text-[10px] text-muted">
                                                    ID: {context.id}
                                                </span>
                                            </div>
                                            <p className="text-sm text-foreground line-clamp-2 leading-relaxed">
                                                {context.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!contexts || contexts.length === 0) && (
                                <div className="p-8 text-center text-muted text-sm italic">
                                    No community contexts scheduled.
                                </div>
                            )}
                        </div>
                    </section>
                </div>

            </div>
        </AdminLayout>
    );
}
