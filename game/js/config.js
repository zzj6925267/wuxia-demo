/**
 * 游戏配置常量
 * @module config
 */

/**
 * 游戏基础配置
 */
const GAME_CONFIG = {
  /** 对外展示与存档元数据（与根目录 version.json 保持一致，发版时一并改） */
  GAME_VERSION: '0.1.1',

  /**
   * 本地数据（如武学 localStorage）结构版本，与存档 version 分离。
   * 仅当需要跑 DataMigration 时递增。
   */
  DATA_SCHEMA_VERSION: '1.0.1',

  // 玩家初始属性
  INITIAL_STATS: {
    level: 1,
    exp: 0,
    expToNextLevel: 100,
    maxHp: 100,
    hp: 100,
    maxMp: 50,
    mp: 50,
    attack: 50,
    defense: 5,
    strength: 5,
    agility: 5,
    vitality: 5,
    spirit: 5,
    gold: 0
  },

  /**
   * 阅历升级倍率（1～14 级每级所需 = floor(100 × EXP_MULTIPLIER^(等级-1))）。
   * 定案：进黑风寨 Boss 战前（主线 b08 + 九次剿匪 + 武馆考校，不含三场 Boss）约 15 级。
   */
  EXP_MULTIPLIER: 1.25,

  /** 新局四维基准：各维=此值时气血/内力/攻击与 INITIAL_STATS 一致 */
  NEW_GAME_FOUR_DIM_ANCHOR: 5,

  /** 每升 1 级获得的四维属性点（1 级不发，从 2 级起每级 +N） */
  STAT_POINTS_PER_LEVEL: 5,

  /** 角色面板 · 等级池（game_save_0.player.exp / char.exp.current）对外名 */
  CHAR_LEVEL_EXP_DISPLAY_NAME: '经验',
  /** 武学页 · 修炼池（localStorage.playerExperience / 战后 expReward）对外名 */
  MARTIAL_PRACTICE_DISPLAY_NAME: '历练',

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
  },

  // AI文案配置
  AI: {
    ENABLED: true,              // 是否启用AI功能
    AUTO_GENERATE_DIALOG: false // 是否自动生成对话
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

/**
 * 由四维+等级推导基础战斗属性（不含武学/装备）。
 * kind: hp | mp | attack | speed | hit | dodge
 */
function deriveBaseStatFromFourDim(kind, fourVal, level) {
  const anchor =
    window.GAME_CONFIG && window.GAME_CONFIG.NEW_GAME_FOUR_DIM_ANCHOR != null
      ? window.GAME_CONFIG.NEW_GAME_FOUR_DIM_ANCHOR
      : 5;
  const init = window.GAME_CONFIG && window.GAME_CONFIG.INITIAL_STATS
    ? window.GAME_CONFIG.INITIAL_STATS
    : { maxHp: 100, maxMp: 50 };
  const lv = Math.max(1, parseInt(level, 10) || 1);
  const d = Number.isFinite(Number(fourVal)) ? Number(fourVal) : anchor;
  switch (kind) {
    case 'hp':
      return init.maxHp + (d - anchor) * 5 + (lv - 1) * 10;
    case 'mp':
      return init.maxMp + (d - anchor) * 2 + (lv - 1) * 5;
    case 'attack':
      return 50 + (d - anchor) * 3;
    case 'speed':
      return 50 + (d - anchor) * 2;
    case 'hit':
      return 70 + (d - anchor);
    case 'dodge':
      return 20 + Math.floor((d - anchor) * 0.5);
    default:
      return 0;
  }
}

/** 升到下一级所需阅历（与各地图 checkLevelUp 一致） */
function getExpRequiredForLevel(level) {
  const lv = Math.max(1, parseInt(level, 10) || 1);
  const mult =
    window.GAME_CONFIG && window.GAME_CONFIG.EXP_MULTIPLIER != null
      ? window.GAME_CONFIG.EXP_MULTIPLIER
      : 1.25;
  return Math.floor(100 * Math.pow(mult, lv - 1));
}

/** 按当前 player.exp 连续升级，返回升了几级 */
function applyPlayerYueliLevelUps(player) {
  if (!player) return 0;
  let ups = 0;
  while (player.exp >= getExpRequiredForLevel(player.level)) {
    player.exp -= getExpRequiredForLevel(player.level);
    player.level = (parseInt(player.level, 10) || 1) + 1;
    ups++;
  }
  return ups;
}

function ensureCharacterExp(char) {
  if (!char) return;
  if (!char.exp || typeof char.exp !== 'object') {
    char.exp = { current: 0, max: 100 };
  }
  if (char.exp.current == null) char.exp.current = 0;
}

/** 队伍角色（playerCharacters 条目）按 exp.current 连续升级 */
function applyCharacterYueliLevelUps(char) {
  if (!char) return 0;
  ensureCharacterExp(char);
  let ups = 0;
  while (char.exp.current >= getExpRequiredForLevel(char.level)) {
    char.exp.current -= getExpRequiredForLevel(char.level);
    char.level = (parseInt(char.level, 10) || 1) + 1;
    ups++;
  }
  return ups;
}

function syncPartyMemberToSavePlayer(save, char) {
  if (!save || !save.player || !char) return;
  if (!save.player.characters) save.player.characters = [];
  const numId = Number(char.id);
  let idx = save.player.characters.findIndex(function (c) {
    return Number(c.id) === numId;
  });
  if (idx < 0) {
    save.player.characters.push(char);
    return;
  }
  const slot = save.player.characters[idx];
  slot.level = char.level;
  ensureCharacterExp(slot);
  slot.exp.current = char.exp.current;
  slot.remainingPoints = char.remainingPoints;
}

/**
 * 战后阅历：参战队友（charId≠1）与少侠同额「角色阅历」，写入 playerCharacters。
 * @param {object} save game_save_0
 * @param {number[]} partyCharIds 本场 allyTeam 中非少侠的 id（由 battle.js 写入 pending）
 */
function processPartyBattleYueli(save, partyCharIds, amount, options) {
  const ids = Array.isArray(partyCharIds) ? partyCharIds : [];
  const yueli = parseInt(amount, 10) || 0;
  if (yueli <= 0 || !ids.length) {
    return { membersUpdated: 0, levelsGained: 0 };
  }

  let chars;
  try {
    const raw = localStorage.getItem('playerCharacters');
    if (!raw) return { membersUpdated: 0, levelsGained: 0 };
    chars = JSON.parse(raw);
  } catch (e) {
    return { membersUpdated: 0, levelsGained: 0 };
  }
  if (!Array.isArray(chars)) return { membersUpdated: 0, levelsGained: 0 };

  let membersUpdated = 0;
  let totalLevels = 0;

  ids.forEach(function (cid) {
    const numId = parseInt(cid, 10);
    if (!Number.isFinite(numId) || numId === 1) return;
    const idx = chars.findIndex(function (c) {
      return Number(c.id) === numId;
    });
    if (idx < 0) return;
    const ch = chars[idx];
    ensureCharacterExp(ch);
    ch.exp.current = (parseInt(ch.exp.current, 10) || 0) + yueli;
    const ups = applyCharacterYueliLevelUps(ch);
    if (ups > 0) {
      const pts = ups * getStatPointsPerLevel();
      ch.remainingPoints = (ch.remainingPoints || 0) + pts;
      if (typeof reconcileProtagonistStatPoints === 'function') {
        reconcileProtagonistStatPoints(ch);
      }
      totalLevels += ups;
    }
    syncPartyMemberToSavePlayer(save, ch);
    membersUpdated++;

    if (typeof window !== 'undefined' && window.characters) {
      const mem = window.characters.find(function (c) {
        return Number(c.id) === numId;
      });
      if (mem) {
        mem.level = ch.level;
        ensureCharacterExp(mem);
        mem.exp.current = ch.exp.current;
        mem.remainingPoints = ch.remainingPoints;
      }
    }
  });

  try {
    localStorage.setItem('playerCharacters', JSON.stringify(chars));
  } catch (e) {
    console.warn('processPartyBattleYueli: 写入 playerCharacters 失败', e);
  }

  return { membersUpdated: membersUpdated, levelsGained: totalLevels };
}

function getStatPointsPerLevel() {
  return window.GAME_CONFIG && window.GAME_CONFIG.STAT_POINTS_PER_LEVEL != null
    ? window.GAME_CONFIG.STAT_POINTS_PER_LEVEL
    : 5;
}

/** 阅历升级后：发属性点并同步少侠到 playerCharacters / 面板等级 */
function syncProtagonistLevelExpFromPlayer(player) {
  if (!player) return;
  const lv = parseInt(player.level, 10) || 1;
  const exp = player.exp != null ? player.exp : 0;
  try {
    const raw = localStorage.getItem('playerCharacters');
    if (raw) {
      const chars = JSON.parse(raw);
      if (chars[0]) {
        chars[0].level = lv;
        if (!chars[0].exp) chars[0].exp = { current: 0, max: 100 };
        chars[0].exp.current = exp;
        localStorage.setItem('playerCharacters', JSON.stringify(chars));
      }
    }
  } catch (e) {}
  if (typeof window !== 'undefined' && window.characters && window.characters[0]) {
    window.characters[0].level = lv;
    if (!window.characters[0].exp) window.characters[0].exp = { current: 0, max: 100 };
    window.characters[0].exp.current = exp;
  }
  const el = document.getElementById('charLevel');
  if (el) el.textContent = 'Lv.' + lv;
  if (typeof CHAR_UI !== 'undefined' && CHAR_UI && CHAR_UI.charLevel) {
    CHAR_UI.charLevel.textContent = 'Lv.' + lv;
  }
  if (
    typeof CHAR_UI !== 'undefined' &&
    CHAR_UI &&
    CHAR_UI.remainingPoints &&
    window.characters &&
    window.characters[0]
  ) {
    CHAR_UI.remainingPoints.textContent = window.characters[0].remainingPoints;
  }
}

/** 按等级补全应得未分配属性点（修复旧档升级未发点） */
function reconcileProtagonistStatPoints(char) {
  if (!char || !char.stats) return;
  const anchor =
    window.GAME_CONFIG && window.GAME_CONFIG.NEW_GAME_FOUR_DIM_ANCHOR != null
      ? window.GAME_CONFIG.NEW_GAME_FOUR_DIM_ANCHOR
      : 5;
  const lv = parseInt(char.level, 10) || 1;
  const earned = Math.max(0, (lv - 1) * getStatPointsPerLevel());
  const st = char.stats;
  const spent = Math.max(
    0,
    Math.max(0, (st.strength || anchor) - anchor) +
      Math.max(0, (st.agility || anchor) - anchor) +
      Math.max(0, (st.bone != null ? st.bone : st.vitality || anchor) - anchor) +
      Math.max(0, (st.qi != null ? st.qi : st.spirit || anchor) - anchor)
  );
  const shouldHave = Math.max(0, earned - spent);
  if ((char.remainingPoints || 0) < shouldHave) {
    char.remainingPoints = shouldHave;
  }
}

function grantStatPointsToProtagonistMem(amount) {
  if (!amount || amount <= 0) return;
  if (typeof window !== 'undefined' && window.characters && window.characters[0]) {
    window.characters[0].remainingPoints =
      (window.characters[0].remainingPoints || 0) + amount;
  }
}

/**
 * 角色面板打开时：把积压的「当前级阅历池」结算为等级（少侠以 save.player 为准，并吸收 playerCharacters 里偏高的池）。
 * 阅历池语义 = 距下一级还差多少以内的累计值，升级时会按 getExpRequiredForLevel 逐级扣除，不是生涯总阅历。
 */
function reconcileYueliOnCharacterPanel() {
  try {
    const sd = localStorage.getItem('game_save_0');
    if (!sd) return { levelsGained: 0, newLevel: 1, pointsGained: 0 };
    const save = JSON.parse(sd);
    if (!save.player) return { levelsGained: 0, newLevel: 1, pointsGained: 0 };

    let memHero = null;
    try {
      const raw = localStorage.getItem('playerCharacters');
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          memHero = list.find(function (c) {
            return Number(c.id) === 1;
          });
          if (!memHero && list[0]) memHero = list[0];
        }
      }
    } catch (e) {
      memHero = null;
    }

    let pool = parseInt(save.player.exp, 10) || 0;
    if (memHero && memHero.exp) {
      const memPool = parseInt(memHero.exp.current, 10) || 0;
      if (memPool > pool) pool = memPool;
    }
    save.player.exp = pool;
    save.player.level = parseInt(save.player.level, 10) || parseInt(memHero && memHero.level, 10) || 1;

    const up =
      typeof processYueliLevelUpsForSave === 'function'
        ? processYueliLevelUpsForSave(save, { silent: true })
        : { levelsGained: 0, newLevel: save.player.level, pointsGained: 0 };

    if (save.player.characters && Array.isArray(save.player.characters)) {
      save.player.characters.forEach(function (slot, idx) {
        if (!slot || Number(slot.id) === 1) return;
        ensureCharacterExp(slot);
        const ups = applyCharacterYueliLevelUps(slot);
        if (ups > 0) {
          slot.remainingPoints = (slot.remainingPoints || 0) + ups * getStatPointsPerLevel();
          if (typeof reconcileProtagonistStatPoints === 'function') {
            reconcileProtagonistStatPoints(slot);
          }
        }
        if (typeof window !== 'undefined' && window.characters) {
          const mem = window.characters.find(function (c) {
            return Number(c.id) === Number(slot.id);
          });
          if (mem) {
            mem.level = slot.level;
            ensureCharacterExp(mem);
            mem.exp.current = slot.exp.current;
            mem.remainingPoints = slot.remainingPoints;
          }
        }
        try {
          const rawPc = localStorage.getItem('playerCharacters');
          if (rawPc) {
            const pcList = JSON.parse(rawPc);
            const pcMem = Array.isArray(pcList)
              ? pcList.find(function (c) {
                  return Number(c.id) === Number(slot.id);
                })
              : null;
            if (pcMem && slot.exp) {
              ensureCharacterExp(pcMem);
              pcMem.level = slot.level;
              pcMem.exp.current = slot.exp.current;
              pcMem.remainingPoints = slot.remainingPoints;
              localStorage.setItem('playerCharacters', JSON.stringify(pcList));
            }
          }
        } catch (e) {
          console.warn('reconcileYueli companion playerCharacters', e);
        }
      });
    }

    localStorage.setItem('game_save_0', JSON.stringify(save));
    return up;
  } catch (e) {
    console.warn('reconcileYueliOnCharacterPanel', e);
    return { levelsGained: 0, newLevel: 1, pointsGained: 0 };
  }
}

