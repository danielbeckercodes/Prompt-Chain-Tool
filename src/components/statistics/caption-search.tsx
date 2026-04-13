"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import type { TopCaption } from "@/lib/types";

function getFirst<T>(val: T | T[] | null | undefined): T | null {
  if (val == null) return null;
  return Array.isArray(val) ? val[0] ?? null : val;
}

type FlavorResult = {
  id: number;
  slug: string;
  description: string | null;
};

type SearchMode = "captions" | "flavors";

export function CaptionSearch() {
  const [mode, setMode] = useState<SearchMode>("captions");
  const [query, setQuery] = useState("");
  const [captionResults, setCaptionResults] = useState<TopCaption[]>([]);
  const [flavorResults, setFlavorResults] = useState<FlavorResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(
    (value: string, searchMode: SearchMode) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      if (!value.trim()) {
        setCaptionResults([]);
        setFlavorResults([]);
        setHasSearched(false);
        return;
      }

      timerRef.current = setTimeout(async () => {
        setLoading(true);
        setHasSearched(true);
        const supabase = createClient();

        if (searchMode === "captions") {
          const { data } = await supabase
            .from("captions")
            .select(
              "id, content, like_count, is_featured, created_datetime_utc, humor_flavors(slug), images(url)"
            )
            .ilike("content", `%${value}%`)
            .order("like_count", { ascending: false })
            .limit(20);
          setCaptionResults((data as unknown as TopCaption[]) ?? []);
          setFlavorResults([]);
        } else {
          const { data } = await supabase
            .from("humor_flavors")
            .select("id, slug, description")
            .or(`slug.ilike.%${value}%,description.ilike.%${value}%`)
            .order("slug")
            .limit(20);
          setFlavorResults((data as FlavorResult[]) ?? []);
          setCaptionResults([]);
        }

        setLoading(false);
      }, 300);
    },
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    search(value, mode);
  };

  const handleModeChange = (newMode: SearchMode) => {
    setMode(newMode);
    if (query.trim()) {
      search(query, newMode);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
      <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">
        Search
      </h2>

      {/* Mode toggle */}
      <div className="flex gap-1 mb-3">
        {(["captions", "flavors"] as const).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              mode === m
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            {m === "captions" ? "Captions" : "Flavors"}
          </button>
        ))}
      </div>

      <Input
        placeholder={
          mode === "captions"
            ? "Search captions..."
            : "Search flavors by slug or description..."
        }
        value={query}
        onChange={handleInputChange}
      />

      {/* Results */}
      <div className="mt-4">
        {loading && (
          <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-4">
            Searching...
          </p>
        )}

        {!loading && !hasSearched && (
          <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-4">
            Search captions or flavors...
          </p>
        )}

        {!loading && hasSearched && mode === "captions" && captionResults.length === 0 && (
          <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-4">
            No captions found.
          </p>
        )}

        {!loading && hasSearched && mode === "flavors" && flavorResults.length === 0 && (
          <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-4">
            No flavors found.
          </p>
        )}

        {/* Caption results */}
        {!loading && captionResults.length > 0 && (
          <div className="space-y-3">
            {captionResults.map((caption) => {
              const flavor = getFirst(caption.humor_flavors);
              const image = getFirst(caption.images);
              return (
                <div
                  key={caption.id}
                  className="flex gap-4 items-start rounded-lg p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
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
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Flavor results */}
        {!loading && flavorResults.length > 0 && (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {flavorResults.map((flavor) => (
              <Link
                key={flavor.id}
                href={`/flavors/${flavor.id}`}
                className="block py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg px-3 transition-colors"
              >
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {flavor.slug}
                </p>
                {flavor.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {flavor.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
