---
name: yogacara-alaya
description: 阿赖耶识·种子库技能：管理 seed-society 的 knowledge/experience/genome/performance 种子，执行熏习与现行，把每次 reviewed attempt 蒸馏为可复用教训，维护个人种子契合工作流的数据层。当用户要求存知识、蒸馏经验、写基因组、查绩效，或讨论「种子/熏习/现行」时使用。
whenToUse: 种子、熏习、现行、阿赖耶识、知识库、经验蒸馏、genome、performance、个人契合数据层
---

# 阿赖耶识：种子库、熏习与现行（yogacara-alaya）

## 本体论

阿赖耶识含藏一切种子：种子生现行，现行熏种子。在本体系中，阿赖耶识的**现行
载体**是模型参数空间与两个持久化后端（SQLite / PostgreSQL），而**种子**是
四类落盘文件：

| 种子 | 存储 | 唯识义 | 操作命令 |
| --- | --- | --- | --- |
| knowledge | `knowledge` 表 | 名相种子：有标题、有标签的文本知识 | `knowledge add` / `knowledge search` |
| genome | `agent_genomes` 表 | 本体种子：角色、自模型、性格、工具画像、风险政策、谱系 | `genome set` / `genome show` / `genome recombine` |
| experience | `experience_records` 表 | 熏习种子：reviewed attempts 蒸馏出的 lessons | `experience distill` / `experience list` |
| performance | `performance` 表 | 业力种子：(agent, task_type) 的成败、均分、时延 | 运行自动更新，`agents --json` 查看 |

## 核心操作

### 1. 立知识种子

```bash
python -m seed_society knowledge add "产品事实" "概念围绕即热、清晰控件与安全日常使用。" --tags market_analysis --db society.db
python -m seed_society knowledge search "市场 增长" --db society.db --json
```

检索按「查询词元重叠 + 标签重叠×2」排序，任务类型标签自动参与
（`MemoryManager.build_context` 以 `(task_type,)` 标签检索）。

### 2. 立本体种子（genome）

```bash
python -m seed_society genome set user-analyst examples/genome-user-analyst.json --db society.db --json
python -m seed_society genome show user-analyst --db society.db --json
```

genome 文件是 JSON（参考 `examples/`），字段经 `AgentGenome.create` 严格校验：
`base_model`、`role_seed`、`self_model.mission/success_signals/failure_modes`、
`traits`（性格）、`tool_profile`、`memory_profile`、`risk_policy`
（read_only/approval_required/sandboxed/operator_managed 四档）、`parents`、
`generation`。**这是「赋予独特种子完成与使用者契合」的第一手载体**：把使用者
的性格、成功信号、失败模式写进自模型。

### 3. 熏习（experience distill）

```bash
python -m seed_society experience distill quantum-mug-demo --db demo.db --json
python -m seed_society experience list --agent-id market-analyst --db demo.db --json
```

蒸馏规则（`experience.py`，纯确定性）：PASS → 「成功模式」lesson；FAIL →
每个 defect 一条「修复」lesson。未来同类任务的 context 自动注入最近 5 条
experience（`MemoryManager.build_context` 的 `experience` 段）。这就是
**现行熏种子 → 种子再现行**的闭环。

### 3b. 睡眠回放巩固（consolidate，神经科学 × 唯识）

`experience distill` 只做内容蒸馏；`consolidate` 做完整的学习动力学
（设计文档 `docs/memory-learning-design.md`）：

```bash
python -m seed_society consolidate GOAL_ID --db demo.db          # 干跑：只出报告
python -m seed_society consolidate GOAL_ID --db demo.db --apply  # 落盘势力变动
```

每个 attempt 重放时计算：**显著性 salience**（0.4 基础 + 0.4 预测误差 +
0.2 缺陷占比，多巴胺 RPE）、**效价 valence**（受心所：PASS 正 FAIL 负）；
种子势力 strength 按艾宾浩斯半衰期衰减（遗忘曲线），**检索注入 context 时
再激活**（再巩固）；同一 (task_type, lesson) 在 **≥2 个 goal 佐证**且势力
≥0.8 时晋升为语义知识（异熟/转识成智），`--apply` 才写入且限量。干跑模式
还会给出**自模型更新建议**（成功信号/失败模式，纯咨询，不自动改 genome）。

### 3c. dsh-mneme 桥（现行面与主权镜像）

DSH 侧已安装 `@modusensus/dsh-mneme`（记忆主权 Markdown 镜像 + autoDream
LLM 巩固 + 快照哈希审计）。与本引擎的分工：**我们出确定性晋升门，mneme 出
会话侧现行面与模糊仲裁**。双向桥：

```bash
# 下行：晋升门产出的语义知识 → mneme memories 表（幂等、不复活 forget/archive 行）
python -m seed_society mneme sync --db society.db --mneme-dir ~/.dsh/memory --push
# 上行：mneme 的 dream 总结/人工决策 → society 知识种子（去重、带 mneme 标签）
python -m seed_society mneme import --db society.db --mneme-dir ~/.dsh/memory --apply
# 单命令联动：巩固 + 推送 + 遗忘联动（衰减种子 importance 跌破 3 即停止注入）
python -m seed_society consolidate GOAL --db society.db --mneme-dir ~/.dsh/memory --apply
```

**遗忘=停止现行**：经验种子势力被 `consolidate --apply` 衰减后，`mneme sync`
把对应行 importance（⌈势力×5⌉）降下来，跌破 mneme 注入阈值 3 即自动停止
注入；语义知识行不衰减（语义记忆稳定、情景记忆才衰减）。双向默认干跑，
`--push`/`--apply` 才落盘并写 `memory.mneme_*` 审计事件。

### 4. 种子相续（genome recombine）

```bash
python -m seed_society genome recombine child-v2 --parents parent-a parent-b --task-type analysis --db society.db --json
```

子代继承双亲谱系与世代、**取最严风险政策**、只取双亲共享的工具画像；高分
PASS 经验转成功信号，失败经验转失败模式。子代只是候选——不激活部署、不给
权限（见 `yogacara-manas` 与 `yogacara-sila`）。

## DSH 侧的阿赖耶识

- DSH 的 sessions/storages 目录是 harness 自己的储藏；society 的种子库以
  SQLite 文件落盘（`--db`），两者可以并存：society 库是**有 schema 的种子**，
  DSH storages 是**无 schema 的会话储藏**；
- 本技能系列的 SKILL.md 本身也是种子：frontmatter 是名相，正文是现行条件，
  编辑后 watcher 热加载，无需重启；
- 综合上下文 = 技能种子 + genome 种子 + experience 种子 + knowledge 种子 +
  deployment 种子——先读这些文件再开工，就是「准确告知模型真正的需求」。

## 边界

- 种子是咨询性的：不改预算、不改验收标准、不授予工具权限、不激活部署；
- knowledge/experience 不得携带密钥；模型与工具 span 会脱敏，但种子正文请
  自觉不含 secret；
- 一次运行只有一个持久化权威：A2A 治理/评估/发布/维护用 SQLite；执行平面可
  用 PostgreSQL，但不得跨库拆分同一 goal。
