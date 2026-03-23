import { Suspense } from "react";
import { FlavorDetail } from "@/components/flavors/flavor-detail";
import { Skeleton } from "@/components/ui/skeleton";

function FlavorDetailSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-32 mt-2" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-5 w-20" />
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}

export default async function FlavorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<FlavorDetailSkeleton />}>
      <FlavorDetail id={id} />
    </Suspense>
  );
}
