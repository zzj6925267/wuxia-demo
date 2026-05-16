# 武学系统 · 武侠风 UI 成品与拆图规范

面向：美术出切图、程序换皮、或 AI 生图后再修。风格锚点见仓库根目录 **`MEMORY.md` §6 美术与风格约定**。

---

## 1. 成品概念图（已放入工程）

| 文件 | 说明 |
|------|------|
| **`game/assets/images/UI/martial_arts_wuxia_ui_mockup.png`** | 全屏 16:9 概念稿：水墨夜色底 + 绢/纸面板 + 金饰线；左三页签 + 功法列表 + 右详情 + 修为三格 + 招式解锁/未解锁两态示意。 |
| **`game/assets/images/UI/ma_ui_skill_unlock_caption_reference.png`** | **条件条参考**：「几重解锁」小条——近炭黑底、银灰双线边、浅字、凹角感；条上不要烤死文字。 |
| **`game/assets/images/UI/ma_ui_skill_slot_icon_backing_reference.png`** | **招式未解锁·图标区底框参考**（锁后方深色石纹/墨迹底，可带极淡书法纹）；正式资源 `ma_ui_skill_icon_backing_locked.png`（无锁、无链）。 |
| **`game/assets/images/UI/ma_ui_skill_unlock_caption_bg_9.png`** | **条件条九宫格底图（无字）**：已由 AI 按上表参考生成一版；可再交给美术修边、定 slice；文档 §3.9 文件名 `ma_ui_skill_unlock_caption_bg.9.png` 与此文件**同义**（仓库用下划线避免扩展名歧义）。 |

用途：**对齐风格与布局**，不是最终像素级 UI；正式上屏建议按下面清单 **重绘矢量或高清切图**（避免直接拉伸糊边）。

**招式区（概念图下一版建议）**：未解锁格在画面上要**分层可读**——**图标下深色底框**、**锁链/锁头叠层**、下方 **「几重解锁」条件条** 在概念稿里就画成**可区分的层**（或附小字说明），与 §3.9 独立资源一致，便于解锁动画分轨。

---

## 2. 拆图原则（给美术）

1. **底板整张**：全屏或主内容区一张 **可平铺/可九宫格** 的底纹（水墨、浅云、纸纤维），**单独导出 `ma_ui_bg_full.png`**（或 `.webp`）。  
2. **左右面板**：左列、右列各一张 **可九宫格拉伸** 的框体（四角花纹 + 直边可重复），命名如 `ma_ui_panel_left_9slice.png`、`ma_ui_panel_right_9slice.png`。  
3. **控件拆件**：每个按钮、页签、进度段、小卡片 **正常 / 按下 / 禁用（按需）** 各状态单独切。  
4. **招式格两种态**（硬性需求）：  
   - **已解锁**：亮色底或金框 + 清晰图标 + 招式名。  
   - **未解锁**：槽位底（灰/暗纹）与 **锁链叠层**、**「N重解锁」条件条底框** **分资源导出**（见 §3.9），便于解锁动画分轨；不要把锁与条件条糊成单张不可拆位图。  
5. **导出**：优先 **PNG-24 带透明**；Web 可用 **WebP**。**@2x** 一套便于高分屏。

---

## 3. 建议资源清单（命名与用途）

> 尺寸为 **参考像素**（以 1920×1080 设计稿为基准时可等比缩放）；程序里用 CSS 缩放即可。

### 3.1 全屏与面板

| 资源 ID | 建议文件名 | 用途 |
|---------|------------|------|
| BG_FULL | `ma_ui_bg_full.png` | 整屏武侠风底图（可含轻微远景） |
| PANEL_L | `ma_ui_panel_left.9.png` | 左栏底板（九宫格） |
| PANEL_R | `ma_ui_panel_right.9.png` | 右栏底板（九宫格） |
| HEADER_BAR | `ma_ui_header_bar.9.png` | 顶栏条（可选，与底图二选一） |

### 3.2 顶栏控件

| 资源 ID | 建议文件名 | 状态 |
|---------|------------|------|
| BTN_BACK | `ma_ui_btn_back.png` | normal / hover / pressed |
| TITLE_DECO | `ma_ui_title_decoration.png` | 标题两侧对称装饰（可选） |
| EXP_FRAME | `ma_ui_exp_frame.png` | 「阅历」数值外框 |
| BTN_DEBUG | `ma_ui_btn_debug.png` | 测试 +阅历（上线可隐藏） |

### 3.3 角色切换卡（对应 `.martial-char-item`）

