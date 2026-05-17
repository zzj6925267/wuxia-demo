/**
 * 敌人数据库
 */

// 敌人数据
const ENEMIES = {
  // 山贼喽啰（山林「山贼巡路」外显两只；单人 12 级木剑+阵形剑诀 3 级，各打一场后总气血约剩 100）
  shanze_louluo_1: {
    id: 'shanze_louluo_1',
    name: '山贼喽啰',
    level: 12,
    icon: '🗡️',
    avatar: '../assets/shanze_louluo.png',
    hp: 155,
    maxHp: 155,
    attack: 30,
    defense: 10,
    /** 与少侠「50+身法×2」同量级；勿用个位数，否则高身法会连打速补、喽啰几乎不出手 */
    speed: 58,
    hit: 78,
    dodge: 18,
    parry: 8,
    stats: { strength: 11, agility: 10, bone: 10, qi: 9 },
    /** 门派剿匪差事主来源；与主线 b08 前约 15 级曲线对齐（不含黑风寨 Boss） */
    expReward: 55,
    goldReward: 10,
    drops: [
      { itemId: 'gold', chance: 0.8, minAmount: 5, maxAmount: 15 },
      { itemId: 'tie_sword', chance: 0.3 }
    ]
  },

  shanze_louluo_2: {
    id: 'shanze_louluo_2',
    name: '山贼喽啰',
    level: 12,
    icon: '🗡️',
    avatar: '../assets/shanze_louluo.png',
    hp: 168,
    maxHp: 168,
    attack: 34,
    defense: 12,
    speed: 62,
    hit: 82,
    dodge: 22,
    parry: 10,
    stats: { strength: 12, agility: 11, bone: 10, qi: 9 },
    expReward: 95,
    goldReward: 20,
    drops: [
      { itemId: 'gold', chance: 0.9, minAmount: 10, maxAmount: 25 },
      { itemId: 'tie_sword', chance: 0.4 },
      { itemId: 'leather_armor', chance: 0.2 }
    ]
  },
  
  // 青竹蛇
  qingzhu_snake_1: {
    id: 'qingzhu_snake_1',
    name: '青竹蛇',
    level: 2,
    icon: '🐍',
    avatar: '../assets/qingzhu_snake.png',
    hp: 40,
    maxHp: 40,
    attack: 12,
    defense: 2,
    speed: 58,
    hit: 85,
    dodge: 35,
    parry: 3,
    expReward: 25,
    goldReward: 8,
    drops: [
      { itemId: 'gold', chance: 0.7, minAmount: 3, maxAmount: 12 },
      { itemId: 'she_dan', chance: 0.4 }
    ]
  },
  
  /** 《陌路相逢》奇遇 · 劫信泼皮（伴战） */
  adv_companion_thug: {
    id: 'adv_companion_thug',
    name: '劫信泼皮',
    level: 8,
    icon: '🗡️',
    avatar: '../assets/adv_companion_thug.png',
    hp: 108,
    maxHp: 108,
    attack: 24,
    defense: 6,
    speed: 48,
    hit: 76,
    dodge: 16,
    parry: 6,
    expReward: 22,
    goldReward: 5,
    drops: []
  },
  /** 《陌路相逢》战 1 · 东市（少侠单挑 + 1 泼皮） */
  adv_companion_ambush: {
    id: 'adv_companion_ambush',
    name: '劫信骨头目',
    level: 9,
    icon: '⚔️',
    avatar: '../assets/adv_companion_ambush.png',
    battleIntro:
      '竹棚阴影里转出一名汉子，袖中短刃一亮：「信呢？人也要留下！」',
    sparProtagonistOnly: true,
    encounterEnemyIds: ['adv_companion_thug'],
    hp: 132,
    maxHp: 132,
    attack: 30,
    defense: 9,
    speed: 54,
    hit: 80,
    dodge: 18,
    parry: 10,
    expReward: 38,
    goldReward: 10,
    drops: [{ itemId: 'gold', chance: 0.85, minAmount: 6, maxAmount: 14 }]
  },
  /** 《陌路相逢》战 2 · 镇口（少侠单挑 + 1 泼皮） */
  adv_companion_enforcer: {
    id: 'adv_companion_enforcer',
    name: '镇口执棍客',
    level: 10,
    icon: '🏮',
    avatar: '../assets/adv_companion_enforcer.png',
    battleIntro:
      '牌坊下三人堵上来，为首者横棍一拦：「浣花剑阁的小丫头，今日休想走。」',
    sparProtagonistOnly: true,
    encounterEnemyIds: ['adv_companion_thug'],
    hp: 148,
    maxHp: 148,
    attack: 34,
    defense: 11,
    speed: 56,
    hit: 82,
    dodge: 20,
    parry: 12,
    expReward: 48,
    goldReward: 14,
    drops: [{ itemId: 'gold', chance: 0.9, minAmount: 8, maxAmount: 18 }]
  },

  /** 青石武馆教头线：喂招考校（无武学表，普攻教学；少侠单挑，约 3～4 回合） */
  qingstone_jiaotou_spar: {
    id: 'qingstone_jiaotou_spar',
    name: '教头（喂招）',
    title: '青石武馆',
    level: 4,
    icon: '🥋',
    avatar: '../assets/shanzei.png',
    battleIntro: '教头把袖口一挽：「只使三成力，接好了。」',
    /** 仅少侠入场（苏瑶旁观），避免双人一轮秒掉 */
    sparProtagonistOnly: true,
    hp: 460,
    maxHp: 460,
    attack: 10,
    defense: 6,
    speed: 18,
    hit: 68,
    dodge: 14,
    parry: 12,
    stats: { strength: 11, agility: 10, bone: 11, qi: 10 },
    expReward: 45,
    goldReward: 0,
    drops: []
  },

  qingzhu_snake_2: {
    id: 'qingzhu_snake_2',
    name: '青竹蛇',
    level: 3,
    icon: '🐍',
    avatar: '../assets/qingzhu_snake.png',
    hp: 55,
    maxHp: 55,
    attack: 18,
    defense: 4,
    speed: 64,
    hit: 90,
    dodge: 40,
    parry: 5,
    expReward: 40,
    goldReward: 15,
    drops: [
      { itemId: 'gold', chance: 0.8, minAmount: 8, maxAmount: 20 },
      { itemId: 'she_dan', chance: 0.5 },
      { itemId: 'she_tui', chance: 0.3 }
    ]
  },
  
  /** 黑风寨伴战喽啰（复用山林喽啰形象；独立 id/血量，与 shanze_louluo_1/2 分开调） */
  shanze_louluo_heifeng: {
    id: 'shanze_louluo_heifeng',
    name: '山贼喽啰',
    level: 17,
    icon: '🗡️',
    avatar: '../assets/shanze_louluo.png',
    /** 与山林喽啰一致：无武学配置，战斗仅普攻；刁/茅双人战加压 */
    hp: 780,
    maxHp: 780,
    attack: 76,
    defense: 95,
    /** 对齐 L16 踏云步线（速约 105）：伴战须能出手，勿过低被速补压死 */
    speed: 98,
    hit: 100,
    /** 穿透闪避（BattleHitRoll 从 defender.dodge 扣除后再掷闪避档） */
    accuracy: 34,
    dodge: 34,
    parry: 24,
    stats: { strength: 16, agility: 23, bone: 14, qi: 10 },
    expReward: 80,
    goldReward: 35,
    drops: []
  },

  /**
   * 黑风寨三 Boss（养成检验 · 无装基准）
   * 投放：武学重数 > 装备。王二柱 ~3～4 重可过；刁老炮须 ~六重；茅老獾须三件套满重（10），满重通关约剩 100 血（L16 参考）。
   * 勿为「必过」削弱终 Boss；打不过回刷澄心堂贡献与武学修炼。
   */
  wang_erzhu: {
    id: 'wang_erzhu',
    name: '王二柱',
    title: '守寨喽啰',
    /** 可选：战前在战斗界面以敌方气泡展示；无此字段则不播 */
    battleIntro: '哪来的毛头小子敢闯咱的地盘？看刀！',
    level: 18,
    icon: '👹',
    avatar: '../assets/heifeng_wang_erzhu.png',
    /** 引用 martialArtsData.js 武学库；副本默认 martialLevel 10 */
    martialArtId: 14,
    martialLevel: 10,
    /** 养成检验：L16 无装正阳三件套（剑3/吐4/踏4）约 435 血、168 攻、速 105 —— 首怪须苦战 */
    hp: 1020,
    maxHp: 1020,
    mp: 110,
    maxMp: 110,
    attack: 90,
    /** 满重直刺+剑影+速补仍须多轮；只抬防不抬血（后续可按比例降 HP） */
    defense: 138,
    /** 速约 102：少侠 105 难稳吃满两档速补（档差 36），开合刀法 Lv10 仍能压血 */
    speed: 102,
    hit: 100,
    accuracy: 40,
    dodge: 40,
    parry: 30,
    stats: { strength: 19, agility: 26, bone: 17, qi: 12 },
    expReward: 200,
    goldReward: 85,
    drops: [
      { itemId: 'gold', chance: 1, minAmount: 60, maxAmount: 140 }
    ]
  },
  
  diao_laopao: {
    id: 'diao_laopao',
    name: '刁老炮',
    title: '掌旗头目',
    battleIntro: '敢砸老子的营盘，今天就让你埋在这山里喂狼！',
    /** 头目 + 外寨山贼喽啰双人战 */
    encounterEnemyIds: ['shanze_louluo_heifeng'],
    level: 19,
    icon: '👺',
    avatar: '../assets/heifeng_diao_laopao.png',
    /** 原图近方构图，战斗 80×80 裁切显小；略放大（与宽屏胸像视觉对齐） */
    avatarScale: 1.12,
    /** 短柄铁斧：巡山斧诀（id15，刀类修为；劈风 axeFx）Lv10 → 「劈风」+「贯劲」 */
    martialArtId: 15,
    martialLevel: 10,
    /** 检验 ~六重三件套（无装）；低于六重应吃力 */
    hp: 1100,
    maxHp: 1100,
    mp: 120,
    maxMp: 120,
    attack: 122,
    defense: 158,
    speed: 108,
    hit: 100,
    accuracy: 52,
    dodge: 44,
    parry: 34,
    stats: { strength: 22, agility: 29, bone: 17, qi: 11 },
    expReward: 380,
    goldReward: 175,
    drops: [
      { itemId: 'gold', chance: 1, minAmount: 90, maxAmount: 200 },
      { itemId: 'cubu_wrist', chance: 0.3 }
    ]
  },
  
  mao_laohuan: {
    id: 'mao_laohuan',
    name: '茅老獾',
    title: '山寨首领',
    battleIntro: '老夫在这青苍山快活了好几年，你也敢来捋虎须？找死！',
    /**
     * 主线演出：指定回合、叠 Buff 前台词（battle.js 读表；每场仅播一次）
     * turn + buffId + beforeFirstStack 对齐触发时机
     */
    combatPerformances: [
      {
        id: 'juechen_turn2',
        turn: 2,
        buffId: 'juechen_dust',
        beforeFirstStack: true,
        once: true,
        lines: ['尝尝我落草剑经的厉害！', { text: '起！', displayMs: 1200 }]
      }
    ],
    /** 首领 + 外寨山贼喽啰双人战（伴战 id 与山林 shanze_louluo_* 分离，便于单独改血） */
    encounterEnemyIds: ['shanze_louluo_heifeng'],
    level: 20,
    icon: '👾',
    avatar: '../assets/heifeng_mao_laohuan.png',
    /** 与掉落秘籍同源：id6 落草剑经 Lv10 → 疾刺(3)+缠影(6)+绝尘(9) 全式 */
    martialArtId: 6,
    martialLevel: 10,
    /** 回合开始内功调息：读武学库内功 id11「养气术」的 autoHeal（归根），与主武功分离；等级见 innerSkillLevel */
    innerSkillArtId: 11,
    innerSkillLevel: 10,
    hp: 1320,
    maxHp: 1320,
    mp: 140,
    maxMp: 140,
    attack: 114,
    defense: 178,
    /** 满重约 5 回合；通关剩血目标 ~100（实测曾 ~150，略抬攻） */
    speed: 122,
    hit: 100,
    accuracy: 55,
    dodge: 50,
    parry: 38,
    stats: { strength: 18, agility: 36, bone: 16, qi: 15 },
    expReward: 620,
    goldReward: 420,
    drops: [
      { itemId: 'gold', chance: 1, minAmount: 220, maxAmount: 480 }
    ]
  }
};

