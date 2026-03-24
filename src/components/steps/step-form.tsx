"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import type {
  HumorFlavorStep,
  HumorFlavorStepType,
  LlmModel,
  LlmProvider,
  LlmInputType,
  LlmOutputType,
} from "@/lib/types";

interface StepFormProps {
  open: boolean;
  onClose: () => void;
  flavorId: number;
  step?: HumorFlavorStep;
  nextOrder: number;
  stepTypes: HumorFlavorStepType[];
  models: (LlmModel & { llm_providers: LlmProvider })[];
  inputTypes: LlmInputType[];
  outputTypes: LlmOutputType[];
  onSaved: () => void;
}

export function StepForm({
  open,
  onClose,
  flavorId,
  step,
  nextOrder,
  stepTypes,
  models,
  inputTypes,
  outputTypes,
  onSaved,
}: StepFormProps) {
  const { toast } = useToast();
  const isEdit = !!step;

  const [description, setDescription] = useState(step?.description ?? "");
  const [systemPrompt, setSystemPrompt] = useState(step?.llm_system_prompt ?? "");
  const [userPrompt, setUserPrompt] = useState(step?.llm_user_prompt ?? "");
  const [temperature, setTemperature] = useState(
    step?.llm_temperature != null ? String(step.llm_temperature) : ""
  );
  const [stepTypeId, setStepTypeId] = useState(
    step?.humor_flavor_step_type_id ?? stepTypes[0]?.id ?? 1
  );
  const [modelId, setModelId] = useState(
    step?.llm_model_id ?? models[0]?.id ?? 1
  );
  const [inputTypeId, setInputTypeId] = useState(
    step?.llm_input_type_id ?? inputTypes[0]?.id ?? 1
  );
  const [outputTypeId, setOutputTypeId] = useState(
    step?.llm_output_type_id ?? outputTypes[0]?.id ?? 1
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedModel = models.find((m) => m.id === modelId);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!description.trim()) {
      newErrors.description = "Description is required";
    }
    if (temperature.trim() !== "") {
      const t = parseFloat(temperature);
      if (isNaN(t) || t < 0 || t > 2) {
        newErrors.temperature = "Temperature must be between 0 and 2";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    const supabase = createClient();

    const payload = {
      humor_flavor_id: flavorId,
      description: description.trim() || null,
      llm_system_prompt: systemPrompt.trim() || null,
      llm_user_prompt: userPrompt.trim() || null,
      llm_temperature: temperature.trim() !== "" ? parseFloat(temperature) : null,
      humor_flavor_step_type_id: stepTypeId,
      llm_model_id: modelId,
      llm_input_type_id: inputTypeId,
      llm_output_type_id: outputTypeId,
      modified_datetime_utc: new Date().toISOString(),
    };

    if (isEdit) {
      const { error } = await supabase
        .from("humor_flavor_steps")
        .update(payload)
        .eq("id", step.id);

      if (error) {
        toast("Failed to save step: " + error.message, "error");
        setSaving(false);
        return;
      }
      toast("Step updated", "success");
    } else {
      const { error } = await supabase
        .from("humor_flavor_steps")
        .insert({ ...payload, order_by: nextOrder });

      if (error) {
        toast("Failed to create step: " + error.message, "error");
        setSaving(false);
        return;
      }
      toast("Step added", "success");
    }

    setSaving(false);
    onSaved();
    onClose();
  }

  // Group models by provider
  const modelsByProvider = models.reduce(
    (acc, model) => {
      const providerName = model.llm_providers?.name ?? "Unknown";
      if (!acc[providerName]) acc[providerName] = [];
      acc[providerName].push(model);
      return acc;
    },
    {} as Record<string, typeof models>
  );

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Step" : "Add Step"}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          label="Description"
          placeholder="e.g. Describe what's in the image"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Step Type
            </label>
            <select
              value={stepTypeId}
              onChange={(e) => setStepTypeId(Number(e.target.value))}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/20"
            >
              {stepTypes.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.description}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              LLM Model
            </label>
            <select
              value={modelId}
              onChange={(e) => setModelId(Number(e.target.value))}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/20"
            >
              {Object.entries(modelsByProvider).map(([provider, providerModels]) => (
                <optgroup key={provider} label={provider}>
                  {providerModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Input Type
            </label>
            <select
              value={inputTypeId}
              onChange={(e) => setInputTypeId(Number(e.target.value))}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/20"
            >
              {inputTypes.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.description}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Output Type
            </label>
            <select
              value={outputTypeId}
              onChange={(e) => setOutputTypeId(Number(e.target.value))}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/20"
            >
              {outputTypes.map((ot) => (
                <option key={ot.id} value={ot.id}>
                  {ot.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Textarea
          label="System Prompt"
          placeholder="System instructions for the LLM..."
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          className="!min-h-[72px]"
        />

        <Textarea
          label="User Prompt"
          placeholder="User prompt template..."
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          className="!min-h-[72px]"
        />

        {selectedModel?.is_temperature_supported && (
          <Input
            label="Temperature"
            type="number"
            step="0.1"
            min="0"
            max="2"
            placeholder="0.0 - 2.0"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            error={errors.temperature}
          />
        )}

        <div className="flex gap-3 pt-1">
          <Button type="submit" loading={saving}>
            {isEdit ? "Save Changes" : "Add Step"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
