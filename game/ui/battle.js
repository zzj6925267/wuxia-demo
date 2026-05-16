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
  allyTeam: [],
  enemyTeam: [],
  turnOrder: [],
  currentTurnIndex: 0,
  hudActorOverride: null,
  /** 非空：首次点「自动战斗」时播敌方气泡，播完再写「战斗开始」日志 */
  pendingPreBattleIntro: null,
  /** 是否已完成「战前气泡 + 战斗开始日志」阶段（停战后再次自动战斗不再重复） */
  openingPrimed: false,
  isAutoFighting: false,
  battleEnded: false,
  turnCount: 1,
  /** 已播放的 combatPerformances 键：`enemyId:perfId` */
  combatPerformancesPlayed: {},
  /** 战后返回的小地图页（在 initBattle 清空 BattleEntry 前根据 battle_entry_source 写入） */
  returnMapHref: 'forest_map.html',
  /** 进入战斗前页的 `battle_entry_source`，败北分支（如黑风寨）会用到 */
  battleEntrySource: null,
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
    qingstone_map: 'qingstone_map.html',
    heifeng_dungeon: 'heifeng_dungeon.html'
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
    } else {
      arts = [];
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
    const eff =
      typeof resolveActiveDamageEffect === 'function'
        ? resolveActiveDamageEffect(activeSkill, equippedMartial.id)
        : activeSkill && activeSkill.effect;
    if (!activeSkill || !eff || eff.type !== 'damage') {
      return skills;
    }

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
    if (activeSkill.axeFx) skillData.axeFx = true;
    if (activeSkill.bladeFx) skillData.bladeFx = true;
    attachSkillHitRollExtras(activeSkill, skillData);

    // 正阳·阳刚：对当前武功主动伤害倍率 +value（与旧版直刺逻辑一致）
    for (const skill of equippedMartial.skills) {
      if (skill.type === '被动' && martialLevel >= (skill.unlockLevel || 1)) {
        skillData.effect.value += getYangGangDamageMultiplierDeltaFromSkill(skill);
      }
    }

    // 最后一个已解锁的「追击」被动（剑影等：passiveIds 表或旧 effect.followAttack）
    const followSkill = mergeFollowSkillFromMartialSkills(equippedMartial, martialLevel);
    if (followSkill) skillData.followSkill = followSkill;

    skills.push(skillData);
  } catch (e) {
    console.warn('获取武学技能失败', e);
  }
  return skills;
}

/** 副本/敌人：从 MARTIAL_ARTS_LIBRARY 取条目（与玩家共用表，勿硬编码招式数值） */
function getMartialArtLibraryEntry(martialArtId) {
  const lib =
    typeof MARTIAL_ARTS_LIBRARY !== 'undefined'
      ? MARTIAL_ARTS_LIBRARY
      : typeof window !== 'undefined' && window.MARTIAL_ARTS_LIBRARY
        ? window.MARTIAL_ARTS_LIBRARY
        : [];
  return lib.find(function (m) {
    return m && m.id === martialArtId;
  }) || null;
}

/** 主动上 useHitRoll / onMissFollow（被动表 onActiveMiss 或内联 onMissFollow）透传到战斗 skill 对象 */
function attachSkillHitRollExtras(activeSkill, skillData) {
  if (!activeSkill || !skillData) return;
  const fromPassive =
    typeof expandOnMissFollowFromSkill === 'function'
      ? expandOnMissFollowFromSkill(activeSkill)
      : null;
  const missFollow = fromPassive || activeSkill.onMissFollow;
  if (activeSkill.useHitRoll || missFollow) {
    skillData.useHitRoll = true;
  }
  if (missFollow) {
    const f = missFollow;
    skillData.onMissFollow = {
      baseChance: f.baseChance,
      chanceAttr: f.chanceAttr,
      chancePerPoint: f.chancePerPoint,
      damage: f.damage,
      skillName: f.skillName || '续刺'
    };
  }
}

/** 正阳·阳刚：对主动伤害倍率叠加的 value（如 0.1=+10%）；passiveIds→loadoutPassive 或旧内联 effect */
function getYangGangDamageMultiplierDeltaFromSkill(skill) {
  if (!skill || skill.type !== '被动' || skill.name !== '阳刚') return 0;
  if (
    skill.effect &&
    skill.effect.type === 'buff' &&
    skill.effect.stat === 'attack' &&
    typeof skill.effect.value === 'number'
  ) {
    return Number(skill.effect.value) || 0;
  }
  const loadout =
    typeof expandLoadoutPassiveStatBonuses === 'function'
      ? expandLoadoutPassiveStatBonuses(skill)
      : [];
  for (let i = 0; i < loadout.length; i++) {
    const fx = loadout[i];
    if (
      fx &&
      fx.type === 'buff' &&
      fx.stat === 'attack' &&
      typeof fx.value === 'number' &&
      (fx.baseValue == null || fx.baseValue === undefined)
    ) {
      return Number(fx.value) || 0;
    }
  }
  return 0;
}

/** passiveIds 被动表优先于 skill.effect.followAttack（兼容旧存档内联 effect） */
function mergeFollowSkillFromMartialSkills(martial, martialLevel) {
  let followSkill = null;
  if (!martial || !martial.skills) return null;
  for (const skill of martial.skills) {
    if (skill.type !== '被动' || martialLevel < (skill.unlockLevel || 99)) continue;
    const fromPassive =
      typeof expandFollowAttackFromPassiveSkill === 'function'
        ? expandFollowAttackFromPassiveSkill(skill)
        : null;
    let fromLegacy = null;
    if (skill.effect && skill.effect.type === 'followAttack') {
      fromLegacy = {
        type: 'followAttack',
        baseChance: skill.effect.baseChance,
        damage: skill.effect.damage,
        chanceAttr: skill.effect.chanceAttr,
        chancePerPoint: skill.effect.chancePerPoint,
        skillName: skill.name
      };
    }
    const pick = fromPassive || fromLegacy;
    if (pick) followSkill = pick;
  }
  return followSkill;
}

function computeSkillAttackPower(actor, multiplier) {
  return Math.max(0, Math.floor((Number(actor.attack) || 0) * multiplier));
}

/** 武学主动（非命中卷分支）与追击：扣目标防御，与 BattleHitRoll 物伤公式一致 */
function resolveFlatSkillDamage(power, defender) {
  const p = Math.floor(Number(power) || 0);
  const def = Math.floor(Number(defender && defender.defense) || 0);
  return Math.max(1, p - def);
}

function rollAttackerForHitRoll(actor, effectiveAttack) {
  return Object.assign({}, actor, { attack: effectiveAttack });
}

