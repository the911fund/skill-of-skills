#!/bin/bash
# Analyze a report and pick #1 actionable priority
# Supports multiple LLM providers: Anthropic, OpenRouter, AI Gateway
#
# Usage: ./analyze-report.sh <report-path>
# Output: JSON to stdout
#
# Environment variables (uses first one found):
#   ANTHROPIC_API_KEY     - Anthropic API directly
#   OPENROUTER_API_KEY    - OpenRouter (uses claude-sonnet-4-20250514)
#   AI_GATEWAY_URL        - Any OpenAI-compatible endpoint (requires AI_GATEWAY_API_KEY)

set -e

REPORT_PATH="$1"

if [ -z "$REPORT_PATH" ]; then
  echo "Usage: ./analyze-report.sh <report-path>" >&2
  exit 1
fi

if [ ! -f "$REPORT_PATH" ]; then
  echo "Error: Report file not found: $REPORT_PATH" >&2
  exit 1
fi

# Detect which provider is available (Vercel AI Gateway preferred)
PROVIDER=""
if [ -n "$VERCEL_OIDC_TOKEN" ]; then
  # Vercel AI Gateway with OIDC auth (from `vercel env pull`)
  PROVIDER="gateway"
  AI_GATEWAY_URL="${AI_GATEWAY_URL:-https://ai-gateway.vercel.sh/v1}"
  AI_GATEWAY_AUTH_TOKEN="$VERCEL_OIDC_TOKEN"
elif [ -n "$AI_GATEWAY_API_KEY" ]; then
  # Vercel AI Gateway with API key
  PROVIDER="gateway"
  AI_GATEWAY_URL="${AI_GATEWAY_URL:-https://ai-gateway.vercel.sh/v1}"
  AI_GATEWAY_AUTH_TOKEN="$AI_GATEWAY_API_KEY"
elif [ -n "$ANTHROPIC_API_KEY" ]; then
  PROVIDER="anthropic"
elif [ -n "$OPENAI_API_KEY" ]; then
  PROVIDER="openai"
elif [ -n "$OPENROUTER_API_KEY" ]; then
  PROVIDER="openrouter"
fi

if [ -z "$PROVIDER" ]; then
  echo "" >&2
  echo "╔══════════════════════════════════════════════════════════════════╗" >&2
  echo "║  No LLM provider configured. Set one of these environment vars: ║" >&2
  echo "╠══════════════════════════════════════════════════════════════════╣" >&2
  echo "║                                                                  ║" >&2
  echo "║  Option 1: Vercel AI Gateway (recommended)                       ║" >&2
  echo "║    Run: vercel env pull   (uses VERCEL_OIDC_TOKEN)               ║" >&2
  echo "║    Or:  export AI_GATEWAY_API_KEY=your-key                       ║" >&2
  echo "║                                                                  ║" >&2
  echo "║  Option 2: Anthropic API (direct)                                ║" >&2
  echo "║    export ANTHROPIC_API_KEY=sk-ant-...                           ║" >&2
  echo "║                                                                  ║" >&2
  echo "║  Option 3: OpenAI API (direct)                                   ║" >&2
  echo "║    export OPENAI_API_KEY=sk-...                                  ║" >&2
  echo "║                                                                  ║" >&2
  echo "║  Option 4: OpenRouter                                            ║" >&2
  echo "║    export OPENROUTER_API_KEY=sk-or-...                           ║" >&2
  echo "║                                                                  ║" >&2
  echo "╚══════════════════════════════════════════════════════════════════╝" >&2
  echo "" >&2
  exit 1
fi

REPORT_CONTENT=$(cat "$REPORT_PATH")

# Find recent PRDs (last 7 days) to avoid re-picking same issues
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TASKS_DIR="$PROJECT_ROOT/tasks"
RECENT_FIXES=""

if [ -d "$TASKS_DIR" ]; then
  # Find prd-*.md files modified in last 7 days
  RECENT_PRDS=$(find "$TASKS_DIR" -name "prd-*.md" -mtime -7 2>/dev/null || true)
  if [ -n "$RECENT_PRDS" ]; then
    RECENT_FIXES="
## Recently Fixed (Last 7 Days) - DO NOT PICK THESE AGAIN
"
    for prd in $RECENT_PRDS; do
      # Extract title from first heading
      TITLE=$(grep -m1 "^# " "$prd" 2>/dev/null | sed 's/^# //' || basename "$prd" .md)
      DATE=$(stat -f "%Sm" -t "%Y-%m-%d" "$prd" 2>/dev/null || stat -c "%y" "$prd" 2>/dev/null | cut -d' ' -f1)
      RECENT_FIXES="$RECENT_FIXES- $DATE: $TITLE
