# 项目记忆文档（wuxia-demo）

**用途**：给以后的自己、别的 AI、或同事接手用——**新开对话先读本文 + `AGENTS.md`**，能较快对齐「已经有什么、约定是什么」，减少重复踩坑。  
**维护**：每次做完**可复用的设计决策、修掉的重要 bug、或换了关键路径**，用一两句话更新对应小节（写日期更好）。

**Cursor**：**`.cursor/rules/read-project-memory.mdc`**、**`.cursor/rules/utf8-chinese-ui-files.mdc`**（均已纳入本仓库版控，`alwaysApply`）。从父目录 `WuXiaDemo/` 打开工程时，可继续保留上层同名规则作镜像。其他平台请人工转发 `MEMORY.md` + `AGENTS.md`。

---

## 0. 当前版本（发版对照）

- **`version.json` / `GAME_CONFIG.GAME_VERSION`**：**0.1.2**（build **12**，2026-05-17）— 教头木械 spar_done、门派差事入派、背包/采集小修、MEMORY §5.1 资源进包约定。

## 1. 本地怎么跑（以仓库为准）

- 静态站根目录在 **`wuxia-demo/game/`**（`index.html`、子目录 `ui/`、`assets/`、`js/`）。
- 启动：在 **`wuxia-demo/game/`** 执行 **`node server.js`**（根目录固定为 `server.js` 所在文件夹，勿依赖当前终端路径），默认 **`http://127.0.0.1:3000/`**。
- 常用页（相对根）：`index.html`、`ui/forest_map.html`、`ui/heifeng_dungeon.html`、`ui/battle.html`、`ui/inventory.html` 等。
- **主线章节跳过（自测）**：**`http://127.0.0.1:3000/ui/dev_chapter_skip.html`** — 下拉选 `main_b_01`～`main_b_10` 起点，写入 `playerState`（不改 `game_save_0`）；可自动跳转青石/舆图/山林，并设 `dev_qingstone_node` / `dev_zhengyang_building` / `dev_forest_spawn` 出生点。
- **自测重置（任务 + 武学 + 阅历）**：浏览器打开 **`http://127.0.0.1:3000/ui/dev_reset_martial_yueli.html`**（会清 `playerExperience`、`playerMartialArts_*`、`playerState` 内主线/武馆教程等，并清 `qingstone_dojo_spar_victory` 与常见战后 `localStorage` 键；**不改** `game_save_0`），约 1 秒后跳青石镇。
- **自测：正阳三件套一重**（验招式未解锁灰态）：**`http://127.0.0.1:3000/ui/dev_reset_zhenyang_martial_level.html`** — 仅把 id **1 / 3 / 5** 的 `currentLevel`→1、`practiceTimes`→0（保留已学/装备），约 1 秒后跳武学页。
- **新局全量归零（2026-05）**：须先 **`node server.js`**（在 `game/` 目录）。**正式入口**：首页「新的江湖」→ **`ui/character_creation.html`**（黑屏开场打字机 → 卷轴五题、四维默认 5、每题 +1 预览 → 黑屏淡出 → **青石镇镇口** `qingstone_gate`）。写入逻辑 **`js/utils/newGameBootstrap.js`**（`NewGameBootstrap.resetNewGame(fourDim, saveSlot?)`）。**开发跳过问答**：`ui/dev_new_game.html`（四维全 5，仍清档进青石镇）。勿用 `file://` 打开。开局：**1 级、阅历 0、银两 0、气血/内力/攻击由四维推导、五维修为 0、无已学武学**；问答文案在 **`js/data/characterCreation.js`**（须原创，勿复用他游角色创建句式，如「没落武林世家」「宠溺放任」等）。
- **PowerShell** 不要用 `cd ... && node ...`；用 `Set-Location ...; node server.js`。

---

## 2. 与 `AGENTS.md` 的分工

| 文档 | 内容侧重 |
|------|-----------|
| **`AGENTS.md`** | 协作约定、战斗入口/结算/命中等**硬规则**、MCP、出图脚本等 |
| **`MEMORY.md`（本文）** | **做过什么、数据/UI 约定、易忘路径**；偏「状态与决策」 |

### Agent 约定：掉落 / 奖励何时抽成独立表（**发现即自动执行**，不必等用户再说一遍）

在实现副本、敌人、战后结算或掉落相关改动时，若**已出现或即将出现**下面任一条，应**主动**把「武学秘籍 / 装备等可变掉落」抽到独立数据文件（如 `js/data/lootPools.js` 或按域拆的 `drops_*.js`），并在关卡/敌人侧用 **`lootPoolId`（或等价 id）引用**，金银阅历经验等**通用结算**仍走现有字段与 **`battleSettlement.js`** 键名约定，勿重复硬编码整套基础奖励文案。

