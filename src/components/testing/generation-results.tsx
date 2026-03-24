"use client";

import type { PipelineStep } from "@/lib/types";

const STEP_LABELS: Record<PipelineStep, string> = {
  presigning: "Preparing upload...",
  uploading: "Uploading image...",
  registering: "Registering image...",
  generating: "Generating captions... This may take a moment.",
};

interface GenerationResultsProps {
  results: {
    captions: string[];
    step_outputs?: { step: number; output: string }[];
  } | null;
  isLoading: boolean;
  error: string | null;
  pipelineStep?: PipelineStep | null;
}

export function GenerationResults({
  results,
  isLoading,
  error,
  pipelineStep,
}: GenerationResultsProps) {
  if (isLoading) {
    const label = pipelineStep
      ? STEP_LABELS[pipelineStep]
      : "Generating captions...";

    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <div className="flex items-center gap-3">
          <svg
            className="animate-spin h-5 w-5 text-zinc-500 dark:text-zinc-400"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {label}
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6">
        <p className="text-sm font-medium text-red-800 dark:text-red-300">Generation failed</p>
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
      </div>
    );
  }

  if (!results) return null;

  return (
    <div className="space-y-4">
      {/* Step-by-step outputs (if available) */}
      {results.step_outputs && results.step_outputs.length > 0 && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-3">
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Step-by-Step Outputs
          </h3>
          <div className="space-y-2">
            {results.step_outputs.map((so) => (
              <div key={so.step} className="space-y-1">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Step {so.step}
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono bg-zinc-50 dark:bg-zinc-800 rounded-lg px-2.5 py-1.5 whitespace-pre-wrap">
                  {so.output}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated captions */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-3">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Generated Captions ({results.captions.length})
        </h3>
        {results.captions.length === 0 ? (
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            No captions were generated. The API may have returned an empty
            result.
          </p>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {results.captions.map((caption, i) => (
              <div key={i} className="py-2 first:pt-0 last:pb-0">
                <p className="text-sm text-zinc-700 dark:text-zinc-300">{caption}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
