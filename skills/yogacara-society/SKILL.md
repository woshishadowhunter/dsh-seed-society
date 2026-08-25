---
name: yogacara-society
description: 唯识论八识架构总纲：按阿赖耶识/末那识/意识/前五识/戒律组织 agent-society-loop 运行时与 DeepSeek Harness 的插件社会。当用户提及唯识、八识、agent society、多智能体编排，或需要把这套运行时作为插件接入 harness、执行「个人种子契合」工作流时使用。
whenToUse: 唯识论架构、八识、agent society 插件体系、种子契合工作流、yogacara 系列技能导航
---

# 唯识社会总纲（yogacara-society）

## 本体论：为什么这套体系存在

大模型参数空间对世界的建模是**阿赖耶识**；它太庞大，人类无法用提示词准确表达
思路——人机交互在此断点。AIGC 的解法不是「放下」，而是**用有限的阿赖耶识能力
赋予独特的种子（bīja），借末那识与眼耳鼻舌身意七识完成与使用者的契合**。

agent 的能力与性格**通过文件约束、通过熏习完善**；这些文件合成的综合上下文，
就是在准确告知模型「使用者真正的需求」——这就是 harness 的意义，也就是本技能
系列的使命。

## 八识地图（导航到具体技能）

| 识 | 技能 | 现行组件 | 核心操作 |
| --- | --- | --- | --- |
| 阿赖耶识 | `yogacara-alaya` | storage/memory/experience/evolution + SQLite/PostgreSQL | knowledge/experience/genome/performance 种子库 |
| 末那识 | `yogacara-manas` | domain/selection/evaluation + DSH persona | 个体性：谁来做、为何是它 |
| 意识 | `yogacara-mano` | engine/deterministic/model_agents + DSH goal/subagent | 双循环：规划-执行-评审-修复 |
| 前五识 | `yogacara-panca` | tools/mcp/a2a/workspace + DSH read/pwsh/web_search | 根尘相接：外部信息摄入 |
| 戒律 | `yogacara-sila` | budget/approval/fencing/A2A 门 | 识的边界：什么不可做 |

任何具体任务，先加载对应技能的正文再行动；跨识协作时以本总纲为仲裁。

## 插件清单（机器可读真源）

```bash
python -m agent_society_loop plugins --json          # 全部 28 个插件
python -m agent_society_loop plugins --describe      # 五识组完整地图
```

对应源码：`src/agent_society_loop/plugins.py`。清单是声明性元数据：命名现有
模块的识归属，**绝不改变导入、权限、预算或验收标准**。

## 快速开始（离线可复现）

```bash
$env:PYTHONPATH="src"                                # 仓库内运行时
python -m agent_society_loop demo --db demo.db       # 量子杯五步验证
python -m agent_society_loop events quantum-mug-demo --db demo.db
python -m agent_society_loop consolidate quantum-mug-demo --db demo.db   # 睡眠回放巩固
python -m agent_society_loop product self-test --json
```

预期：`Goal quantum-mug-demo: succeeded (4/4 tasks, 1 retries)`。第一次市场报告
缺证据被评审拒绝（现行熏入缺陷种子），专家携缺陷反馈修复（种子现行），正是
双循环的最小证明。

## 个人种子契合工作流（本架构的核心用例）

1. **立种子（末那识）**：`genome set <user-agent>` 写角色种子、自模型、性格
   traits、工具画像、风险政策；
2. **现行（意识+五识）**：跑 demo/run/enqueue+worker，七识按技能规范造作；
3. **熏习（阿赖耶识）**：`experience distill` 蒸馏 reviewed attempts 为
   lessons；performance 反熏路由；
4. **种子相续（进化）**：`genome recombine` 出子代候选；`evaluate`+`promote`
   走 champion/challenger 门。

细节见 `yogacara-alaya` 与 `yogacara-manas`。

## 与 DSH 的整合边界

- 本仓库 `.agents/skills/` 是技能种子唯一真源（DSH rank 200 自动发现，
  watcher 热加载）；`integrations/dsh/sync-skills.ps1` 镜像到用户根
  `~/.dsh/skills` 或 `~/.agents/skills` 供跨项目现行；
- MCP 桥：`integrations/dsh/mcp/society_server.py` 把 society 工具注册为
  `mcp__society__*`，patch 示例见 `integrations/dsh/cordis.patch.example.yml`；
- 理论总纲文档：`docs/yogacara-architecture.md`；运行架构：
  `docs/architecture.md`；
- 不坏法：技能种子只规范用法，不授予权限；权限由 DSH sandbox 与 society
  审批流决定。
