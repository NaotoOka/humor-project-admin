"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Vote {
  id: number;
  created_datetime_utc: string;
  vote_value: number;
  caption_id: string;
  profile_id: string;
  profiles: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
  captions: {
    content: string | null;
  } | null;
}

interface VoteStats {
  totalUpvotes: number;
  totalDownvotes: number;
  netScore: number;
}

export function VotesFeed() {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [stats, setStats] = useState<VoteStats>({ totalUpvotes: 0, totalDownvotes: 0, netScore: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upvote" | "downvote">("all");

  useEffect(() => {
    async function fetchVotes() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("caption_votes")
        .select(`
          id,
          created_datetime_utc,
          vote_value,
          caption_id,
          profile_id,
          profiles!caption_votes_profile_id_fkey(id, first_name, last_name),
          captions(content)
        `)
        .order("created_datetime_utc", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Error fetching votes:", error);
        setLoading(false);
        return;
      }

      const votesData = (data || []) as Vote[];
      setVotes(votesData);

      // Calculate stats
      const upvotes = votesData.filter((v) => v.vote_value > 0).length;
      const downvotes = votesData.filter((v) => v.vote_value < 0).length;
      setStats({
        totalUpvotes: upvotes,
        totalDownvotes: downvotes,
        netScore: upvotes - downvotes,
      });

      setLoading(false);
    }

    fetchVotes();
  }, []);

  const filteredVotes = votes.filter((vote) => {
    if (filter === "all") return true;
    if (filter === "upvote") return vote.vote_value > 0;
    if (filter === "downvote") return vote.vote_value < 0;
    return true;
  });

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const getUserName = (vote: Vote) => {
    const profile = vote.profiles;
    if (!profile) return "Anonymous";
    if (profile.first_name) {
      return `${profile.first_name}${profile.last_name ? ` ${profile.last_name.charAt(0)}.` : ""}`;
    }
    return "Anonymous";
  };

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden border border-white/10">
      {/* Header with stats */}
      <div className="px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <span className="text-lg">🗳️</span>
            Votes Feed
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="flex items-center gap-1 bg-green-500/20 text-green-400 px-2 py-1 rounded-md">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                {stats.totalUpvotes}
              </span>
              <span className="flex items-center gap-1 bg-red-500/20 text-red-400 px-2 py-1 rounded-md">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {stats.totalDownvotes}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="px-4 py-2 border-b border-white/10 bg-white/5 flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            filter === "all"
              ? "bg-purple-500 text-white"
              : "bg-white/10 text-muted hover:text-foreground"
          }`}
        >
          All ({votes.length})
        </button>
        <button
          onClick={() => setFilter("upvote")}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
            filter === "upvote"
              ? "bg-green-500 text-white"
              : "bg-white/10 text-muted hover:text-foreground"
          }`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          Upvotes ({stats.totalUpvotes})
        </button>
        <button
          onClick={() => setFilter("downvote")}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
            filter === "downvote"
              ? "bg-red-500 text-white"
              : "bg-white/10 text-muted hover:text-foreground"
          }`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          Downvotes ({stats.totalDownvotes})
        </button>
      </div>

      {/* Votes list */}
      <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
        {filteredVotes.length > 0 ? (
          <div className="divide-y divide-white/5">
            {filteredVotes.map((vote) => (
              <div
                key={vote.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
              >
                {/* Vote indicator */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    vote.vote_value > 0
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {vote.vote_value > 0 ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/users/${vote.profile_id}`}
                      className="font-medium text-foreground hover:text-purple-400 transition-colors"
                    >
                      {getUserName(vote)}
                    </Link>
                    <span className="text-muted text-sm">
                      {vote.vote_value > 0 ? "upvoted" : "downvoted"}
                    </span>
                  </div>
                  {vote.captions?.content && (
                    <p className="text-xs text-muted mt-1 truncate">
                      &quot;{vote.captions.content.slice(0, 60)}
                      {vote.captions.content.length > 60 ? "..." : ""}&quot;
                    </p>
                  )}
                </div>

                {/* Time */}
                <span className="text-xs text-muted flex-shrink-0">
                  {formatTime(vote.created_datetime_utc)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-muted">
            <span>No votes found</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-white/10 bg-white/5 text-center">
        <span className="text-xs text-muted">
          Showing {filteredVotes.length} of {votes.length} votes
        </span>
      </div>
    </div>
  );
}
