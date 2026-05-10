// 角色系统数据

// 武学数据副本
const LOCAL_MARTIAL_ARTS = [
  {
    id: 1,
    name: '正阳基础剑式',
    type: '武功',
    skillType: 'sword',
    rank: '初阶',
    school: '正阳派',
    currentLevel: 3,
    maxLevel: 10,
    practiceTimes: 2,
    equipped: true,
    baseBonus: { sword: 5 },
    stats: { attack: 25, hit: 10 },
    skills: []
  },
  {
    id: 2,
    name: '流云剑法',
    type: '武功',
    skillType: 'sword',
    rank: '中阶',
    school: '正阳派',
    currentLevel: 0,
    maxLevel: 10,
    practiceTimes: 0,
    equipped: false,
    baseBonus: { sword: 8 },
    stats: { attack: 45, hit: 20, speed: 10 },
    skills: []
  },
  {
    id: 3,
    name: '正阳吐纳诀',
    type: '内功',
    skillType: 'innerSkill',
    rank: '初阶',
    school: '正阳派',
    currentLevel: 2,
    maxLevel: 10,
    practiceTimes: 1,
    equipped: true,
    baseBonus: { innerSkill: 5 },
    stats: { hp: 50, defense: 10, innerSkill: 15 },
    skills: []
  },
  {
    id: 4,
    name: '紫霞心经',
    type: '内功',
    skillType: 'innerSkill',
    rank: '高阶',
    school: '正阳派',
    currentLevel: 0,
    maxLevel: 10,
    practiceTimes: 0,
    equipped: false,
    baseBonus: { innerSkill: 10 },
    stats: { hp: 150, defense: 30, parry: 20, innerSkill: 40 },
    skills: []
  },
  {
    id: 5,
    name: '踏云步',
    type: '轻功',
    skillType: 'lightSkill',
    rank: '初阶',
    school: '正阳派',
    currentLevel: 1,
    maxLevel: 10,
    practiceTimes: 0,
    equipped: true,
    baseBonus: { lightSkill: 5 },
    stats: { speed: 30, dodge: 15 },
    skills: []
  }
];

// 计算装备属性加成
function getEquipBonuses() {
  const bonuses = {
    attack: 0,
    hp: 0,
    hit: 0,
    dodge: 0,
    defense: 0,
    parry: 0,
    speed: 0,
    sword: 0,
    fist: 0,
    blade: 0,
    lightSkill: 0,
    mp: 0
  };
  
  const char = getCurrentCharacter();
  const slots = ['weapon', 'armor', 'accessory', 'shoes'];
  
  slots.forEach(slot => {
    const equip = char.equipped[slot];
    if (equip) {
      Object.entries(equip).forEach(([key, val]) => {
        if (bonuses.hasOwnProperty(key) && typeof val === 'number') {
          bonuses[key] += val;
        }
      });
      // 装备的 innerSkill 加到内力(mp)上，而不是内功修为
      if (equip.innerSkill && typeof equip.innerSkill === 'number') {
        bonuses.mp += equip.innerSkill;
      }
    }
  });
  
  return bonuses;
}

// 从localStorage读取武学数据并计算加成（包括修为和属性）
function getLocalMartialBonuses() {
  const bonuses = {
    fist: 0,
    sword: 0,
    blade: 0,
    lightSkill: 0,
    innerSkill: 0,
    attack: 0,
    hit: 0,
    defense: 0,
    speed: 0,
    dodge: 0,
    parry: 0,
    hp: 0,
    mp: 0
  };

  let arts = [];
  
  // 获取当前角色ID
  const currentCharId = getCurrentCharacter().id;
  
  // 优先从localStorage加载（多角色支持）
  try {
    const saved = localStorage.getItem('playerMartialArts_' + currentCharId);
    if (saved) {
      arts = JSON.parse(saved);
      console.log(`角色${currentCharId}从localStorage加载武学数据:`, arts);
    } else {
      // 如果没有保存的数据，使用默认数据
      arts = LOCAL_MARTIAL_ARTS;
      console.log(`角色${currentCharId}使用默认武学数据`);
    }
  } catch (e) {
    arts = LOCAL_MARTIAL_ARTS;
    console.warn('从localStorage加载武学数据失败，使用默认数据:', e);
  }

  arts.forEach(martial => {
    // 只有已装备的武学才生效
    if (!martial.equipped) return;
    
    // 计算基础加成（修为）
    if (martial.baseBonus && martial.currentLevel > 0) {
      Object.entries(martial.baseBonus).forEach(([key, val]) => {
        if (bonuses.hasOwnProperty(key)) {
          bonuses[key] += val * martial.currentLevel;
        }
      });
    }
    
    // 计算属性加成（attack, hit等）
    if (martial.stats && martial.currentLevel > 0) {
      Object.entries(martial.stats).forEach(([key, val]) => {
        if (bonuses.hasOwnProperty(key)) {
          bonuses[key] += val;
        }
        // 把武学的 innerSkill（内功修为）加到 mp（内力）上
        // 注意：武学的 innerSkill 也会转化为内力加成
        if (key === 'innerSkill') {
          bonuses.mp += val;
        }
      });
    }
  });

  Object.keys(bonuses).forEach(key => {
    if (bonuses[key] > 100 && ['fist', 'sword', 'blade', 'lightSkill', 'innerSkill'].includes(key)) {
      bonuses[key] = 100;
    }
  });

  return bonuses;
}

function createDefaultCharacters() {
  return [
    {
      id: 1,
      name: '少侠',
      icon: '👨‍🦰',
      level: 10,
      gender: '男',
      faction: '正阳派',
      power: 580,
      health: { current: 100, max: 100 },
      exp: { current: 45, max: 100 },
      description: '初入江湖的少年侠客，心怀侠义，立志成为一代大侠。加入正阳派后，勤学苦练，剑法日益精进。',
      equipped: {
        weapon: { id: 1, name: '青锋剑', type: 'weapon', rarity: 'blue', level: 10, attack: 35, hit: 5, desc: '普通的青钢剑，剑锋锋利，适合初学者使用。' },
        armor: { id: 2, name: '布袍', type: 'armor', rarity: 'green', level: 5, defense: 12, hp: 30, desc: '普通的棉布长袍，轻便舒适。' },
        accessory: { id: 3, name: '护心镜', type: 'accessory', rarity: 'green', level: 8, parry: 8, hp: 20, desc: '小巧的护心镜，能抵挡部分伤害。' },
        shoes: null
      },
      skills: {
        weapon: { name: '正阳基础剑式', level: 3, maxLevel: 10 },
        inner: { name: '正阳吐纳诀', level: 2, maxLevel: 10 },
        light: { name: '踏云步', level: 1, maxLevel: 10 }
      },
      stats: {
        attack: 85, hp: 250, hit: 95, dodge: 45, defense: 52, parry: 38, speed: 72,
        fist: 15, sword: 45, blade: 10, lightSkill: 30, innerSkill: 35,
        strength: 10, agility: 10, bone: 10, qi: 10,
        mp: 120, maxMp: 120
      },
      remainingPoints: 50,
      gold: 0
    },
    {
      id: 2,
      name: '苏瑶',
      icon: '👧',
      level: 12,
      gender: '女',
      faction: '正阳派',
      power: 620,
      health: { current: 100, max: 100 },
      exp: { current: 78, max: 100 },
      description: '正阳派内门弟子，天资聪颖，剑法出众。性格活泼开朗，乐于助人。',
      equipped: {
        weapon: { id: 4, name: '流云剑', type: 'weapon', rarity: 'blue', level: 12, attack: 42, hit: 8, desc: '剑身轻盈，挥舞时如流云般飘逸。' },
        armor: { id: 5, name: '素纱衣', type: 'armor', rarity: 'blue', level: 10, defense: 18, speed: 10, desc: '轻盈的纱衣，不影响身法施展。' },
        accessory: { id: 6, name: '玉坠', type: 'accessory', rarity: 'purple', level: 12, innerSkill: 15, hp: 40, desc: '温润的玉佩，能滋养内力。' },
        shoes: { id: 7, name: '云履', type: 'shoes', rarity: 'green', level: 10, speed: 15, dodge: 8, desc: '轻便的布鞋，适合施展轻功。' }
      },
      skills: {
        weapon: { name: '正阳基础剑式', level: 5, maxLevel: 10 },
        inner: { name: '正阳吐纳诀', level: 4, maxLevel: 10 },
        light: { name: '踏云步', level: 3, maxLevel: 10 }
      },
      stats: {
        attack: 80, hp: 270, hit: 90, dodge: 45, defense: 45, parry: 28, speed: 72,
        fist: 10, sword: 55, blade: 8, lightSkill: 50, innerSkill: 45,
        strength: 10, agility: 10, bone: 10, qi: 10,
        mp: 130, maxMp: 130
      },
      remainingPoints: 50,
      gold: 0
    }
  ];
}

