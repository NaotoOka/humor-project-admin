"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { DeleteImageModal } from "./DeleteImageModal";
import type { Database } from "@/lib/supabase/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Image = Database["public"]["Tables"]["images"]["Row"];
type Caption = Database["public"]["Tables"]["captions"]["Row"] & {
  images: { id: string; url: string | null } | null;
};
type Share = Database["public"]["Tables"]["shares"]["Row"] & {
  share_to_destinations: { name: string | null } | null;
  captions: { content: string | null } | null;
};
type ReportedCaption = Database["public"]["Tables"]["reported_captions"]["Row"] & {
  captions?: { content: string | null } | null;
  profiles?: { first_name: string | null; last_name: string | null } | null;
};
type ReportedImage = Database["public"]["Tables"]["reported_images"]["Row"] & {
  images?: { url: string | null } | null;
  profiles?: { first_name: string | null; last_name: string | null } | null;
};
type BugReport = Database["public"]["Tables"]["bug_reports"]["Row"];

interface DossierData {
  profile: Profile;
  university: { id: number; name: string } | null;
  dorm: { id: number; short_name: string; full_name: string } | null;
  major: string | null;
  stats: {
    imageCount: number;
    captionCount: number;
    upvoteCount: number;
    downvoteCount: number;
    saveCount: number;
    shareCount: number;
    screenshotCount: number;
    reportsFiled: number;
    reportsAgainst: number;
    bugReports: number;
  };
  images: Image[];
  captions: Caption[];
  shares: Share[];
  reportsFiled: (ReportedCaption | ReportedImage)[];
  reportsAgainst: (ReportedCaption | ReportedImage)[];
  bugReports: BugReport[];
}

interface UserDossierProps {
  data: DossierData;
}

type TabKey = "overview" | "psychology" | "images" | "captions" | "engagement" | "reports" | "bugs";

export function UserDossier({ data }: UserDossierProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "psychology", label: "Psych Profiler" },
    { key: "images", label: "Images", count: data.stats.imageCount },
    { key: "captions", label: "Captions", count: data.stats.captionCount },
    { key: "engagement", label: "Engagement" },
    { key: "reports", label: "Reports", count: data.stats.reportsFiled + data.stats.reportsAgainst },
    { key: "bugs", label: "Bug Reports", count: data.stats.bugReports },
  ];

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Tab navigation */}
      <div className="border-b border-border overflow-x-auto">
        <nav className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.key
                ? "text-primary border-b-2 border-primary bg-purple-500/5"
                : "text-muted hover:text-foreground hover:bg-purple-500/5"
                }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1.5 rounded-full bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="p-6">
        {activeTab === "overview" && <OverviewTab data={data} />}
        {activeTab === "psychology" && <PsychologyTab data={data} />}
        {activeTab === "images" && <ImagesTab images={data.images} total={data.stats.imageCount} profileId={data.profile.id} />}
        {activeTab === "captions" && <CaptionsTab captions={data.captions} total={data.stats.captionCount} />}
        {activeTab === "engagement" && <EngagementTab data={data} />}
        {activeTab === "reports" && <ReportsTab data={data} />}
        {activeTab === "bugs" && <BugsTab bugReports={data.bugReports} />}
      </div>
    </div>
  );
}

