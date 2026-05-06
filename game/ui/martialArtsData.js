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
      { id: 1, name: '直刺', type: '主动', unlockLevel: 1, icon: '🗡️', description: '基础剑招，直刺敌人' },
      { id: 2, name: '横斩', type: '被动', unlockLevel: 4, icon: '⚔️', description: '增加10%攻击' },
      { id: 3, name: '剑影', type: '主动', unlockLevel: 7, icon: '✨', description: '连续三刺' }
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
    currentLevel: 2,
    maxLevel: 10,
    practiceTimes: 1,
    equipped: true,
    baseBonus: { innerSkill: 5 },
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
    description: '脚踏祥云，轻盈飘逸',
    currentLevel: 1,
    maxLevel: 10,
    practiceTimes: 0,
    equipped: true,
    baseBonus: { lightSkill: 5 },
    stats: { speed: 30, dodge: 15 },
    skills: [
      { id: 1, name: '腾跃', type: '主动', unlockLevel: 1, icon: '🦘', description: '快速移动' },
      { id: 2, name: '乘风', type: '被动', unlockLevel: 4, icon: '🎐', description: '增加10%躲闪' },
      { id: 3, name: '凌云', type: '被动', unlockLevel: 7, icon: '🌤️', description: '增加速度' }
    ]
  }
];

// 角色列表（跟角色系统一致）
const martialCharacters = [
  { id: 1, name: '少侠', icon: '👨‍🦰' },
  { id: 2, name: '苏瑶', icon: '👩' }
];

let currentMartialCharacterId = 1;

// 玩家武学背包（每个角色单独一份）
function getPlayerMartialArts(charId) {
  const saved = localStorage.getItem(`playerMartialArts_${charId}`);
  if (saved) return JSON.parse(saved);
  // 默认初始武学
  return [...MARTIAL_ARTS_LIBRARY];
}

function getPlayerExperience() {
  const saved = localStorage.getItem('playerExperience');
  if (saved) return parseInt(saved);
  return 500;
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
