"use client";

import Image from "next/image";
import type { CaptionWithImage } from "@/lib/types";

interface CaptionHistoryProps {
  captions: CaptionWithImage[];
}

export function CaptionHistory({ captions }: CaptionHistoryProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
        Caption History ({captions.length})
      </h2>

      {captions.length === 0 ? (
        <div className="text-sm text-zinc-400 dark:text-zinc-500 py-12 text-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <p>No captions generated yet.</p>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            Test this flavor to generate captions.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {captions.map((caption) => (
            <div
              key={caption.id}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4"
            >
              <div className="flex gap-4">
                {/* Source image thumbnail */}
                {caption.images?.url && (
                  <div className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <Image
                      src={caption.images.url}
                      alt="Source image"
                      className="object-cover"
                      fill
                      sizes="64px"
                      unoptimized
                    />
                  </div>
                )}

                {/* Caption content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    {caption.content || (
                      <span className="text-zinc-400 dark:text-zinc-500 italic">Empty caption</span>
                    )}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5">
                    {new Date(caption.created_datetime_utc).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
