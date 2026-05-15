# 武侠风云（wuxia-demo）— 协作小约定

面向：新开聊天、换模型、或他人接手时，先扫 **`MEMORY.md`**（项目记忆与决策）再扫本文。**Cursor Agent**：见 **`.cursor/rules/read-wuxia-demo-memory.mdc`**（父仓库根）或 **`wuxia-demo/.cursor/rules/read-project-memory.mdc`**（仅打开子目录时）— `alwaysApply: true`，写代码前应先读 MEMORY + AGENTS。

## 项目与运行

- 主工程为 **浏览器静态页** + Node 静态服：根目录在 **`wuxia-demo/game/`**（`index.html`、`ui/`、`assets/`、`js/`）。
- 本地运行：在 **`wuxia-demo/game/`** 执行 **`node server.js`**，浏览器打开 **`http://127.0.0.1:3000/`**（端口见 `game/server.js`）。
- 常用页：`ui/map.html`（若存在）、`ui/forest_map.html`、`ui/battle.html` 等（相对上述根路径）。

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

## 武学系统 · 角色头像（定稿）

- **朝向**：武学顶栏/列表用角色头像 **统一面朝右**；与概念图不一致时镜像后再用。  
- **风格**：须与 **`game/assets/images/UI/martial_arts_wuxia_ui_mockup.png`** 同角色一致；**优先**从概念图 **`sharp` 裁切**（`wuxia-demo/tools/portrait-crop/`，见 `game/docs/martial-arts-ui-wuxia-assets.md` §3.3）；AI 重生必须对参考图或人工验收。  
- **交付**：`ma_ui_char_portrait_*.png` **仅人物**（无框无字），与 **`battle.js` 己方 `avatar`** 同源（`PLAYER_PORTRAIT_*`）。  
- **呈现区分**：**战斗**立轴只显示该 **纯头图**；**武学顶栏**在同一路径头图外再叠 **`ma_ui_char_card` 框** + **竖排名牌**（见 `martialArts.css` `.martial-char-card` / `.martial-char-name-tag`），改框改字不改 PNG 像素亦可。

### 参考图出图（脚本：`scripts/wanx_reference_image.mjs`）——怎么用

**一句话**：在终端里跑一条命令；命令里带上 **(1) 阿里云 Key**、**(2) 参考图的网络地址**、**(3) 你想画什么的文字**。跑完后终端会 **打印一张新图的下载链接**。

Cursor 里的 MCP 只能纯文生图；**要对齐你电脑里的苏瑶/少侠 PNG**，必须用脚本走百炼「参考图」接口（说明见 [万相文生图 API](https://help.aliyun.com/zh/model-studio/text-to-image-api-reference)）。

---

**第 0 步：确认本机有 Node**（装过 Node.js 即可）。在 PowerShell 里输入 `node -v` 能看到版本号就行。

**第 1 步：准备 API Key**  
到阿里云 **DashScope（百炼）** 控制台创建 **API-Key**（形如 `sk-...`）。下面命令里要把它填进 `DASHSCOPE_API_KEY`。

**第 2 步：准备参考图的「公网链接」，不要用本地路径**  
阿里云服务器要 **从网上下载** 你的参考图，所以 **不能** 写 `E:\...\suyao.png` 这种路径。请你先把 PNG 传到任意 **公网 HTTPS** 地址，例如：

- 你自己的 **OSS / 对象存储**（开匿名读，复制 object 的 URL）；或  
- 任意图床 / 网盘外链，只要浏览器里能 **直接打开就是一张图**，且地址以 `https://` 开头；且 **链接里不要出现中文**。

复制下来的整段 URL，就是下面的 `--ref "..."`。

**第 3 步：打开终端，进入 `wuxia-demo` 文件夹**  
例如你的项目在 `e:\武侠demo\godot项目\WuXiaDemo\wuxia-demo`，则先执行：

```powershell
cd "e:\武侠demo\godot项目\WuXiaDemo\wuxia-demo"
```

**第 4 步：粘贴下面命令，只改三处**  
1. 把 `你的Key` 换成真实 Key；  
2. 把 `https://.../ref.png` 换成第 2 步的参考图 URL；  
3. 把 `--prompt` 后面换成你想生成的内容（仍用中文即可）。

```powershell
$env:DASHSCOPE_API_KEY="你的Key"
node scripts/wanx_reference_image.mjs --ref "https://.../ref.png" --prompt "黑底胸像，老年山贼首领，山羊胡，国风手游立绘" --mode refonly --strength 0.55 --size 1280*720
```

（整行一条也可以；想分行写再用反引号 `` ` `` 续行，见下「可选」。）

**第 5 步：看结果**  
终端里会先出现 `task_id:`，等几秒到几十秒，最后一行会打印 **`https://...png`**，用浏览器打开即可下载。**没有界面窗口**，全程只在终端里完成。

**可选：多写反向提示词**（不想要真人、水印等时）：

```powershell
node scripts/wanx_reference_image.mjs --ref "https://.../ref.png" --prompt "..." --negative "真人照片, 水印, 文字, 英文" --mode refonly --strength 0.55
```

**参数怎么选（只记两条）**：

- **`--mode refonly`**：更像「**只学参考图的画风**」，换角色时常用这个。  
- **`--mode repaint`**：更像「**在参考图内容上改**」，容易长得像原图人物，慎用。  
- **`--strength`**：数字越大越贴参考图，一般先试 **0.5～0.65**，不满意再改。

**忘了怎么写参数时**：在同一目录执行 `node scripts/wanx_reference_image.mjs --help`。

若报错里提到 `model` / `size` 不合法，把控制台里当前支持的尺寸抄进 `--size`，或加 `--model wanx-v1`（与官方参考图示例一致）再试。
