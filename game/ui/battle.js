/**
 * 战斗系统核心逻辑
 */

// 战斗状态
let battleState = {
  allyTeam: [],       // 我方队伍
  enemyTeam: [],      // 敌方队伍
  turnOrder: [],      // 行动顺序
  currentTurnIndex: 0,
  isAutoFighting: false,
  battleEnded: false,
  turnCount: 1,       // 回合数
  rewards: {
    exp: 0,
    gold: 0,
    expReward: 0,
    drops: []
  }
};

// 获取指定角色的武学加成
function getMartialBonusForChar(char, attr) {
  let bonus = 0;
  try {
    // 尝试从 localStorage 读取该角色的武学数据
    const saved = localStorage.getItem('playerMartialArts_' + char.id);
    let arts = [];
    
    if (saved) {
      arts = JSON.parse(saved);
      console.log(`角色${char.id}从localStorage加载武学数据，已装备数量:`, arts.filter(m => m.equipped).length);
    } else if (typeof LOCAL_MARTIAL_ARTS !== 'undefined') {
      arts = LOCAL_MARTIAL_ARTS;
      console.log(`角色${char.id}使用默认武学数据`);
    } else if (typeof MARTIAL_ARTS_LIBRARY !== 'undefined') {
      // 如果 LOCAL_MARTIAL_ARTS 未定义，尝试使用 MARTIAL_ARTS_LIBRARY
      arts = MARTIAL_ARTS_LIBRARY;
      console.log(`角色${char.id}使用 MARTIAL_ARTS_LIBRARY`);
    }
    
    arts.forEach(martial => {
      if (martial.equipped && martial.currentLevel > 0) {
        // 计算 stats 加成（如 stats.hp: 50）
        if (martial.stats && martial.stats[attr]) {
          bonus += martial.stats[attr];
        }
        // 对于内力(mp)，还需要加上 innerSkill（内功修为）
        if (attr === 'mp' && martial.stats && martial.stats.innerSkill) {
          bonus += martial.stats.innerSkill;
        }
      }
    });
    
    console.log(`角色${char.id} ${attr} 武学加成:`, bonus);
  } catch (e) {
    console.warn('获取武学加成失败:', e);
  }
  return bonus;
}

// 获取指定角色的装备加成（与角色面板一致的计算逻辑）
function getEquipBonusForChar(char, attr) {
  let bonus = 0;
  try {
    console.log(`获取角色${char.id}(${char.name})的${attr}装备加成`);
    console.log('角色装备数据:', char.equipped);
    
    const slots = ['weapon', 'armor', 'accessory', 'shoes'];
    slots.forEach(slot => {
      const equip = char.equipped && char.equipped[slot];
      console.log(`槽位${slot}:`, equip);
      
      if (equip) {
        // 遍历装备的所有属性，与角色面板逻辑一致
        Object.entries(equip).forEach(([key, val]) => {
          if (key === attr && typeof val === 'number') {
            console.log(`  +${val} (${key})`);
            bonus += val;
          }
        });
        
        // 对于内力(mp)，还需要加上 innerSkill（内功修为）
        if (attr === 'mp' && typeof equip.innerSkill === 'number') {
          console.log(`  +${equip.innerSkill} (innerSkill)`);
          bonus += equip.innerSkill;
        }
      }
    });
    
    console.log(`角色${char.id} ${attr} 装备加成:`, bonus);
  } catch (e) {
    console.warn('获取装备加成失败:', e);
  }
  return bonus;
}

// 获取可用技能
function getAvailableSkills(actor) {
  const skills = [];
  
  // 从武学系统获取已装备的武学和技能
  let martialLevel = 3; // 默认等级
  let hasYangGang = false;
  let hasJianYing = false;
  
  try {
    if (typeof playerMartialArts !== 'undefined') {
      for (const martial of playerMartialArts) {
        if (martial.equipped && martial.type === '武功' && martial.skills) {
          martialLevel = martial.currentLevel || 3;
          console.log('=== getAvailableSkills ===');
          console.log('武学名称:', martial.name);
          console.log('武学等级:', martialLevel);
          console.log('技能数量:', martial.skills.length);
          
          // 检查每个技能是否解锁
          for (const skill of martial.skills) {
            console.log('技能:', skill.name, '解锁等级:', skill.unlockLevel);
            if (skill.name === '阳刚' && martialLevel >= (skill.unlockLevel || 4)) {
              hasYangGang = true;
              console.log('阳刚已激活!');
            }
            if (skill.name === '剑影' && martialLevel >= (skill.unlockLevel || 7)) {
              hasJianYing = true;
              console.log('剑影已激活!');
            }
          }
        }
      }
    } else {
      console.log('playerMartialArts 未定义');
    }
  } catch (e) {
    console.warn('获取武学技能失败', e);
  }
  
  console.log('最终结果 - martialLevel:', martialLevel, 'hasYangGang:', hasYangGang, 'hasJianYing:', hasJianYing);
  
  // 只有武学等级 >=1 才能用直刺
  if (martialLevel >= 1) {
    const skillData = {
      name: '直刺',
      mpCost: 20,
      effect: { type: 'damage', value: 1.2 }
    };
    
    // 只有武学等级 >=7 才能触发剑影
    if (hasJianYing) {
      skillData.followSkill = { type: 'followAttack', baseChance: 0.2, damage: 0.8, chanceAttr: 'agility', chancePerPoint: 0.01 };
    }
    
    // 只有武学等级 >=4 时阳刚才加攻击
    if (hasYangGang) {
      skillData.effect.value += 0.1; // 阳刚增加10%伤害
    }
    
    skills.push(skillData);
  }
  
  return skills;
}

