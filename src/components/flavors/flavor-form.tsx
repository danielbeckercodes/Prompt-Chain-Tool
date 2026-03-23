"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { HumorFlavor } from "@/lib/types";

interface FlavorFormProps {
  flavor?: HumorFlavor;
}

export function FlavorForm({ flavor }: FlavorFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [slug, setSlug] = useState(flavor?.slug ?? "");
  const [description, setDescription] = useState(flavor?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ slug?: string }>({});

  const isEdit = !!flavor;

  function validate(): boolean {
    const newErrors: { slug?: string } = {};
    if (!slug.trim()) {
      newErrors.slug = "Name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    const supabase = createClient();

    if (isEdit) {
      const { error } = await supabase
        .from("humor_flavors")
        .update({
          slug: slug.trim(),
          description: description.trim() || null,
          modified_datetime_utc: new Date().toISOString(),
        })
        .eq("id", flavor.id);

      if (error) {
        toast("Failed to save: " + error.message, "error");
        setSaving(false);
        return;
      }

      toast("Flavor updated", "success");
      router.refresh();
      setSaving(false);
    } else {
      const { data, error } = await supabase
        .from("humor_flavors")
        .insert({
          slug: slug.trim(),
          description: description.trim() || null,
        })
        .select("id")
        .single();

      if (error) {
        toast("Failed to create: " + error.message, "error");
        setSaving(false);
        return;
      }

      toast("Flavor created", "success");
      router.push(`/flavors/${data.id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <Input
        label="Name"
        placeholder="e.g. sarcastic-roast"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        error={errors.slug}
        required
      />
      <Textarea
        label="Description"
        placeholder="What does this flavor do?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="min-h-[80px]"
      />
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={saving}>
          {isEdit ? "Save Changes" : "Create Flavor"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
