# 项目记忆文档（wuxia-demo）

**用途**：给以后的自己、别的 AI、或同事接手用——**新开对话先读本文 + `AGENTS.md`**，能较快对齐「已经有什么、约定是什么」，减少重复踩坑。  
**维护**：每次做完**可复用的设计决策、修掉的重要 bug、或换了关键路径**，用一两句话更新对应小节（写日期更好）。

**Cursor**：已在 **`.cursor/rules/read-project-memory.mdc`**（若从父目录打开工程，则还有 **`WuXiaDemo/.cursor/rules/read-wuxia-demo-memory.mdc`**）里设为 **alwaysApply**，Agent 写代码前应自动带上「先读 MEMORY + AGENTS」的约束；其他平台请人工转发上述两文件路径。

---

## 1. 本地怎么跑（以仓库为准）

- 静态站根目录在 **`wuxia-demo/game/`**（`index.html`、子目录 `ui/`、`assets/`、`js/`）。
- 启动：在该目录执行 **`node server.js`**（见 `game/server.js`），默认 **`http://127.0.0.1:3000/`**。
- 常用页（相对根）：`index.html`、`ui/forest_map.html`、`ui/heifeng_dungeon.html`、`ui/battle.html`、`ui/inventory.html` 等。
- **PowerShell** 不要用 `cd ... && node ...`；用 `Set-Location ...; node server.js`。

---

## 2. 与 `AGENTS.md` 的分工

| 文档 | 内容侧重 |
|------|-----------|
| **`AGENTS.md`** | 协作约定、战斗入口/结算/命中等**硬规则**、MCP、出图脚本等 |
| **`MEMORY.md`（本文）** | **做过什么、数据/UI 约定、易忘路径**；偏「状态与决策」 |

---

## 3. 战斗与黑风寨（已实现要点）

- **进队伍战**：统一走 `game/js/utils/battleEntry.js` 的 `BattleEntry`；战后奖励键名走 `battleSettlement.js`（详见 `AGENTS.md`）。
- **黑风寨**：`ui/heifeng_dungeon.html` + `heifeng_dungeon.js` + `heifengDungeonMapData.js`；副本进度键 `heifeng_dungeon_run` 等逻辑在 `heifeng_dungeon.js`。**进战过场**与山林图一致：点「进入战斗」→ 中央 **「战」字闪烁** → 黑屏 → `battle.html`（`heifeng_dungeon.css` / `startDungeonBattle`）。
- **战后地图不刷新**：曾在 `processBattleReturn` / `addKill` 之后才应刷新路径；已在战后回调里补 **`renderMap` + `updatePanel`**（见 `heifeng_dungeon.js` 中 `refreshDungeonAfterBattle`）。
- **战后飘字期间仍可进战**：`addKill` 须在 **`playHeifengSettlementSequence` 之前** 执行（`init` 里胜场即 `processBattleReturn(true)`）；`startDungeonBattle` 另判 `isKilled` 防重复。
- **战前敌方台词**（`battle.js`）：敌人数据里可选字段 **`battleIntro`**（`enemies.js`）；或 `dungeon_battle_context` JSON 里 **`battleIntro`** 覆盖。  
  - 多段气泡、每段约 **2.5s** 自动切；**首次点「自动战斗」** 后才播台词并写「战斗开始」日志（`openingPrimed` / `primeOpeningAndRunBattleLoop`）。
