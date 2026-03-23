"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

function getInitialError(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("error") === "auth_failed"
    ? "Authentication failed. Please try again."
    : null;
}

export default function LoginPage() {
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(getInitialError);
  const router = useRouter();
  const supabase = createClient();
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        // Check admin status before redirecting — avoid the loop
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_superadmin, is_matrix_admin")
          .eq("id", user.id)
          .single();

        if (profile?.is_superadmin || profile?.is_matrix_admin) {
          router.replace("/flavors");
          return;
        }
        // Not an admin — sign out so they can pick a different account
        await supabase.auth.signOut();
      }
      setInitializing(false);
    });
  }, [supabase, router]);

  async function handleSignIn() {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // If Supabase returned a URL but didn't auto-redirect, do it manually
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Prompt Chain Tool
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Sign in to manage humor flavors
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          <Button
            onClick={handleSignIn}
            loading={loading}
            disabled={initializing}
            className="w-full"
          >
            {initializing
              ? "Checking session…"
              : loading
                ? "Redirecting…"
                : "Sign in with Google"}
          </Button>
        </div>
      </div>
    </div>
  );
}
