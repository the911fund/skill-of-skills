-- Categories
INSERT INTO categories (name, slug, icon, display_order) VALUES
('Official', 'official', '✅', 0),
('Development', 'development', '🛠️', 1),
('Documentation', 'documentation', '📚', 2),
('Marketing', 'marketing', '📣', 3),
('Productivity', 'productivity', '⚡', 4),
('Media', 'media', '🎬', 5),
('Research', 'research', '🔬', 6),
('Security', 'security', '🔒', 7),
('Integrations', 'integrations', '🔗', 8),
('Agents', 'agents', '🤖', 9),
('Uncategorized', 'uncategorized', '📦', 99);

-- Sample tools
INSERT INTO tools (name, slug, repo_url, repo_owner, repo_name, tool_type, description, source, is_official, is_verified, stars, validation_status, category_id)
VALUES
('Claude Plugins Official', 'claude-plugins-official', 'https://github.com/anthropics/claude-plugins-official', 'anthropics', 'claude-plugins-official', 'collection', 'Official Anthropic plugin directory', 'github_official', TRUE, TRUE, 4600, 'passed', (SELECT id FROM categories WHERE slug='official')),
('Remotion Skills', 'remotion-skills', 'https://github.com/remotion-dev/skills', 'remotion-dev', 'skills', 'collection', 'Video creation with Remotion', 'github_search', FALSE, TRUE, 392, 'passed', (SELECT id FROM categories WHERE slug='media')),
('Marketing Skills', 'marketing-skills', 'https://github.com/coreyhaines31/marketingskills', 'coreyhaines31', 'marketingskills', 'collection', '23 marketing skills for Claude Code', 'github_search', FALSE, TRUE, 3600, 'passed', (SELECT id FROM categories WHERE slug='marketing')),
('Cartographer', 'cartographer', 'https://github.com/kingbootoshi/cartographer', 'kingbootoshi', 'cartographer', 'plugin', 'Maps codebases with AI subagents', 'github_search', FALSE, TRUE, 408, 'passed', (SELECT id FROM categories WHERE slug='documentation')),
('add-skill', 'add-skill', 'https://github.com/vercel-labs/add-skill', 'vercel-labs', 'add-skill', 'cli_tool', 'Universal skill installer for 17+ agents', 'github_search', FALSE, TRUE, 1800, 'passed', (SELECT id FROM categories WHERE slug='development'));

-- Sample influencers
INSERT INTO influencers (platform, username, display_name, followers, trust_score, is_verified) VALUES
('x', 'KingBootoshi', 'BOOTOSHI 👑', 5000, 0.9, TRUE),
('x', '_BILLDING_', 'Bill Ding 🔨', 1218, 0.75, FALSE),
('x', 'Fund911', '911Fund', 1504, 0.85, TRUE);
