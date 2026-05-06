// 角色系统数据
const characters = [
  {
    id: 1,
    name: '少侠',
    icon: '👨‍🦰',
    level: 10,
    gender: '男',
    faction: '正阳派',
    power: 580,
    health: { current: 100, max: 100 },
    exp: { current: 45, max: 100 },
    description: '初入江湖的少年侠客，心怀侠义，立志成为一代大侠。加入正阳派后，勤学苦练，剑法日益精进。',
    equipped: {
      weapon: { id: 1, name: '青锋剑', type: 'weapon', rarity: 'blue', level: 10, attack: 35, hit: 5, desc: '普通的青钢剑，剑锋锋利，适合初学者使用。' },
      armor: { id: 2, name: '布袍', type: 'armor', rarity: 'green', level: 5, defense: 12, hp: 30, desc: '普通的棉布长袍，轻便舒适。' },
      accessory: { id: 3, name: '护心镜', type: 'accessory', rarity: 'green', level: 8, parry: 8, hp: 20, desc: '小巧的护心镜，能抵挡部分伤害。' },
      shoes: null
    },
    skills: {
      weapon: { name: '正阳基础剑式', level: 3, maxLevel: 10 },
      inner: { name: '正阳吐纳诀', level: 2, maxLevel: 10 },
      light: { name: '踏云步', level: 1, maxLevel: 10 }
    },
    stats: {
      attack: 85, hp: 420, hit: 95, dodge: 45, defense: 52, parry: 38, speed: 72,
      fist: 15, sword: 45, blade: 10, lightSkill: 30, innerSkill: 35,
      strength: 12, agility: 10, bone: 9, qi: 11
    },
    remainingPoints: 20
  },
  {
    id: 2,
    name: '苏瑶',
    icon: '👧',
    level: 12,
    gender: '女',
    faction: '正阳派',
    power: 620,
    health: { current: 100, max: 100 },
    exp: { current: 78, max: 100 },
    description: '正阳派内门弟子，天资聪颖，剑法出众。性格活泼开朗，乐于助人。',
    equipped: {
      weapon: { id: 4, name: '流云剑', type: 'weapon', rarity: 'blue', level: 12, attack: 42, hit: 8, desc: '剑身轻盈，挥舞时如流云般飘逸。' },
      armor: { id: 5, name: '素纱衣', type: 'armor', rarity: 'blue', level: 10, defense: 18, speed: 10, desc: '轻盈的纱衣，不影响身法施展。' },
      accessory: { id: 6, name: '玉坠', type: 'accessory', rarity: 'purple', level: 12, innerSkill: 15, hp: 40, desc: '温润的玉佩，能滋养内力。' },
      shoes: { id: 7, name: '云履', type: 'shoes', rarity: 'green', level: 10, speed: 15, dodge: 8, desc: '轻便的布鞋，适合施展轻功。' }
    },
    skills: {
      weapon: { name: '正阳基础剑式', level: 5, maxLevel: 10 },
      inner: { name: '正阳吐纳诀', level: 4, maxLevel: 10 },
      light: { name: '踏云步', level: 3, maxLevel: 10 }
    },
    stats: {
      attack: 92, hp: 380, hit: 105, dodge: 65, defense: 45, parry: 28, speed: 95,
      fist: 10, sword: 55, blade: 8, lightSkill: 50, innerSkill: 45,
      strength: 8, agility: 15, bone: 7, qi: 13
    },
    remainingPoints: 0
  }
];

