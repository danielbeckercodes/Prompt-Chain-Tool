"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function FlavorDeleteButton({
  flavorId,
  flavorName,
}: {
  flavorId: number;
  flavorName: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("humor_flavors")
      .delete()
      .eq("id", flavorId);

    if (error) {
      toast("Failed to delete: " + error.message, "error");
      setDeleting(false);
      setOpen(false);
      return;
    }

    toast("Flavor deleted", "success");
    router.push("/flavors");
  }

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Delete Flavor">
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
          Are you sure you want to delete <strong>{flavorName}</strong>? This
          will also delete all its steps. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