/** 命中卷结果 → 飘字、日志、扣血；返回是否造成有效伤害 */
function applyHitRollResultToTarget(actor, target, result, fxOpts, logContext) {
  const speedExtra = fxOpts && fxOpts.presentation === 'speedExtra';
  const ctx = logContext || {};

  if (result.isDodge) {
    showBattleText(target.id, '闪避', 'miss');
    showDodgeGlint(target);
    void showDodgeAnimation(target);
    addBattleLogMaybeSpeed(
      typeof BattleNarrative !== 'undefined'
        ? BattleNarrative.dodge(actor, target)
        : `${target.name} 闪避了${actor.name}的「${ctx.verb || '攻击'}」！`,
      speedExtra
    );
    return { kind: 'dodge', damage: 0 };
  }
  if (result.isParry) {
    showBattleText(target.id, '招架', 'parry');
    showDamageNumber(target.id, -result.damage);
    target.hp = Math.max(0, target.hp - result.damage);
    showMeleeHitFeedback(target);
    addBattleLogMaybeSpeed(
      typeof BattleNarrative !== 'undefined'
        ? BattleNarrative.parry(actor, target, result.damage)
        : `${target.name} 招架${ctx.verb || ''}，受到 ${result.damage} 点伤害！`,
      speedExtra
    );
    return { kind: 'parry', damage: result.damage };
  }
  if (result.damage > 0) {
    showDamageNumber(target.id, -result.damage, result.isCritical);
    target.hp = Math.max(0, target.hp - result.damage);
    showMeleeHitFeedback(target);
    const msg =
      ctx.onHitLog ||
      (typeof BattleNarrative !== 'undefined' && ctx.battleNarrativeHit
        ? ctx.battleNarrativeHit(actor, target, result.damage, result.isCritical)
        : `${actor.name} ${ctx.verb || '命中'} ${target.name}，造成 ${result.damage} 点伤害！`);
    addBattleLogMaybeSpeed(msg, speedExtra);
    return { kind: 'hit', damage: result.damage, isCritical: result.isCritical };
  }

  showBattleText(target.id, '未中', 'miss');
  addBattleLogMaybeSpeed(`${actor.name} 一招${ctx.verb || ''}未中！`, speedExtra);
  return { kind: 'miss', damage: 0 };
}

function markTargetDeadIfNeeded(target, actor, fxOpts) {
  if (target.hp > 0) return;
  target.isDead = true;
  target.hp = 0;
  addBattleLogMaybeSpeed(
    typeof BattleNarrative !== 'undefined'
      ? BattleNarrative.defeated(target.name)
      : `${target.name} 被击败！`,
    !!(fxOpts && fxOpts.presentation === 'speedExtra')
  );
  const targetCard = document.getElementById(`char-${target.id}`);
  if (targetCard) targetCard.classList.add('dead');
  if (typeof clearCombatBuffFxForChar === 'function') {
    clearCombatBuffFxForChar(target);
  }
}

/** 落草剑经等：首刺被闪避后，按身法加成的概率续刺（与正阳「剑影」命中后追击区分） */
async function checkFollowAttackOnMiss(actor, target, onMissFollow, fxOpts) {
  if (!onMissFollow || !actor || !target || target.isDead) return;
  const stats = actor.stats || {};
  const attrVal = onMissFollow.chanceAttr ? stats[onMissFollow.chanceAttr] || 0 : 0;
  const chance = Math.min(
    1,
    (Number(onMissFollow.baseChance) || 0) + attrVal * (Number(onMissFollow.chancePerPoint) || 0)
  );
  if (Math.random() >= chance) return;

  const speedExtra = fxOpts && fxOpts.presentation === 'speedExtra';
  const label = onMissFollow.skillName || '续刺';
  showSkillBubble(
    actor.id,
    speedExtra ? `速补 · ${label}` : label,
    speedExtra ? { variant: 'speedExtra' } : undefined
  );
  await sleep(400);
  showSwordEffect(actor, target, 'plain');

  const mult = onMissFollow.damage != null ? Number(onMissFollow.damage) : 0.85;
  const power = computeSkillAttackPower(actor, mult);
  const result = window.BattleHitRoll.resolveDamage(rollAttackerForHitRoll(actor, power), target);
  applyHitRollResultToTarget(actor, target, result, fxOpts, {
    verb: '续刺',
    onHitLog:
      typeof BattleNarrative !== 'undefined'
        ? BattleNarrative.followAttack(actor, target, result.damage)
        : `${actor.name} 续刺${result.damage > 0 ? '命中' : '落空'}${result.damage > 0 ? '，造成 ' + result.damage + ' 点伤害！' : '！'}`
  });
  markTargetDeadIfNeeded(target, actor, fxOpts);
  updateHpDisplay(target.id, target.hp);
  await sleep(300);
}

/** 敌人已解锁被动（如开合刀法「合」）计入 attack 等，开战时调用一次 */
function applyEnemyMartialPassives(enemy) {
  if (enemy == null || enemy.martialArtId == null) return enemy;
  const martial = getMartialArtLibraryEntry(enemy.martialArtId);
  if (!martial || !martial.skills) return enemy;
  const martialLevel =
    enemy.martialLevel != null && enemy.martialLevel > 0 ? enemy.martialLevel : 10;
  const stats = enemy.stats || {};
  for (const skill of martial.skills) {
    if (skill.type !== '被动' || martialLevel < (skill.unlockLevel || 99)) continue;
    const loadoutFx =
      typeof expandLoadoutPassiveStatBonuses === 'function'
        ? expandLoadoutPassiveStatBonuses(skill)
        : [];
    const effectsToApply =
      loadoutFx.length > 0 ? loadoutFx : skill.effect ? [skill.effect] : [];
    for (const eff of effectsToApply) {
      if (!eff) continue;
      if (eff.type === 'turnStartSelfBuff') continue;
      if (eff.type === 'defenseBuff') {
        const defStat = eff.stat;
        if (defStat === 'defense' || defStat === undefined || defStat === null) {
          let add = eff.baseValue || 0;
          if (eff.bonusAttr) {
            add += (stats[eff.bonusAttr] || 0) * (eff.bonusPerPoint || 0);
          }
          enemy.defense = Math.floor((enemy.defense || 0) + Math.ceil(add));
        }
      } else if (eff.type === 'maxHpBuff') {
        let add = eff.baseValue || 0;
        if (eff.bonusAttr) {
          add += (stats[eff.bonusAttr] || 0) * (eff.bonusPerPoint || 0);
        }
        const inc = Math.ceil(add);
        enemy.maxHp = Math.floor((enemy.maxHp || 0) + inc);
        enemy.hp = Math.floor((enemy.hp || 0) + inc);
      } else if (eff.type === 'buff' && eff.stat === 'attack') {
        const add =
          (eff.baseValue || 0) + (stats[eff.bonusAttr] || 0) * (eff.bonusPerPoint || 0);
        enemy.attack = Math.floor((enemy.attack || 0) + add);
      } else if (eff.type === 'buff' && eff.stat === 'hit') {
        const basePct = typeof eff.value === 'number' ? eff.value : 0;
        const baseHit = basePct < 1 ? Math.floor(basePct * 100) : Math.floor(basePct);
        const perPoint = eff.bonusPerPoint != null ? eff.bonusPerPoint : 0;
        const attrHit = Math.floor((stats[eff.bonusAttr] || 0) * (perPoint < 1 ? perPoint * 100 : perPoint));
        enemy.hit = Math.floor((enemy.hit || 0) + baseHit + attrHit);
      } else if (eff.type === 'buff' && eff.stat === 'parry') {
        const add =
          (eff.baseValue || 0) + (stats[eff.bonusAttr] || 0) * (eff.bonusPerPoint || 0);
        enemy.parry = Math.floor((enemy.parry || 0) + add);
      } else if (eff.type === 'buff' && eff.stat === 'speed') {
        const add =
          (eff.baseValue || 0) + (stats[eff.bonusAttr] || 0) * (eff.bonusPerPoint || 0);
        enemy.speed = Math.floor((enemy.speed || 0) + add);
      } else if (eff.type === 'buff' && eff.stat === 'dodge') {
        const add =
          (eff.baseValue || 0) + (stats[eff.bonusAttr] || 0) * (eff.bonusPerPoint || 0);
        enemy.dodge = Math.floor((enemy.dodge || 0) + add);
      }
    }
  }
  return enemy;
}

