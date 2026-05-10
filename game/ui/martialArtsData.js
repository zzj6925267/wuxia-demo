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
  {
    id: 1,
    name: '正阳基础剑式',
    type: '武功',
    skillType: 'sword',
    rank: '初阶',
    school: '正阳派',
    description: '正阳派入门剑法，朴实无华，根基扎实',
    currentLevel: 3,
    maxLevel: 10,
    practiceTimes: 2,
    equipped: true,
    baseBonus: { sword: 5 },
    stats: { attack: 25, hit: 10 },
    skills: [
      { id: 1, name: '直刺', type: '主动', unlockLevel: 1, icon: '🗡️', mpCost: 20, description: '基础剑招，直刺敌人，臂力越高伤害越高', effect: { type: 'damage', value: 1.2, bonusAttr: 'strength', bonusPerPoint: 0.02 }, detail: '基础伤害120%，每点臂力额外+2%伤害' },
      { id: 2, name: '阳刚', type: '被动', unlockLevel: 4, icon: '☀️', description: '被动增加攻击，臂力越高加成越多', effect: { type: 'buff', stat: 'attack', value: 0.1, bonusAttr: 'strength', bonusPerPoint: 0.03 }, detail: '基础攻击+10%，每点臂力额外+3%' },
      { id: 3, name: '剑影', type: '被动', unlockLevel: 7, icon: '✨', description: '直刺后有20%概率跟随一剑，身法越高触发概率越高', effect: { type: 'followAttack', baseChance: 0.2, damage: 0.8, chanceAttr: 'agility', chancePerPoint: 0.01 } }
    ]
  },
  {
    id: 2,
    name: '流云剑法',
    type: '武功',
    skillType: 'sword',
    rank: '中阶',
    school: '正阳派',
    description: '流云般飘逸，进退自如',
    currentLevel: 0,
    maxLevel: 10,
    practiceTimes: 0,
    equipped: false,
    baseBonus: { sword: 8 },
    stats: { attack: 45, hit: 20, speed: 10 },
    skills: [
      { id: 1, name: '云起', type: '主动', unlockLevel: 1, icon: '🌊', description: '流云初起，剑招连绵' },
      { id: 2, name: '行云', type: '被动', unlockLevel: 4, icon: '☁️', description: '增加15%命中' },
      { id: 3, name: '破云', type: '主动', unlockLevel: 7, icon: '⚡', description: '强力一击' },
      { id: 4, name: '云散', type: '被动', unlockLevel: 10, icon: '💨', description: '攻击时有几率连击' }
    ]
  },
  {
    id: 3,
    name: '正阳吐纳诀',
    type: '内功',
    skillType: 'innerSkill',
    rank: '初阶',
    school: '正阳派',
    description: '正阳派入门吐纳法，调养内息',
    currentLevel: 7,
    maxLevel: 10,
    practiceTimes: 1,
    equipped: true,
    baseBonus: { innerSkill: 5 },
    stats: { hp: 50, defense: 10, innerSkill: 15 },
    skills: [
      { id: 1, name: '培元', type: '被动', unlockLevel: 1, icon: '🔋', description: '固本培元，增加防御力', effect: { type: 'defenseBuff', baseValue: 30, bonusAttr: 'bone', bonusPerPoint: 0.5 }, detail: '基础防御+30，每点根骨额外+0.5' },
      { id: 2, name: '固本', type: '被动', unlockLevel: 4, icon: '💪', description: '稳固根基，增加气血上限', effect: { type: 'maxHpBuff', baseValue: 50, bonusAttr: 'bone', bonusPerPoint: 0.5 }, detail: '气血上限+50，每点根骨额外+0.5' },
      { id: 3, name: '调息', type: '被动', unlockLevel: 7, icon: '🧘', description: '吐纳调息，每回合自动恢复气血', effect: { type: 'autoHeal', baseValue: 5, levelMultiplier: 3, bonusAttr: 'qi', bonusPerPoint: 0.8 }, detail: '每回合恢复5+等级×3+内息×0.8点气血' }
    ]
  },
  {
    id: 4,
    name: '紫霞心经',
    type: '内功',
    skillType: 'innerSkill',
    rank: '高阶',
    school: '正阳派',
    description: '正阳派高深内功，紫气东来',
    currentLevel: 0,
    maxLevel: 10,
    practiceTimes: 0,
    equipped: false,
    baseBonus: { innerSkill: 10 },
    stats: { hp: 150, defense: 30, parry: 20, innerSkill: 40 },
    skills: [
      { id: 1, name: '紫霞护体', type: '主动', unlockLevel: 1, icon: '🔮', description: '增加防御力' },
      { id: 2, name: '紫气东来', type: '被动', unlockLevel: 4, icon: '🟣', description: '受伤时有几率反伤' },
      { id: 3, name: '霞光万道', type: '主动', unlockLevel: 7, icon: '🌟', description: '爆发内力' },
      { id: 4, name: '天地同寿', type: '被动', unlockLevel: 10, icon: '💫', description: '濒死时大幅增伤' }
    ]
  },
  {
    id: 5,
    name: '踏云步',
    type: '轻功',
    skillType: 'lightSkill',
    rank: '初阶',
    school: '正阳派',
    description: '正阳派基础轻功，脚踏祥云，气势如虹',
    currentLevel: 1,
    maxLevel: 10,
    practiceTimes: 0,
    equipped: true,
    baseBonus: { lightSkill: 5 },
    stats: { speed: 25, dodge: 20, attack: 10 },
    skills: [
      { id: 1, name: '踏云', type: '被动', unlockLevel: 1, icon: '☁️', description: '脚踏祥云，增加闪避', effect: { type: 'buff', stat: 'dodge', baseValue: 15, bonusAttr: 'agility', bonusPerPoint: 0.5 } },
      { id: 2, name: '逐日', type: '被动', unlockLevel: 4, icon: '☀️', description: '追逐烈日，增加攻击', effect: { type: 'buff', stat: 'attack', baseValue: 10, bonusAttr: 'strength', bonusPerPoint: 0.5 } },
      { id: 3, name: '凌虚', type: '被动', unlockLevel: 7, icon: '✨', description: '凌空虚步，增加速度', effect: { type: 'buff', stat: 'speed', baseValue: 15, bonusAttr: 'agility', bonusPerPoint: 0.6 } }
    ]
  }
];

