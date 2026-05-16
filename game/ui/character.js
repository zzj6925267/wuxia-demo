// 角色系统数据

/** 无存档时的武学列表（新局为空；勿再注入演示三件套） */
const LOCAL_MARTIAL_ARTS = [];

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
/**
 * 获取内功被动效果（接口预留，方便后续扩展）
 * @param {Object} martial - 内功武学数据
 * @param {Object} char - 角色数据
 * @returns {Object} 被动效果（defense, maxHp 等）
 * 
 * 生效条件：
 * 1. 内功必须已装备（martial.equipped === true）
 * 2. 必须达到技能解锁等级（martial.currentLevel >= skill.unlockLevel）
 * 3. 卸下内功后，被动效果失效
 * 
 * 注意：修为（innerSkill）是永久的，不会因为卸下内功而扣除
 */
function getInnerSkillPassiveEffects(martial, char) {
  const effects = {
    defense: 0,
    maxHp: 0,
    attack: 0,
    speed: 0,
    hit: 0,
    dodge: 0
  };

  if (!martial.equipped) {
    console.log(`${martial.name} 未装备，被动效果不生效`);
    return effects;
  }

  if (!martial.skills || martial.skills.length === 0) {
    return effects;
  }

  const stats = char && char.stats ? char.stats : {};

  martial.skills.forEach(skill => {
    if (martial.currentLevel < (skill.unlockLevel || 1)) {
      return;
    }

    const effect = skill.effect;
    if (!effect) return;

    switch (effect.type) {
      case 'defenseBuff': {
        let bonus = effect.baseValue || 0;
        if (effect.bonusAttr) {
          bonus += (stats[effect.bonusAttr] || 0) * (effect.bonusPerPoint || 0);
        }
        effects.defense += Math.ceil(bonus);
        break;
      }
      case 'maxHpBuff': {
        let bonus = effect.baseValue || 0;
        if (effect.bonusAttr) {
          bonus += (stats[effect.bonusAttr] || 0) * (effect.bonusPerPoint || 0);
        }
        effects.maxHp += Math.ceil(bonus);
        break;
      }
      case 'attackBuff': {
        let bonus = effect.baseValue || 0;
        if (effect.bonusAttr) {
          bonus += (stats[effect.bonusAttr] || 0) * (effect.bonusPerPoint || 0);
        }
        effects.attack += Math.ceil(bonus);
        break;
      }
      case 'speedBuff': {
        let bonus = effect.baseValue || 0;
        if (effect.bonusAttr) {
          bonus += (stats[effect.bonusAttr] || 0) * (effect.bonusPerPoint || 0);
        }
        effects.speed += Math.ceil(bonus);
        break;
      }
      default:
        console.log(`未知效果类型: ${effect.type}`);
    }
  });

  return effects;
}

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

  /**
   * 规则（与背包学习界面 `calculateCurrentBonuses` 一致）：
   * - 拳脚/剑术/刀术/轻功/内功「修为」五项：凡已学且重数>0 即按 **baseBonus×重数** 累计，与是否装备无关。
   * - 已装备武学的 **stats**：只叠加 **战斗属性**（如 hp、defense、attack…）；**不把 stats 里的拳脚剑刀轻内** 叠进修为五项（否则面板会比背包/条件判定虚高）。
   * - stats.innerSkill 仅加 **内力 mp**（与注释「装备 innerSkill 加到内力」一致），不计入内功修为条。
   * - attack/hit 等面板战斗属性及技能型被动：仍仅已装备武学生效；被动段由 getCharacterInnerSkillBonuses 处理，勿与此处重复。
   */
  
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

  const cultKeys = ['fist', 'sword', 'blade', 'lightSkill', 'innerSkill'];
  arts.forEach(martial => {
    if (!martial.baseBonus || martial.currentLevel <= 0) return;
    Object.entries(martial.baseBonus).forEach(([key, val]) => {
      if (cultKeys.includes(key) && bonuses.hasOwnProperty(key)) {
        bonuses[key] += val * martial.currentLevel;
      }
    });
  });

  arts.forEach(martial => {
    if (!martial.equipped) return;

    if (martial.stats && martial.currentLevel > 0) {
      Object.entries(martial.stats).forEach(([key, val]) => {
        if (key === 'innerSkill') {
          bonuses.mp += val;
          return;
        }
        if (cultKeys.includes(key)) {
          return;
        }
        if (bonuses.hasOwnProperty(key)) {
          bonuses[key] += val;
        }
      });
    }

    // 技能型被动（maxHpBuff/defenseBuff 等）只由 loadCharacterData 里的 getCharacterInnerSkillBonuses → skillVal 计入，
    // 勿在此处再调 getInnerSkillPassiveEffects 叠到 martialVal，否则与战斗 getMartialBonusForChar + getInnerSkillPassiveBonuses 各计一次不一致（面板虚高）。
  });

  Object.keys(bonuses).forEach(key => {
    if (bonuses[key] > 100 && ['fist', 'sword', 'blade', 'lightSkill', 'innerSkill'].includes(key)) {
      bonuses[key] = 100;
    }
  });

  return bonuses;
}

function buildNewGameCombatStats() {
  const dim = 5;
  const baseHp = 100;
  const baseMp = 50;
  return {
    strength: dim,
    agility: dim,
    bone: dim,
    qi: dim,
    vitality: dim,
    spirit: dim,
    attack: 50,
    hp: baseHp,
    hit: 70 + dim,
    dodge: 20 + Math.floor(dim * 0.5),
    defense: 5,
    parry: Math.floor(dim / 5),
    speed: 50 + dim * 2,
    fist: 0,
    sword: 0,
    blade: 0,
    lightSkill: 0,
    innerSkill: 0,
    mp: baseMp,
    maxMp: baseMp
  };
}