const PLAYER_INVENTORY = {
  weapon: [
    { id: 1, name: '青锋剑', type: 'weapon', rarity: 'blue', level: 10, attack: 35, hit: 5, desc: '普通的青钢剑，剑锋锋利，适合初学者使用。' },
    { id: 4, name: '流云剑', type: 'weapon', rarity: 'blue', level: 12, attack: 42, hit: 8, desc: '剑身轻盈，挥舞时如流云般飘逸。' },
    { id: 8, name: '铁剑', type: 'weapon', rarity: 'green', level: 5, attack: 20, desc: '普通的铁剑，随处可见。' }
  ],
  armor: [
    { id: 2, name: '布袍', type: 'armor', rarity: 'green', level: 5, defense: 12, hp: 30, desc: '普通的棉布长袍，轻便舒适。' },
    { id: 5, name: '素纱衣', type: 'armor', rarity: 'blue', level: 10, defense: 18, speed: 10, desc: '轻盈的纱衣，不影响身法施展。' }
  ],
  accessory: [
    { id: 3, name: '护心镜', type: 'accessory', rarity: 'green', level: 8, parry: 8, hp: 20, desc: '小巧的护心镜，能抵挡部分伤害。' },
    { id: 6, name: '玉坠', type: 'accessory', rarity: 'purple', level: 12, innerSkill: 15, hp: 40, desc: '温润的玉佩，能滋养内力。' }
  ],
  shoes: [
    { id: 7, name: '云履', type: 'shoes', rarity: 'green', level: 10, speed: 15, dodge: 8, desc: '轻便的布鞋，适合施展轻功。' }
  ]
};

let currentCharacterIndex = 0;

// 四维预览状态
let pointPreview = {
  strength: 0,
  agility: 0,
  bone: 0,
  qi: 0
};

// 角色面板UI
const CHAR_UI = {
  charAvatar: document.getElementById('charAvatar'),
  charLevel: document.getElementById('charLevel'),
  charName: document.getElementById('charName'),
  charGender: document.getElementById('charGender'),
  charFaction: document.getElementById('charFaction'),
  charPower: document.getElementById('charPower'),
  charDesc: document.getElementById('charDesc'),
  charHealthBar: document.getElementById('charHealthBar'),
  charExpBar: document.getElementById('charExpBar'),
  charWeaponSkill: document.getElementById('charWeaponSkill'),
  charInnerSkill: document.getElementById('charInnerSkill'),
  charLightSkill: document.getElementById('charLightSkill'),
  statAttack: document.getElementById('statAttack'),
  statHp: document.getElementById('statHp'),
  statHit: document.getElementById('statHit'),
  statDodge: document.getElementById('statDodge'),
  statDefense: document.getElementById('statDefense'),
  statParry: document.getElementById('statParry'),
  statSpeed: document.getElementById('statSpeed'),
  statFist: document.getElementById('statFist'),
  statSword: document.getElementById('statSword'),
  statBlade: document.getElementById('statBlade'),
  statLight: document.getElementById('statLight'),
  statInner: document.getElementById('statInner'),
  statStrength: document.getElementById('statStrength'),
  statAgility: document.getElementById('statAgility'),
  statBone: document.getElementById('statBone'),
  statQi: document.getElementById('statQi'),
  remainingPoints: document.getElementById('remainingPoints'),
  charWeaponSlot: document.getElementById('charWeaponSlot'),
  charArmorSlot: document.getElementById('charArmorSlot'),
  charAccessorySlot: document.getElementById('charAccessorySlot'),
  charShoesSlot: document.getElementById('charShoesSlot'),
  characterPanel: document.getElementById('characterPanel'),
  charModal: document.getElementById('charModal'),
  modalTitle: document.getElementById('modalTitle'),
  charModalBody: document.getElementById('charModalBody')
};

function getCurrentCharacter() {
  return characters[currentCharacterIndex];
}

function switchCharacter(index) {
  if (index >= 0 && index < characters.length) {
    currentCharacterIndex = index;
    
    // 更新角色列表的 active 状态
    document.querySelectorAll('.char-item').forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });
    
    // 加载角色数据
    loadCharacterData();
  }
}

/**
 * 切换角色面板显示
 */
function toggleCharacterPanel() {
  const panel = CHAR_UI.characterPanel;
  panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
  
  if (panel.style.display === 'flex') {
    loadCharacterData();
  }
}

/**
 * 加载角色数据
 */