// 玩家初始拥有的武学（只有基础武学）
const INITIAL_PLAYER_MARTIAL_ARTS = [
  {
    id: 1,
    name: '正阳基础剑式',
    type: '武功',
    skillType: 'sword',
    rank: '初阶',
    school: '正阳派',
    description: '正阳派入门剑法，朴实无华，根基扎实',
    currentLevel: 3,
    maxLevel: 10,
    practiceTimes: 2,
    equipped: true,
    baseBonus: { sword: 5 },
    stats: { attack: 25, hit: 10 },
    skills: [
      { id: 1, name: '直刺', type: '主动', unlockLevel: 1, icon: '🗡️', mpCost: 20, description: '基础剑招，直刺敌人，臂力越高伤害越高', effect: { type: 'damage', value: 1.2, bonusAttr: 'strength', bonusPerPoint: 0.02 }, detail: '基础伤害120%，每点臂力额外+2%伤害' },
      { id: 2, name: '阳刚', type: '被动', unlockLevel: 4, icon: '☀️', description: '被动增加攻击，臂力越高加成越多', effect: { type: 'buff', stat: 'attack', value: 0.1, bonusAttr: 'strength', bonusPerPoint: 0.03 }, detail: '基础攻击+10%，每点臂力额外+3%' },
      { id: 3, name: '剑影', type: '被动', unlockLevel: 7, icon: '✨', description: '直刺后有20%概率跟随一剑，身法越高触发概率越高', effect: { type: 'followAttack', baseChance: 0.2, damage: 0.8, chanceAttr: 'agility', chancePerPoint: 0.01 } }
    ]
  },
  {
    id: 3,
    name: '正阳吐纳诀',
    type: '内功',
    skillType: 'innerSkill',
    rank: '初阶',
    school: '正阳派',
    description: '正阳派入门吐纳法，调养内息',
    currentLevel: 7,
    maxLevel: 10,
    practiceTimes: 1,
    equipped: true,
    baseBonus: { innerSkill: 5 },
    stats: { hp: 50, defense: 10, innerSkill: 15 },
    skills: [
      { id: 1, name: '培元', type: '被动', unlockLevel: 1, icon: '🔋', description: '固本培元，增加防御力', effect: { type: 'defenseBuff', baseValue: 30, bonusAttr: 'bone', bonusPerPoint: 0.5 }, detail: '基础防御+30，每点根骨额外+0.5' },
      { id: 2, name: '固本', type: '被动', unlockLevel: 4, icon: '💪', description: '稳固根基，增加气血上限', effect: { type: 'maxHpBuff', baseValue: 50, bonusAttr: 'bone', bonusPerPoint: 0.5 }, detail: '气血上限+50，每点根骨额外+0.5' },
      { id: 3, name: '调息', type: '被动', unlockLevel: 7, icon: '🧘', description: '吐纳调息，每回合自动恢复气血', effect: { type: 'autoHeal', baseValue: 5, levelMultiplier: 3, bonusAttr: 'qi', bonusPerPoint: 0.8 }, detail: '每回合恢复5+等级×3+内息×0.8点气血' }
    ]
  },
  {
    id: 5,
    name: '踏云步',
    type: '轻功',
    skillType: 'lightSkill',
    rank: '初阶',
    school: '正阳派',
    description: '正阳派基础轻功，脚踏祥云，气势如虹',
    currentLevel: 1,
    maxLevel: 10,
    practiceTimes: 0,
    equipped: true,
    baseBonus: { lightSkill: 5 },
    stats: { speed: 25, dodge: 20, attack: 10 },
    skills: [
      { id: 1, name: '踏云', type: '被动', unlockLevel: 1, icon: '☁️', description: '脚踏祥云，增加闪避', effect: { type: 'buff', stat: 'dodge', baseValue: 15, bonusAttr: 'agility', bonusPerPoint: 0.5 } },
      { id: 2, name: '逐日', type: '被动', unlockLevel: 4, icon: '☀️', description: '追逐烈日，增加攻击', effect: { type: 'buff', stat: 'attack', baseValue: 10, bonusAttr: 'strength', bonusPerPoint: 0.5 } },
      { id: 3, name: '凌虚', type: '被动', unlockLevel: 7, icon: '✨', description: '凌空虚步，增加速度', effect: { type: 'buff', stat: 'speed', baseValue: 15, bonusAttr: 'agility', bonusPerPoint: 0.6 } }
    ]
  }
];