- **副本类敌人武学（策划定案）**：引用 `martialArtsData.js` 武学库时 **`martialLevel` 默认 10（拉满）**；该级下已解锁的主动/被动均生效（如开合刀法 Lv10 → 「开」+「合」）。数据写在 `enemies.js`，战斗侧读表，勿为单个怪硬编码招式数值。部分首领需 **敌人专属武学**（另表），非全部复用玩家武馆五本。
- **王二柱（初版占位，待调）**：`martialArtId: 14` 开合刀法；`maxHp/maxMp: 800/100`；`speed: 78`（对齐玩家 `50+敏捷×2` 量级，勿用个位数速度否则速补压死）；放「开」**mpCost: 10**。`battle.js` → `prepareEnemyForBattle` / `getAvailableSkillsForEnemy`。
- **刁老炮（双人战）**：喽啰仅普攻；头目 **巡山斧诀 id15**（刀类修为，主动「劈风」**`axeFx`** 斧劈特效，与开合刀法 **`bladeFx`** 区分）。多敌 `enemyTeam`；战后经验/银两合计，掉落仍只走主敌。
- **战斗 Buff 表**：`js/data/battleBuffs.js` — Buff 定义 + 头像特效**分档**（`MARTIAL_RANK_TO_BUFF_FX_TIER`）：初阶 CSS 轻量（现落草剑经）、中阶 CSS 加强、高阶/绝阶 Canvas 2D（`combatBuffCanvasFx.js`，约 15～25 粒 + 风线 + 头像轻抖/残影）。武学 passive 只填 `buffId`；rank 由 `getMartialRankForCombatBuff` 读。
- **茅老獾（终 Boss）**：双人战 + **落草剑经 id6** Lv10；**内功** `innerSkillArtId: 11`（养气术）+ `innerSkillLevel: 10` → 第二回合起与玩家同源 **回合开始内功回血**（`归根`→`inner_yangqi_guigen` 被动表，与 `calculateInnerSkillHeal` 一致）。**第二回合绝尘首叠前**演出：`combatPerformances`（台词→再起手）。战后掉落仍只走主敌。
- **正阳基础剑式（id1）**：「阳刚」`passiveIds: ['zhenyang_jianfa_yanggang']`（`loadoutPassive`：伤害倍率 +value 叠直刺等主动）；「剑影」`passiveIds: ['jianying_follow']`；旧档内联 `effect` 由 `normalizePlayerMartialArtsList` 从库同步。
- **落草剑经（id6）**：初阶身法剑；**第一式疾刺**走命中卷，对手**闪避**后 `passiveIds: ['luocao_jici_miss_follow']`（`onActiveMiss`→`battlePassives.js`）并入 `onMissFollow`「续刺」（基础 50%+身法×0.6%），旧档内联 `onMissFollow` 仍兼容；**第二式缠影** `passiveIds: ['luocao_chanying_hit']`（`loadoutPassive`→命中 `hitBonus`，与敌人同形）；**三式绝尘**：`passiveIds: ['juechen_turn_start']` → 回合开始叠 `juechen_dust`（第二回合起、最多 3 层），与正阳「剑影」命中后追击区分；旧档 `turnStartSelfBuff` 仍兼容。

---

## 4. 装备与背包约定（与设计文档对齐）

- 设计文档（`设计文档/角色系统.txt`）装备稀有度：**残品、低品、中品、极品、绝品**（色：灰/绿/蓝/紫/橙）。
- 代码里仍用 **`items.js` 的 `quality` 枚举**：`common` / `uncommon` / `rare` / `epic` / `legendary`** 对应**上述五档；**`inventory.js` 的 `QUALITY_CONFIG` 负责中文显示**。秘籍另用 `chu_jie`～`jue_jie`（初阶～绝阶），勿混用。
- **破旧夜行衣** `pojiu_yeyi`：`quality: legendary`（绝品），**`requiredLevel: 20`**（与策划口述一致）。
- **背包判断主角等级**：勿只信 `playerData.level`（常缺省）；用 **`getProtagonistLevelForInventoryUi()`**——优先 **`game_save_0.player.level`**，见 `inventory.js`。

---

## 5. 资源与头像

- 战斗内头像约 **`80×80` CSS 像素**（窄屏约 `68×68`），**无外框**（无描边/圆角装饰/阴影），`object-fit: cover`；底缘若 PNG 去底留硬边，用 **`mask-image` 最底约 22% 渐隐** 贴画卷（`battle.html`），非画框。素材仍宜在即梦/抠图时 **边缘弱化、勿带灰格底**。
- 主角/山贼参考图在 **`game/assets/`**：`shaoxia.png`、`suyao.png`、`shanzei.png`（半写实国风胸像、黑底）。**山贼喽啰**战斗头像另用 **`shanze_louluo.png`**（`shanze_louluo_1` / `_2` 共用）。
- **黑风寨三首领**在 `enemies.js` 使用 **`heifeng_*.png` 战斗 `avatar`**（与 `battle.html` 相对路径 `../assets/...`）；`icon` 仍保留作头像加载失败时的回退。

---

## 6. 美术与风格约定（统一感优先）

**定位**：本作以 **静态页 + 少量战斗特效** 为主，**无大量骨骼动画**；素材相对好凑，**最大风险是画风不统一**。新增任何立绘 / 图标 / 特效前，先对照本节。

### 6.1 主参考线（锚点文件）

- **`game/assets/shaoxia.png`**、**`suyao.png`**：主角向 — **国风武侠仙侠、半写实 2D 数码绘**，偏手游立绘精度；**纯黑底胸像/头肩**，柔和侧光、服饰与金属细节清晰。  
- **`game/assets/shanzei.png`**：敌人向 — **粗粝江湖感**，大地色、低饱和，**明暗对比略强**（斗笠、破衣、围巾）。  
- **结论**：新人物/怪物头像应 **同一渲染档次**（半写实、别混 Q 版/纯像素/欧美卡通）；**背景**优先 **纯黑或易抠的纯色**，便于战斗 UI 叠放。

### 6.2 色彩与 UI 语气（抽象约定）

