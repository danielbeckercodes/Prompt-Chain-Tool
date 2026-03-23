"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { StepItem } from "./step-item";
import { StepForm } from "./step-form";
import type {
  HumorFlavorStep,
  HumorFlavorStepWithRelations,
  HumorFlavorStepType,
  LlmModel,
  LlmProvider,
  LlmInputType,
  LlmOutputType,
} from "@/lib/types";

interface StepListProps {
  flavorId: number;
  initialSteps: HumorFlavorStepWithRelations[];
  stepTypes: HumorFlavorStepType[];
  models: (LlmModel & { llm_providers: LlmProvider })[];
  inputTypes: LlmInputType[];
  outputTypes: LlmOutputType[];
}

export function StepList({
  flavorId,
  initialSteps,
  stepTypes,
  models,
  inputTypes,
  outputTypes,
}: StepListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [steps, setSteps] = useState(initialSteps);
  const [formOpen, setFormOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<HumorFlavorStep | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<HumorFlavorStepWithRelations | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const nextOrder = steps.length > 0 ? Math.max(...steps.map((s) => s.order_by)) + 1 : 1;

  const refreshSteps = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("humor_flavor_steps")
      .select(
        "*, humor_flavor_step_types(*), llm_models(*, llm_providers(*)), llm_input_types(*), llm_output_types(*)"
      )
      .eq("humor_flavor_id", flavorId)
      .order("order_by", { ascending: true });

    if (!error && data) {
      setSteps(data as HumorFlavorStepWithRelations[]);
    }
    router.refresh();
  }, [flavorId, router]);

  function handleAddStep() {
    setEditingStep(undefined);
    setFormOpen(true);
  }

  function handleEditStep(step: HumorFlavorStepWithRelations) {
    setEditingStep(step);
    setFormOpen(true);
  }

  async function handleDeleteStep() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const supabase = createClient();

    // Delete the step
    const { error } = await supabase
      .from("humor_flavor_steps")
      .delete()
      .eq("id", deleteTarget.id);

    if (error) {
      toast("Failed to delete step: " + error.message, "error");
      setIsDeleting(false);
      return;
    }

    // Re-normalize order for remaining steps
    const remaining = steps
      .filter((s) => s.id !== deleteTarget.id)
      .sort((a, b) => a.order_by - b.order_by);

    for (let i = 0; i < remaining.length; i++) {
      const newOrder = i + 1;
      if (remaining[i].order_by !== newOrder) {
        await supabase
          .from("humor_flavor_steps")
          .update({
            order_by: newOrder,
            modified_datetime_utc: new Date().toISOString(),
          })
          .eq("id", remaining[i].id);
      }
    }

    toast("Step deleted", "success");
    setDeleteTarget(null);
    setIsDeleting(false);
    await refreshSteps();
  }

  async function handleMoveStep(stepId: number, direction: "up" | "down") {
    setIsReordering(true);
    const supabase = createClient();
    const currentIndex = steps.findIndex((s) => s.id === stepId);
    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (swapIndex < 0 || swapIndex >= steps.length) {
      setIsReordering(false);
      return;
    }

    const currentStep = steps[currentIndex];
    const swapStep = steps[swapIndex];

    // Optimistic update
    const newSteps = [...steps];
    newSteps[currentIndex] = { ...swapStep, order_by: currentStep.order_by };
    newSteps[swapIndex] = { ...currentStep, order_by: swapStep.order_by };
    newSteps.sort((a, b) => a.order_by - b.order_by);
    setSteps(newSteps);

    // Persist to DB - swap order_by values
    const now = new Date().toISOString();
    const [res1, res2] = await Promise.all([
      supabase
        .from("humor_flavor_steps")
        .update({ order_by: swapStep.order_by, modified_datetime_utc: now })
        .eq("id", currentStep.id),
      supabase
        .from("humor_flavor_steps")
        .update({ order_by: currentStep.order_by, modified_datetime_utc: now })
        .eq("id", swapStep.id),
    ]);

    if (res1.error || res2.error) {
      toast("Failed to reorder steps", "error");
      await refreshSteps();
    }

    setIsReordering(false);
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Steps ({steps.length})
        </h2>
        <Button onClick={handleAddStep}>Add Step</Button>
      </div>

      {steps.length === 0 ? (
        <div className="text-sm text-zinc-400 dark:text-zinc-500 py-12 text-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <p>No steps yet.</p>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            Add steps to build your prompt chain.
          </p>
          <div className="mt-4">
            <Button onClick={handleAddStep} variant="secondary">
              Add your first step
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-0">
          {steps.map((step, index) => (
            <StepItem
              key={step.id}
              step={step}
              index={index}
              totalSteps={steps.length}
              onEdit={() => handleEditStep(step)}
              onDelete={() => setDeleteTarget(step)}
              onMoveUp={() => handleMoveStep(step.id, "up")}
              onMoveDown={() => handleMoveStep(step.id, "down")}
              isReordering={isReordering}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Step Modal */}
      <StepForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingStep(undefined);
        }}
        flavorId={flavorId}
        step={editingStep}
        nextOrder={nextOrder}
        stepTypes={stepTypes}
        models={models}
        inputTypes={inputTypes}
        outputTypes={outputTypes}
        onSaved={refreshSteps}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Step"
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          Are you sure you want to delete{" "}
          <strong>{deleteTarget?.description || `Step ${(steps.findIndex((s) => s.id === deleteTarget?.id) ?? 0) + 1}`}</strong>?
          Remaining steps will be re-numbered automatically.
        </p>
        <div className="flex gap-3">
          <Button variant="danger" onClick={handleDeleteStep} loading={isDeleting}>
            Delete
          </Button>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </section>
  );
}
