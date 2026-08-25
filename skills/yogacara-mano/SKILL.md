---
name: yogacara-mano
description: 意识·双循环技能：操作 seed-society 的 LoopEngine 外/内双循环、goal 生命周期、任务图校验与重试修复，并对应 DSH 的 goal/subagent/workflow 工具的用法。当用户要求跑目标、编排任务、执行-评审-修复循环、中断恢复或讨论「意识/造作/串联」时使用。
whenToUse: 意识、双循环、goal 生命周期、任务图、执行评审修复、enqueue、worker、run、编排
---

# 意识：分别、造作与串联（yogacara-mano）

## 本体论

意识了别诸法、造作诸行、把五识摄入的尘境与末那识的个体性**串联成有目标的
造作**。在本体系中，意识是 `engine.py` 的 LoopEngine：

- **外循环**：规划 → 校验 DAG → 选就绪任务 → 选个体 → 内循环 → 读回持久化
  状态 → 直至终态；
- **内循环**：组装上下文（依赖产物 + 失败评审 + 种子知识）→ 执行 → 落
  artifact → 评审 → 更新绩效种子 → PASS 或带缺陷重试；
- **造作的边界**：预算（max_actions/max_attempts）、通过线
  （verdict PASS 且 score ≥ min_passing_score）、终态不可变。

## Goal 状态机

```
created → planning → running → succeeded / failed / blocked
                        ↓
                      paused（审批）→ running（批准）或 failed（拒绝）
```

中断恢复：`running` 任务重置为 `pending` 并发出 `task.recovered`，已成功任务
跳过；有活跃 scheduler claim 时同步引擎拒绝接管（围栏优先，见
`yogacara-sila`）。

## 核心操作

### 1. 离线演示（最小双循环证明）

```bash
python -m seed_society demo --db demo.db
```

第一次市场报告缺第三处证据 → 评审 FAIL（score 80 < 通过线或 defect 存在）
→ 缺陷入上下文 → 专家修复 → PASS。事件流可查：

```bash
python -m seed_society events quantum-mug-demo --db demo.db
```

### 2. 跑自己的 goal 规范（确定性，可复现）

```bash
python -m seed_society run examples/goal-spec.json --db my-goal.db --json
python -m seed_society status evidence-brief-demo --db my-goal.db --json
```

任务图校验：ID 唯一、依赖存在、无环；非法规划在**任何执行之前**失败。

### 3. 计划与执行分离（持久 worker，意识的行相）

```bash
python -m seed_society enqueue examples/goal-spec.json --db society.db --json
python -m seed_society worker run --worker-id local-a \
  --agent-id spec-research --agent-id spec-writing \
  --max-tasks 3 --db society.db --json
```

enqueue 只落图不执行；worker 发现就绪任务、独立连接续租、执行-评审-围栏
提交（claim/fencing 细节见 `yogacara-sila`）。

### 4. 模型驱动的意识（严格 JSON 适配）

`model_agents.py` 的 ModelPlanner/ModelWorker/ModelReviewer 要求模型输出
恰好一个 JSON 对象；ModelWorker 每轮只允许一次工具调用或一次 final，
tool 步有独立预算。配置端点：

```bash
$env:MODEL_API_KEY="..."; $env:MODEL_ID="your-model"
python -m seed_society maintain owner/repo 123 --workspace . --db maintain.db --json
```

## DSH 侧的对应工具

| society 现行 | DSH 工具 | 用法 |
| --- | --- | --- |
| 外循环推进 | `create_goal`/`update_goal`（goal 工具） | 长任务用 goal 轮次驱动，任务列表 todo_write 同步 |
| 并行造作 | `subagent`/`subagent_fork` | 独立研究/实现委托，别他执行 |
| 大规模扇出 | `workflow` | 多角度审计/迁移的分阶段编排 |
| 任务图 | goal-spec.json | 需要双循环评审时，把图交给 society 而不是手写循环 |

选择原则：**需要可审计评审与重试时用 society 的引擎；需要上下文隔离的
独立造作用 DSH 的 subagent；两者可嵌套**（society 的 worker 内部不产生 DSH
子代理，反之亦然——只通过 MCP 桥 `mcp__society__*` 或 CLI 衔接）。

## 边界

- 意识不得改写验收标准：评审 PASS 但分数低于通过线仍失败；知识/经验不能
  修改预算或标准；
- WorkerBlocked（如 A2A 提交歧义）→ 任务与 goal 都 blocked，人工复核前
  不自动重试；
- 规划失败（空图/坏依赖/跨 goal 任务）在任何 worker 执行前终结 goal。
