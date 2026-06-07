# Validation model

Validation should produce evidence, not only a `passed` label.

## Validation levels

- `repo_validated`: repository could be fetched and basic metadata was read.
- `skill_detected`: at least one concrete skill/instruction artifact was found.
- `skill_validated`: the skill file has enough structure to be useful.
- `security_review_required`: risky execution patterns, broad permissions, or unclear provenance require manual review.
- `resource_only`: useful AI/tooling repository but not a loadable skill.

## Required evidence fields

Each validated record should include:

- detected files
- platform markers
- matched source id from `sources.yml`
- parsed name/description/triggers when present
- quality signal booleans
- risk reasons
- validation errors/warnings
- validation timestamp
- repository commit SHA used for validation

## Fail closed

A clone failure, empty repository, missing output, or malformed callback should not default to `passed` or `relevant=true`.

Bad defaults to avoid:

```text
clone failed → continue → relevant=true → validation_status=passed
missing platform output → generic → passed
empty webhook URL → curl POST "" → noisy scheduled failures
```

Preferred defaults:

```text
clone failed → validation_status=failed
missing platform output → validation_status=needs_review
no skill marker and weak README signal → relevant=false/resource_only
empty webhook URL → fail early with actionable message
```

## Risk detection

Risk should include exact reasons. Examples:

- shell/process execution
- package install hooks
- `sudo`, `chmod 777`, `rm -rf`, `eval`
- network exfiltration patterns
- credentials/env access
- subagent spawning
- browser/computer-use automation
- broad filesystem writes
- lack of explicit human approval gates

## n8n workflow validation

For n8n skills/workflows, additionally check:

- meta-skill / available-skills index exists
- workflow JSON can parse
- nodes with credentials are identified
- destructive/side-effect nodes require approval gates
- referenced capability skills exist
- examples include validation or dry-run steps