// 角色列表（跟角色系统一致）
const martialCharacters = [
  { id: 1, name: '少侠', icon: '👨‍🦰' },
  { id: 2, name: '苏瑶', icon: '👩' }
];

let currentMartialCharacterId = 1;

// 武学数据版本号，用于检测旧数据
const MARTIAL_DATA_VERSION = 4;

// 玩家武学背包（每个角色单独一份）
function getPlayerMartialArts(charId) {
  try {
    // 检查版本号
    const savedVersion = localStorage.getItem('martialDataVersion');
    if (!savedVersion || parseInt(savedVersion) < MARTIAL_DATA_VERSION) {
      console.log('检测到旧版本武学数据，正在清理...');
      // 清理所有旧武学数据
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('playerMartialArts')) {
          localStorage.removeItem(key);
        }
      }
      // 更新版本号
      localStorage.setItem('martialDataVersion', MARTIAL_DATA_VERSION.toString());
      console.log('武学数据已清理，使用新数据');
      return [...INITIAL_PLAYER_MARTIAL_ARTS];
    }

    const saved = localStorage.getItem(`playerMartialArts_${charId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      // 验证数据格式，确保每个武学都有skills数组
      if (Array.isArray(parsed) && parsed.every(martial => 
        martial && martial.skills && Array.isArray(martial.skills)
      )) {
        return parsed;
      } else {
        console.warn('武学数据格式错误，使用初始数据');
      }
    }
  } catch (e) {
    console.warn('解析武学数据失败，使用初始数据', e);
  }
  // 默认初始武学（只有基础武学）
  return [...INITIAL_PLAYER_MARTIAL_ARTS];
}

function getPlayerExperience() {
  const saved = localStorage.getItem('playerExperience');
  if (saved) return parseInt(saved);
  return 200;
}

function resetPlayerExperience() {
  playerExperience = 200;
  localStorage.setItem('playerExperience', playerExperience);
  document.getElementById('playerExp').textContent = playerExperience;
  
  // 重新渲染详情，更新按钮状态
  if (typeof renderDetail === 'function') {
    renderDetail();
  }
}

function saveMartialData() {
  localStorage.setItem(`playerMartialArts_${currentMartialCharacterId}`, JSON.stringify(playerMartialArts));
  localStorage.setItem('playerExperience', playerExperience);
}

function switchMartialCharacter(charId) {
  // 保存当前角色数据
  saveMartialData();
  
  // 切换角色
  currentMartialCharacterId = charId;
  
  // 加载新角色数据（武学独立，阅历共享）
  playerMartialArts = getPlayerMartialArts(charId);
  // 阅历不变，保持共享
  
  // 重置界面
  selectedMartialArt = null;
  currentType = '武功';
  document.getElementById('noSelection').style.display = 'flex';
  document.getElementById('detailPanel').style.display = 'none';
  
  // 更新角色选择器样式
  document.querySelectorAll('.martial-char-item').forEach((item, idx) => {
    item.classList.toggle('active', martialCharacters[idx].id === charId);
  });
  
  // 重新渲染
  renderList();
  document.getElementById('playerExp').textContent = playerExperience;
}

// 重置武学数据
function resetMartialData() {
  localStorage.removeItem(`playerMartialArts_${currentMartialCharacterId}`);
  localStorage.removeItem(`playerExperience_${currentMartialCharacterId}`);
  playerMartialArts = [...MARTIAL_ARTS_LIBRARY];
  playerExperience = 500;
  selectedMartialArt = null;
  currentType = '武功';
  document.getElementById('noSelection').style.display = 'flex';
  document.getElementById('detailPanel').style.display = 'none';
  renderList();
  document.getElementById('playerExp').textContent = playerExperience;
  alert('已重置！');
}

// 暴露武学库到全局
window.MARTIAL_ARTS_LIBRARY = MARTIAL_ARTS_LIBRARY;

// 初始加载当前角色数据
let playerMartialArts = getPlayerMartialArts(currentMartialCharacterId);
let playerExperience = getPlayerExperience();

// 计算当前武学修为（全局函数，供角色系统调用）
function calculateMartialArtsBonuses() {
  const bonuses = {
    fist: 0,
    sword: 0,
    blade: 0,
    lightSkill: 0,
    innerSkill: 0
  };

  playerMartialArts.forEach(martial => {
    if (martial.baseBonus && martial.currentLevel > 0) {
      Object.entries(martial.baseBonus).forEach(([key, val]) => {
        if (bonuses.hasOwnProperty(key)) {
          bonuses[key] += val * martial.currentLevel;
        }
      });
    }
  });

  Object.keys(bonuses).forEach(key => {
    if (bonuses[key] > 100) bonuses[key] = 100;
  });

  return bonuses;
}