1. **掉落相关行数**已让 `enemies.js`、`heifengDungeonMapData.js` 等单文件**难翻、难 diff**。  
2. **同一套掉落池**要被**多个副本或多种敌人**复用。  
3. 需要把掉落经济**单独导出、单独校验**（与关卡叙事、坐标等拆开的价值已明显）。

若三条**都不**满足，可继续内联或小对象；不必为「对齐大厂粒度」提前拆很多空表。

### Agent 约定：任务表（`ui/taskData.js`）何时拆文件（**首次遇到即拆，越早越好**）

任务 UI 与逻辑读 **`ALL_TASKS`** / **`TASK_TYPE_CONFIG`**（见 `taskData.js` + `task.js`）。在**后续加剧情、加支线/门派/奇遇**的实现过程中，**第一次**出现下面任一情况，就应**主动**把任务配置拆成多文件（如按类型 `taskDataMain.js` + `taskDataFaction.js`，或按大章 `taskData_chapter*.js`），并保留**薄聚合层**仍导出同名 **`ALL_TASKS`**（及必要的 **`TASK_TYPE_CONFIG`**），各页 `<script>` 顺序以聚合文件为准；与 **`npcData.js`** 的对话分支仍须用**同一 `task.id`** 对齐，避免两处各造一套 id。

1. **`taskData.js` 已难快速定位单条任务**（过长、难翻、难 diff）。  
2. **某一类任务（主线 / 门派 / 支线 / 奇遇）条目明显变多**，或**即将一次性加入整章/大量条目**。  
3. **同一改动里**既要大改任务数据又要改接取/结算逻辑，单文件混杂导致**审 diff 成本高**。

**为何倾向早拆**：条目尚少时迁移主要是**切块与引用**，风险低；等几百条堆在同一文件再拆，**漏改 id、冲突、回归成本**都会陡增——「能早拆就不赌后期一口气搬迁」。

---

## 3. 战斗与黑风寨（已实现要点）

