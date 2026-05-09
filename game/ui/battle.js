/**
 * 战斗系统核心逻辑
 */

// 战斗状态
let battleState = {
  allyTeam: [],       // 我方队伍
  enemyTeam: [],      // 敌方队伍
  turnOrder: [],      // 行动顺序
  currentTurnIndex: 0,
  isAutoFighting: false,
  battleEnded: false,
  turnCount: 1,       // 回合数
  rewards: {
    exp: 0,
    gold: 0,
    expReward: 0,
    drops: []
  }
};

// 获取可用技能
function getAvailableSkills(actor) {
  const skills = [];
  
  // 从武学系统获取已装备的武学和技能
  let martialLevel = 3; // 默认等级
  let hasYangGang = false;
  let hasJianYing = false;
  
  try {
    if (typeof playerMartialArts !== 'undefined') {
      for (const martial of playerMartialArts) {
        if (martial.equipped && martial.type === '武功' && martial.skills) {
          martialLevel = martial.currentLevel || 3;
          
          // 检查每个技能是否解锁
          for (const skill of martial.skills) {
            if (skill.name === '阳刚' && martialLevel >= (skill.unlockLevel || 4)) {
              hasYangGang = true;
            }
            if (skill.name === '剑影' && martialLevel >= (skill.unlockLevel || 7)) {
              hasJianYing = true;
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn('获取武学技能失败', e);
  }
  
  // 只有武学等级 >=1 才能用直刺
  if (martialLevel >= 1) {
    const skillData = {
      name: '直刺',
      mpCost: 20,
      effect: { type: 'damage', value: 1.2 }
    };
    
    // 只有武学等级 >=7 才能触发剑影
    if (hasJianYing) {
      skillData.followSkill = { type: 'followAttack', baseChance: 0.2, damage: 0.8, chanceAttr: 'agility', chancePerPoint: 0.01 };
    }
    
    // 只有武学等级 >=4 时阳刚才加攻击
    if (hasYangGang) {
      skillData.effect.value += 0.1; // 阳刚增加10%伤害
    }
    
    skills.push(skillData);
  }
  
  return skills;
}

// 角色数据（从角色系统获取）
function getPlayerCharactersFromSave() {
  const maleAvatar = '../assets/shaoxia.png';
  const femaleAvatar = '../assets/suyao.png';
  
  // 优先使用角色系统中的实时数据
  console.log('=== battle.js 检查角色系统 ===');
  console.log('typeof window.characters:', typeof window.characters);
  console.log('window.characters?.length:', window.characters?.length);
  
  if (typeof window.characters !== 'undefined' && window.characters.length > 0) {
    console.log('走角色系统路径');
    console.log('characters[0].name:', window.characters[0].name);
    console.log('characters[0].stats.hp:', window.characters[0].stats.hp);
    console.log('characters[1].name:', window.characters[1].name);
    console.log('characters[1].stats.hp:', window.characters[1].stats.hp);
    
    return [
      { 
        id: 1, 
        name: '少侠', 
        avatar: maleAvatar, 
        level: window.characters[0].level, 
        hp: window.characters[0].stats.hp, 
        maxHp: window.characters[0].stats.hp,
        mp: 100,
        maxMp: 100,
        attack: window.characters[0].stats.attack, 
        defense: window.characters[0].stats.defense, 
        speed: window.characters[0].stats.speed,
        hit: window.characters[0].stats.hit, 
        dodge: window.characters[0].stats.dodge, 
        parry: window.characters[0].stats.parry,
        stats: window.characters[0].stats
      },
      { 
        id: 2, 
        name: '苏瑶', 
        avatar: femaleAvatar, 
        level: window.characters[1].level, 
        hp: window.characters[1].stats.hp, 
        maxHp: window.characters[1].stats.hp,
        mp: 100,
        maxMp: 100,
        attack: window.characters[1].stats.attack, 
        defense: window.characters[1].stats.defense, 
        speed: window.characters[1].stats.speed,
        hit: window.characters[1].stats.hit, 
        dodge: window.characters[1].stats.dodge, 
        parry: window.characters[1].stats.parry,
        stats: window.characters[1].stats
      }
    ];
  }
  
  // 备用：从 localStorage 读取
  const savedChars = localStorage.getItem('playerCharacters');
  if (savedChars) {
    try {
      const chars = JSON.parse(savedChars);
      if (chars.length >= 2) {
        return [
          { 
            id: 1, 
            name: chars[0].name, 
            avatar: maleAvatar, 
            level: chars[0].level, 
            hp: chars[0].stats.hp, 
            maxHp: chars[0].stats.hp,
            mp: 100,
            maxMp: 100,
            attack: chars[0].stats.attack, 
            defense: chars[0].stats.defense, 
            speed: chars[0].stats.speed,
            hit: chars[0].stats.hit, 
            dodge: chars[0].stats.dodge, 
            parry: chars[0].stats.parry,
            stats: chars[0].stats
          },
          { 
            id: 2, 
            name: chars[1].name, 
            avatar: femaleAvatar, 
            level: chars[1].level, 
            hp: chars[1].stats.hp, 
            maxHp: chars[1].stats.hp,
            mp: 100,
            maxMp: 100,
            attack: chars[1].stats.attack, 
            defense: chars[1].stats.defense, 
            speed: chars[1].stats.speed,
            hit: chars[1].stats.hit, 
            dodge: chars[1].stats.dodge, 
            parry: chars[1].stats.parry,
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
  if (!saveData) {
    return [
      { id: 1, name: '少侠', avatar: maleAvatar, level: 10, hp: 420, maxHp: 420, mp: 100, maxMp: 100, attack: 85, defense: 52, speed: 72, hit: 95, dodge: 45, parry: 38, stats: { strength: 10, agility: 10, vitality: 10, spirit: 10 } },
      { id: 2, name: '苏瑶', avatar: femaleAvatar, level: 12, hp: 380, maxHp: 380, mp: 100, maxMp: 100, attack: 92, defense: 45, speed: 95, hit: 105, dodge: 65, parry: 28, stats: { strength: 8, agility: 12, vitality: 8, spirit: 12 } }
    ];
  }
  
  try {
    const save = JSON.parse(saveData);
    const player = save.player;
    
    if (!player) {
      throw new Error('No player data in save');
    }
    
    const stats = player.stats || { strength: 10, agility: 10, vitality: 10, spirit: 10 };
    const level = player.level || 1;
    
    const multipliers = window.GAME_CONFIG?.STAT_MULTIPLIERS || {
      strength: 0.5,
      vitality: 5,
      agility: 0.1,
      spirit: 0.3
    };
    
    const maxHp = Math.floor(100 + stats.vitality * multipliers.vitality + level * 10);
    const attack = Math.floor(10 + stats.strength * multipliers.strength + level * 2);
    const defense = Math.floor(5 + stats.vitality * 0.2 + level);
    const speed = Math.floor(50 + stats.agility * 0.5);
    const hit = Math.floor(70 + stats.agility * 0.5);
    const dodge = Math.floor(20 + stats.agility * 0.3);
    const parry = Math.floor(15 + stats.vitality * 0.2);
    
    return [
      { 
        id: 1, 
        name: '少侠', 
        avatar: maleAvatar, 
        level: level, 
        hp: maxHp, 
        maxHp: maxHp,
        mp: 100,
        maxMp: 100,
        attack: attack, 
        defense: defense, 
        speed: speed, 
        hit: hit, 
        dodge: dodge, 
        parry: parry,
        stats: stats
      },
      { 
        id: 2, 
        name: '苏瑶', 
        avatar: femaleAvatar, 
        level: Math.max(1, level - 2), 
        hp: Math.floor(maxHp * 0.9), 
        maxHp: Math.floor(maxHp * 0.9),
        mp: 100,
        maxMp: 100,
        attack: Math.floor(attack * 1.1), 
        defense: Math.floor(defense * 0.9), 
        speed: Math.floor(speed * 1.3),
        hit: Math.floor(hit * 1.1), 
        dodge: Math.floor(dodge * 1.4), 
        parry: Math.floor(parry * 0.7),
        stats: stats
      }
    ];
  } catch (e) {
    console.error('从存档读取角色数据失败:', e);
    return [
      { id: 1, name: '少侠', avatar: maleAvatar, level: 10, hp: 420, maxHp: 420, mp: 100, maxMp: 100, attack: 85, defense: 52, speed: 72, hit: 95, dodge: 45, parry: 38, stats: { strength: 10, agility: 10, vitality: 10, spirit: 10 } },
      { id: 2, name: '苏瑶', avatar: femaleAvatar, level: 12, hp: 380, maxHp: 380, mp: 100, maxMp: 100, attack: 92, defense: 45, speed: 95, hit: 105, dodge: 65, parry: 28, stats: { strength: 8, agility: 12, vitality: 8, spirit: 12 } }
    ];
  }
}

/**
 * 初始化战斗
 */
function initBattle() {
  // 每次战斗开始时重新获取角色数据（确保等级是最新的）
  console.log('=== initBattle 开始 ===');
  const currentPlayerCharacters = getPlayerCharactersFromSave();
  console.log('initBattle 获取到的角色:', currentPlayerCharacters.map(c => ({name: c.name, hp: c.hp})));
  
  const enemyId = localStorage.getItem('battleEnemyId');

  let enemy = ENEMIES.shanze_louluo_1;
  if (enemyId && ENEMIES[enemyId]) {
    enemy = ENEMIES[enemyId];
  }

  localStorage.removeItem('battleEnemyId');

  battleState.allyTeam = currentPlayerCharacters.map(char => ({
    ...char,
    hp: char.maxHp,
    isAlly: true,
    isDead: false
  }));

  battleState.enemyTeam = [{
    ...enemy,
    isAlly: false,
    isDead: false,
    hp: enemy.hp
  }];

  battleState.turnOrder = [...battleState.allyTeam, ...battleState.enemyTeam];
  calculateTurnOrder();
  battleState.currentTurnIndex = 0;
  battleState.battleEnded = false;
  battleState.turnCount = 1;

  renderTeams();
  updateTurnDisplay();
  addBattleLog('战斗开始！');
}

function calculateTurnOrder() {
  battleState.turnOrder.sort((a, b) => b.speed - a.speed);
}

function renderTeams() {
  const allyContainer = document.getElementById('teamAlly');
  const enemyContainer = document.getElementById('teamEnemy');

  allyContainer.innerHTML = battleState.allyTeam.map(char => renderCharacterCard(char)).join('');
  enemyContainer.innerHTML = battleState.enemyTeam.map(char => renderCharacterCard(char)).join('');
}

function renderCharacterCard(char) {
  const isActive = battleState.turnOrder[battleState.currentTurnIndex] === char;
  const fallbackIcon = char.name === '少侠' ? '⚔️' : char.name === '苏瑶' ? '🌸' : (char.icon || '👤');
  const hasAvatar = char.avatar && char.avatar !== '';

  let avatarHtml = '';
  if (hasAvatar) {
    avatarHtml = `<img class="character-avatar" src="${char.avatar}" alt="${char.name}" onError="handleAvatarError(this, '${fallbackIcon}')" />`;
  } else {
    avatarHtml = `<div class="character-avatar-emoji">${fallbackIcon}</div>`;
  }

  return `
    <div class="character-card ${isActive ? 'active' : ''} ${char.isDead ? 'dead' : ''}" id="char-${char.id}">
      <div class="character-name">${char.name}</div>
      <div class="character-avatar-container">
        ${avatarHtml}
      </div>
      <div class="hp-text">${char.hp}</div>
      ${char.mp !== undefined ? `<div class="mp-text">${char.mp}</div>` : ''}
    </div>
  `;
}

function handleAvatarError(img, fallbackIcon) {
  img.style.display = 'none';
  const container = img.parentElement;
  container.innerHTML = `<div class="character-avatar-emoji">${fallbackIcon}</div>`;
}

function addBattleLog(text) {
  const logElement = document.getElementById('battleLog');
  logElement.innerHTML = text;
}

// 更新回合显示
function updateTurnDisplay() {
  const display = document.getElementById('turnDisplay');
  if (display) {
    display.textContent = `第 ${battleState.turnCount}/99 回合`;
  }
}

// 显示技能气泡
function showSkillBubble(charId, skillName) {
  const card = document.getElementById(`char-${charId}`);
  if (card) {
    const bubble = document.createElement('div');
    bubble.className = 'skill-bubble';
    bubble.textContent = skillName;
    card.appendChild(bubble);
    setTimeout(() => bubble.classList.add('show'), 10);
    setTimeout(() => {
      bubble.remove();
    }, 700);
  }
}

// 显示剑气特效
function showSwordEffect(actor, target, effectType) {
  const container = document.querySelector('.battle-container');
  if (!container) return;
  
  const actorCard = document.getElementById(`char-${actor.id}`);
  const targetCard = document.getElementById(`char-${target.id}`);
  if (!actorCard || !targetCard) return;
  
  const containerRect = container.getBoundingClientRect();
  
  if (effectType === 'thrust') {
    // 直刺特效 - 直接在目标头像上显示
    const targetRect = targetCard.getBoundingClientRect();
    const effect = document.createElement('div');
    effect.className = 'sword-effect-thrust';
    
    const targetX = targetRect.left + targetRect.width / 2 - containerRect.left;
    const targetY = targetRect.top + targetRect.height / 2 - containerRect.top;
    
    // 计算角度（从攻击者指向目标）
    const actorRect = actorCard.getBoundingClientRect();
    const startX = actorRect.left + actorRect.width / 2 - containerRect.left;
    const startY = actorRect.top + actorRect.height / 2 - containerRect.top;
    const angle = Math.atan2(targetY - startY, targetX - startX) * 180 / Math.PI;
    
    // 剑气中心点在目标位置，长度保持200px
    effect.style.left = `${targetX - 100}px`;
    effect.style.top = `${targetY - 4}px`;
    effect.style.width = '200px';
    effect.style.transform = `rotate(${angle}deg)`;
    effect.style.transformOrigin = 'center center';
    
    container.appendChild(effect);
    
    setTimeout(() => {
      effect.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      effect.remove();
    }, 500);
    
    // 受击震动
    showHitShake(target);
  } else if (effectType === 'shadow') {
    // 剑影特效 - 竖着的剑气
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
    
    // 受击震动
    showHitShake(target);
  }
}

// 显示受击震动
function showHitShake(target) {
  const card = document.getElementById(`char-${target.id}`);
  if (card) {
    card.classList.add('hit');
    setTimeout(() => card.classList.remove('hit'), 300);
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

// 恢复内力
function recoverMp(char) {
  if (char.mp !== undefined && char.maxMp) {
    const recover = Math.floor(char.maxMp * 0.1);
    char.mp = Math.min(char.maxMp, char.mp + recover);
    updateMpDisplay(char.id, char.mp, true);
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
        mpElement.style.color = '#2196f3';
        mpElement.style.transform = 'scale(1)';
      }, 300);
    }
  }
}

// 检查剑影
async function checkFollowAttack(actor, target, followSkill) {
  if (!actor.stats) return;
  
  const agility = actor.stats.agility || 0;
  const chance = followSkill.baseChance + agility * followSkill.chancePerPoint;
  
  if (Math.random() < chance) {
    // 显示剑影气泡
    showSkillBubble(actor.id, '剑影');
    await sleep(400);
    
    // 显示剑影特效
    showSwordEffect(actor, target, 'shadow');
    
    const damage = Math.floor(actor.attack * followSkill.damage);
    showDamageNumber(target.id, -damage, false);
    target.hp = Math.max(0, target.hp - damage);
    addBattleLog(`${actor.name} 触发剑影，额外造成 ${damage} 点伤害！`);
    
    if (target.hp <= 0) {
      target.isDead = true;
      target.hp = 0;
    }
    
    updateHpDisplay(target.id, target.hp);
    await sleep(300);
  }
}

// 使用技能
async function useSkill(actor, skill, target) {
  actor.mp -= skill.mpCost;
  updateMpDisplay(actor.id, actor.mp, false);
  
  // 1. 角色移动到中间
  await showAttackMove(actor);
  
  // 2. 显示技能气泡
  showSkillBubble(actor.id, skill.name);
  await sleep(400);
  
  // 3. 造成伤害
  if (skill.effect.type === 'damage') {
    let multiplier = skill.effect.value;
    
    // 显示直刺特效
    showSwordEffect(actor, target, 'thrust');
    
    const damage = Math.floor(actor.attack * multiplier);
    showDamageNumber(target.id, -damage);
    target.hp = Math.max(0, target.hp - damage);
    addBattleLog(`${actor.name} 使用 ${skill.name}，造成 ${damage} 点伤害！`);
    await sleep(300);
    
    // 4. 检查剑影连击（角色还在中间）
    if (skill.followSkill) {
      await checkFollowAttack(actor, target, skill.followSkill);
    }
  }
  
  if (target.hp <= 0) {
    target.isDead = true;
    target.hp = 0;
    addBattleLog(`${target.name} 被击败！`);
    
    const targetCard = document.getElementById(`char-${target.id}`);
    if (targetCard) {
      targetCard.classList.add('dead');
    }
  }
  
  updateHpDisplay(target.id, target.hp);
  
  // 5. 角色回到原位
  await showAttackReturn(actor);
}

async function runBattleLoop() {
  while (!battleState.battleEnded) {
    const currentChar = battleState.turnOrder[battleState.currentTurnIndex];

    if (!currentChar.isDead) {
      await performAction(currentChar);
    }

    if (checkBattleEnd()) {
      renderTeams();
      await sleep(500);
      break;
    }

    battleState.currentTurnIndex++;
    if (battleState.currentTurnIndex >= battleState.turnOrder.length) {
      battleState.currentTurnIndex = 0;
      battleState.turnCount++;
      if (battleState.turnCount > 99) battleState.turnCount = 99;
      updateTurnDisplay();
      calculateTurnOrder();
    }

    // 只更新高亮状态，不重新渲染卡片
    updateActiveHighlight();
    await sleep(800);
  }

  await showSettlement();
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

async function performAction(actor) {
  const targetTeam = actor.isAlly ? battleState.enemyTeam : battleState.allyTeam;
  const aliveTargets = targetTeam.filter(char => !char.isDead);
  
  if (aliveTargets.length === 0) return;

  const target = aliveTargets[0];

  if (actor.isAlly) {
    // 我方角色使用技能
    const skills = getAvailableSkills(actor);
    let usedSkill = false;
    
    // 恢复内力
    recoverMp(actor);
    
    for (const skill of skills) {
      if (actor.mp >= skill.mpCost) {
        await useSkill(actor, skill, target);
        usedSkill = true;
        break;
      }
    }
    
    if (!usedSkill) {
      // 没有内力，普通攻击
      await showAttackMove(actor);
      showSkillBubble(actor.id, '攻击');
      await sleep(400);
      
      const damage = Math.floor(actor.attack * 0.6);
      showDamageNumber(target.id, -damage);
      target.hp = Math.max(0, target.hp - damage);
      addBattleLog(`${actor.name} 普通攻击 ${target.name}，造成 ${damage} 点伤害！`);
      
      if (target.hp <= 0) {
        target.isDead = true;
        target.hp = 0;
        addBattleLog(`${target.name} 被击败！`);
        
        const targetCard = document.getElementById(`char-${target.id}`);
        if (targetCard) {
          targetCard.classList.add('dead');
        }
      }
      
      updateHpDisplay(target.id, target.hp);
      showHitShake(target);
      
      await sleep(300);
      await showAttackReturn(actor);
    }
  } else {
    // 敌人回合
    await showAttackMove(actor);
    showSkillBubble(actor.id, '攻击');
    await sleep(400);
    
    const result = calculateDamage(actor, target);
    
    if (result.isDodge) {
      showBattleText(target.id, '闪避', 'miss');
      await showDodgeAnimation(target);
      addBattleLog(`${actor.name} 攻击 ${target.name}，但被闪避了！`);
    } else if (result.isParry) {
      showBattleText(target.id, '招架', 'parry');
      showDamageNumber(target.id, -result.damage);
      target.hp = Math.max(0, target.hp - result.damage);
      addBattleLog(`${actor.name} 攻击 ${target.name}，造成 ${result.damage} 点伤害（被招架）！`);
    } else {
      const critText = result.isCritical ? '暴击！' : '';
      showDamageNumber(target.id, -result.damage, result.isCritical);
      target.hp = Math.max(0, target.hp - result.damage);
      addBattleLog(`${actor.name} ${critText}造成 ${result.damage} 点伤害！`);
    }

    if (target.hp <= 0) {
      target.isDead = true;
      target.hp = 0;
      addBattleLog(`${target.name} 被击败！`);
      
      const targetCard = document.getElementById(`char-${target.id}`);
      if (targetCard) {
        targetCard.classList.add('dead');
      }
    }
    
    updateHpDisplay(target.id, target.hp);
    showHitShake(target);
    
    await sleep(300);
    await showAttackReturn(actor);
  }
  
  await sleep(600);
}

function calculateDamage(attacker, defender) {
  const hitRoll = Math.random() * 100;
  const dodgeRoll = Math.random() * 100;
  const parryRoll = Math.random() * 100;

  if (dodgeRoll < defender.dodge) {
    return { damage: 0, isDodge: true, isParry: false, isCritical: false };
  }

  if (parryRoll < defender.parry && hitRoll >= attacker.hit) {
    const baseDamage = attacker.attack - defender.defense;
    const damage = Math.max(1, Math.floor(baseDamage * 0.5));
    return { damage, isDodge: false, isParry: true, isCritical: false };
  }

  if (hitRoll < attacker.hit) {
    const critRoll = Math.random() * 100;
    const isCritical = critRoll < 15;
    const baseDamage = attacker.attack - defender.defense;
    const damage = Math.max(1, Math.floor(baseDamage * (isCritical ? 1.5 : 1)));
    return { damage, isDodge: false, isParry: false, isCritical };
  }

  return { damage: 0, isDodge: false, isParry: false, isCritical: false };
}

async function showAttackAnimation(actor) {
  const card = document.getElementById(`char-${actor.id}`);
  if (card) {
    card.classList.add('attacking');
    await sleep(300);
    card.classList.remove('attacking');
  }
}

function showDamageNumber(charId, damage, isCritical = false) {
  const card = document.getElementById(`char-${charId}`);
  if (!card) return;

  const cardRect = card.getBoundingClientRect();
  const container = document.querySelector('.battle-container');
  
  const damageDiv = document.createElement('div');
  damageDiv.className = `damage-number ${isCritical ? 'critical' : ''}`;
  damageDiv.textContent = damage;
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
  if (!card) return;
  
  const hpElement = card.querySelector('.hp-text');
  if (hpElement) {
    hpElement.textContent = hp;
  }
}

function updateActiveHighlight() {
  // 移除所有卡片的active类
  document.querySelectorAll('.character-card').forEach(card => {
    card.classList.remove('active');
  });
  
  // 给当前回合的角色添加active类
  const currentChar = battleState.turnOrder[battleState.currentTurnIndex];
  if (currentChar) {
    const currentCard = document.getElementById(`char-${currentChar.id}`);
    if (currentCard) {
      currentCard.classList.add('active');
    }
  }
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

async function showSettlement() {
  const isVictory = battleState.enemyTeam.every(char => char.isDead);
  const rewards = isVictory ? battleState.rewards : { exp: 0, gold: 0, expReward: 0 };

  if (isVictory) {
    const enemy = battleState.enemyTeam[0];
    rewards.exp = enemy.exp || 25;
    rewards.gold = enemy.gold || 10;
    rewards.expReward = enemy.expReward || 17;
  }

  await showFloatText('胜利！', '#4caf50');
  await sleep(50);
  await showFloatText(`经验 +${rewards.exp}`, '#ffeb3b');
  await sleep(50);
  await showFloatText(`银两 +${rewards.gold}`, '#ff9800');
  await sleep(50);
  await showFloatText(`阅历 +${rewards.expReward}`, '#9c27b0');
  await sleep(100);

  if (isVictory) {
    localStorage.setItem('pending_battle_rewards', JSON.stringify({
      exp: rewards.exp,
      gold: rewards.gold,
      expReward: rewards.expReward
    }));
  }

  setTimeout(() => {
    window.location.href = 'forest_map.html';
  }, 500);
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

function toggleAutoBattle() {
  battleState.isAutoFighting = !battleState.isAutoFighting;
  const btn = document.getElementById('btnAuto');
  btn.textContent = battleState.isAutoFighting ? '停止战斗' : '自动战斗';
  
  if (battleState.isAutoFighting && !battleState.battleEnded) {
    runBattleLoop();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // 引用武学数据
  try {
    const script = document.createElement('script');
    script.src = 'martialArtsData.js';
    document.head.appendChild(script);
  } catch (e) {
    console.warn('加载武学数据失败');
  }
  
  setTimeout(() => {
    initBattle();
  }, 200);
  
  document.getElementById('btnAuto').addEventListener('click', toggleAutoBattle);
});
