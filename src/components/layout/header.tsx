"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { profile, signOut } = useAuth();

  return (
    <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center px-4 gap-3 shrink-0">
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors lg:hidden"
        aria-label="Toggle menu"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      <h1 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        Prompt Chain Tool
      </h1>

      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle />
        {profile && (
          <span className="text-sm text-zinc-500 dark:text-zinc-400 hidden sm:block">
            {profile.email}
          </span>
        )}
        <Button variant="secondary" onClick={signOut} className="text-xs">
          Log out
        </Button>
      </div>
    </header>
  );
}
