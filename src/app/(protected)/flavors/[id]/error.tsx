"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FlavorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-6 py-12 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Failed to load flavor
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {error.message || "Could not load this flavor."}
        </p>
      </div>
      <div className="flex items-center justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link href="/flavors">
          <Button variant="secondary">Back to flavors</Button>
        </Link>
      </div>
    </div>
  );
}
