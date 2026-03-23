import { Suspense } from "react";
import Link from "next/link";
import { TestFlavorDetail } from "@/components/testing/test-flavor-detail";
import { Skeleton } from "@/components/ui/skeleton";

function TestSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <Skeleton className="h-5 w-32" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default async function TestFlavorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Link
          href={`/flavors/${id}`}
          className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
        >
          Flavor Detail
        </Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-100 font-medium">Test</span>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        Test Flavor
      </h1>

      <Suspense fallback={<TestSkeleton />}>
        <TestFlavorDetail id={id} />
      </Suspense>
    </div>
  );
}