- **进队伍战**：统一走 `game/js/utils/battleEntry.js` 的 `BattleEntry`；战后奖励键名走 `battleSettlement.js`（详见 `AGENTS.md`）。
- **黑风寨**：`ui/heifeng_dungeon.html` + `heifeng_dungeon.js` + `heifengDungeonMapData.js`；副本进度键 `heifeng_dungeon_run` 等逻辑在 `heifeng_dungeon.js`。**进战过场**与山林图一致：点「进入战斗」→ 中央 **「战」字闪烁** → 黑屏 → `battle.html`（`heifeng_dungeon.css` / `startDungeonBattle`）。
- **黑风寨副本推进（勿走大地图通图逻辑）**：从山林 `openHeifengDungeon` 进本须落 **乱石林营**（`heifeng_fresh_enter`）；房间顺序 **营 → 外寨偏房（王二柱）→ 中庭（刁老炮）→ 聚义厅（茅老獾）→ 北口离开**；`edgeAllowed` 仅允许**相邻下一格**且前置 Boss 已击杀；`bossPrerequisiteMet` / `clampRoomToProgress` 防止存档站位越级直接打终 Boss。战后仍回 `RETURN_ROOM_KEY` 房间；**北口离开**才 `clearRun`。
- **主线等级与副本落差（策划定案）**：**进黑风寨 Boss 战之前**（b01～b08 + 考校 + 九次剿匪山贼，**不计** Boss 战阅历）目标 **约 15 级**；**b09/b10 任务奖励另计**。黑风寨 Boss **Lv17～20**，养成检验关。
- **黑风寨 = 养成检验（非硬挡进本）**：主线可推到寨口/进副本；**只推主线、不刷贡献换入门武/不练武学**的玩家允许进寨，但 **Boss 战应明显偏难**（等级 + 武学 + 装备综合），败退后自行回去接澄心堂差事、苏瑶换艺、武学修炼——**打不过不是 bug**，勿为「必过」削弱 Boss 或加进本等级硬门槛（除非策划另定）。
- **主线 b08～b10（黑风寨）**：b08 首次进山林记结。**`main_b_09` 北峰问讯**：**山贼窝棚**（`shanze_shed`）孟青松问明缘由（`heifu_gate_story_ack`）即结章发任务奖励（`tryCompleteForestMainB09`）；黑风寨入口仅副本进战。**`main_b_10` 清剿黑风寨**：须击败茅老獾（`tryCompleteMainB10OnDungeonCleared`）才结章；打不过卡 b10。任务奖励与副本内战后阅历/掉落**分开结算**。进寨须 b09 已完成。孟青松人设以支线定稿为准。
- **两套养成货币（对外名不同，勿混）**：**经验** = 角色等级池（`game_save_0.player.exp` / `char.exp`）→ `getCharLevelExpDisplayName()`；**历练** = 武学修炼池（`playerExperience` / 战后 `expReward`）→ `getMartialPracticeDisplayName()`。逻辑键仍 `exp` / `yueli`。
- **队友角色阅历（2026-05）**：战后 `exp`（角色等级阅历）除少侠外，**本场参战队友**（`pending_battle_rewards.partyCharIds`，由 `battle.js` 从 `allyTeam` 写入，**不含 id=1**）同额写入 **`playerCharacters` 对应条目的 `exp.current`** 并走与少侠相同的升级公式（`config.js` → `processPartyBattleYueli` / `BattleSettlement.applyLevelYueliFromBattleRewards`）。**仅单人出战**时不发队友阅历。队友**武学修炼阅历**（`expReward`）仍只加少侠侧 `playerExperience`（待奇遇队友养成定案后再拆）。
- **角色等级阅历池（勿与武学阅历混）**：`game_save_0.player.exp` / `playerCharacters[].exp.current` 表示**当前等级距下一级**的累计值，升级时按 `getExpRequiredForLevel` **逐级扣除**（见 `applyPlayerYueliLevelUps`）。若只加不减会堆到数千，角色页显示「还需负数升级」。**打开角色页**会调 `reconcileYueliOnCharacterPanel` 自动结算积压升级；战后须走 `processYueliLevelUpsForSave` / `applyLevelYueliFromBattleRewards`。
- **正阳派 NPC「苏瑶」传授入门武**（与可出战队友**不是同一人**，见下节）：对话 `learn_skill` 须同时写 **`playerState.learnedSkills`** 与 **`playerMartialArts_{charId}`**（少侠 charId **1**；`grantZhengyangIntroMartialArt`，名→id 见 `taskData.js` 的 `ZHENGYANG_INTRO_SKILL_MARTIAL_ID`）；仅写 learnedSkills 会导致武学页空、贡献已扣。`repairZhengyangIntroMartialsFromLearnedSkills` 可补旧档。
- **门派贡献经济（2026-05）**：澄心堂三条差事交差贡献在 **`taskData.js`**（默认 **11 / 11 / 12**，一轮 **34**，九次约 **102**）；**正阳 NPC 苏瑶**处换一门入门武 = **`getZhengyangIntroSkillContributionCost()`** = **100**（三门合计 **300**）；仍须约 **九次**接交换一本。对话与 `acceptTask` / `completeSingleTask` 读 **`getFactionQuestContributionAmount`**，勿在 `npcData` 再写死贡献数。`map.html` 须在 **`npcData.js` 前**加载 `taskData.js`。**接取/交差门派差事**须 **`playerState.joinedFaction`**（苏瑶入派）；`isPlayerJoinedZhengyangFaction()`、`acceptTask`/`completeSingleTask` 与赵恪 `faction_need_join` 对白。
- **战后地图不刷新**：曾在 `processBattleReturn` / `addKill` 之后才应刷新路径；已在战后回调里补 **`renderMap` + `updatePanel`**（见 `heifeng_dungeon.js` 中 `refreshDungeonAfterBattle`）。
- **战后飘字期间仍可进战**：`addKill` 须在 **`playHeifengSettlementSequence` 之前** 执行（`init` 里胜场即 `processBattleReturn(true)`）；`startDungeonBattle` 另判 `isKilled` 防重复。
- **战前敌方台词**（`battle.js`）：敌人数据里可选字段 **`battleIntro`**（`enemies.js`）；或 `dungeon_battle_context` JSON 里 **`battleIntro`** 覆盖。  
  - 多段气泡、每段约 **2.5s** 自动切；**首次点「自动战斗」** 后才播台词并写「战斗开始」日志（`openingPrimed` / `primeOpeningAndRunBattleLoop`）。
