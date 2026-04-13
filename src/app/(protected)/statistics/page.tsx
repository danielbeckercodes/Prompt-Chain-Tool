import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Skeleton } from "@/components/ui/skeleton";
import { EngagementPerFlavor } from "@/components/statistics/engagement-per-flavor";
import { VolumeOverTime } from "@/components/statistics/volume-over-time";
import { TopCaptions } from "@/components/statistics/top-captions";
import { ModelPerformance } from "@/components/statistics/model-performance";
import { CaptionSearch } from "@/components/statistics/caption-search";
import type { CaptionSummary } from "@/lib/types";

async function SummaryCards() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("db_get_caption_summary");
  const summary: CaptionSummary = data?.[0] ?? {
    total_captions: 0,
    total_likes: 0,
    total_featured: 0,
    avg_like_count: 0,
  };

  const cards = [
    { label: "Total Captions", value: summary.total_captions.toLocaleString() },
    {
      label: "Net Likes",
      value: summary.total_likes.toLocaleString(),
      color:
        summary.total_likes >= 0
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400",
    },
    { label: "Avg Score", value: Number(summary.avg_like_count).toFixed(2) },
    { label: "Featured", value: summary.total_featured.toLocaleString() },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6"
        >
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {card.label}
          </p>
          <p
            className={`text-2xl font-semibold tracking-tight mt-1 ${
              card.color ?? "text-zinc-900 dark:text-zinc-100"
            }`}
          >
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-2"
        >
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-7 w-16" />
        </div>
      ))}
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-3">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

export default function StatisticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        Statistics
      </h1>

      <Suspense fallback={<SummaryCardsSkeleton />}>
        <SummaryCards />
      </Suspense>

      <CaptionSearch />

      <Suspense fallback={<SectionSkeleton />}>
        <EngagementPerFlavor />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <VolumeOverTime />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <TopCaptions />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <ModelPerformance />
      </Suspense>
    </div>
  );
}