// 计算内力上限的辅助函数
function calculateMaxMp(spirit, level) {
  return Math.floor(50 + spirit * 2 + level * 5);
}

// 实时计算基础属性的辅助函数
function refreshBaseStats(char) {
  const level = char.level || 10;
  const vitality = char.stats.bone || char.stats.vitality || 10;
  const spirit = char.stats.qi || char.stats.spirit || 10;
  
  // 只在首次初始化时计算基础属性，不覆盖已分配的属性点效果
  // 如果已经有计算好的属性值，不重新计算
  if (!char.stats.hp || char.stats.hp === 0) {
    char.stats.hp = 100 + vitality * 5 + level * 10;
    char.health.max = char.stats.hp;
    char.health.current = char.stats.hp;
  }
  
  // 如果内力还未设置，则计算
  if (!char.stats.maxMp || char.stats.maxMp === 0) {
    char.stats.maxMp = calculateMaxMp(spirit, level);
    char.stats.mp = char.stats.maxMp;
  }
  
  console.log(`刷新角色 ${char.name} 的基础属性 - 血量: ${char.stats.hp}, 内力: ${char.stats.maxMp}`);
}

let characters;
const savedChars = localStorage.getItem('playerCharacters');
if (savedChars) {
  try {
    characters = JSON.parse(savedChars);
    // 实时刷新所有角色的基础属性，确保数据最新
    characters.forEach(char => {
      if (!char.stats) char.stats = {};
      if (!char.health) char.health = { current: 100, max: 100 };
      // 确保有剩余属性点
      if (char.remainingPoints === undefined || char.remainingPoints === null) {
        char.remainingPoints = 50; // 默认给50点属性点
        console.log(`为角色 ${char.name} 设置默认剩余属性点: 50`);
      }
      refreshBaseStats(char);
    });
  } catch (e) {
    console.error('从 localStorage 读取角色数据失败:', e);
    characters = createDefaultCharacters();
  }
} else {
  characters = createDefaultCharacters();
}

const PLAYER_INVENTORY = {
  weapon: [
    { id: 1, name: '青锋剑', type: 'weapon', rarity: 'blue', level: 10, attack: 35, hit: 5, desc: '普通的青钢剑，剑锋锋利，适合初学者使用。' },
    { id: 4, name: '流云剑', type: 'weapon', rarity: 'blue', level: 12, attack: 42, hit: 8, desc: '剑身轻盈，挥舞时如流云般飘逸。' },
    { id: 8, name: '铁剑', type: 'weapon', rarity: 'green', level: 5, attack: 20, desc: '普通的铁剑，随处可见。' }
  ],
  armor: [
    { id: 2, name: '布袍', type: 'armor', rarity: 'green', level: 5, defense: 12, hp: 30, desc: '普通的棉布长袍，轻便舒适。' },
    { id: 5, name: '素纱衣', type: 'armor', rarity: 'blue', level: 10, defense: 18, speed: 10, desc: '轻盈的纱衣，不影响身法施展。' }
  ],
  accessory: [
    { id: 3, name: '护心镜', type: 'accessory', rarity: 'green', level: 8, parry: 8, hp: 20, desc: '小巧的护心镜，能抵挡部分伤害。' },
    { id: 6, name: '玉坠', type: 'accessory', rarity: 'purple', level: 12, innerSkill: 15, hp: 40, desc: '温润的玉佩，能滋养内力。' }
  ],
  shoes: [
    { id: 7, name: '云履', type: 'shoes', rarity: 'green', level: 10, speed: 15, dodge: 8, desc: '轻便的布鞋，适合施展轻功。' }
  ]
};

let currentCharacterIndex = 0;

// 四维预览状态
let pointPreview = {
  strength: 0,
  agility: 0,
  bone: 0,
  qi: 0
};

// 角色面板UI
const CHAR_UI = {
  charAvatar: document.getElementById('charAvatar'),
  charLevel: document.getElementById('charLevel'),
  charName: document.getElementById('charName'),
  charGender: document.getElementById('charGender'),
  charFaction: document.getElementById('charFaction'),
  charPower: document.getElementById('charPower'),
  charDesc: document.getElementById('charDesc'),
  charHealthBar: document.getElementById('charHealthBar'),
  charExpBar: document.getElementById('charExpBar'),
  charWeaponSkill: document.getElementById('charWeaponSkill'),
  charInnerSkill: document.getElementById('charInnerSkill'),
  charLightSkill: document.getElementById('charLightSkill'),
  statAttack: document.getElementById('statAttack'),
  statHp: document.getElementById('statHp'),
  statHit: document.getElementById('statHit'),
  statDodge: document.getElementById('statDodge'),
  statDefense: document.getElementById('statDefense'),
  statParry: document.getElementById('statParry'),
  statSpeed: document.getElementById('statSpeed'),
  statFist: document.getElementById('statFist'),
  statSword: document.getElementById('statSword'),
  statBlade: document.getElementById('statBlade'),
  statLight: document.getElementById('statLight'),
  statInner: document.getElementById('statInner'),
  statStrength: document.getElementById('statStrength'),
  statAgility: document.getElementById('statAgility'),
  statBone: document.getElementById('statBone'),
  statQi: document.getElementById('statQi'),
  remainingPoints: document.getElementById('remainingPoints'),
  charWeaponSlot: document.getElementById('charWeaponSlot'),
  charArmorSlot: document.getElementById('charArmorSlot'),
  charAccessorySlot: document.getElementById('charAccessorySlot'),
  charShoesSlot: document.getElementById('charShoesSlot'),
  characterPanel: document.getElementById('characterPanel'),
  charModal: document.getElementById('charModal'),
  modalTitle: document.getElementById('modalTitle'),
  charModalBody: document.getElementById('charModalBody')
};

function getCurrentCharacter() {
  return characters[currentCharacterIndex];
}

