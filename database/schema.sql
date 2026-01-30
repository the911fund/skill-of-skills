-- Skill of Skills Schema v2.0
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enums
CREATE TYPE tool_type AS ENUM ('skill','plugin','collection','cli_tool','mcp_server','prompt_pack','workflow','extension','resource');
CREATE TYPE discovery_source AS ENUM ('github_search','github_official','x_post','x_reply','x_entity_extraction','reddit_post','manual_submission','influencer_recommendation');
CREATE TYPE risk_level AS ENUM ('low','medium','high','critical');
CREATE TYPE validation_status AS ENUM ('pending','validating','passed','failed','skipped','manual_review');

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  keywords TEXT[] DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tools (main table)
CREATE TABLE tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  repo_url TEXT UNIQUE,
  repo_owner TEXT,
  repo_name TEXT,
  tool_type tool_type NOT NULL DEFAULT 'skill',
  category_id UUID REFERENCES categories(id),
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  install_command TEXT,
  has_skill_md BOOLEAN DEFAULT FALSE,
  has_claude_plugin BOOLEAN DEFAULT FALSE,
  has_mcp_json BOOLEAN DEFAULT FALSE,
  risk_level risk_level DEFAULT 'low',
  risk_reasons TEXT[] DEFAULT '{}',
  validation_status validation_status DEFAULT 'pending',
  last_validated_at TIMESTAMPTZ,
  spawns_subagents BOOLEAN DEFAULT FALSE,
  stars INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  last_commit_at TIMESTAMPTZ,
  license TEXT,
  x_mention_count INTEGER DEFAULT 0,
  x_recommendation_count INTEGER DEFAULT 0,
  reddit_mention_count INTEGER DEFAULT 0,
  total_social_score INTEGER GENERATED ALWAYS AS (x_mention_count + (x_recommendation_count * 3) + reddit_mention_count) STORED,
  github_score FLOAT DEFAULT 0,
  social_score FLOAT DEFAULT 0,
  recency_score FLOAT DEFAULT 0,
  influencer_score FLOAT DEFAULT 0,
  composite_score FLOAT DEFAULT 0,
  trending_score FLOAT DEFAULT 0,
  source discovery_source NOT NULL,
  source_url TEXT,
  discovered_by TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_official BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED
);

-- Influencers
CREATE TABLE influencers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL CHECK (platform IN ('x','reddit','github')),
  username TEXT NOT NULL,
  display_name TEXT,
  followers INTEGER DEFAULT 0,
  recommendation_count INTEGER DEFAULT 0,
  accurate_recommendations INTEGER DEFAULT 0,
  trust_score FLOAT DEFAULT 0.5,
  is_verified BOOLEAN DEFAULT FALSE,
  is_official BOOLEAN DEFAULT FALSE,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, username)
);

-- Social mentions
CREATE TABLE social_mentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  influencer_id UUID REFERENCES influencers(id),
  platform TEXT NOT NULL CHECK (platform IN ('x','reddit','hacker_news')),
  post_type TEXT CHECK (post_type IN ('post','reply','quote','comment')),
  post_url TEXT NOT NULL,
  post_id TEXT,
  content TEXT,
  author_username TEXT,
  author_followers INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  retweets INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0,
  engagement_score INTEGER GENERATED ALWAYS AS (likes + (retweets * 2) + replies) STORED,
  is_recommendation BOOLEAN DEFAULT FALSE,
  is_comparison BOOLEAN DEFAULT FALSE,
  compared_to TEXT[] DEFAULT '{}',
  sentiment TEXT CHECK (sentiment IN ('positive','negative','neutral')),
  posted_at TIMESTAMPTZ,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, post_url)
);

-- Unknown tool mentions
CREATE TABLE unknown_mentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_name TEXT NOT NULL,
  normalized_name TEXT,
  platform TEXT NOT NULL,
  post_url TEXT NOT NULL,
  mentioned_by TEXT,
  influencer_id UUID REFERENCES influencers(id),
  context_snippet TEXT,
  confidence_score FLOAT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','researching','found','not_found','ignored')),
  resolved_tool_id UUID REFERENCES tools(id),
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(normalized_name, post_url)
);

