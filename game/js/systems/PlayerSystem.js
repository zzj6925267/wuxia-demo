/**
 * 玩家养成系统
 * @module PlayerSystem
 */

import { GAME_CONFIG, SKILL_TYPE } from '../config.js';
import { PLAYER_INITIAL } from '../data/characters.js';
import { getSkillById } from '../data/skills.js';
import { deepClone, calculateDamage, calculateHeal } from '../utils/helpers.js';

/**
 * 玩家系统类
 */
export class PlayerSystem {
  /**
   * 构造函数
   * @param {object} initialData - 初始数据（可选）
   */
  constructor(initialData = null) {
    this.player = initialData ? deepClone(initialData) : deepClone(PLAYER_INITIAL);
    this._updateDerivedStats();
  }

  /**
   * 更新派生属性
   */
  _updateDerivedStats() {
    const { stats } = this.player;
    const multipliers = GAME_CONFIG.STAT_MULTIPLIERS;

    // 根据属性计算攻击和防御
    this.player.attack = Math.floor(
      10 + stats.strength * multipliers.strength + this.player.level * 2
    );
    this.player.defense = Math.floor(
      5 + stats.vitality * 0.2 + this.player.level
    );

    // 计算最大生命和内力
    this.player.maxHp = Math.floor(
      100 + stats.vitality * multipliers.vitality + this.player.level * 10
    );
    this.player.maxMp = Math.floor(
      50 + stats.spirit * 2 + this.player.level * 5
    );

    // 确保当前值不超过最大值
    this.player.hp = Math.min(this.player.hp, this.player.maxHp);
    this.player.mp = Math.min(this.player.mp, this.player.maxMp);
  }

  /**
   * 获取玩家数据
   * @returns {object} 玩家数据
   */
  getPlayer() {
    return this.player;
  }

  /**
   * 添加经验值
   * @param {number} amount - 经验值数量
   * @returns {boolean} 是否升级
   */
  addExp(amount) {
    this.player.exp += amount;
    
    while (this.player.exp >= this.player.expToNextLevel) {
      this.player.exp -= this.player.expToNextLevel;
      this.levelUp();
      return true;
    }
    
    return false;
  }

  /**
   * 升级
   */
  levelUp() {
    this.player.level++;
    this.player.expToNextLevel = Math.floor(
      GAME_CONFIG.INITIAL_STATS.expToNextLevel * 
      Math.pow(GAME_CONFIG.EXP_MULTIPLIER, this.player.level - 1)
    );

    // 升级奖励属性点
    this.player.stats.strength += 2;
    this.player.stats.agility += 2;
    this.player.stats.vitality += 2;
    this.player.stats.spirit += 2;

    // 恢复全部生命和内力
    this.player.hp = this.player.maxHp;
    this.player.mp = this.player.maxMp;

    // 更新派生属性
    this._updateDerivedStats();
  }

  /**
   * 增加属性点
   * @param {string} statName - 属性名称
   * @param {number} amount - 增加数量
   */
  addStat(statName, amount) {
    if (this.player.stats[statName] !== undefined) {
      this.player.stats[statName] += amount;
      this._updateDerivedStats();
    }
  }

  /**
   * 添加金币
   * @param {number} amount - 金币数量
   */
  addGold(amount) {
    this.player.gold += amount;
  }

  /**
   * 消耗金币
   * @param {number} amount - 金币数量
   * @returns {boolean} 是否成功
   */
  spendGold(amount) {
    if (this.player.gold >= amount) {
      this.player.gold -= amount;
      return true;
    }
    return false;
  }

  /**
   * 受到伤害
   * @param {number} damage - 伤害值
   * @returns {boolean} 是否死亡
   */
  takeDamage(damage) {
    this.player.hp = Math.max(0, this.player.hp - damage);
    return this.player.hp <= 0;
  }

  /**
   * 治疗
   * @param {number} amount - 治疗量
   */
  heal(amount) {
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + amount);
  }

  /**
   * 消耗内力
   * @param {number} amount - 内力消耗
   * @returns {boolean} 是否成功
   */
  spendMp(amount) {
    if (this.player.mp >= amount) {
      this.player.mp -= amount;
      return true;
    }
    return false;
  }

  /**
   * 恢复内力
   * @param {number} amount - 恢复量
   */
  restoreMp(amount) {
    this.player.mp = Math.min(this.player.maxMp, this.player.mp + amount);
  }

  /**
   * 使用技能
   * @param {string} skillId - 技能ID
   * @returns {object} 技能结果
   */
  useSkill(skillId) {
    const skill = getSkillById(skillId);
    if (!skill) {
      return { success: false, message: '技能不存在' };
    }

    // 检查内力
    if (!this.spendMp(skill.mpCost)) {
      return { success: false, message: '内力不足' };
    }

    // 根据技能类型执行效果
    let result = { success: true, skill };

    switch (skill.type) {
      case SKILL_TYPE.ATTACK:
        result.damage = calculateDamage(skill.damage, this.player.attack, 0);
        result.message = `${skill.name}造成了 ${result.damage} 点伤害`;
        break;

      case SKILL_TYPE.HEAL:
        const healAmount = calculateHeal(skill.healAmount, this.player.stats.spirit);
        this.heal(healAmount);
        result.healAmount = healAmount;
        result.message = `${skill.name}恢复了 ${healAmount} 点生命`;
        break;

      case SKILL_TYPE.BUFF:
        result.buffType = skill.buffType;
        result.buffAmount = skill.buffAmount;
        result.buffDuration = skill.buffDuration;
        result.message = `${skill.name}激活，${skill.buffType}提升 ${skill.buffAmount}`;
        break;

      default:
        result.message = `${skill.name}使用成功`;
    }

    return result;
  }

  /**
   * 添加物品到背包
   * @param {string} itemId - 物品ID
   * @param {number} quantity - 数量
   */
  addItem(itemId, quantity = 1) {
    const existingItem = this.player.inventory.find(item => item.id === itemId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.player.inventory.push({ id: itemId, quantity });
    }
  }

  /**
   * 从背包移除物品
   * @param {string} itemId - 物品ID
   * @param {number} quantity - 数量
   * @returns {boolean} 是否成功
   */
  removeItem(itemId, quantity = 1) {
    const index = this.player.inventory.findIndex(item => item.id === itemId);
    if (index === -1) return false;

    const item = this.player.inventory[index];
    if (item.quantity < quantity) return false;

    item.quantity -= quantity;
    if (item.quantity <= 0) {
      this.player.inventory.splice(index, 1);
    }

    return true;
  }

  /**
   * 设置标记
   * @param {string} flagName - 标记名称
   * @param {boolean|string|number} value - 标记值
   */
  setFlag(flagName, value = true) {
    this.player.flags[flagName] = value;
  }

  /**
   * 获取标记
   * @param {string} flagName - 标记名称
   * @returns {boolean|string|number|null} 标记值
   */
  getFlag(flagName) {
    return this.player.flags[flagName] || null;
  }

  /**
   * 获取玩家状态摘要
   * @returns {object} 状态摘要
   */
  getStatusSummary() {
    return {
      name: this.player.name,
      level: this.player.level,
      exp: this.player.exp,
      expToNextLevel: this.player.expToNextLevel,
      hp: this.player.hp,
      maxHp: this.player.maxHp,
      mp: this.player.mp,
      maxMp: this.player.maxMp,
      attack: this.player.attack,
      defense: this.player.defense,
      gold: this.player.gold
    };
  }
}