import { Suspense } from "react";
import Link from "next/link";
import { FlavorList } from "@/components/flavors/flavor-list";
import { Skeleton } from "@/components/ui/skeleton";

function FlavorListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-3"
        >
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

export default function FlavorsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Humor Flavors
        </h1>
        <Link
          href="/flavors/new"
          className="px-4 py-2 text-sm font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 transition-colors"
        >
          New Flavor
        </Link>
      </div>

      <Suspense fallback={<FlavorListSkeleton />}>
        <FlavorList />
      </Suspense>
    </div>
  );
}