// 从存档加载最新数据到角色数组
function loadFromSave() {
  console.log('=== loadFromSave 开始 ===');
  try {
    const saveData = localStorage.getItem('game_save_0');
    console.log('存档数据:', saveData ? '存在' : '不存在');
    if (!saveData) {
      console.log('没有存档数据');
      return;
    }

    const save = JSON.parse(saveData);
    console.log('存档解析后:', save);
    const player = save.player;
    console.log('玩家数据:', player);
    if (!player) {
      console.log('没有玩家数据');
      return;
    }

    // 更新当前角色的数据
    const char = characters[currentCharacterIndex];
    console.log('当前角色:', char?.name, '索引:', currentCharacterIndex);
    if (!char) {
      console.log('没有当前角色');
      return;
    }

    // 更新银两
    if (player.gold !== undefined) {
      char.gold = player.gold;
      console.log('更新银两:', player.gold);
    }

    // 更新经验（阅历）- 注意字段名是 exp，不是 experience
    if (player.exp !== undefined) {
      console.log('存档中的 exp:', player.exp, '更新前角色阅历:', char.exp.current);
      char.exp.current = player.exp;
      console.log('更新后角色阅历:', char.exp.current);
    } else {
      console.log('存档中没有 exp 字段');
    }

    // 更新等级
    if (player.level !== undefined) {
      char.level = player.level;
    }

    // 更新战力
    if (player.power !== undefined) {
      char.power = player.power;
    }

    // 更新气血
    if (player.hp !== undefined) {
      char.health.current = player.hp;
    }
    if (player.maxHp !== undefined) {
      char.health.max = player.maxHp;
    }
    
    // 更新内力（如果存档中有）
    if (player.mp !== undefined) {
      char.stats.mp = player.mp;
    }
    if (player.maxMp !== undefined) {
      char.stats.maxMp = player.maxMp;
    }
    
    // 从存档读取装备数据（如果有）
    if (player.equipped !== undefined) {
      char.equipped = player.equipped;
      console.log('从存档读取装备数据:', char.equipped);
    }
    
    // 如果存档中有完整的角色数据，优先使用
    if (player.characters && Array.isArray(player.characters)) {
      // 使用 Object.assign 确保更新 window.characters 数组
      for (let i = 0; i < player.characters.length; i++) {
        if (window.characters[i]) {
          Object.assign(window.characters[i], player.characters[i]);
        } else {
          window.characters[i] = player.characters[i];
        }
      }
      characters = window.characters;
      console.log('从存档读取完整角色数据');
      console.log('当前角色装备:', window.characters[currentCharacterIndex]?.equipped);
    }
    
    // 四维属性（力量、敏捷、根骨、内息）不从存档读取，由玩家通过属性点分配获得
    // 保留这段代码但不执行任何操作，避免覆盖玩家分配的属性点
    console.log('四维属性保持玩家分配的值，不从存档读取');
    
    // 实时刷新基础属性（确保数据最新）
    refreshBaseStats(char);
    
    // 根据四维属性重新计算派生属性，确保不覆盖玩家分配的属性点效果
    updateStatsFromFour();

    console.log('角色数据已从存档更新:', {
      gold: char.gold,
      exp: char.exp.current,
      level: char.level
    });
  } catch (e) {
    console.error('从存档加载数据失败:', e);
  }
}

function switchCharacter(index) {
  if (index >= 0 && index < characters.length) {
    currentCharacterIndex = index;
    
    // 更新角色列表的 active 状态
    document.querySelectorAll('.char-item').forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });
    
    // 加载角色数据
    loadCharacterData();
  }
}

/**
 * 切换角色面板显示
 */
function toggleCharacterPanel() {
  const panel = CHAR_UI.characterPanel;
  panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
  
  if (panel.style.display === 'flex') {
    // 检查是否有升级信息
    checkLevelUpNotification();
    
    // 加载角色数据
    loadCharacterData();
  }
}

/**
 * 检查升级通知
 */
function checkLevelUpNotification() {
  const levelUpData = localStorage.getItem('levelUpInfo');
  if (!levelUpData) return;
  
  try {
    const levelUp = JSON.parse(levelUpData);
    console.log('升级通知:', levelUp);
    
    // 显示飘字提示
    showCharFloatText(`恭喜！升至 ${levelUp.level} 级！`, '#4caf50');
    
    // 清除升级信息
    localStorage.removeItem('levelUpInfo');
  } catch (e) {
    console.error('解析升级信息失败:', e);
  }
}

/**
 * 从武学系统获取当前激活的武学
 */
function getEquippedMartialArts() {
  const charId = getCurrentCharacter().id;
  const saved = localStorage.getItem('playerMartialArts_' + charId);
  let martialArts = MARTIAL_ARTS_LIBRARY;
  
  if (saved) {
    martialArts = JSON.parse(saved);
  }
  
  const equipped = {
    武功: null,
    内功: null,
    轻功: null
  };
  
  martialArts.forEach(m => {
    if (m.equipped) {
      equipped[m.type] = m;
    }
  });
  
  return equipped;
}

/**
 * 加载角色数据
 */
