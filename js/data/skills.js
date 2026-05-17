/**
 * 技能数据
 * @module skills
 */

/**
 * 技能定义
 */
const SKILLS = {
  // 基础技能
  basic_attack: {
    id: 'basic_attack',
    name: '基础攻击',
    description: '普通的攻击招式',
    type: 'attack',
    damage: 10,
    cooldown: 0,
    currentCooldown: 0,
    mpCost: 0,
    unlockLevel: 1
  },

  // 治疗技能
  healing_palm: {
    id: 'healing_palm',
    name: '疗伤掌',
    description: '运用内力为自己疗伤',
    type: 'heal',
    healAmount: 25,
    cooldown: 2,
    currentCooldown: 0,
    mpCost: 15,
    unlockLevel: 1
  },

  // 攻击技能
  power_strike: {
    id: 'power_strike',
    name: '大力一击',
    description: '蓄力后发动强力攻击',
    type: 'attack',
    damage: 30,
    cooldown: 2,
    currentCooldown: 0,
    mpCost: 10,
    unlockLevel: 3
  },

  quick_strike: {
    id: 'quick_strike',
    name: '快剑',
    description: '快速连续攻击，有几率触发连击',
    type: 'attack',
    damage: 15,
    cooldown: 1,
    currentCooldown: 0,
    mpCost: 8,
    unlockLevel: 2
  },

  whirlwind_slash: {
    id: 'whirlwind_slash',
    name: '旋风斩',
    description: '旋转武器攻击周围敌人',
    type: 'attack',
    damage: 25,
    cooldown: 3,
    currentCooldown: 0,
    mpCost: 20,
    unlockLevel: 5
  },

  iron_body: {
    id: 'iron_body',
    name: '铁布衫',
    description: '运功护体，提升防御力',
    type: 'buff',
    buffType: 'defense',
    buffAmount: 10,
    buffDuration: 3,
    cooldown: 4,
    currentCooldown: 0,
    mpCost: 12,
    unlockLevel: 4
  },

  inner_fire: {
    id: 'inner_fire',
    name: '烈焰神功',
    description: '激发体内潜能，短时间内大幅提升攻击力',
    type: 'buff',
    buffType: 'attack',
    buffAmount: 20,
    buffDuration: 2,
    cooldown: 5,
    currentCooldown: 0,
    mpCost: 25,
    unlockLevel: 6
  },

  poison_strike: {
    id: 'poison_strike',
    name: '毒针',
    description: '发射毒针造成持续伤害',
    type: 'debuff',
    debuffType: 'poison',
    damagePerTurn: 5,
    debuffDuration: 3,
    cooldown: 3,
    currentCooldown: 0,
    mpCost: 18,
    unlockLevel: 5
  }
};

/**
 * 获取技能列表
 * @returns {Array} 技能数组
 */
function getSkillList() {
  return Object.values(SKILLS);
}

/**
 * 根据ID获取技能
 * @param {string} skillId - 技能ID
 * @returns {object|null} 技能对象
 */
function getSkillById(skillId) {
  return SKILLS[skillId] || null;
}

/**
 * 获取角色可用技能
 * @param {object} character - 角色对象
 * @returns {Array} 可用技能数组
 */
function getCharacterSkills(character) {
  return character.skills
    .map(skillId => getSkillById(skillId))
    .filter(skill => skill !== null);
}

// 暴露到全局
window.SKILLS = SKILLS;
window.getSkillById = getSkillById;
window.getCharacterSkills = getCharacterSkills;