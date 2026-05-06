// 角色系统数据

// 武学数据副本
const LOCAL_MARTIAL_ARTS = [
  {
    id: 1,
    name: '正阳基础剑式',
    type: '武功',
    skillType: 'sword',
    rank: '初阶',
    school: '正阳派',
    currentLevel: 3,
    maxLevel: 10,
    practiceTimes: 2,
    equipped: true,
    baseBonus: { sword: 5 },
    stats: { attack: 25, hit: 10 },
    skills: []
  },
  {
    id: 2,
    name: '流云剑法',
    type: '武功',
    skillType: 'sword',
    rank: '中阶',
    school: '正阳派',
    currentLevel: 0,
    maxLevel: 10,
    practiceTimes: 0,
    equipped: false,
    baseBonus: { sword: 8 },
    stats: { attack: 45, hit: 20, speed: 10 },
    skills: []
  },
  {
    id: 3,
    name: '正阳吐纳诀',
    type: '内功',
    skillType: 'innerSkill',
    rank: '初阶',
    school: '正阳派',
    currentLevel: 2,
    maxLevel: 10,
    practiceTimes: 1,
    equipped: true,
    baseBonus: { innerSkill: 5 },
    stats: { hp: 50, defense: 10, innerSkill: 15 },
    skills: []
  },
  {
    id: 4,
    name: '紫霞心经',
    type: '内功',
    skillType: 'innerSkill',
    rank: '高阶',
    school: '正阳派',
    currentLevel: 0,
    maxLevel: 10,
    practiceTimes: 0,
    equipped: false,
    baseBonus: { innerSkill: 10 },
    stats: { hp: 150, defense: 30, parry: 20, innerSkill: 40 },
    skills: []
  },
  {
    id: 5,
    name: '踏云步',
    type: '轻功',
    skillType: 'lightSkill',
    rank: '初阶',
    school: '正阳派',
    currentLevel: 1,
    maxLevel: 10,
    practiceTimes: 0,
    equipped: true,
    baseBonus: { lightSkill: 5 },
    stats: { speed: 30, dodge: 15 },
    skills: []
  }
];

// 从localStorage读取武学数据并计算加成
function getLocalMartialBonuses() {
  const bonuses = {
    fist: 0,
    sword: 0,
    blade: 0,
    lightSkill: 0,
    innerSkill: 0
  };

  let arts = LOCAL_MARTIAL_ARTS;
  
  // 获取当前角色ID
  const currentCharId = getCurrentCharacter().id;
  
  // 尝试从localStorage加载（多角色支持）
  try {
    const saved = localStorage.getItem('playerMartialArts_' + currentCharId);
    if (saved) {
      arts = JSON.parse(saved);
    }
  } catch (e) {
    arts = LOCAL_MARTIAL_ARTS;
  }

  arts.forEach(martial => {
    if (martial.baseBonus && martial.currentLevel > 0) {
      Object.entries(martial.baseBonus).forEach(([key, val]) => {
        if (bonuses.hasOwnProperty(key)) {
          bonuses[key] += val * martial.currentLevel;
        }
      });
    }
  });

  Object.keys(bonuses).forEach(key => {
    if (bonuses[key] > 100) bonuses[key] = 100;
  });

  return bonuses;
}

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
 * 从武学系统获取当前激活的武学
 */
function getEquippedMartialArts() {
  const charId = getCurrentCharacter().id;
  const saved = localStorage.getItem('playerMartialArts_' + charId);
  let martialArts = MARTIAL_ARTS_LIBRARY;
  
  if (saved) {
    martialArts = JSON.parse(saved);
  }
  
  const equipped = {
    武功: null,
    内功: null,
    轻功: null
  };
  
  martialArts.forEach(m => {
    if (m.equipped) {
      equipped[m.type] = m;
    }
  });
  
  return equipped;
}

/**
 * 加载角色数据
 */