- **副本类敌人武学（策划定案）**：引用 `martialArtsData.js` 武学库时 **`martialLevel` 默认 10（拉满）**；该级下已解锁的主动/被动均生效（如开合刀法 Lv10 → 「开」+「合」）。数据写在 `enemies.js`，战斗侧读表，勿为单个怪硬编码招式数值。部分首领需 **敌人专属武学**（另表），非全部复用玩家武馆五本。
- **进战过场（战字+黑屏）**：`ui/battleEnterCinematic.js` + `battle-enter-cinematic.css`；青石教头喂招等须 `runBeforeBattleNavigate` 后再跳 `battle.html`（勿直接 `startPartyBattle`），战后回图仍靠 `battle_exit_cinematic` 淡出。
- **山林山贼喽啰（`shanze_louluo_1/2`）**：约 **Lv12**、气血 **155/168**（勿再用 800 血拖局）；攻击 **30/34**、防御 **10/12**，对齐「12 级木剑 + 阵形剑诀 3 级、攻 98 / 防 5 / 血 235」**单人各打一场**战后总气血约 **100**（双人队另调）。
- **黑风寨养成检验（策划定案 · 2026-05）**：
  - **数值投放优先级**：**武学重数 / 被动解锁** > **装备** > 等级；调难度时**以无装 + 正阳三件套重数**为基准，**不把装备算进黑风寨门槛**（装备有加成但不应替代刷武学）。
  - **门槛（正阳入门三件套：基础剑式 + 吐纳诀 + 踏云步，均指 `currentLevel` 重数）**：
    - **王二柱**：约 **3～4 重** + 主线等级（~15～16）可过，首怪检验「有练过」。
    - **刁老炮**：须 **三门均约 6 重**（六重）方可稳定过；低于六重应明显吃力或打不过。
    - **茅老獾**：须 **三门满重（10 重）** 方可稳定过终战；六重过刁后打茅应仍偏难，满重通关时少侠约 **剩 100 血**（L16 无装、**仅少侠一人**参考）。
  - **队友 charId 2 与双人（策划定案 · 2026-05）**：
    - **入队时机**：**奇遇·入队任务**（山林等，**尚未定稿**）后才可出战，**开局不在队**。
    - **调难度基准**：上表门槛与下述实测，一律按 **少侠单人** 验收；**勿为「双人必过」削弱 Boss**。
    - **双人体验**：队友养成后刁/茅等多敌战会**明显更轻松**，属预期，不是平衡 bug。
    - **数据侧**：刁/茅 `enemyTeam` 仍可按双人战配置；队友若仍白板，不计入单人门槛。
  - **黑风寨当前数值（只抬防、不抬血）**：喽啰 **780 / 防 95**；王 **1020 / 攻 90 / 防 138**；刁 **1100 / 攻 122 / 防 158**；茅 **1320 / 攻 114 / 防 178**。技能伤害统一扣防（`resolveFlatSkillDamage`）。后续全图血量若上千，**按比例降 HP**，勿再叠高。
  - **黑风寨实测（满重三件套 · 无装 · 单人 · 2026-05）**：王二柱约 **3 回合**、刁老炮 **4 回合**、茅老獾 **5 回合**；痛感适中；通关茅后少侠约 **剩 150 血**（目标 ~100，茅攻 108→114 微抬后再验）。**双人养成后勿用此条反推削弱。**
  - **单人基准验收（2026-05 · 策划确认）**：**无装 + 满重三件套单人**本版难度**已对好**，暂不再为黑风寨削 Boss。**后续**若玩家**穿装备**、或**奇遇队友入队并养成**，副本会**明显更轻松**——属预期（养成奖励），**勿**为此回调寨内数值；若装备投放进黑风寨前需单独验一档，另开策划单。
- **队伍战伤害公式**（`BattleHitRoll.js` + `battle.js`）：物伤 **攻击 − 防御**（至少 1）。**命中卷招式**（如落草「疾刺」）：`攻击×倍率` 作有效攻再掷闪避/命中/暴击。**无 `useHitRoll` 的招式**（正阳「直刺」、王二柱「开」等）曾 **不扣防御** → 已用 `resolveFlatSkillDamage` 统一扣防；**剑影追击** 同理。**茅老獾打玩家痛**：Boss 攻高 + 玩家面板防御常仅 **~5 根骨项 + 吐纳被动**（战内约 **40+** 仍偏低），非单纯攻表异常。
- **黑风寨实测记录**：
  - **2026-05-16 · L14 单剑 3 重**：攻 120 / 血 280 / 速 70 → **打不过王二柱**（当时血 800）。
  - **2026-05-16 · L16 正阳三件套**：无装；剑 3 / 吐 4 / 踏 4；战力约 **429**；攻 **168**、血 **435**、内 **160**、速 **105**（**常触发速补**）；四维 **25/20/20/15**；剑修 **29**、轻功 **20**；当时测法含苏瑶白板旁证 → 反馈**副本偏易、须加强** → 已按上表调高 `enemies.js`；后续验收以**单人满重**为准。
