---
name: yogacara-panca
description: 前五识·根尘相接技能：规范 agent-society-loop 的眼耳鼻舌身五根——工具门（tools/mcp/workspace）、网络边界（http_transport/a2a/github）与 DSH 的 read/grep/web_search/pwsh/vision 工具的对应关系与使用纪律。当用户要读文件、搜信息、执行命令、调用外部工具或讨论「五识/根尘」时使用。
whenToUse: 前五识、眼耳鼻舌身、工具调用、MCP、A2A、工作区、读文件、搜索、外部工具接入
---

# 前五识：根尘相接（yogacara-panca）

## 本体论

眼耳鼻舌身五根对五尘生五识，**外部信息经五识修正阿赖耶识构建的世界模型**。
在体系中，前五识是全部输入输出边界：

| 根 | 识 | society 现行 | DSH 现行工具 |
| --- | --- | --- | --- |
| 眼 | 视觉 | `WorkspaceListFilesTool`/`ReadFileTool`/`SearchTool`、`read_image` 语义 | `read`、`glob`、`grep`、`read_image`、`modlens_read_image` |
| 耳 | 听觉 | 预留：音频转录、语音输入（A2A 音频 parts） | 预留：语音通道 |
| 鼻 | 嗅 | `GitHubIssueClient`、A2A Agent Card 探测、MCP 工具发现、`web_search` 语义 | `web_search`、全树 `glob` 嗅探 |
| 舌 | 言语 | `providers.py` 模型输出、`ModelReviewer` 评审之言 | 模型回复、`ask_user_question` |
| 身 | 造作 | `WorkspaceWriteFileTool`、`WorkspaceRunCheckTool`、`publication.py`、outbox webhook | `write`、`edit`、`pwsh`、workflow/subagent 落地 |

## 工具门（tools.py）：五识的通行规则

- `ToolRegistry` 注册即检查：名字、描述、schema、`ToolRisk`
  （read/write/execute）缺一不可；
- `ToolExecutor.execute`：schema 校验（required/enum/additionalProperties/
  类型）→ 风险策略 → **读工具即时现行；写/执行工具必须持久化审批**
  （审批指纹 = SHA-256(goal+task+tool+arguments)）；
- 工具入参永远由模型 JSON 给出，**模型不能提供 shell 文本**；
- MCP 工具（`mcp.py`）：外部服务器命令由操作员配置、无 shell、限时限字节；
  **没有本地风险分类的工具不注册，服务器提示不能降低风险**。

## 网络边界（鼻识与身识的戒前门）

- `http_transport.py`：无重定向、字节上限、墙钟截止（防慢滴连接）；
- `providers.py`：URL 不得含凭据、非回环必须 HTTPS、密钥不落盘不入错误消息；
- `a2a.py`：钉住 Agent Card SHA-256、协议 1.0 HTTP+JSON、有界轮询；提交
  歧义 → 终态 unknown **永不自动重发**（详见 `yogacara-sila`）；
- `github.py`：默认只读摄取 issue/PR，写路径必须走审批与验证门。

## 常用操作

### 1. 工作区检查（眼识，只读即时现行）

```bash
python -m agent_society_loop maintain owner/repo 123 --workspace . --db maintain.db --json
```

### 2. 受审写与命名检查（身识，审批+摘要绑定）

```bash
python -m agent_society_loop maintain owner/repo 123 \
  --workspace . --db ../maintain.db --apply \
  --check "tests=python -m unittest discover -s tests -v" --json
# 运行暂停在每次内容寻址写与命名检查前：
python -m agent_society_loop approve APPROVAL_ID --by operator --db ../maintain.db
```

### 3. MCP 工具适配（外部根接入）

DSH 侧已有 `dsh-mcp-client`：把 society 运行时注册为 MCP server 后，
五识即获 `mcp__society__*` 工具族（见 `integrations/dsh/README.md` 与
`integrations/dsh/cordis.patch.example.yml`）。

## DSH 侧纪律（本会话可直接遵守）

- **眼**：读文件一律用 `read`/`glob`/`grep` 工具，不 grep 出 shell；图片用
  `read_image`/`modlens_read_image`；
- **鼻**：查现状用 `web_search`（带来源 URL）；嗅探大仓用 `glob` 模式；
- **舌**：对外输出给用户的言语要诚实标注证据来源；
- **身**：改文件用 `write`/`edit`（原子替换）；执行命令用 `pwsh`，遵守当前
  sandbox 模式；受限命令被拒时读拒绝标记，不换方式硬闯；
- **五识共用原则**：摄入先于造作——先读、先搜、先看，再写、再执行；凡
  改变外部世界的行为，society 侧都要过审批门，DSH 侧都要过 sandbox 门。

## 边界

- 前五识摄入的信息只修正种子（知识/经验/绩效），**不得改写预算与验收标准**；
- 写/执行类工具在 society 内永远先审批后现行；DSH 侧 sandbox 是等价戒律；
- 远程输出只接受受限文本/结构化数据；本地评审仍拥有最终 PASS/FAIL。
