# dsh-seed-society

唯识论八识架构的 Agent Society 插件：把 seed-society 的可审计双循环运行时接成
`mcp__society__*` 工具，并随包提供六个种子技能。

## 包含内容（安装后自动生效）

| 层 | 内容 | 载体 |
| --- | --- | --- |
| MCP 工具桥 | `mcp__society__*`（run/enqueue/status/knowledge/genome/experience/approve…） | `dsh-mcp-client` 实例（`insert`） |
| 种子技能 | `yogacara-society/alaya/manas/mano/panca/sila` 六个 SKILL.md | 随包 + 镜像到 `~/.dsh/skills` |
| 插件元数据 | 插件名、描述、图标（插件管理/设置页直接读取） | `locale/en.json`、`locale/zh.json`、`icon.svg` |

**明确不做**：不改写 `llm-deepseek` 或 `dsh-mneme` 的配置。0.2 的 loader 对
带 `id` 的层是整段替换 `config`（不做深合并），所以跨包改写会覆盖对方自己的
默认值；目标行不存在时还会警告 `patch: entry "<id>" not found` 并整层跳过。
记忆侧怎么配，归 mneme 自己的默认值与该 profile 的 patch 层。

## 兼容性

- DSH 0.2.x：`engines.dsh` 为 `>=0.2.0-rc.1 <0.3.0-0`。0.2 的 loader 只认
  `engines.dsh`（有它就不再检查 peerDependencies），并按 includePrerelease
  比对，所以 `0.2.1-rc.2` 可用，0.1.x 与 0.3 会被判为 incompatible 后跳过。
- Python 3.10+（MCP 桥与运行时）。
- `@modusensus/dsh-mneme` 可选：装了就由它负责记忆注入与巩固，与本文插件互不
  改写。

## 安装（一条命令）

```powershell
powershell -ExecutionPolicy Bypass -File integrations\dsh\install-plugin.ps1
```

脚本依次：pip 安装 seed-society（并验证 `seed_society.mcp_server` 可导入）→
装 mneme → 装本插件（pnpm add + bundles 对账）→ 同步技能到 `~/.dsh/skills` →
dump-config 校验（缺行或出现 `[dsh-seed-society]` 警告即失败）。**装完重启
DSH**（新 bundle 层需要重新组合）。

### 手动安装

从 GitHub 安装（分发方式）：

```bash
python -m pip install -e <seed-society 仓库>        # 1. python 运行时
dsh plugin --profile web add @modusensus/dsh-mneme  # 2. mneme（可选）
dsh plugin --profile web add github:woshishadowhunter/dsh-seed-society
```

本地开发时把最后一行换成 `dsh plugin --profile web add <path-to-this-plugin>`。
技能由安装脚本（或主仓库的 `integrations/dsh/sync-skills.ps1`）镜像到
`~/.dsh/skills`；只装插件不镜像技能也能得到 `mcp__society__*` 工具，六个
SKILL.md 只是告诉模型怎么用这套运行时。

不想装插件、只想要 MCP 桥：把
[`integrations/dsh/cordis.patch.example.yml`](../../cordis.patch.example.yml)
的 `insert` 块并入 profile 的 `cordis.patch.yml`。

## 验证

```bash
dsh --profile web --dump-config 2>&1 | grep -E "mcp-society|serverName: society"
node --test test/plugin.test.mjs && node scripts/verify-patch.mjs
```

重启后：

- 模型工具里出现 `mcp__society__*`（`society_health` 返回 `ready: true`）；
- dump-config 的 stderr 里没有 `[dsh-seed-society]` 警告；
- `llm-deepseek` 与 `dsh-mneme` 两行与本插件安装前一致（本插件不碰它们）。

## 记忆侧：确定性巩固仍可用

插件不再替 mneme 决定梦巩固策略。想完全不触发 mneme 的 LLM 路径时，用本项目的
确定性引擎做巩固（不需要模型）：

```bash
seed-society consolidate GOAL --db society.db --mneme-dir ~/.dsh/memory --apply
```

若确实要调整 mneme，请在 **profile 的** `cordis.patch.yml` 里写 `- id: dsh-mneme`
并**把该行需要的键写全**（整段替换），例如：

```yaml
- id: dsh-mneme
  config:
    autoDream: true
    dreamProvider: deepseek-official
    dreamModel: deepseek-flash
    dreamReasoningEffort: "off"   # 只压推理，不动 dreamMaxTokens 预算
```

`dreamMaxTokens` 建议保持 mneme 的默认上限（0.9.x 为 131072）；调低会挤掉决策
JSON 的输出预算，这是 2026-08 那一轮 `no json array in llm output` 的直接原因。

## 仓库

- 主项目（运行时/文档/测试）：<https://github.com/woshishadowhunter/seed-society>
- 本插件：<https://github.com/woshishadowhunter/dsh-seed-society>

插件真源在主项目 `integrations/dsh/plugin/dsh-seed-society`；插件仓库由
`git subtree` 发布（主项目 `integrations/dsh/publish-plugin.ps1`）。请把改动
提到主项目，不要只改插件仓库，否则下一次发布会覆盖。

## 发布到插件超市（可选）

在 [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)
提交注册条目：

```json
{
  "name": "dsh-seed-society",
  "owner": "woshishadowhunter",
  "url": "https://github.com/woshishadowhunter/dsh-seed-society",
  "category": "memory",
  "description": { "en": "...", "zh": "..." }
}
```

注册表快照更新后，用户即可 `dsh plugin --profile web add dsh-seed-society`
一键安装（需先发布 npm 包，或在注册条目中用 github URL）。

## 边界

- 插件只做配置组合与桥接：不改验收标准、不给模型权限、不绕过审批；
- mcp-society 需 Python 环境；服务端不使用 shell、不持密钥；
- mneme 的 LLM 仲裁与其 CAS/快照哈希审计保持原样。
