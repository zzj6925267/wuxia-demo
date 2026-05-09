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
  rewards: {
    exp: 0,
    gold: 0,
    expReward: 0,
    drops: []
  }
};

// 角色数据（从存档获取）
function getPlayerCharactersFromSave() {
  const saveData = localStorage.getItem('game_save_0');
  if (!saveData) {
    // 如果没有存档，使用默认数据
    return [
      { id: 1, name: '少侠', icon: '👨‍🦰', level: 10, hp: 420, maxHp: 420, attack: 85, defense: 52, speed: 72, hit: 95, dodge: 45, parry: 38 },
      { id: 2, name: '苏瑶', icon: '👧', level: 12, hp: 380, maxHp: 380, attack: 92, defense: 45, speed: 95, hit: 105, dodge: 65, parry: 28 }
    ];
  }
  
  try {
    const save = JSON.parse(saveData);
    const player = save.player;
    
    // 使用存档中的等级，其他属性暂时使用默认值
    return [
      { id: 1, name: '少侠', icon: '👨‍🦰', level: player.level || 10, hp: 420, maxHp: 420, attack: 85, defense: 52, speed: 72, hit: 95, dodge: 45, parry: 38 },
      { id: 2, name: '苏瑶', icon: '👧', level: player.level || 12, hp: 380, maxHp: 380, attack: 92, defense: 45, speed: 95, hit: 105, dodge: 65, parry: 28 }
    ];
  } catch (e) {
    console.error('从存档读取角色数据失败:', e);
    return [
      { id: 1, name: '少侠', icon: '👨‍🦰', level: 10, hp: 420, maxHp: 420, attack: 85, defense: 52, speed: 72, hit: 95, dodge: 45, parry: 38 },
      { id: 2, name: '苏瑶', icon: '👧', level: 12, hp: 380, maxHp: 380, attack: 92, defense: 45, speed: 95, hit: 105, dodge: 65, parry: 28 }
    ];
  }
}

// 获取角色数据
const playerCharacters = getPlayerCharactersFromSave();

/**
 * 初始化战斗
 */
function initBattle() {
  // 每次战斗开始时重新获取角色数据（确保等级是最新的）
  const currentPlayerCharacters = getPlayerCharactersFromSave();
  
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
    isDead: false
  }];

  calculateTurnOrder();
  renderTeams();

  document.getElementById('btnAuto').addEventListener('click', startAutoBattle);
  document.getElementById('btnExit').addEventListener('click', exitBattle);
}

/**
 * 计算行动顺序（按速度排序）
 */
function calculateTurnOrder() {
  const allCharacters = [...battleState.allyTeam, ...battleState.enemyTeam].filter(c => !c.isDead);
  allCharacters.sort((a, b) => b.speed - a.speed);
  battleState.turnOrder = allCharacters;
}

/**
 * 渲染队伍
 */
function renderTeams() {
  const allyContainer = document.getElementById('teamAlly');
  const enemyContainer = document.getElementById('teamEnemy');

  allyContainer.innerHTML = battleState.allyTeam.map(char => renderCharacterCard(char)).join('');
  enemyContainer.innerHTML = battleState.enemyTeam.map(char => renderCharacterCard(char)).join('');
}

/**
 * 渲染角色卡片
 */
function renderCharacterCard(char) {
  const hpPercent = (char.hp / char.maxHp) * 100;
  const isActive = battleState.turnOrder[battleState.currentTurnIndex] === char;

  return `
    <div class="character-card ${isActive ? 'active' : ''} ${char.isDead ? 'dead' : ''}" id="char-${char.id}">
      <div class="character-top">
        <span class="character-icon">${char.icon}</span>
        <div class="character-info">
          <div class="character-name">${char.name}</div>
          <div class="character-level">Lv.${char.level}</div>
        </div>
      </div>
      <div class="hp-bar-container">
        <div class="hp-bar" style="width: ${hpPercent}%"></div>
      </div>
      <div class="hp-text">${char.hp}/${char.maxHp}</div>
    </div>
  `;
}

/**
 * 开始自动战斗
 */
function startAutoBattle() {
  if (battleState.isAutoFighting || battleState.battleEnded) return;

  battleState.isAutoFighting = true;
  document.getElementById('btnAuto').textContent = '战斗中...';
  document.getElementById('btnAuto').disabled = true;

  runBattleLoop();
}

/**
 * 战斗主循环
 */
async function runBattleLoop() {
  while (!battleState.battleEnded) {
    const currentChar = battleState.turnOrder[battleState.currentTurnIndex];

    if (!currentChar.isDead) {
      await performAction(currentChar);
    }

    if (checkBattleEnd()) {
      break;
    }

    battleState.currentTurnIndex++;
    if (battleState.currentTurnIndex >= battleState.turnOrder.length) {
      battleState.currentTurnIndex = 0;
      calculateTurnOrder();
    }

    renderTeams();
    await sleep(800);
  }

  showSettlement();
}

/**
 * 执行行动（平A）
 */
async function performAction(attacker) {
  const targets = attacker.isAlly
    ? battleState.enemyTeam.filter(c => !c.isDead)
    : battleState.allyTeam.filter(c => !c.isDead);

  if (targets.length === 0) return;

  const target = targets[0];
  await performAttack(attacker, target);
}

/**
 * 执行攻击
 */
