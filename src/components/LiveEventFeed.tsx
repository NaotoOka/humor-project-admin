import { createClient } from "@/lib/supabase/server";

type EventType = {
    type: string;
    icon: string;
    bgColor: string;
    textColor: string;
    description: (event: any) => string;
};

const EVENT_CONFIG: Record<string, EventType> = {
    SHARE: { type: 'SHARE', icon: '🔗', bgColor: 'bg-blue-500/30', textColor: 'text-blue-300', description: (e) => `shared a meme${e.proper_destination ? ` to ${e.proper_destination}` : ''}` },
    REPORT: { type: 'REPORT', icon: '🚨', bgColor: 'bg-red-500/30', textColor: 'text-red-300', description: (e) => `reported a caption${e.reason ? `: "${e.reason.slice(0, 30)}..."` : ''}` },
    SCREENSHOT: { type: 'SCREENSHOT', icon: '📸', bgColor: 'bg-purple-500/30', textColor: 'text-purple-300', description: () => 'captured a screenshot' },
    LIKE: { type: 'LIKE', icon: '❤️', bgColor: 'bg-pink-500/30', textColor: 'text-pink-300', description: () => 'liked a caption' },
    SAVE: { type: 'SAVE', icon: '💾', bgColor: 'bg-yellow-500/30', textColor: 'text-yellow-300', description: () => 'saved a caption' },
    VOTE: { type: 'VOTE', icon: '👍', bgColor: 'bg-cyan-500/30', textColor: 'text-cyan-300', description: (e) => `voted ${e.vote_value > 0 ? 'up' : 'down'} on a caption` },
    CAPTION_REQ: { type: 'CAPTION', icon: '✨', bgColor: 'bg-amber-500/30', textColor: 'text-amber-300', description: () => 'requested captions' },
    IMAGE: { type: 'UPLOAD', icon: '🖼️', bgColor: 'bg-indigo-500/30', textColor: 'text-indigo-300', description: () => 'uploaded an image' },
    BUG: { type: 'BUG', icon: '🐛', bgColor: 'bg-orange-500/30', textColor: 'text-orange-300', description: (e) => `reported: "${e.subject?.slice(0, 20) || 'bug'}..."` },
    SIGNUP: { type: 'SIGNUP', icon: '👤', bgColor: 'bg-emerald-500/30', textColor: 'text-emerald-300', description: () => 'joined the platform' },
    IMG_REPORT: { type: 'IMG_RPT', icon: '⚠️', bgColor: 'bg-rose-500/30', textColor: 'text-rose-300', description: () => 'reported an image' },
};

