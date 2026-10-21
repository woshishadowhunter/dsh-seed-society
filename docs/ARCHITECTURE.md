# Architecture

`dsh-seed-society` is a configuration-and-bridge plugin for DeepSeek Harness.
It ships no runtime of its own; it makes two things true about a profile the
moment it is installed.

## 1. The society runtime is bridged in (MCP insert)

An `@deepseek-ai/dsh-mcp-client` instance named `society` spawns
`python -m seed_society.mcp_server` (part of the
[seed-society](https://github.com/woshishadowhunter/seed-society) Python
package). The harness model gains `mcp__society__*` tools: run/enqueue/status/
events/knowledge/genome/experience/evaluate/approve/self-test/health/metrics.
The server is zero-dependency stdio JSON-RPC, shells out to the society CLI
without a shell, holds no secrets, and never bypasses approval gates.

## 2. Six seed skills

`skills/yogacara-*` are SKILL.md bundles (society 总纲, alaya 种子库, manas
个体性, mano 双循环, panca 前五识, sila 戒律). The installer mirrors them to
`~/.dsh/skills` (or `~/.agents/skills`) so the harness discovers them like any
hand-written skill.

## Why the bundle does not patch `llm-deepseek` or `dsh-mneme`

Versions 1.0.0–1.1.0 carried two id-targeted layers: a route-level
`reasoningEffort: off` and a full mneme config (`autoDream: false`,
`dreamMaxTokens: 32768`, `dreamModel: deepseek-chat`). Both are wrong on the
0.2 kernel:

- The loader replaces the whole `config` of an id-targeted row — it never deep
  merges — so a plugin that overrides a package it does not own either wipes
  that package's own defaults or silently loses to a later layer. When the row
  is absent the layer is skipped with `patch: entry "<id>" not found`.
- mneme 0.9.x owns dream effort itself (`dreamReasoningEffort`, default `low`)
  and sets its output budget to the schema maximum (131072). Pinning `32768`
  lowers a budget upstream explicitly asks callers not to lower.
- The `reasoningEffort: off` fix existed because the 0.1 adapter defaulted
  unconfigured effort to HIGH. On 0.2 the route default is the user's own
  `llm-deepseek` settings, and turning thinking off for every call that omits
  an effort is a behaviour change this plugin has no business making.

Memory behaviour therefore belongs to mneme's defaults plus the profile's
`cordis.patch.yml`; the deterministic path (`seed-society consolidate`) stays
available and needs no model at all.

## Boundaries

- The plugin only composes configuration and bridges; it never rewrites
  acceptance criteria, grants tool permissions, or bypasses approvals.
- The MCP bridge requires Python 3.10+ and the `seed-society` package
  (`python -m pip install seed-society`).
- mneme's LLM arbitration and its CAS/snapshot-hash audit trail are untouched.
