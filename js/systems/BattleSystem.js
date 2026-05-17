/**
 * 战斗系统
 * @module BattleSystem
 *
 * 单敌人回合制（与主菜单 `Game` 生命周期一致）。
 * 大地图队伍战见 `battle.html` + `battle.js`；物理掷骰与 `BattleHitRoll` 的队伍模型不同。
 * 四阶段改造：阶段 4（单战斗形态）未做——本类仍保留，勿与队伍战混用规则。
 */

class BattleSystem {
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

    this._refreshCooldowns();

    if (this.onBattleStart) {
      this.onBattleStart(this.playerSystem.getPlayer(), this.enemy);
    }

    // 第一回合开始时就应用内功回血
    this._applyInnerSkillHeal();

    return true;
  }

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

  getEnemy() {
    return this.enemy;
  }

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

  playerUseSkill(skillId) {
    if (!this.isActive || !this.isPlayerTurn) {
      return { success: false, message: '不是你的回合' };
    }

    const skill = window.getSkillById(skillId);
    if (!skill) {
      return { success: false, message: '技能不存在' };
    }

    if (skill.currentCooldown > 0) {
      return { success: false, message: `${skill.name}正在冷却中` };
    }

    if (!this.playerSystem.spendMp(skill.mpCost)) {
      return { success: false, message: '内力不足' };
    }

    let result = { success: true, skill, isPlayerTurn: true };

    switch (skill.type) {
      case window.SKILL_TYPE.ATTACK:
      case 'attack':
        result = this._executePlayerAttack(skill);
        break;

      case window.SKILL_TYPE.HEAL:
      case 'heal':
        result = this._executePlayerHeal(skill);
        break;

      case window.SKILL_TYPE.BUFF:
      case 'buff':
        result = this._executePlayerBuff(skill);
        break;

      case window.SKILL_TYPE.DEBUFF:
      case 'debuff':
        result = this._executePlayerDebuff(skill);
        break;
    }

    skill.currentCooldown = skill.cooldown;

    if (this.enemy && this.enemy.hp <= 0) {
      return this._endBattle(true);
    }

    if (result.success) {
      this.isPlayerTurn = false;
      setTimeout(() => this._enemyTurn(), 1000);
    }

    return result;
  }

  _executePlayerAttack(skill) {
    const player = this.playerSystem.getPlayer();
    const skillMultiplier = skill.damage || skill.effect?.value || 1;
    
    let damage;
    if (window.StatCalculator) {
      damage = window.StatCalculator.calculateDamage(skillMultiplier, player.attack, this.enemy.defense);
    } else {
      damage = window.calculateDamage(skillMultiplier, player.attack, this.enemy.defense);
    }
    
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

  _enemyTurn() {
    if (!this.isActive || !this.enemy) return;

    this._applyDebuffs();

    if (this.enemy.hp <= 0) {
      this._endBattle(true);
      return;
    }

    const enemySkills = window.getCharacterSkills(this.enemy);
    const availableSkills = enemySkills.filter(skill => skill.currentCooldown === 0);
    
    if (availableSkills.length === 0) {
      this._enemyBasicAttack();
    } else {
      const selectedSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
      this._enemyUseSkill(selectedSkill);
    }

    this._updateCooldowns();

    const player = this.playerSystem.getPlayer();
    if (player.hp <= 0) {
      this._endBattle(false);
      return;
    }

    this.isPlayerTurn = true;
    this.turnCount++;

    // 新回合开始时应用内功回血
    this._applyInnerSkillHeal();

    if (this.onTurn) {
      this.onTurn(this.turnCount, true);
    }
  }

  /**
   * 应用内功被动回血效果
   */
  _applyInnerSkillHeal() {
    const player = this.playerSystem.getPlayer();
    
    if (window.StatCalculator) {
      // 构建完整的玩家数据，包括武学信息
      const fullPlayerData = {
        ...player,
        martialArts: window.playerMartialArts || []
      };
      
      const finalStats = window.StatCalculator.calculateFinalStats(fullPlayerData);
      
      if (finalStats.autoHeal > 0) {
        const healed = this.playerSystem.heal(finalStats.autoHeal);
        console.log(`内功自动回血: ${healed}`);
        
        // 触发回血特效回调
        if (this.onInnerSkillHeal) {
          this.onInnerSkillHeal(healed, true);
        }
      }
    }
  }

  _enemyUseSkill(skill) {
    switch (skill.type) {
      case window.SKILL_TYPE.ATTACK:
      case 'attack':
        this._enemyAttack(skill);
        break;

      case window.SKILL_TYPE.HEAL:
      case 'heal':
        this._enemyHeal(skill);
        break;
    }

    skill.currentCooldown = skill.cooldown;
  }

  _enemyAttack(skill) {
    const player = this.playerSystem.getPlayer();
    
    const dodgeChance = window.GAME_CONFIG.BATTLE.DODGE_CHANCE + player.stats.agility * 0.005;
    if (window.checkDodge(dodgeChance)) {
      if (this.onDamage) {
        this.onDamage('enemy', skill.name, 0, false, true);
      }
      return;
    }

    let damage;
    const skillMultiplier = skill.damage || skill.effect?.value || 1;
    
    if (window.StatCalculator) {
      damage = window.StatCalculator.calculateDamage(skillMultiplier, this.enemy.attack, player.defense);
    } else {
      damage = window.calculateDamage(skillMultiplier, this.enemy.attack, player.defense);
    }
    
    const isCritical = window.checkCritical(window.GAME_CONFIG.BATTLE.CRITICAL_CHANCE);
    const finalDamage = isCritical ? Math.floor(damage * window.GAME_CONFIG.BATTLE.CRITICAL_MULTIPLIER) : damage;

    const isDead = this.playerSystem.takeDamage(finalDamage);

    if (this.onDamage) {
      this.onDamage('enemy', skill.name, finalDamage, isCritical, false, isDead);
    }
  }

  _enemyBasicAttack() {
    const basicSkill = window.getSkillById('basic_attack');
    if (basicSkill) {
      this._enemyAttack(basicSkill);
    }
  }

  _enemyHeal(skill) {
    const healAmount = window.calculateHeal(skill.healAmount, 0);
    this.enemy.hp = Math.min(this.enemy.maxHp, this.enemy.hp + healAmount);
  }

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

    this.enemyBuffs = this.enemyBuffs.filter(buff => buff.duration > 0);
  }

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

  _endBattle(playerWon) {
    this.isActive = false;

    let result = {
      won: playerWon,
      exp: 0,
      gold: 0,
      items: []
    };

    if (playerWon && this.enemy) {
      result.exp = this.enemy.expReward;
      result.gold = this.enemy.goldReward;
      
      this.playerSystem.addExp(this.enemy.expReward);
      this.playerSystem.addGold(this.enemy.goldReward);

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

  isBattleActive() {
    return this.isActive;
  }
}

window.BattleSystem = BattleSystem;