| 资源 ID | 建议文件名 | 状态 |
|---------|------------|------|
| CHAR_CARD | `ma_ui_char_card.png` | normal / active（金边高亮） |
| CHAR_PORTRAIT_XIAO | `ma_ui_char_portrait_xiao_yunche.png` | 萧云澈 **头像抠像**（仅人物，无框无字） |
| CHAR_PORTRAIT_SU | `ma_ui_char_portrait_su_qingli.png` | 苏清璃 **头像抠像**（仅人物，无框无字） |

**角色头像规则（定稿，美术 / AI 必守）**

1. **朝向**：所有用于列表/武学顶栏的 **角色头像在画面内需统一面朝右**（便于与 UI 动线、光向一致）。概念图里若某角色原画朝左，导出时 **水平镜像** 后再入库（工程内 **`wuxia-demo/tools/portrait-crop/crop_avatars.mjs`** 已对苏清璃一侧自动 `flop`）。  
2. **风格一致**：头像必须与 **`martial_arts_wuxia_ui_mockup.png`** 中同一角色 **同画风、同造型**，避免「另起炉灶」文生图导致脸不像。**优先**用 **`sharp`** 从该概念图裁切抠近脸（见上脚本）；若必须 AI 重生，须 **以概念图为参考图 / 强约束 prompt**，并人工对稿。  
3. **交付物**：仅人物头肩（或胸像），**不要**金框、名牌、背景 UI；导出 **PNG**，建议带透明底（若暂为矩形底，程序可用 `border-radius` 裁圆）。  
4. **与战斗共用底图**：`ma_ui_char_portrait_*.png` 为 **纯头像**（无框无字），与 **`battle.js` 己方 `avatar`** 同源（`PLAYER_PORTRAIT_*`）。**武学顶栏**在 UI 层叠 **`ma_ui_char_card`** 外框 + **竖排名牌**（`.martial-char-name-tag`）+ 内嵌上述同一张 `img`；**战斗立轴**仅显示该 `img`，**不**叠武学用金框。  
5. **交付物（PNG 本身）**：仍须 **仅人物**，勿把金框名牌烤进 `ma_ui_char_portrait_*.png`，以便战斗与武学内层复用同一文件。

### 3.4 左侧 · 三页签（对应 `.type-tab`）

| 资源 ID | 建议文件名 | 状态 |
|---------|------------|------|
| TAB | `ma_ui_tab.png` | inactive / active / hover（可合并为一张 sprite） |

### 3.5 左侧 · 功法列表项（对应 `.martial-item`）

| 资源 ID | 建议文件名 | 状态 |
|---------|------------|------|
| LIST_ITEM | `ma_ui_list_item.png` | normal / selected / hover |
| TAG_ACTIVATED | `ma_ui_tag_activated.png` | 「已激发」角标（小图） |

### 3.6 右侧 · 详情区

| 资源 ID | 建议文件名 | 用途 |
|---------|------------|------|
| ICON_FRAME | `ma_ui_icon_frame.png` | 武学大方图标外框（对应 `.martial-icon`） |
| BADGE_RANK | `ma_ui_badge_rank_chu.png` 等 | 品阶徽（或一张多阶 sprite） |
| DESC_SCROLL | `ma_ui_desc_scroll.9.png` | 描述区卷轴/纸底 |

### 3.7 修为条（对应 `.realm-box`）

| 资源 ID | 建议文件名 | 用途 |
|---------|------------|------|
| REALM_EMPTY | `ma_ui_realm_segment_empty.png` | 单格未填充 |
| REALM_FILL | `ma_ui_realm_segment_fill.png` | 单格已修炼（金/墨渐变） |

### 3.8 主按钮

| 资源 ID | 建议文件名 | 状态 |
|---------|------------|------|
| BTN_PRACTICE | `ma_ui_btn_practice.png` | 「修炼」normal / disabled |
| BTN_EQUIP | `ma_ui_btn_equip.png` | 「激发」/「卸下」可同色不同字或两态 |
| STAT_TILE | `ma_ui_stat_tile.9.png` | 属性加成小格背景 |

### 3.9 招式格（对应 `.skills-grid` 内单项）— **两种 UI 必出**

未解锁格为做 **解锁动画**，**不要**把「锁链/锁」、**图标下深色底框**、**「几重解锁」条** 画在一张不可分割的图里。程序侧已拆 DOM：**`.skill-icon-backing`**（锁后方、图标下的石纹/墨迹底框）、**`.skill-lock-visual`**（仅锁链叠层）、**`.skill-unlock-caption`**（条件条）可分别设 `background` / `opacity` / `animation`。