/**
 * 处理 save.player 阅历升级：写回存档内少侠等级/属性点，并同步 localStorage。
 * @returns {{ levelsGained: number, newLevel: number, pointsGained: number }}
 */
function processYueliLevelUpsForSave(save, options) {
  if (!save || !save.player) return { levelsGained: 0, newLevel: 1, pointsGained: 0 };
  const ups = applyPlayerYueliLevelUps(save.player);
  if (ups <= 0) {
    syncProtagonistLevelExpFromPlayer(save.player);
    return {
      levelsGained: 0,
      newLevel: save.player.level || 1,
      pointsGained: 0
    };
  }
  const pointsGained = ups * getStatPointsPerLevel();
  save.player.remainingPoints = (save.player.remainingPoints || 0) + pointsGained;
  if (save.player.characters && save.player.characters[0]) {
    const hero = save.player.characters[0];
    hero.level = save.player.level;
    if (!hero.exp) hero.exp = { current: 0, max: 100 };
    hero.exp.current = save.player.exp;
    hero.remainingPoints = (hero.remainingPoints || 0) + pointsGained;
  }
  grantStatPointsToProtagonistMem(pointsGained);
  try {
    const raw = localStorage.getItem('playerCharacters');
    if (raw) {
      const chars = JSON.parse(raw);
      if (chars[0]) {
        chars[0].level = save.player.level;
        if (!chars[0].exp) chars[0].exp = { current: 0, max: 100 };
        chars[0].exp.current = save.player.exp;
        chars[0].remainingPoints = (chars[0].remainingPoints || 0) + pointsGained;
        localStorage.setItem('playerCharacters', JSON.stringify(chars));
      }
    }
  } catch (e) {}
  syncProtagonistLevelExpFromPlayer(save.player);
  const silent = options && options.silent;
  if (!silent) {
    try {
      localStorage.setItem(
        'levelUpInfo',
        JSON.stringify({
          level: save.player.level,
          levelsGained: ups,
          pointsGained: pointsGained
        })
      );
    } catch (e) {}
  }
  return {
    levelsGained: ups,
    newLevel: save.player.level,
    pointsGained: pointsGained
  };
}

