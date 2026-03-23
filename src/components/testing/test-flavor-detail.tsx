import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { TestFlavorPanel } from "./test-flavor-panel";
import type { HumorFlavor, TestImage } from "@/lib/types";

export async function TestFlavorDetail({ id }: { id: string }) {
  const supabase = await createClient();

  // Fetch flavor, step count, and test images in parallel
  const [flavorRes, stepsRes, imagesRes] = await Promise.all([
    supabase.from("humor_flavors").select("*").eq("id", id).single(),
    supabase
      .from("humor_flavor_steps")
      .select("id", { count: "exact" })
      .eq("humor_flavor_id", id),
    supabase
      .from("images")
      .select("id, created_datetime_utc, url, is_common_use, additional_context, image_description")
      .eq("is_common_use", true)
      .order("created_datetime_utc", { ascending: false })
      .limit(50),
  ]);

  if (flavorRes.error || !flavorRes.data) {
    notFound();
  }

  const flavor = flavorRes.data as HumorFlavor;
  const stepCount = stepsRes.count ?? 0;
  const testImages = (imagesRes.data ?? []) as TestImage[];

  return (
    <TestFlavorPanel
      flavor={flavor}
      testImages={testImages}
      stepCount={stepCount}
    />
  );
}
