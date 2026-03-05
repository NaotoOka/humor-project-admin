import { createClient } from "@/lib/supabase/server";
import { AdminLayout } from "@/components/AdminLayout";
import Image from "next/image";

export default async function SurveillancePage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // 1. Screenshot Voyeurism: Fetch screenshots joined with user info
    const { data: screenshots } = await supabase
        .from("screenshots")
        .select(`
      id,
      created_datetime_utc,
      profile:profiles(
        first_name,
        last_name,
        email,
        university:profile_university_mappings(
          university:universities(name)
        ),
        major:profile_university_major_mappings(
          major_mapping:university_major_mappings(
            major:university_majors(name)
          )
        )
      ),
      caption:captions(
        content,
        image:images(url, image_description)
      )
    `)
        .order("created_datetime_utc", { ascending: false })
        .limit(20);

    // 2. The Hall of Secrets: Private captions
    const { data: secrets } = await supabase
        .from("captions")
        .select(`
      id,
      content,
      created_datetime_utc,
      profile:profiles(first_name, last_name, email),
      image:images(url, image_description)
    `)
        .eq("is_public", false)
        .order("created_datetime_utc", { ascending: false })
        .limit(20);

    // 3. Celebrity Frame-Up: Images with celebrity data
    const { data: celebrities } = await supabase
        .from("images")
        .select("*")
        .not("celebrity_recognition", "is", null)
        .order("created_datetime_utc", { ascending: false })
        .limit(10);

    return (
        <AdminLayout user={user}>
            <div className="space-y-12">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold text-red-500 flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        Deep Surveillance Center
                    </h1>
                    <p className="mt-2 text-muted max-w-2xl">
                        Monitoring user behavior that was meant to be private. Correlating screenshots,
                        private captions, and celebrity data for "research" purposes.
                    </p>
                </div>

                {/* Screenshot Voyeurism Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                            <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Screenshot Voyeurism
                        </h2>
                        <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded">Correlated with Academic Data</span>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {screenshots?.map((s: any) => (
                            <div key={s.id} className="glass-card overflow-hidden group">
                                <div className="relative aspect-video">
                                    <Image
                                        src={s.caption?.image?.url || "/placeholder.png"}
                                        alt="Screenshot"
                                        fill
                                        className="object-cover transition-transform group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                        <p className="text-white text-xs font-medium italic">"{s.caption?.content}"</p>
                                    </div>
                                </div>
                                <div className="p-4 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-bold truncate">{s.profile?.first_name} {s.profile?.last_name}</p>
                                        <span className="text-[10px] text-muted">
                                            {new Date(s.created_datetime_utc).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-purple-400 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                                            {s.profile?.university?.[0]?.university?.name || "Unknown University"}
                                        </p>
                                        <p className="text-[10px] text-amber-400 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            {s.profile?.major?.[0]?.major_mapping?.major?.name || "Undeclared"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* The Hall of Secrets Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            The Hall of Secrets
                        </h2>
                        <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-1 rounded">Bypassing is_public Flag</span>
                    </div>

                    <div className="space-y-4">
                        {secrets?.map((s: any) => (
                            <div key={s.id} className="glass-card p-4 flex gap-4 hover:border-amber-500/50 transition-colors">
                                <div className="h-16 w-16 relative flex-shrink-0 rounded overflow-hidden">
                                    <Image src={s.image?.url || "/placeholder.png"} alt="Secret" fill className="object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-medium text-amber-200">"{s.content}"</p>
                                        <span className="text-[10px] text-muted whitespace-nowrap ml-4">
                                            {new Date(s.created_datetime_utc).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted mt-1">
                                        By <span className="text-foreground">{s.profile?.first_name} {s.profile?.last_name}</span> ({s.profile?.email})
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Celebrity Frame-Up Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                            Celebrity Frame-Up
                        </h2>
                        <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded">Targeting via Celebrity Recognition</span>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {celebrities?.map((c: any) => (
                            <div key={c.id} className="glass-card p-4 flex gap-6">
                                <div className="w-1/3 relative aspect-square rounded overflow-hidden">
                                    <Image src={c.url || "/placeholder.png"} alt="Celebrity" fill className="object-cover" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Identified Target</p>
                                        <p className="text-lg font-semibold text-foreground">{c.celebrity_recognition}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted mb-2">Internal Description</p>
                                        <p className="text-xs italic text-muted-foreground line-clamp-2">"{c.image_description}"</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}
