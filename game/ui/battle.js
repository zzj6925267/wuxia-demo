/**
 * 战斗 UI 与队伍回合流程（多角色、自动战斗等）。
 *
 * 架构说明（长期维护）：
 * - `BattleEntry`：进入战斗的唯一推荐入口（阶段 1）。
 * - `BattleSettlement`：战后 pending 奖励队列键名（阶段 2）。
 * - `BattleHitRoll.js`：队伍战「命中/闪避/招架/暴击」唯一实现（阶段 3 之一）。
 * - `BattleSystem.js`：主菜单 `Game` 单敌回合；阶段 4 再决定是否收敛形态。
 * - **速度补段**：主序后 `runSpeedExtraActionsImmediatelyAfter`；「速补」气泡/日志仅用于该段，武学内追击（剑影等）保持原样。
 *
 * 全自动战斗的约定、奶位条件模板、多主动槽位顺序等扩展备忘：
 * @see ../docs/combat-autobattle-design.md
 */

// 战斗状态
let battleState = {
  allyTeam: [],       // 我方队伍
  enemyTeam: [],      // 敌方队伍
  turnOrder: [],      // 行动顺序
  currentTurnIndex: 0,
  /** 速度补刀等非主序行动时，底部血条 HUD 显示谁（主序用 turnOrder[currentTurnIndex]） */
  hudActorOverride: null,
  isAutoFighting: false,
  battleEnded: false,
  turnCount: 1,       // 回合数
  /** 战后返回的小地图页（在 initBattle 清空 BattleEntry 前根据 battle_entry_source 写入） */
  returnMapHref: 'forest_map.html',
  rewards: {
    exp: 0,
    gold: 0,
    expReward: 0,
    drops: []
  }
};

/** 防止 `runBattleLoop` 被重复启动（并发会导致重复结算、重复刷新 UI） */
let battleLoopRunning = false;

/** 队伍战立轴排布按「每侧至多 4 人」设计（常态 2～3），不面向 5+ 做侧栏滚动等扩展。 */
const BATTLE_PARTY_CAP_PER_SIDE = 4;

/**
 * 速度补刀：每名单位**主序行动刚结束**时立刻判定；相对「存活对位」最高速度每领先一档，多一次完整 `performAction`（再耗蓝、再走 D-3、可再判剑影等）。
 * 每档之间角色先回位再出下一刀（与 `useSkill` 末尾 `showAttackReturn` 一致）；敌对称；档位与上限仅作初值。
 * @see ../docs/combat-autobattle-design.md（D-5）
 */
const SPEED_EXTRA_ACTION_GAP = 36;
const SPEED_EXTRA_ACTION_MAX_TIERS = 2;

function mapBattleSourceToReturnHref(source) {
  if (!source) return 'forest_map.html';
  const table = {
    forest_map: 'forest_map.html',
    zhengyang_map: 'zhengyang_map.html',
    qingstone_map: 'qingstone_map.html'
  };
  return table[source] || 'forest_map.html';
}

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

/**
 * 战斗内按角色取合并武学表（实现见 martialArtsData.js → getMergedMartialArtsListForCharId）。
 */
