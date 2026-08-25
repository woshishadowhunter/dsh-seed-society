# Architecture

`dsh-seed-society` is a configuration-and-bridge plugin for DeepSeek Harness.
It ships no runtime of its own; it makes three things true about a profile the
moment it is installed:

## 1. Memory consolidation actually works (bundle patch)

The DeepSeek adapter (`@deepseek-ai/dsh-llm-deepseek`) defaults an unconfigured
`reasoningEffort` to HIGH, so the harness injects `thinking:enabled +
reasoning_effort:high` into every call that does not pass an explicit effort —
including mneme's autoDream. On whole-store consolidation batches the reasoning
consumes the output budget and the decision JSON never arrives (`no json array
in llm output`, observed 57 consecutive failures). Setting the route default to
`off` sends `thinking:disabled` (plain text calls); explicit efforts from
`agent-default-model` still win per call.

## 2. mneme consolidates at scale (bundle patch)

- `dreamMaxTokens: 32768` — schema max, enough headroom for 140+ memory
  batches (measured: valid decision JSON at 16384 AND 32768 tokens).
- `dreamModel: deepseek-chat` — the only route measured to keep the decision
  array format on large batches.
- `autoSummarize: false` — bounds store growth (session summarizer off).
- `autoInject: true`, `importanceThreshold: 3`, `maxInjectedItems: 5` —
  defaults preserved explicitly (an id-targeted patch replaces the entry).

## 3. The society runtime is bridged in (MCP insert)

An `@deepseek-ai/dsh-mcp-client` instance named `society` spawns
`python -m seed_society.mcp_server` (part of the
[seed-society](https://github.com/woshishadowhunter/seed-society) Python
package). The harness model gains `mcp__society__*` tools: run/enqueue/status/
events/knowledge/genome/experience/evaluate/approve/self-test/health/metrics.
The server is zero-dependency stdio JSON-RPC, shells out to the society CLI
without a shell, holds no secrets, and never bypasses approval gates.

## 4. Six seed skills

`skills/yogacara-*` are SKILL.md bundles (society 总纲, alaya 种子库, manas
个体性, mano 双循环, panca 前五识, sila 戒律). The installer mirrors them to
`~/.dsh/skills` (or `~/.agents/skills`) so the harness discovers them like any
hand-written skill.

## Boundaries

- The plugin only composes configuration and bridges; it never rewrites
  acceptance criteria, grants tool permissions, or bypasses approvals.
- The MCP bridge requires Python 3.10+ and the `seed-society` package
  (`python -m pip install seed-society`).
- mneme's LLM arbitration and its CAS/snapshot-hash audit trail are untouched.