function loadCharacterData() {
  const char = getCurrentCharacter();

  // 调试输出
  if (typeof calculateMartialArtsBonuses === 'function') {
    console.log('武学加成:', calculateMartialArtsBonuses());
  } else {
    console.log('找不到calculateMartialArtsBonuses函数');
  }

  CHAR_UI.charAvatar.textContent = char.icon;
  CHAR_UI.charLevel.textContent = 'Lv.' + char.level;
  CHAR_UI.charName.textContent = char.name;
  CHAR_UI.charGender.textContent = char.gender;
  CHAR_UI.charFaction.textContent = char.faction;
  CHAR_UI.charPower.textContent = char.power;
  CHAR_UI.charDesc.textContent = char.description;
  
  // 更新健康条
  const healthPct = (char.health.current / char.health.max) * 100;
  CHAR_UI.charHealthBar.style.width = `${healthPct}%`;
  
  // 更新经验条
  const expPct = (char.exp.current / char.exp.max) * 100;
  CHAR_UI.charExpBar.style.width = `${expPct}%`;
  
  // 从武学系统获取激活的武学并更新显示
  const equippedMartialArts = getEquippedMartialArts();
  
  // 更新武功
  if (equippedMartialArts['武功']) {
    // 支持两套 ID
    const weaponSkillEl = document.getElementById('weaponSkill') || document.getElementById('charWeaponSkill');
    if (weaponSkillEl) weaponSkillEl.textContent = equippedMartialArts['武功'].name;
    
    const weaponLevelEl = document.querySelector('#skillWeapon .skill-level') || document.querySelector('#skillSlot1 .skill-level');
    if (weaponLevelEl) weaponLevelEl.textContent = 
      equippedMartialArts['武功'].currentLevel + '/' + equippedMartialArts['武功'].maxLevel + '重';
  }
  
  // 更新内功
  if (equippedMartialArts['内功']) {
    const innerSkillEl = document.getElementById('innerSkill') || document.getElementById('charInnerSkill');
    if (innerSkillEl) innerSkillEl.textContent = equippedMartialArts['内功'].name;
    
    const innerLevelEl = document.querySelector('#skillInner .skill-level') || document.querySelector('#skillSlot2 .skill-level');
    if (innerLevelEl) innerLevelEl.textContent = 
      equippedMartialArts['内功'].currentLevel + '/' + equippedMartialArts['内功'].maxLevel + '重';
  }
  
  // 更新轻功
  if (equippedMartialArts['轻功']) {
    const lightSkillEl = document.getElementById('lightSkill') || document.getElementById('charLightSkill');
    if (lightSkillEl) lightSkillEl.textContent = equippedMartialArts['轻功'].name;
    
    const lightLevelEl = document.querySelector('#skillLight .skill-level') || document.querySelector('#skillSlot3 .skill-level');
    if (lightLevelEl) lightLevelEl.textContent = 
      equippedMartialArts['轻功'].currentLevel + '/' + equippedMartialArts['轻功'].maxLevel + '重';
  }
  
  // 更新基础属性（原始值）
  document.getElementById('statAttackBase').textContent = char.stats.attack;
  document.getElementById('statHpBase').textContent = char.stats.hp;
  document.getElementById('statHitBase').textContent = char.stats.hit;
  document.getElementById('statDodgeBase').textContent = char.stats.dodge;
  document.getElementById('statDefenseBase').textContent = char.stats.defense;
  document.getElementById('statParryBase').textContent = char.stats.parry;
  document.getElementById('statSpeedBase').textContent = char.stats.speed;
  
  // 计算武学修为加成
  const martialBonuses = getLocalMartialBonuses();
  console.log('武学加成', martialBonuses);

  // 显示修为（基础值+武学加成，直接显示最终值）
  document.getElementById('statFistBase').textContent = char.stats.fist + martialBonuses.fist;
  document.getElementById('statFistPreview').style.display = 'none';
  
  document.getElementById('statSwordBase').textContent = char.stats.sword + martialBonuses.sword;
  document.getElementById('statSwordPreview').style.display = 'none';
  
  document.getElementById('statBladeBase').textContent = char.stats.blade + martialBonuses.blade;
  document.getElementById('statBladePreview').style.display = 'none';
  
  document.getElementById('statLightBase').textContent = char.stats.lightSkill + martialBonuses.lightSkill;
  document.getElementById('statLightPreview').style.display = 'none';
  
  document.getElementById('statInnerBase').textContent = char.stats.innerSkill + martialBonuses.innerSkill;
  document.getElementById('statInnerPreview').style.display = 'none';
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
      
      // 添加悬停事件
      slot.onmouseenter = (e) => showEquipTooltip(e, equip, type);
      slot.onmouseleave = hideEquipTooltip;
    } else {
      slot.innerHTML = `
        <span class="slot-add">+</span>
        <span class="slot-name">${getTypeName(type)}</span>
      `;
      slot.classList.add('empty');
      
      // 移除悬停事件
      slot.onmouseenter = null;
      slot.onmouseleave = null;
    }
  });
}