function loadCharacterData() {
  // 先从存档加载最新数据
  loadFromSave();

  const char = getCurrentCharacter();
  
  // 调试输出：检查当前角色数据
  console.log('=== 角色面板加载数据 ===');
  console.log('当前角色:', char.name, '等级:', char.level);
  console.log('角色装备:', char.equipped);
  console.log('角色四维:', { strength: char.stats.strength, agility: char.stats.agility, bone: char.stats.bone, qi: char.stats.qi });

  // 调试输出
  if (typeof calculateMartialArtsBonuses === 'function') {
    console.log('武学加成:', calculateMartialArtsBonuses());
  } else {
    console.log('找不到calculateMartialArtsBonuses函数');
  }

  CHAR_UI.charAvatar.textContent = char.icon;
  CHAR_UI.charLevel.textContent = 'Lv.' + char.level;
  CHAR_UI.charName.textContent = char.name;
  CHAR_UI.charGender.textContent = char.gender;
  CHAR_UI.charFaction.textContent = char.faction;
  CHAR_UI.charPower.textContent = char.power;
  CHAR_UI.charDesc.textContent = char.description;
  
  // 更新健康条
  const healthPct = (char.health.current / char.health.max) * 100;
  CHAR_UI.charHealthBar.style.width = `${healthPct}%`;
  
  // 更新经验条
  // 计算当前等级所需的经验（每升一级所需经验增加50%）
  const expNeededForLevel = Math.floor(100 * Math.pow(1.5, char.level - 1));
  const expPct = Math.min((char.exp.current / expNeededForLevel) * 100, 100);
  CHAR_UI.charExpBar.style.width = `${expPct}%`;
  
  // 更新经验数值显示
  const expBarContainer = CHAR_UI.charExpBar.parentElement;
  if (expBarContainer) {
    const expPercentSpan = expBarContainer.nextElementSibling;
    if (expPercentSpan) {
      expPercentSpan.textContent = `${Math.floor(expPct)}%`;
    }
    const expTooltip = document.getElementById('expTooltip');
    if (expTooltip) {
      const remainingExp = expNeededForLevel - char.exp.current;
      expTooltip.textContent = `${char.exp.current}/${expNeededForLevel}，还需${remainingExp}升级`;
    }
  }
  
  // 从武学系统获取激活的武学并更新显示
  const equippedMartialArts = getEquippedMartialArts();
  
  // 更新武功
  if (equippedMartialArts['武功']) {
    // 支持两套 ID
    const weaponSkillEl = document.getElementById('weaponSkill') || document.getElementById('charWeaponSkill');
    if (weaponSkillEl) weaponSkillEl.textContent = equippedMartialArts['武功'].name;
    
    const weaponLevelEl = document.querySelector('#skillWeapon .skill-level') || document.querySelector('#skillSlot1 .skill-level');
    if (weaponLevelEl) weaponLevelEl.textContent = 
      equippedMartialArts['武功'].currentLevel + '/' + equippedMartialArts['武功'].maxLevel + '重';
  }
  
  // 更新内功
  if (equippedMartialArts['内功']) {
    const innerSkillEl = document.getElementById('innerSkill') || document.getElementById('charInnerSkill');
    if (innerSkillEl) innerSkillEl.textContent = equippedMartialArts['内功'].name;
    
    const innerLevelEl = document.querySelector('#skillInner .skill-level') || document.querySelector('#skillSlot2 .skill-level');
    if (innerLevelEl) innerLevelEl.textContent = 
      equippedMartialArts['内功'].currentLevel + '/' + equippedMartialArts['内功'].maxLevel + '重';
  }
  
  // 更新轻功
  if (equippedMartialArts['轻功']) {
    const lightSkillEl = document.getElementById('lightSkill') || document.getElementById('charLightSkill');
    if (lightSkillEl) lightSkillEl.textContent = equippedMartialArts['轻功'].name;
    
    const lightLevelEl = document.querySelector('#skillLight .skill-level') || document.querySelector('#skillSlot3 .skill-level');
    if (lightLevelEl) lightLevelEl.textContent = 
      equippedMartialArts['轻功'].currentLevel + '/' + equippedMartialArts['轻功'].maxLevel + '重';
  }
  
  // 计算武学加成（包括修为和属性）
  const martialBonuses = getLocalMartialBonuses();
  console.log('武学加成', martialBonuses);
  
  // 计算装备加成
  const equipBonuses = getEquipBonuses();
  console.log('装备加成', equipBonuses);
  
  // 更新基础属性（基础值+四维+武学+装备）
  // 使用与战斗系统完全一致的计算逻辑
  const attrKeys = ['Attack', 'Hp', 'Mp', 'Hit', 'Dodge', 'Defense', 'Parry', 'Speed'];
  attrKeys.forEach(attr => {
    const lowerAttr = attr.toLowerCase();
    
    // 计算各部分加成
    let baseVal = 0;
    let fourDimBonus = 0;
    
    switch(attr) {
      case 'Attack':
        baseVal = 50;
        fourDimBonus = char.stats.strength * 3;
        break;
      case 'Hp':
        baseVal = 100 + char.level * 10;
        fourDimBonus = char.stats.bone * 5;
        break;
      case 'Mp':
        baseVal = 50 + char.level * 5;
        fourDimBonus = char.stats.qi * 2;
        break;
      case 'Speed':
        baseVal = 50;
        fourDimBonus = char.stats.agility * 2;
        break;
      case 'Hit':
        baseVal = 70;
        fourDimBonus = char.stats.agility;
        break;
      case 'Dodge':
        baseVal = 20;
        fourDimBonus = Math.floor(char.stats.agility * 0.5);
        break;
      case 'Defense':
        baseVal = char.stats.defense || 0;
        break;
      case 'Parry':
        baseVal = char.stats.parry || 0;
        break;
    }
    
    const martialVal = martialBonuses[lowerAttr] || 0;
    const equipVal = equipBonuses[lowerAttr] || 0;
    const total = baseVal + fourDimBonus + martialVal + equipVal;
    
    // 调试输出
    console.log(`${attr} - 基础:${baseVal} 四维:${fourDimBonus} 武学:${martialVal} 装备:${equipVal} 总计:${total}`);
    
    // 确保显示的是完整属性值（包含武学和装备加成）
    const displayEl = document.getElementById(`stat${attr}Base`);
    if (displayEl) {
      displayEl.textContent = total;
    }
    
    // 添加悬浮提示
    const statEl = displayEl ? displayEl.parentElement : null;
    if (statEl) {
      statEl.onmouseenter = (e) => showStatTooltip(e, attr, baseVal, martialVal, equipVal, fourDimBonus);
      statEl.onmouseleave = hideStatTooltip;
    }
  });

  // 显示修为（基础值+武学加成，直接显示最终值）
  // 注意：修为目前只有一个途径：学习武学，装备的 innerSkill 加到内力上，不是内功修为
  const skillKeys = ['Fist', 'Sword', 'Blade', 'Light', 'Inner'];
  const skillMap = { Fist: 'fist', Sword: 'sword', Blade: 'blade', Light: 'lightSkill', Inner: 'innerSkill' };
  
  skillKeys.forEach(skill => {
    const lowerSkill = skillMap[skill];
    const baseVal = char.stats[lowerSkill] || 0;
    const martialVal = martialBonuses[lowerSkill] || 0;
    // 修为不包含装备加成，装备的属性只加到基础属性上
    const total = baseVal + martialVal;
    
    document.getElementById(`stat${skill}Base`).textContent = total;
    document.getElementById(`stat${skill}Preview`).style.display = 'none';
    
    // 添加悬浮提示
    const statEl = document.getElementById(`stat${skill}Base`).parentElement;
    if (statEl) {
      statEl.onmouseenter = (e) => showStatTooltip(e, skill, baseVal, martialVal, 0);
      statEl.onmouseleave = hideStatTooltip;
    }
  });
  
  CHAR_UI.remainingPoints.textContent = char.remainingPoints;
  
  // 重置预览状态
  resetPointPreview();
  
  // 更新四维条形显示
  updateFourDimDisplay(char);
  
  updateCharEquipSlots();
  updateAddButtons();
}

/**
 * 更新四维条形显示
 */
function updateFourDimDisplay(char) {
  const attrs = ['strength', 'agility', 'bone', 'qi'];
  const maxVal = 100;
  
  attrs.forEach(attr => {
    const baseVal = char.stats[attr];
    const previewVal = baseVal + pointPreview[attr];
    const previewAdd = pointPreview[attr];
    
    // 更新数值显示
    document.getElementById(`stat${attr.charAt(0).toUpperCase() + attr.slice(1)}Value`).textContent = previewVal;
    
    // 更新条形
    const baseBar = document.getElementById(`stat${attr.charAt(0).toUpperCase() + attr.slice(1)}Bar`);
    const previewBar = document.getElementById(`stat${attr.charAt(0).toUpperCase() + attr.slice(1)}PreviewBar`);
    
    baseBar.style.width = `${(baseVal / maxVal) * 100}%`;
    
    if (previewAdd > 0) {
      previewBar.style.width = `${(previewAdd / maxVal) * 100}%`;
      previewBar.style.left = `${(baseVal / maxVal) * 100}%`;
      previewBar.classList.add('active');
      baseBar.style.borderRadius = '6px 0 0 6px';
    } else {
      previewBar.classList.remove('active');
      baseBar.style.borderRadius = '6px';
    }
  });
  
  // 更新按钮状态
  updateDimButtons(char);
}

/**
 * 重置预览状态
 */
function resetPointPreview() {
  pointPreview = { strength: 0, agility: 0, bone: 0, qi: 0 };
  document.getElementById('confirmPointBtn').style.display = 'none';
  document.getElementById('cancelPointBtn').style.display = 'none';
  document.getElementById('previewHint').textContent = '';
  
  // 重置基础属性预览（包含内力Mp）
  const attrs = ['Attack', 'Hp', 'Mp', 'Hit', 'Dodge', 'Defense', 'Parry', 'Speed'];
  attrs.forEach(attr => {
    const el = document.getElementById(`stat${attr}Preview`);
    if (el) {
      el.style.display = 'none';
    }
  });
}

/**
 * 更新四维按钮状态
 */
function updateDimButtons(char) {
  const attrs = ['strength', 'agility', 'bone', 'qi'];
  
  attrs.forEach(attr => {
    const previewBar = document.getElementById(`stat${attr.charAt(0).toUpperCase() + attr.slice(1)}PreviewBar`);
    const minusBtn = previewBar.parentElement.nextElementSibling.querySelector('.minus');
    const plusBtn = previewBar.parentElement.nextElementSibling.querySelector('.plus');
    
    // 加点按钮：需要剩余点数 > 0
    plusBtn.disabled = char.remainingPoints <= 0;
    
    // 退点按钮：只能退预览增加的点数
    minusBtn.disabled = pointPreview[attr] <= 0;
  });
}

/**
 * 更新装备槽位
 */
function updateCharEquipSlots() {
  const slots = ['weapon', 'armor', 'accessory', 'shoes'];
  const char = getCurrentCharacter();
  
  slots.forEach(type => {
    const slot = CHAR_UI[`char${type.charAt(0).toUpperCase() + type.slice(1)}Slot`];
    const equip = char.equipped[type];
    
    if (equip) {
      slot.innerHTML = `
        <span class="slot-icon">${getRarityIcon(equip.rarity)}</span>
        <span class="slot-name">${equip.name}</span>
        <span class="slot-level">Lv.${equip.level}</span>
      `;
      slot.classList.remove('empty');
      
      // 添加悬停事件
      slot.onmouseenter = (e) => showEquipTooltip(e, equip, type);
      slot.onmouseleave = hideEquipTooltip;
    } else {
      slot.innerHTML = `
        <span class="slot-add">+</span>
        <span class="slot-name">${getTypeName(type)}</span>
      `;
      slot.classList.add('empty');
      
      // 移除悬停事件
      slot.onmouseenter = null;
      slot.onmouseleave = null;
    }
  });
}