function createDefaultCharacters() {
  const st = buildNewGameCombatStats();
  const emptyEquip = {
    weapon: null,
    armor: null,
    helmet: null,
    shoes: null,
    accessory: null
  };
  return [
    {
      id: 1,
      name: '少侠',
      icon: '👨‍🦰',
      level: 1,
      gender: '男',
      faction: '',
      power: 0,
      health: { current: 100, max: 100 },
      exp: { current: 0, max: 100 },
      description: '初入江湖的少年侠客，心怀侠义，立志成为一代大侠。',
      equipped: Object.assign({}, emptyEquip),
      skills: {},
      stats: Object.assign({}, st),
      remainingPoints: 0,
      gold: 0
    },
    {
      id: 2,
      name: '苏瑶',
      icon: '👧',
      level: 1,
      gender: '女',
      faction: '',
      power: 0,
      health: { current: 100, max: 100 },
      exp: { current: 0, max: 100 },
      description: '正阳派内门弟子。',
      equipped: Object.assign({}, emptyEquip),
      skills: {},
      stats: Object.assign({}, st),
      remainingPoints: 0,
      gold: 0
    }
  ];
}

// 计算内力上限的辅助函数
function calculateMaxMp(spirit, level) {
  if (typeof deriveBaseStatFromFourDim === 'function') {
    return Math.floor(deriveBaseStatFromFourDim('mp', spirit, level));
  }
  const anchor = 5;
  return Math.floor(50 + (spirit - anchor) * 2 + (Math.max(1, level) - 1) * 5);
}

