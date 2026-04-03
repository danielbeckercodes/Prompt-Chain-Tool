"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

export function FlavorDuplicateButton({
  flavorId,
  flavorName,
  className,
}: {
  flavorId: number;
  flavorName: string;
  className?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [duplicating, setDuplicating] = useState(false);

  async function handleDuplicate() {
    setDuplicating(true);
    const supabase = createClient();

    // 1. Fetch the source flavor
    const { data: source, error: fetchError } = await supabase
      .from("humor_flavors")
      .select("*")
      .eq("id", flavorId)
      .single();

    if (fetchError || !source) {
      toast("Failed to read flavor: " + (fetchError?.message ?? "Not found"), "error");
      setDuplicating(false);
      return;
    }

    // 2. Create the new flavor
    const now = new Date().toISOString();
    const { data: newFlavor, error: insertError } = await supabase
      .from("humor_flavors")
      .insert({
        slug: source.slug + " (Copy)",
        description: source.description,
        modified_datetime_utc: now,
      })
      .select("id")
      .single();

    if (insertError || !newFlavor) {
      toast("Failed to duplicate flavor: " + (insertError?.message ?? "Unknown error"), "error");
      setDuplicating(false);
      return;
    }

    // 3. Fetch all steps from the source flavor
    const { data: steps, error: stepsError } = await supabase
      .from("humor_flavor_steps")
      .select("*")
      .eq("humor_flavor_id", flavorId)
      .order("order_by", { ascending: true });

    if (stepsError) {
      toast("Flavor created but failed to copy steps: " + stepsError.message, "error");
      setDuplicating(false);
      router.push(`/flavors/${newFlavor.id}`);
      return;
    }

    // 4. Insert copied steps for the new flavor
    if (steps && steps.length > 0) {
      const newSteps = steps.map((s) => ({
        humor_flavor_id: newFlavor.id,
        order_by: s.order_by,
        description: s.description,
        llm_system_prompt: s.llm_system_prompt,
        llm_user_prompt: s.llm_user_prompt,
        llm_temperature: s.llm_temperature,
        llm_input_type_id: s.llm_input_type_id,
        llm_output_type_id: s.llm_output_type_id,
        llm_model_id: s.llm_model_id,
        humor_flavor_step_type_id: s.humor_flavor_step_type_id,
        modified_datetime_utc: now,
      }));

      const { error: copyError } = await supabase
        .from("humor_flavor_steps")
        .insert(newSteps);

      if (copyError) {
        toast("Flavor created but failed to copy steps: " + copyError.message, "error");
        setDuplicating(false);
        router.push(`/flavors/${newFlavor.id}`);
        return;
      }
    }

    toast(`Duplicated "${flavorName}"`, "success");
    setDuplicating(false);
    router.push(`/flavors/${newFlavor.id}`);
  }

  return (
    <Button
      variant="secondary"
      loading={duplicating}
      onClick={handleDuplicate}
      className={className}
    >
      Duplicate
    </Button>
  );
}
