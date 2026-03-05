import { createClient } from "@/lib/supabase/server";
import { AdminLayout } from "@/components/AdminLayout";
import { UserFilters } from "@/components/UserFilters";
import { Pagination } from "@/components/Pagination";
import Link from "next/link";
import type { Database } from "@/lib/supabase/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const ITEMS_PER_PAGE = 20;

interface PageProps {
  searchParams: Promise<{
    search?: string;
    role?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function UsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const search = params.search || "";
  const role = params.role || "";
  const status = params.status || "";
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));

  // Build filtered query
  let query = supabase.from("profiles").select("*", { count: "exact" });

  // Apply search filter
  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  // Apply role filter
  if (role === "superadmin") {
    query = query.eq("is_superadmin", true);
  } else if (role === "matrix_admin") {
    query = query.eq("is_matrix_admin", true);
  } else if (role === "user") {
    query = query.eq("is_superadmin", false).eq("is_matrix_admin", false);
  }

  // Apply status filter
  if (status === "in_study") {
    query = query.eq("is_in_study", true);
  } else if (status === "active") {
    query = query.eq("is_in_study", false);
  }

  // Apply pagination
  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { data: profiles, error, count } = await query
    .order("created_datetime_utc", { ascending: false })
    .range(from, to) as { data: Profile[] | null; error: unknown; count: number | null };

  const totalItems = count || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return (
    <AdminLayout user={user}>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Subject Directory</h1>
            <p className="mt-1 text-muted italic">
              Tracking {totalItems} participants in the Humor Experiment.
            </p>
          </div>
          <UserFilters />
        </div>

        {/* Users table */}
        <div className="glass-card overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-purple-500/5">
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {error ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted">
                      Failed to load users. Please try again.
                    </td>
                  </tr>
                ) : profiles && profiles.length > 0 ? (
                  profiles.map((profile) => (
                    <tr
                      key={profile.id}
                      className="transition-colors hover:bg-purple-500/5 group"
                    >
                      <td className="px-6 py-4">
                        <Link href={`/users/${profile.id}`} className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-sm font-medium text-white">
                            {(profile.first_name?.[0] || profile.email?.[0] || "U").toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-foreground group-hover:text-purple-500 transition-colors">
                              {profile.first_name && profile.last_name
                                ? `${profile.first_name} ${profile.last_name}`
                                : "Unknown User"}
                            </p>
                            <p className="text-sm text-muted">
                              ID: {profile.id.slice(0, 8)}...
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {profile.email || "No email"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {profile.is_superadmin && (
                            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                              Super Admin
                            </span>
                          )}
                          {profile.is_matrix_admin && (
                            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                              Matrix Admin
                            </span>
                          )}
                          {!profile.is_superadmin && !profile.is_matrix_admin && (
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              User
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {profile.is_in_study ? (
                          <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                            In Study
                          </span>
                        ) : (
                          <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted">
                        {profile.created_datetime_utc
                          ? new Date(profile.created_datetime_utc).toLocaleDateString()
                          : "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/users/${profile.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Dossier
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer with Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