"
    done
  fi
fi

PROMPT="You are analyzing a daily report for a software product.

Read this report and identify the #1 most actionable item that should be worked on TODAY.

CONSTRAINTS:
- Must NOT require database migrations (no schema changes)
- Must be completable in a few hours of focused work
- Must be a clear, specific task (not vague like 'improve conversion')
- Prefer fixes over new features
- Prefer high-impact, low-effort items
- Focus on UI/UX improvements, copy changes, bug fixes, or configuration changes
- IMPORTANT: Do NOT pick items that appear in the 'Recently Fixed' section below
$RECENT_FIXES
REPORT:
$REPORT_CONTENT

Respond with ONLY a JSON object (no markdown, no code fences, no explanation):
{
  \"priority_item\": \"Brief title of the item\",
  \"description\": \"2-3 sentence description of what needs to be done\",
  \"rationale\": \"Why this is the #1 priority based on the report\",
  \"acceptance_criteria\": [\"List of 3-5 specific, verifiable criteria\"],
  \"estimated_tasks\": 3,
  \"branch_name\": \"compound/kebab-case-feature-name\"
}"

PROMPT_ESCAPED=$(echo "$PROMPT" | jq -Rs .)

# Make the API call based on provider
case "$PROVIDER" in
  anthropic)
    RESPONSE=$(curl -s https://api.anthropic.com/v1/messages \
      -H "Content-Type: application/json" \
      -H "x-api-key: $ANTHROPIC_API_KEY" \
      -H "anthropic-version: 2023-06-01" \
      -d "{
        \"model\": \"claude-opus-4-5-20251101\",
        \"max_tokens\": 1024,
        \"messages\": [{\"role\": \"user\", \"content\": $PROMPT_ESCAPED}]
      }")
    TEXT=$(echo "$RESPONSE" | jq -r '.content[0].text // empty')
    ;;
    
  openai)
    RESPONSE=$(curl -s https://api.openai.com/v1/chat/completions \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $OPENAI_API_KEY" \
      -d "{
        \"model\": \"gpt-5.2\",
        \"max_completion_tokens\": 1024,
        \"messages\": [{\"role\": \"user\", \"content\": $PROMPT_ESCAPED}]
      }")
    TEXT=$(echo "$RESPONSE" | jq -r '.choices[0].message.content // empty')
    ;;
    
  openrouter)
    RESPONSE=$(curl -s https://openrouter.ai/api/v1/chat/completions \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $OPENROUTER_API_KEY" \
      -d "{
        \"model\": \"anthropic/claude-opus-4.5\",
        \"max_tokens\": 1024,
        \"messages\": [{\"role\": \"user\", \"content\": $PROMPT_ESCAPED}]
      }")
    TEXT=$(echo "$RESPONSE" | jq -r '.choices[0].message.content // empty')
    ;;
    
  gateway)
    MODEL="${AI_GATEWAY_MODEL:-anthropic/claude-opus-4.5}"
    RESPONSE=$(curl -s "${AI_GATEWAY_URL}/chat/completions" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $AI_GATEWAY_AUTH_TOKEN" \
      -d "{
        \"model\": \"$MODEL\",
        \"max_tokens\": 1024,
        \"messages\": [{\"role\": \"user\", \"content\": $PROMPT_ESCAPED}]
      }")
    TEXT=$(echo "$RESPONSE" | jq -r '.choices[0].message.content // empty')
    ;;
esac

if [ -z "$TEXT" ]; then
  echo "Error: Failed to get response from $PROVIDER" >&2
  echo "Response: $RESPONSE" >&2
  exit 1
fi

# Try to parse as JSON, handle potential markdown wrapping
if echo "$TEXT" | jq . >/dev/null 2>&1; then
  echo "$TEXT" | jq .
else
  # Try to extract JSON from markdown code block
  JSON_EXTRACTED=$(echo "$TEXT" | sed -n '/^{/,/^}/p' | head -20)
  if echo "$JSON_EXTRACTED" | jq . >/dev/null 2>&1; then
    echo "$JSON_EXTRACTED" | jq .
  else
    echo "Error: Could not parse response as JSON" >&2
    echo "Response text: $TEXT" >&2
    exit 1
  fi
fi
