"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

interface TimelineEvent {
  id: string;
  type: "image" | "caption" | "upvote" | "downvote" | "save" | "share" | "screenshot" | "report" | "bug";
  timestamp: string;
  description: string;
  metadata?: Record<string, unknown>;
}

interface UserTimelineProps {
  userId: string;
}

// Type definitions for query results
interface ImageRow {
  id: string;
  created_datetime_utc: string;
  image_description: string | null;
  is_public: boolean | null;
}

interface CaptionRow {
  id: string;
  created_datetime_utc: string;
  content: string | null;
  is_public: boolean;
  is_featured: boolean;
}

interface VoteRow {
  id: number;
  created_datetime_utc: string;
  caption_id: string;
  vote_value: number;
  captions: { content: string | null } | null;
}

interface SaveRow {
  id: number;
  created_datetime_utc: string;
  caption_id: string;
  captions: { content: string | null } | null;
}

interface ShareRow {
  id: number;
  created_datetime_utc: string;
  proper_destination: string | null;
  share_to_destinations: { name: string | null } | null;
}

interface ScreenshotRow {
  id: number;
  created_datetime_utc: string;
  caption_id: string | null;
}

interface ReportRow {
  id: number;
  created_datetime_utc: string;
  reason: string | null;
}

interface BugReportRow {
  id: number;
  created_datetime_utc: string;
  subject: string | null;
}