/**
 * 获取装备类型图标
 */
function getEquipTypeIcon(type) {
  const icons = {
    weapon: '🗡️',
    armor: '🛡️',
    accessory: '💍',
    shoes: '👢'
  };
  return icons[type] || '📦';
}

/**
 * 显示装备详情 tooltip
 */
function showEquipTooltip(e, equip, type) {
  const tooltip = document.getElementById('equipTooltip');
  
  if (!tooltip) {
    return;
  }
  
  const statsHtml = renderEquipStats(equip);
  
  tooltip.innerHTML = `
    <div class="tooltip-icon">${getEquipTypeIcon(type)}</div>
    <div class="tooltip-header">
      <span class="tooltip-name" style="color: ${getRarityColor(equip.rarity)}">${equip.name}</span>
      <span class="tooltip-level">Lv.${equip.level}</span>
    </div>
    <div class="tooltip-desc">${equip.desc}</div>
    <div class="tooltip-stats">${statsHtml}</div>
  `;
  
  // 强制显示
  tooltip.style.display = 'block';
  tooltip.style.zIndex = '9999';
  tooltip.style.visibility = 'visible';
  
  // 定位 tooltip，避免超出屏幕 - 使用 currentTarget 确保是装备槽元素
  const target = e.currentTarget || e.target;
  const rect = target.getBoundingClientRect();
  let left = rect.right + 15;
  let top = rect.top;
  
  // 如果右边超出屏幕，显示在左边
  if (left + 320 > window.innerWidth) {
    left = rect.left - 335;
  }
  
  // 如果下边超出屏幕，向上调整
  if (top + tooltip.offsetHeight > window.innerHeight) {
    top = window.innerHeight - tooltip.offsetHeight - 20;
  }
  
  tooltip.style.left = left + 'px';
  tooltip.style.top = top + 'px';
}

/**
 * 处理装备槽悬停
 */
function handleEquipHover(e, type) {
  const char = getCurrentCharacter();
  const equip = char.equipped[type];
  
  if (equip) {
    showEquipTooltip(e, equip, type);
  }
}

/**
 * 隐藏装备详情 tooltip
 */
function hideEquipTooltip() {
  const tooltip = document.getElementById('equipTooltip');
  tooltip.style.display = 'none';
}

function getRarityIcon(rarity) {
  const icons = {
    'green': '🟢',
    'blue': '🔵',
    'purple': '🟣',
    'orange': '🟠'
  };
  return icons[rarity] || '⚪';
}

function getTypeName(type) {
  const names = {
    weapon: '武器',
    armor: '护甲',
    accessory: '饰品',
    shoes: '鞋子'
  };
  return names[type] || type;
}

function getRarityColor(rarity) {
  const colors = {
    'green': '#4caf50',
    'blue': '#2196f3',
    'purple': '#9c27b0',
    'orange': '#ff9800'
  };
  return colors[rarity] || '#9e9e9e';
}

/**
 * 打开武学系统
 */
function openMartialArts(type) {
  // 中文到英文的映射
  const typeMap = {
    '武功': 'martial',
    '内功': 'internal',
    '轻功': 'light'
  };
  const englishType = typeMap[type] || type;
  // 存到localStorage
  localStorage.setItem('martialArtsType', englishType);
  // 不带参数跳转
  window.location.href = 'martialArts.html';
}

/**
 * 显示装备选择弹窗
 */
function showCharEquipment(type) {
  console.log('=== showCharEquipment 被调用 ===');
  console.log('类型:', type);
  
  const char = getCurrentCharacter();
  console.log('当前角色:', char?.name);
  console.log('角色装备状态:', char?.equipped);
  
  // 重新获取装备数据，确保是最新的
  const currentEquip = char.equipped[type];
  console.log('当前装备:', currentEquip);
  console.log('当前装备是否存在:', !!currentEquip);
  
  // 如果有已装备的物品，先显示已装备的状态
  if (currentEquip) {
    console.log('=== 已有装备，显示已装备状态 ===');
  }
  
  const invItems = PLAYER_INVENTORY[type] || [];
  console.log('背包中该类型物品:', invItems);
  console.log('背包物品数量:', invItems.length);
  
  CHAR_UI.modalTitle.textContent = `选择${getTypeName(type)}`;
  
  let html = '';
  
  if (currentEquip) {
    html += `
      <div class="equip-detail">
        <div class="detail-header">
          <span style="color: ${getRarityColor(currentEquip.rarity)}">${currentEquip.name}</span>
          <span>Lv.${currentEquip.level}</span>
        </div>
        <p class="detail-desc">${currentEquip.desc}</p>
        <div class="detail-stats">
          ${renderEquipStats(currentEquip)}
        </div>
        <button class="unequip-btn" data-type="${type}">点击卸下</button>
      </div>
    `;
  }
  
  html += '<div class="equip-list">';
  if (invItems.length > 0) {
    invItems.forEach(item => {
      const canEquip = item.level <= char.level;
      const itemJson = encodeURIComponent(JSON.stringify(item));
      html += `
        <div class="equip-item ${!canEquip ? 'disabled' : ''}" 
             data-type="${type}" data-itemid="${item.id}"
             onmouseenter="showModalEquipTooltip(event, '${itemJson}', '${type}')"
             onmouseleave="hideEquipTooltip()">
          <span style="color: ${getRarityColor(item.rarity)}">${item.name}</span>
          <span>Lv.${item.level}</span>
          ${!canEquip ? '<span class="level-warn">等级不足</span>' : ''}
        </div>
      `;
    });
  } else {
    html += '<div class="no-equip">暂无装备</div>';
  }
  html += '</div>';
  
  console.log('生成的弹窗HTML:', html);
  console.log('当前装备是否存在:', !!currentEquip);
  console.log('HTML中是否包含卸下按钮:', html.includes('unequip-btn'));
  
  CHAR_UI.charModalBody.innerHTML = html;
  CHAR_UI.charModal.style.display = 'flex';
  
  // 验证HTML是否正确更新
  setTimeout(() => {
    const bodyHtml = CHAR_UI.charModalBody.innerHTML;
    console.log('弹窗HTML更新后:', bodyHtml);
    console.log('更新后是否包含卸下按钮:', bodyHtml.includes('unequip-btn'));
  }, 50);
  
  // 直接绑定事件
  bindEquipmentEventsDirect();
}

/**
 * 添加全局点击事件监听器来排查问题
 */
function addGlobalClickListener() {
  console.log('=== 添加全局点击事件监听器 ===');
  
  document.addEventListener('click', function(e) {
    console.log('=== 全局点击事件 ===');
    console.log('点击目标:', e.target);
    console.log('目标类名:', e.target.className);
    console.log('目标标签:', e.target.tagName);
    
    // 检查是否点击了装备项
    const equipItem = e.target.closest('.equip-item');
    if (equipItem) {
      console.log('点击了装备项:', equipItem.textContent);
      console.log('装备项 data-type:', equipItem.getAttribute('data-type'));
      console.log('装备项 data-itemid:', equipItem.getAttribute('data-itemid'));
    }
  }, true); // 使用捕获阶段
}

// 页面加载时添加全局监听器
addGlobalClickListener();

/**
 * 使用事件委托绑定装备操作事件
 */