// 地点敌人刷新配置
const LOCATION_ENEMIES = {
  'shanze_patrol': [ // 山贼巡路
    { enemyId: 'shanze_louluo_1', chance: 0.6 },
    { enemyId: 'shanze_louluo_2', chance: 0.4 }
  ],
  'luancao_slope': [ // 乱草坡
    { enemyId: 'qingzhu_snake_1', chance: 0.6 },
    { enemyId: 'qingzhu_snake_2', chance: 0.4 }
  ],
  'sheku_entrance': [ // 蛇窟洞口
    { enemyId: 'qingzhu_snake_2', chance: 1 }
  ]
};

/**
 * 根据ID获取敌人
 * @param {string} enemyId - 敌人ID
 * @returns {object|null} 敌人对象
 */
function getEnemyById(enemyId) {
  return ENEMIES[enemyId] || null;
}

/**
 * 解析一场遭遇的全部敌人（主敌 + encounterEnemyIds 伴战）
 * @param {string} primaryEnemyId
 * @returns {object[]}
 */
function getEncounterEnemies(primaryEnemyId) {
  const primary = getEnemyById(primaryEnemyId);
  if (!primary) return [];
  const out = [JSON.parse(JSON.stringify(primary))];
  const extras = primary.encounterEnemyIds;
  if (!Array.isArray(extras)) return out;
  for (const eid of extras) {
    const ex = getEnemyById(eid);
    if (ex) out.push(JSON.parse(JSON.stringify(ex)));
  }
  return out;
}