// 角色数据（从角色系统获取）
function getYangGangBonus() {
  let bonus = 1;
  try {
    if (typeof playerMartialArts !== 'undefined') {
      for (const martial of playerMartialArts) {
        if (martial.equipped && martial.type === '武功' && martial.skills) {
          const martialLevel = martial.currentLevel || 1;
          for (const skill of martial.skills) {
            if (skill.name === '阳刚' && martialLevel >= (skill.unlockLevel || 4)) {
              bonus = 1.1;
              console.log('阳刚被动激活，攻击力增加10%');
              return bonus;
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn('检查阳刚被动失败', e);
  }
  return bonus;
}

function getPlayerCharactersFromSave() {
  const maleAvatar = '../assets/shaoxia.png';
  const femaleAvatar = '../assets/suyao.png';
  const yangGangBonus = getYangGangBonus();
  
  console.log('=== battle.js 检查角色系统 ===');
  console.log('typeof window.characters:', typeof window.characters);
  console.log('window.characters?.length:', window.characters?.length);
  console.log('阳刚加成:', yangGangBonus);
  
  if (typeof window.characters !== 'undefined' && window.characters.length > 0) {
    console.log('走角色系统路径');
    console.log('characters[0].name:', window.characters[0].name);
    console.log('characters[0].stats.hp:', window.characters[0].stats.hp);
    console.log('characters[0].stats.mp:', window.characters[0].stats.mp);
    console.log('characters[1].name:', window.characters[1].name);
    console.log('characters[1].stats.hp:', window.characters[1].stats.hp);
    console.log('characters[1].stats.mp:', window.characters[1].stats.mp);
    
    // 使用与角色面板一致的计算逻辑
    // 气血 = 基础值(100+等级×10) + 四维加成(根骨×5) + 武学加成 + 装备加成
    // 内力 = 基础值(50+等级×5) + 四维加成(内息×2) + 武学加成 + 装备加成
    
    // 角色1：少侠
    const char1Level = window.characters[0].level;
    const char1Bone = window.characters[0].stats.bone || 10;
    const char1Qi = window.characters[0].stats.qi || window.characters[0].stats.spirit || 10;
    const char1HpBase = 100 + char1Level * 10;
    const char1HpFourDim = char1Bone * 5;
    const char1HpMartial = getMartialBonusForChar(window.characters[0], 'hp');
    const char1HpEquip = getEquipBonusForChar(window.characters[0], 'hp');
    const char1InnerBonuses = getInnerSkillPassiveBonuses(window.characters[0]);
    const char1FinalMaxHp = char1HpBase + char1HpFourDim + char1HpMartial + char1HpEquip + char1InnerBonuses.maxHpBonus;
    
    const char1MpBase = 50 + char1Level * 5;
    const char1MpFourDim = char1Qi * 2;
    const char1MpMartial = getMartialBonusForChar(window.characters[0], 'mp');
    const char1MpEquip = getEquipBonusForChar(window.characters[0], 'mp');
    const char1FinalMaxMp = char1MpBase + char1MpFourDim + char1MpMartial + char1MpEquip;
    
    // 角色2：苏瑶
    const char2Level = window.characters[1].level;
    const char2Bone = window.characters[1].stats.bone || 10;
    const char2Qi = window.characters[1].stats.qi || window.characters[1].stats.spirit || 10;
    const char2HpBase = 100 + char2Level * 10;
    const char2HpFourDim = char2Bone * 5;
    const char2HpMartial = getMartialBonusForChar(window.characters[1], 'hp');
    const char2HpEquip = getEquipBonusForChar(window.characters[1], 'hp');
    const char2InnerBonuses = getInnerSkillPassiveBonuses(window.characters[1]);
    const char2FinalMaxHp = char2HpBase + char2HpFourDim + char2HpMartial + char2HpEquip + char2InnerBonuses.maxHpBonus;
    
    const char2MpBase = 50 + char2Level * 5;
    const char2MpFourDim = char2Qi * 2;
    const char2MpMartial = getMartialBonusForChar(window.characters[1], 'mp');
    const char2MpEquip = getEquipBonusForChar(window.characters[1], 'mp');
    const char2FinalMaxMp = char2MpBase + char2MpFourDim + char2MpMartial + char2MpEquip;
    
    console.log('少侠血量 - 基础:', char1HpBase, '四维:', char1HpFourDim, '武学:', char1HpMartial, '装备:', char1HpEquip, '内功:', char1InnerBonuses.maxHpBonus, '最终:', char1FinalMaxHp);
    console.log('苏瑶血量 - 基础:', char2HpBase, '四维:', char2HpFourDim, '武学:', char2HpMartial, '装备:', char2HpEquip, '内功:', char2InnerBonuses.maxHpBonus, '最终:', char2FinalMaxHp);
    console.log('少侠内力 - 基础:', char1MpBase, '四维:', char1MpFourDim, '武学:', char1MpMartial, '装备:', char1MpEquip, '最终:', char1FinalMaxMp);
    console.log('苏瑶内力 - 基础:', char2MpBase, '四维:', char2MpFourDim, '武学:', char2MpMartial, '装备:', char2MpEquip, '最终:', char2FinalMaxMp);
    
    return [
      { 
        id: 1, 
        name: '少侠', 
        avatar: maleAvatar, 
        level: char1Level, 
        hp: char1FinalMaxHp,
        maxHp: char1FinalMaxHp,
        mp: char1FinalMaxMp,
        maxMp: char1FinalMaxMp,
        attack: Math.floor((50 + window.characters[0].stats.strength * 3) * yangGangBonus), 
        defense: (window.characters[0].stats.defense || 50) + char1InnerBonuses.defenseBonus, 
        speed: 50 + window.characters[0].stats.agility * 2,
        hit: 70 + window.characters[0].stats.agility, 
        dodge: 20 + Math.floor(window.characters[0].stats.agility * 0.5), 
        parry: window.characters[0].stats.parry || 20,
        stats: window.characters[0].stats
      },
      { 
        id: 2, 
        name: '苏瑶', 
        avatar: femaleAvatar, 
        level: char2Level, 
        hp: char2FinalMaxHp,
        maxHp: char2FinalMaxHp,
        mp: char2FinalMaxMp,
        maxMp: char2FinalMaxMp,
        attack: Math.floor((50 + window.characters[1].stats.strength * 3) * yangGangBonus), 
        defense: (window.characters[1].stats.defense || 50) + char2InnerBonuses.defenseBonus, 
        speed: 50 + window.characters[1].stats.agility * 2,
        hit: 70 + window.characters[1].stats.agility, 
        dodge: 20 + Math.floor(window.characters[1].stats.agility * 0.5), 
        parry: window.characters[1].stats.parry || 20,
        stats: window.characters[1].stats
      }
    ];
  }
  
  // 备用：从 localStorage 读取
  const savedChars = localStorage.getItem('playerCharacters');
  if (savedChars) {
    try {
      const chars = JSON.parse(savedChars);
      if (chars.length >= 2) {
        // 角色1：少侠
        const char1Level = chars[0].level;
        const char1Bone = chars[0].stats.bone || 10;
        const char1Qi = chars[0].stats.qi || chars[0].stats.spirit || 10;
        const char1Str = chars[0].stats.strength || 10;
        const char1Agi = chars[0].stats.agility || 10;
        const char1HpBase = 100 + char1Level * 10;
        const char1HpFourDim = char1Bone * 5;
        const char1HpMartial = getMartialBonusForChar(chars[0], 'hp');
        const char1HpEquip = getEquipBonusForChar(chars[0], 'hp');
        const char1InnerBonuses = getInnerSkillPassiveBonuses(chars[0]);
        const char1FinalMaxHp = char1HpBase + char1HpFourDim + char1HpMartial + char1HpEquip + char1InnerBonuses.maxHpBonus;
        
        const char1MpBase = 50 + char1Level * 5;
        const char1MpFourDim = char1Qi * 2;
        const char1MpMartial = getMartialBonusForChar(chars[0], 'mp');
        const char1MpEquip = getEquipBonusForChar(chars[0], 'mp');
        const char1FinalMaxMp = char1MpBase + char1MpFourDim + char1MpMartial + char1MpEquip;
        
        // 角色2：苏瑶
        const char2Level = chars[1].level;
        const char2Bone = chars[1].stats.bone || 10;
        const char2Qi = chars[1].stats.qi || chars[1].stats.spirit || 10;
        const char2Str = chars[1].stats.strength || 10;
        const char2Agi = chars[1].stats.agility || 10;
        const char2HpBase = 100 + char2Level * 10;
        const char2HpFourDim = char2Bone * 5;
        const char2HpMartial = getMartialBonusForChar(chars[1], 'hp');
        const char2HpEquip = getEquipBonusForChar(chars[1], 'hp');
        const char2InnerBonuses = getInnerSkillPassiveBonuses(chars[1]);
        const char2FinalMaxHp = char2HpBase + char2HpFourDim + char2HpMartial + char2HpEquip + char2InnerBonuses.maxHpBonus;
        
        const char2MpBase = 50 + char2Level * 5;
        const char2MpFourDim = char2Qi * 2;
        const char2MpMartial = getMartialBonusForChar(chars[1], 'mp');
        const char2MpEquip = getEquipBonusForChar(chars[1], 'mp');
        const char2FinalMaxMp = char2MpBase + char2MpFourDim + char2MpMartial + char2MpEquip;
        
        return [
          { 
            id: 1, 
            name: chars[0].name, 
            avatar: maleAvatar, 
            level: char1Level, 
            hp: char1FinalMaxHp,
            maxHp: char1FinalMaxHp,
            mp: char1FinalMaxMp,
            maxMp: char1FinalMaxMp,
            attack: Math.floor((50 + char1Str * 3) * yangGangBonus), 
            defense: (chars[0].stats.defense || 50) + char1InnerBonuses.defenseBonus, 
            speed: 50 + char1Agi * 2,
            hit: 70 + char1Agi, 
            dodge: 20 + Math.floor(char1Agi * 0.5), 
            parry: chars[0].stats.parry || 20,
            stats: chars[0].stats
          },
          { 
            id: 2, 
            name: chars[1].name, 
            avatar: femaleAvatar, 
            level: char2Level, 
            hp: char2FinalMaxHp,
            maxHp: char2FinalMaxHp,
            mp: char2FinalMaxMp,
            maxMp: char2FinalMaxMp,
            attack: Math.floor((50 + char2Str * 3) * yangGangBonus), 
            defense: (chars[1].stats.defense || 50) + char2InnerBonuses.defenseBonus, 
            speed: 50 + char2Agi * 2,
            hit: 70 + char2Agi, 
            dodge: 20 + Math.floor(char2Agi * 0.5), 
            parry: chars[1].stats.parry || 20,
            stats: chars[1].stats
          }
        ];
      }
    } catch (e) {
      console.error('从 localStorage 读取角色数据失败:', e);
    }
  }
  
  // 备用：从存档读取
  const saveData = localStorage.getItem('game_save_0');
  
  // 优先尝试从角色系统获取苏瑶数据
  let char2Data = null;
  if (typeof window.characters !== 'undefined' && window.characters.length > 1) {
    char2Data = window.characters[1];
    console.log('从角色系统获取苏瑶数据');
  }
  
  if (!saveData) {
    // 使用默认数据或角色系统数据
    const char2Hp = char2Data ? 100 + char2Data.level * 10 + (char2Data.stats.bone || 10) * 5 : 270;
    const char2Mp = char2Data ? 50 + char2Data.level * 5 + (char2Data.stats.qi || 10) * 2 : 130;
    
    return [
      { id: 1, name: '少侠', avatar: maleAvatar, level: 10, hp: 250, maxHp: 250, mp: 120, maxMp: 120, attack: Math.floor(80 * yangGangBonus), defense: 52, speed: 72, hit: 80, dodge: 45, parry: 38, stats: { strength: 10, agility: 10, bone: 10, qi: 10, mp: 120, maxMp: 120 }, equipped: {} },
      { id: 2, name: char2Data?.name || '苏瑶', avatar: femaleAvatar, level: char2Data?.level || 12, hp: char2Hp, maxHp: char2Hp, mp: char2Mp, maxMp: char2Mp, attack: Math.floor(80 * yangGangBonus), defense: 45, speed: 72, hit: 80, dodge: 45, parry: 28, stats: char2Data?.stats || { strength: 10, agility: 10, bone: 10, qi: 10, mp: char2Mp, maxMp: char2Mp }, equipped: char2Data?.equipped || {} }
    ];
  }
  
  try {
    const save = JSON.parse(saveData);
    const player = save.player;
    
    if (!player) {
      throw new Error('No player data in save');
    }
    
    const stats = player.stats || { strength: 10, agility: 10, bone: 10, qi: 10 };
    const level = player.level || 1;
    
    // 使用正确的属性名：bone(根骨) 和 qi(内息)，而不是 vitality 和 spirit
    const maxHp = Math.floor(100 + (stats.bone || stats.vitality || 10) * 5 + level * 10);
    const maxMp = Math.floor(50 + (stats.qi || stats.spirit || 10) * 2 + level * 5);
    const attack = Math.floor((50 + stats.strength * 3) * yangGangBonus);
    const defense = stats.defense || 50;
    const speed = 50 + stats.agility * 2;
    const hit = 70 + stats.agility;
    const dodge = 20 + Math.floor(stats.agility * 0.5);
    const parry = stats.parry || 20;
    
    // 从存档读取或使用计算值
    const playerMp = player.mp || player.maxMp || maxMp;
    const playerMaxMp = player.maxMp || maxMp;
    
    // 获取苏瑶数据（优先从角色系统，其次使用默认数据）
    let char2Level = 12, char2Bone = 10, char2Qi = 10, char2Str = 10, char2Agi = 10;
    let char2Equipped = {};
    if (char2Data) {
      char2Level = char2Data.level;
      char2Bone = char2Data.stats.bone || 10;
      char2Qi = char2Data.stats.qi || 10;
      char2Str = char2Data.stats.strength || 10;
      char2Agi = char2Data.stats.agility || 10;
      char2Equipped = char2Data.equipped || {};
    }
    
    const char2MaxHp = Math.floor(100 + char2Level * 10 + char2Bone * 5);
    const char2MaxMp = Math.floor(50 + char2Level * 5 + char2Qi * 2);
    const char2Attack = Math.floor((50 + char2Str * 3) * yangGangBonus);
    const char2Defense = 45;
    const char2Speed = 50 + char2Agi * 2;
    const char2Hit = 70 + char2Agi;
    const char2Dodge = 20 + Math.floor(char2Agi * 0.5);
    const char2Parry = 28;
    
    return [
      { 
        id: 1, 
        name: '少侠', 
        avatar: maleAvatar, 
        level: level, 
        hp: maxHp, 
        maxHp: maxHp,
        mp: playerMp,
        maxMp: playerMaxMp,
        attack: attack, 
        defense: defense, 
        speed: speed, 
        hit: hit, 
        dodge: dodge, 
        parry: parry,
        stats: stats,
        equipped: player.equipped || {}
      },
      { 
        id: 2, 
        name: char2Data?.name || '苏瑶', 
        avatar: femaleAvatar, 
        level: char2Level, 
        hp: char2MaxHp, 
        maxHp: char2MaxHp,
        mp: char2MaxMp,
        maxMp: char2MaxMp,
        attack: char2Attack, 
        defense: char2Defense, 
        speed: char2Speed,
        hit: char2Hit, 
        dodge: char2Dodge, 
        parry: char2Parry,
        stats: char2Data?.stats || { strength: char2Str, agility: char2Agi, bone: char2Bone, qi: char2Qi },
        equipped: char2Equipped
      }
    ];
  } catch (e) {
    console.error('从存档读取角色数据失败:', e);
    // 使用正确的内力计算公式
    const char2Level = char2Data?.level || 12;
    const char2Bone = char2Data?.stats.bone || 10;
    const char2Qi = char2Data?.stats.qi || 10;
    const char2Str = char2Data?.stats.strength || 10;
    const char2Agi = char2Data?.stats.agility || 10;
    
    const fallbackMp1 = Math.floor(50 + 10 * 2 + 10 * 5); // 100
    const fallbackHp2 = Math.floor(100 + char2Level * 10 + char2Bone * 5);
    const fallbackMp2 = Math.floor(50 + char2Level * 5 + char2Qi * 2);
    
    return [
      { id: 1, name: '少侠', avatar: maleAvatar, level: 10, hp: 250, maxHp: 250, mp: fallbackMp1, maxMp: fallbackMp1, attack: Math.floor(80 * yangGangBonus), defense: 52, speed: 72, hit: 80, dodge: 45, parry: 38, stats: { strength: 10, agility: 10, bone: 10, qi: 10 }, equipped: {} },
      { id: 2, name: char2Data?.name || '苏瑶', avatar: femaleAvatar, level: char2Level, hp: fallbackHp2, maxHp: fallbackHp2, mp: fallbackMp2, maxMp: fallbackMp2, attack: Math.floor((50 + char2Str * 3) * yangGangBonus), defense: 45, speed: 50 + char2Agi * 2, hit: 70 + char2Agi, dodge: 20 + Math.floor(char2Agi * 0.5), parry: 28, stats: { strength: char2Str, agility: char2Agi, bone: char2Bone, qi: char2Qi }, equipped: char2Data?.equipped || {} }
    ];
  }
}

/**
 * 初始化战斗
 */
async function initBattle() {
  // 每次战斗开始时重新获取角色数据（确保等级是最新的）
  console.log('=== initBattle 开始 ===');
  const currentPlayerCharacters = getPlayerCharactersFromSave();
  console.log('initBattle 获取到的角色:', currentPlayerCharacters.map(c => ({name: c.name, hp: c.hp, attack: c.attack})));
  
  const enemyId = localStorage.getItem('battleEnemyId');

  let enemy = ENEMIES.shanze_louluo_1;
  if (enemyId && ENEMIES[enemyId]) {
    enemy = ENEMIES[enemyId];
  }

  localStorage.removeItem('battleEnemyId');

  battleState.allyTeam = currentPlayerCharacters.map(char => ({
    ...char,
    hp: char.maxHp,
    mp: char.maxMp,
    isAlly: true,
    isDead: false
  }));

  battleState.enemyTeam = [{
    ...enemy,
    isAlly: false,
    isDead: false,
    hp: enemy.hp
  }];

  battleState.turnOrder = [...battleState.allyTeam, ...battleState.enemyTeam];
  calculateTurnOrder();
  battleState.currentTurnIndex = 0;
  battleState.battleEnded = false;
  battleState.turnCount = 1;

  renderTeams();
  updateTurnDisplay();
  addBattleLog('战斗开始！');
  // 第一回合不回血，从第二回合开始
}

function calculateTurnOrder() {
  battleState.turnOrder.sort((a, b) => b.speed - a.speed);
}

function renderTeams() {
  const allyContainer = document.getElementById('teamAlly');
  const enemyContainer = document.getElementById('teamEnemy');

  allyContainer.innerHTML = battleState.allyTeam.map(char => renderCharacterCard(char)).join('');
  enemyContainer.innerHTML = battleState.enemyTeam.map(char => renderCharacterCard(char)).join('');
}

function renderCharacterCard(char) {
  const isActive = battleState.turnOrder[battleState.currentTurnIndex] === char;
  const fallbackIcon = char.name === '少侠' ? '⚔️' : char.name === '苏瑶' ? '🌸' : (char.icon || '👤');
  const hasAvatar = char.avatar && char.avatar !== '';

  let avatarHtml = '';
  if (hasAvatar) {
    avatarHtml = `<img class="character-avatar" src="${char.avatar}" alt="${char.name}" onError="handleAvatarError(this, '${fallbackIcon}')" />`;
  } else {
    avatarHtml = `<div class="character-avatar-emoji">${fallbackIcon}</div>`;
  }

  return `
    <div class="character-card ${isActive ? 'active' : ''} ${char.isDead ? 'dead' : ''}" id="char-${char.id}">
      <div class="character-name">${char.name}</div>
      <div class="character-avatar-container">
        ${avatarHtml}
      </div>
      <div class="hp-text">${char.hp}</div>
      ${char.mp !== undefined ? `<div class="mp-text">${char.mp}</div>` : ''}
    </div>
  `;
}

function handleAvatarError(img, fallbackIcon) {
  img.style.display = 'none';
  const container = img.parentElement;
  container.innerHTML = `<div class="character-avatar-emoji">${fallbackIcon}</div>`;
}

function addBattleLog(text) {
  const logElement = document.getElementById('battleLog');
  logElement.innerHTML = text;
}

// 更新回合显示
function updateTurnDisplay() {
  const display = document.getElementById('turnDisplay');
  if (display) {
    display.textContent = `第 ${battleState.turnCount}/99 回合`;
  }
}

// 显示技能气泡
function showSkillBubble(charId, skillName) {
  const card = document.getElementById(`char-${charId}`);
  if (card) {
    const bubble = document.createElement('div');
    bubble.className = 'skill-bubble';
    bubble.textContent = skillName;
    card.appendChild(bubble);
    setTimeout(() => bubble.classList.add('show'), 10);
    setTimeout(() => {
      bubble.remove();
    }, 700);
  }
}

// 显示剑气特效
function showSwordEffect(actor, target, effectType) {
  const container = document.querySelector('.battle-container');
  if (!container) return;
  
  const actorCard = document.getElementById(`char-${actor.id}`);
  const targetCard = document.getElementById(`char-${target.id}`);
  if (!actorCard || !targetCard) return;
  
  const containerRect = container.getBoundingClientRect();
  
  if (effectType === 'thrust') {
    // 直刺特效 - 直接在目标头像上显示
    const targetRect = targetCard.getBoundingClientRect();
    const effect = document.createElement('div');
    effect.className = 'sword-effect-thrust';
    
    const targetX = targetRect.left + targetRect.width / 2 - containerRect.left;
    const targetY = targetRect.top + targetRect.height / 2 - containerRect.top;
    
    // 计算角度（从攻击者指向目标）
    const actorRect = actorCard.getBoundingClientRect();
    const startX = actorRect.left + actorRect.width / 2 - containerRect.left;
    const startY = actorRect.top + actorRect.height / 2 - containerRect.top;
    const angle = Math.atan2(targetY - startY, targetX - startX) * 180 / Math.PI;
    
    // 剑气中心点在目标位置，长度保持200px
    effect.style.left = `${targetX - 100}px`;
    effect.style.top = `${targetY - 4}px`;
    effect.style.width = '200px';
    effect.style.transform = `rotate(${angle}deg)`;
    effect.style.transformOrigin = 'center center';
    
    container.appendChild(effect);
    
    setTimeout(() => {
      effect.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      effect.remove();
    }, 500);
    
    // 受击震动
    showHitShake(target);
  } else if (effectType === 'shadow') {
    // 剑影特效 - 竖着的剑气
    const effect = document.createElement('div');
    effect.className = 'sword-effect-shadow';
    
    const targetRect = targetCard.getBoundingClientRect();
    const centerX = targetRect.left + targetRect.width / 2 - containerRect.left;
    const centerY = targetRect.top + targetRect.height / 2 - containerRect.top;
    
    effect.style.left = `${centerX - 4}px`;
    effect.style.top = `${centerY - 75}px`;
    
    container.appendChild(effect);
    
    setTimeout(() => {
      effect.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      effect.remove();
    }, 600);
    
    // 受击震动
    showHitShake(target);
  }
}

// 显示受击震动
function showHitShake(target) {
  const card = document.getElementById(`char-${target.id}`);
  if (card) {
    card.classList.add('hit');
    setTimeout(() => card.classList.remove('hit'), 300);
  }
}

// 显示攻击移动动画
async function showAttackMove(actor) {
  const card = document.getElementById(`char-${actor.id}`);
  if (card) {
    card.classList.add('attack-move');
    await sleep(300);
  }
}

// 显示攻击返回动画
async function showAttackReturn(actor) {
  const card = document.getElementById(`char-${actor.id}`);
  if (card) {
    card.classList.remove('attack-move');
    card.classList.add('attack-return');
    await sleep(300);
    card.classList.remove('attack-return');
  }
}

// 获取内功被动属性加成
function getInnerSkillPassiveBonuses(char) {
  let defenseBonus = 0;
  let maxHpBonus = 0;

  try {
    if (typeof playerMartialArts !== 'undefined') {
      for (const martial of playerMartialArts) {
        if (martial.equipped && martial.type === '内功' && martial.skills) {
          for (const skill of martial.skills) {
            // 培元技能：增加防御（受根骨影响）
            if (skill.name === '培元' && martial.currentLevel >= (skill.unlockLevel || 1)) {
              const effect = skill.effect;
              if (effect && effect.type === 'defenseBuff') {
                let bonus = effect.baseValue || 0;
                if (effect.bonusAttr && char.stats) {
                  bonus += (char.stats[effect.bonusAttr] || 0) * (effect.bonusPerPoint || 0);
                }
                defenseBonus += Math.ceil(bonus);
                console.log(`${martial.name} 培元：防御 +${defenseBonus}`);
              }
            }
            // 固本技能：增加气血上限（受根骨影响）
            if (skill.name === '固本' && martial.currentLevel >= (skill.unlockLevel || 4)) {
              const effect = skill.effect;
              if (effect && effect.type === 'maxHpBuff') {
                let bonus = effect.baseValue || 0;
                if (effect.bonusAttr && char.stats) {
                  bonus += (char.stats[effect.bonusAttr] || 0) * (effect.bonusPerPoint || 0);
                }
                maxHpBonus += Math.ceil(bonus);
                console.log(`${martial.name} 固本：气血上限 +${maxHpBonus}`);
              }
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn('获取内功加成失败:', e);
  }

  return { defenseBonus, maxHpBonus };
}

// 检查是否装备了内功
function hasInnerSkillEquipped() {
  try {
    if (typeof playerMartialArts !== 'undefined') {
      for (const martial of playerMartialArts) {
        if (martial.equipped && martial.type === '内功') {
          return { equipped: true, level: martial.currentLevel || 1, name: martial.name };
        }
      }
    }
  } catch (e) {
    console.warn('检查内功装备失败:', e);
  }
  return { equipped: false, level: 0, name: '' };
}

// 恢复内力（只有装备内功时才恢复）
function recoverMp(char) {
  if (char.mp === undefined || !char.maxMp) return;
  
  const innerSkill = hasInnerSkillEquipped();
  if (!innerSkill.equipped) {
    console.log('未装备内功，不恢复内力');
    return;
  }
  
  // 根据内功等级计算恢复量（基础10% + 每级额外2%）
  const baseRecoverRate = 0.1 + (innerSkill.level - 1) * 0.02;
  const recover = Math.floor(char.maxMp * baseRecoverRate);
  char.mp = Math.min(char.maxMp, char.mp + recover);
  console.log(`${innerSkill.name}(${innerSkill.level}级) 恢复内力: +${recover}`);
  updateMpDisplay(char.id, char.mp, true);
}

// 计算内功自动回血量
function calculateInnerSkillHeal(char) {
  let healAmount = 0;
  let martialArtsData = [];
  
  try {
    console.log('=== 开始计算内功回血 ===');
    
    // 获取用户实际的武学等级（从 localStorage）
    let savedMartialArts = [];
    const charId = char.id || 1;
    const saved = localStorage.getItem('playerMartialArts_' + charId);
    if (saved) {
      savedMartialArts = JSON.parse(saved);
      console.log('从 localStorage 获取到用户武学数据');
    }
    
    // 使用 MARTIAL_ARTS_LIBRARY 的技能数据，但合并用户的等级
    if (typeof MARTIAL_ARTS_LIBRARY !== 'undefined') {
      martialArtsData = MARTIAL_ARTS_LIBRARY.map(martial => {
        // 找到对应的保存数据
        const savedMartial = savedMartialArts.find(m => m.id === martial.id);
        if (savedMartial) {
          // 使用用户保存的等级
          return { ...martial, currentLevel: savedMartial.currentLevel, equipped: savedMartial.equipped };
        }
        return martial;
      });
      console.log('使用 MARTIAL_ARTS_LIBRARY 的技能数据 + localStorage 的等级');
      
      const zhengyang = martialArtsData.find(m => m.name === '正阳吐纳诀');
      if (zhengyang) {
        console.log('正阳吐纳诀技能顺序:', zhengyang.skills.map(s => s.name));
        console.log('正阳吐纳诀当前等级:', zhengyang.currentLevel);
      }
    } else if (typeof playerMartialArts !== 'undefined') {
      martialArtsData = playerMartialArts;
      console.log('使用 playerMartialArts');
    } else if (savedMartialArts.length > 0) {
      martialArtsData = savedMartialArts;
      console.log('使用 localStorage');
    }
    
    console.log('武学数据:', martialArtsData);
    
    for (const martial of martialArtsData) {
      if (martial.equipped && martial.type === '内功' && martial.skills) {
        console.log('装备的内功:', martial.name, '等级:', martial.currentLevel);
        console.log('技能数组:', martial.skills);
        
        for (const skill of martial.skills) {
          console.log('技能:', skill.name, '解锁等级:', skill.unlockLevel);
          
          if (skill.name === '调息' && martial.currentLevel >= (skill.unlockLevel || 7)) {
            const effect = skill.effect;
            if (effect && effect.type === 'autoHeal') {
              const base = effect.baseValue || 5;
              const levelBonus = martial.currentLevel * (effect.levelMultiplier || 3);
              const spiritBonus = (char.stats && char.stats.spirit || 0) * (effect.bonusPerPoint || 0.8);
              healAmount = Math.floor(base + levelBonus + spiritBonus);
              console.log(`${martial.name}(${martial.currentLevel}级) 调息回血量: ${healAmount}`);
              break;
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn('计算内功回血失败:', e);
  }
  
  return healAmount;
}

// 显示内功回血特效
function showInnerSkillHealEffect(charId, healAmount) {
  console.log('=== showInnerSkillHealEffect 被调用 ===');
  console.log('角色ID:', charId);
  console.log('回血量:', healAmount);
  
  const card = document.getElementById(`char-${charId}`);
  console.log('卡片元素:', card);
  
  if (!card) {
    console.log('卡片不存在');
    return;
  }
  
  if (!window.BattleEffects) {
    console.log('BattleEffects 未定义');
    return;
  }
  
  const container = card.querySelector('.character-avatar-container');
  console.log('容器元素:', container);
  
  if (!container) {
    // 尝试其他选择器
    const avatar = card.querySelector('.avatar');
    console.log('头像元素:', avatar);
    if (avatar) {
      window.BattleEffects.showInnerSkillHeal(avatar, healAmount, true);
      return;
    }
    console.log('容器不存在');
    return;
  }
  
  window.BattleEffects.showInnerSkillHeal(container, healAmount, true);
}

// 应用内功自动回血
function applyInnerSkillHeal(char) {
  console.log('=== applyInnerSkillHeal 被调用 ===');
  console.log('角色:', char.name);
  
  const healAmount = calculateInnerSkillHeal(char);
  console.log('计算回血量:', healAmount);
  console.log('healAmount > 0 ?', healAmount > 0);
  console.log('typeof healAmount:', typeof healAmount);
  
  if (healAmount > 0) {
    console.log('进入回血逻辑');
    const oldHp = char.hp;
    char.hp = Math.min(char.maxHp, char.hp + healAmount);
    const actualHeal = char.hp - oldHp;
    
    // 显示回血特效（即使血量已满也显示）
    console.log(`${char.name} 内功自动回血: +${healAmount}`);
    console.log('调用 showInnerSkillHealEffect');
    showInnerSkillHealEffect(char.id, healAmount);
    console.log('showInnerSkillHealEffect 调用完成');
    
    // 始终显示飘字
    showDamageNumber(char.id, healAmount, true);
    
    if (actualHeal > 0) {
      updateHpDisplay(char.id, char.hp);
      addBattleLog(`${char.name} 内功调息，恢复 ${actualHeal} 点生命！`);
    }
  }
}

// 更新内力显示
function updateMpDisplay(charId, mp, isRecover = false) {
  const card = document.getElementById(`char-${charId}`);
  if (card) {
    const mpElement = card.querySelector('.mp-text');
    if (mpElement) {
      mpElement.textContent = mp;
      if (!isRecover) {
        mpElement.style.color = '#ff5722';
        mpElement.style.transform = 'scale(1.2)';
      } else {
        mpElement.style.color = '#2196f3';
        mpElement.style.transform = 'scale(1.1)';
      }
      setTimeout(() => {
        mpElement.style.color = '#2196f3';
        mpElement.style.transform = 'scale(1)';
      }, 300);
    }
  }
}

// 检查剑影
async function checkFollowAttack(actor, target, followSkill) {
  if (!actor.stats) return;
  
  const agility = actor.stats.agility || 0;
  const chance = followSkill.baseChance + agility * followSkill.chancePerPoint;
  
  if (Math.random() < chance) {
    // 显示剑影气泡
    showSkillBubble(actor.id, '剑影');
    await sleep(400);
    
    // 显示剑影特效
    showSwordEffect(actor, target, 'shadow');
    
    const damage = Math.floor(actor.attack * followSkill.damage);
    showDamageNumber(target.id, -damage, false);
    target.hp = Math.max(0, target.hp - damage);
    addBattleLog(`${actor.name} 触发剑影，额外造成 ${damage} 点伤害！`);
    
    if (target.hp <= 0) {
      target.isDead = true;
      target.hp = 0;
    }
    
    updateHpDisplay(target.id, target.hp);
    await sleep(300);
  }
}

// 使用技能
async function useSkill(actor, skill, target) {
  actor.mp -= skill.mpCost;
  updateMpDisplay(actor.id, actor.mp, false);
  
  // 1. 角色移动到中间
  await showAttackMove(actor);
  
  // 2. 显示技能气泡
  showSkillBubble(actor.id, skill.name);
  await sleep(400);
  
  // 3. 造成伤害
  if (skill.effect.type === 'damage') {
    let multiplier = skill.effect.value;
    
    // 显示直刺特效
    showSwordEffect(actor, target, 'thrust');
    
    const damage = Math.floor(actor.attack * multiplier);
    showDamageNumber(target.id, -damage);
    target.hp = Math.max(0, target.hp - damage);
    addBattleLog(`${actor.name} 使用 ${skill.name}，造成 ${damage} 点伤害！`);
    await sleep(300);
    
    // 4. 检查剑影连击（角色还在中间）
    if (skill.followSkill) {
      await checkFollowAttack(actor, target, skill.followSkill);
    }
  }
  
  if (target.hp <= 0) {
    target.isDead = true;
    target.hp = 0;
    addBattleLog(`${target.name} 被击败！`);
    
    const targetCard = document.getElementById(`char-${target.id}`);
    if (targetCard) {
      targetCard.classList.add('dead');
    }
  }
  
  updateHpDisplay(target.id, target.hp);
  
  // 5. 角色回到原位
  await showAttackReturn(actor);
}

async function runBattleLoop() {
  while (!battleState.battleEnded) {
    const currentChar = battleState.turnOrder[battleState.currentTurnIndex];

    if (!currentChar.isDead) {
      await performAction(currentChar);
    }

    if (checkBattleEnd()) {
      renderTeams();
      await sleep(500);
      break;
    }

    battleState.currentTurnIndex++;
      if (battleState.currentTurnIndex >= battleState.turnOrder.length) {
        battleState.currentTurnIndex = 0;
        battleState.turnCount++;
        if (battleState.turnCount > 99) battleState.turnCount = 99;
        updateTurnDisplay();
        calculateTurnOrder();
        
        // 从第二回合开始回血（第一回合不回血）
        if (battleState.turnCount >= 2) {
          console.log('=== 新回合开始，应用内功回血 ===');
          console.log('当前回合:', battleState.turnCount);
          await sleep(300);
          battleState.allyTeam.forEach(char => {
            if (!char.isDead) {
              applyInnerSkillHeal(char);
            }
          });
          await sleep(500);
        }
      }

    // 只更新高亮状态，不重新渲染卡片
    updateActiveHighlight();
    await sleep(800);
  }

  await showSettlement();
}

function checkBattleEnd() {
  const allAlliesDead = battleState.allyTeam.every(char => char.isDead);
  const allEnemiesDead = battleState.enemyTeam.every(char => char.isDead);

  if (allAlliesDead || allEnemiesDead) {
    battleState.battleEnded = true;
    return true;
  }
  return false;
}

async function performAction(actor) {
  const targetTeam = actor.isAlly ? battleState.enemyTeam : battleState.allyTeam;
  const aliveTargets = targetTeam.filter(char => !char.isDead);
  
  if (aliveTargets.length === 0) return;

  const target = aliveTargets[0];

  if (actor.isAlly) {
      // 我方角色使用技能
      const skills = getAvailableSkills(actor);
      let usedSkill = false;
      
      // 恢复内力
      recoverMp(actor);
    
    for (const skill of skills) {
      if (actor.mp >= skill.mpCost) {
        await useSkill(actor, skill, target);
        usedSkill = true;
        break;
      }
    }
    
    if (!usedSkill) {
      // 没有内力，普通攻击
      await showAttackMove(actor);
      showSkillBubble(actor.id, '攻击');
      await sleep(400);
      
      const damage = Math.floor(actor.attack * 0.6);
      showDamageNumber(target.id, -damage);
      target.hp = Math.max(0, target.hp - damage);
      addBattleLog(`${actor.name} 普通攻击 ${target.name}，造成 ${damage} 点伤害！`);
      
      if (target.hp <= 0) {
        target.isDead = true;
        target.hp = 0;
        addBattleLog(`${target.name} 被击败！`);
        
        const targetCard = document.getElementById(`char-${target.id}`);
        if (targetCard) {
          targetCard.classList.add('dead');
        }
      }
      
      updateHpDisplay(target.id, target.hp);
      showHitShake(target);
      
      await sleep(300);
      await showAttackReturn(actor);
    }
  } else {
    // 敌人回合
    await showAttackMove(actor);
    showSkillBubble(actor.id, '攻击');
    await sleep(400);
    
    const result = calculateDamage(actor, target);
    
    if (result.isDodge) {
      showBattleText(target.id, '闪避', 'miss');
      await showDodgeAnimation(target);
      addBattleLog(`${actor.name} 攻击 ${target.name}，但被闪避了！`);
    } else if (result.isParry) {
      showBattleText(target.id, '招架', 'parry');
      showDamageNumber(target.id, -result.damage);
      target.hp = Math.max(0, target.hp - result.damage);
      addBattleLog(`${actor.name} 攻击 ${target.name}，造成 ${result.damage} 点伤害（被招架）！`);
    } else {
      const critText = result.isCritical ? '暴击！' : '';
      showDamageNumber(target.id, -result.damage, result.isCritical);
      target.hp = Math.max(0, target.hp - result.damage);
      addBattleLog(`${actor.name} ${critText}造成 ${result.damage} 点伤害！`);
    }

    if (target.hp <= 0) {
      target.isDead = true;
      target.hp = 0;
      addBattleLog(`${target.name} 被击败！`);
      
      const targetCard = document.getElementById(`char-${target.id}`);
      if (targetCard) {
        targetCard.classList.add('dead');
      }
    }
    
    updateHpDisplay(target.id, target.hp);
    showHitShake(target);
    
    await sleep(300);
    await showAttackReturn(actor);
  }
  
  await sleep(600);
}

function calculateDamage(attacker, defender) {
  const hitRoll = Math.random() * 100;
  const dodgeRoll = Math.random() * 100;
  const parryRoll = Math.random() * 100;

  if (dodgeRoll < defender.dodge) {
    return { damage: 0, isDodge: true, isParry: false, isCritical: false };
  }

  if (parryRoll < defender.parry && hitRoll >= attacker.hit) {
    const baseDamage = attacker.attack - defender.defense;
    const damage = Math.max(1, Math.floor(baseDamage * 0.5));
    return { damage, isDodge: false, isParry: true, isCritical: false };
  }

  if (hitRoll < attacker.hit) {
    const critRoll = Math.random() * 100;
    const isCritical = critRoll < 15;
    const baseDamage = attacker.attack - defender.defense;
    const damage = Math.max(1, Math.floor(baseDamage * (isCritical ? 1.5 : 1)));
    return { damage, isDodge: false, isParry: false, isCritical };
  }

  return { damage: 0, isDodge: false, isParry: false, isCritical: false };
}

async function showAttackAnimation(actor) {
  const card = document.getElementById(`char-${actor.id}`);
  if (card) {
    card.classList.add('attacking');
    await sleep(300);
    card.classList.remove('attacking');
  }
}

function showDamageNumber(charId, damage, isHeal = false, isCritical = false) {
  const card = document.getElementById(`char-${charId}`);
  if (!card) return;

  const cardRect = card.getBoundingClientRect();
  const container = document.querySelector('.battle-container');
  
  const damageDiv = document.createElement('div');
  
  let className = 'damage-number';
  if (isHeal) {
    className += ' heal';
    damageDiv.textContent = `+${damage}`;
  } else {
    className += isCritical ? ' critical' : ' damage';
    damageDiv.textContent = damage;
  }
  
  damageDiv.className = className;
  damageDiv.style.left = `${cardRect.left + cardRect.width / 2}px`;
  damageDiv.style.top = `${cardRect.top - 30}px`;
  damageDiv.style.position = 'fixed';
  damageDiv.style.transform = 'translateX(-50%)';
  
  container.appendChild(damageDiv);

  setTimeout(() => {
    damageDiv.remove();
  }, 1000);
}

function showBattleText(charId, text, type) {
  const card = document.getElementById(`char-${charId}`);
  if (!card) return;

  const cardRect = card.getBoundingClientRect();
  const container = document.querySelector('.battle-container');
  
  const textDiv = document.createElement('div');
  textDiv.className = `damage-number ${type}`;
  textDiv.textContent = text;
  textDiv.style.left = `${cardRect.left + cardRect.width / 2}px`;
  textDiv.style.top = `${cardRect.top - 30}px`;
  textDiv.style.position = 'fixed';
  textDiv.style.transform = 'translateX(-50%)';
  
  container.appendChild(textDiv);

  setTimeout(() => {
    textDiv.remove();
  }, 1000);
}

function updateHpDisplay(charId, hp) {
  const card = document.getElementById(`char-${charId}`);
  if (!card) return;
  
  const hpElement = card.querySelector('.hp-text');
  if (hpElement) {
    hpElement.textContent = hp;
  }
}

function updateActiveHighlight() {
  // 移除所有卡片的active类
  document.querySelectorAll('.character-card').forEach(card => {
    card.classList.remove('active');
  });
  
  // 给当前回合的角色添加active类
  const currentChar = battleState.turnOrder[battleState.currentTurnIndex];
  if (currentChar) {
    const currentCard = document.getElementById(`char-${currentChar.id}`);
    if (currentCard) {
      currentCard.classList.add('active');
    }
  }
}

async function showDodgeAnimation(char) {
  const card = document.getElementById(`char-${char.id}`);
  if (!card) return;
  
  // 添加闪避动画类
  card.classList.add('dodging');
  
  // 等待动画完成
  await sleep(300);
  
  // 移除动画类
  card.classList.remove('dodging');
}

async function showSettlement() {
  const isVictory = battleState.enemyTeam.every(char => char.isDead);
  const rewards = isVictory ? battleState.rewards : { exp: 0, gold: 0, expReward: 0 };

  if (isVictory) {
    const enemy = battleState.enemyTeam[0];
    rewards.exp = enemy.expReward || enemy.exp || 25;
    rewards.gold = enemy.goldReward || enemy.gold || 10;
    rewards.expReward = enemy.expReward || 17;
  }

  await showFloatText('胜利！', '#4caf50');
  await sleep(50);
  await showFloatText(`经验 +${rewards.exp}`, '#ffeb3b');
  await sleep(50);
  await showFloatText(`银两 +${rewards.gold}`, '#ff9800');
  await sleep(50);
  await showFloatText(`阅历 +${rewards.expReward}`, '#9c27b0');
  await sleep(100);

  if (isVictory) {
    localStorage.setItem('pending_battle_rewards', JSON.stringify({
      exp: rewards.exp,
      gold: rewards.gold,
      expReward: rewards.expReward
    }));
  }

  setTimeout(() => {
    window.location.href = 'forest_map.html';
  }, 500);
}

function showFloatText(text, color) {
  return new Promise((resolve) => {
    const textDiv = document.createElement('div');
    textDiv.className = 'reward-text';
    textDiv.textContent = text;
    textDiv.style.color = color;
    textDiv.style.left = '50%';
    textDiv.style.top = '40%';
    textDiv.style.transform = 'translate(-50%, -50%)';
    
    document.querySelector('.battle-container').appendChild(textDiv);
    
    setTimeout(() => {
      textDiv.classList.add('show');
    }, 50);
    
    setTimeout(() => {
      textDiv.remove();
      resolve();
    }, 1200);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function toggleAutoBattle() {
  battleState.isAutoFighting = !battleState.isAutoFighting;
  const btn = document.getElementById('btnAuto');
  btn.textContent = battleState.isAutoFighting ? '停止战斗' : '自动战斗';
  
  if (battleState.isAutoFighting && !battleState.battleEnded) {
    runBattleLoop();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initBattle();
  }, 200);
  
  document.getElementById('btnAuto').addEventListener('click', toggleAutoBattle);
});
