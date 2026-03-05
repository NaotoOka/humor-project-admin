"use client";

import { LogoutButton } from "./LogoutButton";

interface AdminHeaderProps {
  user: {
    email?: string;
  } | null;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-foreground">
          Admin Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-sm font-medium text-white">
            {user?.email?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground">
              {user?.email?.split("@")[0] || "Admin"}
            </p>
            <p className="text-xs text-muted">Administrator</p>
          </div>
        </div>

        <LogoutButton />
      </div>
    </header>
  );
}
