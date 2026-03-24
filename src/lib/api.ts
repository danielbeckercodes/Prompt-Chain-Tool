import type { GenerateRequest } from "@/lib/types";

export async function generateCaptions(params: GenerateRequest) {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}