function buildSkillDataFromMartialActive(activeSkill, martial, martialLevel) {
  const eff =
    typeof resolveActiveDamageEffect === 'function'
      ? resolveActiveDamageEffect(activeSkill, martial && martial.id)
      : activeSkill && activeSkill.effect;
  if (!activeSkill || !eff || eff.type !== 'damage') return null;
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
  if (activeSkill.axeFx) skillData.axeFx = true;
  if (activeSkill.bladeFx) skillData.bladeFx = true;
  attachSkillHitRollExtras(activeSkill, skillData);
  for (const skill of martial.skills) {
    if (skill.type === '被动' && martialLevel >= (skill.unlockLevel || 1)) {
      skillData.effect.value += getYangGangDamageMultiplierDeltaFromSkill(skill);
    }
  }
  let followSkill = mergeFollowSkillFromMartialSkills(martial, martialLevel);
  if (followSkill) skillData.followSkill = followSkill;
  return skillData;
}

/** 敌人武学主动（内力够则与玩家同样 mpCost / 伤害公式） */
function getAvailableSkillsForEnemy(enemy) {
  const skills = [];
  if (enemy == null || enemy.martialArtId == null) return skills;
  const martial = getMartialArtLibraryEntry(enemy.martialArtId);
  if (!martial || martial.type !== '武功' || !martial.skills || !martial.skills.length) {
    return skills;
  }
  const martialLevel =
    enemy.martialLevel != null && enemy.martialLevel > 0 ? enemy.martialLevel : 10;
  const activeSkill = martial.skills.find(function (s) {
    return s && s.type === '主动' && martialLevel >= (s.unlockLevel || 1);
  });
  const skillData = buildSkillDataFromMartialActive(activeSkill, martial, martialLevel);
  if (skillData) skills.push(skillData);
  return skills;
}

function prepareEnemyForBattle(enemy) {
  const e = Object.assign({}, enemy);
  e.isAlly = false;
  e.isDead = false;
  e.maxHp = e.maxHp != null ? e.maxHp : e.hp;
  e.hp = e.maxHp;
  if (e.maxMp != null) {
    e.mp = e.maxMp;
  } else if (e.mp == null) {
    e.mp = undefined;
  }
  if (!e.stats) {
    const lv = e.level || 1;
    e.stats = {
      strength: Math.max(8, Math.floor(lv * 0.85)),
      agility: 10,
      bone: 10,
      qi: 10
    };
  }
  applyEnemyMartialPassives(e);
  if (typeof initCombatBuffState === 'function') initCombatBuffState(e);
  return e;
}

/** 从武学 passive 收集「回合开始自叠 Buff」：旧 effect.turnStartSelfBuff + passiveIds→battlePassives（定义见 battleBuffs.js） */
function collectTurnStartSelfBuffPassives(char) {
  const out = [];
  if (!char) return out;

  if (char.isAlly) {
    const list = getBattleMergedMartialArtsList(char.id);
    for (const martial of list) {
      if (!martial.equipped || martial.type !== '武功' || !martial.skills) continue;
      const lv = martial.currentLevel || 1;
      for (const skill of martial.skills) {
        if (skill.type !== '被动' || lv < (skill.unlockLevel || 99)) continue;
        const eff = skill.effect;
        if (eff && eff.type === 'turnStartSelfBuff' && eff.buffId) {
          out.push({
            buffId: eff.buffId,
            fromTurn: eff.fromTurn != null ? eff.fromTurn : 2,
            stacksPerTick: eff.stacksPerTick != null ? eff.stacksPerTick : 1,
            skillName: skill.name
          });
        }
        if (typeof expandTurnStartApplyBuffActions === 'function') {
          for (const row of expandTurnStartApplyBuffActions(skill)) {
            out.push({
              buffId: row.buffId,
              fromTurn: row.fromTurn,
              stacksPerTick: row.stacksPerTick,
              skillName: skill.name
            });
          }
        }
      }
    }
    return out;
  }

  if (char.martialArtId == null) return out;
  const martial = getMartialArtLibraryEntry(char.martialArtId);
  if (!martial || !martial.skills) return out;
  const lv = char.martialLevel != null && char.martialLevel > 0 ? char.martialLevel : 10;
  for (const skill of martial.skills) {
    if (skill.type !== '被动' || lv < (skill.unlockLevel || 99)) continue;
    const eff = skill.effect;
    if (eff && eff.type === 'turnStartSelfBuff' && eff.buffId) {
      out.push({
        buffId: eff.buffId,
        fromTurn: eff.fromTurn != null ? eff.fromTurn : 2,
        stacksPerTick: eff.stacksPerTick != null ? eff.stacksPerTick : 1,
        skillName: skill.name
      });
    }
    if (typeof expandTurnStartApplyBuffActions === 'function') {
      for (const row of expandTurnStartApplyBuffActions(skill)) {
        out.push({
          buffId: row.buffId,
          fromTurn: row.fromTurn,
          stacksPerTick: row.stacksPerTick,
          skillName: skill.name
        });
      }
    }
  }
  return out;
}

/** 供 battleBuffs.js 按武学 rank 选头像特效档（初/中/高绝 → CSS 或 Canvas） */
function getMartialRankForCombatBuff(char, buffId) {
  if (!char) return '初阶';
  if (char.isAlly) {
    const list = getBattleMergedMartialArtsList(char.id);
    for (const martial of list) {
      if (!martial.equipped || martial.type !== '武功' || !martial.skills) continue;
      for (const skill of martial.skills) {
        if (
          typeof skillReferencesCombatBuffOnTurnStart === 'function' &&
          skillReferencesCombatBuffOnTurnStart(skill, buffId)
        ) {
          return martial.rank || '初阶';
        }
      }
    }
    return '初阶';
  }
  if (char.martialArtId == null) return '初阶';
  const martial = getMartialArtLibraryEntry(char.martialArtId);
  return (martial && martial.rank) || '初阶';
}

if (typeof window !== 'undefined') {
  window.getMartialRankForCombatBuff = getMartialRankForCombatBuff;
}

function getEnemyTemplateForBattleChar(char) {
  if (!char || char.id == null) return null;
  if (typeof getEnemyById === 'function') return getEnemyById(char.id);
  if (typeof ENEMIES !== 'undefined' && ENEMIES[char.id]) return ENEMIES[char.id];
  return null;
}

function findCombatPerformanceCue(char, turn, buffId, willBeFirstStack) {
  const tpl = getEnemyTemplateForBattleChar(char);
  if (!tpl || !Array.isArray(tpl.combatPerformances)) return null;
  for (const cue of tpl.combatPerformances) {
    if (!cue || !cue.id) continue;
    if (cue.turn != null && cue.turn !== turn) continue;
    if (cue.buffId && cue.buffId !== buffId) continue;
    if (cue.beforeFirstStack && !willBeFirstStack) continue;
    const key = char.id + ':' + cue.id;
    if (cue.once !== false && battleState.combatPerformancesPlayed[key]) continue;
    if (!cue.lines || !cue.lines.length) continue;
    return cue;
  }
  return null;
}

function markCombatPerformancePlayed(char, cue) {
  if (!char || !cue || !cue.id) return;
  if (!battleState.combatPerformancesPlayed) battleState.combatPerformancesPlayed = {};
  battleState.combatPerformancesPlayed[char.id + ':' + cue.id] = true;
}