/**
 * 获取装备类型图标
 */
function getEquipTypeIcon(type) {
  const icons = {
    weapon: '🗡️',
    armor: '🛡️',
    accessory: '💍',
    shoes: '👢'
  };
  return icons[type] || '📦';
}

/**
 * 显示装备详情 tooltip
 */
function showEquipTooltip(e, equip, type) {
  const tooltip = document.getElementById('equipTooltip');
  
  if (!tooltip) {
    return;
  }
  
  const statsHtml = renderEquipStats(equip);
  
  tooltip.innerHTML = `
    <div class="tooltip-icon">${getEquipTypeIcon(type)}</div>
    <div class="tooltip-header">
      <span class="tooltip-name" style="color: ${getRarityColor(equip.rarity)}">${equip.name}</span>
      <span class="tooltip-level">Lv.${equip.level}</span>
    </div>
    <div class="tooltip-desc">${equip.desc}</div>
    <div class="tooltip-stats">${statsHtml}</div>
  `;
  
  // 强制显示
  tooltip.style.display = 'block';
  tooltip.style.zIndex = '9999';
  tooltip.style.visibility = 'visible';
  
  // 定位 tooltip，避免超出屏幕 - 使用 currentTarget 确保是装备槽元素
  const target = e.currentTarget || e.target;
  const rect = target.getBoundingClientRect();
  let left = rect.right + 15;
  let top = rect.top;
  
  // 如果右边超出屏幕，显示在左边
  if (left + 320 > window.innerWidth) {
    left = rect.left - 335;
  }
  
  // 如果下边超出屏幕，向上调整
  if (top + tooltip.offsetHeight > window.innerHeight) {
    top = window.innerHeight - tooltip.offsetHeight - 20;
  }
  
  tooltip.style.left = left + 'px';
  tooltip.style.top = top + 'px';
}

/**
 * 处理装备槽悬停
 */
function handleEquipHover(e, type) {
  const char = getCurrentCharacter();
  const equip = char.equipped[type];
  
  if (equip) {
    showEquipTooltip(e, equip, type);
  }
}

/**
 * 隐藏装备详情 tooltip
 */
function hideEquipTooltip() {
  const tooltip = document.getElementById('equipTooltip');
  tooltip.style.display = 'none';
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
 * 打开武学系统
 */
function openMartialArts(type) {
  window.location.href = 'martialArts.html?type=' + encodeURIComponent(type);
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
      const itemJson = encodeURIComponent(JSON.stringify(item));
      html += `
        <div class="equip-item ${!canEquip ? 'disabled' : ''}" 
             onclick="${canEquip ? `equipCharItem('${type}', ${item.id})` : ''}"
             onmouseenter="showModalEquipTooltip(event, '${itemJson}', '${type}')"
             onmouseleave="hideEquipTooltip()">
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

/**
 * 显示弹窗中装备的 tooltip
 */
function showModalEquipTooltip(e, itemJson, type) {
  const item = JSON.parse(decodeURIComponent(itemJson));
  showEquipTooltip(e, item, type);
}

function renderEquipStats(equip) {
  let stats = '';
  if (equip.attack) stats += `<div class="tooltip-stat">攻击 +${equip.attack}</div>`;
  if (equip.defense) stats += `<div class="tooltip-stat">防御 +${equip.defense}</div>`;
  if (equip.hp) stats += `<div class="tooltip-stat">气血 +${equip.hp}</div>`;
  if (equip.hit) stats += `<div class="tooltip-stat">命中 +${equip.hit}</div>`;
  if (equip.dodge) stats += `<div class="tooltip-stat">闪躲 +${equip.dodge}</div>`;
  if (equip.parry) stats += `<div class="tooltip-stat">招架 +${equip.parry}</div>`;
  if (equip.speed) stats += `<div class="tooltip-stat">速度 +${equip.speed}</div>`;
  if (equip.innerSkill) stats += `<div class="tooltip-stat">内功 +${equip.innerSkill}</div>`;
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