// 暴露到全局
/** 角色等级经验条 / 战后 save.player.exp 飘字 */
function getCharLevelExpDisplayName() {
  if (GAME_CONFIG && GAME_CONFIG.CHAR_LEVEL_EXP_DISPLAY_NAME) {
    return String(GAME_CONFIG.CHAR_LEVEL_EXP_DISPLAY_NAME);
  }
  return '经验';
}

/** 武学修炼 / playerExperience / 战后 expReward 飘字 */
function getMartialPracticeDisplayName() {
  if (GAME_CONFIG && GAME_CONFIG.MARTIAL_PRACTICE_DISPLAY_NAME) {
    return String(GAME_CONFIG.MARTIAL_PRACTICE_DISPLAY_NAME);
  }
  return '历练';
}

/** @deprecated 请用 getMartialPracticeDisplayName（武学池）或 getCharLevelExpDisplayName（角色等级池） */
function getYueliDisplayName() {
  return getMartialPracticeDisplayName();
}

window.GAME_CONFIG = GAME_CONFIG;
window.getCharLevelExpDisplayName = getCharLevelExpDisplayName;
window.getMartialPracticeDisplayName = getMartialPracticeDisplayName;
window.getYueliDisplayName = getYueliDisplayName;
window.GAME_STATE = GAME_STATE;
window.SKILL_TYPE = SKILL_TYPE;
window.CHARACTER_TYPE = CHARACTER_TYPE;
window.getExpRequiredForLevel = getExpRequiredForLevel;
window.applyPlayerYueliLevelUps = applyPlayerYueliLevelUps;
window.applyCharacterYueliLevelUps = applyCharacterYueliLevelUps;
window.processPartyBattleYueli = processPartyBattleYueli;
window.reconcileYueliOnCharacterPanel = reconcileYueliOnCharacterPanel;
window.getStatPointsPerLevel = getStatPointsPerLevel;
window.syncProtagonistLevelExpFromPlayer = syncProtagonistLevelExpFromPlayer;
window.processYueliLevelUpsForSave = processYueliLevelUpsForSave;
window.reconcileProtagonistStatPoints = reconcileProtagonistStatPoints;
window.deriveBaseStatFromFourDim = deriveBaseStatFromFourDim;