/**
 * 获取地点的随机敌人
 * @param {string} locationId - 地点ID
 * @returns {object|null} 敌人对象
 */
function getRandomEnemyAtLocation(locationId) {
  const enemyPool = LOCATION_ENEMIES[locationId];
  if (!enemyPool || enemyPool.length === 0) return null;
  
  const random = Math.random();
  let cumulative = 0;
  
  for (const entry of enemyPool) {
    cumulative += entry.chance;
    if (random <= cumulative) {
      // 深拷贝一份，防止修改原数据
      const enemy = getEnemyById(entry.enemyId);
      return enemy ? JSON.parse(JSON.stringify(enemy)) : null;
    }
  }
  
  return null;
}

/**
 * 获取地点的所有敌人列表
 * @param {string} locationId - 地点ID
 * @returns {Array} 敌人数组
 */
function getEnemiesAtLocation(locationId) {
  const enemyPool = LOCATION_ENEMIES[locationId];
  if (!enemyPool) return [];
  
  return enemyPool.map(entry => getEnemyById(entry.enemyId)).filter(e => e !== null);
}

// 暴露到全局
window.ENEMIES = ENEMIES;
window.LOCATION_ENEMIES = LOCATION_ENEMIES;
window.getEnemyById = getEnemyById;
window.getEncounterEnemies = getEncounterEnemies;
window.getRandomEnemyAtLocation = getRandomEnemyAtLocation;
window.getEnemiesAtLocation = getEnemiesAtLocation;
