import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { FlavorForm } from "./flavor-form";
import { FlavorDeleteButton } from "./flavor-delete-button";
import { StepList } from "@/components/steps/step-list";
import { CaptionHistory } from "@/components/testing/caption-history";
import type {
  HumorFlavor,
  HumorFlavorStepWithRelations,
  HumorFlavorStepType,
  LlmModel,
  LlmProvider,
  LlmInputType,
  LlmOutputType,
  CaptionWithImage,
} from "@/lib/types";

export async function FlavorDetail({ id }: { id: string }) {
  const supabase = await createClient();

  // Fetch flavor, steps, lookup tables, and captions in parallel
  const [flavorRes, stepsRes, stepTypesRes, modelsRes, inputTypesRes, outputTypesRes, captionsRes] =
    await Promise.all([
      supabase.from("humor_flavors").select("*").eq("id", id).single(),
      supabase
        .from("humor_flavor_steps")
        .select(
          "*, humor_flavor_step_types(*), llm_models(*, llm_providers(*)), llm_input_types(*), llm_output_types(*)"
        )
        .eq("humor_flavor_id", id)
        .order("order_by", { ascending: true }),
      supabase.from("humor_flavor_step_types").select("*").order("id"),
      supabase.from("llm_models").select("*, llm_providers(*)").order("name"),
      supabase.from("llm_input_types").select("*").order("id"),
      supabase.from("llm_output_types").select("*").order("id"),
      supabase
        .from("captions")
        .select("*, images(id, url)")
        .eq("humor_flavor_id", id)
        .order("created_datetime_utc", { ascending: false })
        .limit(20),
    ]);

  if (flavorRes.error || !flavorRes.data) {
    notFound();
  }

  const flavor = flavorRes.data as HumorFlavor;
  const steps = (stepsRes.data ?? []) as HumorFlavorStepWithRelations[];
  const stepTypes = (stepTypesRes.data ?? []) as HumorFlavorStepType[];
  const models = (modelsRes.data ?? []) as (LlmModel & { llm_providers: LlmProvider })[];
  const inputTypes = (inputTypesRes.data ?? []) as LlmInputType[];
  const outputTypes = (outputTypesRes.data ?? []) as LlmOutputType[];
  const captions = (captionsRes.data ?? []) as CaptionWithImage[];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {flavor.slug}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Created{" "}
            {new Date(flavor.created_datetime_utc).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/flavors/${flavor.id}/test`}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Test Flavor
          </Link>
          <FlavorDeleteButton flavorId={flavor.id} flavorName={flavor.slug} />
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Details</h2>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <FlavorForm flavor={flavor} />
        </div>
      </section>

      <StepList
        flavorId={flavor.id}
        initialSteps={steps}
        stepTypes={stepTypes}
        models={models}
        inputTypes={inputTypes}
        outputTypes={outputTypes}
      />

      <CaptionHistory captions={captions} />
    </div>
  );
}