| 资源 ID | 建议文件名 | 用途 |
|---------|------------|------|
| SKILL_SLOT_ON | `ma_ui_skill_slot_unlocked.png` | 已解锁：亮底 + 金细边 |
| SKILL_SLOT_OFF | `ma_ui_skill_slot_locked.png` | 未解锁**整格**外框/大底（若不用可省）；**不要**把锁、图标底、条件条糊进同一张 |
| SKILL_ICON_BACKING_LOCKED | `ma_ui_skill_icon_backing_locked.png` | **锁后方、武学 emoji/图标正下方** 的深色石纹或旧纸底框（可极淡水墨字纹），**不要**画锁与链；与 `SKILL_LOCK_OVERLAY` 分层。参考：`ma_ui_skill_slot_icon_backing_reference.png`。 |
| SKILL_LOCK_OVERLAY | `ma_ui_skill_lock_overlay.png` | **锁链+锁头**等叠层，叠在图标区上；动画：碎裂、淡出、`scale` 等 |
| SKILL_UNLOCK_CAPTION_BG | `ma_ui_skill_unlock_caption_bg.9.png` | **「4重解锁」「7重解锁」** 外侧条件条底框（九宫格），与锁层分离。**色面参考**：近炭黑/深铁灰底（略质感）、**银灰细亮边**（微金属倒角），文字由程序叠色为浅灰白；**不要**做成大块暖色绢纸条（易与右栏纸底混淆）。工程内参考截图：`ma_ui_skill_unlock_caption_reference.png`。导出九宫格时建议**不要烤死文字**，便于换「7重解锁」等。 |
| SKILL_ICON_MASK | `ma_ui_skill_icon_mask.png` | 可选：统一图标圆角遮罩 |

### 3.10 招式图标（对应 `martialArtsData` 每条 `skills[]`）

**现状（程序）**：数据里 `icon` 为 **emoji 占位**；武学详情格已改为 **仅显示图标**（`skill-item--icon-only`），**名称 / 主动·被动 / 描述** 在悬停 `skill-tooltip`。PNG 就位后自动加载，失败仍回退 emoji。

| 约定 | 说明 |
|------|------|
| **路径** | `game/assets/images/UI/skills/ma_skill_{武学id}_{招式id}.png` |
| **可选字段** | `skill.iconUrl` 可覆盖上述路径 |
| **尺寸** | 交付约 **500×500** 正方（程序格内约 72px 显示）；**透明底**（removebg 一类抠图即可） |
| **风格** | **锚点**：`ma_skill_1_1`～`1_3`（正阳基础剑式·直刺/阳刚/剑影）；半写实国风、图内自有装饰框可保留；**不要汉字**；**不要**再叠程序侧米色技能格外框 |

**今日优先生成（正阳三件套 · 9 张）**

| 文件名 | 武学 | 招式 | 类型 | 出图关键词（万相 prompt 参考） |
|--------|------|------|------|-------------------------------|
| `ma_skill_1_1.png` | 正阳基础剑式 | 直刺 | 主动 | 正阳剑法，直线突刺，剑尖向前，武侠技能图标，透明底 |
| `ma_skill_1_2.png` | 正阳基础剑式 | 阳刚 | 被动 | 烈日罡阳，剑修气势，攻击加持，武侠被动图标 |
| `ma_skill_1_3.png` | 正阳基础剑式 | 剑影 | 被动 | 双剑残影，追击，武侠被动图标 |
| `ma_skill_3_1.png` | 正阳吐纳诀 | 培元 | 被动 | 丹田培元，防御气场，武侠内功图标 |
| `ma_skill_3_2.png` | 正阳吐纳诀 | 固本 | 被动 | 根骨稳固，气血，武侠内功图标 |
| `ma_skill_3_3.png` | 正阳吐纳诀 | 调息 | 被动 | 吐纳调息，回气，武侠内功图标 |
| `ma_skill_5_1.png` | 踏云步 | 踏云 | 被动 | 足踏云纹，闪避，武侠轻功图标 |
| `ma_skill_5_2.png` | 踏云步 | 逐日 | 被动 | 追日奔行，速度攻击，武侠轻功图标 |
| `ma_skill_5_3.png` | 踏云步 | 凌虚 | 被动 | 凌空虚步，身法，武侠轻功图标 |