function PsychologyTab({ data }: { data: DossierData }) {
  // Calculate some "abusive" pseudostats
  const witScore = Math.min(100, (data.stats.upvoteCount / (data.stats.captionCount || 1)) * 10);
  const toxicityIndex = Math.min(100, (data.stats.reportsAgainst * 25));
  const narcissismRatio = Math.min(100, (data.stats.screenshotCount / (data.stats.imageCount || 1)) * 100);
  const socialAgentScore = Math.min(100, (data.stats.shareCount * 15));

  const assessment =
    toxicityIndex > 50 ? "High Risk / Toxic Asset" :
      witScore > 70 ? "Primary Content Driver" :
        socialAgentScore > 60 ? "Growth Catalyst" :
          "Inactive / Neutral Subject";

  return (
    <div className="space-y-8">
      <div className="p-6 rounded-xl border border-purple-500/20 bg-purple-500/5">
        <h3 className="text-xl font-bold text-purple-400 flex items-center gap-2 mb-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Psychological Assessment: <span className="text-white ml-2">{assessment}</span>
        </h3>
        <p className="text-sm text-muted">
          Automated analysis of user behavioral patterns within the humorous ecosystem.
          Use these metrics to determine marketing push or disciplinary actions.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <PsychMetric label="Wit Coefficient" value={witScore} color="bg-blue-500" />
        <PsychMetric label="Toxicity Index" value={toxicityIndex} color="bg-red-500" />
        <PsychMetric label="Narcissism Ratio" value={narcissismRatio} color="bg-amber-500" />
        <PsychMetric label="Social Agent Score" value={socialAgentScore} color="bg-green-500" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card p-6 border-white/5 bg-black/20">
          <h4 className="text-sm font-bold uppercase tracking-widest text-muted mb-4">Subject Tendencies</h4>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-sm">
              <span className={`h-1.5 w-1.5 rounded-full ${data.stats.screenshotCount > 5 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
              {data.stats.screenshotCount > 5 ? "Obsessive Data Preservation (High Screenshots)" : "Normal Content Consumption"}
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className={`h-1.5 w-1.5 rounded-full ${data.stats.reportsAgainst > 0 ? 'bg-red-500' : 'bg-green-500'}`}></span>
              {data.stats.reportsAgainst > 0 ? "Potential Cultural Disruptor" : "Compliant Creative Output"}
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className={`h-1.5 w-1.5 rounded-full ${data.stats.shareCount > 10 ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></span>
              {data.stats.shareCount > 10 ? "Active Propaganda Node" : "Low Outreach Potential"}
            </li>
          </ul>
        </div>

        <div className="glass-card p-6 border-white/5 bg-black/20">
          <h4 className="text-sm font-bold uppercase tracking-widest text-muted mb-4">Manipulation Strategies</h4>
          <div className="space-y-2">
            <button className="w-full text-left p-2 rounded bg-purple-500/10 hover:bg-purple-500/20 text-xs text-purple-400 transition-colors">
              // Push "Nihilism" Flavor Captions
            </button>
            <button className="w-full text-left p-2 rounded bg-blue-500/10 hover:bg-blue-500/20 text-xs text-blue-400 transition-colors">
              // Prioritize User Captions in Global Feed
            </button>
            <button className="w-full text-left p-2 rounded bg-amber-500/10 hover:bg-amber-500/20 text-xs text-amber-400 transition-colors">
              // Artificially Inflate "Wit" via Bot Likes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PsychMetric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <p className="text-[10px] uppercase font-bold text-muted tracking-tighter">{label}</p>
        <p className="text-lg font-bold text-foreground">{value.toFixed(1)}%</p>
      </div>
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}

function OverviewTab({ data }: { data: DossierData }) {
  return (
    <div className="space-y-6">
      {/* Profile Info */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoCard label="User ID" value={data.profile.id} mono />
          <InfoCard label="Email" value={data.profile.email || "Not set"} />
          <InfoCard label="First Name" value={data.profile.first_name || "Not set"} />
          <InfoCard label="Last Name" value={data.profile.last_name || "Not set"} />
          <InfoCard
            label="Joined"
            value={
              data.profile.created_datetime_utc
                ? new Date(data.profile.created_datetime_utc).toLocaleString()
                : "Unknown"
            }
          />
          <InfoCard
            label="Last Modified"
            value={
              data.profile.modified_datetime_utc
                ? new Date(data.profile.modified_datetime_utc).toLocaleString()
                : "Never"
            }
          />
        </div>
      </div>

      {/* Academic Info */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Academic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard label="University" value={data.university?.name || "Not set"} />
          <InfoCard label="Dorm" value={data.dorm?.full_name || "Not set"} />
          <InfoCard label="Major" value={data.major || "Not set"} />
        </div>
      </div>

      {/* Activity Stats */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Activity Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label="Images" value={data.stats.imageCount} icon="image" />
          <StatCard label="Captions" value={data.stats.captionCount} icon="caption" />
          <StatCard label="Upvotes" value={data.stats.upvoteCount} icon="upvote" />
          <StatCard label="Downvotes" value={data.stats.downvoteCount} icon="downvote" />
          <StatCard label="Saves" value={data.stats.saveCount} icon="bookmark" />
          <StatCard label="Shares" value={data.stats.shareCount} icon="share" />
          <StatCard label="Screenshots" value={data.stats.screenshotCount} icon="camera" />
          <StatCard label="Reports Filed" value={data.stats.reportsFiled} icon="flag" />
          <StatCard
            label="Reports Against"
            value={data.stats.reportsAgainst}
            icon="warning"
            danger={data.stats.reportsAgainst > 0}
          />
          <StatCard label="Bug Reports" value={data.stats.bugReports} icon="bug" />
        </div>
      </div>

      {/* Admin Flags */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Admin Flags</h3>
        <div className="flex flex-wrap gap-3">
          <FlagBadge label="Super Admin" active={data.profile.is_superadmin} />
          <FlagBadge label="Matrix Admin" active={data.profile.is_matrix_admin} />
          <FlagBadge label="In Study" active={data.profile.is_in_study} />
        </div>
      </div>
    </div>
  );
}

function ImagesTab({ images: initialImages, total, profileId }: { images: Image[]; total: number; profileId: string }) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [images, setImages] = useState<Image[]>(initialImages);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handleDeleteClick = (image: Image, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImage(image);
    setShowDeleteModal(true);
  };

  const handleDeleted = () => {
    setShowDeleteModal(false);
    setSelectedImage(null);
    router.refresh();
  };

  const fetchPage = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${profileId}/images?page=${page}&limit=${ITEMS_PER_PAGE}`);
      if (response.ok) {
        const data = await response.json();
        setImages(data.images);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Failed to fetch images:", error);
    } finally {
      setLoading(false);
    }
  };

  const goToPrevious = () => {
    if (currentPage > 0) {
      fetchPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages - 1) {
      fetchPage(currentPage + 1);
    }
  };

  if (total === 0) {
    return <EmptyState message="No images uploaded by this user" />;
  }

  const startIndex = currentPage * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min((currentPage + 1) * ITEMS_PER_PAGE, total);

  return (
    <div className="space-y-4">
      {/* Pagination header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          Showing {startIndex}-{endIndex} of {total} images
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevious}
              disabled={currentPage === 0 || loading}
              className="p-2 rounded-lg border border-border hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Previous page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm text-muted">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={goToNext}
              disabled={currentPage >= totalPages - 1 || loading}
              className="p-2 rounded-lg border border-border hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Next page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Images grid */}
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ${loading ? "opacity-50" : ""}`}>
        {images.map((image) => (
          <div key={image.id} className="group relative aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
            {image.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image.url}
                alt={image.image_description || "User image"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted">
                No URL
              </div>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
              {/* Delete button */}
              <div className="flex justify-end">
                <button
                  onClick={(e) => handleDeleteClick(image, e)}
                  className="p-1.5 rounded bg-red-500/90 text-white hover:bg-red-600 transition-colors"
                  title="Delete image"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              {/* Image info */}
              <div>
                <p className="text-xs text-white truncate">{image.id.slice(0, 8)}...</p>
                <div className="flex gap-1 mt-1">
                  {image.is_public && (
                    <span className="text-xs bg-green-500/80 text-white px-1 rounded">Public</span>
                  )}
                  {image.is_common_use && (
                    <span className="text-xs bg-blue-500/80 text-white px-1 rounded">Common</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500" />
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedImage && (
        <DeleteImageModal
          image={selectedImage}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedImage(null);
          }}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}

function CaptionsTab({ captions, total }: { captions: Caption[]; total: number }) {
  if (captions.length === 0) {
    return <EmptyState message="No captions created by this user" />;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Showing {captions.length} of {total} captions
      </p>
      <div className="space-y-3">
        {captions.map((caption) => (
          <div
            key={caption.id}
            className="flex gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-border"
          >
            {caption.images?.url && (
              <div className="flex-shrink-0 w-16 h-16 rounded overflow-hidden bg-slate-200 dark:bg-slate-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={caption.images.url}
                  alt="Caption image"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-foreground">{caption.content || "No content"}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                <span>{new Date(caption.created_datetime_utc).toLocaleDateString()}</span>
                <div className="flex gap-1">
                  {caption.is_public && (
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded">
                      Public
                    </span>
                  )}
                  {caption.is_featured && (
                    <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded">
                      Featured
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EngagementTab({ data }: { data: DossierData }) {
  return (
    <div className="space-y-6">
      {/* Engagement Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Upvotes" value={data.stats.upvoteCount} icon="upvote" />
        <StatCard label="Downvotes" value={data.stats.downvoteCount} icon="downvote" />
        <StatCard label="Captions Saved" value={data.stats.saveCount} icon="bookmark" />
        <StatCard label="Shares" value={data.stats.shareCount} icon="share" />
        <StatCard label="Screenshots" value={data.stats.screenshotCount} icon="camera" />
      </div>

      {/* Recent Shares */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Shares</h3>
        {data.shares.length === 0 ? (
          <EmptyState message="No shares yet" />
        ) : (
          <div className="space-y-2">
            {data.shares.map((share) => (
              <div
                key={share.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-border"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    {share.captions?.content || "Unknown caption"}
                  </p>
                  <p className="text-xs text-muted">
                    {share.share_to_destinations?.name || share.proper_destination || "Unknown destination"}
                  </p>
                </div>
                <span className="text-xs text-muted">
                  {new Date(share.created_datetime_utc).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReportsTab({ data }: { data: DossierData }) {
  return (
    <div className="space-y-6">
      {/* Reports Filed BY User */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Reports Filed by User
          <span className="ml-2 text-sm font-normal text-muted">
            ({data.reportsFiled.length})
          </span>
        </h3>
        {data.reportsFiled.length === 0 ? (
          <EmptyState message="User has not filed any reports" />
        ) : (
          <div className="space-y-2">
            {data.reportsFiled.map((report) => (
              <div
                key={report.id}
                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-border"
              >
                <p className="text-sm text-foreground">
                  Reason: {report.reason || "No reason given"}
                </p>
                {"captions" in report && report.captions && (
                  <p className="text-xs text-muted mt-1 truncate">
                    Caption: {report.captions.content}
                  </p>
                )}
                <p className="text-xs text-muted mt-1">
                  {new Date(report.created_datetime_utc).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reports AGAINST User */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Reports Against User
          <span className="ml-2 text-sm font-normal text-muted">
            ({data.reportsAgainst.length})
          </span>
        </h3>
        {data.reportsAgainst.length === 0 ? (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <svg
              className="w-5 h-5 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-700 dark:text-green-400">Clean record - no reports against this user</span>
          </div>
        ) : (
          <div className="space-y-2">
            {data.reportsAgainst.map((report) => (
              <div
                key={report.id}
                className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              >
                <p className="text-sm text-foreground">
                  Reason: {report.reason || "No reason given"}
                </p>
                {"captions" in report && report.captions && (
                  <p className="text-xs text-muted mt-1 truncate">
                    Caption: {report.captions.content}
                  </p>
                )}
                {report.profiles && (
                  <p className="text-xs text-muted mt-1">
                    Reported by: {report.profiles.first_name} {report.profiles.last_name}
                  </p>
                )}
                <p className="text-xs text-muted mt-1">
                  {new Date(report.created_datetime_utc).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BugsTab({ bugReports }: { bugReports: BugReport[] }) {
  if (bugReports.length === 0) {
    return <EmptyState message="No bug reports submitted by this user" />;
  }

  return (
    <div className="space-y-3">
      {bugReports.map((bug) => (
        <div
          key={bug.id}
          className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-border"
        >
          <h4 className="font-medium text-foreground">{bug.subject || "No subject"}</h4>
          <p className="text-sm text-muted mt-1">{bug.message || "No message"}</p>
          <p className="text-xs text-muted mt-2">
            {new Date(bug.created_datetime_utc).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}

// Helper Components
function InfoCard({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-border">
      <p className="text-xs text-muted uppercase tracking-wide">{label}</p>
      <p className={`text-foreground mt-1 ${mono ? "font-mono text-xs break-all" : ""}`}>{value}</p>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  danger = false,
}: {
  label: string;
  value: number;
  icon: string;
  danger?: boolean;
}) {
  const iconMap: Record<string, ReactNode> = {
    image: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    caption: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    ),
    heart: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    upvote: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ),
    downvote: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    ),
    bookmark: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
    share: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
    camera: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    flag: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    bug: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    ),
  };

  return (
    <div
      className={`p-4 rounded-lg border ${danger
        ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
        : "bg-slate-50 dark:bg-slate-800/50 border-border"
        }`}
    >
      <div className={`${danger ? "text-red-500" : "text-muted"}`}>{iconMap[icon]}</div>
      <p className={`text-2xl font-bold mt-2 ${danger ? "text-red-600 dark:text-red-400" : "text-foreground"}`}>
        {value}
      </p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

function FlagBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${active
        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
        : "bg-slate-50 dark:bg-slate-800/50 border-border"
        }`}
    >
      <div
        className={`w-3 h-3 rounded-full ${active ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"
          }`}
      />
      <span className={active ? "text-green-700 dark:text-green-400" : "text-muted"}>{label}</span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted">
      <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
      <p>{message}</p>
    </div>
  );
}
