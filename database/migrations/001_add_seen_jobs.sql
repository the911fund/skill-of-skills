-- Migration: Add seen_jobs table for job posting deduplication
-- Run this against existing database to add the table

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

-- Optional: Cleanup function for old entries (run periodically)
-- DELETE FROM seen_jobs WHERE first_seen_at < NOW() - INTERVAL '90 days';