- **刁老炮（双人战）**：喽啰仅普攻；头目 **巡山斧诀 id15**（刀类修为，主动「劈风」**`axeFx`** 斧劈特效，与开合刀法 **`bladeFx`** 区分）。多敌 `enemyTeam`；战后经验/银两合计，掉落仍只走主敌。
- **主动招式伤害表**：`js/data/martialSkillDamage.js`（键 `武学id_主动招式id`）；战斗与武学浮窗用 `resolveActiveDamageEffect`；凡加载 `martialArtsData.js` 的页面须**在其之前**引入本表（与 `battleBuffs.js` 等并列）。
- **战斗 Buff 表**：`js/data/battleBuffs.js` — Buff 定义 + 头像特效**分档**（`MARTIAL_RANK_TO_BUFF_FX_TIER`）：初阶 CSS 轻量（现落草剑经）、中阶 CSS 加强、高阶/绝阶 Canvas 2D（`combatBuffCanvasFx.js`，约 15～25 粒 + 风线 + 头像轻抖/残影）。武学 passive 只填 `buffId`；rank 由 `getMartialRankForCombatBuff` 读。
- **茅老獾（终 Boss）**：双人战 + **落草剑经 id6** Lv10；**内功** `innerSkillArtId: 11`（养气术）+ `innerSkillLevel: 10` → 第二回合起与玩家同源 **回合开始内功回血**（`归根`→`inner_yangqi_guigen` 被动表，与 `calculateInnerSkillHeal` 一致）。**第二回合绝尘首叠前**演出：`combatPerformances`（台词→再起手）。战后掉落仍只走主敌。
- **正阳基础剑式（id1）**：「阳刚」`passiveIds: ['zhenyang_jianfa_yanggang']`（`loadoutPassive`：伤害倍率 +value 叠直刺等主动）；「剑影」`passiveIds: ['jianying_follow']`；旧档内联 `effect` 由 `normalizePlayerMartialArtsList` 从库同步。
- **武学招式格 UI（2026-05）**：详情区招式为 **纯图标**（`skill-item--icon-only`）；`icon` 字段仍为 emoji 占位，PNG 路径 **`assets/images/UI/skills/ma_skill_{武学id}_{招式id}.png`** 或 `skill.iconUrl`；名称/类型/说明仅在悬停 tooltip。出图清单见 **`game/docs/martial-arts-ui-wuxia-assets.md` §3.10**。
- **武学列表/详情·初阶图标**：凡 `rank === '初阶'`（武功/内功/轻功统一）用 **`assets/images/UI/ma_ui_martial_icon_chu.png`**（仅卷轴，无 `ma_ui_icon_frame` 金框、无默认米色底格）；中阶及以上仍回退类型 emoji。
- **招式图标美术基准（定稿 · 2026-05）**：以 **正阳基础剑式** 三枚为准——`ma_skill_1_1`～`1_3`（去水印 + 抠透明底，约 **500×500**，图内保留招式自有金框/造型，**不要**程序侧米色外框）。后续武功/内功/轻功招式图标 **按同一画风与规格** 出图后覆盖同名路径即可；未出图前仍回退 emoji。**正阳吐纳诀**（武学 id 3）已落盘 `ma_skill_3_1`～`3_3`（培元/固本/调息）。**踏云步**（id 5）已落盘 `ma_skill_5_1`～`5_3`（踏云/逐日/凌虚）。**落草剑经**（id 6）已落盘 `ma_skill_6_1`～`6_3`（疾刺/缠影/绝尘）。
- **招式未解锁态**：`currentLevel < skill.unlockLevel` 时该格 `locked`（例：修为 **6 重** 时 **7 重解锁** 的「剑影」）——**图标全灰**、三格等高对齐；**「N重解锁」** 仅在悬停 tooltip（`skill-tooltip-lock`），格内不占位。判定在 `martialArts.js` 的 `isUnlocked`。
- **招式浮窗数值展示**：凡倍率/概率/属性加成文案一律 **整数**（`helpers.js` → `formatDisplayInt` / `formatMultiplierAsPercent` 等；武学页 `martialArts.js` 的 `fmtInt`/`fmtPct*`），避免 `1.14*100` 浮点尾巴；战斗内仍用表内浮点算。
- **落草剑经（id6）**：初阶身法剑；**第一式疾刺**走命中卷，对手**闪避**后 `passiveIds: ['luocao_jici_miss_follow']`（`onActiveMiss`→`battlePassives.js`）并入 `onMissFollow`「续刺」（基础 50%+身法×0.6%），旧档内联 `onMissFollow` 仍兼容；**第二式缠影** `passiveIds: ['luocao_chanying_hit']`（`loadoutPassive`→命中 `hitBonus`，与敌人同形）；**三式绝尘**：`passiveIds: ['juechen_turn_start']` → 回合开始叠 `juechen_dust`（第二回合起、最多 3 层），与正阳「剑影」命中后追击区分；旧档 `turnStartSelfBuff` 仍兼容。

