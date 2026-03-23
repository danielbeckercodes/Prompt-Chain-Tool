import { createClient } from "@/lib/supabase/server";
import { FlavorCard } from "./flavor-card";
import type { HumorFlavor } from "@/lib/types";
import Link from "next/link";

type FlavorWithSteps = HumorFlavor & {
  humor_flavor_steps: { count: number }[];
};

export async function FlavorList() {
  const supabase = await createClient();

  const { data: flavors, error } = await supabase
    .from("humor_flavors")
    .select("*, humor_flavor_steps(count)")
    .order("created_datetime_utc", { ascending: false });

  if (error) {
    return (
      <div className="text-sm text-red-600 dark:text-red-400 py-8 text-center">
        Failed to load flavors: {error.message}
      </div>
    );
  }

  if (!flavors || flavors.length === 0) {
    return (
      <div className="text-sm text-zinc-400 dark:text-zinc-500 py-12 text-center">
        <p>No flavors yet.</p>
        <p className="mt-2">
          <Link
            href="/flavors/new"
            className="text-zinc-600 dark:text-zinc-400 underline hover:text-zinc-900 dark:hover:text-zinc-200"
          >
            Create your first flavor
          </Link>{" "}
          to get started.
        </p>
      </div>
    );
  }

  const flavorsWithCount = (flavors as FlavorWithSteps[]).map((f) => ({
    ...f,
    step_count: f.humor_flavor_steps?.[0]?.count ?? 0,
  }));

  return (
    <div className="space-y-3">
      {flavorsWithCount.map((flavor) => (
        <FlavorCard key={flavor.id} flavor={flavor} />
      ))}
    </div>
  );
}
