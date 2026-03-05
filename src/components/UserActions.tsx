"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Database } from "@/lib/supabase/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface UserActionsProps {
  userId: string;
  profile: Profile;
}

// Helper to get typed supabase client
function getSupabase() {
  return createClient();
}

export function UserActions({ userId, profile }: UserActionsProps) {
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNukeModal, setShowNukeModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleUpdateProfile = async (updates: {
    first_name: string;
    last_name: string;
    email: string;
    is_superadmin: boolean;
    is_matrix_admin: boolean;
    is_in_study: boolean;
  }) => {
    setLoading(true);
    setMessage(null);
    const supabase = getSupabase();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("profiles") as any)
      .update({
        first_name: updates.first_name || null,
        last_name: updates.last_name || null,
        email: updates.email || null,
        is_superadmin: updates.is_superadmin,
        is_matrix_admin: updates.is_matrix_admin,
        is_in_study: updates.is_in_study,
        modified_datetime_utc: new Date().toISOString(),
      })
      .eq("id", userId);

    setLoading(false);

    if (error) {
      setMessage({ type: "error", text: `Failed to update: ${error.message}` });
    } else {
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setShowEditModal(false);
      router.refresh();
    }
  };

  const handleNukeUser = async () => {
    setLoading(true);
    setMessage(null);
    const supabase = getSupabase();

    try {
      // Delete in order to respect foreign key constraints
      // 1. Delete caption-related data
      await supabase.from("caption_likes").delete().eq("profile_id", userId);
      await supabase.from("caption_saved").delete().eq("profile_id", userId);
      await supabase.from("caption_votes").delete().eq("profile_id", userId);
      await supabase.from("screenshots").delete().eq("profile_id", userId);
      await supabase.from("shares").delete().eq("profile_id", userId);

      // 2. Delete reports filed by user
      await supabase.from("reported_captions").delete().eq("profile_id", userId);
      await supabase.from("reported_images").delete().eq("profile_id", userId);

      // 3. Delete bug reports
      await supabase.from("bug_reports").delete().eq("profile_id", userId);

      // 4. Delete caption requests and related LLM data
      const { data: captionRequests } = await supabase
        .from("caption_requests")
        .select("id")
        .eq("profile_id", userId) as { data: { id: number }[] | null };

      if (captionRequests && captionRequests.length > 0) {
        const requestIds = captionRequests.map((r) => r.id);
        await supabase.from("llm_model_responses").delete().in("caption_request_id", requestIds);
        await supabase.from("llm_prompt_chains").delete().in("caption_request_id", requestIds);
      }

      // 5. Get user's captions to clean up related data
      const { data: userCaptions } = await supabase
        .from("captions")
        .select("id")
        .eq("profile_id", userId) as { data: { id: string }[] | null };

      if (userCaptions && userCaptions.length > 0) {
        const captionIds = userCaptions.map((c) => c.id);
        // Delete likes/saves/votes/screenshots/shares/reports on user's captions
        await supabase.from("caption_likes").delete().in("caption_id", captionIds);
        await supabase.from("caption_saved").delete().in("caption_id", captionIds);
        await supabase.from("caption_votes").delete().in("caption_id", captionIds);
        await supabase.from("screenshots").delete().in("caption_id", captionIds);
        await supabase.from("shares").delete().in("caption_id", captionIds);
        await supabase.from("reported_captions").delete().in("caption_id", captionIds);
        await supabase.from("study_caption_mappings").delete().in("caption_id", captionIds);
      }

      // 6. Delete user's captions
      await supabase.from("captions").delete().eq("profile_id", userId);

      // 7. Delete caption requests
      await supabase.from("caption_requests").delete().eq("profile_id", userId);

      // 8. Get user's images to clean up related data
      const { data: userImages } = await supabase
        .from("images")
        .select("id")
        .eq("profile_id", userId) as { data: { id: string }[] | null };

      if (userImages && userImages.length > 0) {
        const imageIds = userImages.map((i) => i.id);
        // Delete reports and mappings on user's images
        await supabase.from("reported_images").delete().in("image_id", imageIds);
        await supabase.from("study_image_set_image_mappings").delete().in("image_id", imageIds);
        await supabase.from("common_use_category_image_mappings").delete().in("image_id", imageIds);
        await supabase.from("caption_examples").delete().in("image_id", imageIds);
      }

      // 9. Delete user's images
      await supabase.from("images").delete().eq("profile_id", userId);

      // 10. Delete profile mappings
      await supabase.from("profile_university_mappings").delete().eq("profile_id", userId);
      await supabase.from("profile_dorm_mappings").delete().eq("profile_id", userId);
      await supabase.from("profile_university_major_mappings").delete().eq("profile_id", userId);

      // 11. Delete invitations sent by user
      await supabase.from("invitations").delete().eq("inviter_id", userId);

      // 12. Finally, delete the profile
      const { error: profileError } = await supabase.from("profiles").delete().eq("id", userId);

      if (profileError) {
        throw profileError;
      }

      setMessage({ type: "success", text: "User and all content deleted successfully!" });
      setShowNukeModal(false);

      // Redirect back to users list after short delay
      setTimeout(() => {
        router.push("/users");
      }, 1500);
    } catch (error) {
      setMessage({
        type: "error",
        text: `Failed to delete user: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {/* Edit Profile Button */}
        <button
          onClick={() => setShowEditModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Profile
        </button>

        {/* Nuke Button */}
        <button
          onClick={() => setShowNukeModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Nuke User
        </button>
      </div>

      {/* Status message */}
      {message && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white ${
            message.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateProfile}
          loading={loading}
        />
      )}

      {/* Nuke Confirmation Modal */}
      {showNukeModal && (
        <NukeConfirmModal
          profile={profile}
          onClose={() => setShowNukeModal(false)}
          onConfirm={handleNukeUser}
          loading={loading}
        />
      )}
    </>
  );
}

interface ProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
  is_superadmin: boolean;
  is_matrix_admin: boolean;
  is_in_study: boolean;
}

// Edit Profile Modal Component
function EditProfileModal({
  profile,
  onClose,
  onSave,
  loading,
}: {
  profile: Profile;
  onClose: () => void;
  onSave: (updates: ProfileFormData) => Promise<void>;
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    first_name: profile.first_name || "",
    last_name: profile.last_name || "",
    email: profile.email || "",
    is_superadmin: profile.is_superadmin,
    is_matrix_admin: profile.is_matrix_admin,
    is_in_study: profile.is_in_study,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-card-bg rounded-xl shadow-xl border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Edit Profile</h2>
          <p className="text-sm text-muted mt-1">Update user information and flags</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(formData);
          }}
          className="p-6 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">First Name</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Last Name</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="pt-2">
            <label className="block text-sm font-medium text-foreground mb-3">Admin Flags</label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_superadmin}
                  onChange={(e) => setFormData({ ...formData, is_superadmin: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-purple-500 focus:ring-purple-500"
                />
                <span className="text-foreground">Super Admin</span>
                <span className="text-xs text-amber-600 dark:text-amber-400">(Full access)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_matrix_admin}
                  onChange={(e) => setFormData({ ...formData, is_matrix_admin: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-purple-500 focus:ring-purple-500"
                />
                <span className="text-foreground">Matrix Admin</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_in_study}
                  onChange={(e) => setFormData({ ...formData, is_in_study: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-purple-500 focus:ring-purple-500"
                />
                <span className="text-foreground">In Study</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Nuke Confirmation Modal Component
function NukeConfirmModal({
  profile,
  onClose,
  onConfirm,
  loading,
}: {
  profile: Profile;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
}) {
  const [confirmText, setConfirmText] = useState("");
  const userName = profile.first_name && profile.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : profile.email || "Unknown User";

  const canDelete = confirmText === "DELETE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-card-bg rounded-xl shadow-xl border border-red-500/50">
        <div className="p-6 border-b border-red-500/30 bg-red-500/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">Nuke User</h2>
              <p className="text-sm text-muted">This action cannot be undone</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-foreground">
            You are about to permanently delete <strong>{userName}</strong> and ALL their associated data:
          </p>

          <ul className="text-sm text-muted space-y-1 pl-4">
            <li>All uploaded images</li>
            <li>All created captions</li>
            <li>All likes, saves, and shares</li>
            <li>All screenshots</li>
            <li>All reports filed</li>
            <li>All bug reports</li>
            <li>Profile and account data</li>
          </ul>

          <div className="pt-2">
            <label className="block text-sm font-medium text-foreground mb-2">
              Type <span className="font-mono bg-red-100 dark:bg-red-900/30 px-1 rounded text-red-600 dark:text-red-400">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-3 py-2 rounded-lg border border-red-300 dark:border-red-800 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading || !canDelete}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              )}
              {loading ? "Deleting..." : "Nuke User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