export async function LiveEventFeed() {
    const supabase = await createClient();

    // Fetch recent events from multiple tables with proper profile joins
    const [
        { data: recentShares },
        { data: recentReports },
        { data: recentScreenshots },
        { data: recentLikes },
        { data: recentSaves },
        { data: recentVotes },
        { data: recentCaptionRequests },
        { data: recentImages },
        { data: recentBugs },
        { data: recentProfiles },
        { data: recentImageReports },
    ] = await Promise.all([
        supabase.from("shares").select("*, profiles!shares_profile_id_fkey(first_name, last_name)").order("created_datetime_utc", { ascending: false }).limit(25),
        supabase.from("reported_captions").select("*, profiles!reported_captions_profile_id_fkey(first_name, last_name)").order("created_datetime_utc", { ascending: false }).limit(25),
        supabase.from("screenshots").select("*, profiles!screenshots_profile_id_fkey(first_name, last_name)").order("created_datetime_utc", { ascending: false }).limit(25),
        supabase.from("caption_likes").select("*, profiles!caption_likes_profile_id_fkey(first_name, last_name)").order("created_datetime_utc", { ascending: false }).limit(25),
        supabase.from("caption_saved").select("*, profiles!caption_saved_profile_id_fkey(first_name, last_name)").order("created_datetime_utc", { ascending: false }).limit(25),
        supabase.from("caption_votes").select("*, profiles!caption_votes_profile_id_fkey(first_name, last_name)").order("created_datetime_utc", { ascending: false }).limit(25),
        supabase.from("caption_requests").select("*, profiles!caption_requests_profile_id_fkey(first_name, last_name)").order("created_datetime_utc", { ascending: false }).limit(25),
        supabase.from("images").select("*, profiles!images_profile_id_fkey(first_name, last_name)").order("created_datetime_utc", { ascending: false }).limit(25),
        supabase.from("bug_reports").select("*, profiles!bug_reports_profile_id_fkey(first_name, last_name)").order("created_datetime_utc", { ascending: false }).limit(20),
        supabase.from("profiles").select("first_name, last_name, created_datetime_utc, id").order("created_datetime_utc", { ascending: false }).limit(20),
        supabase.from("reported_images").select("*, profiles!reported_images_profile_id_fkey(first_name, last_name)").order("created_datetime_utc", { ascending: false }).limit(20),
    ]);

    // Helper to extract profile name from various data structures
    const extractProfile = (record: any) => {
        // Try different possible profile field names
        if (record.profiles?.first_name) return record.profiles;
        if (record.profile?.first_name) return record.profile;
        // For direct profile records (signups)
        if (record.first_name) return record;
        return null;
    };

    const allEvents = [
        ...(recentShares || []).map(s => ({ ...(s as any), eventType: 'SHARE' })),
        ...(recentReports || []).map(r => ({ ...(r as any), eventType: 'REPORT' })),
        ...(recentScreenshots || []).map(sc => ({ ...(sc as any), eventType: 'SCREENSHOT' })),
        ...(recentLikes || []).map(l => ({ ...(l as any), eventType: 'LIKE' })),
        ...(recentSaves || []).map(s => ({ ...(s as any), eventType: 'SAVE' })),
        ...(recentVotes || []).map(v => ({ ...(v as any), eventType: 'VOTE' })),
        ...(recentCaptionRequests || []).map(cr => ({ ...(cr as any), eventType: 'CAPTION_REQ' })),
        ...(recentImages || []).map(i => ({ ...(i as any), eventType: 'IMAGE' })),
        ...(recentBugs || []).map(b => ({ ...(b as any), eventType: 'BUG' })),
        ...(recentProfiles || []).map(p => ({ ...(p as any), eventType: 'SIGNUP' })),
        ...(recentImageReports || []).map(ir => ({ ...(ir as any), eventType: 'IMG_REPORT' })),
    ].sort((a, b) => new Date((b as any).created_datetime_utc).getTime() - new Date((a as any).created_datetime_utc).getTime())
     .slice(0, 100);

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'now';
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const getEventConfig = (eventType: string) => EVENT_CONFIG[eventType] || EVENT_CONFIG.SHARE;

    return (
        <div className="glass-card flex flex-col overflow-hidden rounded-xl border border-white/10">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/5">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live Event Feed
                </h3>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted bg-white/10 px-2.5 py-1 rounded-full">
                        {allEvents.length} events
                    </span>
                </div>
            </div>

            {/* Event List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ maxHeight: '500px' }}>
                {allEvents.length > 0 ? (
                    <div className="divide-y divide-white/5">
                        {allEvents.map((event, idx) => {
                            const config = getEventConfig(event.eventType);
                            const profile = extractProfile(event);
                            const userName = profile?.first_name
                                ? `${profile.first_name}${profile.last_name ? ` ${profile.last_name.charAt(0)}.` : ''}`
                                : 'Anonymous';

                            return (
                                <div
                                    key={`${event.eventType}-${event.id || idx}`}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                                >
                                    {/* Time */}
                                    <span className="text-xs font-mono text-muted w-10 flex-shrink-0">
                                        {formatTime(event.created_datetime_utc)}
                                    </span>

                                    {/* Event Type Badge */}
                                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${config.bgColor} ${config.textColor} flex-shrink-0 min-w-[75px] text-center`}>
                                        {config.type}
                                    </span>

                                    {/* Icon + User + Action */}
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className="flex-shrink-0 text-base">{config.icon}</span>
                                        <span className="font-medium text-foreground truncate">
                                            {userName}
                                        </span>
                                        <span className="text-muted truncate hidden sm:inline">
                                            {config.description(event)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-32 text-muted">
                        <span className="animate-pulse">Waiting for events...</span>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-white/10 bg-white/5 text-center">
                <span className="text-xs text-muted">
                    Streaming {allEvents.length} recent events
                </span>
            </div>
        </div>
    );
}