function loadCharacterData() {
  const char = getCurrentCharacter();
  
  CHAR_UI.charAvatar.textContent = char.icon;
  CHAR_UI.charLevel.textContent = `Lv.${char.level}`;
  CHAR_UI.charName.textContent = char.name;
  CHAR_UI.charGender.textContent = char.gender;
  CHAR_UI.charFaction.textContent = char.faction;
  CHAR_UI.charPower.textContent = char.power;
  CHAR_UI.charDesc.textContent = char.description;
  
  // 更新健康条和tooltip
  const healthPct = (char.health.current / char.health.max) * 100;
  CHAR_UI.charHealthBar.style.width = `${healthPct}%`;
  document.getElementById('healthTooltip').textContent = `${char.health.current}/${char.health.max}，剩余${char.health.max - char.health.current}`;
  
  // 更新经验条和tooltip
  const expPct = (char.exp.current / char.exp.max) * 100;
  CHAR_UI.charExpBar.style.width = `${expPct}%`;
  document.getElementById('expTooltip').textContent = `${char.exp.current}/${char.exp.max}，还需${char.exp.max - char.exp.current}升级`;
  
  // 更新百分比显示
  document.querySelector('.status-row:nth-child(1) span:last-child').textContent = `${Math.round(healthPct)}%`;
  document.querySelector('.status-row:nth-child(2) span:last-child').textContent = `${Math.round(expPct)}%`;
  
  CHAR_UI.charWeaponSkill.textContent = char.skills.weapon.name;
  document.querySelector('.skill-item:nth-child(1) span:last-child').textContent = `${char.skills.weapon.level}/${char.skills.weapon.maxLevel}重`;
  
  CHAR_UI.charInnerSkill.textContent = char.skills.inner.name;
  document.querySelector('.skill-item:nth-child(2) span:last-child').textContent = `${char.skills.inner.level}/${char.skills.inner.maxLevel}重`;
  
  CHAR_UI.charLightSkill.textContent = char.skills.light.name;
  document.querySelector('.skill-item:nth-child(3) span:last-child').textContent = `${char.skills.light.level}/${char.skills.light.maxLevel}重`;
  
  // 更新基础属性（原始值）
  document.getElementById('statAttackBase').textContent = char.stats.attack;
  document.getElementById('statHpBase').textContent = char.stats.hp;
  document.getElementById('statHitBase').textContent = char.stats.hit;
  document.getElementById('statDodgeBase').textContent = char.stats.dodge;
  document.getElementById('statDefenseBase').textContent = char.stats.defense;
  document.getElementById('statParryBase').textContent = char.stats.parry;
  document.getElementById('statSpeedBase').textContent = char.stats.speed;
  
  CHAR_UI.statFist.textContent = char.stats.fist;
  CHAR_UI.statSword.textContent = char.stats.sword;
  CHAR_UI.statBlade.textContent = char.stats.blade;
  CHAR_UI.statLight.textContent = char.stats.lightSkill;
  CHAR_UI.statInner.textContent = char.stats.innerSkill;
  CHAR_UI.remainingPoints.textContent = char.remainingPoints;
  
  // 重置预览状态
  resetPointPreview();
  
  // 更新四维条形显示
  updateFourDimDisplay(char);
  
  updateCharEquipSlots();
  updateAddButtons();
}

/**
 * 更新四维条形显示
 */
function updateFourDimDisplay(char) {
  const attrs = ['strength', 'agility', 'bone', 'qi'];
  const maxVal = 100;
  
  attrs.forEach(attr => {
    const baseVal = char.stats[attr];
    const previewVal = baseVal + pointPreview[attr];
    const previewAdd = pointPreview[attr];
    
    // 更新数值显示
    document.getElementById(`stat${attr.charAt(0).toUpperCase() + attr.slice(1)}Value`).textContent = previewVal;
    
    // 更新条形
    const baseBar = document.getElementById(`stat${attr.charAt(0).toUpperCase() + attr.slice(1)}Bar`);
    const previewBar = document.getElementById(`stat${attr.charAt(0).toUpperCase() + attr.slice(1)}PreviewBar`);
    
    baseBar.style.width = `${(baseVal / maxVal) * 100}%`;
    
    if (previewAdd > 0) {
      previewBar.style.width = `${(previewAdd / maxVal) * 100}%`;
      previewBar.style.left = `${(baseVal / maxVal) * 100}%`;
      previewBar.classList.add('active');
      baseBar.style.borderRadius = '6px 0 0 6px';
    } else {
      previewBar.classList.remove('active');
      baseBar.style.borderRadius = '6px';
    }
  });
  
  // 更新按钮状态
  updateDimButtons(char);
}

