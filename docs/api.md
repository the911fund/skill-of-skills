# Router API proposal

The directory API is useful for browsing. A skill-selection engine also needs a routing endpoint.

## Endpoint

```http
POST /api/v1/route
Content-Type: application/json
```

## Request

```json
{
  "task": "Build an n8n workflow that creates GitHub issues and sends Slack alerts",
  "platforms": ["n8n", "claude_code"],
  "max_results": 5,
  "include_references": false
}
```

## Response

```json
{
  "query_intent": {
    "domain": "n8n workflow automation",
    "actions": ["workflow design", "node configuration", "credentials", "error handling"],
    "risk": "medium"
  },
  "recommended_skills": [
    {
      "name": "using-n8n-skills",
      "repo": "https://github.com/n8n-io/skills",
      "source_id": "official-n8n-skills",
      "load_first": true,
      "why": "Official n8n meta-skill for routing into workflow/node/credential capability skills before tool calls.",
      "score": 0.94,
      "score_breakdown": {
        "relevance_score": 0.98,
        "skill_quality_score": 0.90,
        "trust_score": 1.0,
        "maintenance_score": 0.85,
        "safety_score": 0.80,
        "installability_score": 0.90
      }
    }
  ],
  "warnings": [
    "Credentials and side-effect nodes should require explicit approval before execution."
  ]
}
```

## Why this matters

A user or agent should not have to browse 1,400 records to pick an operational procedure. Routing should return a small set of best-fit skills with evidence and ordering:

1. load first
2. load next if needed
3. avoid / needs review
4. why this match is safer or better than alternatives

## Search vs route

- `/api/v1/search`: keyword/exploration endpoint.
- `/api/v1/tools`: directory browsing endpoint.
- `/api/v1/route`: decision endpoint for agents selecting skills before action.

## Local contract prototype

`scripts/route_skills.py` is a dependency-free local prototype for this endpoint. It is not the production API server; it is an executable contract test for the ranking behavior the backend must preserve.

Example:

```bash
python3 scripts/route_skills.py \
  "build an n8n workflow with GitHub issues and Slack alerts" \
  --platform n8n \
  --max-results 3
```

The smoke tests assert that the official n8n skill-level record surfaces before a generic stars-heavy automation repo. This prevents regressions where popularity silently beats task fit.