**第二批（武馆 + 绿林 · 按需）**：`ma_skill_6_1`～`6_3` 落草剑经；`10_*` 阵形剑诀；`11_*`/`12_*` 养气术/挪步诀；`13_*`/`14_*` 沉桥拳/开合刀；`15_*` 巡山斧；`4_*` 紫霞心经（4 式）。完整表见 `martialArtsData.js` 的 `MARTIAL_ARTS_LIBRARY`。

出图命令见 **`AGENTS.md`** → `scripts/wanx_reference_image.mjs`（须 **HTTPS 参考图** + `DASHSCOPE_API_KEY`）。

**动画示意（资源与节点对应）**

1. **图标区底** `SKILL_ICON_BACKING_LOCKED` → **`.skill-icon-backing`**（常显于未解锁格）。  
2. `SKILL_LOCK_OVERLAY` → **`.skill-lock-visual`**：解锁时先处理这一层。  
3. `SKILL_UNLOCK_CAPTION_BG` + 文本 → **`.skill-unlock-caption`** / **`.skill-unlock-text`**：与锁层独立时间轴。  
4. 解锁完成后切换为 `SKILL_SLOT_ON` 或去掉 `locked` 态即可。

---

## 4. 与现有 HTML 结构对应（程序换皮时改 class / background）

| DOM / class | 说明 |
|-------------|------|
| `body` | 可铺 `ma_ui_bg_full` |
| `.martial-arts-container` | 内容安全区，一般不铺整张底 |
| `.header` | 顶栏；按钮 `#backBtn`、`.title`、`.exp-display` |
| `.martial-character-list` / `.martial-char-item` | 角色切换；内含 **`.martial-char-card`**（`ma_ui_char_card` 底）、**`.martial-char-name-tag`**（竖名）、**`.martial-char-portrait`**（与战斗同源的纯头图） |
| `.left-panel` | 左栏底板 |
| `.type-tab` | 三页签 |
| `.martial-item` | 功法列表行 |
| `.right-panel` | 右栏滚动区 |
| `.detail-header` / `.martial-icon` | 大图与名称 |
| `.level-section` / `.realm-box` | 修为与三段条 |
| `#practiceBtn` | 修炼按钮 |
| `.stats-section` / `.stats-grid` | 属性加成 |
| `.skills-section` / `.skills-grid` | **招式**：**`.skill-item` / `.skill-item.locked`**；未解锁时 **`.skill-icon-wrap`** 内顺序为 **`.skill-icon-backing`**（图标下底框）→ **`.skill-icon`** → **`.skill-lock-visual`**（锁链叠层）；底部 **`.skill-unlock-caption`** / **`.skill-unlock-text`** |
| `#equipBtn` | 激发/卸下 |

---

## 5. 程序侧后续一步（备忘）

- **换皮实装（v1）**：`martialArts.css` 已用 `:root` 变量挂接 **`ma_ui_bg_full`**、**`ma_ui_panel_left_9` / `right_9`**、**`header_bar_9`**、**`btn_back` / `exp_frame`**、**`list_item`**、**`icon_frame` / `desc_scroll_9`**、**`realm_segment_*`**、**`btn_practice` / `btn_equip`**、**`stat_tile_9`**、**招式槽与锁层** 等；勿破坏 **`body` → `.martial-arts-container` → `.main-content` → 左右栏** 的 **`min-height: 0` + `overflow`** 链。  
- 武学顶栏角色：`martialArts.js` **`renderCharacterList`** 输出 **`.martial-char-card`**（底图 **`ma_ui_char_card.png`**）+ **`.martial-char-name-tag`**（竖名，数据来自 `martialCharacters[].name`）+ **`.martial-char-portrait`**（`PLAYER_PORTRAIT_*` 与 **`battle.js` `avatar`** 同源）。战斗侧 **不**使用 `martial-char-card`，仅 **`character-avatar`** 纯图。  
- 招式节点由 **`martialArts.js`** 输出：解锁为 **`<div class="skill-item">`**；未解锁为 **`skill-item locked`**，**`skill-icon-wrap`** 内为 **`skill-icon-backing`**（图标下底框）→ **`skill-icon`** → **`skill-lock-visual`**（锁链叠层），底部 **`skill-unlock-caption`** / **`skill-unlock-text`**。换皮时在 **`martialArts.css`** 中分别为图标底、锁层、条件条设 `background` / 动画，时间轴可独立。

---

*文档随拆图定稿可继续补：实际像素尺寸、sprite 坐标表、Figma 链接。*