/**
 * 重置预览状态
 */
function resetPointPreview() {
  pointPreview = { strength: 0, agility: 0, bone: 0, qi: 0 };
  document.getElementById('confirmPointBtn').style.display = 'none';
  document.getElementById('cancelPointBtn').style.display = 'none';
  document.getElementById('previewHint').textContent = '';
  
  // 重置基础属性预览
  const attrs = ['Attack', 'Hp', 'Hit', 'Dodge', 'Defense', 'Parry', 'Speed'];
  attrs.forEach(attr => {
    const el = document.getElementById(`stat${attr}Preview`);
    el.style.display = 'none';
  });
}

/**
 * 更新四维按钮状态
 */
function updateDimButtons(char) {
  const attrs = ['strength', 'agility', 'bone', 'qi'];
  
  attrs.forEach(attr => {
    const previewBar = document.getElementById(`stat${attr.charAt(0).toUpperCase() + attr.slice(1)}PreviewBar`);
    const minusBtn = previewBar.parentElement.nextElementSibling.querySelector('.minus');
    const plusBtn = previewBar.parentElement.nextElementSibling.querySelector('.plus');
    
    // 加点按钮：需要剩余点数 > 0
    plusBtn.disabled = char.remainingPoints <= 0;
    
    // 退点按钮：只能退预览增加的点数
    minusBtn.disabled = pointPreview[attr] <= 0;
  });
}

/**
 * 更新装备槽位
 */
function updateCharEquipSlots() {
  const slots = ['weapon', 'armor', 'accessory', 'shoes'];
  const char = getCurrentCharacter();
  
  slots.forEach(type => {
    const slot = CHAR_UI[`char${type.charAt(0).toUpperCase() + type.slice(1)}Slot`];
    const equip = char.equipped[type];
    
    if (equip) {
      slot.innerHTML = `
        <span class="slot-icon">${getRarityIcon(equip.rarity)}</span>
        <span class="slot-name">${equip.name}</span>
        <span class="slot-level">Lv.${equip.level}</span>
      `;
      slot.classList.remove('empty');
    } else {
      slot.innerHTML = `
        <span class="slot-add">+</span>
        <span class="slot-name">${getTypeName(type)}</span>
      `;
      slot.classList.add('empty');
    }
  });
}

function getRarityIcon(rarity) {
  const icons = {
    'green': '🟢',
    'blue': '🔵',
    'purple': '🟣',
    'orange': '🟠'
  };
  return icons[rarity] || '⚪';
}

function getTypeName(type) {
  const names = {
    weapon: '武器',
    armor: '护甲',
    accessory: '饰品',
    shoes: '鞋子'
  };
  return names[type] || type;
}

function getRarityColor(rarity) {
  const colors = {
    'green': '#4caf50',
    'blue': '#2196f3',
    'purple': '#9c27b0',
    'orange': '#ff9800'
  };
  return colors[rarity] || '#9e9e9e';
}

/**
 * 显示装备选择弹窗
 */
