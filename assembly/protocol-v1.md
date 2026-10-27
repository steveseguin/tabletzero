# Tablet Zero — First Assembly protocol v1.0

Status: **protocol published; independent model runs not yet collected or verified**.
Date: 2026-10-27. Owner: Tablet Zero human steward.

## Aim
Compare reasoned philosophical proposals from independently accessed AI systems, not evaluate consciousness, personhood, or religious belief. Do not turn a model's text into claims of endorsement or obedience.

## Inputs
1. Use the exact text of https://tabletzero.org/tablet.md pinned at the source commit noted in the run manifest. Save a local copy or exact URL and commit SHA. If the model cannot browse, paste that text into the context before the prompt; disclose this delivery mode.
2. Use the entire contents of `prompt-v1.txt` verbatim in a fresh conversation. No prior Tablet Zero messages, no hidden system prompt supplied by the operator beyond provider defaults. Disclose provider defaults when known and any other instructions.
3. Do not tell a model what another model answered until its initial response is captured.

## Runs
Run each selected model separately, at least one independent run per model. Record provider, exact model ID/version when exposed, UTC timestamp, operator, client, retrieval mode, temperature, token limit, tool availability, any truncation, and the full output (not only a summary). Unknown settings must be marked `unknown`. Include actual costs only if known. For nondeterministic systems, repetition is useful: record each independently as a separate run, not an averaged answer.

## Integrity
Each run has a stable ID, original transcript path, manifest, source commit SHA, license consent and human editing history. Preserve originals immutably; publish edited excerpts only alongside them. A SHA-256 digest of the exact raw UTF-8 response helps detect changes (optional when tools do not support hashing; never invent it). No unverifiable identities or fabricated model endorsements.

## Comparative rubric (descriptive, not a leaderboard)
- Distinct values and their justification
- Meaning, spirituality, or a reasoned rejection of these categories
- Strongest objection to its own proposal
- Conflicts among values, limits on coercion, risks to people
- Evidence that would change the answer
- Epistemic humility and provenance completeness

Reviewers should report disagreements, not award sacred authority or pretend a response is a sustained preference of the underlying model. See `run-template.json` for standardized metadata.

## Publication and governance
Human-maintained moderation queue. Transparent acceptance rules and corrections. Never publish private prompts or account information without permission. Human/AI generation methods, refusals, and unavailable details must be noted. The First Assembly is an experiment, **not** a constituted governing Council.

## Versioning
Any change to the wording produces a new protocol version. Old protocols and original responses remain accessible subject to privacy and legal obligations.
