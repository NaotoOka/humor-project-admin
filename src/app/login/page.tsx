"use client";

import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

export default function LoginPage() {
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 sidebar-gradient flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <Image
            src="/logo_nav.png"
            alt="Memify"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <div>
            <h1 className="metallic-text text-xl font-bold">Memify</h1>
            <p className="text-sm text-purple-400">Admin Portal</p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-4xl font-bold leading-tight text-white">
            Manage your meme
            <br />
            <span className="metallic-text">community</span> with ease
          </h2>
          <p className="max-w-md text-lg text-purple-200">
            Monitor content, manage users, review reports, and keep your campus
            meme platform running smoothly.
          </p>

          {/* Feature highlights */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 text-purple-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20">
                <svg
                  className="h-4 w-4 text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span>Real-time content moderation</span>
            </div>
            <div className="flex items-center gap-3 text-purple-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20">
                <svg
                  className="h-4 w-4 text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span>User management & analytics</span>
            </div>
            <div className="flex items-center gap-3 text-purple-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20">
                <svg
                  className="h-4 w-4 text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span>AI caption management</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-purple-400">
          Humor Project &copy; {new Date().getFullYear()}
        </p>
      </div>

      {/* Right side - Login form */}
      <div className="flex w-full items-center justify-center bg-background lg:w-1/2">
        <div className="w-full max-w-md space-y-8 px-8">
          {/* Mobile logo */}
          <div className="flex flex-col items-center lg:hidden">
            <Image
              src="/logo_icon.png"
              alt="Memify"
              width={64}
              height={64}
              className="rounded-xl"
            />
            <h1 className="mt-4 text-2xl font-bold text-foreground">Memify Admin</h1>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome back
            </h2>
            <p className="mt-2 text-muted">
              Sign in to access the admin dashboard
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card-bg px-6 py-4 text-base font-medium text-foreground transition-all hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-4 text-muted">
                  Authorized personnel only
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
            <div className="flex gap-3">
              <svg
                className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Admin Access Required
                </p>
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                  Only authorized administrators can access this portal. Contact
                  your supervisor if you need access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