function showCharEquipment(type) {
  const char = getCurrentCharacter();
  const currentEquip = char.equipped[type];
  const invItems = PLAYER_INVENTORY[type] || [];
  
  CHAR_UI.modalTitle.textContent = `选择${getTypeName(type)}`;
  
  let html = '';
  
  if (currentEquip) {
    html += `
      <div class="equip-detail">
        <div class="detail-header">
          <span style="color: ${getRarityColor(currentEquip.rarity)}">${currentEquip.name}</span>
          <span>Lv.${currentEquip.level}</span>
        </div>
        <p class="detail-desc">${currentEquip.desc}</p>
        <div class="detail-stats">
          ${renderEquipStats(currentEquip)}
        </div>
        <button class="unequip-btn" onclick="unequipCharItem('${type}')">点击卸下</button>
      </div>
    `;
  }
  
  html += '<div class="equip-list">';
  if (invItems.length > 0) {
    invItems.forEach(item => {
      const canEquip = item.level <= char.level;
      html += `
        <div class="equip-item ${!canEquip ? 'disabled' : ''}" onclick="${canEquip ? `equipCharItem('${type}', ${item.id})` : ''}">
          <span style="color: ${getRarityColor(item.rarity)}">${item.name}</span>
          <span>Lv.${item.level}</span>
          ${!canEquip ? '<span class="level-warn">等级不足</span>' : ''}
        </div>
      `;
    });
  } else {
    html += '<div class="no-equip">暂无装备</div>';
  }
  html += '</div>';
  
  CHAR_UI.charModalBody.innerHTML = html;
  CHAR_UI.charModal.style.display = 'flex';
}

function renderEquipStats(equip) {
  let stats = '';
  if (equip.attack) stats += `<div>攻击 +${equip.attack}</div>`;
  if (equip.defense) stats += `<div>防御 +${equip.defense}</div>`;
  if (equip.hp) stats += `<div>气血 +${equip.hp}</div>`;
  if (equip.hit) stats += `<div>命中 +${equip.hit}</div>`;
  if (equip.dodge) stats += `<div>闪躲 +${equip.dodge}</div>`;
  if (equip.parry) stats += `<div>招架 +${equip.parry}</div>`;
  if (equip.speed) stats += `<div>速度 +${equip.speed}</div>`;
  if (equip.innerSkill) stats += `<div>内功 +${equip.innerSkill}</div>`;
  return stats;
}

function equipCharItem(type, itemId) {
  const char = getCurrentCharacter();
  const item = PLAYER_INVENTORY[type].find(i => i.id === itemId);
  
  if (item) {
    char.equipped[type] = { ...item };
    loadCharacterData();
    closeCharModal();
  }
}

function unequipCharItem(type) {
  const char = getCurrentCharacter();
  char.equipped[type] = null;
  loadCharacterData();
  closeCharModal();
}

function closeCharModal() {
  CHAR_UI.charModal.style.display = 'none';
}

/**
 * 切换角色页签
 */
function switchCharTab(tab) {
  document.querySelectorAll('.char-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.char-tab-content').forEach(content => content.style.display = 'none');
  
  document.querySelector(`.char-tab-btn[onclick="switchCharTab('${tab}')"]`).classList.add('active');
  document.getElementById(`char${tab.charAt(0).toUpperCase() + tab.slice(1)}Tab`).style.display = 'block';
}

/**
 * 预览属性点分配
 */
function calculatePreviewStats(char) {
  const s = char.stats;
  const strAdd = pointPreview.strength;
  const agiAdd = pointPreview.agility;
  const boneAdd = pointPreview.bone;
  
  const attackAdd = strAdd * 3;
  const hpAdd = boneAdd * 20;
  const speedAdd = agiAdd * 2;
  const parryAdd = Math.floor((s.strength + strAdd) / 5) - Math.floor(s.strength / 5);
  const defenseAdd = Math.floor((s.bone + boneAdd) / 3) - Math.floor(s.bone / 3);
  
  return {
    attack: attackAdd,
    hp: hpAdd,
    speed: speedAdd,
    parry: parryAdd,
    defense: defenseAdd,
    hit: 0,
    dodge: 0
  };
}

function updatePreviewStats(char) {
  const preview = calculatePreviewStats(char);
  const attrs = ['Attack', 'Hp', 'Hit', 'Dodge', 'Defense', 'Parry', 'Speed'];
  
  attrs.forEach(attr => {
    const el = document.getElementById(`stat${attr}Preview`);
    const add = preview[attr.toLowerCase()];
    if (add > 0) {
      el.textContent = ` +${add}`;
      el.style.display = 'inline';
    } else {
      el.style.display = 'none';
    }
  });
}