async function playCombatPerformanceCue(char, cue) {
  if (!char || !cue || !cue.lines || !cue.lines.length) return;
  markCombatPerformancePlayed(char, cue);
  const card = document.getElementById('char-' + char.id);
  if (card) card.classList.add('battle-cue-speaking');
  try {
    await showEnemyBattleSpeechLines(char, cue.lines, { logPrefix: char.name });
  } finally {
    if (card) card.classList.remove('battle-cue-speaking');
  }
  await sleep(160);
}

/** 新回合开始：按武学 passive 引用叠 Buff（定义与表现见 js/data/battleBuffs.js） */
async function applyTurnStartCombatBuffsForAll() {
  if (typeof tryAddCombatBuffStack !== 'function') return false;
  const all = [...battleState.allyTeam, ...battleState.enemyTeam];
  let anyChanged = false;
  const introUpdates = [];
  for (const char of all) {
    if (!char || char.isDead) continue;
    const passives = collectTurnStartSelfBuffPassives(char);
    for (const p of passives) {
      if (battleState.turnCount < (p.fromTurn || 2)) continue;
      if (char.isDead) continue;
      const inst = char.combatBuffs && char.combatBuffs[p.buffId];
      const prevStacks = inst && inst.stacks ? inst.stacks : 0;
      const willBeFirstStack = prevStacks <= 0;
      const cue = findCombatPerformanceCue(char, battleState.turnCount, p.buffId, willBeFirstStack);
      if (cue) {
        await playCombatPerformanceCue(char, cue);
      }
      const result = tryAddCombatBuffStack(char, p.buffId, p.stacksPerTick || 1);
      if (!result.added) continue;
      anyChanged = true;
      const isFirstStack = result.newStacks === 1;
      const logText =
        typeof formatCombatBuffGainLog === 'function'
          ? formatCombatBuffGainLog(char.name, p.buffId, result.newStacks)
          : `${char.name}【${p.buffId}】×${result.newStacks}`;
      addBattleLog(logText, { buff: true });
      if (isFirstStack && !cue) await sleep(320);
      if (typeof playCombatBuffGainFx === 'function') {
        playCombatBuffGainFx(char, p.buffId, result.newStacks, { isFirstStack: isFirstStack });
      }
      introUpdates.push({ char: char, intro: isFirstStack });
      if (isFirstStack) await sleep(cue ? 220 : 180);
    }
  }
  if (anyChanged && typeof updateCombatBuffDomForChar === 'function') {
    for (const item of introUpdates) {
      updateCombatBuffDomForChar(item.char, { intro: item.intro });
    }
    for (const char of all) {
      if (introUpdates.some(function (u) {
        return u.char === char;
      })) {
        continue;
      }
      updateCombatBuffDomForChar(char);
    }
  }
  return anyChanged;
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
            const d = getYangGangDamageMultiplierDeltaFromSkill(skill);
            if (d > 0) {
              bonus = 1 + d;
              console.log('角色', charId, '阳刚被动激活，攻击力×' + bonus);
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

function resolveBattleMaxHp(char) {
  const inner = getInnerSkillPassiveBonuses(char);
  const martialHp = getMartialBonusForChar(char, 'hp');
  const equipHp = getEquipBonusForChar(char, 'hp');
  const innerHp = inner.maxHpBonus || 0;
  if (typeof window.computeCombatMaxHp === 'function') {
    return window.computeCombatMaxHp(char, {
      martialHp: martialHp,
      equipHp: equipHp,
      innerHpBonus: innerHp
    });
  }
  const bone = (char.stats && (char.stats.bone || char.stats.vitality)) || 5;
  const lv = char.level || 1;
  const base =
    typeof deriveBaseStatFromFourDim === 'function'
      ? deriveBaseStatFromFourDim('hp', bone, lv)
      : 100 + (bone - 5) * 5 + (lv - 1) * 10;
  return base + martialHp + equipHp + innerHp;
}

function resolveBattleMaxMp(char) {
  const martialMp = getMartialBonusForChar(char, 'mp');
  const equipMp = getEquipBonusForChar(char, 'mp');
  if (typeof window.computeCombatMaxMp === 'function') {
    return window.computeCombatMaxMp(char, { martialMp: martialMp, equipMp: equipMp });
  }
  const qi = (char.stats && (char.stats.qi || char.stats.spirit)) || 5;
  const lv = char.level || 1;
  const base =
    typeof deriveBaseStatFromFourDim === 'function'
      ? deriveBaseStatFromFourDim('mp', qi, lv)
      : 50 + (qi - 5) * 2 + (lv - 1) * 5;
  return base + martialMp + equipMp;
}

function getPlayerCharactersFromSave() {
  if (typeof window.applyPlayerCharactersFromStorage === 'function') {
    window.applyPlayerCharactersFromStorage();
  }
  const maleAvatar =
    typeof window !== 'undefined' && window.PLAYER_PORTRAIT_MALE
      ? window.PLAYER_PORTRAIT_MALE
      : '../assets/images/UI/ma_ui_char_portrait_xiao_yunche.png';
  const femaleAvatar =
    typeof window !== 'undefined' && window.PLAYER_PORTRAIT_FEMALE
      ? window.PLAYER_PORTRAIT_FEMALE
      : '../assets/images/UI/ma_ui_char_portrait_su_qingli.png';
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
    
    // 气血/内力与角色面板同源：deriveBaseStatFromFourDim + 武学/装备/被动（见 config.computeCombatMaxHp）
    const char1Level = window.characters[0].level;
    const char1InnerBonuses = getInnerSkillPassiveBonuses(window.characters[0]);
    const char1FinalMaxHp = resolveBattleMaxHp(window.characters[0]);
    const char1FinalMaxMp = resolveBattleMaxMp(window.characters[0]);
    
    const char2Level = window.characters[1].level;
    const char2InnerBonuses = getInnerSkillPassiveBonuses(window.characters[1]);
    const char2FinalMaxHp = resolveBattleMaxHp(window.characters[1]);
    const char2FinalMaxMp = resolveBattleMaxMp(window.characters[1]);
    
    console.log('少侠血量 - 最终:', char1FinalMaxHp, '内力:', char1FinalMaxMp);
    console.log('苏瑶血量 - 最终:', char2FinalMaxHp, '内力:', char2FinalMaxMp);
    
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
        hit: 70 + window.characters[0].stats.agility + (char1InnerBonuses.hitBonus || 0), 
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
        hit: 70 + window.characters[1].stats.agility + (char2InnerBonuses.hitBonus || 0), 
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
        const char1Level = chars[0].level;
        const char1Str = chars[0].stats.strength || 10;
        const char1Agi = chars[0].stats.agility || 10;
        const char1InnerBonuses = getInnerSkillPassiveBonuses(chars[0]);
        const char1FinalMaxHp = resolveBattleMaxHp(chars[0]);
        const char1FinalMaxMp = resolveBattleMaxMp(chars[0]);
        
        const char2Level = chars[1].level;
        const char2Str = chars[1].stats.strength || 10;
        const char2Agi = chars[1].stats.agility || 10;
        const char2InnerBonuses = getInnerSkillPassiveBonuses(chars[1]);
        const char2FinalMaxHp = resolveBattleMaxHp(chars[1]);
        const char2FinalMaxMp = resolveBattleMaxMp(chars[1]);

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
            hit: 70 + char1Agi + (char1InnerBonuses.hitBonus || 0), 
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
            hit: 70 + char2Agi + (char2InnerBonuses.hitBonus || 0), 
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
      { id: 2, name: char2Data?.name || '苏瑶', avatar: femaleAvatar, level: char2Data?.level || 1, hp: char2Hp, maxHp: char2Hp, mp: char2Mp, maxMp: char2Mp, attack: Math.floor(80 * yangGangBonus2), defense: 45, speed: 72, hit: 80, dodge: 45, parry: 28, stats: char2Data?.stats || { strength: 10, agility: 10, bone: 10, qi: 10, mp: char2Mp, maxMp: char2Mp }, equipped: char2Data?.equipped || {} }
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
    const fallbackChar = { level: level, stats: stats };
    const maxHp = resolveBattleMaxHp(fallbackChar);
    const maxMp = resolveBattleMaxMp(fallbackChar);
    const attack = Math.floor((50 + stats.strength * 3) * yangGangBonus1);
    const defense = stats.defense || 50;
    const speed = 50 + stats.agility * 2;
    const hit = 70 + stats.agility;
    const dodge = 20 + Math.floor(stats.agility * 0.5);
    const parry = stats.parry || 20;

    const innerHit1 =
      typeof getInnerSkillPassiveBonuses === 'function'
        ? getInnerSkillPassiveBonuses({ id: 1, stats })
        : { hitBonus: 0 };
    
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

    const char2StatsForHit =
      char2Data && char2Data.stats
        ? char2Data.stats
        : { strength: char2Str, agility: char2Agi, bone: char2Bone, qi: char2Qi };
    const innerHit2 =
      typeof getInnerSkillPassiveBonuses === 'function'
        ? getInnerSkillPassiveBonuses({ id: 2, stats: char2StatsForHit })
        : { hitBonus: 0 };
    
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
        hit: hit + (innerHit1.hitBonus || 0), 
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
        hit: char2Hit + (innerHit2.hitBonus || 0), 
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
  battleState.battleEntrySource = entrySource;
  battleState.returnMapHref = mapBattleSourceToReturnHref(entrySource);

  let dungeonIntroOverride = null;
  try {
    const dk =
      window.BattleEntry && window.BattleEntry.KEYS && window.BattleEntry.KEYS.dungeonBattleContext;
    if (dk) {
      const raw = localStorage.getItem(dk);
      if (raw) {
        const o = JSON.parse(raw);
        if (o && typeof o.battleIntro === 'string' && o.battleIntro.trim()) {
          dungeonIntroOverride = o.battleIntro.trim();
        }
      }
    }
  } catch (e) {
    /* ignore */
  }

  let enemy = ENEMIES.shanze_louluo_1;
  if (enemyId && ENEMIES[enemyId]) {
    enemy = ENEMIES[enemyId];
  }

  const introSource =
    dungeonIntroOverride != null && dungeonIntroOverride !== ''
      ? dungeonIntroOverride
      : typeof enemy.battleIntro === 'string'
        ? enemy.battleIntro
        : '';
  const introNorm = normalizeBattleIntroText(introSource);
  battleState.pendingPreBattleIntro = introNorm ? introNorm : null;

  if (window.BattleEntry) {
    window.BattleEntry.clearEnemyLaunchContext();
  } else {
    localStorage.removeItem('battleEnemyId');
  }

  let alliesForBattle = currentPlayerCharacters;
  if (enemy && enemy.sparProtagonistOnly) {
    alliesForBattle = alliesForBattle.filter(function (c) {
      return Number(c.id) === 1;
    });
    if (!alliesForBattle.length && currentPlayerCharacters.length) {
      alliesForBattle = [currentPlayerCharacters[0]];
    }
  }
  if (alliesForBattle.length > BATTLE_PARTY_CAP_PER_SIDE) {
    console.warn(
      `initBattle: 我方 ${alliesForBattle.length} 人超过设计上限 ${BATTLE_PARTY_CAP_PER_SIDE}，已取前 ${BATTLE_PARTY_CAP_PER_SIDE} 人参战。`
    );
    alliesForBattle = alliesForBattle.slice(0, BATTLE_PARTY_CAP_PER_SIDE);
  }

  battleState.allyTeam = alliesForBattle.map(char => {
    const c = {
      ...char,
      hp: char.maxHp,
      mp: char.maxMp,
      isAlly: true,
      isDead: false
    };
    if (typeof initCombatBuffState === 'function') initCombatBuffState(c);
    return c;
  });

  const encounterDefs =
    typeof getEncounterEnemies === 'function'
      ? getEncounterEnemies(enemyId || enemy.id)
      : [enemy];
  if (!encounterDefs.length) {
    encounterDefs.push(enemy);
  }
  battleState.enemyTeam = encounterDefs.map(function (def) {
    return prepareEnemyForBattle(def);
  });

  battleState.turnOrder = [...battleState.allyTeam, ...battleState.enemyTeam];
  calculateTurnOrder();
  battleState.currentTurnIndex = 0;
  battleState.hudActorOverride = null;
  battleState.battleEnded = false;
  battleState.turnCount = 1;
  battleState.combatPerformancesPlayed = {};
  battleState.openingPrimed = false;

  clearBattleLog();
  battleLoopRunning = false;
  renderTeams();
  updateTurnDisplay();
  // 「战斗开始」与首回合分隔线：首次点击「自动战斗」后由 `primeOpeningAndRunBattleLoop` 写入
  // 第一回合不回血，从第二回合开始
}

/** 去掉首尾成套引号，便于气泡内展示 */
function normalizeBattleIntroText(s) {
  if (!s) return '';
  let t = String(s).trim();
  t = t.replace(/^[\s"'「“『]+/, '').replace(/[\s"'」”』]+$/, '');
  return t.trim();
}

/**
 * 战前台词拆段：优先按句末标点断句，过长句再按逗顿或硬切，避免单泡塞满小屏。
 * @param {string} text
 * @param {number} [maxLen] 单段大致上限（汉字计）
 * @returns {string[]}
 */
function splitBattleIntroIntoChunks(text, maxLen) {
  maxLen = Math.max(14, maxLen || 26);
  const s = normalizeBattleIntroText(text);
  if (!s) return [];

  const chunks = [];

  function pushLong(str) {
    const t = str.trim();
    if (!t) return;
    if (t.length <= maxLen && t.length >= 18) {
      const idx = t.indexOf('，');
      if (idx > 5 && idx < t.length - 4) {
        chunks.push(t.slice(0, idx + 1).trim());
        pushLong(t.slice(idx + 1));
        return;
      }
    }
    if (t.length <= maxLen) {
      chunks.push(t);
      return;
    }
    let i = 0;
    while (i < t.length) {
      const rest = t.length - i;
      if (rest <= maxLen) {
        const last = t.slice(i).trim();
        if (last) chunks.push(last);
        break;
      }
      let slice = t.slice(i, i + maxLen);
      let cut = -1;
      for (let k = slice.length - 1; k > 6; k--) {
        if ('。！？；'.indexOf(slice[k]) >= 0) {
          cut = k + 1;
          break;
        }
      }
      if (cut < 0) {
        for (let k = slice.length - 1; k > 6; k--) {
          if ('，、：'.indexOf(slice[k]) >= 0) {
            cut = k + 1;
            break;
          }
        }
      }
      if (cut < 0) cut = maxLen;
      const piece = t.slice(i, i + cut).trim();
      if (piece) chunks.push(piece);
      i += cut;
    }
  }

  const segs = s.split(/(?<=[。！？；])/);
  for (let si = 0; si < segs.length; si++) {
    const seg = segs[si].trim();
    if (!seg) continue;
    pushLong(seg);
  }
  return chunks;
}

function emitBattleStartLogs() {
  addBattleLog('战斗开始！');
  addBattleLog('──────── 第 1 回合 ────────', { round: true });
}

/**
 * 敌方台词气泡：逐句展示（战前 intro / 战中演出共用）
 * @param {object} enemyChar
 * @param {Array<string|{text:string,displayMs?:number}>} lines
 * @param {{ displayMs?: number, logPrefix?: string }} [options]
 */
async function showEnemyBattleSpeechLines(enemyChar, lines, options) {
  if (!enemyChar || enemyChar.id == null || !lines || !lines.length) return;
  const card = document.getElementById('char-' + enemyChar.id);
  if (!card) return;

  const defaultDisplayMs = (options && options.displayMs) || 2500;
  const FADE_MS = 220;
  const BETWEEN_MS = 120;
  const logPrefix = options && options.logPrefix ? options.logPrefix : enemyChar.name;

  for (let c = 0; c < lines.length; c++) {
    const raw = lines[c];
    const line = typeof raw === 'string' ? { text: raw } : raw || {};
    const text = line.text != null ? String(line.text).trim() : '';
    if (!text) continue;

    card.querySelectorAll('.battle-intro-bubble').forEach(function (el) {
      el.remove();
    });

    const wrap = document.createElement('div');
    wrap.className = 'battle-intro-bubble';
    if (text.length <= 3) wrap.classList.add('battle-intro-bubble--shout');
    wrap.setAttribute('role', 'status');
    wrap.setAttribute('aria-live', 'polite');
    wrap.setAttribute('aria-label', enemyChar.name + ' 台词');
    const textEl = document.createElement('div');
    textEl.className = 'battle-intro-bubble__text';
    textEl.textContent = text;
    wrap.appendChild(textEl);
    card.appendChild(wrap);

    addBattleLog(logPrefix + '：「' + text + '」', { cue: true });

    await new Promise(function (r) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          wrap.classList.add('battle-intro-bubble--show');
          r();
        });
      });
    });

    const displayMs =
      line.displayMs != null
        ? line.displayMs
        : text.length <= 3
          ? 1200
          : defaultDisplayMs;

    await sleep(displayMs);
    wrap.classList.remove('battle-intro-bubble--show');
    await sleep(FADE_MS);
    try {
      wrap.remove();
    } catch (e) {}
    if (c < lines.length - 1) await sleep(BETWEEN_MS);
  }
}

