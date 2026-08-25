---
name: yogacara-sila
description: 戒律·护栏技能：规范 seed-society 的全部安全性质——预算、审批、租约围栏、内容寻址、默认拒绝与不坏法边界，并对应 DSH 的 sandbox 模式与审批流。当用户遇到暂停审批、围栏过期、A2A 歧义、预算耗尽，或讨论「戒律/护栏/安全边界」时使用。
whenToUse: 戒律、护栏、审批、approve、reject、fencing、围栏、预算、sandbox、安全边界、blocked、paused
---

# 戒律：识的边界（yogacara-sila）

## 本体论

唯识修行有戒；Seed Society 的全部安全性质就是它的戒律层——保证七识的
造作**不坏种子、不改标准、不欺审计**。戒律不是八识之一，而是八识得以运行的
边界。每条戒律都有对应的可执行证明（self-test），不是口头约定。

## 戒律表

| 戒 | 现行机制 | 违戒后果 | 自证命令 |
| --- | --- | --- | --- |
| 预算戒 | `RunBudget`（max_actions 全流程、max_attempts 单任务、min_passing_score 通过线） | goal 变 blocked/failed，跨进程重启依然计数 | `product self-test` |
| 身业戒 | `ToolRisk` read/write/execute；写/执行工具需持久化审批（指纹=SHA-256(goal+task+tool+args)） | 暂停等待人工 approve/reject，不消耗 attempt | `product self-test` |
| 妄语戒 | `TaskClaim` fencing token 单调递增；过期 claim 永不复活；过期 worker 提交整体拒绝、零部分写入 | 旧结果不能冒充现行 | `scheduler self-test` |
| 不偷盗戒 | 工作区写需精确 SHA-256 内容寻址 + 原子替换 + 原内容可恢复；验证结果绑定工作区摘要 | 改错文件可恢复、未验证 PASS 被拒绝 | `product self-test` |
| 不妄作戒 | A2A 默认拒绝、决策先于联网持久化、提交歧义→终态 unknown 永不自动重发、champion 缺失即阻塞 | 远程副作用不重复、路由不静默降级 | `a2a self-test` |
| 不坏法戒 | genome/experience/knowledge 只是咨询性种子，不改预算/标准/权限/部署 | 弱结果不能重定义「好」 | 架构保证（`docs/yogacara-architecture.md`） |

## 核心操作

### 1. 审批流（身业戒的现行）

```bash
python -m seed_society approvals GOAL_ID --db maintain.db --json
python -m seed_society approve APPROVAL_ID --by operator --db maintain.db
python -m seed_society reject APPROVAL_ID --by operator --db maintain.db
```

待批时 goal `paused`（不消耗预算）；批准后 `resume`，拒绝后 goal `failed`。
运行时不得自我批准；DSH 侧的 sandbox 拒绝是等价戒律——被拒时读拒绝标记并
升级说明，不换方式硬闯。

### 2. 围栏自证（妄语戒）

```bash
python -m seed_society scheduler self-test --json
```

双连接实测五个不变量：独占 claim、精确所有者续租、接管后 token 递增、
过期 worker 零部分写入拒绝、当前 worker 完整提交。

### 3. 过期回收与观照

```bash
python -m seed_society scheduler workers --db society.db --json
python -m seed_society scheduler reap --at 2026-07-16T00:00:10+00:00 --db society.db --json
python -m seed_society health --db society.db --json
```

过期 claim 只回收到 `pending`，新 claim 是新身份 + 更大 token。同步引擎在
goal 有活跃 claim 时拒绝接管（围栏优先于恢复）。

### 4. 全量安装时验收

```bash
python -m seed_society product self-test --json
python -m seed_society a2a self-test --json
```

### 5. 风险处理指引

| 现象 | 判断 | 处置 |
| --- | --- | --- |
| goal `paused` | 有 pending approval | `approvals` 查看 → approve/reject → `run` 恢复 |
| goal `blocked` | champion 不可用 / A2A 歧义 / 预算耗尽 | 读事件流里的 evidence，人工裁决，勿自动重试 |
| worker `LOST` | 租约过期或被接管 | 本地结果作废；reap 后新 claim 接管 |
| A2A delegation `unknown` | 提交结果歧义 | 视为已发送，只允许人工取消，**禁止重发** |

## DSH 侧戒律对应

| society 戒 | DSH 现行 |
| --- | --- |
| 身业戒 | sandbox 模式（read-only / workspace-write / danger-full-access），拒绝标记是政策而非故障 |
| 预算戒 | goal 轮次上限、工具超时、字节/墙钟上限 |
| 妄语戒 | 陈旧缓存/过期会话不冒充最新状态；文件以实际内容为准 |
| 不偷盗戒 | write/edit 原子替换；改动前先 read |
| 不坏法戒 | 技能种子只规范用法；不重写用户的目标与标准 |

## 边界

- 任何组件不得自我批准自己的变更；晋升、发布、A2A 委托都必须有操作员身份；
- 已终态的 goal 不可变；delegation 状态机不允许跳步或回退；
- 直接模型/工具/HTTP/文件系统副作用仍在仓库围栏之外，需要适配层幂等或
  远程强制围栏 epoch（架构明示边界，不假装已覆盖）。