// 实时计算基础属性的辅助函数
function refreshBaseStats(char) {
  const level = char.level || 10;
  const vitality = char.stats.bone || char.stats.vitality || 10;
  const spirit = char.stats.qi || char.stats.spirit || 10;
  
  // 只在首次初始化时计算基础属性，不覆盖已分配的属性点效果
  // 如果已经有计算好的属性值，不重新计算
  if (!char.stats.hp || char.stats.hp === 0) {
    char.stats.hp =
      typeof deriveBaseStatFromFourDim === 'function'
        ? deriveBaseStatFromFourDim('hp', vitality, level)
        : 100 + (vitality - 5) * 5 + (level - 1) * 10;
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
        char.remainingPoints = 0;
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

/**
 * 从 localStorage 的 playerCharacters 重新载入队伍，并写回模块内 characters 与 window.characters。
 * 大地图改点后若战斗页仍持有旧引用，战斗属性会与面板不一致；进入战斗前须调用。
 */
function applyPlayerCharactersFromStorage() {
  try {
    const raw = localStorage.getItem('playerCharacters');
    if (!raw) return false;
    const list = JSON.parse(raw);
    if (!Array.isArray(list) || list.length === 0) return false;
    list.forEach((c, i) => {
      if (c && (c.id == null || c.id === '')) c.id = i + 1;
    });
    list.forEach(char => {
      if (!char.stats) char.stats = {};
      if (!char.health) char.health = { current: 100, max: 100 };
      if (char.remainingPoints === undefined || char.remainingPoints === null) {
        char.remainingPoints = 0;
      }
      refreshBaseStats(char);
    });
    characters = list;
    window.characters = characters;
    return true;
  } catch (e) {
    console.warn('applyPlayerCharactersFromStorage:', e);
    return false;
  }
}

/** 装备选择弹窗不再使用硬编码演示列表，改从行囊 playerData.inventory 读取 */
const PLAYER_INVENTORY = {
  weapon: [],
  armor: [],
  accessory: [],
  shoes: []
};

const EQUIP_SLOT_BY_CHAR_TYPE = {
  weapon: 'weapon',
  armor: 'armor',
  accessory: 'accessory',
  shoes: 'shoes'
};

function mapItemQualityToPickerRarity(quality) {
  const m = {
    common: 'green',
    uncommon: 'green',
    rare: 'blue',
    epic: 'purple',
    legendary: 'orange'
  };
  return m[quality] || 'green';
}

function readPlayerBagInventoryFromStorage() {
  try {
    const raw = localStorage.getItem('playerData');
    if (!raw) return [];
    const pd = JSON.parse(raw);
    return Array.isArray(pd.inventory) ? pd.inventory : [];
  } catch (e) {
    return [];
  }
}

function buildEquipPickerRowFromItemsJs(itemId, expectedSlot) {
  const def = typeof window !== 'undefined' && window.ITEMS && window.ITEMS[itemId];
  if (!def || def.category !== 'equipment') return null;
  const slot = def.equipSlot || 'weapon';
  if (expectedSlot && slot !== expectedSlot) return null;
  const bonus = def.bonus || {};
  const item = {
    id: itemId,
    name: def.name,
    type: slot,
    rarity: mapItemQualityToPickerRarity(def.quality),
    level: def.requiredLevel != null ? Number(def.requiredLevel) : 1,
    desc: def.description || ''
  };
  Object.keys(bonus).forEach(function (k) {
    const v = bonus[k];
    if (typeof v === 'number') item[k] = v;
  });
  return item;
}

/** 角色装备弹窗：仅列出行囊内可装备该槽位的物品 */
function getEquipPickerItemsForChar(type) {
  const slot = EQUIP_SLOT_BY_CHAR_TYPE[type];
  if (!slot) return [];
  const items = [];
  const seen = {};
  const bag = readPlayerBagInventoryFromStorage();
  const onlyWood = type === 'weapon' ? getQingstoneDojoTutorialWeaponIdForCharPanel() : null;

  bag.forEach(function (entry) {
    if (!entry || entry.id == null) return;
    const id = String(entry.id);
    if (seen[id]) return;
    if (type === 'weapon' && TUTORIAL_WOOD_WEAPON_IDS.indexOf(id) >= 0) {
      if (onlyWood && onlyWood !== id) return;
    }
    const row = buildEquipPickerRowFromItemsJs(id, slot);
    if (!row) return;
    items.push(row);
    seen[id] = true;
  });
  return items;
}

function findEquipPickerItemForChar(type, itemId) {
  const sid = String(itemId);
  const list = getEquipPickerItemsForChar(type);
  const hit = list.find(function (i) {
    return i && String(i.id) === sid;
  });
  if (hit) return hit;
  return buildEquipPickerRowFromItemsJs(sid, EQUIP_SLOT_BY_CHAR_TYPE[type]);
}

/** 卸下不在行囊内的装备，并清除旧版演示装备 id */
function clearStaleEquippedNotInBag(char) {
  if (!char || !char.equipped) return false;
  let changed = false;
  const bag = readPlayerBagInventoryFromStorage();
  const bagIds = {};
  bag.forEach(function (e) {
    if (e && e.id != null) bagIds[String(e.id)] = true;
  });
  ['weapon', 'armor', 'accessory', 'shoes'].forEach(function (slot) {
    const eq = char.equipped[slot];
    if (!eq || eq.id == null) return;
    const eid = String(eq.id);
    const def = typeof window !== 'undefined' && window.ITEMS && window.ITEMS[eid];
    if (def && def.category === 'equipment') {
      if (!bagIds[eid]) {
        char.equipped[slot] = null;
        changed = true;
      }
      return;
    }
    char.equipped[slot] = null;
    changed = true;
  });
  return changed;
}

/** 青石武馆问径：仅当前选的木械（mu_jian / mu_dao / mu_quan 之一）出现在角色武器快捷列表 */
const TUTORIAL_WOOD_WEAPON_IDS = ['mu_jian', 'mu_dao', 'mu_quan'];

function hasQingstoneDojoTutorialWeaponGranted() {
  try {
    const raw = localStorage.getItem('playerState');
    if (!raw) return false;
    const st = JSON.parse(raw);
    const t = st && st.qingstoneDojoTutorial;
    return !!(t && t.phase === 'picked' && t.weaponId);
  } catch (e) {
    return false;
  }
}

/** 未领武馆教头木械前，卸下木剑/木刀/木拳套并清背包同类 */
function stripTutorialWoodGearFromHero(char) {
  if (!char || hasQingstoneDojoTutorialWeaponGranted()) return;
  if (char.equipped && char.equipped.weapon) {
    const wid = String(char.equipped.weapon.id || '');
    if (TUTORIAL_WOOD_WEAPON_IDS.indexOf(wid) >= 0) {
      char.equipped.weapon = null;
    }
  }
}

function stripTutorialWoodGearFromInventoryList(inventory) {
  if (!Array.isArray(inventory) || hasQingstoneDojoTutorialWeaponGranted()) return false;
  let changed = false;
  for (let i = inventory.length - 1; i >= 0; i--) {
    const slot = inventory[i];
    if (slot && TUTORIAL_WOOD_WEAPON_IDS.indexOf(String(slot.id)) >= 0) {
      inventory.splice(i, 1);
      changed = true;
    }
  }
  return changed;
}

if (typeof window !== 'undefined') {
  window.stripTutorialWoodGearFromInventoryList = stripTutorialWoodGearFromInventoryList;
  window.hasQingstoneDojoTutorialWeaponGranted = hasQingstoneDojoTutorialWeaponGranted;
}

function getQingstoneDojoTutorialWeaponIdForCharPanel() {
  try {
    const raw = localStorage.getItem('playerState');
    if (!raw) return null;
    const st = JSON.parse(raw);
    const t = st && st.qingstoneDojoTutorial;
    if (!t || t.phase !== 'picked' || !t.weaponId) return null;
    const id = String(t.weaponId);
    if (id === 'mu_jian' || id === 'mu_dao' || id === 'mu_quan') return id;
  } catch (e) {}
  return null;
}

function buildWeaponPickerRowFromItemsJs(weaponId) {
  return buildEquipPickerRowFromItemsJs(weaponId, 'weapon');
}

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

    // 少侠阅历/等级以 save.player 为准；队友勿套用 player.exp
    if (Number(char.id) === 1) {
      if (player.exp !== undefined) {
        console.log('存档中的 exp:', player.exp, '更新前角色阅历:', char.exp.current);
        if (!char.exp) char.exp = { current: 0, max: 100 };
        char.exp.current = player.exp;
        console.log('更新后角色阅历:', char.exp.current);
      } else {
        console.log('存档中没有 exp 字段');
      }
      if (player.level !== undefined) {
        char.level = player.level;
      }
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
    
    // 根级 player.equipped 为旧版单角色字段；若已有 player.characters 则以队伍为准，避免陈旧根数据盖掉队伍装备。
    if (
      player.equipped !== undefined &&
      (!player.characters || !Array.isArray(player.characters) || player.characters.length === 0)
    ) {
      char.equipped = player.equipped;
      console.log('从存档读取装备数据（根级）:', char.equipped);
    }

    // 如果存档中有完整的角色数据，优先使用
    if (player.characters && Array.isArray(player.characters)) {
      console.log('=== 加载存档角色数据 ===');
      for (let i = 0; i < player.characters.length; i++) {
        if (window.characters[i]) {
          // 记录加载前的状态
          const beforeRemaining = window.characters[i].remainingPoints;
          const beforeBone = window.characters[i].stats?.bone;
          
          // 使用安全合并
          if (window.AttributeHelper) {
            window.AttributeHelper.safeMerge(window.characters[i], player.characters[i]);
          } else {
            // 备用方案
            const saved = window.characters[i].remainingPoints;
            Object.assign(window.characters[i], player.characters[i]);
            window.characters[i].remainingPoints = saved;
          }
          
          // 记录加载后的状态
          const afterRemaining = window.characters[i].remainingPoints;
          const afterBone = window.characters[i].stats?.bone;
          
          console.log(`角色 ${i}: 剩余点数 ${beforeRemaining} → ${afterRemaining}, 根骨 ${beforeBone} → ${afterBone}`);
        } else {
          window.characters[i] = player.characters[i];
        }
      }
      characters = window.characters;
      console.log('存档加载完成');
    }

    let equipSyncChanged = false;
    if (window.characters && window.characters.length) {
      window.characters.forEach(function (c) {
        if (clearStaleEquippedNotInBag(c)) equipSyncChanged = true;
      });
      if (equipSyncChanged) {
        try {
          localStorage.setItem('playerCharacters', JSON.stringify(window.characters));
          if (player.characters) {
            player.characters = window.characters;
          }
        } catch (e) {}
      }
    }

    const heroSave = player.characters && player.characters[0];
    const heroMem = window.characters && window.characters[0];
    if (heroSave && heroMem) {
      const saveLv =
        heroSave.level != null ? parseInt(heroSave.level, 10) : parseInt(player.level, 10) || 1;
      heroMem.level = saveLv;
      if (player.exp !== undefined && heroMem.exp) {
        heroMem.exp.current = player.exp;
      }
      if (heroSave.remainingPoints != null && heroSave.remainingPoints !== '') {
        heroMem.remainingPoints = Math.max(
          heroMem.remainingPoints || 0,
          parseInt(heroSave.remainingPoints, 10) || 0
        );
      }
      if (player.remainingPoints != null) {
        heroMem.remainingPoints = Math.max(
          heroMem.remainingPoints || 0,
          parseInt(player.remainingPoints, 10) || 0
        );
      }
      stripTutorialWoodGearFromHero(heroMem);
      if (typeof reconcileProtagonistStatPoints === 'function') {
        reconcileProtagonistStatPoints(heroMem);
      }
      heroSave.remainingPoints = heroMem.remainingPoints;
      player.remainingPoints = heroMem.remainingPoints;
      try {
        const sd = localStorage.getItem('game_save_0');
        if (sd) {
          const saveObj = JSON.parse(sd);
          if (saveObj.player) {
            saveObj.player.level = heroMem.level;
            saveObj.player.exp = player.exp;
            saveObj.player.remainingPoints = heroMem.remainingPoints;
            if (saveObj.player.characters && saveObj.player.characters[0]) {
              saveObj.player.characters[0].level = heroMem.level;
              saveObj.player.characters[0].remainingPoints = heroMem.remainingPoints;
              if (heroMem.exp) {
                saveObj.player.characters[0].exp = heroMem.exp;
              }
            }
            localStorage.setItem('game_save_0', JSON.stringify(saveObj));
          }
        }
        localStorage.setItem('playerCharacters', JSON.stringify(window.characters));
      } catch (e) {}
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
  const wasVisible = panel.style.display === 'flex';
  panel.style.display = wasVisible ? 'none' : 'flex';

  if (wasVisible) {
    try {
      var ret = sessionStorage.getItem('game_ui_return_href');
      var base = (window.location.pathname || '').split('/').pop() || '';
      if (ret && /^map\.html$/i.test(base) && ret !== base) {
        sessionStorage.removeItem('game_ui_return_href');
        window.location.href = ret;
        return;
      }
    } catch (e) {}
    return;
  }

  try {
    document.documentElement.classList.remove('map-hide-map-until-char');
  } catch (e) {}

  checkLevelUpNotification();
  loadCharacterData();
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
    let msg = '恭喜！升至 ' + levelUp.level + ' 级！';
    if (levelUp.pointsGained > 0) {
      msg += ' 属性点 +' + levelUp.pointsGained;
    } else if (levelUp.levelsGained > 1) {
      msg += '（连升 ' + levelUp.levelsGained + ' 级）';
    }
    showCharFloatText(msg, '#4caf50');
    
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
  let martialArts = [];
  
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) martialArts = parsed;
    } catch (e) {}
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

const EMPTY_MARTIAL_SLOT_LABEL = '未修习';
const EMPTY_MARTIAL_SLOT_LEVEL = '—';

/**
 * 同步角色面板「武功 / 内功 / 轻功」三槽（与 playerMartialArts_* 已装备项一致；无则显示未修习）
 */
function updateEquippedMartialArtsDisplay() {
  const equipped = getEquippedMartialArts();
  const slots = [
    {
      type: '武功',
      slotId: 'skillSlot1',
      nameIds: ['weaponSkill', 'charWeaponSkill'],
      levelSelectors: ['#skillWeapon .skill-level', '#skillSlot1 .skill-level']
    },
    {
      type: '内功',
      slotId: 'skillSlot2',
      nameIds: ['innerSkill', 'charInnerSkill'],
      levelSelectors: ['#skillInner .skill-level', '#skillSlot2 .skill-level']
    },
    {
      type: '轻功',
      slotId: 'skillSlot3',
      nameIds: ['lightSkill', 'charLightSkill'],
      levelSelectors: ['#skillLight .skill-level', '#skillSlot3 .skill-level']
    }
  ];

  slots.forEach(function (cfg) {
    const martial = equipped[cfg.type];
    const hasMartial =
      martial && martial.name && (parseInt(martial.currentLevel, 10) || 0) > 0;

    let nameEl = null;
    cfg.nameIds.forEach(function (id) {
      const el = document.getElementById(id);
      if (el) nameEl = el;
    });
    if (nameEl) {
      nameEl.textContent = hasMartial ? martial.name : EMPTY_MARTIAL_SLOT_LABEL;
    }

    let levelEl = null;
    cfg.levelSelectors.forEach(function (sel) {
      const el = document.querySelector(sel);
      if (el) levelEl = el;
    });
    if (levelEl) {
      levelEl.textContent = hasMartial
        ? martial.currentLevel + '/' + martial.maxLevel + '重'
        : EMPTY_MARTIAL_SLOT_LEVEL;
    }

    const slotEl = document.getElementById(cfg.slotId);
    if (slotEl) {
      slotEl.classList.toggle('skill-item--empty', !hasMartial);
    }
  });
}

window.updateEquippedMartialArtsDisplay = updateEquippedMartialArtsDisplay;

/**
 * 加载角色数据
 */
function loadCharacterData() {
  // 先从存档加载最新数据
  loadFromSave();

  let panelLevelUp = null;
  if (typeof reconcileYueliOnCharacterPanel === 'function') {
    panelLevelUp = reconcileYueliOnCharacterPanel();
    if (panelLevelUp && panelLevelUp.levelsGained > 0) {
      let msg = '阅历已满，升至 ' + panelLevelUp.newLevel + ' 级！';
      if (panelLevelUp.pointsGained > 0) {
        msg += ' 属性点 +' + panelLevelUp.pointsGained;
      }
      if (panelLevelUp.levelsGained > 1) {
        msg += '（连升 ' + panelLevelUp.levelsGained + ' 级）';
      }
      showCharFloatText(msg, '#4caf50');
    }
  }

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
  if (typeof reconcileProtagonistStatPoints === 'function') {
    reconcileProtagonistStatPoints(char);
  }
  CHAR_UI.charName.textContent = char.name;
  CHAR_UI.charGender.textContent = char.gender;
  CHAR_UI.charFaction.textContent = char.faction;
  CHAR_UI.charPower.textContent = char.power;
  CHAR_UI.charDesc.textContent = char.description;
  
  // 更新经验条
  // 计算当前等级所需的经验（每升一级所需经验增加50%）
  const expNeededForLevel =
    typeof getExpRequiredForLevel === 'function'
      ? getExpRequiredForLevel(char.level)
      : Math.floor(100 * Math.pow(1.25, char.level - 1));
  if (!char.exp) char.exp = { current: 0, max: 100 };
  const expCur = Math.max(0, parseInt(char.exp.current, 10) || 0);
  const expPct = Math.min((expCur / expNeededForLevel) * 100, 100);
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
      const remainingExp = Math.max(0, expNeededForLevel - expCur);
      expTooltip.textContent = `${expCur}/${expNeededForLevel}，还需${remainingExp}升级`;
    }
  }
  
  updateEquippedMartialArtsDisplay();

  // 计算武学加成（包括修为和属性）
  const martialBonuses = getLocalMartialBonuses();
  console.log('武学加成', martialBonuses);
  
  // 计算武学技能被动加成
  const skillBonuses = getCharacterInnerSkillBonuses(char);
  console.log('武学技能加成', skillBonuses);
  
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
    
    const lvDisp = char.level || 1;
    const strDisp = char.stats.strength != null ? char.stats.strength : 5;
    const agiDisp = char.stats.agility != null ? char.stats.agility : 5;
    const boneDisp = char.stats.bone != null ? char.stats.bone : 5;
    const qiDisp = char.stats.qi != null ? char.stats.qi : 5;
    fourDimBonus = 0;
    switch (attr) {
      case 'Attack':
        baseVal =
          typeof deriveBaseStatFromFourDim === 'function'
            ? deriveBaseStatFromFourDim('attack', strDisp, lvDisp)
            : 50 + (strDisp - 5) * 3;
        break;
      case 'Hp':
        baseVal =
          typeof deriveBaseStatFromFourDim === 'function'
            ? deriveBaseStatFromFourDim('hp', boneDisp, lvDisp)
            : 100 + (boneDisp - 5) * 5 + (lvDisp - 1) * 10;
        break;
      case 'Mp':
        baseVal =
          typeof deriveBaseStatFromFourDim === 'function'
            ? deriveBaseStatFromFourDim('mp', qiDisp, lvDisp)
            : 50 + (qiDisp - 5) * 2 + (lvDisp - 1) * 5;
        break;
      case 'Speed':
        baseVal =
          typeof deriveBaseStatFromFourDim === 'function'
            ? deriveBaseStatFromFourDim('speed', agiDisp, lvDisp)
            : 50 + (agiDisp - 5) * 2;
        break;
      case 'Hit':
        baseVal =
          typeof deriveBaseStatFromFourDim === 'function'
            ? deriveBaseStatFromFourDim('hit', agiDisp, lvDisp)
            : 70 + (agiDisp - 5);
        break;
      case 'Dodge':
        baseVal =
          typeof deriveBaseStatFromFourDim === 'function'
            ? deriveBaseStatFromFourDim('dodge', agiDisp, lvDisp)
            : 20 + Math.floor((agiDisp - 5) * 0.5);
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
    
    // 获取对应的技能加成
    let skillVal = 0;
    if (lowerAttr === 'attack') skillVal = skillBonuses.attackBonus || 0;
    else if (lowerAttr === 'hp') skillVal = skillBonuses.maxHpBonus || 0;
    else if (lowerAttr === 'dodge') skillVal = skillBonuses.dodgeBonus || 0;
    else if (lowerAttr === 'speed') skillVal = skillBonuses.speedBonus || 0;
    else if (lowerAttr === 'defense') skillVal = skillBonuses.defenseBonus || 0;
    else if (lowerAttr === 'hit') skillVal = skillBonuses.hitBonus || 0;
    else if (lowerAttr === 'parry') skillVal = skillBonuses.parryBonus || 0;
    
    const total = baseVal + fourDimBonus + martialVal + skillVal + equipVal;
    
    // 调试输出
    console.log(`${attr} - 基础:${baseVal} 四维:${fourDimBonus} 武学:${martialVal} 技能:${skillVal} 装备:${equipVal} 总计:${total}`);
    
    // 确保显示的是完整属性值（包含武学和装备加成）
    const displayEl = document.getElementById(`stat${attr}Base`);
    if (displayEl) {
      displayEl.textContent = total;
    }
    
    // 添加悬浮提示
    const statEl = displayEl ? displayEl.parentElement : null;
    if (statEl) {
      statEl.onmouseenter = (e) => showStatTooltip(e, attr, baseVal, martialVal, equipVal, fourDimBonus, skillVal);
      statEl.onmouseleave = hideStatTooltip;
    }
  });

  // 气血数值与健康条与属性栏 statHpBase 对齐（与战斗 computeCombatMaxHp 同源）
  const hpDisplayEl = document.getElementById('statHpBase');
  const combatMaxHp = hpDisplayEl ? parseInt(hpDisplayEl.textContent, 10) : NaN;
  if (Number.isFinite(combatMaxHp) && combatMaxHp > 0) {
    char.health.max = combatMaxHp;
    char.stats.hp = combatMaxHp;
    char.stats.maxHp = combatMaxHp;
    if (!char.health.current || char.health.current > combatMaxHp) {
      char.health.current = combatMaxHp;
    }
    const healthTooltip = document.getElementById('healthTooltip');
    if (healthTooltip) {
      healthTooltip.textContent =
        char.health.current + '/' + combatMaxHp + '，剩余' + Math.max(0, combatMaxHp - char.health.current);
    }
  }
  const healthPct =
    char.health.max > 0 ? (char.health.current / char.health.max) * 100 : 0;
  CHAR_UI.charHealthBar.style.width = `${healthPct}%`;

  // 显示修为（角色基础修为 + 已学武学 baseBonus×重数；与背包学习条件一致）
  // 已装备武学的 stats.innerSkill 只计入内力 mp，不计入本行的「内功修为」
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
      previewBar.style.width = '0%';
      previewBar.style.left = '0%';
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
 * 装备预览定位：优先右侧；在「选择装备」弹窗内时贴在弹窗右缘，避免小窗时被挤到左侧裁切。
 */