/**
 * 战前台词：多段气泡依次挂在敌方立绘上，每段展示约数秒后自动消失，无需点击。
 * @returns {Promise<void>}
 */
async function showEnemyPreBattleIntroBubble(enemyChar, text) {
  if (!enemyChar || !text) return;
  const chunks = splitBattleIntroIntoChunks(text, 26);
  if (!chunks.length) return;
  await showEnemyBattleSpeechLines(enemyChar, chunks, { displayMs: 2500 });
}

function calculateTurnOrder() {
  battleState.turnOrder.sort((a, b) => getEffectiveSpeed(b) - getEffectiveSpeed(a));
}

/** 对位阵营（敌看我方、我看敌方）存活单位中的最高速度；全灭或未开战时 0。 */
function getOpposingTeamMaxSpeed(actor) {
  const opposing = actor.isAlly ? battleState.enemyTeam : battleState.allyTeam;
  let maxS = 0;
  for (const c of opposing) {
    if (!c || c.isDead) continue;
    const s = getEffectiveSpeed(c);
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
    const lead = getEffectiveSpeed(actor) - getOpposingTeamMaxSpeed(actor);
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
  if (typeof syncCombatBuffAvatarFx === 'function') {
    [...battleState.allyTeam, ...battleState.enemyTeam].forEach(function (char) {
      syncCombatBuffAvatarFx(char);
    });
  }
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
    updateCombatBuffDomForChar(char);
  }
  updateActorBarsHud();
}

