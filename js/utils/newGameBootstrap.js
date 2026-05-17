/**
 * 新局全量归零并写入 localStorage（与 dev_new_game 同源，供开局问答页调用）
 */
(function (global) {
  var INIT =
    typeof GAME_CONFIG !== 'undefined' && GAME_CONFIG.INITIAL_STATS
      ? GAME_CONFIG.INITIAL_STATS
      : {};
  var FOUR_DIM_ANCHOR =
    typeof GAME_CONFIG !== 'undefined' && GAME_CONFIG.NEW_GAME_FOUR_DIM_ANCHOR != null
      ? GAME_CONFIG.NEW_GAME_FOUR_DIM_ANCHOR
      : INIT.strength != null
        ? INIT.strength
        : 5;
  var BASE_HP = INIT.maxHp != null ? INIT.maxHp : 100;
  var BASE_MP = INIT.maxMp != null ? INIT.maxMp : 50;
  var BASE_LEVEL = INIT.level != null ? INIT.level : 1;
  var BASE_ATTACK = INIT.attack != null ? INIT.attack : 50;
  var BASE_DEFENSE = INIT.defense != null ? INIT.defense : 5;
  var PRESERVE_KEYS = ['ai_config'];

  function buildFreshCombatStats(str, agi, bone, qi) {
    var lv = BASE_LEVEL;
    var atk = BASE_ATTACK;
    var hp = BASE_HP;
    var mp = BASE_MP;
    var hit = 75;
    var dodge = 22;
    var spd = 60;
    if (typeof deriveBaseStatFromFourDim === 'function') {
      atk = deriveBaseStatFromFourDim('attack', str, lv);
      hp = deriveBaseStatFromFourDim('hp', bone, lv);
      mp = deriveBaseStatFromFourDim('mp', qi, lv);
      hit = deriveBaseStatFromFourDim('hit', agi, lv);
      dodge = deriveBaseStatFromFourDim('dodge', agi, lv);
      spd = deriveBaseStatFromFourDim('speed', agi, lv);
    }
    return {
      strength: str,
      agility: agi,
      bone: bone,
      qi: qi,
      vitality: bone,
      spirit: qi,
      attack: atk,
      hp: hp,
      hit: hit,
      dodge: dodge,
      defense: BASE_DEFENSE,
      parry: Math.floor(str / 5),
      speed: spd,
      fist: 0,
      sword: 0,
      blade: 0,
      lightSkill: 0,
      innerSkill: 0,
      mp: mp,
      maxMp: mp
    };
  }

  function buildFreshProtagonist(four) {
    var st = buildFreshCombatStats(four.strength, four.agility, four.bone, four.qi);
    return {
      id: 1,
      name: '少侠',
      icon: '👨‍🦰',
      level: BASE_LEVEL,
      gender: '男',
      faction: '',
      power: 0,
      health: { current: st.hp, max: st.hp },
      exp: { current: 0, max: 100 },
      description: '初入江湖的少年侠客，心怀侠义，立志成为一代大侠。',
      equipped: {
        weapon: null,
        armor: null,
        helmet: null,
        shoes: null,
        accessory: null
      },
      skills: {},
      stats: st,
      remainingPoints: 0,
      gold: 0
    };
  }

  function buildFreshCompanion(four) {
    var st = buildFreshCombatStats(four.strength, four.agility, four.bone, four.qi);
    return {
      id: 2,
      name: '叶轻绾',
      icon: '👧',
      level: BASE_LEVEL,
      gender: '女',
      faction: '浣花剑阁',
      power: 0,
      health: { current: st.hp, max: st.hp },
      exp: { current: 0, max: 100 },
      description: '浣花剑阁外门弟子，奇遇《陌路相逢》入队后可同行。',
      equipped: {
        weapon: null,
        armor: null,
        helmet: null,
        shoes: null,
        accessory: null
      },
      skills: {},
      stats: st,
      remainingPoints: 0,
      gold: 0
    };
  }

  function buildGameSavePlayer(chars) {
    var hero = chars[0];
    var st = hero.stats;
    return {
      id: 'player',
      name: hero.name,
      level: BASE_LEVEL,
      exp: 0,
      expToNextLevel: 100,
      maxHp: st.hp,
      hp: st.hp,
      maxMp: st.maxMp,
      mp: st.mp,
      attack: st.attack,
      defense: st.defense,
      skills: [],
      inventory: [],
      stats: {
        strength: st.strength,
        agility: st.agility,
        vitality: st.bone,
        spirit: st.qi,
        bone: st.bone,
        qi: st.qi
      },
      gold: 0,
      remainingPoints: 0,
      flags: {},
      characters: chars
    };
  }

  function clearSessionStorage() {
    try {
      sessionStorage.removeItem('game_ui_return_href');
      sessionStorage.removeItem('game_map_restore_view');
    } catch (e) {}
  }

  function wipeLocalStorageExceptPreserve() {
    var kept = {};
    PRESERVE_KEYS.forEach(function (k) {
      var v = localStorage.getItem(k);
      if (v !== null) kept[k] = v;
    });
    var before = localStorage.length;
    localStorage.clear();
    Object.keys(kept).forEach(function (k) {
      localStorage.setItem(k, kept[k]);
    });
    return before;
  }

  /**
   * @param {{ strength: number, agility: number, bone: number, qi: number }} fourDim
   * @param {number|null} [saveSlot] 若指定则同步写入 game_save_{slot}（空存档槽开新局）
   * @returns {{ removed: number, chars: object[] }}
   */
  function resetNewGame(fourDim, saveSlot) {
    var four = {
      strength: fourDim.strength != null ? fourDim.strength : FOUR_DIM_ANCHOR,
      agility: fourDim.agility != null ? fourDim.agility : FOUR_DIM_ANCHOR,
      bone: fourDim.bone != null ? fourDim.bone : FOUR_DIM_ANCHOR,
      qi: fourDim.qi != null ? fourDim.qi : FOUR_DIM_ANCHOR
    };

    var removed = wipeLocalStorageExceptPreserve();
    var chars = [buildFreshProtagonist(four), buildFreshCompanion(four)];

    localStorage.setItem(
      'playerState',
      JSON.stringify({
        activeTasks: {},
        completedFactionQuests: {},
        joinedFaction: false,
        learnedSkills: [],
        factionContribution: 0
      })
    );

    var savePayload = {
      player: buildGameSavePlayer(chars),
      timestamp: Date.now(),
      version:
        typeof GAME_CONFIG !== 'undefined' && GAME_CONFIG.GAME_VERSION
          ? GAME_CONFIG.GAME_VERSION
          : 'demo'
    };
    localStorage.setItem('game_save_0', JSON.stringify(savePayload));
    if (saveSlot != null && saveSlot >= 0 && saveSlot < 5) {
      localStorage.setItem('game_save_' + saveSlot, JSON.stringify(savePayload));
    }

    localStorage.setItem('playerCharacters', JSON.stringify(chars));
    localStorage.setItem(
      'playerData',
      JSON.stringify({
        inventory: [],
        equipment: {
          weapon: null,
          armor: null,
          helmet: null,
          shoes: null,
          accessory: null
        },
        level: BASE_LEVEL
      })
    );

    localStorage.setItem('playerExperience', '0');
    localStorage.setItem('playerMartialArts_1', '[]');
    localStorage.setItem('playerMartialArts_2', '[]');
    localStorage.setItem('martialDataVersion', '5');
    localStorage.setItem('currentLocation', 'qingstone_town');
    localStorage.setItem('qingstone_map_location', 'qingstone_gate');
    clearSessionStorage();

    return { removed: removed, chars: chars, four: four };
  }

  function defaultFourDim() {
    return {
      strength: FOUR_DIM_ANCHOR,
      agility: FOUR_DIM_ANCHOR,
      bone: FOUR_DIM_ANCHOR,
      qi: FOUR_DIM_ANCHOR
    };
  }

  global.NewGameBootstrap = {
    FOUR_DIM_ANCHOR: FOUR_DIM_ANCHOR,
    defaultFourDim: defaultFourDim,
    buildFreshCombatStats: buildFreshCombatStats,
    resetNewGame: resetNewGame
  };
})(typeof window !== 'undefined' ? window : globalThis);