function positionEquipTooltip(tooltip, targetEl) {
  if (!tooltip || !targetEl) return;
  const gap = 12;
  const margin = 8;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const tw = tooltip.offsetWidth || 280;
  const th = tooltip.offsetHeight || 120;
  const rect = targetEl.getBoundingClientRect();

  const modal = document.getElementById('charModal');
  const inEquipModal =
    modal &&
    modal.style.display !== 'none' &&
    (modal.contains(targetEl) || (CHAR_UI.charModalBody && CHAR_UI.charModalBody.contains(targetEl)));

  let left;
  let top = rect.top;

  if (inEquipModal && modal) {
    const modalRect = modal.getBoundingClientRect();
    left = modalRect.right + gap;
    if (left + tw > vw - margin) {
      left = rect.right + gap;
    }
  } else {
    left = rect.right + gap;
  }

  if (left + tw > vw - margin) {
    const leftOfTarget = rect.left - tw - gap;
    if (leftOfTarget >= margin) {
      left = leftOfTarget;
    } else {
      left = Math.max(margin, Math.min(rect.right + gap, vw - tw - margin));
    }
  }
  if (left < margin) {
    left = margin;
  }

  if (top + th > vh - margin) {
    top = Math.max(margin, vh - th - margin);
  }
  if (top < margin) {
    top = margin;
  }

  tooltip.style.left = left + 'px';
  tooltip.style.top = top + 'px';
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
  
  const target = e.currentTarget || e.target;
  positionEquipTooltip(tooltip, target);
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
  
  const invItems = getEquipPickerItemsForChar(type);
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
        const rawId = this.getAttribute('data-itemid');
        const itemId = rawId === '' || rawId == null ? null : Number.isNaN(Number(rawId)) ? rawId : Number(rawId);
        console.log('装备项点击，类型:', type, '物品ID:', itemId);
        if (type && itemId !== '' && itemId != null) {
          equipCharItem(type, itemId);
        }
      });
      
      // 也尝试直接绑定 onclick
      item.onclick = function(e) {
        e.stopPropagation();
        console.log('=== 装备项被点击 (onclick) ===');
        console.log('点击事件:', e);
        const type = this.getAttribute('data-type');
        const rawId = this.getAttribute('data-itemid');
        const itemId = rawId === '' || rawId == null ? null : Number.isNaN(Number(rawId)) ? rawId : Number(rawId);
        console.log('装备项点击，类型:', type, '物品ID:', itemId);
        if (type && itemId !== '' && itemId != null) {
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
    const rawId = equipItem.getAttribute('data-itemid');
    const itemId = rawId === '' || rawId == null ? null : Number.isNaN(Number(rawId)) ? rawId : Number(rawId);
    console.log('穿戴装备类型:', type, '物品ID:', itemId);
    if (type && itemId !== '' && itemId != null) {
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
  if (!char.equipped) char.equipped = {};

  const item = findEquipPickerItemForChar(type, itemId);
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
  if (!char.equipped) char.equipped = {};

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
        try {
          delete save.player.equipped;
        } catch (e) {}
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
 * 将 window.characters 与当前角色四维写入 playerCharacters 与 game_save_0。
 * 须在 loadCharacterData() 之前调用，否则 loadFromSave 会用旧档里的 player.characters 盖掉刚点的四维。
 */
function persistCharactersAndGameSave() {
  try {
    localStorage.setItem('playerCharacters', JSON.stringify(window.characters));
  } catch (e) {
    console.warn('写入 playerCharacters 失败', e);
  }
  const char = getCurrentCharacter();
  if (!char || !char.stats) return;
  try {
    const saveData = localStorage.getItem('game_save_0');
    if (!saveData) return;
    const save = JSON.parse(saveData);
    if (!save.player) return;
    save.player.characters = JSON.parse(JSON.stringify(window.characters));
    save.player.strength = char.stats.strength;
    save.player.agility = char.stats.agility;
    save.player.bone = char.stats.bone;
    save.player.qi = char.stats.qi;
    if (!save.player.stats || typeof save.player.stats !== 'object') {
      save.player.stats = {};
    }
    save.player.stats.strength = char.stats.strength;
    save.player.stats.agility = char.stats.agility;
    save.player.stats.bone = char.stats.bone;
    save.player.stats.qi = char.stats.qi;
    save.player.remainingPoints = char.remainingPoints;
    if (Number(char.id) === 1) {
      save.player.level = char.level;
      save.player.exp = char.exp && char.exp.current != null ? char.exp.current : save.player.exp;
      if (!save.player.characters) save.player.characters = [];
      if (save.player.characters[0]) {
        save.player.characters[0].level = char.level;
        if (!save.player.characters[0].exp) save.player.characters[0].exp = { current: 0, max: 100 };
        save.player.characters[0].exp.current = save.player.exp;
        save.player.characters[0].remainingPoints = char.remainingPoints;
      }
    }
    save.player.hp = char.health.current;
    save.player.maxHp = char.health.max;
    save.player.mp = char.stats.mp;
    save.player.maxMp = char.stats.maxMp;
    if (char.equipped) save.player.equipped = char.equipped;
    localStorage.setItem('game_save_0', JSON.stringify(save));
  } catch (e) {
    console.error('同步 game_save_0 失败:', e);
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

  // 先落盘再 loadCharacterData，避免 loadFromSave 用旧 player.characters 覆盖四维、条与数脱节
  persistCharactersAndGameSave();

  loadCharacterData();

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

  console.log('=== updateStatsFromFour 被调用 ===');

  const lv = char.level || 1;
  const str = s.strength != null ? s.strength : 5;
  const agi = s.agility != null ? s.agility : 5;
  const bone = s.bone != null ? s.bone : s.vitality != null ? s.vitality : 5;
  const qi = s.qi != null ? s.qi : s.spirit != null ? s.spirit : 5;
  if (typeof deriveBaseStatFromFourDim === 'function') {
    s.baseAttack = deriveBaseStatFromFourDim('attack', str, lv);
    s.baseHp = deriveBaseStatFromFourDim('hp', bone, lv);
    s.baseMaxMp = deriveBaseStatFromFourDim('mp', qi, lv);
    s.baseSpeed = deriveBaseStatFromFourDim('speed', agi, lv);
    s.baseHit = deriveBaseStatFromFourDim('hit', agi, lv);
    s.baseDodge = deriveBaseStatFromFourDim('dodge', agi, lv);
  } else {
    s.baseAttack = 50 + (str - 5) * 3;
    s.baseHp = 100 + (bone - 5) * 5 + (lv - 1) * 10;
    s.baseMaxMp = calculateMaxMp(qi, lv);
    s.baseSpeed = 50 + (agi - 5) * 2;
    s.baseHit = 70 + (agi - 5);
    s.baseDodge = 20 + Math.floor((agi - 5) * 0.5);
  }

  // 获取内功被动加成（防御和气血上限）
  const innerBonuses = getCharacterInnerSkillBonuses(char);

  // 更新战斗中使用的基础属性（包含内功加成）
  s.attack = s.baseAttack + innerBonuses.attackBonus;
  s.hp = s.baseHp + innerBonuses.maxHpBonus;
  s.maxHp = s.baseHp + innerBonuses.maxHpBonus;
  s.maxMp = s.baseMaxMp;
  s.speed = s.baseSpeed + innerBonuses.speedBonus;
  s.hit = s.baseHit + (innerBonuses.hitBonus || 0);
  s.dodge = s.baseDodge + innerBonuses.dodgeBonus;
  // 防御：不把武学被动写入 stats.defense，避免与 loadCharacterData 里 skillVal 重复相加（旧档若曾叠过，开面板保存一次后会随 persist 逐渐正常）
  let d = s.defense != null && s.defense !== '' ? Number(s.defense) : 10;
  if (!Number.isFinite(d)) d = 10;
  s.defense = Math.max(0, d);

  const defenseTotalForPower = s.defense + innerBonuses.defenseBonus;
  // 更新战力（使用基础属性）
  char.power = Math.floor(s.attack * 2 + defenseTotalForPower + s.hp / 10 + s.speed);
}

// 获取角色内功被动加成
function getCharacterInnerSkillBonuses(char) {
  let defenseBonus = 0;
  let maxHpBonus = 0;
  let attackBonus = 0;
  let dodgeBonus = 0;
  let speedBonus = 0;
  let parryBonus = 0;
  let hitBonus = 0;

  const stats = char && char.stats ? char.stats : {};
  console.log('=== getCharacterInnerSkillBonuses ===');
  console.log('char.stats:', JSON.stringify(stats));

  try {
    const charId = char && char.id != null ? String(char.id) : localStorage.getItem('currentMartialCharacterId') || '1';
    let martialArtsData = [];
    if (typeof getMergedMartialArtsListForCharId === 'function') {
      martialArtsData = getMergedMartialArtsListForCharId(Number(charId));
    } else {
      const storageKey = `playerMartialArts_${charId}`;
      const saved = localStorage.getItem(storageKey);
      martialArtsData = saved ? JSON.parse(saved) : [];
    }

    console.log('charId:', charId);
    console.log('martialArtsData.length:', martialArtsData.length);

    if (martialArtsData.length > 0) {
      for (const martial of martialArtsData) {
        // 处理所有已装备的武学，不仅仅是内功
        if (martial.equipped && martial.skills) {
          console.log(`处理武学: ${martial.name} (${martial.type}), 等级: ${martial.currentLevel}`);

          for (const skill of martial.skills) {
            // 检查技能是否解锁
            const unlockLevel = skill.unlockLevel || 1;
            if (martial.currentLevel < unlockLevel) {
              console.log(`技能 ${skill.name} 未解锁 (需要${unlockLevel}级，当前${martial.currentLevel}级)`);
              continue;
            }

            const loadoutFx =
              typeof expandLoadoutPassiveStatBonuses === 'function'
                ? expandLoadoutPassiveStatBonuses(skill)
                : [];
            const effectsToApply =
              loadoutFx.length > 0
                ? loadoutFx
                : skill.effect
                  ? [skill.effect]
                  : [];

            for (const effect of effectsToApply) {
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
                // 通用的 buff 处理，支持多种属性
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
                } else if (effect.stat === 'hit') {
                  const basePct = typeof effect.value === 'number' ? effect.value : 0;
                  const baseHit = basePct < 1 ? Math.floor(basePct * 100) : Math.floor(basePct);
                  const perPoint = effect.bonusPerPoint != null ? effect.bonusPerPoint : 0;
                  const attrHit = Math.floor(
                    (stats[effect.bonusAttr] || 0) * (perPoint < 1 ? perPoint * 100 : perPoint)
                  );
                  const add = baseHit + attrHit;
                  hitBonus += add;
                  console.log(`${martial.name}-${skill.name} 生效: 命中+${add}`);
                }
                break;
            }
            }
          }
        }
      }
    } else {
      console.log('没有找到已装备的武学');
    }
  } catch (e) {
    console.warn('获取武学加成失败:', e);
  }

  console.log(`最终武学加成: 防御+${defenseBonus}, 气血+${maxHpBonus}, 攻击+${attackBonus}, 命中+${hitBonus}, 闪避+${dodgeBonus}, 速度+${speedBonus}, 招架+${parryBonus}`);
  return { defenseBonus, maxHpBonus, attackBonus, hitBonus, dodgeBonus, speedBonus, parryBonus };
}

function updateAddButtons() {
  const char = getCurrentCharacter();
  const buttons = document.querySelectorAll('.add-point-btn');
  buttons.forEach(btn => {
    btn.disabled = char.remainingPoints <= 0;
  });
}

/** 新局公式下拆分「开局 + 等级 + 四维相对开局默认」（仅悬停展示，不参与二次加算） */
function getDerivedStatBreakdownForTooltip(attrName, char) {
  if (typeof deriveBaseStatFromFourDim !== 'function' || !char || !char.stats) return null;
  const s = char.stats;
  const lv = Math.max(1, parseInt(char.level, 10) || 1);
  const anchor =
    window.GAME_CONFIG && window.GAME_CONFIG.NEW_GAME_FOUR_DIM_ANCHOR != null
      ? window.GAME_CONFIG.NEW_GAME_FOUR_DIM_ANCHOR
      : 5;
  const init =
    window.GAME_CONFIG && window.GAME_CONFIG.INITIAL_STATS
      ? window.GAME_CONFIG.INITIAL_STATS
      : { maxHp: 100, maxMp: 50 };

  const bone = s.bone != null ? s.bone : s.vitality != null ? s.vitality : anchor;
  const qi = s.qi != null ? s.qi : s.spirit != null ? s.spirit : anchor;
  const str = s.strength != null ? s.strength : anchor;
  const agi = s.agility != null ? s.agility : anchor;

  switch (attrName) {
    case 'Hp':
      return {
        initPart: init.maxHp,
        levelPart: (lv - 1) * 10,
        fourPart: (bone - anchor) * 5
      };
    case 'Mp':
      return {
        initPart: init.maxMp,
        levelPart: (lv - 1) * 5,
        fourPart: (qi - anchor) * 2
      };
    case 'Attack':
      return {
        initPart: 50,
        levelPart: 0,
        fourPart: (str - anchor) * 3
      };
    case 'Speed':
      return {
        initPart: 50,
        levelPart: 0,
        fourPart: (agi - anchor) * 2
      };
    case 'Hit':
      return {
        initPart: 70,
        levelPart: 0,
        fourPart: agi - anchor
      };
    case 'Dodge':
      return {
        initPart: 20,
        levelPart: 0,
        fourPart: Math.floor((agi - anchor) * 0.5)
      };
    default:
      return null;
  }
}

// 属性悬浮提示
function showStatTooltip(e, attrName, baseVal, martialVal, equipVal, fourDimBonusFromCaller, skillValFromCaller) {
  const attrMap = {
    'Attack': '攻击', 'Hp': '气血', 'Mp': '内力', 'Hit': '命中', 'Dodge': '闪避',
    'Defense': '防御', 'Parry': '招架', 'Speed': '速度',
    'Fist': '拳掌', 'Sword': '剑法', 'Blade': '刀法',
    'Light': '轻功', 'Inner': '内功'
  };
  
  const displayName = attrMap[attrName] || attrName;
  
  const char = getCurrentCharacter();
  const s = char.stats;
  const usesDerivedBase = typeof deriveBaseStatFromFourDim === 'function';
  const derivedBreakdown =
    usesDerivedBase && char ? getDerivedStatBreakdownForTooltip(attrName, char) : null;

  let fourDimBonus = fourDimBonusFromCaller !== undefined ? fourDimBonusFromCaller : 0;
  let fourDimDesc = '';
  
  if (!usesDerivedBase && fourDimBonus === 0) {
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
  } else if (!usesDerivedBase && fourDimBonus > 0) {
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
  
  // 获取技能加成
  const skillVal = skillValFromCaller !== undefined ? skillValFromCaller : 0;
  const total = baseVal + (usesDerivedBase ? 0 : fourDimBonus) + martialVal + skillVal + equipVal;
  
  let tooltipHtml = `<div class="tooltip-header">${displayName}: ${total}</div><div class="tooltip-content">`;

  if (derivedBreakdown) {
    const br = derivedBreakdown;
    tooltipHtml += `<div class="tooltip-item"><span class="tooltip-label">开局基础</span><span class="tooltip-value">${br.initPart}</span></div>`;
    if (br.levelPart > 0) {
      tooltipHtml += `<div class="tooltip-item"><span class="tooltip-label">等级成长</span><span class="tooltip-value" style="color:#90caf9">+${br.levelPart}</span></div>`;
    }
    if (br.fourPart !== 0) {
      tooltipHtml += `<div class="tooltip-item"><span class="tooltip-label">四维加成</span><span class="tooltip-value" style="color:#ff9800">${br.fourPart >= 0 ? '+' : ''}${br.fourPart}</span></div>`;
    }
  } else {
    tooltipHtml += `<div class="tooltip-item"><span class="tooltip-label">基础值</span><span class="tooltip-value">${baseVal}</span></div>`;
    if (fourDimBonus > 0) {
      tooltipHtml += `<div class="tooltip-item"><span class="tooltip-label">四维加成</span><span class="tooltip-value" style="color:#ff9800">+${fourDimBonus}</span></div>`;
    }
  }
  if (martialVal !== 0) {
    tooltipHtml += `
      <div class="tooltip-item">
        <span class="tooltip-label">武学加成</span>
        <span class="tooltip-value" style="color: #4caf50">+${martialVal}</span>
      </div>
    `;
  }
  
  if (skillVal !== 0) {
    tooltipHtml += `
      <div class="tooltip-item">
        <span class="tooltip-label">武学技能加成</span>
        <span class="tooltip-value" style="color: #9c27b0">+${skillVal}</span>
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

  persistCharactersAndGameSave();

  loadCharacterData();

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
window.applyPlayerCharactersFromStorage = applyPlayerCharactersFromStorage;
window.characters = characters;
