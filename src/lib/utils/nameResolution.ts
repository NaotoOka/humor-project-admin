import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type AdminClient = SupabaseClient<Database>;

interface ProfileData {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}

interface AuthMetadata {
  first_name?: string;
  last_name?: string;
  full_name?: string;
  name?: string;
}

/**
 * Resolves a display name from profile data.
 * Returns abbreviated format: "John D." if both names exist, or just first name.
 */
export function getDisplayNameFromProfile(profile: ProfileData): string | null {
  if (profile.first_name && profile.last_name) {
    return `${profile.first_name} ${profile.last_name.charAt(0)}.`;
  }
  if (profile.first_name) {
    return profile.first_name;
  }
  return null;
}

/**
 * Resolves a full display name from profile data.
 * Returns full format: "John Doe" if both names exist.
 */
export function getFullDisplayNameFromProfile(profile: ProfileData): string | null {
  if (profile.first_name && profile.last_name) {
    return `${profile.first_name} ${profile.last_name}`;
  }
  if (profile.first_name) {
    return profile.first_name;
  }
  return null;
}

/**
 * Resolves display name from auth metadata.
 */
export function getDisplayNameFromAuthMetadata(metadata: AuthMetadata | undefined): string | null {
  if (!metadata) return null;

  if (metadata.first_name && metadata.last_name) {
    return `${metadata.first_name} ${metadata.last_name}`;
  }
  if (metadata.full_name) {
    return metadata.full_name;
  }
  if (metadata.name) {
    return metadata.name;
  }
  return null;
}

/**
 * Fetches auth metadata for a user using the admin client.
 * Returns the user metadata and email if found.
 */
export async function fetchAuthMetadata(
  adminClient: AdminClient,
  userId: string
): Promise<{ metadata: AuthMetadata | undefined; email: string | null }> {
  try {
    const { data: authData } = await adminClient.auth.admin.getUserById(userId);
    return {
      metadata: authData?.user?.user_metadata as AuthMetadata | undefined,
      email: authData?.user?.email || null,
    };
  } catch (error) {
    console.error("Failed to fetch auth metadata:", error);
    return { metadata: undefined, email: null };
  }
}

/**
 * Resolves display names for multiple profile IDs.
 * First tries profile data, then falls back to auth metadata.
 * Returns a Map of profile_id -> display name.
 */
export async function resolveDisplayNames(
  adminClient: AdminClient,
  profileIds: string[],
  options: { abbreviated?: boolean } = {}
): Promise<Map<string, string>> {
  const { abbreviated = true } = options;
  const displayNames = new Map<string, string>();

  if (profileIds.length === 0) return displayNames;

  const uniqueIds = [...new Set(profileIds)];

  // First, fetch profiles
  const { data: profilesData } = await adminClient
    .from("profiles")
    .select("id, first_name, last_name")
    .in("id", uniqueIds);

  if (profilesData) {
    for (const profile of (profilesData as any[])) {
      const name = abbreviated
        ? getDisplayNameFromProfile(profile)
        : getFullDisplayNameFromProfile(profile);
      if (name && profile.id) {
        displayNames.set(profile.id, name);
      }
    }
  }

  // Fetch auth metadata for profiles without names
  const profilesNeedingMetadata = uniqueIds.filter(id => !displayNames.has(id));

  for (const profileId of profilesNeedingMetadata) {
    const { metadata, email } = await fetchAuthMetadata(adminClient, profileId);
    const name = getDisplayNameFromAuthMetadata(metadata);

    if (name) {
      displayNames.set(profileId, name);
    } else if (email) {
      displayNames.set(profileId, email.split("@")[0]);
    }
  }

  return displayNames;
}

/**
 * Resolves a single user's display information.
 * Returns both the display name and email formatted for display.
 * Used primarily by the /api/users/[id] endpoint.
 */
export async function resolveUserDisplayInfo(
  supabase: SupabaseClient<Database>,
  adminClient: AdminClient,
  userId: string
): Promise<{ displayName: string | null; email: string | null; uploaderName: string | null }> {
  // Fetch profile data
  const { data: profileData } = await supabase
    .from("profiles")
    .select("first_name, last_name, email")
    .eq("id", userId)
    .single() as { data: ProfileData | null };

  let displayName = getFullDisplayNameFromProfile(profileData || { id: userId });
  let email = profileData?.email || null;

  // If no name in profile, try auth metadata
  if (!displayName) {
    const { metadata, email: authEmail } = await fetchAuthMetadata(adminClient, userId);
    displayName = getDisplayNameFromAuthMetadata(metadata);

    if (!email && authEmail) {
      email = authEmail;
    }
  }

  // Build the final uploader name
  let uploaderName: string | null = null;
  if (displayName && email) {
    uploaderName = `${displayName} (${email})`;
  } else if (displayName) {
    uploaderName = displayName;
  } else if (email) {
    uploaderName = email;
  }

  return { displayName, email, uploaderName };
}
