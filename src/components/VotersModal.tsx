"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@/components/Modal";

interface Vote {
  profile_id: string;
  vote_value: number;
  created_datetime_utc: string;
  voterName: string;
}

interface VotersModalProps {
  captionId: string;
  captionText: string | null;
  onClose: () => void;
}

export function VotersModal({ captionId, captionText, onClose }: VotersModalProps) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVoters() {
      setLoading(true);
      setError(null);

      try {
        const supabase = createClient();

        // Fetch votes for this caption
        const { data: votesData, error: votesError } = await supabase
          .from("caption_votes")
          .select("profile_id, vote_value, created_datetime_utc")
          .eq("caption_id", captionId)
          .order("created_datetime_utc", { ascending: false });

        if (votesError) throw votesError;

        if (!votesData || votesData.length === 0) {
          setVotes([]);
          setLoading(false);
          return;
        }

        // Fetch voter names
        const uniqueProfileIds = [...new Set((votesData as any[]).map(v => v.profile_id))];
        const voterNames = new Map<string, string>();

        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", uniqueProfileIds);

        if (profilesData) {
          for (const profile of (profilesData as any[])) {
            if (profile.first_name) {
              voterNames.set(
                profile.id,
                `${profile.first_name}${profile.last_name ? ` ${profile.last_name.charAt(0)}.` : ""}`
              );
            }
          }
        }

        // Fetch auth metadata for profiles without names via API
        const profilesNeedingMetadata = uniqueProfileIds.filter(id => !voterNames.has(id));
        await Promise.all(
          profilesNeedingMetadata.map(async (profileId) => {
            try {
              const response = await fetch(`/api/users/${profileId}`);
              if (response.ok) {
                const data = await response.json();
                if (data.uploaderName) {
                  voterNames.set(profileId, data.uploaderName);
                }
              }
            } catch (err) {
              console.error("Failed to fetch user info:", err);
            }
          })
        );

        // Map votes with voter names
        const votesWithNames: Vote[] = (votesData as any[]).map(vote => ({
          ...vote,
          voterName: voterNames.get(vote.profile_id) || "Anonymous",
        }));

        setVotes(votesWithNames);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load voters");
      } finally {
        setLoading(false);
      }
    }

    fetchVoters();
  }, [captionId]);

  const upvotes = votes.filter(v => v.vote_value > 0);
  const downvotes = votes.filter(v => v.vote_value < 0);

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="max-w-lg">
      <ModalHeader showCloseButton onClose={onClose}>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Caption Voters</h2>
          <p className="text-sm text-muted mt-1 line-clamp-1">
            {captionText || <span className="italic">No content</span>}
          </p>
        </div>
      </ModalHeader>

      <ModalContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : votes.length === 0 ? (
          <div className="text-center py-8 text-muted">No votes found</div>
        ) : (
          <div className="space-y-6">
            {/* Upvotes */}
            <div>
              <h3 className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400 mb-3">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Upvotes ({upvotes.length})
              </h3>
              {upvotes.length === 0 ? (
                <p className="text-sm text-muted italic">No upvotes</p>
              ) : (
                <div className="space-y-2">
                  {upvotes.map((vote, index) => (
                    <div
                      key={`${vote.profile_id}-${index}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-green-500/5 border border-green-500/20"
                    >
                      <a
                        href={`/users/${vote.profile_id}`}
                        className="text-sm font-medium text-foreground hover:text-purple-500 transition-colors"
                      >
                        {vote.voterName}
                      </a>
                      <span className="text-xs text-muted">
                        {new Date(vote.created_datetime_utc).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Downvotes */}
            <div>
              <h3 className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 mb-3">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Downvotes ({downvotes.length})
              </h3>
              {downvotes.length === 0 ? (
                <p className="text-sm text-muted italic">No downvotes</p>
              ) : (
                <div className="space-y-2">
                  {downvotes.map((vote, index) => (
                    <div
                      key={`${vote.profile_id}-${index}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/20"
                    >
                      <a
                        href={`/users/${vote.profile_id}`}
                        className="text-sm font-medium text-foreground hover:text-purple-500 transition-colors"
                      >
                        {vote.voterName}
                      </a>
                      <span className="text-xs text-muted">
                        {new Date(vote.created_datetime_utc).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </ModalContent>

      <ModalFooter>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Close
        </button>
      </ModalFooter>
    </Modal>
  );
}
