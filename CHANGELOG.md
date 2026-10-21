# dsh-seed-society

## 1.2.0 (2026-10-21)

- Match the DSH 0.2.1 kernel: declare `engines.dsh`
  (`>=0.2.0-rc.1 <0.3.0-0`), the only requirement the 0.2 loader checks, so
  0.1.x profiles skip the bundle instead of half-applying it.
- Drop the `llm-deepseek` and `dsh-mneme` override layers. A 0.2 patch
  replaces a row's whole `config` (no deep merge), so overriding packages this
  plugin does not own wiped their defaults or warned
  `patch: entry "dsh-mneme" not found`; mneme 0.9.x already owns dream effort
  and keeps `dreamMaxTokens` at its schema maximum.
- Add display metadata the plugin manager and settings page read without
  activating the plugin: `locale/en.json`, `locale/zh.json`, `icon.svg`, plus
  the matching `exports` entries and a complete `files` list.
- `install-plugin.ps1`: verify `seed_society.mcp_server` imports after pip,
  probe `mcp-society`/`serverName: society`, and fail on any
  `[dsh-seed-society]` composition warning instead of the removed mneme keys.
- `cordis.patch.example.yml`: use `- insert:` (a bare `- id:` in a profile layer
  is skipped as "entry not found") and derive `PYTHONPATH` from
  `SOCIETY_PROJECT_DIR` instead of a stale hard-coded checkout path.
- Tests and `verify-patch.mjs` assert the insert-only patch, the kernel range,
  the exported display metadata, and the six skills.

## 1.1.0 (2026-08-25)

- Rename to `dsh-seed-society`; MCP bridge module moved to `seed_society.mcp_server`.

## 1.0.0 (2026-08-25)

- Initial release: mneme memory consolidation tuning (autoDream on, 32768-token
  output budget, deepseek-chat route), llm-deepseek `reasoningEffort: off` fix,
  `mcp__society__*` MCP bridge registration, six yogacara seed skills.
