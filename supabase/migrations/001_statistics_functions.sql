-- Statistics RPC functions for the /statistics page
-- Run this SQL in the Supabase SQL Editor before testing.

-- 1. Summary stats: total captions, total likes, featured count, avg like count
CREATE OR REPLACE FUNCTION db_get_caption_summary()
RETURNS TABLE (
  total_captions bigint,
  total_likes bigint,
  total_featured bigint,
  avg_like_count numeric
)
LANGUAGE sql STABLE
AS $$
  SELECT
    count(*)::bigint AS total_captions,
    coalesce(sum(like_count), 0)::bigint AS total_likes,
    count(*) FILTER (WHERE is_featured = true)::bigint AS total_featured,
    round(coalesce(avg(like_count), 0), 2) AS avg_like_count
  FROM captions;
$$;

-- 2. Per-flavor engagement aggregates
CREATE OR REPLACE FUNCTION db_get_flavor_engagement_stats()
RETURNS TABLE (
  humor_flavor_id bigint,
  flavor_slug varchar,
  total_captions bigint,
  total_likes bigint,
  avg_like_count numeric,
  featured_count bigint
)
LANGUAGE sql STABLE
AS $$
  SELECT
    hf.id AS humor_flavor_id,
    hf.slug AS flavor_slug,
    count(c.id)::bigint AS total_captions,
    coalesce(sum(c.like_count), 0)::bigint AS total_likes,
    round(coalesce(avg(c.like_count), 0), 2) AS avg_like_count,
    count(*) FILTER (WHERE c.is_featured = true)::bigint AS featured_count
  FROM humor_flavors hf
  LEFT JOIN captions c ON c.humor_flavor_id = hf.id
  GROUP BY hf.id, hf.slug
  ORDER BY total_captions DESC;
$$;

-- 3. Caption volume by day (last N days)
CREATE OR REPLACE FUNCTION db_get_caption_volume_by_day(days_back int DEFAULT 30)
RETURNS TABLE (
  date date,
  count bigint
)
LANGUAGE sql STABLE
AS $$
  SELECT
    (c.created_datetime_utc AT TIME ZONE 'UTC')::date AS date,
    count(*)::bigint AS count
  FROM captions c
  WHERE c.created_datetime_utc >= (now() - make_interval(days => days_back))
  GROUP BY date
  ORDER BY date ASC;
$$;

-- 4. Model performance aggregates
CREATE OR REPLACE FUNCTION db_get_model_performance_stats()
RETURNS TABLE (
  llm_model_id smallint,
  model_name varchar,
  provider_name varchar,
  total_responses bigint,
  avg_processing_time numeric,
  avg_caption_score numeric,
  caption_count bigint
)
LANGUAGE sql STABLE
AS $$
  SELECT
    m.id AS llm_model_id,
    m.name AS model_name,
    p.name AS provider_name,
    count(r.id)::bigint AS total_responses,
    round(coalesce(avg(r.processing_time_seconds), 0), 2) AS avg_processing_time,
    round(coalesce(avg(c.like_count), 0), 2) AS avg_caption_score,
    count(DISTINCT c.id)::bigint AS caption_count
  FROM llm_model_responses r
  JOIN llm_models m ON m.id = r.llm_model_id
  JOIN llm_providers p ON p.id = m.llm_provider_id
  LEFT JOIN captions c ON c.llm_prompt_chain_id = r.llm_prompt_chain_id
  GROUP BY m.id, m.name, p.name
  ORDER BY total_responses DESC;
$$;
