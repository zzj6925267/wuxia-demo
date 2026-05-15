/**
 * 战斗被动表：只管「何时 / 对谁 / 是否触发」与动作引用；具体数值与表现见 battleBuffs.js。
 * battle.js 在回合钩子等处分发；本文件为数据 + 只读展开辅助。
 *
 * 字段约定（第一版，可扩展）：
 * - id: string，全库唯一
 * - trigger: 'turnStart' | 'afterActiveHit' | 'onActiveMiss' | 'loadoutPassive' | …（后续按需加）
 * - actions: applyBuff | followAttack | autoHeal | onMissFollow | 以及 loadoutPassive 下与 skill.effect 同形的 defenseBuff / maxHpBuff / buff（固定值或属性成长）
 */
(function (global) {
  'use strict';

  /** @type {Record<string, object>} */
  var BATTLE_PASSIVES = {
    /** 《落草剑经》绝尘：第二回合起每回合自叠 juechen_dust（见 battleBuffs.js） */
    juechen_turn_start: {
      id: 'juechen_turn_start',
      trigger: 'turnStart',
      actions: [{ type: 'applyBuff', buffId: 'juechen_dust', fromTurn: 2, stacksPerTick: 1 }]
    },
    /** 《正阳基础剑式》剑影：直刺命中后概率追击（并入主动技能 followSkill） */
    jianying_follow: {
      id: 'jianying_follow',
      trigger: 'afterActiveHit',
      actions: [
        {
          type: 'followAttack',
          baseChance: 0.2,
          damage: 0.8,
          chanceAttr: 'agility',
          chancePerPoint: 0.01,
          skillName: '剑影'
        }
      ]
    },
    /** 《正阳吐纳诀》调息：回合开始回血（与 battle.js calculateInnerSkillHeal 公式一致） */
    inner_tunxi_zhenyang: {
      id: 'inner_tunxi_zhenyang',
      trigger: 'turnStart',
      actions: [
        { type: 'autoHeal', baseValue: 5, levelMultiplier: 3, bonusAttr: 'qi', bonusPerPoint: 0.8 }
      ]
    },
    /** 《养气术》归根 */
    inner_yangqi_guigen: {
      id: 'inner_yangqi_guigen',
      trigger: 'turnStart',
      actions: [
        { type: 'autoHeal', baseValue: 4, levelMultiplier: 2, bonusAttr: 'qi', bonusPerPoint: 0.35 }
      ]
    },
    /** 《落草剑经》疾刺：对手闪避后依身法判定「续刺」（并入战斗 skill.onMissFollow） */
    luocao_jici_miss_follow: {
      id: 'luocao_jici_miss_follow',
      trigger: 'onActiveMiss',
      actions: [
        {
          type: 'onMissFollow',
          baseChance: 0.5,
          chanceAttr: 'agility',
          chancePerPoint: 0.006,
          damage: 0.85,
          skillName: '续刺'
        }
      ]
    },
    /** 《落草剑经》缠影：命中 buff（与敌人 applyEnemyMartialPassives 同形） */
    luocao_chanying_hit: {
      id: 'luocao_chanying_hit',
      trigger: 'loadoutPassive',
      actions: [{ type: 'buff', stat: 'hit', value: 0.08, bonusAttr: 'agility', bonusPerPoint: 0.025 }]
    },
    /** 《阵形剑诀》守拙：开战/面板与 getInnerSkillPassiveBonuses 同形 */
    wuguan_zhenxing_shouzhuo: {
      id: 'wuguan_zhenxing_shouzhuo',
      trigger: 'loadoutPassive',
      actions: [{ type: 'defenseBuff', stat: 'defense', baseValue: 10 }]
    },
    /** 《养气术》纳息 */
    wuguan_yangqi_naxi: {
      id: 'wuguan_yangqi_naxi',
      trigger: 'loadoutPassive',
      actions: [{ type: 'maxHpBuff', baseValue: 30, bonusAttr: 'bone', bonusPerPoint: 0.45 }]
    },
    /** 《挪步诀》挪寸 */
    wuguan_nuobu_nuocun: {
      id: 'wuguan_nuobu_nuocun',
      trigger: 'loadoutPassive',
      actions: [{ type: 'buff', stat: 'dodge', baseValue: 10 }]
    },
    /** 《挪步诀》卸风 */
    wuguan_nuobu_xiefeng: {
      id: 'wuguan_nuobu_xiefeng',
      trigger: 'loadoutPassive',
      actions: [{ type: 'buff', stat: 'speed', baseValue: 10 }]
    },
    /** 《沉桥拳诀》沉肩 */
    wuguan_chenqiao_chenjian: {
      id: 'wuguan_chenqiao_chenjian',
      trigger: 'loadoutPassive',
      actions: [{ type: 'buff', stat: 'parry', baseValue: 10, bonusAttr: 'bone', bonusPerPoint: 0.5 }]
    },
    /** 《开合刀法》合 */
    wuguan_kaihe_he: {
      id: 'wuguan_kaihe_he',
      trigger: 'loadoutPassive',
      actions: [{ type: 'buff', stat: 'attack', baseValue: 10, bonusAttr: 'strength', bonusPerPoint: 0.5 }]
    },
    /** 《正阳吐纳诀》培元 */
    zhenyang_tunxi_peiyuan: {
      id: 'zhenyang_tunxi_peiyuan',
      trigger: 'loadoutPassive',
      actions: [{ type: 'defenseBuff', baseValue: 30, bonusAttr: 'bone', bonusPerPoint: 0.5 }]
    },
    /** 《正阳吐纳诀》固本 */
    zhenyang_tunxi_guben: {
      id: 'zhenyang_tunxi_guben',
      trigger: 'loadoutPassive',
      actions: [{ type: 'maxHpBuff', baseValue: 50, bonusAttr: 'bone', bonusPerPoint: 0.5 }]
    },
    /** 《踏云步》踏云 */
    zhenyang_tayun_tayun: {
      id: 'zhenyang_tayun_tayun',
      trigger: 'loadoutPassive',
      actions: [{ type: 'buff', stat: 'dodge', baseValue: 15, bonusAttr: 'agility', bonusPerPoint: 0.5 }]
    },
    /** 《踏云步》逐日 */
    zhenyang_tayun_zhuri: {
      id: 'zhenyang_tayun_zhuri',
      trigger: 'loadoutPassive',
      actions: [{ type: 'buff', stat: 'attack', baseValue: 10, bonusAttr: 'strength', bonusPerPoint: 0.5 }]
    },
    /** 《踏云步》凌虚 */
    zhenyang_tayun_lingxu: {
      id: 'zhenyang_tayun_lingxu',
      trigger: 'loadoutPassive',
      actions: [{ type: 'buff', stat: 'speed', baseValue: 15, bonusAttr: 'agility', bonusPerPoint: 0.6 }]
    },
    /**
     * 《正阳基础剑式》阳刚：与直刺等主动 `effect.value` 倍率叠加（非固定攻击点数）。
     * loadout 表内仅存倍率段；面板固定攻击仍走 getInnerSkillPassiveBonuses 对同形 buff 的分支。
     */
    zhenyang_jianfa_yanggang: {
      id: 'zhenyang_jianfa_yanggang',
      trigger: 'loadoutPassive',
      actions: [{ type: 'buff', stat: 'attack', value: 0.1, bonusAttr: 'strength', bonusPerPoint: 0.03 }]
    }
  };

  function getBattlePassive(id) {
    if (id == null || id === '') return null;
    return BATTLE_PASSIVES[id] || null;
  }

  /**
   * @param {string[]|null|undefined} ids
   * @returns {object[]}
   */
  function getBattlePassivesByIds(ids) {
    if (!ids || !ids.length) return [];
    var out = [];
    var seen = Object.create(null);
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i];
      if (!id || seen[id]) continue;
      seen[id] = true;
      var p = getBattlePassive(id);
      if (p) out.push(p);
    }
    return out;
  }

  /**
   * 从武学技能的 passiveIds 展开为「回合开始叠 Buff」行（不含 skillName，由 battle.js 补上）。
   * @param {{ passiveIds?: string[] }} skill
   * @returns {{ buffId: string, fromTurn: number, stacksPerTick: number }[]}
   */
  function expandTurnStartApplyBuffActions(skill) {
    var res = [];
    if (!skill || !skill.passiveIds || !skill.passiveIds.length) return res;
    var plist = getBattlePassivesByIds(skill.passiveIds);
    for (var i = 0; i < plist.length; i++) {
      var pb = plist[i];
      if (!pb || pb.trigger !== 'turnStart') continue;
      var actions = pb.actions;
      if (!actions || !actions.length) continue;
      for (var j = 0; j < actions.length; j++) {
        var act = actions[j];
        if (!act || act.type !== 'applyBuff' || !act.buffId) continue;
        res.push({
          buffId: act.buffId,
          fromTurn: act.fromTurn != null ? act.fromTurn : 2,
          stacksPerTick: act.stacksPerTick != null ? act.stacksPerTick : 1
        });
      }
    }
    return res;
  }

  /**
   * 武学被动是否会在回合开始引用某战斗 Buff（含旧版 turnStartSelfBuff 与 passiveIds 表）。
   */
  function skillReferencesCombatBuffOnTurnStart(skill, buffId) {
    if (!skill || !buffId) return false;
    var eff = skill.effect;
    if (eff && eff.type === 'turnStartSelfBuff' && eff.buffId === buffId) return true;
    var rows = expandTurnStartApplyBuffActions(skill);
    for (var k = 0; k < rows.length; k++) {
      if (rows[k].buffId === buffId) return true;
    }
    return false;
  }

  /**
   * 从被动技能的 passiveIds 取出「主动命中后追击」配置（同武功内多条时后者覆盖前者，与 battle.js 原循环一致）。
   * @param {{ passiveIds?: string[], name?: string }} skill
   * @returns {{ type: string, baseChance: number, damage: number, chanceAttr?: string, chancePerPoint?: number, skillName: string }|null}
   */
  function expandFollowAttackFromPassiveSkill(skill) {
    var last = null;
    if (!skill || !skill.passiveIds || !skill.passiveIds.length) return last;
    var plist = getBattlePassivesByIds(skill.passiveIds);
    for (var i = 0; i < plist.length; i++) {
      var pb = plist[i];
      if (!pb || pb.trigger !== 'afterActiveHit') continue;
      var actions = pb.actions;
      if (!actions || !actions.length) continue;
      for (var j = 0; j < actions.length; j++) {
        var act = actions[j];
        if (!act || act.type !== 'followAttack') continue;
        last = {
          type: 'followAttack',
          baseChance: Number(act.baseChance) || 0,
          damage: act.damage != null ? Number(act.damage) : 0.8,
          chanceAttr: act.chanceAttr,
          chancePerPoint: act.chancePerPoint != null ? Number(act.chancePerPoint) : 0,
          skillName: act.skillName || skill.name || '追击'
        };
      }
    }
    return last;
  }

  /**
   * 主动招式可带 passiveIds：展开「大卷判定闪避后追刺」配置（并入 battle.js skillData.onMissFollow）。
   * @param {{ passiveIds?: string[] }} activeSkill
   * @returns {{ baseChance: number, chanceAttr?: string, chancePerPoint: number, damage: number, skillName: string }|null}
   */
  function expandOnMissFollowFromSkill(activeSkill) {
    var last = null;
    if (!activeSkill || !activeSkill.passiveIds || !activeSkill.passiveIds.length) return last;
    var plist = getBattlePassivesByIds(activeSkill.passiveIds);
    for (var i = 0; i < plist.length; i++) {
      var pb = plist[i];
      if (!pb || pb.trigger !== 'onActiveMiss') continue;
      var actions = pb.actions;
      if (!actions || !actions.length) continue;
      for (var j = 0; j < actions.length; j++) {
        var act = actions[j];
        if (!act || act.type !== 'onMissFollow') continue;
        last = {
          baseChance: Number(act.baseChance) || 0,
          chanceAttr: act.chanceAttr,
          chancePerPoint: act.chancePerPoint != null ? Number(act.chancePerPoint) : 0,
          damage: act.damage != null ? Number(act.damage) : 0.85,
          skillName: act.skillName || '续刺'
        };
      }
    }
    return last;
  }

  /**
   * 内功类被动：从 passiveIds 展开 turnStart + autoHeal 段（数值与旧 skill.effect 同形）。
   * @returns {{ baseValue: number, levelMultiplier: number, bonusAttr: string, bonusPerPoint: number }[]}
   */
  function expandTurnStartAutoHealActions(skill) {
    var res = [];
    if (!skill || !skill.passiveIds || !skill.passiveIds.length) return res;
    var plist = getBattlePassivesByIds(skill.passiveIds);
    for (var i = 0; i < plist.length; i++) {
      var pb = plist[i];
      if (!pb || pb.trigger !== 'turnStart') continue;
      var actions = pb.actions;
      if (!actions || !actions.length) continue;
      for (var j = 0; j < actions.length; j++) {
        var act = actions[j];
        if (!act || act.type !== 'autoHeal') continue;
        res.push({
          baseValue: act.baseValue != null ? Number(act.baseValue) : 5,
          levelMultiplier: act.levelMultiplier != null ? Number(act.levelMultiplier) : 3,
          bonusAttr: act.bonusAttr || 'qi',
          bonusPerPoint: act.bonusPerPoint != null ? Number(act.bonusPerPoint) : 0.8
        });
      }
    }
    return res;
  }

  /**
   * 装备位被动（防御/气血上限/攻闪速招等）：与 skill.effect 同形，供 getInnerSkillPassiveBonuses / 敌人套用 / 内功面板统计展开。
   * @param {{ passiveIds?: string[] }} skill
   * @returns {object[]}
   */
  function expandLoadoutPassiveStatBonuses(skill) {
    var res = [];
    if (!skill || !skill.passiveIds || !skill.passiveIds.length) return res;
    var plist = getBattlePassivesByIds(skill.passiveIds);
    for (var i = 0; i < plist.length; i++) {
      var pb = plist[i];
      if (!pb || pb.trigger !== 'loadoutPassive') continue;
      var actions = pb.actions;
      if (!actions || !actions.length) continue;
      for (var j = 0; j < actions.length; j++) {
        var act = actions[j];
        if (act && act.type) res.push(act);
      }
    }
    return res;
  }

  /**
   * 单段内功回合回血（与 battle.js 原式一致：Math.floor(base + level×lm + 属性×bpp)）。
   * @param {Record<string, number>|null|undefined} stats
   * @param {number} martialOrInnerLevel
   * @param {{ baseValue?: number, levelMultiplier?: number, bonusAttr?: string, bonusPerPoint?: number }} seg
   */
  function computeInnerAutoHealOnce(stats, martialOrInnerLevel, seg) {
    stats = stats || {};
    var base = seg.baseValue != null ? Number(seg.baseValue) : 5;
    var lm = seg.levelMultiplier != null ? Number(seg.levelMultiplier) : 3;
    var lvl = Number(martialOrInnerLevel) || 0;
    var attrKey = seg.bonusAttr || 'qi';
    var attrVal = stats[attrKey] != null ? Number(stats[attrKey]) : 0;
    var bpp = seg.bonusPerPoint != null ? Number(seg.bonusPerPoint) : 0.8;
    return Math.floor(base + lvl * lm + attrVal * bpp);
  }

  global.BATTLE_PASSIVES = BATTLE_PASSIVES;
  global.getBattlePassive = getBattlePassive;
  global.getBattlePassivesByIds = getBattlePassivesByIds;
  global.expandTurnStartApplyBuffActions = expandTurnStartApplyBuffActions;
  global.skillReferencesCombatBuffOnTurnStart = skillReferencesCombatBuffOnTurnStart;
  global.expandFollowAttackFromPassiveSkill = expandFollowAttackFromPassiveSkill;
  global.expandOnMissFollowFromSkill = expandOnMissFollowFromSkill;
  global.expandTurnStartAutoHealActions = expandTurnStartAutoHealActions;
  global.expandLoadoutPassiveStatBonuses = expandLoadoutPassiveStatBonuses;
  global.computeInnerAutoHealOnce = computeInnerAutoHealOnce;
})(typeof window !== 'undefined' ? window : globalThis);
