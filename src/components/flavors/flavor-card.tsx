"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { FlavorDuplicateButton } from "./flavor-duplicate-button";
import type { HumorFlavorWithStepCount } from "@/lib/types";

export function FlavorCard({ flavor }: { flavor: HumorFlavorWithStepCount }) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("humor_flavors")
      .delete()
      .eq("id", flavor.id);

    if (error) {
      toast("Failed to delete flavor: " + error.message, "error");
      setDeleting(false);
      setDeleteOpen(false);
      return;
    }

    toast("Flavor deleted", "success");
    setDeleteOpen(false);
    router.refresh();
  }

  return (
    <>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <Link href={`/flavors/${flavor.id}`} className="flex-1 min-w-0">
            <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100 truncate">
              {flavor.slug}
            </h3>
            {flavor.description && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                {flavor.description}
              </p>
            )}
            <div className="flex items-center gap-4 mt-3 text-xs text-zinc-400 dark:text-zinc-500">
              <span>
                {flavor.step_count} {flavor.step_count === 1 ? "step" : "steps"}
              </span>
              <span>
                Created{" "}
                {new Date(flavor.created_datetime_utc).toLocaleDateString()}
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-2 shrink-0 self-start">
            <FlavorDuplicateButton
              flavorId={flavor.id}
              flavorName={flavor.slug}
              className="text-xs"
            />
            <Button
              variant="danger"
              onClick={() => setDeleteOpen(true)}
              className="text-xs"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Flavor"
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
          Are you sure you want to delete <strong>{flavor.slug}</strong>? This
          will also delete all its steps. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={deleting}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
