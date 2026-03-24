import type {
  GenerateRequest,
  PresignedUrlResponse,
  RegisterImageResponse,
  PipelineStep,
} from "@/lib/types";

async function fetchJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
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

  return data as T;
}

/** Step 4: Generate captions (existing) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateCaptions(params: GenerateRequest): Promise<any> {
  return fetchJson("/api/generate", params);
}

/** Step 1: Get presigned S3 upload URL */
export async function getPresignedUrl(
  contentType: string
): Promise<PresignedUrlResponse> {
  return fetchJson<PresignedUrlResponse>("/api/presigned-url", { contentType });
}

/** Step 2: Upload file bytes directly to S3 (no proxy needed) */
export async function uploadToPresignedUrl(
  presignedUrl: string,
  file: File
): Promise<void> {
  const response = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Image upload failed with status ${response.status}`);
  }
}

/** Step 3: Register uploaded image with the pipeline */
export async function registerImage(
  imageUrl: string
): Promise<RegisterImageResponse> {
  return fetchJson<RegisterImageResponse>("/api/register-image", {
    imageUrl,
    isCommonUse: false,
  });
}

/** Run the full pipeline: presign → upload → register → generate captions */
export async function generateCaptionsFromFile(
  file: File,
  humorFlavorId: number,
  onProgress?: (step: PipelineStep) => void
) {
  const contentType = file.type || "image/jpeg";

  // Step 1: Get presigned URL
  onProgress?.("presigning");
  const { presignedUrl, cdnUrl } = await getPresignedUrl(contentType);

  // Step 2: Upload to S3
  onProgress?.("uploading");
  await uploadToPresignedUrl(presignedUrl, file);

  // Step 3: Register image
  onProgress?.("registering");
  const { imageId } = await registerImage(cdnUrl);

  // Step 4: Generate captions
  onProgress?.("generating");
  return generateCaptions({ humor_flavor_id: humorFlavorId, image_id: imageId });
}