### 3A. 正阳苏瑶 vs 队友叶轻绾——不是同一人（策划定案 · 2026-05）

| | **正阳派 NPC · 苏瑶** | **可出战队友 · 叶轻绾（charId 2）** |
|---|----------------------|-------------------------------------|
| **身份** | 正阳内门，传功、贡献、主线 b05～b08 | **浣花剑阁**外门弟子，江湖门派（与正阳**无关**） |
| **名字** | **苏瑶**（定稿） | **叶轻绾**（定稿；`character.js` / `battle.js` / `martialArtsData.js` 已改） |
| **立绘** | — | 角色面板列表 + 装备区中央头像与武学页同源：`ma_ui_char_portrait_xiao_yunche` / `ma_ui_char_portrait_su_qingli`（`CHARACTER_PORTRAIT_FLIP_H_BY_ID`） |
| **入队** | — | 奇遇 **《陌路相逢》**（`taskData.adventure`）：玩家**自找**触发，与主线无前置；**任意进度**可接可做（含进黑风寨之后） |
| **入口** | `npcData.js` → `suyao`；正阳/舆图主线 | 青石镇 **后巷** 地点下 NPC，**点击对话**才 `acceptTask`；未对话前任务页「奇遇」为空 |
| **战斗/入队** | — | 全链 **2 场战**（战 2 建议镇口或东市）；**战后回后巷**同 NPC 对话 → 点 **「邀请同行」** → `companionJoined`（柳如意式，非自动入队） |
| **数据键** | — | 仍 **charId 2**、`playerMartialArts_2`；头像 `suyao.png` 可暂用至新立绘 |

**《陌路相逢》梗概（5 节任务链，≈主线一半篇幅，靠剧情/跑腿拉长）**：下山送阁中书信，信物被劫、受伤躲后巷 → 药铺/打听 → **战 1** → 揭仇 → **战 2** → 后巷邀请入队。

**门派差事**：须 `playerState.joinedFaction === true`（苏瑶处入派）方可向赵恪接取/交差；`isPlayerJoinedZhengyangFaction()` / `isFactionQuestTaskId()` 见 `taskData.js`；未入派点「门派任务」走 `faction_need_join` 对白。

**已实现（2026-05-17）**：`taskData.adventure` 五条 `adv_companion_01`～`05`；青石镇 `qingstoneCompanionQuest.js` + 地图 NPC 区（后巷叶轻绾、仁心药铺贺行舟、东市/镇口迎战）；战后 `companionJoined` + `battle.js` 未入队仅 id=1 出战；入队按钮「邀请同行」。镇口战 2 胜后步骤为 **`invite`**（`advCompanionAwaitInvite` / `companionBattle2Cleared`），勿与未完成的 `adv_companion_05` 混用，否则后巷无人、镇口可重复战。**战斗头像**：`game/assets/adv_companion_thug.png`（劫信泼皮伴战）、`adv_companion_ambush.png`（劫信骨头目）、`adv_companion_enforcer.png`（镇口执棍客）；`enemies.js` → `avatar`。**UI**：`companionParty.js` — 未入队不展示 charId 2。**养成**：队友独立 `playerMartialArts_2`、`char.exp` 战后阅历；武学页「阅历」仍全局共享（`playerExperience`）；切队友勿写 `save.player` 根级 hp/mp（已修 2026-05）。

**后路（可选，未做）**：柳如意式队友养成/升级支线可挂 **浣花剑阁**（回阁、师叔赐招、同门试剑等）；实现时勿接 `npcData.suyao`。

协作者：**「苏瑶」= 正阳 NPC**；**「叶轻绾」= 队友 charId 2**。

---

## 4. 装备与背包约定（与设计文档对齐）

