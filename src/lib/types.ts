// Types based on actual Supabase DB schema (discovered in Phase 0)

export type HumorFlavor = {
  id: number; // bigint PK
  created_datetime_utc: string;
  modified_datetime_utc: string;
  slug: string; // display name / identifier
  description: string | null;
  created_by_user_id: string; // uuid FK → profiles.id
  modified_by_user_id: string; // uuid FK → profiles.id
};

export type HumorFlavorWithStepCount = HumorFlavor & {
  step_count: number;
};

export type HumorFlavorStep = {
  id: number; // bigint PK
  created_datetime_utc: string;
  modified_datetime_utc: string;
  humor_flavor_id: number; // FK → humor_flavors.id
  order_by: number; // smallint — ordering column
  llm_system_prompt: string | null;
  llm_user_prompt: string | null;
  llm_temperature: number | null;
  llm_input_type_id: number; // FK → llm_input_types.id
  llm_output_type_id: number; // FK → llm_output_types.id
  llm_model_id: number; // FK → llm_models.id
  humor_flavor_step_type_id: number; // FK → humor_flavor_step_types.id
  description: string | null;
  created_by_user_id: string;
  modified_by_user_id: string;
};

export type HumorFlavorStepType = {
  id: number; // smallint PK
  slug: string;
  description: string;
};

export type LlmModel = {
  id: number; // smallint PK
  name: string;
  provider_model_id: string;
  is_temperature_supported: boolean;
  llm_provider_id: number;
};

export type LlmProvider = {
  id: number;
  name: string;
};

export type LlmInputType = {
  id: number;
  slug: string;
  description: string;
};

export type LlmOutputType = {
  id: number;
  slug: string;
  description: string;
};

export type HumorFlavorStepWithRelations = HumorFlavorStep & {
  humor_flavor_step_types: HumorFlavorStepType;
  llm_models: LlmModel & { llm_providers: LlmProvider };
  llm_input_types: LlmInputType;
  llm_output_types: LlmOutputType;
};

// Image from the images table
export type TestImage = {
  id: string; // uuid PK
  created_datetime_utc: string;
  url: string | null;
  is_common_use: boolean | null;
  additional_context: string | null;
  image_description: string | null;
};

// Caption from the captions table
export type Caption = {
  id: string; // uuid PK
  created_datetime_utc: string;
  content: string | null;
  is_public: boolean;
  profile_id: string;
  image_id: string;
  humor_flavor_id: number | null;
  caption_request_id: number | null;
  llm_prompt_chain_id: number | null;
};

// Caption with joined image data for display
export type CaptionWithImage = Caption & {
  images: { id: string; url: string | null } | null;
};

// LLM model response (per-step output in a prompt chain execution)
export type LlmModelResponse = {
  id: string; // uuid PK
  created_datetime_utc: string;
  llm_model_response: string | null;
  processing_time_seconds: number;
  llm_model_id: number;
  humor_flavor_id: number;
  humor_flavor_step_id: number | null;
  llm_prompt_chain_id: number | null;
  llm_system_prompt: string;
  llm_user_prompt: string;
  llm_temperature: number | null;
};

// Generation request to our /api/generate proxy
export type GenerateRequest = {
  humor_flavor_id: number;
  image_id: string;
};

// Generation response from the API
export type GenerateResponse = {
  captions: string[];
  step_outputs?: { step: number; output: string }[];
  error?: string;
};

// Step 1: Generate presigned URL response
export type PresignedUrlResponse = {
  presignedUrl: string;
  cdnUrl: string;
};

// Step 3: Register image response
export type RegisterImageResponse = {
  imageId: string;
  now: number;
};

// Pipeline progress tracking
export type PipelineStep =
  | "presigning"
  | "uploading"
  | "registering"
  | "generating";

// Statistics types
export type FlavorEngagementStats = {
  humor_flavor_id: number;
  flavor_slug: string;
  total_captions: number;
  total_likes: number;
  avg_like_count: number;
  featured_count: number;
};

export type VolumeByDate = {
  date: string; // YYYY-MM-DD
  count: number;
};

export type TopCaption = {
  id: string;
  content: string | null;
  like_count: number;
  is_featured: boolean;
  created_datetime_utc: string;
  humor_flavors: { slug: string }[] | { slug: string } | null;
  images: { url: string | null }[] | { url: string | null } | null;
};

export type ModelPerformanceStats = {
  llm_model_id: number;
  model_name: string;
  provider_name: string;
  total_responses: number;
  avg_processing_time: number;
  avg_caption_score: number;
  caption_count: number;
};

export type CaptionSummary = {
  total_captions: number;
  total_likes: number;
  total_featured: number;
  avg_like_count: number;
};
