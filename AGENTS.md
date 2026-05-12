# 武侠风云（wuxia-demo）— 协作小约定

面向：新开聊天、换模型、或他人接手时，先扫一眼本文再继续改代码。

## 项目与运行

- 主工程为 **浏览器静态页** + Node 静态服：`game/` 下 HTML/JS。
- 本地运行：在 **`wuxia-demo/`** 目录执行 `node server.js`，浏览器打开 `http://localhost:9000/index.html`。
- 大地图：`/ui/map.html`；山林：`/ui/forest_map.html`；队伍战：`/ui/battle.html`。

## 战斗相关（务必遵守）

1. **进入队伍战**（`battle.html`）：请走 **`game/js/utils/battleEntry.js`** 的 `BattleEntry.startPartyBattle(...)`，不要在新地图里手写 `localStorage` + `location` 进战斗。
2. **战后待发放奖励**（`pending_battle_rewards`）：读写请走 **`game/js/utils/battleSettlement.js`** 的 `BattleSettlement`，不要硬编码键名字符串。
3. **队伍战物理命中/闪避/招架**：逻辑在 **`BattleHitRoll.js`**；`battle.js` 主要负责 UI 与流程。
4. **主菜单 `Game` 挂载的 `BattleSystem.js`** 为「单敌」回合制；与队伍战 **仍是两条形态**（阶段四「单形态」未做），勿把两套规则混成一套公式而不经评审。

## 重构与改档（防踩雷）

- **`forest_map.html` 与 `map.html` 里各有一段「把 pending 奖励写入 `game_save_0`」的大段逻辑**：若需合并或修 bug 涉及两处，**应先给出简短方案（改哪些文件、如何验证）**，维护者同意后再改，避免银两/阅历错档。
- 改 **`GAME_CONFIG.GAME_VERSION`** 时请同步根目录 **`version.json`**（发版说明）。

## 备份习惯（可选）

- 大改战斗前可在 `_backup_*` 目录留副本（见历史提交说明）；合并写档逻辑前同样建议可回滚粒度。

## 战斗 UI 背景（定稿）

- 战斗页 `game/ui/battle.html` 使用全屏背景图：`game/assets/images/UI/panel_wuxia_master_bg_only.png`（与文件夹名 **`UI` 大写** 一致）。  
- 更换定稿：同名覆盖即可；勿改路径除非同步改 `battle.html` 里 `url(...)`。

## MCP：通义万相（文生图 / 文生视频）

- **包名**：`tongyi-wanx-mcp-server`（社区实现，见 GitHub `Suixinlei/tongyi-wanx-mcp-server`）。  
- **密钥**：在阿里云 **DashScope（百炼）** 控制台创建 **API-Key**，写入环境变量 **`DASHSCOPE_API_KEY`**（勿提交到 git）。  
- **本地配置**：复制 **`.cursor/mcp.example.json`** → **`.cursor/mcp.json`**，把 Key 填进 `env`；`.cursor/mcp.json` 已在 **`.gitignore`** 中忽略。  
- **或在 Cursor UI**：Settings → Tools & MCPs → Add server → …  
- **工作区根目录**：若 Cursor 打开的是 **`WuXiaDemo` 父文件夹**（而不是 `wuxia-demo`），MCP 必须放在 **`WuXiaDemo/.cursor/mcp.json`**；仅放在 `wuxia-demo/.cursor/` 时，设置页会显示 **No MCP Tools**。可把同一份配置复制到父目录 `.cursor/mcp.json`，或改用「打开文件夹」指向 **`wuxia-demo`**。
- **文心一格**：偏产品与网页工作流，**不是**这条 MCP 配置；文案/出图请以各产品官网为准。

更多参数与工具名见该 MCP 仓库 README（如 `wanx-t2i-image-generation` 等）。
