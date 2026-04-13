import { createClient } from "@/lib/supabase/server";
import type { ModelPerformanceStats } from "@/lib/types";

export async function ModelPerformance() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("db_get_model_performance_stats");
  const stats: ModelPerformanceStats[] = data ?? [];

  if (stats.length === 0) {
    return (
      <div className="text-sm text-zinc-400 dark:text-zinc-500 py-12 text-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        No model performance data yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
      <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">
        Model Performance
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
              <th className="pb-2 font-medium">Model</th>
              <th className="pb-2 font-medium">Provider</th>
              <th className="pb-2 font-medium text-right">Responses</th>
              <th className="pb-2 font-medium text-right">Avg Time</th>
              <th className="pb-2 font-medium text-right">Captions</th>
              <th className="pb-2 font-medium text-right">Avg Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {stats.map((row) => (
              <tr
                key={row.llm_model_id}
                className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <td className="py-2 text-zinc-900 dark:text-zinc-100">
                  {row.model_name}
                </td>
                <td className="py-2 text-zinc-600 dark:text-zinc-400">
                  {row.provider_name}
                </td>
                <td className="py-2 text-right text-zinc-600 dark:text-zinc-400">
                  {row.total_responses.toLocaleString()}
                </td>
                <td className="py-2 text-right text-zinc-600 dark:text-zinc-400">
                  {Number(row.avg_processing_time).toFixed(2)}s
                </td>
                <td className="py-2 text-right text-zinc-600 dark:text-zinc-400">
                  {row.caption_count.toLocaleString()}
                </td>
                <td className="py-2 text-right text-zinc-600 dark:text-zinc-400">
                  {Number(row.avg_caption_score).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
