import { createClient } from "@/lib/supabase/server";
import { AdminLayout } from "@/components/AdminLayout";
import { UserDossier } from "@/components/UserDossier";
import { UserTimeline } from "@/components/UserTimeline";
import { UserActions } from "@/components/UserActions";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Database } from "@/lib/supabase/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: PageProps) {
  const { id: userId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch profile
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileError || !profileData) {
    notFound();
  }

  const profile = profileData as Profile;

  // Fetch university mapping with university name
  const { data: universityMapping } = await supabase
    .from("profile_university_mappings")
    .select("*, universities(id, name)")
    .eq("profile_id", userId)
    .single() as { data: { universities: { id: number; name: string } | null } | null };

  // Fetch dorm mapping with dorm name
  const { data: dormMapping } = await supabase
    .from("profile_dorm_mappings")
    .select("*, dorms(id, short_name, full_name)")
    .eq("profile_id", userId)
    .single() as { data: { dorms: { id: number; short_name: string; full_name: string } | null } | null };

  // Fetch major mapping
  const { data: majorMapping } = await supabase
    .from("profile_university_major_mappings")
    .select("*, university_major_mappings(id, university_majors(id, name))")
    .eq("profile_id", userId)
    .single() as { data: { university_major_mappings: { university_majors: { name: string } | null } | null } | null };

  // Fetch user's images
  const { data: images, count: imageCount } = await supabase
    .from("images")
    .select("*", { count: "exact" })
    .eq("profile_id", userId)
    .order("created_datetime_utc", { ascending: false })
    .limit(10);

  // Fetch user's captions
  const { data: captions, count: captionCount } = await supabase
    .from("captions")
    .select("*, images(id, url)", { count: "exact" })
    .eq("profile_id", userId)
    .order("created_datetime_utc", { ascending: false })
    .limit(10);

  // Fetch user's likes
  const { count: likeCount } = await supabase
    .from("caption_likes")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", userId);

  // Fetch user's saves
  const { count: saveCount } = await supabase
    .from("caption_saved")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", userId);

  // Fetch user's shares
  const { data: shares, count: shareCount } = await supabase
    .from("shares")
    .select("*, share_to_destinations(name), captions(content)", { count: "exact" })
    .eq("profile_id", userId)
    .order("created_datetime_utc", { ascending: false })
    .limit(10);

  // Fetch user's screenshots
  const { count: screenshotCount } = await supabase
    .from("screenshots")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", userId);

  // Fetch reports filed BY this user
  const { data: reportsFiled } = await supabase
    .from("reported_captions")
    .select("*, captions(content)")
    .eq("profile_id", userId)
    .order("created_datetime_utc", { ascending: false });

  const { data: imageReportsFiled } = await supabase
    .from("reported_images")
    .select("*, images(url)")
    .eq("profile_id", userId)
    .order("created_datetime_utc", { ascending: false });

  // Fetch reports AGAINST this user (captions they created that were reported)
  const { data: userCaptionIds } = await supabase
    .from("captions")
    .select("id")
    .eq("profile_id", userId) as { data: { id: string }[] | null };

  const captionIds = userCaptionIds?.map((c) => c.id) || [];

  const { data: reportsAgainst } = captionIds.length > 0
    ? await supabase
        .from("reported_captions")
        .select("*, captions(content), profiles!reported_captions_profile_id_fkey(first_name, last_name)")
        .in("caption_id", captionIds)
        .order("created_datetime_utc", { ascending: false })
    : { data: [] as never[] };

  // Fetch reports against user's images
  const { data: userImageIds } = await supabase
    .from("images")
    .select("id")
    .eq("profile_id", userId) as { data: { id: string }[] | null };

  const imageIds = userImageIds?.map((i) => i.id) || [];

  const { data: imageReportsAgainst } = imageIds.length > 0
    ? await supabase
        .from("reported_images")
        .select("*, images(url), profiles!reported_images_profile_id_fkey(first_name, last_name)")
        .in("image_id", imageIds)
        .order("created_datetime_utc", { ascending: false })
    : { data: [] as never[] };

  // Fetch bug reports by this user
  const { data: bugReports } = await supabase
    .from("bug_reports")
    .select("*")
    .eq("profile_id", userId)
    .order("created_datetime_utc", { ascending: false });

  // Build dossier data
  const dossierData = {
    profile,
    university: universityMapping?.universities as { id: number; name: string } | null,
    dorm: dormMapping?.dorms as { id: number; short_name: string; full_name: string } | null,
    major: (majorMapping?.university_major_mappings as { university_majors: { name: string } | null } | null)?.university_majors?.name || null,
    stats: {
      imageCount: imageCount || 0,
      captionCount: captionCount || 0,
      likeCount: likeCount || 0,
      saveCount: saveCount || 0,
      shareCount: shareCount || 0,
      screenshotCount: screenshotCount || 0,
      reportsFiled: (reportsFiled?.length || 0) + (imageReportsFiled?.length || 0),
      reportsAgainst: (reportsAgainst?.length || 0) + (imageReportsAgainst?.length || 0),
      bugReports: bugReports?.length || 0,
    },
    images: images || [],
    captions: captions || [],
    shares: shares || [],
    reportsFiled: [...(reportsFiled || []), ...(imageReportsFiled || [])],
    reportsAgainst: [...(reportsAgainst || []), ...(imageReportsAgainst || [])],
    bugReports: bugReports || [],
  };

  return (
    <AdminLayout user={user}>
      <div className="space-y-6">
        {/* Back navigation */}
        <Link
          href="/users"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Users
        </Link>

        {/* Page header with user info and actions */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-2xl font-medium text-white">
              {(profile.first_name?.[0] || profile.email?.[0] || "U").toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {profile.first_name && profile.last_name
                  ? `${profile.first_name} ${profile.last_name}`
                  : "Unknown User"}
              </h1>
              <p className="text-muted">{profile.email || "No email"}</p>
              <div className="flex items-center gap-2 mt-1">
                {profile.is_superadmin && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    Super Admin
                  </span>
                )}
                {profile.is_matrix_admin && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    Matrix Admin
                  </span>
                )}
                {profile.is_in_study && (
                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                    In Study
                  </span>
                )}
              </div>
            </div>
          </div>
          <UserActions userId={userId} profile={profile} />
        </div>

        {/* User Dossier - Full stats and content */}
        <UserDossier data={dossierData} />

        {/* User Timeline - Chronological activity */}
        <UserTimeline userId={userId} />
      </div>
    </AdminLayout>
  );
}
