"use client";

import { forwardRef, useRef, useCallback, useEffect } from "react";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  autoResize?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, autoResize, onChange, ...props }, forwardedRef) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const localRef = useRef<HTMLTextAreaElement | null>(null);

    const setRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        localRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef]
    );

    const resize = useCallback(() => {
      const el = localRef.current;
      if (!el || !autoResize) return;
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }, [autoResize]);

    useEffect(() => {
      resize();
    }, [resize, props.value]);

    function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
      onChange?.(e);
      if (autoResize) resize();
    }

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            {label}
          </label>
        )}
        <textarea
          ref={setRef}
          id={textareaId}
          className={`w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:ring-zinc-100/20 font-mono ${
            autoResize ? "resize-none overflow-hidden min-h-[80px]" : "min-h-[120px] resize-y"
          } ${
            error ? "border-red-300 focus:ring-red-500/20" : ""
          } ${className ?? ""}`}
          onChange={handleChange}
          {...props}
        />
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