function previewCharPoint(attr, delta) {
  const char = getCurrentCharacter();
  const totalPreview = pointPreview[attr] + delta;
  
  if (delta > 0) {
    // 加点
    if (char.remainingPoints <= 0) {
      return;
    }
    char.remainingPoints--;
    pointPreview[attr]++;
  } else {
    // 退点
    if (pointPreview[attr] <= 0) {
      return;
    }
    char.remainingPoints++;
    pointPreview[attr]--;
  }
  
  // 更新显示
  updateFourDimDisplay(char);
  updatePreviewStats(char);
  
  // 显示确认/取消按钮
  const hasPreview = Object.values(pointPreview).some(v => v !== 0);
  document.getElementById('confirmPointBtn').style.display = hasPreview ? 'inline-block' : 'none';
  document.getElementById('cancelPointBtn').style.display = hasPreview ? 'inline-block' : 'none';
  
  // 显示预览提示
  if (hasPreview) {
    const totalUsed = Object.values(pointPreview).reduce((a, b) => a + b, 0);
    document.getElementById('previewHint').textContent = `已分配 ${totalUsed} 点属性`;
  } else {
    document.getElementById('previewHint').textContent = '';
  }
}

/**
 * 确认属性点分配
 */
function confirmCharPoint() {
  const char = getCurrentCharacter();
  
  // 应用预览点到角色属性
  char.stats.strength += pointPreview.strength;
  char.stats.agility += pointPreview.agility;
  char.stats.bone += pointPreview.bone;
  char.stats.qi += pointPreview.qi;
  
  // 更新衍生属性
  updateStatsFromFour();
  
  // 重置预览
  resetPointPreview();
  
  // 重新加载显示
  loadCharacterData();
  
  showCharFloatText('属性分配成功！', '#4caf50');
}

/**
 * 取消属性点分配
 */
function cancelCharPoint() {
  const char = getCurrentCharacter();
  
  // 归还预览消耗的点数
  const totalPreview = Object.values(pointPreview).reduce((a, b) => a + b, 0);
  char.remainingPoints += totalPreview;
  
  // 重置预览
  resetPointPreview();
  
  // 重新加载显示
  loadCharacterData();
}

function updateStatsFromFour() {
  const char = getCurrentCharacter();
  const s = char.stats;
  
  s.attack = 50 + s.strength * 3;
  s.hp = 200 + s.bone * 20;
  s.speed = 50 + s.agility * 2;
  s.parry += Math.floor(s.strength / 5);
  s.defense += Math.floor(s.bone / 3);
  
  char.power = Math.floor(s.attack * 2 + s.defense + s.hp / 10 + s.speed);
}

function updateAddButtons() {
  const char = getCurrentCharacter();
  const buttons = document.querySelectorAll('.add-point-btn');
  buttons.forEach(btn => {
    btn.disabled = char.remainingPoints <= 0;
  });
}

function showCharFloatText(text, color) {
  const floatDiv = document.createElement('div');
  floatDiv.textContent = text;
  floatDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 24px;
    font-weight: bold;
    color: ${color};
    text-shadow: 0 0 15px ${color};
    z-index: 9999;
    opacity: 0;
    transition: all 0.5s ease-out;
  `;
  
  document.body.appendChild(floatDiv);
  
  setTimeout(() => { floatDiv.style.opacity = '1'; }, 50);
  setTimeout(() => { floatDiv.style.opacity = '0'; }, 2000);
  setTimeout(() => { document.body.removeChild(floatDiv); }, 3000);
}

// 点击弹窗外部关闭
window.addEventListener('click', (e) => {
  if (e.target === CHAR_UI.charModal) {
    closeCharModal();
  }
});

// 暴露函数给全局
window.toggleCharacterPanel = toggleCharacterPanel;
window.switchCharacter = switchCharacter;
window.switchCharTab = switchCharTab;
window.showCharEquipment = showCharEquipment;
window.previewCharPoint = previewCharPoint;
window.confirmCharPoint = confirmCharPoint;
window.cancelCharPoint = cancelCharPoint;
