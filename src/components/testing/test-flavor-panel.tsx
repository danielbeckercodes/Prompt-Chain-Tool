"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageSelector } from "./image-selector";
import { GenerationResults } from "./generation-results";
import { generateCaptions } from "@/lib/api";
import type { TestImage, HumorFlavor } from "@/lib/types";

interface TestFlavorPanelProps {
  flavor: HumorFlavor;
  testImages: TestImage[];
  stepCount: number;
}

export function TestFlavorPanel({
  flavor,
  testImages,
  stepCount,
}: TestFlavorPanelProps) {
  const { toast } = useToast();
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [useUrlInput, setUseUrlInput] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{
    captions: string[];
    step_outputs?: { step: number; output: string }[];
  } | null>(null);

  const canGenerate =
    stepCount > 0 && (selectedImageId || (useUrlInput && imageUrl.trim()));

  async function handleGenerate() {
    if (!canGenerate) return;

    setIsGenerating(true);
    setError(null);
    setResults(null);

    try {
      const data = await generateCaptions({
        humor_flavor_id: flavor.id,
        image_id: selectedImageId || imageUrl.trim(),
      });

      // Normalize response — the API format may vary
      const captions: string[] = [];
      let step_outputs: { step: number; output: string }[] | undefined;

      if (Array.isArray(data)) {
        // API returned an array directly
        for (const item of data) {
          if (typeof item === "string") {
            captions.push(item);
          } else if (item?.content) {
            captions.push(item.content);
          }
        }
      } else if (data.captions) {
        if (Array.isArray(data.captions)) {
          for (const c of data.captions) {
            captions.push(typeof c === "string" ? c : c.content ?? String(c));
          }
        }
        step_outputs = data.step_outputs;
      } else if (data.content) {
        captions.push(data.content);
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        // Unknown format — show raw JSON as a single caption
        captions.push(JSON.stringify(data, null, 2));
      }

      setResults({ captions, step_outputs });
      toast("Captions generated", "success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to generate captions";
      setError(message);
      toast(message, "error");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Flavor info */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-100">
              {flavor.slug}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              {stepCount} step{stepCount !== 1 ? "s" : ""} in chain
              {flavor.description && ` — ${flavor.description}`}
            </p>
          </div>
        </div>
      </div>

      {stepCount === 0 ? (
        <div className="text-sm text-zinc-400 dark:text-zinc-500 py-12 text-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <p>This flavor has no steps defined.</p>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            Add steps to the prompt chain before testing.
          </p>
        </div>
      ) : (
        <>
          {/* Image selection */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                Select Test Image
              </h2>
              <button
                type="button"
                onClick={() => {
                  setUseUrlInput(!useUrlInput);
                  setSelectedImageId(null);
                  setImageUrl("");
                }}
                className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                {useUrlInput ? "Choose from library" : "Use image URL instead"}
              </button>
            </div>

            {useUrlInput ? (
              <Input
                label="Image URL"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            ) : (
              <ImageSelector
                images={testImages}
                selectedImageId={selectedImageId}
                onSelect={setSelectedImageId}
              />
            )}
          </section>

          {/* Generate button */}
          <div>
            <Button
              onClick={handleGenerate}
              loading={isGenerating}
              disabled={!canGenerate}
            >
              Generate Captions
            </Button>
          </div>

          {/* Results */}
          <GenerationResults
            results={results}
            isLoading={isGenerating}
            error={error}
          />
        </>
      )}
    </div>
  );
}
