/**
 * 战斗系统
 * @module BattleSystem
 */

/**
 * 战斗系统类
 */
class BattleSystem {
  /**
   * 构造函数
   * @param {PlayerSystem} playerSystem - 玩家系统
   * @param {function} onBattleStart - 战斗开始回调
   * @param {function} onBattleEnd - 战斗结束回调
   * @param {function} onTurn - 回合回调
   * @param {function} onDamage - 伤害回调
   */
  constructor(playerSystem, onBattleStart, onBattleEnd, onTurn, onDamage) {
    this.playerSystem = playerSystem;
    this.onBattleStart = onBattleStart;
    this.onBattleEnd = onBattleEnd;
    this.onTurn = onTurn;
    this.onDamage = onDamage;

    this.enemy = null;
    this.isPlayerTurn = true;
    this.isActive = false;
    this.turnCount = 0;
    this.playerBuffs = [];
    this.enemyBuffs = [];
  }

  /**
   * 开始战斗
   * @param {string} enemyId - 敌人ID
   * @returns {boolean} 是否成功
   */
  startBattle(enemyId) {
    const enemyData = window.ENEMIES[enemyId];
    if (!enemyData) {
      console.error(`Enemy not found: ${enemyId}`);
      return false;
    }

    this.enemy = window.deepClone(enemyData);
    this.isPlayerTurn = true;
    this.isActive = true;
    this.turnCount = 1;
    this.playerBuffs = [];
    this.enemyBuffs = [];

    // 刷新技能冷却
    this._refreshCooldowns();

    if (this.onBattleStart) {
      this.onBattleStart(this.playerSystem.getPlayer(), this.enemy);
    }

    return true;
  }

  /**
   * 刷新技能冷却
   */
  _refreshCooldowns() {
    const player = this.playerSystem.getPlayer();
    player.skills.forEach(skillId => {
      const skill = window.getSkillById(skillId);
      if (skill) {
        skill.currentCooldown = 0;
      }
    });

    if (this.enemy) {
      this.enemy.skills.forEach(skillId => {
        const skill = window.getSkillById(skillId);
        if (skill) {
          skill.currentCooldown = 0;
        }
      });
    }
  }

  /**
   * 获取敌人数据
   * @returns {object|null} 敌人数据
   */
  getEnemy() {
    return this.enemy;
  }

  /**
   * 获取战斗状态
   * @returns {object} 战斗状态
   */
  getBattleState() {
    return {
      player: this.playerSystem.getStatusSummary(),
      enemy: this.enemy ? {
        name: this.enemy.name,
        hp: this.enemy.hp,
        maxHp: this.enemy.maxHp,
        attack: this.enemy.attack,
        defense: this.enemy.defense
      } : null,
      isPlayerTurn: this.isPlayerTurn,
      turnCount: this.turnCount,
      isActive: this.isActive
    };
  }

  /**
   * 玩家使用技能
   * @param {string} skillId - 技能ID
   * @returns {object} 战斗结果
   */
  playerUseSkill(skillId) {
    if (!this.isActive || !this.isPlayerTurn) {
      return { success: false, message: '不是你的回合' };
    }

    const skill = window.getSkillById(skillId);
    if (!skill) {
      return { success: false, message: '技能不存在' };
    }

    // 检查冷却
    if (skill.currentCooldown > 0) {
      return { success: false, message: `${skill.name}正在冷却中` };
    }

    // 检查内力
    if (!this.playerSystem.spendMp(skill.mpCost)) {
      return { success: false, message: '内力不足' };
    }

    let result = { success: true, skill, isPlayerTurn: true };

    switch (skill.type) {
      case window.SKILL_TYPE.ATTACK:
        result = this._executePlayerAttack(skill);
        break;

      case window.SKILL_TYPE.HEAL:
        result = this._executePlayerHeal(skill);
        break;

      case window.SKILL_TYPE.BUFF:
        result = this._executePlayerBuff(skill);
        break;

      case window.SKILL_TYPE.DEBUFF:
        result = this._executePlayerDebuff(skill);
        break;
    }

    // 设置冷却
    skill.currentCooldown = skill.cooldown;

    // 检查敌人是否死亡
    if (this.enemy && this.enemy.hp <= 0) {
      return this._endBattle(true);
    }

    // 切换到敌人回合
    if (result.success) {
      this.isPlayerTurn = false;
      setTimeout(() => this._enemyTurn(), 1000);
    }

    return result;
  }