async function performAttack(attacker, target) {
  showBattleLog(`${attacker.name} 攻击 ${target.name}！`);
  await sleep(400);

  const hitChance = attacker.hit - target.dodge + 50;
  const roll = Math.random() * 100;

  if (roll > hitChance) {
    showDamageNumber(target, '闪避', 'miss');
    showBattleLog(`${target.name} 闪避了攻击！`);
    await sleep(600);
    return;
  }

  const parryRoll = Math.random() * 100;
  if (parryRoll < target.parry) {
    let damage = Math.max(1, attacker.attack - target.defense - Math.floor(target.defense * 0.5));
    damage = Math.floor(damage * (0.9 + Math.random() * 0.2));

    target.hp = Math.max(0, target.hp - damage);
    if (target.hp <= 0) target.isDead = true;

    showDamageNumber(target, damage, 'parry');
    showBattleLog(`${target.name} 招架了攻击！`);
    await sleep(600);
    return;
  }

  let damage = Math.max(1, attacker.attack - target.defense);
  damage = Math.floor(damage * (0.9 + Math.random() * 0.2));

  const isCrit = Math.random() * 100 < 10;
  if (isCrit) {
    damage = Math.floor(damage * 1.5);
  }

  target.hp = Math.max(0, target.hp - damage);
  if (target.hp <= 0) target.isDead = true;

  showDamageNumber(target, damage, isCrit ? 'critical' : '');
  if (isCrit) {
    showBattleLog(`暴击！造成 ${damage} 点伤害！`);
  } else {
    showBattleLog(`造成 ${damage} 点伤害！`);
  }

  await sleep(600);
}

/**
 * 显示战斗日志
 */
function showBattleLog(text) {
  const logEl = document.getElementById('battleLog');
  logEl.textContent = text;
  logEl.classList.add('show');

  setTimeout(() => {
    logEl.classList.remove('show');
  }, 1500);
}

/**
 * 显示伤害数字
 */
function showDamageNumber(target, damage, type) {
  const charCard = document.getElementById(`char-${target.id}`);
  if (!charCard) return;

  const rect = charCard.getBoundingClientRect();
  const containerRect = document.querySelector('.battle-container').getBoundingClientRect();

  const damageEl = document.createElement('div');
  damageEl.className = 'damage-number';
  if (type) damageEl.classList.add(type);
  damageEl.textContent = damage;
  damageEl.style.left = (rect.left - containerRect.left + rect.width / 2) + 'px';
  damageEl.style.top = (rect.top - containerRect.top) + 'px';

  document.querySelector('.battle-container').appendChild(damageEl);

  setTimeout(() => {
    damageEl.remove();
  }, 1000);
}

/**
 * 检查战斗结束
 */
function checkBattleEnd() {
  const allyAlive = battleState.allyTeam.some(c => !c.isDead);
  const enemyAlive = battleState.enemyTeam.some(c => !c.isDead);

  if (!allyAlive) {
    battleState.battleEnded = true;
    battleState.rewards = { isVictory: false };
    return true;
  }

  if (!enemyAlive) {
    battleState.battleEnded = true;
    calculateRewards();
    return true;
  }

  return false;
}

/**
 * 计算奖励
 */
function calculateRewards() {
  let totalExp = 0;
  let totalGold = 0;
  let totalExpReward = 0;
  let drops = [];

  battleState.enemyTeam.forEach(enemy => {
    if (enemy.expReward) totalExp += enemy.expReward;
    if (enemy.goldReward) totalGold += enemy.goldReward;
    totalExpReward += Math.floor(enemy.expReward * 0.5);
  });

  battleState.rewards = {
    isVictory: true,
    exp: totalExp,
    gold: totalGold,
    expReward: totalExpReward,
    drops
  };
}

/**
 * 显示结算
 */
function showSettlement() {
  const settlePanel = document.getElementById('settlePanel');
  const settleTitle = document.getElementById('settleTitle');
  const settleContent = document.getElementById('settleContent');

  settleTitle.textContent = battleState.rewards.isVictory ? '胜利' : '战败';
  settleTitle.className = `settle-title ${battleState.rewards.isVictory ? 'victory' : 'defeat'}`;

  if (battleState.rewards.isVictory) {
    let contentHTML = `
      <div class="settle-item">
        <span class="settle-label">经验</span>
        <span class="settle-value">+${battleState.rewards.exp}</span>
      </div>
      <div class="settle-item">
        <span class="settle-label">银两</span>
        <span class="settle-value">+${battleState.rewards.gold}</span>
      </div>
      <div class="settle-item">
        <span class="settle-label">阅历</span>
        <span class="settle-value">+${battleState.rewards.expReward}</span>
      </div>
    `;

    settleContent.innerHTML = contentHTML;
    applyRewards();
  } else {
    settleContent.innerHTML = `
      <div class="settle-item" style="justify-content: center; border-bottom: none;">
        <span style="color: #aaa;">再接再厉！</span>
      </div>
    `;
  }

  settlePanel.classList.add('show');
}

/**
 * 应用奖励 - 存到统一的待处理奖励key
 */
function applyRewards() {
  const pendingRewards = {
    expReward: battleState.rewards.expReward,
    goldReward: battleState.rewards.gold,
    expFromBattle: battleState.rewards.exp,
    timestamp: Date.now()
  };
  localStorage.setItem('pending_battle_rewards', JSON.stringify(pendingRewards));
}

/**
 * 退出战斗
 */
function exitBattle() {
  window.location.href = 'forest_map.html';
}

/**
 * 延时函数
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', initBattle);
