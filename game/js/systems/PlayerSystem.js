/**
 * 玩家养成系统
 * @module PlayerSystem
 */

class PlayerSystem {
  constructor(initialData = null) {
    this.player = initialData ? window.deepClone(initialData) : window.deepClone(window.PLAYER_INITIAL);
    this._updateDerivedStats();
  }

  /** 读档或外部改过 player 后调用，同步攻防血蓝等派生属性 */
  recalculateDerivedStats() {
    this._updateDerivedStats();
  }

  _updateDerivedStats() {
    if (window.StatCalculator) {
      const finalStats = window.StatCalculator.calculateFinalStats(this.player);
      this.player.attack = finalStats.attack;
      this.player.maxHp = finalStats.maxHp;
      this.player.maxMp = finalStats.maxMp;
      this.player.speed = finalStats.speed;
      this.player.defense = finalStats.defense;
      this.player.hp = finalStats.hp;
      this.player.mp = finalStats.mp;
    } else {
      const { stats } = this.player;
      const multipliers = window.GAME_CONFIG.STAT_MULTIPLIERS;

      this.player.attack = Math.floor(
        10 + stats.strength * multipliers.strength + this.player.level * 2
      );
      this.player.defense = Math.floor(
        5 + stats.vitality * 0.2 + this.player.level
      );

      this.player.maxHp = Math.floor(
        100 + stats.vitality * multipliers.vitality + this.player.level * 10
      );
      this.player.maxMp = Math.floor(
        50 + stats.spirit * 2 + this.player.level * 5
      );

      this.player.hp = Math.min(this.player.hp, this.player.maxHp);
      this.player.mp = Math.min(this.player.mp, this.player.maxMp);
    }
  }

  getPlayer() {
    return this.player;
  }

  loadFromData(data) {
    if (!data) return;

    Object.keys(data).forEach(key => {
      if (key === 'stats') {
        Object.keys(data.stats).forEach(statKey => {
          if (this.player.stats[statKey] !== undefined) {
            this.player.stats[statKey] = data.stats[statKey];
          }
        });
      } else if (this.player.hasOwnProperty(key)) {
        this.player[key] = data[key];
      }
    });

    this._updateDerivedStats();
  }

  getPlayerData() {
    return window.deepClone(this.player);
  }

  addExperience(amount) {
    if (!this.player.exp) {
      this.player.exp = 0;
    }
    this.player.exp += amount;
  }

  getExperience() {
    return this.player.exp || 0;
  }

  addExp(amount) {
    this.player.exp += amount;

    while (this.player.exp >= this.player.expToNextLevel) {
      this.player.exp -= this.player.expToNextLevel;
      this.levelUp();
      return true;
    }

    return false;
  }

  levelUp() {
    this.player.level++;
    this.player.expToNextLevel = Math.floor(
      window.GAME_CONFIG.INITIAL_STATS.expToNextLevel *
      Math.pow(window.GAME_CONFIG.EXP_MULTIPLIER, this.player.level - 1)
    );

    this.player.stats.strength += 2;
    this.player.stats.agility += 2;
    this.player.stats.vitality += 2;
    this.player.stats.spirit += 2;

    this.player.hp = this.player.maxHp;
    this.player.mp = this.player.maxMp;

    this._updateDerivedStats();
  }

  addStat(statName, amount) {
    if (this.player.stats[statName] !== undefined) {
      this.player.stats[statName] += amount;
      this._updateDerivedStats();
    }
  }

  addGold(amount) {
    this.player.gold += amount;
  }

  spendGold(amount) {
    if (this.player.gold >= amount) {
      this.player.gold -= amount;
      return true;
    }
    return false;
  }

  takeDamage(damage) {
    this.player.hp = Math.max(0, this.player.hp - damage);
    return this.player.hp <= 0;
  }

  heal(amount) {
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + amount);
  }

  spendMp(amount) {
    if (this.player.mp >= amount) {
      this.player.mp -= amount;
      return true;
    }
    return false;
  }

  restoreMp(amount) {
    this.player.mp = Math.min(this.player.maxMp, this.player.mp + amount);
  }

  useSkill(skillId) {
    const skill = window.getSkillById(skillId);
    if (!skill) {
      return { success: false, message: '技能不存在' };
    }

    if (!this.spendMp(skill.mpCost)) {
      return { success: false, message: '内力不足' };
    }

    let result = { success: true, skill };

    switch (skill.type) {
      case window.SKILL_TYPE.ATTACK:
      case 'attack':
        if (window.StatCalculator) {
          result.damage = window.StatCalculator.calculateDamage(
            skill.damage || skill.effect?.value || 1,
            this.player.attack,
            0
          );
        } else {
          result.damage = window.calculateDamage(skill.damage, this.player.attack, 0);
        }
        result.message = `${skill.name}造成了 ${result.damage} 点伤害`;
        break;

      case window.SKILL_TYPE.HEAL:
      case 'heal':
        const healAmount = window.calculateHeal(skill.healAmount, this.player.stats.spirit);
        this.heal(healAmount);
        result.healAmount = healAmount;
        result.message = `${skill.name}恢复了 ${healAmount} 点生命`;
        break;

      case window.SKILL_TYPE.BUFF:
      case 'buff':
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

  addItem(itemId, quantity = 1) {
    const def = typeof window !== 'undefined' && window.ITEMS && window.ITEMS[itemId];
    const noStack = def && def.category === 'equipment';
    const n = Math.max(1, Math.floor(Number(quantity)) || 1);
    if (noStack) {
      for (let q = 0; q < n; q++) {
        this.player.inventory.push({ id: itemId, quantity: 1 });
      }
      return;
    }
    const existingItem = this.player.inventory.find(item => item.id === itemId);
    if (existingItem) {
      existingItem.quantity += n;
    } else {
      this.player.inventory.push({ id: itemId, quantity: n });
    }
  }

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

  setFlag(flagName, value = true) {
    this.player.flags[flagName] = value;
  }

  getFlag(flagName) {
    return this.player.flags[flagName] || null;
  }

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

  getStatSources() {
    if (window.StatCalculator) {
      return window.StatCalculator.calculateStatSources(this.player);
    }
    return null;
  }
}

window.PlayerSystem = PlayerSystem;