"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StepInlineForm } from "./step-inline-form";
import type {
  HumorFlavorStepWithRelations,
  HumorFlavorStepType,
  LlmModel,
  LlmProvider,
  LlmInputType,
  LlmOutputType,
} from "@/lib/types";

interface StepItemProps {
  step: HumorFlavorStepWithRelations;
  index: number;
  totalSteps: number;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isReordering: boolean;
  flavorId: number;
  stepTypes: HumorFlavorStepType[];
  models: (LlmModel & { llm_providers: LlmProvider })[];
  inputTypes: LlmInputType[];
  outputTypes: LlmOutputType[];
  onSaved: () => void;
}

export function StepItem({
  step,
  index,
  totalSteps,
  isEditing,
  onEdit,
  onCancelEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isReordering,
  flavorId,
  stepTypes,
  models,
  inputTypes,
  outputTypes,
  onSaved,
}: StepItemProps) {
  const isFirst = index === 0;
  const isLast = index === totalSteps - 1;
  const stepNumber = index + 1;
  const [promptsExpanded, setPromptsExpanded] = useState(false);

  const inputLabel = isFirst
    ? "Takes image as input"
    : `Takes output from Step ${stepNumber - 1}`;

  return (
    <div className="relative">
      {/* Arrow connector */}
      {!isFirst && (
        <div className="flex justify-center -mt-1 mb-1">
          <svg
            className="h-6 w-6 text-zinc-300 dark:text-zinc-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m0 0l-6-6m6 6l6-6"
            />
          </svg>
        </div>
      )}

      <div
        className={`rounded-xl border ${
          isEditing
            ? "border-zinc-400 dark:border-zinc-500 ring-2 ring-zinc-900/5 dark:ring-zinc-100/10"
            : "border-zinc-200 dark:border-zinc-800"
        } bg-white dark:bg-zinc-900 p-4`}
      >
        <div className="flex items-start gap-3 min-w-0">
          {/* Step number badge */}
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-sm font-medium">
            {stepNumber}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                  {inputLabel}
                </p>
                <StepInlineForm
                  flavorId={flavorId}
                  step={step}
                  stepTypes={stepTypes}
                  models={models}
                  inputTypes={inputTypes}
                  outputTypes={outputTypes}
                  onSaved={() => {
                    onSaved();
                    onCancelEdit();
                  }}
                  onCancel={onCancelEdit}
                />
              </div>
            ) : (
              <>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {step.description || `Step ${stepNumber}`}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {inputLabel}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                    <Button
                      variant="icon"
                      onClick={onMoveUp}
                      disabled={isFirst || isReordering}
                      title="Move up"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 15.75l7.5-7.5 7.5 7.5"
                        />
                      </svg>
                    </Button>
                    <Button
                      variant="icon"
                      onClick={onMoveDown}
                      disabled={isLast || isReordering}
                      title="Move down"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </Button>
                    <Button variant="icon" onClick={onEdit} title="Edit step">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                        />
                      </svg>
                    </Button>
                    <Button
                      variant="icon"
                      onClick={onDelete}
                      title="Delete step"
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    </Button>
                  </div>
                </div>

                {/* Metadata pills */}
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                    {step.humor_flavor_step_types?.description ?? "Unknown type"}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                    {step.llm_models?.name ?? "Unknown model"}
                  </span>
                  {step.llm_temperature != null && (
                    <span className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                      Temp: {step.llm_temperature}
                    </span>
                  )}
                  <span className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                    In: {step.llm_input_types?.description ?? "?"}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                    Out: {step.llm_output_types?.description ?? "?"}
                  </span>
                </div>

                {/* Expandable prompt preview */}
                {(step.llm_system_prompt || step.llm_user_prompt) && (
                  <div className="mt-3 space-y-2">
                    {step.llm_system_prompt && (
                      <div>
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-0.5">
                          System Prompt
                        </p>
                        <p
                          className={`text-xs text-zinc-600 dark:text-zinc-400 font-mono bg-zinc-50 dark:bg-zinc-800 rounded-lg px-2.5 py-1.5 whitespace-pre-wrap ${
                            promptsExpanded ? "" : "line-clamp-2"
                          }`}
                        >
                          {step.llm_system_prompt}
                        </p>
                      </div>
                    )}
                    {step.llm_user_prompt && (
                      <div>
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-0.5">
                          User Prompt
                        </p>
                        <p
                          className={`text-xs text-zinc-600 dark:text-zinc-400 font-mono bg-zinc-50 dark:bg-zinc-800 rounded-lg px-2.5 py-1.5 whitespace-pre-wrap ${
                            promptsExpanded ? "" : "line-clamp-2"
                          }`}
                        >
                          {step.llm_user_prompt}
                        </p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setPromptsExpanded(!promptsExpanded)}
                      className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    >
                      {promptsExpanded ? "Show less" : "Show more"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