function renderCharacterCard(char) {
  const isActive =
    !battleState.battleEnded &&
    battleState.turnOrder[battleState.currentTurnIndex] === char;
  const fallbackIcon = char.name === '少侠' ? '⚔️' : char.name === '苏瑶' ? '🌸' : (char.icon || '👤');
  const hasAvatar = char.avatar && char.avatar !== '';
  const flipMap =
    typeof window !== 'undefined' && window.CHARACTER_PORTRAIT_FLIP_H_BY_ID
      ? window.CHARACTER_PORTRAIT_FLIP_H_BY_ID
      : {};
  const avatarFlipClass = flipMap[char.id] ? ' character-avatar--flip-h' : '';
  const avatarScale =
    typeof char.avatarScale === 'number' && char.avatarScale > 0 ? char.avatarScale : 1;
  const avatarScaleClass =
    avatarScale !== 1 ? ' character-avatar--scaled' : '';
  const avatarScaleStyle =
    avatarScale !== 1 ? ` style="--avatar-scale:${avatarScale}"` : '';

  let avatarHtml = '';
  if (hasAvatar) {
    avatarHtml = `<img class="character-avatar${avatarFlipClass}${avatarScaleClass}"${avatarScaleStyle} src="${char.avatar}" alt="${char.name}" onError="handleAvatarError(this, '${fallbackIcon}')" />`;
  } else {
    avatarHtml = `<div class="character-avatar-emoji">${fallbackIcon}</div>`;
  }

  return `
    <div class="character-card ${isActive ? 'active' : ''} ${char.isDead ? 'dead' : ''}" id="char-${char.id}">
      <div class="character-name">${char.name}</div>
      ${typeof renderCombatBuffRowHtml === 'function' ? renderCombatBuffRowHtml(char) : ''}
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
    (options.speedExtra ? ' is-speed-extra' : '') +
    (options.cue ? ' is-cue' : '') +
    (options.buff ? ' is-buff' : '');
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

/** 斧招 axeFx：赭铁宽楔 + 短弧沉劈（比 bladeFx 刀脊更短、更沉、暖色） */
function showAxeChopEffect(actor, target) {
  const card = document.getElementById(`char-${target.id}`);
  if (!card) return;
  const holder = card.querySelector('.character-avatar-container');
  if (!holder) return;
  if (getComputedStyle(holder).position === 'static') {
    holder.style.position = 'relative';
  }
  const layer = document.createElement('div');
  layer.className = 'axe-chop-layer';
  layer.setAttribute('aria-hidden', 'true');
  const dust = document.createElement('div');
  dust.className = 'axe-chop-dust';
  const wedge = document.createElement('div');
  wedge.className = 'axe-chop-wedge';
  const arc = document.createElement('div');
  arc.className = 'axe-chop-arc';
  const spark = document.createElement('div');
  spark.className = 'axe-chop-spark';
  layer.appendChild(dust);
  layer.appendChild(wedge);
  layer.appendChild(arc);
  layer.appendChild(spark);
  holder.appendChild(layer);
  requestAnimationFrame(() => layer.classList.add('show'));
  setTimeout(() => {
    layer.remove();
  }, 520);
}

/** 极轻全屏抖一下，强化拳/刀/斧落点体感 */
function showScreenJolt(mode) {
  const el = document.querySelector('.battle-container');
  if (!el) return;
  el.classList.add(mode === 'axe' ? 'screen-jolt-axe' : 'screen-jolt');
  const cls = mode === 'axe' ? 'screen-jolt-axe' : 'screen-jolt';
  setTimeout(() => el.classList.remove(cls), mode === 'axe' ? 280 : 220);
}

/** 闪避瞬间：头像极轻闪白（弱于受击 hit-impact，不配卡片 .hit 震动） */
function showDodgeGlint(target) {
  if (!target || target.id == null) return;
  const card = document.getElementById(`char-${target.id}`);
  if (!card) return;
  const holder = card.querySelector('.character-avatar-container') || card;
  if (getComputedStyle(holder).position === 'static') {
    holder.style.position = 'relative';
  }
  const flash = document.createElement('div');
  flash.className = 'dodge-glint-overlay';
  flash.setAttribute('aria-hidden', 'true');
  holder.appendChild(flash);
  setTimeout(() => {
    flash.remove();
  }, 260);
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
  let impactClass = 'hit-impact-overlay';
  if (opts && opts.axeImpact) impactClass += ' hit-impact-axe';
  else if (opts && opts.bladeImpact) impactClass += ' hit-impact-blade';
  flash.className = impactClass;
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
  let hitBonus = 0;

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
    console.log(`最终武学加成: 防御+${defenseBonus}, 气血+${maxHpBonus}, 攻击+${attackBonus}, 命中+${hitBonus}, 闪避+${dodgeBonus}, 速度+${speedBonus}, 招架+${parryBonus}`);
  } catch (e) {
    console.warn('获取武学技能加成失败:', e);
  }

  return { defenseBonus, maxHpBonus, attackBonus, hitBonus, dodgeBonus, speedBonus, parryBonus };
}

// 计算内功自动回血量
function calculateInnerSkillHeal(char) {
  let healAmount = 0;

  try {
    console.log('=== 开始计算内功回血 ===');

    /** 敌人：enemies.js 配 innerSkillArtId + innerSkillLevel，读武学库内功 autoHeal（与玩家合并表分离） */
    if (char && char.isAlly === false && char.innerSkillArtId != null) {
      const innerMartial = getMartialArtLibraryEntry(char.innerSkillArtId);
      const innerLv =
        char.innerSkillLevel != null && char.innerSkillLevel > 0 ? char.innerSkillLevel : 10;
      if (innerMartial && innerMartial.type === '内功' && innerMartial.skills) {
        const stats = char.stats || {};
        for (const skill of innerMartial.skills) {
          if (innerLv < (skill.unlockLevel || 99)) continue;
          const segs =
            typeof expandTurnStartAutoHealActions === 'function'
              ? expandTurnStartAutoHealActions(skill)
              : [];
          if (segs.length) {
            for (const seg of segs) {
              const h =
                typeof computeInnerAutoHealOnce === 'function'
                  ? computeInnerAutoHealOnce(stats, innerLv, seg)
                  : 0;
              healAmount += h;
              console.log(
                `${char.name} 内功(${innerMartial.name})-${skill.name}(${innerLv}级) 回血段(passive): +${h}`
              );
            }
            continue;
          }
          const effect = skill.effect;
          if (effect && effect.type === 'autoHeal') {
            const h =
              typeof computeInnerAutoHealOnce === 'function'
                ? computeInnerAutoHealOnce(stats, innerLv, effect)
                : Math.floor(
                    (effect.baseValue || 5) +
                      innerLv * (effect.levelMultiplier || 3) +
                      (stats[effect.bonusAttr || 'qi'] || 0) * (effect.bonusPerPoint || 0.8)
                  );
            healAmount += h;
            console.log(
              `${char.name} 内功(${innerMartial.name})-${skill.name}(${innerLv}级) 回血段: +${h}`
            );
          }
        }
      }
      return healAmount;
    }

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
          const stats = char.stats || {};
          const segs =
            typeof expandTurnStartAutoHealActions === 'function'
              ? expandTurnStartAutoHealActions(skill)
              : [];
          if (segs.length) {
            for (const seg of segs) {
              const h =
                typeof computeInnerAutoHealOnce === 'function'
                  ? computeInnerAutoHealOnce(stats, martial.currentLevel, seg)
                  : 0;
              healAmount += h;
              console.log(`${martial.name}-${skill.name}(${martial.currentLevel}级) 回血段(passive): +${h}`);
            }
            continue;
          }
          const effect = skill.effect;
          if (effect && effect.type === 'autoHeal') {
            const h =
              typeof computeInnerAutoHealOnce === 'function'
                ? computeInnerAutoHealOnce(stats, martial.currentLevel, effect)
                : Math.floor(
                    (effect.baseValue || 5) +
                      martial.currentLevel * (effect.levelMultiplier || 3) +
                      ((char.stats && char.stats[effect.bonusAttr || 'qi']) || 0) *
                        (effect.bonusPerPoint || 0.8)
                  );
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

    const power = Math.floor((Number(actor.attack) || 0) * followSkill.damage);
    const damage = resolveFlatSkillDamage(power, target);
    showDamageNumber(target.id, -damage, false);
    target.hp = Math.max(0, target.hp - damage);
    showMeleeHitFeedback(target);
    addBattleLogMaybeSpeed(
      typeof BattleNarrative !== 'undefined'
        ? BattleNarrative.followAttack(actor, target, damage)
        : `${actor.name} 触发${followLabel}，额外造成 ${damage} 点伤害！`,
      speedExtra
    );
    
    markTargetDeadIfNeeded(target, actor, fxOpts);
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

    if (skill.axeFx) {
      showAxeChopEffect(actor, target);
    } else if (skill.bladeFx) {
      showBladeChopEffect(actor, target);
    } else if (skill.punchFx) {
      showPunchImpactEffect(actor, target);
    } else if (skill.plainFx) {
      showSwordEffect(actor, target, 'plain');
    } else {
      showSwordEffect(actor, target, 'thrust');
    }

    if (skill.useHitRoll && window.BattleHitRoll) {
      const power = computeSkillAttackPower(actor, multiplier);
      const result = window.BattleHitRoll.resolveDamage(
        rollAttackerForHitRoll(actor, power),
        target
      );
      const outcome = applyHitRollResultToTarget(actor, target, result, fxOpts, {
        verb: skill.name,
        battleNarrativeHit: (a, t, dmg) =>
          typeof BattleNarrative !== 'undefined'
            ? BattleNarrative.skillUse(a, skill, t, dmg)
            : `${a.name} 使用 ${skill.name}，造成 ${dmg} 点伤害！`
      });
      if (outcome.kind === 'hit' || outcome.kind === 'parry') {
        if (skill.axeFx) showScreenJolt('axe');
        else if (skill.punchFx || skill.bladeFx) showScreenJolt();
        showMeleeHitFeedback(
          target,
          skill.axeFx
            ? { strong: true, axeImpact: true }
            : skill.punchFx || skill.bladeFx
              ? { strong: true, bladeImpact: !!skill.bladeFx }
              : undefined
        );
      }
      await sleep(300);
      if (outcome.kind === 'dodge' && skill.onMissFollow && !target.isDead) {
        await checkFollowAttackOnMiss(actor, target, skill.onMissFollow, fxOpts);
      }
    } else {
      const power = computeSkillAttackPower(actor, multiplier);
      const damage = resolveFlatSkillDamage(power, target);
      showDamageNumber(target.id, -damage);
      target.hp = Math.max(0, target.hp - damage);
      if (skill.axeFx) showScreenJolt('axe');
      else if (skill.punchFx || skill.bladeFx) showScreenJolt();
      showMeleeHitFeedback(
        target,
        skill.axeFx
          ? { strong: true, axeImpact: true }
          : skill.punchFx || skill.bladeFx
            ? { strong: true, bladeImpact: !!skill.bladeFx }
            : undefined
      );
      const dmgMsg =
        typeof BattleNarrative !== 'undefined'
          ? BattleNarrative.skillUse(actor, skill, target, damage)
          : `${actor.name} 使用 ${skill.name}，造成 ${damage} 点伤害！`;
      addBattleLogMaybeSpeed(dmgMsg, !!(fxOpts && fxOpts.presentation === 'speedExtra'));
      await sleep(300);

      if (skill.followSkill) {
        await checkFollowAttack(actor, target, skill.followSkill, fxOpts);
      }
    }
  }

  markTargetDeadIfNeeded(target, actor, fxOpts);
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
      addBattleLog(`──────── 第 ${battleState.turnCount} 回合 ────────`, { round: true });

      // 从第二回合开始：战斗内 Buff（如绝尘叠层）→ 内功回血
      if (battleState.turnCount >= 2) {
        await sleep(200);
        await applyTurnStartCombatBuffsForAll();
        console.log('=== 新回合开始，应用内功回血 ===');
        console.log('当前回合:', battleState.turnCount);
        await sleep(300);
        battleState.allyTeam.forEach(char => {
          if (!char.isDead) {
            applyInnerSkillHeal(char);
          }
        });
        battleState.enemyTeam.forEach(char => {
          if (!char.isDead) {
            applyInnerSkillHeal(char);
          }
        });
        await sleep(500);
      }
      calculateTurnOrder();
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
      
      markTargetDeadIfNeeded(target, actor, fxOpts);
      updateHpDisplay(target.id, target.hp);
      
      await sleep(300);
      await showAttackReturn(actor);
    }
  } else {
    const enemySkills = getAvailableSkillsForEnemy(actor);
    let usedEnemySkill = false;
    for (const skill of enemySkills) {
      const mpc = Math.max(0, Math.floor(Number(skill.mpCost)));
      const cost = mpc > 0 ? mpc : 10;
      const curMp = actor.mp != null ? Math.floor(Number(actor.mp)) : null;
      if (curMp != null && curMp < cost) continue;
      await useSkill(actor, skill, target, fxOpts);
      usedEnemySkill = true;
      break;
    }

    if (usedEnemySkill) {
      await sleep(600);
      return;
    }

    // 无武学或内力不足：物理普攻（命中卷）
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
      showDodgeGlint(target);
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

    markTargetDeadIfNeeded(target, actor, fxOpts);
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
    if (battleState.battleEntrySource === 'qingstone_map') {
      const hadJiaotouSpar = (battleState.enemyTeam || []).some(function (e) {
        return e && e.id === 'qingstone_jiaotou_spar';
      });
      if (hadJiaotouSpar) {
        try {
          localStorage.setItem('qingstone_dojo_spar_victory', '1');
        } catch (err) {
          console.warn('qingstone_dojo_spar_victory', err);
        }
      }
    }
    let sumExp = 0;
    let sumGold = 0;
    let sumExpReward = 0;
    for (const foe of battleState.enemyTeam) {
      if (!foe) continue;
      sumExp += foe.expReward || foe.exp || 25;
      sumGold += foe.goldReward || foe.gold || 10;
      sumExpReward += foe.expReward || 17;
      updateBanditTaskProgress(foe);
    }
    rewards.exp = sumExp;
    rewards.gold = sumGold;
    rewards.expReward = sumExpReward;
    const partyCharIds = (battleState.allyTeam || [])
      .map(function (c) {
        return parseInt(c.id, 10);
      })
      .filter(function (id) {
        return Number.isFinite(id) && id > 1;
      });
    rewards.partyCharIds = partyCharIds;

    if (window.BattleSettlement) {
      window.BattleSettlement.setPendingRewards({
        exp: rewards.exp,
        gold: rewards.gold,
        expReward: rewards.expReward,
        goldReward: rewards.gold,
        partyCharIds: partyCharIds
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
        goldReward: rewards.gold,
        partyCharIds: partyCharIds
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

  if (!isVictory && battleState.battleEntrySource === 'heifeng_dungeon') {
    battleState.returnMapHref = 'forest_map.html';
    try {
      localStorage.setItem('preBattleLocation', 'heifeng_entrance');
      localStorage.removeItem('heifeng_dungeon_run');
      localStorage.removeItem('heifeng_post_battle_room');
      localStorage.setItem('heifeng_forest_after_defeat', '1');
      const dk =
        window.BattleEntry && window.BattleEntry.KEYS && window.BattleEntry.KEYS.dungeonBattleContext;
      if (dk) localStorage.removeItem(dk);
    } catch (e) {}
  }

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

/**
 * 入场全屏黑幕淡出（与 battle.html 内联脚本一致），返回后可安全展示战前气泡。
 * @returns {Promise<void>}
 */
function awaitBattleEnterCinematicIfAny() {
  return new Promise(function (resolve) {
    const cineEl = document.getElementById('battlePageCinematicBlack');
    const cineKey = window.BattleEntry && window.BattleEntry.KEYS && window.BattleEntry.KEYS.battleEnterCinematic;
    const clearEntryChrome = function () {
      if (cineKey) {
        try {
          localStorage.removeItem(cineKey);
        } catch (e) {}
      }
      document.documentElement.style.background = '';
      document.body.style.background = '';
      try {
        if (cineEl && cineEl.parentNode) cineEl.remove();
      } catch (e) {}
    };

    if (!cineEl) {
      clearEntryChrome();
      resolve();
      return;
    }

    cineEl.style.transition = 'opacity 0.42s ease-out';
    const onEnd = function (ev) {
      if (ev.propertyName !== 'opacity') return;
      cineEl.removeEventListener('transitionend', onEnd);
      clearEntryChrome();
      resolve();
    };
    cineEl.addEventListener('transitionend', onEnd);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        cineEl.style.opacity = '0';
      });
    });
    setTimeout(function () {
      if (!cineEl.parentNode) return;
      cineEl.removeEventListener('transitionend', onEnd);
      clearEntryChrome();
      resolve();
    }, 700);
  });
}

function toggleAutoBattle() {
  battleState.isAutoFighting = !battleState.isAutoFighting;
  const btn = document.getElementById('btnAuto');
  btn.textContent = battleState.isAutoFighting ? '停止战斗' : '自动战斗';

  if (battleState.isAutoFighting && !battleState.battleEnded) {
    void primeOpeningAndRunBattleLoop();
  }
}

/**
 * 首次开启自动战斗：先播战前台词气泡（若有），再写战斗开始日志并进入主循环；停战后再开仅续跑循环。
 */
async function primeOpeningAndRunBattleLoop() {
  if (battleLoopRunning) return;

  if (!battleState.openingPrimed) {
    const introText = battleState.pendingPreBattleIntro;
    const foe = battleState.enemyTeam && battleState.enemyTeam[0];

    if (introText && foe) {
      battleState.pendingPreBattleIntro = null;
      await showEnemyPreBattleIntroBubble(foe, introText);
      if (!battleState.isAutoFighting || battleState.battleEnded) {
        battleState.pendingPreBattleIntro = introText;
        return;
      }
    } else {
      battleState.pendingPreBattleIntro = null;
    }
    battleState.openingPrimed = true;
    emitBattleStartLogs();
  }

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

  setTimeout(async () => {
    await initBattle();
    await awaitBattleEnterCinematicIfAny();
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
