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
    avatar: '../assets/shanzei.png',
    hp: 150,
    maxHp: 150,
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
    avatar: '../assets/shanzei.png',
    hp: 200,
    maxHp: 200,
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
  
  // 黑风山贼营地 - 副本敌人
  wang_erzhu: {
    id: 'wang_erzhu',
    name: '王二柱',
    title: '守寨喽啰',
    level: 8,
    icon: '👹',
    hp: 200,
    maxHp: 200,
    attack: 35,
    defense: 15,
    speed: 12,
    hit: 85,
    dodge: 30,
    parry: 20,
    expReward: 150,
    goldReward: 80,
    drops: [
      { itemId: 'gold', chance: 1, minAmount: 50, maxAmount: 100 },
      { itemId: 'shijian_sword', chance: 0.3 }
    ]
  },
  
  diao_laopao: {
    id: 'diao_laopao',
    name: '刁老炮',
    title: '掌旗头目',
    level: 9,
    icon: '👺',
    hp: 280,
    maxHp: 280,
    attack: 45,
    defense: 20,
    speed: 14,
    hit: 90,
    dodge: 35,
    parry: 25,
    expReward: 220,
    goldReward: 120,
    drops: [
      { itemId: 'gold', chance: 1, minAmount: 80, maxAmount: 150 },
      { itemId: 'shijian_sword', chance: 0.4 },
      { itemId: 'tie_armor', chance: 0.25 }
    ]
  },
  
  mao_laohuan: {
    id: 'mao_laohuan',
    name: '茅老獾',
    title: '山寨首领',
    level: 10,
    icon: '👾',
    hp: 400,
    maxHp: 400,
    attack: 60,
    defense: 25,
    speed: 16,
    hit: 95,
    dodge: 40,
    parry: 30,
    expReward: 500,
    goldReward: 300,
    drops: [
      { itemId: 'gold', chance: 1, minAmount: 200, maxAmount: 400 },
      { itemId: 'luocao_jianjing', chance: 0.2 }, // 落草剑经
      { itemId: 'pojiu_yeyi', chance: 0.2 }, // 破旧夜行衣
      { itemId: 'jingang_sword', chance: 0.4 }
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
window.getRandomEnemyAtLocation = getRandomEnemyAtLocation;
window.getEnemiesAtLocation = getEnemiesAtLocation;