- **UI 金线**：与现有 `#c9a227` / `#f4d03f` 系 **同一暖金琥珀** 家族，新面板勿另起高饱和霓虹或荧光绿。  
- **主角向**：可保留 **绛红、深紫发、金饰** 等点缀；**反派/草莽**：走 **灰褐、赭石、暗绿** 低饱和。  
- **特效**：少而精；**色相与边缘风格要统一**（要么偏锐利刀光条，要么偏柔雾，不要混用两种完全不同的粒子语言）。

### 6.3 动效策略（省动画）

- **战斗**：立绘可少动或微缩放，主要靠 **飘字、刀光/剑气条、受击闪白、震屏** 等已有路线扩展。  
- **地图/副本**：**节点高亮、连线、过场黑幕** 优于加复杂序列帧。

### 6.4 找素材与外包时的硬规则

- **优先同一作者 / 同一 CC 整包**，天生易统一。  
- **宁临时共用**（如多怪共用 `shanzei.png` 再调色）也 **勿硬塞画风跳戏** 的图。  
- 外包 / 生图：说明里必须带 **「与上述三张参考同一画风与光照逻辑」**；具体提示词骨架见历史对话或 `AGENTS.md` 周边备忘。

### 6.5 武学系统 UI（武侠换皮）

- **成品概念图**：`game/assets/images/UI/martial_arts_wuxia_ui_mockup.png`（对齐布局与风格，非最终切图；招式未解锁格建议概念稿上区分 **锁层** 与 **「N重解锁」条**，与拆图一致便于做解锁动画）。**「几重解锁」条件条配色参考**（深底银边）：`game/assets/images/UI/ma_ui_skill_unlock_caption_reference.png`。  
- **拆图清单、命名、招式锁定/解锁两态、与 DOM 对应表**：见 **`game/docs/martial-arts-ui-wuxia-assets.md`**。玩家 **纯头像 PNG** 与 **战斗 `avatar`** 同源；**武学顶栏**另叠 **金框卡 + 竖名**（见 `martialArts.css`），与战斗「纯头」区分。

---

## 7. 易混路径

- **`game_save_0.player` 四维**：`character.js` 落盘时同时写顶层 `strength`/`agility`/`bone`/`qi` 与 **`player.stats` 内同名字段**（避免武学浮窗等只读 `stats` 时与角色界面脱节）。
- 战斗背景图：`game/assets/images/UI/panel_wuxia_master_bg_only.png`（**`UI` 大写**）。
- 敌人主数据（队伍战）：**`game/js/data/enemies.js`**（勿与根下另一份 `characters.js` 里的旧 ENEMIES 混淆）。
- **战斗分层意向（目标形态）**：`battle.js` 以**主战斗循环 + 钩子分发**为主；装备/面板类数值走 **`battlePassives.js`（含 `loadoutPassive`）→ 展开函数**；战局内时效、叠层、表现走 **`battleBuffs.js`**，由被动表 **`applyBuff` / `turnStart` 等**「被动挂 Buff」接入；新功能优先扩表与分发，避免在 `battle.js` 里再堆与表平行的特判（过渡期旧内联 `effect` 仍可读档兼容）。

---

## 8. 待办 / 可改进（记得就写一条）

- **战斗被动表**：`js/data/battlePassives.js` — `turnStart`、`afterActiveHit`、`onActiveMiss`、**`loadoutPassive`**（武馆五本、正阳吐纳/踏云/阳刚、**落草缠影** `luocao_chanying_hit` 等 → `expandLoadoutPassiveStatBonuses`）；`battle.js` / `character.js` / `statCalculator` / `martialArts.js` 浮窗；**命中**被动汇总为 `hitBonus`（`getInnerSkillPassiveBonuses` / `getCharacterInnerSkillBonuses` / `getPlayerCharactersFromSave` / `updateStatsFromFour`）；**阳刚**倍率走 `getYangGangDamageMultiplierDeltaFromSkill`；仍兼容旧内联 `effect`。
- **战斗被动表重构备份**：若仓库内已无 `wuxia-demo/_backup_battle_passive_refactor_2026-05-16/` 则不必操作；若仍保留，全量验收后可整夹删除（内含旧版 `battle.js` 等，见该目录 `README.md`）。
- [x] 黑风寨三敌战斗头像：`game/assets/heifeng_*.png`（即梦边缘弱化版）；`enemies.js` 已填 `avatar`。**青竹蛇**（乱草坡等）：`game/assets/qingzhu_snake.png`，`qingzhu_snake_1` / `_2` 共用。新图放 `game/` 根目录后由 Agent 规范进 `assets/` 并删根目录副本。
- [ ] `AGENTS.md` 已与本文「启动方式」对齐；若根目录另有 `server.js` 或端口策略变更，记得两处同步。

---

*最后更新：会话中建立本文件；后续请在改动相关行为时顺手更新对应小节。*
