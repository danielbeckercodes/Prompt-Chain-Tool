"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AccessDeniedPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    setLoading(true);
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Access Denied
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Your account does not have admin access to this application.
            Contact a superadmin if you believe this is a mistake.
          </p>
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="inline-block px-4 py-2 text-sm font-medium rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {loading ? "Signing out…" : "Sign in with a different account"}
          </button>
        </div>
      </div>
    </div>
  );
}