/**
 * 角色面板打开队友时：结算该角色独立阅历池（char.exp.current）并写回存档。
 * @returns {{ levelsGained: number, pointsGained: number }}
 */
function reconcilePartyMemberYueliOnPanel(char) {
  if (!char || Number(char.id) === 1) {
    return { levelsGained: 0, pointsGained: 0 };
  }
  ensureCharacterExp(char);
  const ups = applyCharacterYueliLevelUps(char);
  if (ups <= 0) {
    return { levelsGained: 0, pointsGained: 0 };
  }
  const pointsGained = ups * getStatPointsPerLevel();
  char.remainingPoints = (char.remainingPoints || 0) + pointsGained;
  if (typeof reconcileProtagonistStatPoints === 'function') {
    reconcileProtagonistStatPoints(char);
  }
  try {
    if (typeof window !== 'undefined' && window.characters) {
      localStorage.setItem('playerCharacters', JSON.stringify(window.characters));
    }
    const sd = localStorage.getItem('game_save_0');
    if (sd) {
      const save = JSON.parse(sd);
      syncPartyMemberToSavePlayer(save, char);
      localStorage.setItem('game_save_0', JSON.stringify(save));
    }
  } catch (e) {
    console.warn('reconcilePartyMemberYueliOnPanel', e);
  }
  return { levelsGained: ups, pointsGained: pointsGained };
}

