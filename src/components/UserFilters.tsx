"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function UserFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "";
  const status = searchParams.get("status") || "";

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change
    params.delete("page");

    startTransition(() => {
      router.push(`/users?${params.toString()}`);
    });
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <input
          type="text"
          placeholder="Search dossiers..."
          defaultValue={search}
          onChange={(e) => updateParams({ search: e.target.value })}
          className="bg-purple-500/5 border border-purple-500/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 w-64"
        />
        <svg
          className="w-4 h-4 text-muted absolute left-3 top-2.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {isPending && (
          <span className="absolute right-3 top-2.5 h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        )}
      </div>
      <select
        value={role}
        onChange={(e) => updateParams({ role: e.target.value })}
        className="bg-purple-500/5 border border-purple-500/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
      >
        <option value="">All Roles</option>
        <option value="superadmin">Super Admins</option>
        <option value="matrix_admin">Matrix Admins</option>
        <option value="user">Users</option>
      </select>
      <select
        value={status}
        onChange={(e) => updateParams({ status: e.target.value })}
        className="bg-purple-500/5 border border-purple-500/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
      >
        <option value="">All Status</option>
        <option value="in_study">In Study</option>
        <option value="active">Active</option>
      </select>
    </div>
  );
}