- 设计文档（`设计文档/角色系统.txt`）装备稀有度：**残品、低品、中品、极品、绝品**（色：灰/绿/蓝/紫/橙）。
- 代码里仍用 **`items.js` 的 `quality` 枚举**：`common` / `uncommon` / `rare` / `epic` / `legendary`** 对应**上述五档；**`inventory.js` 的 `QUALITY_CONFIG` 负责中文显示**。秘籍另用 `chu_jie`～`jue_jie`（初阶～绝阶），勿混用。
- **背包格子**：`items.js` 中 **`category === 'equipment'`** 的装备**不叠放**（每件单独一格，`quantity` 恒为 1）；丹药/材料等仍可叠至 99。入包逻辑见 **`inventory.js`** 的 `addToInventory`；青石图 **`qingstoneAddInventoryItem`**、山林 **`forest_map`**、黑风寨 **`heifeng_dungeon.js`** 与 **`PlayerSystem.addItem`** 与之一致。
- **青石武馆教头「问径」领抄本**：发放前会 **`qingstoneStripAllEquipmentFromBag`** 移除行囊内**全部装备类**条目（避免与黑风寨掉落、旧演示档混叠），再只加**本路秘籍 + 一木械**；`inventory.html` / `inventory.js` 不再在无存档时注入铁剑皮甲等演示装备。
- **破旧夜行衣** `pojiu_yeyi`：`quality: legendary`（绝品），**`requiredLevel: 20`**（与策划口述一致）。
- **背包判断主角等级**：勿只信 `playerData.level`（常缺省）；用 **`getProtagonistLevelForInventoryUi()`**——优先 **`game_save_0.player.level`**，见 `inventory.js`。
- **改 `game/ui/inventory.js` 防乱码**：该文件含大量中文 UI 串。用 Cursor **StrReplace / 直接粘贴保存** 时，偶发会把 UTF-8 中文变成 `??`（整页按钮、等级文案全坏）。**优先**：在 `wuxia-demo` 根用 **Node 脚本 `fs.readFileSync`/`writeFileSync(..., 'utf8')`** 改；或只改无中文的英文行。若已坏：在 **`wuxia-demo` 仓库** `git restore game/ui/inventory.js` 再重改。PowerShell 重定向/无 BOM 保存也易踩坑，勿用来写该文件。

---

## 5. 资源与头像

- 战斗内头像约 **`80×80` CSS 像素**（窄屏约 `68×68`），**无外框**（无描边/圆角装饰/阴影），`object-fit: cover`；底缘若 PNG 去底留硬边，用 **`mask-image` 最底约 22% 渐隐** 贴画卷（`battle.html`），非画框。素材仍宜在即梦/抠图时 **边缘弱化、勿带灰格底**。
- 主角/山贼参考图在 **`game/assets/`**：`shaoxia.png`、`suyao.png`、`shanzei.png`（半写实国风胸像、黑底）。**山贼喽啰**战斗头像另用 **`shanze_louluo.png`**（`shanze_louluo_1` / `_2` 共用）。
- **黑风寨三首领**在 `enemies.js` 使用 **`heifeng_*.png` 战斗 `avatar`**（与 `battle.html` 相对路径 `../assets/...`）；`icon` 仍保留作头像加载失败时的回退。

### 5.1 体积与进包（demo 阶段约定，2026-05）

- **现状粗算**（`game/` 整目录）：总约 **55 MB**；**`assets/` PNG ≈ 54 MB**（59 张，多张 UI 单张 1～2 MB）；**JS/HTML/CSS ≈ 1.2 MB**。商业 500 MB 级包多为引擎+音视频+大量已压资源；本作若按现有效率堆到同内容量会偏胖，**问题在图未量产规范，不在玩法代码**。
- **目录**
  - **`game/assets/`**：仅放**运行时会被页面引用**的正式资源（立绘、`images/UI/` 上屏切图等）。
  - **`game/assets_dev/`**（可选，建议逐步启用）：**mockup、reference、AI 原图、概念稿**；本地可对路径，**打 zip / 对外发包时排除**。
- **勿进发布包**（可留仓库或 `assets_dev/`）：文件名含 **`mockup`**、**`reference`** 的图（如 `martial_arts_wuxia_ui_mockup.png`、`*_reference.png`）——文档已写明为对齐布局，**非最终像素 UI**（见 §6.5、`game/docs/martial-arts-ui-wuxia-assets.md`）。
- **进包前自检（给美术/协作者）**
  1. **显示多大导出多大**：UI 九宫格最长边一般 **512～1024**；勿 4K 导出再 CSS 缩小。
  2. **正式 PNG 体积心上限**：立绘/头像约 **≤300 KB**；UI 切图约 **≤500 KB**（超则压或拆图）。
  3. 优先 **PNG-24 透明** 或 **WebP**；拆图、命名、招式两态见 **`martial-arts-ui-wuxia-assets.md`**。
  4. 新图按用途分子目录：`assets/` 根立绘与战斗头像、`assets/images/UI/` 界面、`assets/images/UI/skills/` 招式图标。