window.reconcilePartyMemberYueliOnPanel = reconcilePartyMemberYueliOnPanel;

/**
 * 队伍战/角色面板共用：气血上限 = 四维基础 + 武学 stats.hp + 装备 + 被动 maxHpBuff
 * @param {object} char - playerCharacters 条目
 * @param {{ martialHp?: number, equipHp?: number, innerHpBonus?: number }} addons
 */
function computeCombatMaxHp(char, addons) {
  addons = addons || {};
  const s = (char && char.stats) || {};
  const bone = s.bone != null ? s.bone : s.vitality != null ? s.vitality : 5;
  const lv = Math.max(1, parseInt(char && char.level, 10) || 1);
  const base =
    typeof deriveBaseStatFromFourDim === 'function'
      ? deriveBaseStatFromFourDim('hp', bone, lv)
      : 100 + (bone - 5) * 5 + (lv - 1) * 10;
  return (
    base +
    (addons.martialHp || 0) +
    (addons.equipHp || 0) +
    (addons.innerHpBonus || 0)
  );
}

/**
 * 队伍战/角色面板共用：内力上限 = 四维基础 + 武学 stats.mp/innerSkill + 装备
 */
function computeCombatMaxMp(char, addons) {
  addons = addons || {};
  const s = (char && char.stats) || {};
  const qi = s.qi != null ? s.qi : s.spirit != null ? s.spirit : 5;
  const lv = Math.max(1, parseInt(char && char.level, 10) || 1);
  const base =
    typeof deriveBaseStatFromFourDim === 'function'
      ? deriveBaseStatFromFourDim('mp', qi, lv)
      : 50 + (qi - 5) * 2 + (lv - 1) * 5;
  return base + (addons.martialMp || 0) + (addons.equipMp || 0);
}

window.computeCombatMaxHp = computeCombatMaxHp;
window.computeCombatMaxMp = computeCombatMaxMp;