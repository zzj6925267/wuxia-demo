/**
 * 招式伤害表（策划调数值只改本文件；键 = 武学库 martial.id + '_' + 主动 skill.id）
 * 与 `martialArtsData.js` 中主动招式一一对应；战斗侧用 `resolveActiveDamageEffect(skill, martialArtId)` 解析，
 * 仍兼容旧存档/旧数据里主动上内联的 `effect: { type: 'damage', ... }`。
 */
(function (global) {
  'use strict';

  /** @type {Record<string, { value: number, bonusAttr?: string, bonusPerPoint?: number }>} */
  var MARTIAL_SKILL_DAMAGE_TABLE = {
    '1_1': { value: 1.2, bonusAttr: 'strength', bonusPerPoint: 0.02 },
    '6_1': { value: 1.14, bonusAttr: 'agility', bonusPerPoint: 0.012 },
    '10_1': { value: 1.0, bonusAttr: 'strength', bonusPerPoint: 0.006 },
    '13_1': { value: 1.0, bonusAttr: 'strength', bonusPerPoint: 0.006 },
    '14_1': { value: 1.0, bonusAttr: 'strength', bonusPerPoint: 0.006 },
    '15_1': { value: 1.0, bonusAttr: 'strength', bonusPerPoint: 0.006 }
  };

  /**
   * @param {string} key 形如 "6_1"
   * @returns {{ type: 'damage', value: number, bonusAttr?: string, bonusPerPoint?: number }|null}
   */
  function getMartialSkillDamageRecipe(key) {
    if (key == null || key === '') return null;
    var row = MARTIAL_SKILL_DAMAGE_TABLE[key];
    if (!row || typeof row.value !== 'number') return null;
    var out = { type: 'damage', value: Number(row.value) };
    if (row.bonusAttr) out.bonusAttr = row.bonusAttr;
    if (row.bonusPerPoint != null) out.bonusPerPoint = Number(row.bonusPerPoint);
    return out;
  }

  /**
   * @param {{ id?: number, effect?: { type?: string }, damageRecipeId?: string }} skill
   * @param {number|null|undefined} martialArtId 武学库 `martial.id`
   */
  function resolveActiveDamageEffect(skill, martialArtId) {
    if (!skill) return null;
    if (skill.effect && skill.effect.type === 'damage') return skill.effect;
    if (skill.damageRecipeId) {
      var byId = getMartialSkillDamageRecipe(String(skill.damageRecipeId));
      if (byId) return byId;
    }
    if (martialArtId != null && skill.id != null) {
      var k = String(martialArtId) + '_' + String(skill.id);
      var byKey = getMartialSkillDamageRecipe(k);
      if (byKey) return byKey;
    }
    return null;
  }

  global.MARTIAL_SKILL_DAMAGE_TABLE = MARTIAL_SKILL_DAMAGE_TABLE;
  global.getMartialSkillDamageRecipe = getMartialSkillDamageRecipe;
  global.resolveActiveDamageEffect = resolveActiveDamageEffect;
})(typeof window !== 'undefined' ? window : globalThis);