export function UserTimeline({ userId }: UserTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchTimeline() {
      const supabase = createClient();
      const allEvents: TimelineEvent[] = [];

      // Fetch images
      const { data: images } = await supabase
        .from("images")
        .select("id, created_datetime_utc, image_description, is_public")
        .eq("profile_id", userId)
        .order("created_datetime_utc", { ascending: false })
        .limit(50) as { data: ImageRow[] | null };

      images?.forEach((img) => {
        allEvents.push({
          id: `image-${img.id}`,
          type: "image",
          timestamp: img.created_datetime_utc,
          description: `Uploaded an image${img.is_public ? " (public)" : " (private)"}`,
          metadata: { imageId: img.id, description: img.image_description },
        });
      });

      // Fetch captions
      const { data: captions } = await supabase
        .from("captions")
        .select("id, created_datetime_utc, content, is_public, is_featured")
        .eq("profile_id", userId)
        .order("created_datetime_utc", { ascending: false })
        .limit(50) as { data: CaptionRow[] | null };

      captions?.forEach((cap) => {
        allEvents.push({
          id: `caption-${cap.id}`,
          type: "caption",
          timestamp: cap.created_datetime_utc,
          description: `Created a caption: "${cap.content?.slice(0, 50)}${(cap.content?.length || 0) > 50 ? "..." : ""}"`,
          metadata: { captionId: cap.id, isFeatured: cap.is_featured, isPublic: cap.is_public },
        });
      });

      // Fetch votes (upvotes and downvotes)
      const { data: votes } = await supabase
        .from("caption_votes")
        .select("id, created_datetime_utc, caption_id, vote_value, captions(content)")
        .eq("profile_id", userId)
        .order("created_datetime_utc", { ascending: false })
        .limit(50) as { data: VoteRow[] | null };

      votes?.forEach((vote) => {
        const caption = vote.captions;
        const isUpvote = vote.vote_value > 0;
        allEvents.push({
          id: `vote-${vote.id}`,
          type: isUpvote ? "upvote" : "downvote",
          timestamp: vote.created_datetime_utc,
          description: `${isUpvote ? "Upvoted" : "Downvoted"} a caption: "${caption?.content?.slice(0, 30)}${(caption?.content?.length || 0) > 30 ? "..." : ""}"`,
          metadata: { captionId: vote.caption_id, voteValue: vote.vote_value },
        });
      });

      // Fetch saves
      const { data: saves } = await supabase
        .from("caption_saved")
        .select("id, created_datetime_utc, caption_id, captions(content)")
        .eq("profile_id", userId)
        .order("created_datetime_utc", { ascending: false })
        .limit(50) as { data: SaveRow[] | null };

      saves?.forEach((save) => {
        const caption = save.captions;
        allEvents.push({
          id: `save-${save.id}`,
          type: "save",
          timestamp: save.created_datetime_utc,
          description: `Saved a caption: "${caption?.content?.slice(0, 30)}${(caption?.content?.length || 0) > 30 ? "..." : ""}"`,
          metadata: { captionId: save.caption_id },
        });
      });

      // Fetch shares
      const { data: shares } = await supabase
        .from("shares")
        .select("id, created_datetime_utc, proper_destination, share_to_destinations(name)")
        .eq("profile_id", userId)
        .order("created_datetime_utc", { ascending: false })
        .limit(50) as { data: ShareRow[] | null };

      shares?.forEach((share) => {
        const dest = share.share_to_destinations;
        allEvents.push({
          id: `share-${share.id}`,
          type: "share",
          timestamp: share.created_datetime_utc,
          description: `Shared to ${dest?.name || share.proper_destination || "unknown"}`,
          metadata: { destination: dest?.name || share.proper_destination },
        });
      });

      // Fetch screenshots
      const { data: screenshots } = await supabase
        .from("screenshots")
        .select("id, created_datetime_utc, caption_id")
        .eq("profile_id", userId)
        .order("created_datetime_utc", { ascending: false })
        .limit(50) as { data: ScreenshotRow[] | null };

      screenshots?.forEach((ss) => {
        allEvents.push({
          id: `screenshot-${ss.id}`,
          type: "screenshot",
          timestamp: ss.created_datetime_utc,
          description: "Took a screenshot",
          metadata: { captionId: ss.caption_id },
        });
      });

      // Fetch reports filed
      const { data: captionReports } = await supabase
        .from("reported_captions")
        .select("id, created_datetime_utc, reason")
        .eq("profile_id", userId)
        .order("created_datetime_utc", { ascending: false })
        .limit(20) as { data: ReportRow[] | null };

      captionReports?.forEach((report) => {
        allEvents.push({
          id: `report-caption-${report.id}`,
          type: "report",
          timestamp: report.created_datetime_utc,
          description: `Filed a caption report: ${report.reason || "No reason"}`,
        });
      });

      const { data: imageReports } = await supabase
        .from("reported_images")
        .select("id, created_datetime_utc, reason")
        .eq("profile_id", userId)
        .order("created_datetime_utc", { ascending: false })
        .limit(20) as { data: ReportRow[] | null };

      imageReports?.forEach((report) => {
        allEvents.push({
          id: `report-image-${report.id}`,
          type: "report",
          timestamp: report.created_datetime_utc,
          description: `Filed an image report: ${report.reason || "No reason"}`,
        });
      });

      // Fetch bug reports
      const { data: bugReports } = await supabase
        .from("bug_reports")
        .select("id, created_datetime_utc, subject")
        .eq("profile_id", userId)
        .order("created_datetime_utc", { ascending: false })
        .limit(20) as { data: BugReportRow[] | null };

      bugReports?.forEach((bug) => {
        allEvents.push({
          id: `bug-${bug.id}`,
          type: "bug",
          timestamp: bug.created_datetime_utc,
          description: `Submitted bug report: ${bug.subject || "No subject"}`,
        });
      });

      // Sort all events by timestamp
      allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setEvents(allEvents);
      setLoading(false);
    }

    fetchTimeline();
  }, [userId]);

  const filteredEvents = filter === "all" ? events : events.filter((e) => e.type === filter);

  const typeColors: Record<string, string> = {
    image: "bg-blue-500",
    caption: "bg-purple-500",
    upvote: "bg-green-500",
    downvote: "bg-red-500",
    save: "bg-amber-500",
    share: "bg-teal-500",
    screenshot: "bg-cyan-500",
    report: "bg-rose-500",
    bug: "bg-orange-500",
  };

  const typeIcons: Record<string, ReactNode> = {
    image: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    caption: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    ),
    upvote: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ),
    downvote: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    ),
    save: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
    share: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
    screenshot: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    report: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
      </svg>
    ),
    bug: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    ),
  };

  const filters = [
    { key: "all", label: "All" },
    { key: "image", label: "Images" },
    { key: "caption", label: "Captions" },
    { key: "upvote", label: "Upvotes" },
    { key: "downvote", label: "Downvotes" },
    { key: "save", label: "Saves" },
    { key: "share", label: "Shares" },
    { key: "screenshot", label: "Screenshots" },
    { key: "report", label: "Reports" },
    { key: "bug", label: "Bugs" },
  ];

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Activity Timeline</h2>
        <p className="text-sm text-muted mt-1">Chronological feed of all user activity</p>
      </div>

      {/* Filter buttons */}
      <div className="p-4 border-b border-border overflow-x-auto">
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                filter === f.key
                  ? "bg-purple-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-muted hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="p-4 max-h-[600px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12 text-muted">
            <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No activity found</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

            {/* Events */}
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div key={event.id} className="relative pl-10">
                  {/* Event dot */}
                  <div
                    className={`absolute left-2 top-1 w-5 h-5 rounded-full ${typeColors[event.type]} flex items-center justify-center text-white`}
                  >
                    {typeIcons[event.type]}
                  </div>

                  {/* Event content */}
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-border">
                    <p className="text-sm text-foreground">{event.description}</p>
                    <p className="text-xs text-muted mt-1">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
