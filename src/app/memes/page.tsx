import { createClient } from "@/lib/supabase/server";
import { AdminLayout } from "@/components/AdminLayout";
import { MemesPageContent } from "@/components/MemesPageContent";
import type { Database } from "@/lib/supabase/database.types";

type Image = Database["public"]["Tables"]["images"]["Row"];

const PAGE_SIZE = 50;

export default async function MemesPage(props: {
  searchParams: Promise<{ page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page || "1", 10);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch images (memes) with pagination
  const { data: images, error } = (await supabase
    .from("images")
    .select("*")
    .order("created_datetime_utc", { ascending: false })
    .range(from, to)) as { data: Image[] | null; error: unknown };

  // Check if there are more
  const { count } = await supabase
    .from("images")
    .select("*", { count: "exact", head: true });

  const totalCount = count || 0;
  const hasMore = page * PAGE_SIZE < totalCount;

  return (
    <AdminLayout user={user}>
      {error ? (
        <div className="text-center text-muted py-8">
          Failed to load memes. Please try again.
        </div>
      ) : (
        <MemesPageContent
          images={images || []}
          page={page}
          hasMore={hasMore}
          totalCount={totalCount}
        />
      )}
    </AdminLayout>
  );
}