  /**
   * 执行玩家攻击
   * @param {object} skill - 技能
   * @returns {object} 结果
   */
  _executePlayerAttack(skill) {
    const player = this.playerSystem.getPlayer();
    const damage = window.calculateDamage(skill.damage, player.attack, this.enemy.defense);
    
    // 检查暴击
    const isCritical = window.checkCritical(window.GAME_CONFIG.BATTLE.CRITICAL_CHANCE + player.stats.agility * 0.01);
    const finalDamage = isCritical ? Math.floor(damage * window.GAME_CONFIG.BATTLE.CRITICAL_MULTIPLIER) : damage;

    this.enemy.hp -= finalDamage;

    if (this.onDamage) {
      this.onDamage('player', skill.name, finalDamage, isCritical);
    }

    return {
      success: true,
      skill,
      damage: finalDamage,
      isCritical,
      message: isCritical ? 
        `暴击！${skill.name}造成了 ${finalDamage} 点伤害！` :
        `${skill.name}造成了 ${finalDamage} 点伤害`
    };
  }

  /**
   * 执行玩家治疗
   * @param {object} skill - 技能
   * @returns {object} 结果
   */
  _executePlayerHeal(skill) {
    const player = this.playerSystem.getPlayer();
    const healAmount = window.calculateHeal(skill.healAmount, player.stats.spirit);
    this.playerSystem.heal(healAmount);

    return {
      success: true,
      skill,
      healAmount,
      message: `${skill.name}恢复了 ${healAmount} 点生命`
    };
  }

  /**
   * 执行玩家增益
   * @param {object} skill - 技能
   * @returns {object} 结果
   */
  _executePlayerBuff(skill) {
    this.playerBuffs.push({
      type: skill.buffType,
      amount: skill.buffAmount,
      duration: skill.buffDuration
    });

    return {
      success: true,
      skill,
      buffType: skill.buffType,
      buffAmount: skill.buffAmount,
      message: `${skill.name}激活，${skill.buffType}提升 ${skill.buffAmount}`
    };
  }

  /**
   * 执行玩家减益
   * @param {object} skill - 技能
   * @returns {object} 结果
   */
  _executePlayerDebuff(skill) {
    this.enemyBuffs.push({
      type: skill.debuffType,
      damagePerTurn: skill.damagePerTurn,
      duration: skill.debuffDuration
    });

    return {
      success: true,
      skill,
      debuffType: skill.debuffType,
      message: `${skill.name}命中敌人`
    };
  }

  /**
   * 敌人回合
   */
  _enemyTurn() {
    if (!this.isActive || !this.enemy) return;

    // 应用敌人减益效果
    this._applyDebuffs();

    if (this.enemy.hp <= 0) {
      this._endBattle(true);
      return;
    }

    // 敌人选择技能
    const enemySkills = window.getCharacterSkills(this.enemy);
    const availableSkills = enemySkills.filter(skill => skill.currentCooldown === 0);
    
    if (availableSkills.length === 0) {
      // 如果所有技能都在冷却，使用基础攻击
      this._enemyBasicAttack();
    } else {
      // 随机选择一个技能
      const selectedSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
      this._enemyUseSkill(selectedSkill);
    }

    // 更新冷却
    this._updateCooldowns();

    // 检查玩家是否死亡
    const player = this.playerSystem.getPlayer();
    if (player.hp <= 0) {
      this._endBattle(false);
      return;
    }

    // 切换到玩家回合
    this.isPlayerTurn = true;
    this.turnCount++;

    if (this.onTurn) {
      this.onTurn(this.turnCount, true);
    }
  }

  /**
   * 敌人使用技能
   * @param {object} skill - 技能
   */
  _enemyUseSkill(skill) {
    switch (skill.type) {
      case window.SKILL_TYPE.ATTACK:
        this._enemyAttack(skill);
        break;

      case window.SKILL_TYPE.HEAL:
        this._enemyHeal(skill);
        break;
    }

    skill.currentCooldown = skill.cooldown;
  }

