/**
 * 游戏配置常量
 * @module config
 */

/**
 * 游戏基础配置
 */
const GAME_CONFIG = {
  // 玩家初始属性
  INITIAL_STATS: {
    level: 1,
    exp: 0,
    expToNextLevel: 100,
    maxHp: 100,
    hp: 100,
    maxMp: 50,
    mp: 50,
    attack: 10,
    defense: 5,
    strength: 10,
    agility: 10,
    vitality: 10,
    spirit: 10,
    gold: 50
  },

  // 升级所需经验倍率
  EXP_MULTIPLIER: 1.5,

  // 属性影响系数
  STAT_MULTIPLIERS: {
    strength: 0.5,    // 力量影响攻击
    vitality: 5,      // 体质影响生命
    agility: 0.1,     // 敏捷影响闪避率
    spirit: 0.3       // 内力影响技能威力
  },

  // 战斗配置
  BATTLE: {
    CRITICAL_CHANCE: 0.15,      // 暴击率
    CRITICAL_MULTIPLIER: 1.5,   // 暴击伤害倍率
    DODGE_CHANCE: 0.1           // 闪避率
  },

  // 存档配置
  SAVE: {
    AUTO_SAVE_INTERVAL: 30000,  // 自动存档间隔（毫秒）
    MAX_SAVE_SLOTS: 5           // 最大存档槽位
  }
};

/**
 * 游戏状态枚举
 */
const GAME_STATE = {
  MENU: 'menu',           // 主菜单
  DIALOG: 'dialog',       // 对话中
  BATTLE: 'battle',       // 战斗中
  INVENTORY: 'inventory', // 背包界面
  STATUS: 'status',       // 角色状态
  MAP: 'map'              // 地图探索
};

/**
 * 技能类型枚举
 */
const SKILL_TYPE = {
  ATTACK: 'attack',
  HEAL: 'heal',
  BUFF: 'buff',
  DEBUFF: 'debuff'
};

/**
 * 角色类型枚举
 */
const CHARACTER_TYPE = {
  NPC: 'npc',
  ENEMY: 'enemy'
};

// 暴露到全局
window.GAME_CONFIG = GAME_CONFIG;
window.GAME_STATE = GAME_STATE;
window.SKILL_TYPE = SKILL_TYPE;
window.CHARACTER_TYPE = CHARACTER_TYPE;