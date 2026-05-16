/**
 * 角色数据
 * @module characters
 */

/**
 * 玩家初始数据
 */
/** 新局默认：四维各 5，气血/内力基础值，修为与背包由玩法再获得 */
const PLAYER_INITIAL = {
  id: 'player',
  name: '少侠',
  level: 1,
  exp: 0,
  expToNextLevel: 100,
  maxHp: 100,
  hp: 100,
  maxMp: 50,
  mp: 50,
  attack: 50,
  defense: 5,
  skills: [],
  inventory: [],
  stats: {
    strength: 5,
    agility: 5,
    vitality: 5,
    spirit: 5,
    bone: 5,
    qi: 5
  },
  gold: 0,
  flags: {}
};

/**
 * NPC数据
 */
const NPCS = {
  mysterious_old_man: {
    id: 'mysterious_old_man',
    name: '神秘老者',
    type: 'npc',
    avatar: 'assets/images/npcs/mysterious_old_man.png',
    dialogId: 'dialog_mysterious_old_man',
    description: '一位仙风道骨的老者，似乎知道许多不为人知的秘密'
  },
  inn_keeper: {
    id: 'inn_keeper',
    name: '客栈老板',
    type: 'npc',
    avatar: 'assets/images/npcs/inn_keeper.png',
    dialogId: 'dialog_inn_keeper',
    description: '经营着镇上唯一的客栈，消息灵通'
  },
  weapon_smith: {
    id: 'weapon_smith',
    name: '铁匠师傅',
    type: 'npc',
    avatar: 'assets/images/npcs/weapon_smith.png',
    dialogId: 'dialog_weapon_smith',
    description: '打造的兵器闻名江湖'
  }
};

/**
 * 敌人数据
 */
const ENEMIES = {
  bandit: {
    id: 'bandit',
    name: '山贼',
    type: 'enemy',
    avatar: 'assets/images/enemies/bandit.png',
    maxHp: 40,
    hp: 40,
    attack: 8,
    defense: 3,
    skills: ['basic_attack'],
    expReward: 20,
    goldReward: 10,
    drops: [
      { itemId: 'gold', chance: 0.8 },
      { itemId: 'potion_small', chance: 0.3 }
    ]
  },
  wild_dog: {
    id: 'wild_dog',
    name: '野狗',
    type: 'enemy',
    avatar: 'assets/images/enemies/wild_dog.png',
    maxHp: 25,
    hp: 25,
    attack: 6,
    defense: 1,
    skills: ['basic_attack'],
    expReward: 10,
    goldReward: 5,
    drops: [
      { itemId: 'gold', chance: 0.5 },
      { itemId: 'meat', chance: 0.4 }
    ]
  },
  gang_leader: {
    id: 'gang_leader',
    name: '山寨头目',
    type: 'enemy',
    avatar: 'assets/images/enemies/gang_leader.png',
    maxHp: 100,
    hp: 100,
    attack: 15,
    defense: 8,
    skills: ['basic_attack', 'power_strike'],
    expReward: 80,
    goldReward: 50,
    drops: [
      { itemId: 'gold', chance: 1.0 },
      { itemId: 'potion_medium', chance: 0.5 },
      { itemId: 'iron_sword', chance: 0.2 }
    ]
  },
  martial_artist: {
    id: 'martial_artist',
    name: '江湖武者',
    type: 'enemy',
    avatar: 'assets/images/enemies/martial_artist.png',
    maxHp: 80,
    hp: 80,
    attack: 12,
    defense: 6,
    skills: ['basic_attack', 'quick_strike'],
    expReward: 60,
    goldReward: 30,
    drops: [
      { itemId: 'gold', chance: 0.9 },
      { itemId: 'skill_book', chance: 0.1 }
    ]
  }
};

// 暴露到全局
window.PLAYER_INITIAL = PLAYER_INITIAL;
window.NPCS = NPCS;
window.ENEMIES = ENEMIES;