function bindEquipmentEvents() {
  console.log('=== bindEquipmentEvents 被调用 ===');
  console.log('CHAR_UI.charModalBody:', CHAR_UI.charModalBody);
  
  if (!CHAR_UI.charModalBody) {
    console.error('CHAR_UI.charModalBody 为空！');
    return;
  }
  
  // 先移除之前的事件监听，避免重复绑定
  CHAR_UI.charModalBody.removeEventListener('click', handleEquipmentClick);
  
  // 添加事件委托
  CHAR_UI.charModalBody.addEventListener('click', handleEquipmentClick);
  console.log('事件委托已绑定');
}

/**
 * 直接绑定装备操作事件（在DOM更新后立即绑定）
 */
function bindEquipmentEventsDirect() {
  console.log('=== bindEquipmentEventsDirect 被调用 ===');
  
  // 使用 setTimeout 确保 DOM 已经更新
  setTimeout(() => {
    // 绑定卸下按钮事件
    const unequipBtn = CHAR_UI.charModalBody.querySelector('.unequip-btn');
    if (unequipBtn) {
      unequipBtn.onclick = function() {
        const type = this.getAttribute('data-type');
        console.log('卸下按钮点击，类型:', type);
        if (type) {
          unequipCharItem(type);
        }
      };
      console.log('卸下按钮事件已绑定');
    }
    
    // 绑定装备项事件
    const equipItems = CHAR_UI.charModalBody.querySelectorAll('.equip-item:not(.disabled)');
    equipItems.forEach((item, index) => {
      console.log('装备项', index, ':', item);
      console.log('装备项内容:', item.textContent);
      
      // 确保元素可以被点击
      item.style.cursor = 'pointer';
      item.style.pointerEvents = 'auto';
      
      // 添加多个事件监听器来确保事件被触发
      item.addEventListener('click', function(e) {
        e.stopPropagation();
        console.log('=== 装备项被点击 (addEventListener) ===');
        console.log('点击事件:', e);
        const type = this.getAttribute('data-type');
        const itemId = parseInt(this.getAttribute('data-itemid'));
        console.log('装备项点击，类型:', type, '物品ID:', itemId);
        if (type && itemId) {
          equipCharItem(type, itemId);
        }
      });
      
      // 也尝试直接绑定 onclick
      item.onclick = function(e) {
        e.stopPropagation();
        console.log('=== 装备项被点击 (onclick) ===');
        console.log('点击事件:', e);
        const type = this.getAttribute('data-type');
        const itemId = parseInt(this.getAttribute('data-itemid'));
        console.log('装备项点击，类型:', type, '物品ID:', itemId);
        if (type && itemId) {
          equipCharItem(type, itemId);
        }
      };
    });
    console.log('装备项事件已绑定，数量:', equipItems.length);
  }, 0);
}

/**
 * 处理装备弹窗的点击事件
 */
function handleEquipmentClick(e) {
  console.log('=== handleEquipmentClick 被调用 ===');
  console.log('点击的元素:', e.target);
  
  // 处理卸下按钮
  const unequipBtn = e.target.closest('.unequip-btn');
  if (unequipBtn) {
    console.log('点击了卸下按钮');
    // 从 data-type 属性获取装备类型
    const type = unequipBtn.getAttribute('data-type');
    console.log('卸下装备类型:', type);
    if (type) {
      unequipCharItem(type);
    }
    return;
  }
  
  // 处理装备项
  const equipItem = e.target.closest('.equip-item:not(.disabled)');
  if (equipItem) {
    console.log('点击了装备项');
    // 从 data-* 属性获取装备类型和物品ID
    const type = equipItem.getAttribute('data-type');
    const itemId = parseInt(equipItem.getAttribute('data-itemid'));
    console.log('穿戴装备类型:', type, '物品ID:', itemId);
    if (type && itemId) {
      equipCharItem(type, itemId);
    }
    return;
  }
}

/**
 * 显示弹窗中装备的 tooltip
 */
function showModalEquipTooltip(e, itemJson, type) {
  const item = JSON.parse(decodeURIComponent(itemJson));
  showEquipTooltip(e, item, type);
}

function renderEquipStats(equip) {
  let stats = '';
  if (equip.attack) stats += `<div class="tooltip-stat">攻击 +${equip.attack}</div>`;
  if (equip.defense) stats += `<div class="tooltip-stat">防御 +${equip.defense}</div>`;
  if (equip.hp) stats += `<div class="tooltip-stat">气血 +${equip.hp}</div>`;
  if (equip.hit) stats += `<div class="tooltip-stat">命中 +${equip.hit}</div>`;
  if (equip.dodge) stats += `<div class="tooltip-stat">闪躲 +${equip.dodge}</div>`;
  if (equip.parry) stats += `<div class="tooltip-stat">招架 +${equip.parry}</div>`;
  if (equip.speed) stats += `<div class="tooltip-stat">速度 +${equip.speed}</div>`;
  if (equip.innerSkill) stats += `<div class="tooltip-stat">内功 +${equip.innerSkill}</div>`;
  return stats;
}

function equipCharItem(type, itemId) {
  console.log('=== equipCharItem 被调用 ===');
  console.log('类型:', type);
  console.log('物品ID:', itemId);
  
  const char = getCurrentCharacter();
  console.log('当前角色:', char?.name);
  console.log('角色对象:', char);
  
  const item = PLAYER_INVENTORY[type].find(i => i.id === itemId);
  console.log('找到的物品:', item);
  
  if (item) {
    // 检查等级限制
    if (item.level > char.level) {
      console.log('等级不足，无法穿戴');
      return;
    }
    
    // 如果当前有装备，先卸下
    if (char.equipped[type]) {
      console.log('先卸下当前装备:', char.equipped[type].name);
    }
    
    char.equipped[type] = { ...item };
    console.log('装备已更新:', char.equipped);
    console.log('装备后角色装备状态:', char.equipped);
    
    // 保存装备状态到 localStorage
    saveCharactersToLocalStorage();
    console.log('装备穿戴成功');
    
    // 刷新角色数据并关闭弹窗
    loadCharacterData();
    closeCharModal();
  } else {
    console.log('未找到物品，无法穿戴');
  }
}

function unequipCharItem(type) {
  console.log('=== unequipCharItem 被调用 ===');
  console.log('类型:', type);
  
  const char = getCurrentCharacter();
  console.log('当前角色:', char?.name);
  console.log('当前装备:', char.equipped[type]);
  
  char.equipped[type] = null;
  console.log('装备已卸下:', char.equipped);
  
  // 保存装备状态到 localStorage
  saveCharactersToLocalStorage();
  console.log('装备卸下成功');
  
  // 刷新角色数据并关闭弹窗
  loadCharacterData();
  closeCharModal();
}

/**
 * 保存角色数据到 localStorage
 */
function saveCharactersToLocalStorage() {
  console.log('=== saveCharactersToLocalStorage 开始 ===');
  console.log('保存前 window.characters:', window.characters);
  
  localStorage.setItem('playerCharacters', JSON.stringify(window.characters));
  console.log('角色数据已保存到 localStorage');
  
  // 同步保存到 game_save_0，确保下次加载时不会被覆盖
  try {
    const saveData = localStorage.getItem('game_save_0');
    if (saveData) {
      const save = JSON.parse(saveData);
      if (save.player) {
        // 同步所有角色的数据（包括装备）
        save.player.characters = window.characters;
        localStorage.setItem('game_save_0', JSON.stringify(save));
        console.log('所有角色数据已同步到 game_save_0');
        
        // 验证保存是否成功
        const savedData = localStorage.getItem('game_save_0');
        if (savedData) {
          const saved = JSON.parse(savedData);
          console.log('验证保存的数据:', saved.player.characters[currentCharacterIndex]?.equipped);
        }
      }
    }
  } catch (e) {
    console.error('同步到 game_save_0 失败:', e);
  }
}

function closeCharModal() {
  CHAR_UI.charModal.style.display = 'none';
}

/**
 * 切换角色页签
 */
