"use client";

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { ImageSelector } from "./image-selector";
import { GenerationResults } from "./generation-results";
import { generateCaptions, generateCaptionsFromFile } from "@/lib/api";
import type { TestImage, HumorFlavor, PipelineStep } from "@/lib/types";

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
  const [useFileUpload, setUseFileUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<PipelineStep | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{
    captions: string[];
    step_outputs?: { step: number; output: string }[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup file preview URL on unmount
  useEffect(() => {
    return () => {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    };
  }, [filePreviewUrl]);

  const canGenerate =
    stepCount > 0 &&
    (selectedImageId || (useFileUpload && selectedFile)) &&
    !isGenerating;

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setFilePreviewUrl(URL.createObjectURL(file));
  }

  function switchMode() {
    setUseFileUpload(!useFileUpload);
    setSelectedImageId(null);
    setSelectedFile(null);
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setFilePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleGenerate() {
    if (!canGenerate) return;

    setIsGenerating(true);
    setError(null);
    setResults(null);
    setPipelineStep(null);

    try {
      let data;

      if (useFileUpload && selectedFile) {
        // Full pipeline: Steps 1-4
        data = await generateCaptionsFromFile(
          selectedFile,
          flavor.id,
          setPipelineStep
        );
      } else if (selectedImageId) {
        // Fast path: Step 4 only (library image already has valid UUID)
        setPipelineStep("generating");
        data = await generateCaptions({
          humor_flavor_id: flavor.id,
          image_id: selectedImageId,
        });
      }

      // Normalize response — the API format may vary
      const captions: string[] = [];
      let step_outputs: { step: number; output: string }[] | undefined;

      if (Array.isArray(data)) {
        for (const item of data) {
          if (typeof item === "string") {
            captions.push(item);
          } else if (item?.content) {
            captions.push(item.content);
          }
        }
      } else if (data?.captions) {
        if (Array.isArray(data.captions)) {
          for (const c of data.captions) {
            captions.push(typeof c === "string" ? c : c.content ?? String(c));
          }
        }
        step_outputs = data.step_outputs;
      } else if (data?.content) {
        captions.push(data.content);
      } else if (data?.error) {
        throw new Error(data.error);
      } else if (data) {
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
      setPipelineStep(null);
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
                onClick={switchMode}
                className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                {useFileUpload ? "Choose from library" : "Upload a file instead"}
              </button>
            </div>

            {useFileUpload ? (
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                />
                {filePreviewUrl ? (
                  <div className="space-y-3">
                    <div className="relative w-full max-w-xs aspect-square rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                      <img
                        src={filePreviewUrl}
                        alt="Selected file preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
                        {selectedFile?.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
                          setFilePreviewUrl(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center py-10 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors"
                  >
                    <svg
                      className="h-10 w-10 text-zinc-300 dark:text-zinc-600 mb-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                      />
                    </svg>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Click to select an image
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                      JPEG, PNG, WebP, GIF, or HEIC
                    </p>
                  </label>
                )}
              </div>
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
            pipelineStep={pipelineStep}
          />
        </>
      )}
    </div>
  );
}