function getBattleMergedMartialArtsList(charId) {
  if (typeof getMergedMartialArtsListForCharId === 'function') {
    return getMergedMartialArtsListForCharId(charId);
  }
  console.warn('getMergedMartialArtsListForCharId 未定义，武学合并回退为空');
  return [];
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

// 获取可用技能（数据驱动：当前装备的「武功」中唯一已解锁的「主动」+ 追击类被动）
function getAvailableSkills(actor) {
  const skills = [];
  try {
    const charId = actor && actor.id != null ? actor.id : 1;
    const martialList = getBattleMergedMartialArtsList(charId);
    if (!martialList || !martialList.length) {
      return skills;
    }

    let equippedMartial = null;
    for (const martial of martialList) {
      if (martial.equipped && martial.type === '武功' && martial.skills && martial.skills.length) {
        equippedMartial = martial;
        break;
      }
    }
    if (!equippedMartial) return skills;

    const martialLevel = equippedMartial.currentLevel || 1;
    const activeSkill = equippedMartial.skills.find(function (s) {
      return s && s.type === '主动' && martialLevel >= (s.unlockLevel || 1);
    });
    if (!activeSkill || !activeSkill.effect || activeSkill.effect.type !== 'damage') {
      return skills;
    }

    const eff = activeSkill.effect;
    const skillData = {
      name: activeSkill.name,
      mpCost: Math.max(1, Math.floor(Number(activeSkill.mpCost)) || 10),
      effect: {
        type: 'damage',
        value: eff.value,
        bonusAttr: eff.bonusAttr,
        bonusPerPoint: eff.bonusPerPoint
      }
    };
    if (activeSkill.plainFx) skillData.plainFx = true;
    if (activeSkill.punchFx) skillData.punchFx = true;
    if (activeSkill.bladeFx) skillData.bladeFx = true;

    // 正阳·阳刚：对当前武功主动伤害倍率 +value（与旧版直刺逻辑一致）
    for (const skill of equippedMartial.skills) {
      if (skill.type === '被动' && martialLevel >= (skill.unlockLevel || 1) && skill.name === '阳刚' && skill.effect && skill.effect.type === 'buff' && skill.effect.stat === 'attack') {
        skillData.effect.value += skill.effect.value || 0;
      }
    }

    // 最后一个已解锁的「追击」被动（剑影 / 连环 / 回风 等）
    let followSkill = null;
    for (const skill of equippedMartial.skills) {
      if (skill.type !== '被动' || !skill.effect || skill.effect.type !== 'followAttack') continue;
      if (martialLevel < (skill.unlockLevel || 99)) continue;
      followSkill = {
        type: 'followAttack',
        baseChance: skill.effect.baseChance,
        damage: skill.effect.damage,
        chanceAttr: skill.effect.chanceAttr,
        chancePerPoint: skill.effect.chancePerPoint,
        skillName: skill.name
      };
    }
    if (followSkill) skillData.followSkill = followSkill;

    skills.push(skillData);
  } catch (e) {
    console.warn('获取武学技能失败', e);
  }
  return skills;
}

// 正阳·阳刚：按角色各自装备的武功判定（勿用全局 playerMartialArts）
function getYangGangBonusForChar(charId) {
  let bonus = 1;
  try {
    const list = getBattleMergedMartialArtsList(charId);
    for (const martial of list) {
      if (martial.equipped && martial.type === '武功' && martial.skills) {
        const martialLevel = martial.currentLevel || 1;
        for (const skill of martial.skills) {
          if (skill.name === '阳刚' && martialLevel >= (skill.unlockLevel || 4)) {
            bonus = 1.1;
            console.log('角色', charId, '阳刚被动激活，攻击力×1.1');
            return bonus;
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
  if (typeof window.applyPlayerCharactersFromStorage === 'function') {
    window.applyPlayerCharactersFromStorage();
  }
  const maleAvatar = '../assets/shaoxia.png';
  const femaleAvatar = '../assets/suyao.png';
  const yangGangBonus1 = getYangGangBonusForChar(1);
  const yangGangBonus2 = getYangGangBonusForChar(2);
  
  console.log('=== battle.js 检查角色系统 ===');
  console.log('typeof window.characters:', typeof window.characters);
  console.log('window.characters?.length:', window.characters?.length);
  console.log('阳刚加成(少侠/苏瑶):', yangGangBonus1, yangGangBonus2);
  
  if (typeof window.characters !== 'undefined' && window.characters.length >= 2) {
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
    
    // 获取武学基础加成
    const char1MartialAttack = getMartialBonusForChar(window.characters[0], 'attack');
    const char1MartialSpeed = getMartialBonusForChar(window.characters[0], 'speed');
    const char1MartialDodge = getMartialBonusForChar(window.characters[0], 'dodge');
    
    const char2MartialAttack = getMartialBonusForChar(window.characters[1], 'attack');
    const char2MartialSpeed = getMartialBonusForChar(window.characters[1], 'speed');
    const char2MartialDodge = getMartialBonusForChar(window.characters[1], 'dodge');
    
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
        attack: Math.floor((50 + window.characters[0].stats.strength * 3) * yangGangBonus1) + char1MartialAttack + char1InnerBonuses.attackBonus, 
        defense: (window.characters[0].stats.defense || 50) + char1InnerBonuses.defenseBonus, 
        speed: 50 + window.characters[0].stats.agility * 2 + char1MartialSpeed + char1InnerBonuses.speedBonus,
        hit: 70 + window.characters[0].stats.agility, 
        dodge: 20 + Math.floor(window.characters[0].stats.agility * 0.5) + char1MartialDodge + char1InnerBonuses.dodgeBonus, 
        parry: (window.characters[0].stats.parry || 20) + (char1InnerBonuses.parryBonus || 0),
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
        attack: Math.floor((50 + window.characters[1].stats.strength * 3) * yangGangBonus2) + char2MartialAttack + char2InnerBonuses.attackBonus, 
        defense: (window.characters[1].stats.defense || 50) + char2InnerBonuses.defenseBonus, 
        speed: 50 + window.characters[1].stats.agility * 2 + char2MartialSpeed + char2InnerBonuses.speedBonus,
        hit: 70 + window.characters[1].stats.agility, 
        dodge: 20 + Math.floor(window.characters[1].stats.agility * 0.5) + char2MartialDodge + char2InnerBonuses.dodgeBonus, 
        parry: (window.characters[1].stats.parry || 20) + (char2InnerBonuses.parryBonus || 0),
        stats: window.characters[1].stats
      }
    ];
  }
  
  // 备用：从 localStorage 读取
  const savedChars = localStorage.getItem('playerCharacters');
  if (savedChars) {
    try {
      const chars = JSON.parse(savedChars);
        chars.forEach((c, i) => {
          if (c && (c.id == null || c.id === '')) c.id = i + 1;
        });
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

        const b1Atk = getMartialBonusForChar(chars[0], 'attack');
        const b1Spd = getMartialBonusForChar(chars[0], 'speed');
        const b1Dod = getMartialBonusForChar(chars[0], 'dodge');
        const b2Atk = getMartialBonusForChar(chars[1], 'attack');
        const b2Spd = getMartialBonusForChar(chars[1], 'speed');
        const b2Dod = getMartialBonusForChar(chars[1], 'dodge');
        
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
            attack: Math.floor((50 + char1Str * 3) * yangGangBonus1) + b1Atk + char1InnerBonuses.attackBonus, 
            defense: (chars[0].stats.defense || 50) + char1InnerBonuses.defenseBonus, 
            speed: 50 + char1Agi * 2 + b1Spd + char1InnerBonuses.speedBonus,
            hit: 70 + char1Agi, 
            dodge: 20 + Math.floor(char1Agi * 0.5) + b1Dod + char1InnerBonuses.dodgeBonus, 
            parry: (chars[0].stats.parry || 20) + (char1InnerBonuses.parryBonus || 0),
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
            attack: Math.floor((50 + char2Str * 3) * yangGangBonus2) + b2Atk + char2InnerBonuses.attackBonus, 
            defense: (chars[1].stats.defense || 50) + char2InnerBonuses.defenseBonus, 
            speed: 50 + char2Agi * 2 + b2Spd + char2InnerBonuses.speedBonus,
            hit: 70 + char2Agi, 
            dodge: 20 + Math.floor(char2Agi * 0.5) + b2Dod + char2InnerBonuses.dodgeBonus, 
            parry: (chars[1].stats.parry || 20) + (char2InnerBonuses.parryBonus || 0),
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
      { id: 1, name: '少侠', avatar: maleAvatar, level: 10, hp: 250, maxHp: 250, mp: 120, maxMp: 120, attack: Math.floor(80 * yangGangBonus1), defense: 52, speed: 72, hit: 80, dodge: 45, parry: 38, stats: { strength: 10, agility: 10, bone: 10, qi: 10, mp: 120, maxMp: 120 }, equipped: {} },
      { id: 2, name: char2Data?.name || '苏瑶', avatar: femaleAvatar, level: char2Data?.level || 12, hp: char2Hp, maxHp: char2Hp, mp: char2Mp, maxMp: char2Mp, attack: Math.floor(80 * yangGangBonus2), defense: 45, speed: 72, hit: 80, dodge: 45, parry: 28, stats: char2Data?.stats || { strength: 10, agility: 10, bone: 10, qi: 10, mp: char2Mp, maxMp: char2Mp }, equipped: char2Data?.equipped || {} }
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
    const attack = Math.floor((50 + stats.strength * 3) * yangGangBonus1);
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
    const char2Attack = Math.floor((50 + char2Str * 3) * yangGangBonus2);
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
      { id: 1, name: '少侠', avatar: maleAvatar, level: 10, hp: 250, maxHp: 250, mp: fallbackMp1, maxMp: fallbackMp1, attack: Math.floor(80 * yangGangBonus1), defense: 52, speed: 72, hit: 80, dodge: 45, parry: 38, stats: { strength: 10, agility: 10, bone: 10, qi: 10 }, equipped: {} },
      { id: 2, name: char2Data?.name || '苏瑶', avatar: femaleAvatar, level: char2Level, hp: fallbackHp2, maxHp: fallbackHp2, mp: fallbackMp2, maxMp: fallbackMp2, attack: Math.floor((50 + char2Str * 3) * yangGangBonus2), defense: 45, speed: 50 + char2Agi * 2, hit: 70 + char2Agi, dodge: 20 + Math.floor(char2Agi * 0.5), parry: 28, stats: { strength: char2Str, agility: char2Agi, bone: char2Bone, qi: char2Qi }, equipped: char2Data?.equipped || {} }
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
  
  const enemyId = window.BattleEntry
    ? window.BattleEntry.peekEnemyId()
    : localStorage.getItem('battleEnemyId');

  const sourceKey = window.BattleEntry && window.BattleEntry.KEYS && window.BattleEntry.KEYS.source;
  const entrySource = sourceKey ? localStorage.getItem(sourceKey) : null;
  battleState.returnMapHref = mapBattleSourceToReturnHref(entrySource);

  let enemy = ENEMIES.shanze_louluo_1;
  if (enemyId && ENEMIES[enemyId]) {
    enemy = ENEMIES[enemyId];
  }

  if (window.BattleEntry) {
    window.BattleEntry.clearEnemyLaunchContext();
  } else {
    localStorage.removeItem('battleEnemyId');
  }

  let alliesForBattle = currentPlayerCharacters;
  if (alliesForBattle.length > BATTLE_PARTY_CAP_PER_SIDE) {
    console.warn(
      `initBattle: 我方 ${alliesForBattle.length} 人超过设计上限 ${BATTLE_PARTY_CAP_PER_SIDE}，已取前 ${BATTLE_PARTY_CAP_PER_SIDE} 人参战。`
    );
    alliesForBattle = alliesForBattle.slice(0, BATTLE_PARTY_CAP_PER_SIDE);
  }

  battleState.allyTeam = alliesForBattle.map(char => ({
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
  battleState.hudActorOverride = null;
  battleState.battleEnded = false;
  battleState.turnCount = 1;

  clearBattleLog();
  battleLoopRunning = false;
  renderTeams();
  updateTurnDisplay();
  addBattleLog('战斗开始！');
  addBattleLog('──────── 第 1 回合 ────────', { round: true });
  // 第一回合不回血，从第二回合开始
}

function calculateTurnOrder() {
  battleState.turnOrder.sort((a, b) => b.speed - a.speed);
}

/** 对位阵营（敌看我方、我看敌方）存活单位中的最高速度；全灭或未开战时 0。 */
function getOpposingTeamMaxSpeed(actor) {
  const opposing = actor.isAlly ? battleState.enemyTeam : battleState.allyTeam;
  let maxS = 0;
  for (const c of opposing) {
    if (!c || c.isDead) continue;
    const s = Number(c.speed) || 0;
    if (s > maxS) maxS = s;
  }
  return maxS;
}

/**
 * 紧随 `actor` 的主序行动：按速度优势插入至多两档补段，每档一次完整 `performAction`（出位→出招/连招→回位）。
 * 表现：仅本路径传入 `presentation: 'speedExtra'`，气泡/日志走「速补」样式；武学内连招（如剑影）仍在 `useSkill` 内、不传该标记。
 */
async function runSpeedExtraActionsImmediatelyAfter(actor) {
  if (!actor || actor.isDead || battleState.battleEnded) return;
  for (let tier = 1; tier <= SPEED_EXTRA_ACTION_MAX_TIERS; tier++) {
    if (battleState.battleEnded || actor.isDead) return;
    const needLead = SPEED_EXTRA_ACTION_GAP * tier;
    const lead = (Number(actor.speed) || 0) - getOpposingTeamMaxSpeed(actor);
    if (lead < needLead) break;
    const opposing = actor.isAlly ? battleState.enemyTeam : battleState.allyTeam;
    if (!opposing.some(c => c && !c.isDead)) return;
    const tag =
      tier === 1 ? '身法占优，借势再出一招！' : '步法如电，再进一动！';
    addBattleLogMaybeSpeed(`${actor.name} ${tag}`, true);
    battleState.hudActorOverride = actor;
    updateActiveHighlight(actor);
    await performAction(actor, { presentation: 'speedExtra' });
    battleState.hudActorOverride = null;
    if (checkBattleEnd()) {
      // 不在此重复 renderTeams：`runBattleLoop` 下一处 `checkBattleEnd` 会统一刷新，避免整卡重建两次导致头像连闪
      return;
    }
    await sleep(400);
  }
}

function renderTeams() {
  const allyContainer = document.getElementById('teamAlly');
  const enemyContainer = document.getElementById('teamEnemy');

  allyContainer.innerHTML = battleState.allyTeam.map(char => renderCharacterCard(char)).join('');
  enemyContainer.innerHTML = battleState.enemyTeam.map(char => renderCharacterCard(char)).join('');
  updateActorBarsHud();
}

/**
 * 战斗进行中/结束时就地更新立轴卡片（血、死、高亮），**不**整段替换 innerHTML，避免头像 img 反复卸载/重载造成连闪。
 * 若缺少卡片节点则回退为 `renderTeams()`。
 */
function syncBattlePartyDomInPlace() {
  const all = [...battleState.allyTeam, ...battleState.enemyTeam];
  for (const char of all) {
    if (!char || char.id == null) continue;
    const card = document.getElementById(`char-${char.id}`);
    if (!card) {
      renderTeams();
      return;
    }
    const wantActive =
      !battleState.battleEnded &&
      battleState.turnOrder[battleState.currentTurnIndex] === char;
    card.classList.toggle('active', !!wantActive);
    card.classList.toggle('dead', !!char.isDead);
    const hpEl = card.querySelector('.hp-text');
    if (hpEl) hpEl.textContent = String(char.hp != null ? char.hp : '');
    const mpEl = card.querySelector('.mp-text');
    if (mpEl && char.mp !== undefined) mpEl.textContent = String(char.mp);
  }
  updateActorBarsHud();
}

function renderCharacterCard(char) {
  const isActive =
    !battleState.battleEnded &&
    battleState.turnOrder[battleState.currentTurnIndex] === char;
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
      ${char.mp !== undefined ? `<div class="mp-text" title="内力">${char.mp}</div>` : ''}
    </div>
  `;
}

function handleAvatarError(img, fallbackIcon) {
  img.style.display = 'none';
  const container = img.parentElement;
  container.innerHTML = `<div class="character-avatar-emoji">${fallbackIcon}</div>`;
}

const BATTLE_LOG_MAX_LINES = 150;

function clearBattleLog() {
  const container = document.getElementById('battleLogEntries');
  if (!container) return;
  container.innerHTML = '';
}

/** 追加一行战斗日志（可滚动，自动卷到底） */
function addBattleLog(text, options = {}) {
  const container = document.getElementById('battleLogEntries');
  if (!container || text == null || text === '') return;

  const line = document.createElement('div');
  line.className =
    'battle-log-line' +
    (options.round ? ' is-round' : '') +
    (options.speedExtra ? ' is-speed-extra' : '');
  line.textContent = text;
  container.appendChild(line);

  while (container.children.length > BATTLE_LOG_MAX_LINES) {
    container.removeChild(container.firstChild);
  }

  requestAnimationFrame(() => {
    container.scrollTop = container.scrollHeight;
  });
}

/** 速度补段专用日志前缀与样式；技能内连招/追击不走此套（见 `presentation: 'speedExtra'`）。 */
function addBattleLogMaybeSpeed(text, isSpeedExtra) {
  addBattleLog(isSpeedExtra ? `【速补】${text}` : text, isSpeedExtra ? { speedExtra: true } : {});
}

// 更新回合显示
function updateTurnDisplay() {
  const display = document.getElementById('turnDisplay');
  if (display) {
    display.textContent = `第 ${battleState.turnCount}/99 回合`;
  }
}

/** 底部面板：当前行动者的真实气血/内力条（与立轴背景图里的装饰条区分） */
function updateActorBarsHud() {
  const hud = document.getElementById('actorBarsHud');
  if (!hud || !battleState.turnOrder || battleState.turnOrder.length === 0) return;

  const char =
    battleState.hudActorOverride != null
      ? battleState.hudActorOverride
      : battleState.turnOrder[battleState.currentTurnIndex];
  if (!char) {
    hud.style.visibility = 'hidden';
    return;
  }
  hud.style.visibility = 'visible';

  const titleEl = document.getElementById('actorBarsTitle');
  const hpFill = document.getElementById('actorBarHpFill');
  const hpNums = document.getElementById('actorBarHpNums');
  const hpTrack = document.getElementById('actorBarHpTrack');
  const mpRow = document.getElementById('actorBarMpRow');
  const mpFill = document.getElementById('actorBarMpFill');
  const mpNums = document.getElementById('actorBarMpNums');
  const mpTrack = document.getElementById('actorBarMpTrack');
  if (!titleEl || !hpFill || !hpNums || !mpRow || !mpFill || !mpNums) return;

  titleEl.textContent = `${char.name} · 行动中`;

  const maxHp = Math.max(1, char.maxHp != null ? char.maxHp : (char.hp != null ? char.hp : 1));
  const curHp = Math.max(0, char.hp != null ? char.hp : 0);
  const hRatio = Math.max(0, Math.min(1, curHp / maxHp));
  hpFill.style.width = `${hRatio * 100}%`;
  hpNums.textContent = `${curHp} / ${maxHp}`;
  if (hpTrack) {
    hpTrack.setAttribute('aria-valuenow', String(Math.round(hRatio * 100)));
    hpTrack.setAttribute('aria-valuetext', `${curHp} / ${maxHp}`);
  }

  const hasMp = char.maxMp != null && char.mp != null;
  if (hasMp) {
    mpRow.style.display = 'flex';
    const curMp = Math.max(0, Math.floor(Number(char.mp)) || 0);
    if (mpTrack) mpTrack.style.display = 'none';
    if (mpFill) mpFill.style.display = 'none';
    mpNums.textContent = String(curMp);
  } else {
    mpRow.style.display = 'none';
    if (mpTrack) mpTrack.style.display = '';
    if (mpFill) mpFill.style.display = '';
  }
}

// 显示技能气泡（`bubbleOpts.variant === 'speedExtra'` 为速度补段专用样式；技能内追击等勿传此参）
function showSkillBubble(charId, skillName, bubbleOpts) {
  const card = document.getElementById(`char-${charId}`);
  if (card) {
    const bubble = document.createElement('div');
    const speed = bubbleOpts && bubbleOpts.variant === 'speedExtra';
    bubble.className = 'skill-bubble' + (speed ? ' skill-bubble--speed-extra' : '');
    bubble.textContent = skillName;
    card.appendChild(bubble);
    setTimeout(() => bubble.classList.add('show'), 10);
    setTimeout(() => {
      bubble.remove();
    }, 700);
  }
}

// 显示剑气特效（仅剑光轨迹；受击反馈请用 showMeleeHitFeedback）
function showSwordEffect(actor, target, effectType) {
  const container = document.querySelector('.battle-container');
  if (!container) return;
  
  const actorCard = document.getElementById(`char-${actor.id}`);
  const targetCard = document.getElementById(`char-${target.id}`);
  if (!actorCard || !targetCard) return;
  
  const containerRect = container.getBoundingClientRect();
  
  if (effectType === 'thrust' || effectType === 'plain') {
    const targetRect = targetCard.getBoundingClientRect();
    const effect = document.createElement('div');
    effect.className = effectType === 'plain' ? 'sword-effect-plain' : 'sword-effect-thrust';
    
    const targetX = targetRect.left + targetRect.width / 2 - containerRect.left;
    const targetY = targetRect.top + targetRect.height / 2 - containerRect.top;
    
    const actorRect = actorCard.getBoundingClientRect();
    const startX = actorRect.left + actorRect.width / 2 - containerRect.left;
    const startY = actorRect.top + actorRect.height / 2 - containerRect.top;
    const angle = Math.atan2(targetY - startY, targetX - startX) * 180 / Math.PI;
    
    const halfLen = effectType === 'plain' ? 70 : 100;
    const barW = effectType === 'plain' ? 140 : 200;
    effect.style.left = `${targetX - halfLen}px`;
    effect.style.top = `${targetY - 4}px`;
    effect.style.width = `${barW}px`;
    effect.style.transform = `rotate(${angle}deg)`;
    effect.style.transformOrigin = 'center center';
    
    container.appendChild(effect);
    
    setTimeout(() => {
      effect.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      effect.remove();
    }, effectType === 'plain' ? 380 : 500);
  } else if (effectType === 'shadow') {
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
  }
}

/** 朴素拳击命中：中心爆闪 + 短放射线（非剑光条） */
function showPunchImpactEffect(actor, target) {
  const container = document.querySelector('.battle-container');
  if (!container) return;

  const targetCard = document.getElementById(`char-${target.id}`);
  if (!targetCard) return;

  const containerRect = container.getBoundingClientRect();
  const targetRect = targetCard.getBoundingClientRect();
  const targetX = targetRect.left + targetRect.width / 2 - containerRect.left;
  const targetY = targetRect.top + targetRect.height * 0.4 - containerRect.top;

  const root = document.createElement('div');
  root.className = 'punch-impact-root';
  root.setAttribute('aria-hidden', 'true');
  root.style.left = `${targetX}px`;
  root.style.top = `${targetY}px`;

  const core = document.createElement('div');
  core.className = 'punch-impact-core';
  root.appendChild(core);

  const rayCount = 10;
  for (let i = 0; i < rayCount; i++) {
    const ray = document.createElement('div');
    ray.className = 'punch-impact-ray';
    ray.style.setProperty('--punch-ray-rot', `${(360 / rayCount) * i}deg`);
    root.appendChild(ray);
  }

  container.appendChild(root);
  requestAnimationFrame(() => {
    root.classList.add('show');
  });
  setTimeout(() => {
    root.remove();
  }, 420);
}

/** 刀招：冷色刃风 + 细刃脊掠过头像（与拳的放射爆区分） */
function showBladeChopEffect(actor, target) {
  const card = document.getElementById(`char-${target.id}`);
  if (!card) return;
  const holder = card.querySelector('.character-avatar-container');
  if (!holder) return;
  if (getComputedStyle(holder).position === 'static') {
    holder.style.position = 'relative';
  }
  const layer = document.createElement('div');
  layer.className = 'blade-cut-layer';
  layer.setAttribute('aria-hidden', 'true');
  const wind = document.createElement('div');
  wind.className = 'blade-cut-wind';
  const spine = document.createElement('div');
  spine.className = 'blade-cut-spine';
  const glint = document.createElement('div');
  glint.className = 'blade-cut-glint';
  layer.appendChild(wind);
  layer.appendChild(spine);
  layer.appendChild(glint);
  holder.appendChild(layer);
  requestAnimationFrame(() => layer.classList.add('show'));
  setTimeout(() => {
    layer.remove();
  }, 460);
}

/** 极轻全屏抖一下，强化拳落点体感 */
function showScreenJolt() {
  const el = document.querySelector('.battle-container');
  if (!el) return;
  el.classList.add('screen-jolt');
  setTimeout(() => el.classList.remove('screen-jolt'), 220);
}

/** 命中瞬间：头像闪光 + 卡片震动（通用近战反馈） */
function showHitImpactFlash(target, opts) {
  const card = document.getElementById(`char-${target.id}`);
  if (!card) return;
  const holder = card.querySelector('.character-avatar-container') || card;
  if (getComputedStyle(holder).position === 'static') {
    holder.style.position = 'relative';
  }
  const flash = document.createElement('div');
  flash.className =
    opts && opts.bladeImpact ? 'hit-impact-overlay hit-impact-blade' : 'hit-impact-overlay';
  flash.setAttribute('aria-hidden', 'true');
  holder.appendChild(flash);
  setTimeout(() => {
    flash.remove();
  }, 320);
}

function showMeleeHitFeedback(target, opts) {
  showHitImpactFlash(target, opts);
  showHitShake(target, opts);
}

// 显示受击震动（opts.strong：拳类等更重一档）
function showHitShake(target, opts) {
  const card = document.getElementById(`char-${target.id}`);
  if (card) {
    card.classList.add('hit');
    if (opts && opts.strong) card.classList.add('hit-strong');
    const ms = opts && opts.strong ? 380 : 300;
    setTimeout(() => {
      card.classList.remove('hit');
      card.classList.remove('hit-strong');
    }, ms);
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

// 获取武学技能被动属性加成（包括内功、轻功等所有武学类型）
function getInnerSkillPassiveBonuses(char) {
  let defenseBonus = 0;
  let maxHpBonus = 0;
  let attackBonus = 0;
  let dodgeBonus = 0;
  let speedBonus = 0;
  let parryBonus = 0;

  const stats = char && char.stats ? char.stats : {};
  const charId = char && char.id != null ? char.id : 1;

  try {
    const martialList = getBattleMergedMartialArtsList(charId);
    for (const martial of martialList) {
      if (!martial.equipped || !martial.skills) continue;
          console.log(`处理武学: ${martial.name} (${martial.type}), 等级: ${martial.currentLevel}`);
          
          for (const skill of martial.skills) {
            const unlockLevel = skill.unlockLevel || 1;
            if (martial.currentLevel < unlockLevel) {
              console.log(`技能 ${skill.name} 未解锁 (需要${unlockLevel}级，当前${martial.currentLevel}级)`);
              continue;
            }

            const effect = skill.effect;
            if (!effect) continue;

            // 根据效果类型处理加成
            switch (effect.type) {
              case 'defenseBuff': {
                const defStat = effect.stat;
                if (defStat === 'defense' || defStat === undefined || defStat === null) {
                  let bonus = effect.baseValue || 0;
                  if (effect.bonusAttr) {
                    bonus += (stats[effect.bonusAttr] || 0) * (effect.bonusPerPoint || 0);
                  }
                  defenseBonus += Math.ceil(bonus);
                  console.log(`${martial.name}-${skill.name} 生效: 防御+${Math.ceil(bonus)}`);
                }
                break;
              }

              case 'maxHpBuff':
                if (!effect.stat || effect.stat === 'hp' || effect.stat === 'maxHp') {
                  let bonus = effect.baseValue || 0;
                  if (effect.bonusAttr) {
                    bonus += (stats[effect.bonusAttr] || 0) * (effect.bonusPerPoint || 0);
                  }
                  maxHpBonus += Math.ceil(bonus);
                  console.log(`${martial.name}-${skill.name} 生效: 气血+${Math.ceil(bonus)}`);
                }
                break;

              case 'buff':
                if (effect.stat === 'attack') {
                  let add = 0;
                  if (effect.baseValue != null && effect.value == null) {
                    let bonus = effect.baseValue || 0;
                    if (effect.bonusAttr) {
                      bonus += (stats[effect.bonusAttr] || 0) * (effect.bonusPerPoint || 0);
                    }
                    add = Math.ceil(bonus);
                  } else if (typeof effect.value === 'number') {
                    const str = stats.strength || 0;
                    const baseAtk = 50 + str * 3;
                    let frac = effect.value;
                    if (effect.bonusAttr && effect.bonusPerPoint != null) {
                      frac += (stats[effect.bonusAttr] || 0) * effect.bonusPerPoint;
                    }
                    add = Math.floor(baseAtk * frac);
                  } else {
                    let bonus = effect.baseValue || 0;
                    if (effect.bonusAttr) {
                      bonus += (stats[effect.bonusAttr] || 0) * (effect.bonusPerPoint || 0);
                    }
                    add = Math.ceil(bonus);
                  }
                  attackBonus += add;
                  console.log(`${martial.name}-${skill.name} 生效: 攻击+${add}`);
                } else if (effect.stat === 'dodge') {
                  let bonus = effect.baseValue || 0;
                  if (effect.bonusAttr) {
                    bonus += (stats[effect.bonusAttr] || 0) * (effect.bonusPerPoint || 0);
                  }
                  dodgeBonus += Math.ceil(bonus);
                  console.log(`${martial.name}-${skill.name} 生效: 闪避+${Math.ceil(bonus)}`);
                } else if (effect.stat === 'speed') {
                  let bonus = effect.baseValue || 0;
                  if (effect.bonusAttr) {
                    bonus += (stats[effect.bonusAttr] || 0) * (effect.bonusPerPoint || 0);
                  }
                  speedBonus += Math.ceil(bonus);
                  console.log(`${martial.name}-${skill.name} 生效: 速度+${Math.ceil(bonus)}`);
                } else if (effect.stat === 'parry') {
                  let bonus = effect.baseValue || 0;
                  if (effect.bonusAttr) {
                    bonus += (stats[effect.bonusAttr] || 0) * (effect.bonusPerPoint || 0);
                  }
                  parryBonus += Math.ceil(bonus);
                  console.log(`${martial.name}-${skill.name} 生效: 招架+${Math.ceil(bonus)}`);
                }
                break;
            }
          }
    }
    console.log(`最终武学加成: 防御+${defenseBonus}, 气血+${maxHpBonus}, 攻击+${attackBonus}, 闪避+${dodgeBonus}, 速度+${speedBonus}, 招架+${parryBonus}`);
  } catch (e) {
    console.warn('获取武学技能加成失败:', e);
  }

  return { defenseBonus, maxHpBonus, attackBonus, dodgeBonus, speedBonus, parryBonus };
}

// 计算内功自动回血量
function calculateInnerSkillHeal(char) {
  let healAmount = 0;

  try {
    console.log('=== 开始计算内功回血 ===');

    const charId = char.id || 1;
    const martialArtsData = getBattleMergedMartialArtsList(charId);
    console.log('武学数据:', martialArtsData);

    for (const martial of martialArtsData) {
      if (martial.equipped && martial.type === '内功' && martial.skills) {
        console.log('装备的内功:', martial.name, '等级:', martial.currentLevel);
        console.log('技能数组:', martial.skills);

        for (const skill of martial.skills) {
          console.log('技能:', skill.name, '解锁等级:', skill.unlockLevel);
          if (martial.currentLevel < (skill.unlockLevel || 99)) continue;
          const effect = skill.effect;
          if (effect && effect.type === 'autoHeal') {
            const base = effect.baseValue || 5;
            const levelBonus = martial.currentLevel * (effect.levelMultiplier || 3);
            const qiBonus = (char.stats && char.stats.qi) || 0;
            const qiPart = qiBonus * (effect.bonusPerPoint || 0.8);
            const h = Math.floor(base + levelBonus + qiPart);
            healAmount += h;
            console.log(`${martial.name}-${skill.name}(${martial.currentLevel}级) 回血段: +${h}`);
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
      addBattleLog(
        typeof BattleNarrative !== 'undefined'
          ? BattleNarrative.innerHeal(char, actualHeal)
          : `${char.name} 内功调息，恢复 ${actualHeal} 点生命！`
      );
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
        mpElement.style.color = '#90caf9';
        mpElement.style.transform = 'scale(1)';
      }, 300);
    }
  }
  updateActorBarsHud();
}

// 检查剑影等追击（若 `fxOpts.presentation === 'speedExtra'`，气泡/日志与当次速补段统一）
async function checkFollowAttack(actor, target, followSkill, fxOpts) {
  if (!actor.stats) return;

  const speedExtra = fxOpts && fxOpts.presentation === 'speedExtra';
  
  const agility = actor.stats.agility || 0;
  const chance = followSkill.baseChance + agility * followSkill.chancePerPoint;
  
  if (Math.random() < chance) {
    const followLabel = followSkill.skillName || '追击';
    showSkillBubble(
      actor.id,
      speedExtra ? `速补 · ${followLabel}` : followLabel,
      speedExtra ? { variant: 'speedExtra' } : undefined
    );
    await sleep(400);

    showSwordEffect(actor, target, 'shadow');

    const damage = Math.floor(actor.attack * followSkill.damage);
    showDamageNumber(target.id, -damage, false);
    target.hp = Math.max(0, target.hp - damage);
    showMeleeHitFeedback(target);
    addBattleLogMaybeSpeed(
      typeof BattleNarrative !== 'undefined'
        ? BattleNarrative.followAttack(actor, target, damage)
        : `${actor.name} 触发${followLabel}，额外造成 ${damage} 点伤害！`,
      speedExtra
    );
    
    if (target.hp <= 0) {
      target.isDead = true;
      target.hp = 0;
    }
    
    updateHpDisplay(target.id, target.hp);
    await sleep(300);
  }
}

// 使用技能（`fxOpts.presentation === 'speedExtra'`：气泡/日志走速补样式；**本段不扣内力**以便与主序同规格一次出手含追击判定；追击见 `checkFollowAttack` 并传入 `fxOpts`）
async function useSkill(actor, skill, target, fxOpts) {
  const speedPres = fxOpts && fxOpts.presentation === 'speedExtra';
  const mpc = Math.max(0, Math.floor(Number(skill.mpCost)));
  const cost = mpc > 0 ? mpc : 10;
  const curMp = Math.floor(Number(actor.mp));
  if (!speedPres) {
    actor.mp = Math.max(0, (Number.isFinite(curMp) ? curMp : 0) - cost);
  }
  updateMpDisplay(actor.id, actor.mp, false);
  
  // 1. 角色移动到中间
  await showAttackMove(actor);
  
  // 2. 显示技能气泡
  showSkillBubble(
    actor.id,
    speedPres ? `速补 · ${skill.name}` : skill.name,
    speedPres ? { variant: 'speedExtra' } : undefined
  );
  await sleep(400);
  
  // 3. 造成伤害
  if (skill.effect.type === 'damage') {
    let multiplier = skill.effect.value;
    if (skill.effect.bonusAttr && actor.stats && typeof skill.effect.bonusPerPoint === 'number') {
      const attr = skill.effect.bonusAttr;
      multiplier += (actor.stats[attr] || 0) * skill.effect.bonusPerPoint;
    }

    if (skill.bladeFx) {
      showBladeChopEffect(actor, target);
    } else if (skill.punchFx) {
      showPunchImpactEffect(actor, target);
    } else if (skill.plainFx) {
      showSwordEffect(actor, target, 'plain');
    } else {
      showSwordEffect(actor, target, 'thrust');
    }

    const damage = Math.floor(actor.attack * multiplier);
    showDamageNumber(target.id, -damage);
    target.hp = Math.max(0, target.hp - damage);
    if (skill.punchFx || skill.bladeFx) showScreenJolt();
    showMeleeHitFeedback(
      target,
      skill.punchFx || skill.bladeFx
        ? { strong: true, bladeImpact: !!skill.bladeFx }
        : undefined
    );
    const dmgMsg =
      typeof BattleNarrative !== 'undefined'
        ? BattleNarrative.skillUse(actor, skill, target, damage)
        : `${actor.name} 使用 ${skill.name}，造成 ${damage} 点伤害！`;
    addBattleLogMaybeSpeed(dmgMsg, !!(fxOpts && fxOpts.presentation === 'speedExtra'));
    await sleep(300);
    
    // 4. 检查剑影连击（角色还在中间；速补段时追击气泡/日志与主招一致）
    if (skill.followSkill) {
      await checkFollowAttack(actor, target, skill.followSkill, fxOpts);
    }
  }
  
  if (target.hp <= 0) {
    target.isDead = true;
    target.hp = 0;
    addBattleLogMaybeSpeed(
      typeof BattleNarrative !== 'undefined'
        ? BattleNarrative.defeated(target.name)
        : `${target.name} 被击败！`,
      !!speedPres
    );

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
  if (battleLoopRunning) return;
  battleLoopRunning = true;
  try {
    while (!battleState.battleEnded) {
    const currentChar = battleState.turnOrder[battleState.currentTurnIndex];

    if (!currentChar.isDead) {
      await performAction(currentChar);
    }

    if (checkBattleEnd()) {
      syncBattlePartyDomInPlace();
      await sleep(500);
      break;
    }

    if (!currentChar.isDead && !battleState.battleEnded) {
      battleState.hudActorOverride = null;
      await runSpeedExtraActionsImmediatelyAfter(currentChar);
    }

    if (checkBattleEnd()) {
      syncBattlePartyDomInPlace();
      await sleep(500);
      break;
    }

    battleState.currentTurnIndex++;
    if (battleState.currentTurnIndex >= battleState.turnOrder.length) {
      battleState.hudActorOverride = null;
      battleState.currentTurnIndex = 0;
      battleState.turnCount++;
      if (battleState.turnCount > 99) battleState.turnCount = 99;
      updateTurnDisplay();
      calculateTurnOrder();
      addBattleLog(`──────── 第 ${battleState.turnCount} 回合 ────────`, { round: true });

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
  } finally {
    battleLoopRunning = false;
  }
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

async function performAction(actor, actionOpts) {
  const isSpeedExtra = actionOpts && actionOpts.presentation === 'speedExtra';
  const fxOpts = isSpeedExtra ? { presentation: 'speedExtra' } : undefined;

  const targetTeam = actor.isAlly ? battleState.enemyTeam : battleState.allyTeam;
  const aliveTargets = targetTeam.filter(char => !char.isDead);
  
  if (aliveTargets.length === 0) return;

  const target = aliveTargets[0];

    if (actor.isAlly) {
      // 我方角色使用技能（内力不在行动前回复，避免「刚扣又涨」看不出耗蓝；回内见回合开始处）
      const skills = getAvailableSkills(actor);
      let usedSkill = false;
    
    for (const skill of skills) {
      if (isSpeedExtra || actor.mp >= skill.mpCost) {
        await useSkill(actor, skill, target, fxOpts);
        usedSkill = true;
        break;
      }
    }
    
    if (!usedSkill) {
      // 没有内力，普通攻击
      await showAttackMove(actor);
      showSkillBubble(
        actor.id,
        isSpeedExtra ? '速补 · 攻击' : '攻击',
        isSpeedExtra ? { variant: 'speedExtra' } : undefined
      );
      await sleep(400);

      showSwordEffect(actor, target, 'plain');
      
      const damage = Math.floor(actor.attack * 0.6);
      showDamageNumber(target.id, -damage);
      target.hp = Math.max(0, target.hp - damage);
      showMeleeHitFeedback(target);
      addBattleLogMaybeSpeed(
        typeof BattleNarrative !== 'undefined'
          ? BattleNarrative.allyPlainAttack(actor, target, damage)
          : `${actor.name} 普通攻击 ${target.name}，造成 ${damage} 点伤害！`,
        isSpeedExtra
      );
      
      if (target.hp <= 0) {
        target.isDead = true;
        target.hp = 0;
        addBattleLogMaybeSpeed(
          typeof BattleNarrative !== 'undefined'
            ? BattleNarrative.defeated(target.name)
            : `${target.name} 被击败！`,
          isSpeedExtra
        );
        
        const targetCard = document.getElementById(`char-${target.id}`);
        if (targetCard) {
          targetCard.classList.add('dead');
        }
      }
      
      updateHpDisplay(target.id, target.hp);
      
      await sleep(300);
      await showAttackReturn(actor);
    }
  } else {
    // 敌人回合
    await showAttackMove(actor);
    showSkillBubble(
      actor.id,
      isSpeedExtra ? '速补 · 攻击' : '攻击',
      isSpeedExtra ? { variant: 'speedExtra' } : undefined
    );
    await sleep(400);
    
    const result = window.BattleHitRoll.resolveDamage(actor, target);
    
    if (result.isDodge) {
      showBattleText(target.id, '闪避', 'miss');
      await showDodgeAnimation(target);
      addBattleLogMaybeSpeed(
        typeof BattleNarrative !== 'undefined'
          ? BattleNarrative.dodge(actor, target)
          : `${actor.name} 攻击 ${target.name}，但被闪避了！`,
        isSpeedExtra
      );
    } else if (result.isParry) {
      showSwordEffect(actor, target, 'plain');
      showBattleText(target.id, '招架', 'parry');
      showDamageNumber(target.id, -result.damage);
      target.hp = Math.max(0, target.hp - result.damage);
      showMeleeHitFeedback(target);
      addBattleLogMaybeSpeed(
        typeof BattleNarrative !== 'undefined'
          ? BattleNarrative.parry(actor, target, result.damage)
          : `${actor.name} 攻击 ${target.name}，造成 ${result.damage} 点伤害（被招架）！`,
        isSpeedExtra
      );
    } else {
      showSwordEffect(actor, target, 'plain');
      const critText = result.isCritical ? '暴击！' : '';
      showDamageNumber(target.id, -result.damage, false, result.isCritical);
      target.hp = Math.max(0, target.hp - result.damage);
      showMeleeHitFeedback(target);
      addBattleLogMaybeSpeed(
        typeof BattleNarrative !== 'undefined'
          ? BattleNarrative.enemyHit(actor, target, result.damage, result.isCritical)
          : `${actor.name} 攻击 ${target.name}，${critText}造成 ${result.damage} 点伤害！`,
        isSpeedExtra
      );
    }

    if (target.hp <= 0) {
      target.isDead = true;
      target.hp = 0;
      addBattleLogMaybeSpeed(
        typeof BattleNarrative !== 'undefined'
          ? BattleNarrative.defeated(target.name)
          : `${target.name} 被击败！`,
        isSpeedExtra
      );
      
      const targetCard = document.getElementById(`char-${target.id}`);
      if (targetCard) {
        targetCard.classList.add('dead');
      }
    }
    
    updateHpDisplay(target.id, target.hp);
    
    await sleep(300);
    await showAttackReturn(actor);
  }
  
  await sleep(600);
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
  if (card) {
    const hpElement = card.querySelector('.hp-text');
    if (hpElement) {
      hpElement.textContent = hp;
    }
  }
  updateActorBarsHud();
}

function updateActiveHighlight(actorOverride) {
  // 移除所有卡片的active类
  document.querySelectorAll('.character-card').forEach(card => {
    card.classList.remove('active');
  });
  
  // 给当前回合的角色添加active类（速度尾动时可传入 actorOverride）
  const currentChar =
    actorOverride != null ? actorOverride : battleState.turnOrder[battleState.currentTurnIndex];
  if (currentChar) {
    const currentCard = document.getElementById(`char-${currentChar.id}`);
    if (currentCard) {
      currentCard.classList.add('active');
    }
  }
  updateActorBarsHud();
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

/** 战斗结束：立即全黑（不做半透明过渡，避免底下战斗 UI 闪一下） */
function playBattleExitBlackCover() {
  return new Promise((resolve) => {
    const el = document.createElement('div');
    el.id = 'battleExitBlackCover';
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText =
      'position:fixed;inset:0;z-index:10000000;background:#000;opacity:1;pointer-events:none;';
    document.body.appendChild(el);
    requestAnimationFrame(() => resolve());
  });
}

async function showSettlement() {
  const isVictory = battleState.enemyTeam.every(char => char.isDead);
  addBattleLog(isVictory ? '──────── 战斗结束：胜利 ────────' : '──────── 战斗结束：败北 ────────', { round: true });
  const rewards = isVictory ? battleState.rewards : { exp: 0, gold: 0, expReward: 0 };

  if (isVictory) {
    const enemy = battleState.enemyTeam[0];
    rewards.exp = enemy.expReward || enemy.exp || 25;
    rewards.gold = enemy.goldReward || enemy.gold || 10;
    rewards.expReward = enemy.expReward || 17;

    updateBanditTaskProgress(enemy);

    if (window.BattleSettlement) {
      window.BattleSettlement.setPendingRewards({
        exp: rewards.exp,
        gold: rewards.gold,
        expReward: rewards.expReward,
        goldReward: rewards.gold
      });
      window.BattleSettlement.setPostBattleMapRewardFloats({
        exp: rewards.exp,
        gold: rewards.gold,
        expReward: rewards.expReward
      });
    } else {
      localStorage.setItem('pending_battle_rewards', JSON.stringify({
        exp: rewards.exp,
        gold: rewards.gold,
        expReward: rewards.expReward,
        goldReward: rewards.gold
      }));
      localStorage.setItem('battle_map_reward_floats', JSON.stringify({
        exp: rewards.exp,
        gold: rewards.gold,
        expReward: rewards.expReward
      }));
    }
  }

  if (isVictory) {
    await showFloatText('胜利！', '#4caf50');
    await sleep(380);
  } else {
    await showFloatText('败北……', '#78909c');
    await sleep(320);
  }

  if (window.BattleSettlement) {
    window.BattleSettlement.setBattleExitCinematicFlag();
  } else {
    localStorage.setItem('battle_exit_cinematic', '1');
  }

  await playBattleExitBlackCover();

  window.location.href = battleState.returnMapHref || 'forest_map.html';
}

/**
 * 更新山贼击杀任务进度
 */
function updateBanditTaskProgress(enemy) {
  // 从localStorage获取玩家状态
  const savedState = localStorage.getItem('playerState');
  if (!savedState) return;
  
  let playerState = JSON.parse(savedState);
  
  // 检查是否有山贼任务
  const banditTask = playerState.activeTasks && playerState.activeTasks['bandit_clear'];
  if (!banditTask) return;
  
  // 检查敌人是否是山贼（id 或名称）
  const enemyId = (enemy && enemy.id) ? String(enemy.id) : '';
  const enemyName = (enemy && enemy.name) ? String(enemy.name) : '';
  const isBanditEnemy =
    (enemyId && enemyId.includes('shanze')) || (enemyName && enemyName.includes('山贼'));
  if (isBanditEnemy) {
    // 增加击杀计数（适配新的数据结构）
    if (banditTask.killCount !== undefined) {
      banditTask.killCount++;
    } else if (banditTask.progress && banditTask.progress.killCount !== undefined) {
      banditTask.progress.killCount++;
    }
    
    // 保存进度
    localStorage.setItem('playerState', JSON.stringify(playerState));
    
    // 显示进度提示
    const killCount = banditTask.killCount !== undefined ? banditTask.killCount : (banditTask.progress && banditTask.progress.killCount);
    const targetKill = banditTask.targetKill !== undefined ? banditTask.targetKill : (banditTask.progress && banditTask.progress.targetKill);
    console.log(`击杀山贼: ${killCount}/${targetKill}`);
    
    // 检查是否完成任务
    if (killCount >= targetKill) {
      banditTask.isCompleted = true;
      banditTask.completed = true; // 同时设置两个标记兼容
      console.log('🎯 任务完成！请前往澄心堂找赵恪领取奖励');
      localStorage.setItem('playerState', JSON.stringify(playerState));
    }
  }
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
  const logPanel = document.getElementById('battleLogPanel');
  const logToggle = document.getElementById('battleLogToggle');
  if (logPanel && logToggle) {
    logToggle.addEventListener('click', () => {
      const collapsed = logPanel.classList.toggle('collapsed');
      logToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      if (!collapsed) {
        const entries = document.getElementById('battleLogEntries');
        if (entries) {
          requestAnimationFrame(() => {
            entries.scrollTop = entries.scrollHeight;
          });
        }
      }
    });
  }

  const cineEl = document.getElementById('battlePageCinematicBlack');
  const cineKey = window.BattleEntry && window.BattleEntry.KEYS && window.BattleEntry.KEYS.battleEnterCinematic;

  setTimeout(async () => {
    await initBattle();
    if (cineEl && cineKey) {
      const clearEntryChrome = () => {
        localStorage.removeItem(cineKey);
        document.documentElement.style.background = '';
        document.body.style.background = '';
        try {
          cineEl.remove();
        } catch (e) {
          /* ignore */
        }
      };
      cineEl.style.transition = 'opacity 0.42s ease-out';
      const onEnd = (ev) => {
        if (ev.propertyName !== 'opacity') return;
        cineEl.removeEventListener('transitionend', onEnd);
        clearEntryChrome();
      };
      cineEl.addEventListener('transitionend', onEnd);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          cineEl.style.opacity = '0';
        });
      });
      setTimeout(() => {
        if (!cineEl.parentNode) return;
        cineEl.removeEventListener('transitionend', onEnd);
        clearEntryChrome();
      }, 700);
    }
  }, 0);

  document.getElementById('btnAuto').addEventListener('click', toggleAutoBattle);
});

(function attachBattleCinematicBlackIfNeeded() {
  try {
    const k = window.BattleEntry && window.BattleEntry.KEYS && window.BattleEntry.KEYS.battleEnterCinematic;
    if (!k || localStorage.getItem(k) !== '1' || !document.body) return;
    if (document.getElementById('battlePageCinematicBlack')) return;
    const el = document.createElement('div');
    el.id = 'battlePageCinematicBlack';
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:#000;opacity:1;pointer-events:none;';
    document.body.appendChild(el);
  } catch (e) {
    /* ignore */
  }
})();
