# Scoring and routing model

Skill of Skills should answer:

> Given this task, what skill should my agent load first, what should it load next, and why?

It should not answer only:

> Which AI-coding-adjacent repositories have many stars?

## Score components

Keep component scores separate so users and agents can inspect why something ranked highly.

- `relevance_score`: semantic/task fit for the current query.
- `skill_quality_score`: structure, trigger clarity, examples, gotchas, verification, references, progressive disclosure.
- `trust_score`: official/verified/known source, repository owner, vendor status.
- `maintenance_score`: recent commits, releases, open issue health, refresh errors.
- `safety_score`: permission scope, shell execution, subagents, destructive actions, approval gates.
- `installability_score`: clear installation/loading steps, supported platforms, dependencies.
- `popularity_score`: stars/forks/social signals, capped to prevent giant generic repos from dominating.

## Default weighted rank

```text
best_for_query =
  relevance_score       * 0.40
+ skill_quality_score   * 0.20
+ trust_score           * 0.15
+ maintenance_score     * 0.10
+ safety_score          * 0.10
+ installability_score  * 0.05
```

Popularity is not included directly in the default routing formula. Use it as a tie-breaker or fold it into trust/maintenance with a cap.

## Task-fit beats stars

Task-fit beats stars. In lower-case form: task-fit beats stars. This is the central ranking rule for routing agents to the best operational skill.

For routing queries, a small official skill with exact task fit should outrank a huge stale repository with broad AI keywords.

Examples:

- Query: “build an n8n workflow with GitHub issues and Slack alerts”
  - Prefer: official n8n meta/capability skills.
  - Downgrade: generic workflow automation repos with no n8n skill file.

- Query: “review a Python PR”
  - Prefer: code-review skills with explicit review checklist and verification steps.
  - Downgrade: generic Python libraries and framework repos.

## Quality signals

Positive:

- clear trigger description
- single responsibility
- examples
- gotchas/pitfalls
- verification section
- linked references/templates/scripts
- progressive disclosure instead of huge context dumps
- explicit safety/approval gates
- install/load instructions
- exact commands with expected outputs

Negative:

- no actual skill/instruction file
- no description or trigger language
- stale with no releases
- broad system access with no approval gates
- hallucinated/generated README only
- repo-level record pretending to be a skill-level record
- clone or validation failed but status says passed

## Tiers

- `Curated`: high score, exact skill evidence, verification/safety/examples present.
- `Promising`: usable skill with some quality gaps.
- `Experimental`: basic structure or unclear operational quality.
- `Resource`: useful repo/documentation, not a directly loadable skill.
- `Needs review`: possible security/validation issue.

A `STALE` tool should not be shown as top-ranked for a task unless task fit is excellent and no fresher trustworthy option exists.
