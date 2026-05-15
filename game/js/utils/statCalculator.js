/**
 * 属性计算工具类
 * @module StatCalculator
 */
const StatCalculator = {
  /**
   * 计算基础攻击力
   * @param {number} strength - 臂力
   * @param {number} level - 等级
   * @returns {number} 攻击力
   */
  calculateAttack(strength, level) {
    return Math.ceil(50 + strength * 3 + level * 2);
  },

  /**
   * 计算基础气血
   * @param {number} vitality - 根骨
   * @param {number} level - 等级
   * @returns {number} 气血值
   */
  calculateHp(vitality, level) {
    return Math.ceil(100 + vitality * 5 + level * 10);
  },

  /**
   * 计算基础内力
   * @param {number} spirit - 内息
   * @param {number} level - 等级
   * @returns {number} 内力值
   */
  calculateMp(spirit, level) {
    return Math.ceil(50 + spirit * 2 + level * 5);
  },

  /**
   * 计算速度
   * @param {number} agility - 身法
   * @returns {number} 速度值
   */
  calculateSpeed(agility) {
    return Math.ceil(50 + agility * 2);
  },

  /**
   * 计算防御力
   * @param {number} vitality - 根骨
   * @param {number} level - 等级
   * @returns {number} 防御力
   */
  calculateDefense(vitality, level) {
    return Math.ceil(10 + vitality * 2 + level);
  },

  /**
   * 计算最终属性（包含武学和装备加成）
   * @param {PlayerData} player - 玩家数据
   * @returns {Object} 最终属性
   */
  calculateFinalStats(player) {
    const { stats, level, martialArts = [], equipment = [] } = player;
    
    let attack = this.calculateAttack(stats.strength, level);
    let maxHp = this.calculateHp(stats.vitality, level);
    let maxMp = this.calculateMp(stats.spirit, level);
    let speed = this.calculateSpeed(stats.agility);
    let defense = this.calculateDefense(stats.vitality, level);

    // 首先应用内功被动效果
    const innerSkillEffects = this.calculateInnerSkillEffects(player);
    maxHp += innerSkillEffects.maxHpBonus;
    defense += innerSkillEffects.defenseBonus;

    martialArts.forEach(ma => {
      if (ma.equipped && ma.bonuses) {
        attack += ma.bonuses.attack || 0;
        maxHp += ma.bonuses.maxHp || 0;
        maxMp += ma.bonuses.maxMp || 0;
        speed += ma.bonuses.speed || 0;
        defense += ma.bonuses.defense || 0;
      }
    });

    equipment.forEach(item => {
      if (item.equipped && item.bonuses) {
        attack += item.bonuses.attack || 0;
        maxHp += item.bonuses.maxHp || 0;
        maxMp += item.bonuses.maxMp || 0;
        speed += item.bonuses.speed || 0;
        defense += item.bonuses.defense || 0;
      }
    });

    return {
      attack,
      maxHp,
      maxMp,
      speed,
      defense,
      hp: Math.min(player.hp || maxHp, maxHp),
      mp: Math.min(player.mp || maxMp, maxMp),
      autoHeal: innerSkillEffects.autoHeal
    };
  },

  /**
   * 计算属性来源详情（用于悬浮提示）
   * @param {PlayerData} player - 玩家数据
   * @returns {Object} 属性来源详情
   */
  calculateStatSources(player) {
    const { stats, level, martialArts = [], equipment = [] } = player;
    
    const baseAttack = this.calculateAttack(stats.strength, level);
    const baseHp = this.calculateHp(stats.vitality, level);
    const baseMp = this.calculateMp(stats.spirit, level);
    
    let martialAttack = 0;
    let martialHp = 0;
    let martialMp = 0;
    
    martialArts.forEach(ma => {
      if (ma.equipped && ma.bonuses) {
        martialAttack += ma.bonuses.attack || 0;
        martialHp += ma.bonuses.maxHp || 0;
        martialMp += ma.bonuses.maxMp || 0;
      }
    });
    
    let equipAttack = 0;
    let equipHp = 0;
    let equipMp = 0;
    
    equipment.forEach(item => {
      if (item.equipped && item.bonuses) {
        equipAttack += item.bonuses.attack || 0;
        equipHp += item.bonuses.maxHp || 0;
        equipMp += item.bonuses.maxMp || 0;
      }
    });
    
    return {
      attack: {
        base: baseAttack,
        martial: martialAttack,
        equip: equipAttack,
        total: baseAttack + martialAttack + equipAttack
      },
      hp: {
        base: baseHp,
        martial: martialHp,
        equip: equipHp,
        total: baseHp + martialHp + equipHp
      },
      mp: {
        base: baseMp,
        martial: martialMp,
        equip: equipMp,
        total: baseMp + martialMp + equipMp
      }
    };
  },

  /**
   * 计算技能伤害
   * @param {number} skillMultiplier - 技能伤害倍率
   * @param {number} attack - 攻击力
   * @param {number} defense - 防御力
   * @returns {number} 伤害值
   */
  calculateDamage(skillMultiplier, attack, defense) {
    const baseDamage = attack * skillMultiplier;
    const reduction = defense * 0.1;
    return Math.max(1, Math.ceil(baseDamage - reduction));
  },

  /**
   * 计算治疗量
   * @param {number} healAmount - 基础治疗量
   * @param {number} spirit - 内息
   * @returns {number} 治疗量
   */
  calculateHeal(healAmount, spirit) {
    return Math.ceil(healAmount * (1 + spirit * 0.05));
  },

  /**
   * 计算内功被动效果
   * @param {PlayerData} player - 玩家数据
   * @returns {Object} 所有内功被动效果加成
   */
  calculateInnerSkillEffects(player) {
    const martialArts = player.martialArts || [];
    const innerSkillEffects = {
      autoHeal: 0,
      maxHpBonus: 0,
      defenseBonus: 0,
      allBuffs: []
    };

    martialArts.forEach(martial => {
      if (martial.type === '内功' && martial.equipped && martial.skills) {
        martial.skills.forEach(skill => {
          if (martial.currentLevel >= skill.unlockLevel) {
            const segs =
              typeof expandTurnStartAutoHealActions === 'function'
                ? expandTurnStartAutoHealActions(skill)
                : [];
            if (segs.length) {
              segs.forEach(seg => {
                if (typeof computeInnerAutoHealOnce === 'function') {
                  innerSkillEffects.autoHeal += computeInnerAutoHealOnce(
                    player.stats,
                    martial.currentLevel,
                    seg
                  );
                }
              });
            }

            const loadout =
              typeof expandLoadoutPassiveStatBonuses === 'function'
                ? expandLoadoutPassiveStatBonuses(skill)
                : [];
            if (loadout.length) {
              loadout.forEach(effect => {
                if (effect.type === 'maxHpBuff') {
                  let hpBonus = effect.baseValue || 0;
                  if (effect.bonusAttr) {
                    hpBonus += (player.stats[effect.bonusAttr] || 0) * (effect.bonusPerPoint || 0);
                  }
                  innerSkillEffects.maxHpBonus += Math.ceil(hpBonus);
                } else if (effect.type === 'defenseBuff') {
                  let defenseBonus = effect.baseValue || 0;
                  if (effect.bonusAttr) {
                    defenseBonus +=
                      (player.stats[effect.bonusAttr] || 0) * (effect.bonusPerPoint || 0);
                  }
                  innerSkillEffects.defenseBonus += Math.ceil(defenseBonus);
                } else if (effect.type === 'buff') {
                  innerSkillEffects.allBuffs.push({
                    martialName: martial.name,
                    skillName: skill.name,
                    effect: effect
                  });
                }
              });
            }

            if (loadout.length) return;

            const effect = skill.effect;
            if (!effect) return;

            if (effect.type === 'autoHeal') {
              if (typeof computeInnerAutoHealOnce === 'function') {
                innerSkillEffects.autoHeal += computeInnerAutoHealOnce(
                  player.stats,
                  martial.currentLevel,
                  effect
                );
              } else {
                const autoHealAmount =
                  (effect.baseValue || 5) +
                  martial.currentLevel * (effect.levelMultiplier || 1) +
                  (player.stats[effect.bonusAttr] || 0) * (effect.bonusPerPoint || 0);
                innerSkillEffects.autoHeal += Math.ceil(autoHealAmount);
              }
            } else if (effect.type === 'maxHpBuff') {
              // 固本：增加气血上限
              let hpBonus = effect.baseValue || 0;
              if (effect.bonusAttr) {
                hpBonus += (player.stats[effect.bonusAttr] || 0) * (effect.bonusPerPoint || 0);
              }
              innerSkillEffects.maxHpBonus += Math.ceil(hpBonus);
            } else if (effect.type === 'defenseBuff') {
              // 培元：增加防御（受根骨影响）
              let defenseBonus = effect.baseValue || 0;
              if (effect.bonusAttr) {
                defenseBonus += (player.stats[effect.bonusAttr] || 0) * (effect.bonusPerPoint || 0);
              }
              innerSkillEffects.defenseBonus += Math.ceil(defenseBonus);
            } else if (effect.type === 'buff') {
              // 其他buff效果
              innerSkillEffects.allBuffs.push({
                martialName: martial.name,
                skillName: skill.name,
                effect: effect
              });
            }
          }
        });
      }
    });

    return innerSkillEffects;
  }
};

// 暴露到全局
window.StatCalculator = StatCalculator;