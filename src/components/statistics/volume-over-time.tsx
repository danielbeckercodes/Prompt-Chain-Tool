import { createClient } from "@/lib/supabase/server";
import type { VolumeByDate } from "@/lib/types";

export async function VolumeOverTime() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("db_get_caption_volume_by_day", {
    days_back: 30,
  });
  const rawData: VolumeByDate[] = data ?? [];

  // Fill in zero-count days
  const today = new Date();
  const days: { date: string; count: number; dayOfMonth: number }[] = [];
  const countMap = new Map(rawData.map((d) => [d.date, d.count]));

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    days.push({
      date: dateStr,
      count: countMap.get(dateStr) ?? 0,
      dayOfMonth: d.getDate(),
    });
  }

  const maxCount = Math.max(...days.map((d) => d.count), 1);

  if (rawData.length === 0) {
    return (
      <div className="text-sm text-zinc-400 dark:text-zinc-500 py-12 text-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        No caption volume data in the last 30 days.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
      <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">
        Caption Volume (Last 30 Days)
      </h2>
      <div className="flex items-end gap-1 h-48">
        {days.map((day) => {
          const pct = (day.count / maxCount) * 100;
          return (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center justify-end h-full"
            >
              <div
                className="w-full bg-zinc-900 dark:bg-zinc-100 rounded-t min-h-[2px]"
                style={{ height: `${pct}%` }}
                title={`${day.date}: ${day.count} captions`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-1 mt-1">
        {days.map((day) => (
          <div
            key={day.date}
            className="flex-1 text-center text-[10px] text-zinc-400 dark:text-zinc-500"
          >
            {day.dayOfMonth % 5 === 0 || day.dayOfMonth === 1
              ? day.dayOfMonth
              : ""}
          </div>
        ))}
      </div>
    </div>
  );
}