function switchCharTab(tab) {
  document.querySelectorAll('.char-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.char-tab-content').forEach(content => content.style.display = 'none');
  
  document.querySelector(`.char-tab-btn[onclick="switchCharTab('${tab}')"]`).classList.add('active');
  document.getElementById(`char${tab.charAt(0).toUpperCase() + tab.slice(1)}Tab`).style.display = 'block';
}

/**
 * 预览属性点分配
 */
function calculatePreviewStats(char) {
  const s = char.stats;
  const strAdd = pointPreview.strength;
  const agiAdd = pointPreview.agility;
  const boneAdd = pointPreview.bone;
  const qiAdd = pointPreview.qi;
  
  const attackAdd = strAdd * 3;
  const hpAdd = boneAdd * 5;  // 与 updateStatsFromFour 保持一致
  const mpAdd = qiAdd * 2;    // 内力加成
  const speedAdd = agiAdd * 2;
  const hitAdd = agiAdd;
  const dodgeAdd = Math.floor(agiAdd * 0.5);
  const parryAdd = Math.floor((s.strength + strAdd) / 5) - Math.floor(s.strength / 5);
  const defenseAdd = Math.floor((s.bone + boneAdd) / 3) - Math.floor(s.bone / 3);
  
  return {
    attack: attackAdd,
    hp: hpAdd,
    mp: mpAdd,
    speed: speedAdd,
    hit: hitAdd,
    dodge: dodgeAdd,
    parry: parryAdd,
    defense: defenseAdd
  };
}

function updatePreviewStats(char) {
  const preview = calculatePreviewStats(char);
  const attrs = ['Attack', 'Hp', 'Mp', 'Hit', 'Dodge', 'Defense', 'Parry', 'Speed'];
  
  attrs.forEach(attr => {
    const el = document.getElementById(`stat${attr}Preview`);
    const add = preview[attr.toLowerCase()];
    
    if (add > 0) {
      el.textContent = ` +${add}`;
      el.style.display = 'inline';
    } else {
      el.style.display = 'none';
    }
  });
}

function previewCharPoint(attr, delta) {
  const char = getCurrentCharacter();
  const totalPreview = pointPreview[attr] + delta;
  
  if (delta > 0) {
    // 加点
    if (char.remainingPoints <= 0) {
      return;
    }
    char.remainingPoints--;
    pointPreview[attr]++;
  } else {
    // 退点
    if (pointPreview[attr] <= 0) {
      return;
    }
    char.remainingPoints++;
    pointPreview[attr]--;
  }
  
  // 更新显示
  updateFourDimDisplay(char);
  updatePreviewStats(char);
  
  // 显示确认/取消按钮
  const hasPreview = Object.values(pointPreview).some(v => v !== 0);
  document.getElementById('confirmPointBtn').style.display = hasPreview ? 'inline-block' : 'none';
  document.getElementById('cancelPointBtn').style.display = hasPreview ? 'inline-block' : 'none';
  
  // 显示预览提示
  if (hasPreview) {
    const totalUsed = Object.values(pointPreview).reduce((a, b) => a + b, 0);
    document.getElementById('previewHint').textContent = `已分配 ${totalUsed} 点属性`;
  } else {
    document.getElementById('previewHint').textContent = '';
  }
}

/**
 * 确认属性点分配
 */
function confirmCharPoint() {
  const char = getCurrentCharacter();
  
  console.log('=== 确认属性点分配 ===');
  console.log('分配前:', {
    strength: char.stats.strength,
    agility: char.stats.agility,
    bone: char.stats.bone,
    qi: char.stats.qi,
    remainingPoints: char.remainingPoints
  });
  console.log('预览点:', pointPreview);
  
  // 应用预览点到角色属性
  char.stats.strength += pointPreview.strength;
  char.stats.agility += pointPreview.agility;
  char.stats.bone += pointPreview.bone;
  char.stats.qi += pointPreview.qi;
  
  console.log('分配后:', {
    strength: char.stats.strength,
    agility: char.stats.agility,
    bone: char.stats.bone,
    qi: char.stats.qi
  });
  
  // 更新衍生属性
  updateStatsFromFour();
  
  console.log('更新后基础属性:', {
    attack: char.stats.attack,
    hp: char.stats.hp,
    maxMp: char.stats.maxMp,
    speed: char.stats.speed,
    hit: char.stats.hit,
    dodge: char.stats.dodge
  });
  
  // 重置预览
  resetPointPreview();
  
  // 重新加载显示
  loadCharacterData();
  
  // 保存到 localStorage（用于战斗系统读取）
  localStorage.setItem('playerCharacters', JSON.stringify(window.characters));
  
  // 同步保存到 game_save_0，确保下次加载时不会被覆盖
  try {
    const saveData = localStorage.getItem('game_save_0');
    if (saveData) {
      const save = JSON.parse(saveData);
      if (save.player) {
        save.player.strength = char.stats.strength;
        save.player.agility = char.stats.agility;
        save.player.bone = char.stats.bone;
        save.player.qi = char.stats.qi;
        save.player.remainingPoints = char.remainingPoints;
        save.player.hp = char.health.current;
        save.player.maxHp = char.health.max;
        save.player.mp = char.stats.mp;
        save.player.maxMp = char.stats.maxMp;
        // 同步装备数据
        save.player.equipped = char.equipped;
        localStorage.setItem('game_save_0', JSON.stringify(save));
        console.log('属性点已同步到 game_save_0');
      }
    }
  } catch (e) {
    console.error('保存到 game_save_0 失败:', e);
  }
  
  showCharFloatText('属性分配成功！', '#4caf50');
}

/**
 * 取消属性点分配
 */
function cancelCharPoint() {
  const char = getCurrentCharacter();
  
  // 归还预览消耗的点数
  const totalPreview = Object.values(pointPreview).reduce((a, b) => a + b, 0);
  char.remainingPoints += totalPreview;
  
  // 重置预览
  resetPointPreview();
  
  // 重新加载显示
  loadCharacterData();
}

function updateStatsFromFour() {
  const char = getCurrentCharacter();
  const s = char.stats;
  
  // 使用正确的公式计算基础属性（基础值+四维）
  // 使用 baseAttack, baseHp, baseMaxMp 存储基础属性，避免覆盖包含武学和装备加成的最终值
  s.baseAttack = 50 + s.strength * 3;
  s.baseHp = 100 + s.bone * 5 + char.level * 10;  // 基础血量 = 100 + 根骨×5 + 等级×10
  s.baseMaxMp = calculateMaxMp(s.qi || s.spirit || 10, char.level);
  s.baseSpeed = 50 + s.agility * 2;
  s.baseHit = 70 + s.agility;
  s.baseDodge = 20 + Math.floor(s.agility * 0.5);
  
  // 更新战斗中使用的基础属性（不包含武学和装备加成）
  s.attack = s.baseAttack;
  s.hp = s.baseHp;
  s.maxMp = s.baseMaxMp;
  s.speed = s.baseSpeed;
  s.hit = s.baseHit;
  s.dodge = s.baseDodge;
  
  // 更新战力（使用基础属性）
  char.power = Math.floor(s.attack * 2 + s.defense + s.hp / 10 + s.speed);
}

function updateAddButtons() {
  const char = getCurrentCharacter();
  const buttons = document.querySelectorAll('.add-point-btn');
  buttons.forEach(btn => {
    btn.disabled = char.remainingPoints <= 0;
  });
}

