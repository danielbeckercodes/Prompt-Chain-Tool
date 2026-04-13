import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

function getFirst<T>(val: T | T[] | null): T | null {
  if (val == null) return null;
  return Array.isArray(val) ? val[0] ?? null : val;
}

export async function TopCaptions() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("captions")
    .select(
      "id, content, like_count, is_featured, created_datetime_utc, humor_flavors(slug), images(url)"
    )
    .order("like_count", { ascending: false })
    .limit(20);

  const captions = data ?? [];

  if (captions.length === 0) {
    return (
      <div className="text-sm text-zinc-400 dark:text-zinc-500 py-12 text-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        No captions yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
      <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">
        Top Captions
      </h2>
      <div className="space-y-3">
        {captions.map((caption, i) => {
          const flavor = getFirst(caption.humor_flavors);
          const image = getFirst(caption.images);
          return (
            <div
              key={caption.id}
              className="flex gap-4 items-start rounded-lg p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              {/* Rank */}
              <span className="text-sm font-medium text-zinc-400 dark:text-zinc-500 w-6 shrink-0 text-right">
                #{i + 1}
              </span>

              {/* Thumbnail */}
              {image?.url ? (
                <div className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <Image
                    src={image.url}
                    alt="Source image"
                    className="object-cover"
                    fill
                    sizes="64px"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  {caption.content || (
                    <span className="text-zinc-400 dark:text-zinc-500 italic">
                      Empty caption
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  {flavor && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {flavor.slug}
                    </span>
                  )}
                  <span
                    className={`text-xs font-medium ${
                      caption.like_count >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {caption.like_count >= 0 ? "+" : ""}
                    {caption.like_count}
                  </span>
                  {caption.is_featured && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">
                      Featured
                    </span>
                  )}
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    {new Date(caption.created_datetime_utc).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
