import { FlavorForm } from "@/components/flavors/flavor-form";

export default function NewFlavorPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        New Flavor
      </h1>
      <FlavorForm />
    </div>
  );
}
