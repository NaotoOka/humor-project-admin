import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-sm space-y-6 px-4 text-center">
        <h1 className="text-2xl font-semibold text-black dark:text-white">
          Authentication Error
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          There was a problem signing you in. Please try again.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-full bg-black px-6 py-3 text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
