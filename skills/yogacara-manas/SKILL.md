---
name: yogacara-manas
description: 末那识·个体性技能：管理 seed-society 的 AgentProfile 路由、绩效加权选择、champion/challenger 评估晋升与部署门禁，并说明 DSH persona/presets 的个体性对应。当用户要求「谁来做」、升级某个代理、查部署、讨论个体性格与路由时使用。
whenToUse: 末那识、个体性、我执、agent 路由、选择、evaluate、promote、deployment、persona、性格
---

# 末那识：个体性、路由与晋升（yogacara-manas）

## 本体论

末那识恒审思量，执阿赖耶识的见分为「我」——它制造个体性。在体系中，末那识
回答「**谁来做、为何是它**」：

- **个体性的种子**：`AgentProfile`（角色/模型/任务类型/本地或远程）与
  `AgentGenome`（性格 traits、自模型、工具画像、风险政策、谱系）；
- **我执的路由**：`PerformanceWeightedSelector` 按绩效给每个个体打分；
- **我执的修正**：`BenchmarkEvaluator` + `promote` 用不可变基准决定谁当
  champion——晋升一旦落定，路由不可静默绕开。

## 选择算法（selection.py，可解释且可复现）

```
score = 0.45 * success_rate
      + 0.35 * normalized_review_score
      + 0.10 * latency_score
      + 0.10 * confidence
```

- 冷启动中性值（0.5/0.5/0.5/0.0），10 次尝试后 confidence=1.0；
- 同分按 `agent_id` 字典序 → 运行可复现；
- 每次选择把全量候选与分数写入 `task.attempt_started` 事件 → 路由可审计。

## 核心操作

### 1. 查看个体与绩效

```bash
python -m seed_society agents --db demo.db --json
```

### 2. 冠军/挑战者评估（不可变基准，不影响现行路由）

```bash
python -m seed_society evaluate examples/evaluation-spec.json --db evolution.db --json
python -m seed_society evaluations RUN_ID --db evolution.db --json
```

晋升门槛（默认政策）：≥5 用例、无 critical 失败、通过率不降、均分增益
≥2 分、单用例回退 ≤10 分、p95 时延 ≤1.5×。评估只出建议，**绝不自行改路由**。

### 3. 晋升与部署门禁

```bash
python -m seed_society promote RUN_ID --by operator --db evolution.db --json
python -m seed_society deployments --db evolution.db --json
```

promote 时复检 agent/model 身份。此后该任务类型的路由锁定为精确
`(agent_id, model_id)`；champion 不可用 → goal **blocked**，静默回退被禁止
（回退等于绕过晋升决策）。

### 4. A2A 个体的注册不等于授权

远程 agent 注册后 `execution_kind="a2a"`，**在无部署时被绩效路由排除**；
只有经 evaluate+promote 的精确 `a2a:CARD_SHA256` 身份且被运行时显式加载，
才能被选中。发现不是权威。

## DSH 侧的末那识

- DSH 的 persona（`dsh-persona`）与 `~/.dsh/.agent-presets` 是 harness 自己的
  个体性：角色设定、语气、工具偏好。与 society 的 genome 互译：persona 是
  **会话层个体性**，genome 是**种子层个体性**；写 genome 时把使用者的性格
  traits 与自模型同步考虑；
- DSH 的 subagent/subagent_fork 是「分身为他者」：每个子代理有独立上下文与
  身份，对应末那识的「别他」功能；society 的 worker/agent 则是「同一阿赖耶
  中的多个我执」；
- 个体性必须可审计：性格写在 genome 文件里、路由写进事件流里、晋升写进
  deployment 表里——不做隐式的人格。

## 边界

- genome/experience 是咨询性种子，不授予工具权限、不激活部署；
- 已部署的任务类型不允许静默降级到未晋升的个体；
- 评估、晋升、部署全部落盘，promoted_by 与身份复检缺一不可。