- **何时真压一轮**：日常开发**可不压**；**给外人测、上 CDN、打安装/静态 zip** 前，对 **`assets/`** 批量 pngquant / TinyPNG 等，**不要压 `assets_dev/`**。越晚文件越多，批量改路径+回归成本越高，故**先定规矩、发版再压**。
- **协作者**：新增资源时勿把参考/mock 拷进 `assets/`「图省事」；发版前可用脚本列出 **`assets/` 下 >500 KB 的 .png** 做清单（`npm run pack:check` 类任务可后补）。

---

## 6. 美术与风格约定（统一感优先）

**定位**：本作以 **静态页 + 少量战斗特效** 为主，**无大量骨骼动画**；素材相对好凑，**最大风险是画风不统一**。新增任何立绘 / 图标 / 特效前，先对照本节。

### 6.1 主参考线（锚点文件）

- **`game/assets/shaoxia.png`**、**`suyao.png`**：立绘资源；`suyao.png` 当前多绑 **charId 2 队友占位**，与正阳 NPC 苏瑶**可共用图直至新角色定稿换素材**（见 §3A）。  
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

- **大地图进出点**：从 `zhengyang_clan` 进嵌套正阳后，离开须回到 **正阳派** 节点（`goBackToWorldMap` 记 `world_map_return_location` + `currentLocation`）；`zhengyang_map.html` 返回亦写 `zhengyang_clan`。勿落默认悦来客栈。
- **小地图底栏四键（背包/武学/任务/角色）**：打开子页前 `submap_quick_nav.js` 经各页 **`window.getSubmapLocationForPersist`** 写入站位键（山林 `forest_map_location`、青石 `qingstone_map_location`、黑风寨 `heifeng_dungeon_location`）；`init` 读回，避免关页后落默认道口/镇口。
- **青石镇子图站位**：`qingstone_map.html` 在 `travelTo`、教头/旁白对话收起时写入 **`localStorage.qingstone_map_location`**；`init` 在消费完 `preBattleLocation` / `dev_qingstone_node` 后读该键，避免从武学/背包/战斗返回时落回镇口或告示墙。
- **青石镇子图镜头**：`#mapWorld` 平移；`renderMap` 后始终把**当前地点**居中到扣除底栏后的安全视口；clamp 按全部节点坐标范围推算（避免 800×580 与视口同大时只能平移十几像素）。
- **青石镇「此地NPC」**：`qingstone_map.html` 统一 `#qingstoneNpcSection` / `refreshQingstoneNpcHub`（对齐正阳派 `map.html`）；点击 NPC 先出对话选项（含「打听几句闲话」），街坊见闻走 `QINGSTONE_TOWN_TIP_LINES` / `QINGSTONE_TOWN_RUMORS` 嵌在对话里，不外露按钮；同地点可多 NPC（如铁匠铺 **李师傅**购武 + **学徒**打听）。**常驻**：仁心药铺 **贺行舟**；**李记铁匠铺** `QINGSTONE_SMITH_SHOP` 售 `liji_tie_jian/dao/quan`（低品·十级·500两·不限购，入背包可装备）；东市/镇口敌对仍按任务刷。
- **山林初阶敌人速度**：`shanze_louluo_1/2` 速度约 **56/62**（对齐少侠 `50+身法×2` 量级）；勿再用个位数，否则新档高身法会压满速补、喽啰不出手。青竹蛇同调至 **58/64**。
- **教头喂招考校**：`enemies.js` → `qingstone_jiaotou_spar` 设 **`sparProtagonistOnly`**（`battle.js` 仅 id=1 入场）、气血约 **460**、攻弱于野怪，目标 **3～4 回合**打完（勿双人队战秒杀）。
- **角色装备弹窗**：`character.js` 的 **`getEquipPickerItemsForChar`** 只列 **`playerData.inventory`** 里对应槽位装备（已去掉 `PLAYER_INVENTORY` 演示剑）。**木械三选一**：问径后仅展示 **`qingstoneDojoTutorial.weaponId`** 那一件木械；教头发抄本+木械**只入背包，不自动穿戴**，玩家到角色面板手动装备。判定「已领木械」须含 **`phase: spar_done`**（考校后），勿只认 `picked`，否则 `inventory.js` 刷新会误删 `mu_jian`/`mu_dao`/`mu_quan`；缺件时开背包/角色页会按 `weaponId` 补回一格。
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

*最后更新：2026-05-17 增补 §5.1 资源体积与进包约定；其它小节请在改动相关行为时顺手更新。*
