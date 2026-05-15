/**
 * 敌人数据库
 */

// 敌人数据
const ENEMIES = {
  // 山贼喽啰
  shanze_louluo_1: {
    id: 'shanze_louluo_1',
    name: '山贼喽啰',
    level: 1,
    icon: '🗡️',
    avatar: '../assets/shanze_louluo.png',
    hp: 800,
    maxHp: 800,
    attack: 10,
    defense: 3,
    speed: 8,
    hit: 70,
    dodge: 20,
    parry: 5,
    expReward: 20,
    goldReward: 10,
    drops: [
      { itemId: 'gold', chance: 0.8, minAmount: 5, maxAmount: 15 },
      { itemId: 'tie_sword', chance: 0.3 }
    ]
  },
  
  shanze_louluo_2: {
    id: 'shanze_louluo_2',
    name: '山贼喽啰',
    level: 2,
    icon: '🗡️',
    avatar: '../assets/shanze_louluo.png',
    hp: 800,
    maxHp: 800,
    attack: 15,
    defense: 5,
    speed: 10,
    hit: 75,
    dodge: 25,
    parry: 8,
    expReward: 35,
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
    speed: 15,
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
    speed: 18,
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
    /** 与山林喽啰一致：无武学配置，战斗仅普攻 */
    hp: 650,
    maxHp: 650,
    attack: 58,
    defense: 32,
    speed: 74,
    hit: 88,
    dodge: 32,
    parry: 22,
    stats: { strength: 15, agility: 12, bone: 14, qi: 10 },
    expReward: 80,
    goldReward: 35,
    drops: []
  },

  // 黑风山贼营地 - 副本敌人
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
    hp: 800,
    maxHp: 800,
    mp: 100,
    maxMp: 100,
    attack: 72,
    defense: 38,
    /** 与玩家速度线对齐：约 50 + agility×2（14→78），避免 22 被双人+速补完全压死 */
    speed: 78,
    hit: 92,
    dodge: 38,
    parry: 28,
    stats: { strength: 18, agility: 14, bone: 16, qi: 12 },
    expReward: 200,
    goldReward: 85,
    drops: [
      { itemId: 'gold', chance: 1, minAmount: 60, maxAmount: 140 },
      { itemId: 'shijian_sword', chance: 0.3 }
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
    hp: 800,
    maxHp: 800,
    mp: 100,
    maxMp: 100,
    attack: 88,
    defense: 46,
    speed: 78,
    hit: 95,
    dodge: 42,
    parry: 32,
    stats: { strength: 20, agility: 14, bone: 15, qi: 11 },
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
    hp: 900,
    maxHp: 900,
    mp: 120,
    maxMp: 120,
    attack: 98,
    defense: 52,
    /** 身法向首领：约 50+敏捷×2；缠斗被动另加命中 */
    speed: 80,
    hit: 90,
    dodge: 48,
    parry: 36,
    stats: { strength: 16, agility: 15, bone: 14, qi: 14 },
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
