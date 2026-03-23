"use client";

import Image from "next/image";
import type { TestImage } from "@/lib/types";

interface ImageSelectorProps {
  images: TestImage[];
  selectedImageId: string | null;
  onSelect: (imageId: string) => void;
}

export function ImageSelector({
  images,
  selectedImageId,
  onSelect,
}: ImageSelectorProps) {
  if (images.length === 0) {
    return (
      <div className="text-sm text-zinc-400 dark:text-zinc-500 py-12 text-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <p>No test images available.</p>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Common-use images will appear here once added to the database.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {images.map((image) => {
        const isSelected = selectedImageId === image.id;
        return (
          <button
            key={image.id}
            type="button"
            onClick={() => onSelect(image.id)}
            className={`relative rounded-xl border-2 overflow-hidden aspect-square transition-all ${
              isSelected
                ? "border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-900/20 dark:ring-zinc-100/20"
                : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500"
            }`}
          >
            {image.url ? (
              <Image
                src={image.url}
                alt={image.image_description || image.additional_context || "Test image"}
                className="w-full h-full object-cover"
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-zinc-300 dark:text-zinc-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
                  />
                </svg>
              </div>
            )}
            {isSelected && (
              <div className="absolute top-1.5 right-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full p-0.5">
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="3"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
