-- Migration: Create seen_jobs table for n8n job deduplication workflow
-- Run this SQL against your Postgres database

CREATE TABLE IF NOT EXISTS seen_jobs (
  id SERIAL PRIMARY KEY,
  job_url TEXT UNIQUE NOT NULL,
  normalized_url TEXT UNIQUE NOT NULL,
  job_title TEXT,
  company TEXT,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seen_jobs_normalized_url ON seen_jobs(normalized_url);
CREATE INDEX IF NOT EXISTS idx_seen_jobs_first_seen ON seen_jobs(first_seen_at DESC);
