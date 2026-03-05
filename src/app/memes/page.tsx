import { createClient } from "@/lib/supabase/server";
import { AdminLayout } from "@/components/AdminLayout";
import type { Database } from "@/lib/supabase/database.types";

type Image = Database["public"]["Tables"]["images"]["Row"];

export default async function MemesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch images (memes)
  const { data: images, error } = await supabase
    .from("images")
    .select("*")
    .order("created_datetime_utc", { ascending: false })
    .limit(50) as { data: Image[] | null; error: unknown };

  return (
    <AdminLayout user={user}>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Memes</h1>
          <p className="mt-1 text-muted">
            Browse all uploaded meme images.
          </p>
        </div>

        {/* Memes grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {error ? (
            <div className="col-span-full text-center text-muted py-8">
              Failed to load memes. Please try again.
            </div>
          ) : images && images.length > 0 ? (
            images.map((image) => (
              <div
                key={image.id}
                className="glass-card overflow-hidden rounded-xl"
              >
                {/* Image preview */}
                <div className="relative aspect-square bg-purple-100 dark:bg-purple-900/30">
                  {image.url ? (
                    <img
                      src={image.url}
                      alt={image.image_description || "Meme image"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <svg
                        className="h-12 w-12 text-purple-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="line-clamp-2 text-sm font-medium text-foreground">
                    {image.image_description || "No description"}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex gap-2">
                      {image.is_common_use && (
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                          Template
                        </span>
                      )}
                      {image.is_public ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Public
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                          Private
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted">
                      {image.created_datetime_utc
                        ? new Date(image.created_datetime_utc).toLocaleDateString()
                        : "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-muted py-8">
              No memes found.
            </div>
          )}
        </div>

        {/* Footer */}
        <div>
          <p className="text-sm text-muted">
            Showing {images?.length || 0} memes
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
