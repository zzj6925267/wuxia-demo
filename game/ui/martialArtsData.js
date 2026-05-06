// 武学系统数据

// 武学品阶
const MARTIAL_ARTS_RANKS = {
  CHU_JIE: { name: '初阶', color: '#9e9e9e' },
  ZHONG_JIE: { name: '中阶', color: '#4caf50' },
  GAO_JIE: { name: '高阶', color: '#2196f3' },
  JUE_JIE: { name: '绝阶', color: '#ff9800' }
};

// 武学类型
const MARTIAL_ARTS_TYPES = {
  WU_GONG: '武功',
  NEI_GONG: '内功',
  QING_GONG: '轻功'
};

// 武学数据库
const MARTIAL_ARTS_LIBRARY = [
  // ------------------- 武功 -------------------
  {
    id: 1,
    name: '正阳基础剑式',
    type: '武功',
    rank: '初阶',
    school: '正阳派',
    description: '正阳派入门剑法，朴实无华，根基扎实',
    currentLevel: 3,
    maxLevel: 10,
    practiceTimes: 2, // 当前重已修炼次数（0-2，3次满重）
    equipped: true,
    stats: { attack: 25, hit: 10 },
    skills: [
      { id: 1, name: '直刺', type: '主动', unlockLevel: 1, icon: '🗡️', description: '基础剑招，直刺敌人' },
      { id: 2, name: '横斩', type: '被动', unlockLevel: 4, icon: '⚔️', description: '增加10%攻击' },
      { id: 3, name: '剑影', type: '主动', unlockLevel: 7, icon: '✨', description: '连续三刺' }
    ]
  },
  {
    id: 2,
    name: '流云剑法',
    type: '武功',
    rank: '中阶',
    school: '正阳派',
    description: '流云般飘逸，进退自如',
    currentLevel: 0,
    maxLevel: 10,
    practiceTimes: 0,
    equipped: false,
    stats: { attack: 45, hit: 20, speed: 10 },
    skills: [
      { id: 1, name: '云起', type: '主动', unlockLevel: 1, icon: '🌊', description: '流云初起，剑招连绵' },
      { id: 2, name: '行云', type: '被动', unlockLevel: 4, icon: '☁️', description: '增加15%命中' },
      { id: 3, name: '破云', type: '主动', unlockLevel: 7, icon: '⚡', description: '强力一击' },
      { id: 4, name: '云散', type: '被动', unlockLevel: 10, icon: '💨', description: '攻击时有几率连击' }
    ]
  },

  // ------------------- 内功 -------------------
  {
    id: 3,
    name: '正阳吐纳诀',
    type: '内功',
    rank: '初阶',
    school: '正阳派',
    description: '正阳派入门吐纳法，调养内息',
    currentLevel: 2,
    maxLevel: 10,
    practiceTimes: 1,
    equipped: true,
    stats: { hp: 50, defense: 10, innerSkill: 15 },
    skills: [
      { id: 1, name: '调息', type: '主动', unlockLevel: 1, icon: '🧘', description: '恢复少量气血' },
      { id: 2, name: '固本', type: '被动', unlockLevel: 4, icon: '💪', description: '增加10%气血上限' },
      { id: 3, name: '培元', type: '被动', unlockLevel: 7, icon: '🔋', description: '增加内力' }
    ]
  },
  {
    id: 4,
    name: '紫霞心经',
    type: '内功',
    rank: '高阶',
    school: '正阳派',
    description: '正阳派高深内功，紫气东来',
    currentLevel: 0,
    maxLevel: 10,
    practiceTimes: 0,
    equipped: false,
    stats: { hp: 150, defense: 30, parry: 20, innerSkill: 40 },
    skills: [
      { id: 1, name: '紫霞护体', type: '主动', unlockLevel: 1, icon: '🔮', description: '增加防御力' },
      { id: 2, name: '紫气东来', type: '被动', unlockLevel: 4, icon: '🟣', description: '受伤时有几率反伤' },
      { id: 3, name: '霞光万道', type: '主动', unlockLevel: 7, icon: '🌟', description: '爆发内力' },
      { id: 4, name: '天地同寿', type: '被动', unlockLevel: 10, icon: '💫', description: '濒死时大幅增伤' }
    ]
  },

  // ------------------- 轻功 -------------------
  {
    id: 5,
    name: '踏云步',
    type: '轻功',
    rank: '初阶',
    school: '正阳派',
    description: '脚踏祥云，轻盈飘逸',
    currentLevel: 1,
    maxLevel: 10,
    practiceTimes: 0,
    equipped: true,
    stats: { speed: 30, dodge: 15 },
    skills: [
      { id: 1, name: '腾跃', type: '主动', unlockLevel: 1, icon: '🦘', description: '快速移动' },
      { id: 2, name: '乘风', type: '被动', unlockLevel: 4, icon: '🎐', description: '增加10%躲闪' },
      { id: 3, name: '凌云', type: '被动', unlockLevel: 7, icon: '🌤️', description: '增加速度' }
    ]
  }
];

// 玩家武学背包（已学会的）
let playerMartialArts = [...MARTIAL_ARTS_LIBRARY];

// 玩家阅历
let playerExperience = 500;