// 属性悬浮提示
function showStatTooltip(e, attrName, baseVal, martialVal, equipVal, fourDimBonusFromCaller) {
  const attrMap = {
    'Attack': '攻击', 'Hp': '气血', 'Mp': '内力', 'Hit': '命中', 'Dodge': '闪避',
    'Defense': '防御', 'Parry': '招架', 'Speed': '速度',
    'Fist': '拳掌', 'Sword': '剑法', 'Blade': '刀法',
    'Light': '轻功', 'Inner': '内功'
  };
  
  const displayName = attrMap[attrName] || attrName;
  
  // 计算四维属性贡献
  const char = getCurrentCharacter();
  const s = char.stats;
  let fourDimBonus = fourDimBonusFromCaller !== undefined ? fourDimBonusFromCaller : 0;
  let fourDimDesc = '';
  
  if (fourDimBonus === 0) {
    // 如果调用方没有传入四维加成，自行计算
    switch(attrName) {
      case 'Hp':
        fourDimBonus = s.bone * 5;
        fourDimDesc = `根骨(${s.bone}) × 5`;
        break;
      case 'Mp':
        fourDimBonus = (s.qi || s.spirit) * 2;
        fourDimDesc = `内息(${s.qi || s.spirit}) × 2`;
        break;
      case 'Attack':
        fourDimBonus = s.strength * 3;
        fourDimDesc = `臂力(${s.strength}) × 3`;
        break;
      case 'Speed':
        fourDimBonus = s.agility * 2;
        fourDimDesc = `身法(${s.agility}) × 2`;
        break;
      case 'Hit':
        fourDimBonus = s.agility;
        fourDimDesc = `身法(${s.agility})`;
        break;
      case 'Dodge':
        fourDimBonus = Math.floor(s.agility * 0.5);
        fourDimDesc = `身法(${s.agility}) × 0.5`;
        break;
    }
  } else {
    // 如果调用方传入了四维加成，生成描述
    switch(attrName) {
      case 'Hp':
        fourDimDesc = `根骨(${s.bone}) × 5`;
        break;
      case 'Mp':
        fourDimDesc = `内息(${s.qi || s.spirit}) × 2`;
        break;
      case 'Attack':
        fourDimDesc = `臂力(${s.strength}) × 3`;
        break;
      case 'Speed':
        fourDimDesc = `身法(${s.agility}) × 2`;
        break;
      case 'Hit':
        fourDimDesc = `身法(${s.agility})`;
        break;
      case 'Dodge':
        fourDimDesc = `身法(${s.agility}) × 0.5`;
        break;
    }
  }
  
  // 计算总值（基础值 + 四维加成 + 武学加成 + 装备加成）
  const total = baseVal + fourDimBonus + martialVal + equipVal;
  
  let tooltipHtml = `
    <div class="tooltip-header">${displayName}: ${total}</div>
    <div class="tooltip-content">
      <div class="tooltip-item">
        <span class="tooltip-label">基础值</span>
        <span class="tooltip-value">${baseVal}</span>
      </div>
  `;
  
  // 显示四维贡献
  if (fourDimBonus > 0) {
    tooltipHtml += `
      <div class="tooltip-item">
        <span class="tooltip-label">四维加成</span>
        <span class="tooltip-value" style="color: #ff9800">+${fourDimBonus} (${fourDimDesc})</span>
      </div>
    `;
  }
  
  if (martialVal !== 0) {
    tooltipHtml += `
      <div class="tooltip-item">
        <span class="tooltip-label">武学加成</span>
        <span class="tooltip-value" style="color: #4caf50">+${martialVal}</span>
      </div>
    `;
  }
  
  if (equipVal !== 0) {
    tooltipHtml += `
      <div class="tooltip-item">
        <span class="tooltip-label">装备加成</span>
        <span class="tooltip-value" style="color: #2196f3">+${equipVal}</span>
      </div>
    `;
  }
  
  tooltipHtml += '</div>';
  
  const tooltip = document.createElement('div');
  tooltip.id = 'statTooltip';
  tooltip.className = 'stat-tooltip';
  tooltip.innerHTML = tooltipHtml;
  tooltip.style.cssText = `
    position: fixed;
    background: rgba(0, 0, 0, 0.9);
    border: 1px solid #444;
    border-radius: 8px;
    padding: 12px;
    font-size: 14px;
    color: #fff;
    z-index: 9999;
    pointer-events: none;
    min-width: 150px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  `;
  
  document.body.appendChild(tooltip);
  
  // 定位
  const rect = e.currentTarget.getBoundingClientRect();
  let left = rect.right + 10;
  let top = rect.top;
  
  if (left + tooltip.offsetWidth > window.innerWidth) {
    left = rect.left - tooltip.offsetWidth - 10;
  }
  
  tooltip.style.left = left + 'px';
  tooltip.style.top = top + 'px';
}

function hideStatTooltip() {
  const tooltip = document.getElementById('statTooltip');
  if (tooltip) {
    document.body.removeChild(tooltip);
  }
}

function showCharFloatText(text, color) {
  const floatDiv = document.createElement('div');
  floatDiv.textContent = text;
  floatDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 24px;
    font-weight: bold;
    color: ${color};
    text-shadow: 0 0 15px ${color};
    z-index: 9999;
    opacity: 0;
    transition: all 0.5s ease-out;
  `;
  
  document.body.appendChild(floatDiv);
  
  setTimeout(() => { floatDiv.style.opacity = '1'; }, 50);
  setTimeout(() => { floatDiv.style.opacity = '0'; }, 2000);
  setTimeout(() => { document.body.removeChild(floatDiv); }, 3000);
}

/**
 * 重置四维属性点
 */
function resetFourDimPoints() {
  const char = getCurrentCharacter();
  
  console.log('=== 重置四维属性点 ===');
  console.log('重置前:', {
    strength: char.stats.strength,
    agility: char.stats.agility,
    bone: char.stats.bone,
    qi: char.stats.qi,
    remainingPoints: char.remainingPoints
  });
  
  // 重置四维属性为默认值10
  char.stats.strength = 10;
  char.stats.agility = 10;
  char.stats.bone = 10;
  char.stats.qi = 10;
  
  // 恢复50点剩余属性点
  char.remainingPoints = 50;
  
  // 更新衍生属性
  updateStatsFromFour();
  
  console.log('重置后:', {
    strength: char.stats.strength,
    agility: char.stats.agility,
    bone: char.stats.bone,
    qi: char.stats.qi,
    remainingPoints: char.remainingPoints
  });
  
  // 重置预览
  resetPointPreview();
  
  // 重新加载显示
  loadCharacterData();
  
  // 保存到 localStorage
  localStorage.setItem('playerCharacters', JSON.stringify(window.characters));
  
  // 同步保存到 game_save_0
  try {
    const saveData = localStorage.getItem('game_save_0');
    if (saveData) {
      const save = JSON.parse(saveData);
      if (save.player) {
        save.player.strength = char.stats.strength;
        save.player.agility = char.stats.agility;
        save.player.bone = char.stats.bone;
        save.player.qi = char.stats.qi;
        save.player.remainingPoints = char.remainingPoints;
        save.player.hp = char.health.current;
        save.player.maxHp = char.health.max;
        save.player.mp = char.stats.mp;
        save.player.maxMp = char.stats.maxMp;
        localStorage.setItem('game_save_0', JSON.stringify(save));
        console.log('重置属性点已同步到 game_save_0');
      }
    }
  } catch (e) {
    console.error('保存到 game_save_0 失败:', e);
  }
  
  showCharFloatText('属性点已重置！', '#ff9800');
}

// 点击弹窗外部关闭
window.addEventListener('click', (e) => {
  if (e.target === CHAR_UI.charModal) {
    closeCharModal();
  }
});

// 暴露函数给全局
window.toggleCharacterPanel = toggleCharacterPanel;
window.switchCharacter = switchCharacter;
window.switchCharTab = switchCharTab;
window.showCharEquipment = showCharEquipment;
window.equipCharItem = equipCharItem;
window.unequipCharItem = unequipCharItem;
window.previewCharPoint = previewCharPoint;
window.confirmCharPoint = confirmCharPoint;
window.cancelCharPoint = cancelCharPoint;
window.resetFourDimPoints = resetFourDimPoints;
window.characters = characters;
