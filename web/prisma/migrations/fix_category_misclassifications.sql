-- Fix Incorrect "Official" Category Classifications
-- Run this SQL to fix tools that were incorrectly categorized

-- FALSE POSITIVES: Move tools OUT of Official that shouldn't be there

-- cc-marketplace (ananddtyagi) - community marketplace → integrations
UPDATE "Tool"
SET "category_id" = (SELECT id FROM "Category" WHERE slug = 'integrations')
WHERE slug = 'cc-marketplace';

-- everything-claude-code (affaan-m) - config/guides → documentation
UPDATE "Tool"
SET "category_id" = (SELECT id FROM "Category" WHERE slug = 'documentation')
WHERE slug = 'everything-claude-code';

-- compound-engineering-plugin (EveryInc) - third party plugin → development
UPDATE "Tool"
SET "category_id" = (SELECT id FROM "Category" WHERE slug = 'development')
WHERE slug = 'compound-engineering-plugin';

-- FALSE NEGATIVE: Move tools INTO Official that should be there

-- claude-cookbooks (anthropics org) - IS from Anthropic → official
UPDATE "Tool"
SET "category_id" = (SELECT id FROM "Category" WHERE slug = 'official'),
    "is_official" = true
WHERE slug = 'claude-cookbooks';

-- Verify the changes
SELECT t.slug, t.name, c.slug as category, t.is_official, t.repo_owner
FROM "Tool" t
JOIN "Category" c ON t.category_id = c.id
WHERE t.slug IN ('cc-marketplace', 'everything-claude-code', 'compound-engineering-plugin', 'claude-cookbooks');
