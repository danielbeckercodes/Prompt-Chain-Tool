import { createClient } from "@/lib/supabase/server";
import type { FlavorEngagementStats } from "@/lib/types";

export async function EngagementPerFlavor() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("db_get_flavor_engagement_stats");
  const stats: FlavorEngagementStats[] = data ?? [];

  if (stats.length === 0) {
    return (
      <div className="text-sm text-zinc-400 dark:text-zinc-500 py-12 text-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        No flavor engagement data yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
      <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">
        Engagement by Flavor
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
              <th className="pb-2 font-medium">Flavor</th>
              <th className="pb-2 font-medium text-right">Captions</th>
              <th className="pb-2 font-medium text-right">Net Likes</th>
              <th className="pb-2 font-medium text-right">Avg Score</th>
              <th className="pb-2 font-medium text-right">Featured</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {stats.map((row) => (
              <tr
                key={row.humor_flavor_id}
                className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <td className="py-2 text-zinc-900 dark:text-zinc-100">
                  {row.flavor_slug}
                </td>
                <td className="py-2 text-right text-zinc-600 dark:text-zinc-400">
                  {row.total_captions.toLocaleString()}
                </td>
                <td
                  className={`py-2 text-right font-medium ${
                    row.total_likes >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {row.total_likes.toLocaleString()}
                </td>
                <td className="py-2 text-right text-zinc-600 dark:text-zinc-400">
                  {Number(row.avg_like_count).toFixed(2)}
                </td>
                <td className="py-2 text-right text-zinc-600 dark:text-zinc-400">
                  {row.featured_count.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