-- Discovery queue
CREATE TABLE discovery_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repo_url TEXT UNIQUE,
  tool_name TEXT,
  source discovery_source NOT NULL,
  source_url TEXT,
  discovered_by TEXT,
  stars INTEGER DEFAULT 0,
  social_mentions INTEGER DEFAULT 0,
  priority_score FLOAT GENERATED ALWAYS AS (COALESCE(stars,0)*0.3 + COALESCE(social_mentions,0)*10) STORED,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','accepted','rejected','duplicate')),
  rejection_reason TEXT,
  queued_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Metrics history
CREATE TABLE metrics_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  recorded_date DATE DEFAULT CURRENT_DATE,
  stars INTEGER,
  composite_score FLOAT,
  UNIQUE(tool_id, recorded_date)
);

-- Grace period tracking for tools that fall below star threshold
ALTER TABLE tools ADD COLUMN IF NOT EXISTS first_fell_below_threshold_at TIMESTAMPTZ;

-- Archived tools (rejected or dropped below threshold)
CREATE TABLE archived_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  repo_url TEXT UNIQUE,
  repo_owner TEXT,
  repo_name TEXT,
  tool_type tool_type NOT NULL DEFAULT 'skill',
  category_id UUID REFERENCES categories(id),
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  install_command TEXT,
  has_skill_md BOOLEAN DEFAULT FALSE,
  has_claude_plugin BOOLEAN DEFAULT FALSE,
  has_mcp_json BOOLEAN DEFAULT FALSE,
  risk_level risk_level DEFAULT 'low',
  risk_reasons TEXT[] DEFAULT '{}',
  validation_status validation_status DEFAULT 'failed',
  last_validated_at TIMESTAMPTZ,
  spawns_subagents BOOLEAN DEFAULT FALSE,
  stars INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  last_commit_at TIMESTAMPTZ,
  license TEXT,
  source discovery_source NOT NULL,
  source_url TEXT,
  discovered_by TEXT,
  -- Archive-specific fields
  archived_reason TEXT NOT NULL,
  archived_at TIMESTAMPTZ DEFAULT NOW(),
  original_discovered_at TIMESTAMPTZ,
  original_tool_id UUID
);

CREATE INDEX idx_archived_tools_repo_url ON archived_tools(repo_url);
CREATE INDEX idx_archived_tools_archived_at ON archived_tools(archived_at DESC);

-- Indexes
CREATE INDEX idx_tools_composite ON tools(composite_score DESC);
CREATE INDEX idx_tools_trending ON tools(trending_score DESC);
CREATE INDEX idx_tools_type ON tools(tool_type);
CREATE INDEX idx_tools_active ON tools(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_tools_search ON tools USING GIN(search_vector);
CREATE INDEX idx_queue_pending ON discovery_queue(priority_score DESC) WHERE status = 'pending';
CREATE INDEX idx_unknown_pending ON unknown_mentions(status) WHERE status = 'pending';

-- Functions
CREATE OR REPLACE FUNCTION normalize_tool_name(p_name TEXT) RETURNS TEXT AS $$
BEGIN RETURN LOWER(REGEXP_REPLACE(COALESCE(p_name,''), '[^a-zA-Z0-9]', '', 'g')); END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tools_updated_at BEFORE UPDATE ON tools FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Views
CREATE VIEW v_active_tools AS
SELECT t.*, c.name as category_name, c.icon as category_icon
FROM tools t LEFT JOIN categories c ON t.category_id = c.id
WHERE t.is_active = TRUE AND t.validation_status IN ('passed','skipped')
ORDER BY t.composite_score DESC;

CREATE VIEW v_trending AS
SELECT * FROM tools WHERE is_active = TRUE AND trending_score > 0
ORDER BY trending_score DESC LIMIT 20;

CREATE VIEW v_unknown_tools AS
SELECT um.*, i.username as influencer_username, i.trust_score
FROM unknown_mentions um LEFT JOIN influencers i ON um.influencer_id = i.id
WHERE um.status = 'pending' ORDER BY i.trust_score DESC NULLS LAST;

-- User engagement tables
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  rating INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tool_id, session_id)
);

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  author TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tool_id, session_id)
);

CREATE INDEX idx_ratings_tool_id ON ratings(tool_id);
CREATE INDEX idx_comments_tool_id ON comments(tool_id);
CREATE INDEX idx_favorites_tool_id ON favorites(tool_id);