  /**
   * 敌人攻击
   * @param {object} skill - 技能
   */
  _enemyAttack(skill) {
    const player = this.playerSystem.getPlayer();
    
    // 检查闪避
    const dodgeChance = window.GAME_CONFIG.BATTLE.DODGE_CHANCE + player.stats.agility * 0.005;
    if (window.checkDodge(dodgeChance)) {
      if (this.onDamage) {
        this.onDamage('enemy', skill.name, 0, false, true);
      }
      return;
    }

    let damage = window.calculateDamage(skill.damage, this.enemy.attack, player.defense);
    
    // 检查暴击
    const isCritical = window.checkCritical(window.GAME_CONFIG.BATTLE.CRITICAL_CHANCE);
    const finalDamage = isCritical ? Math.floor(damage * window.GAME_CONFIG.BATTLE.CRITICAL_MULTIPLIER) : damage;

    const isDead = this.playerSystem.takeDamage(finalDamage);

    if (this.onDamage) {
      this.onDamage('enemy', skill.name, finalDamage, isCritical, false, isDead);
    }
  }

  /**
   * 敌人基础攻击
   */
  _enemyBasicAttack() {
    const basicSkill = window.getSkillById('basic_attack');
    if (basicSkill) {
      this._enemyAttack(basicSkill);
    }
  }

  /**
   * 敌人治疗
   * @param {object} skill - 技能
   */
  _enemyHeal(skill) {
    const healAmount = window.calculateHeal(skill.healAmount, 0);
    this.enemy.hp = Math.min(this.enemy.maxHp, this.enemy.hp + healAmount);
  }

  /**
   * 应用减益效果
   */
  _applyDebuffs() {
    this.enemyBuffs.forEach(buff => {
      if (buff.type === 'poison') {
        this.enemy.hp -= buff.damagePerTurn;
        if (this.onDamage) {
          this.onDamage('poison', '中毒', buff.damagePerTurn, false, false);
        }
      }
      buff.duration--;
    });

    // 移除过期的减益
    this.enemyBuffs = this.enemyBuffs.filter(buff => buff.duration > 0);
  }

  /**
   * 更新冷却时间
   */
  _updateCooldowns() {
    const player = this.playerSystem.getPlayer();
    player.skills.forEach(skillId => {
      const skill = window.getSkillById(skillId);
      if (skill && skill.currentCooldown > 0) {
        skill.currentCooldown--;
      }
    });

    if (this.enemy) {
      this.enemy.skills.forEach(skillId => {
        const skill = window.getSkillById(skillId);
        if (skill && skill.currentCooldown > 0) {
          skill.currentCooldown--;
        }
      });
    }
  }

  /**
   * 结束战斗
   * @param {boolean} playerWon - 玩家是否胜利
   * @returns {object} 战斗结果
   */
  _endBattle(playerWon) {
    this.isActive = false;

    let result = {
      won: playerWon,
      exp: 0,
      gold: 0,
      items: []
    };

    if (playerWon && this.enemy) {
      // 奖励经验和金币
      result.exp = this.enemy.expReward;
      result.gold = this.enemy.goldReward;
      
      this.playerSystem.addExp(this.enemy.expReward);
      this.playerSystem.addGold(this.enemy.goldReward);

      // 处理掉落
      if (this.enemy.drops) {
        this.enemy.drops.forEach(drop => {
          if (Math.random() < drop.chance) {
            if (drop.itemId === 'gold') {
              const goldAmount = Math.floor(Math.random() * 20) + 10;
              this.playerSystem.addGold(goldAmount);
              result.gold += goldAmount;
            } else {
              this.playerSystem.addItem(drop.itemId, 1);
              result.items.push(drop.itemId);
            }
          }
        });
      }
    }

    if (this.onBattleEnd) {
      this.onBattleEnd(result);
    }

    return result;
  }

  /**
   * 检查战斗是否活跃
   * @returns {boolean} 是否活跃
   */
  isBattleActive() {
    return this.isActive;
  }
}

// 暴露到全局
window.BattleSystem = BattleSystem;