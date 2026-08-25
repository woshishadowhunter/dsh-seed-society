# dsh-seed-society

唯识论八识架构的 Agent Society 插件：把 seed-society 的可审计双循环
运行时、dsh-mneme 记忆巩固调优、MCP 工具桥与六个种子技能，固化为一个
可直接安装的 DSH 插件包。

## 包含内容（安装后自动生效）

| 层 | 内容 | 载体 |
| --- | --- | --- |
| 记忆巩固修复 | `llm-deepseek.reasoningEffort: off`（autoDream 根因修复，实测 57 次失败→成功） | bundle patch |
| 记忆巩固调优 | mneme：autoDream on、32768 token、deepseek-chat、会话总结关 | bundle patch |
| MCP 工具桥 | `mcp__society__*`（run/enqueue/status/knowledge/genome/experience/approve…） | mcp-client 实例 |
| 种子技能 | `yogacara-society/alaya/manas/mano/panca/sila` 六个 SKILL.md | 随包 + 镜像到 `~/.dsh/skills` |

## 前置条件

- DSH（含 `@deepseek-ai/dsh-llm-deepseek`，基础包自带）；
- Python 3.10+（MCP 桥与运行时）；
- `@modusensus/dsh-mneme`（安装脚本自动装；注意超市注册表里的 `dsh-mneme`
  名字是错的，真实包名是作用域的）。

## 安装（一条命令）

```powershell
powershell -ExecutionPolicy Bypass -File integrations\dsh\install-plugin.ps1
```

脚本依次：pip 安装 seed-society → 装 mneme → 装本插件（pnpm add +
bundles 对账）→ 同步技能到 `~/.dsh/skills` → dump-config 校验。**装完重启
DSH**（新 bundle 层需要重新组合）。

### 手动安装

```bash
python -m pip install -e <repo>                          # 1. python 运行时
dsh plugin --profile web add @modusensus/dsh-mneme       # 2. mneme 前提
dsh plugin --profile web add github:woshishadowhunter/dsh-seed-society  # 3. 本插件
# 4. 技能：复制 skills/ 下的六个目录到 ~/.dsh/skills/（或 ~/.agents/skills/）
```

## 仓库

- 主项目（运行时/文档/测试）：<https://github.com/woshishadowhunter/seed-society>
- 本插件：<https://github.com/woshishadowhunter/dsh-seed-society>

## 验证

```bash
dsh --profile web --dump-config | grep -E "mcp-society|reasoningEffort|dreamMaxTokens"
# 重启后：
#  - 模型工具里出现 mcp__society__* 
#  - mneme 的 autoDream 继续巩固（dream_runs 出现 degraded/ok 行）
```

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
