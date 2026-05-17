/**
 * 背包系统
 */

// 全局变量 - 只声明不初始化
let tabsBar;
let itemsGrid;
let itemDetail;
let capacityCount;
let btnSort;
let btnClose;
let tempBackpackOverlay;
let tempGrid;
let btnCloseTemp;
let characterSelectOverlay;
let characterList;
let closeCharacterSelectBtn;

let currentCategory = 'misc';
let selectedItem = null;
let draggedItem = null;
let draggedSlot = null;
let tempBackpack = [];
const MAX_CAPACITY = 200;
const TEMP_CAPACITY = 5;
let currentLearningItemId = null;

// 角色列表数据
const characters = [
  { 
    id: 1, 
    name: '少侠', 
    icon: '👨‍🦰', 
    stats: {
      fist: 15,
      sword: 45,
      blade: 10,
      lightSkill: 30,
      innerSkill: 35,
      strength: 12,
      agility: 10,
      bone: 9,
      qi: 11,
      attack: 85,
      hp: 420,
      hit: 95,
      dodge: 45,
      defense: 52,
      parry: 38,
      speed: 72
    },
    remainingPoints: 20
  },
  { 
    id: 2, 
    name: '苏瑶', 
    icon: '👧', 
    stats: {
      fist: 10,
      sword: 55,
      blade: 8,
      lightSkill: 50,
      innerSkill: 45,
      strength: 8,
      agility: 15,
      bone: 7,
      qi: 13,
      attack: 92,
      hp: 380,
      hit: 105,
      dodge: 65,
      defense: 45,
      parry: 28,
      speed: 95
    },
    remainingPoints: 0
  }
];

const TUTORIAL_WOOD_IDS = ['mu_jian', 'mu_dao', 'mu_quan'];

function invHasDojoWoodWeaponGranted() {
  try {
    const raw = localStorage.getItem('playerState');
    if (!raw) return false;
    const st = JSON.parse(raw);
    const t = st && st.qingstoneDojoTutorial;
    return !!(t && t.phase === 'picked' && t.weaponId);
  } catch (e) {
    return false;
  }
}

function invStripTutorialWoodFromBag(inventory) {
  if (!Array.isArray(inventory) || invHasDojoWoodWeaponGranted()) return false;
  let changed = false;
  for (let i = inventory.length - 1; i >= 0; i--) {
    if (inventory[i] && TUTORIAL_WOOD_IDS.indexOf(String(inventory[i].id)) >= 0) {
      inventory.splice(i, 1);
      changed = true;
    }
  }
  return changed;
}

const TAB_CONFIG = {
  misc: { name: '杂项', filter: item => (item.id === 'lingzhi_cao') || !['equipment', 'potion', 'skillbook', 'material', 'quest'].includes(item.category) },
  equipment: { name: '装备', filter: item => item.category === 'equipment' },
  potion: { name: '丹药', filter: item => item.category === 'potion' },
  skillbook: { name: '秘籍', filter: item => item.category === 'skillbook' },
  material: { name: '材料', filter: item => item.category === 'material' },
  quest: { name: '任务', filter: item => item.category === 'quest' }
};

/** 装备等与 `items.js` 的 `quality` 字段对齐：残品→绝品（色：灰/绿/蓝/紫/橙）；秘籍仍用 chu_jie～jue_jie */
const QUALITY_CONFIG = {
  common: { name: '残品', class: 'quality-common' },
  uncommon: { name: '低品', class: 'quality-uncommon' },
  rare: { name: '中品', class: 'quality-rare' },
  epic: { name: '极品', class: 'quality-epic' },
  legendary: { name: '绝品', class: 'quality-legendary' },
  // 与武学 `rank`（martialArtsData MARTIAL_ARTS_RANKS）一致，用于秘籍等待遇型物品
  chu_jie: { name: '初阶', class: 'quality-chu-jie' },
  zhong_jie: { name: '中阶', class: 'quality-zhong-jie' },
  gao_jie: { name: '高阶', class: 'quality-gao-jie' },
  jue_jie: { name: '绝阶', class: 'quality-jue-jie' }
};

/** 背包判定「能否装备」用：与战斗存档一致，优先 `game_save_0.player.level`，其次 `playerData.level` */
function getProtagonistLevelForInventoryUi() {
  try {
    const raw = localStorage.getItem('game_save_0');
    if (raw) {
      const save = JSON.parse(raw);
      const lv = save && save.player && save.player.level;
      if (typeof lv === 'number' && lv > 0) return lv;
    }
  } catch (e) {
    /* ignore */
  }
  if (window.playerData && typeof window.playerData.level === 'number' && window.playerData.level > 0) {
    return window.playerData.level;
  }
  return 1;
}

// 初始化函数 - DOM加载完成后调用
function init() {
  console.log('inventory.js 开始初始化...');
  
  // 初始化DOM元素
  tabsBar = document.querySelector('.tabs-bar');
  itemsGrid = document.getElementById('itemsGrid');
  itemDetail = document.getElementById('itemDetail');
  capacityCount = document.getElementById('capacityCount');
  btnSort = document.getElementById('btnSort');
  btnClose = document.getElementById('btnClose');
  tempBackpackOverlay = document.getElementById('tempBackpackOverlay');
  tempGrid = document.getElementById('tempGrid');
  btnCloseTemp = document.getElementById('btnCloseTemp');
  characterSelectOverlay = document.getElementById('characterSelectOverlay');
  characterList = document.getElementById('characterList');
  closeCharacterSelectBtn = document.getElementById('closeCharacterSelectBtn');

  console.log('DOM元素检查:', { tabsBar, itemsGrid, btnClose });

  // 确保window.playerData存在，优先从localStorage读取
  const savedPlayerData = localStorage.getItem('playerData');
  if (savedPlayerData) {
    try {
      window.playerData = JSON.parse(savedPlayerData);
      console.log('从localStorage读取playerData:', window.playerData);
    } catch (e) {
      console.error('解析playerData失败:', e);
    }
  }
  
  if (!window.playerData) {
    console.log('window.playerData 不存在，初始化空背包占位（勿内置演示装备）...');
    window.playerData = {
      inventory: [],
      equipment: {
        weapon: null,
        armor: null,
        helmet: null,
        shoes: null,
        accessory: null
      },
      level: 1
    };
  }

  if (window.playerData.inventory && invStripTutorialWoodFromBag(window.playerData.inventory)) {
    persistPlayerData();
  }

  if (window.playerData.inventory && normalizeInventoryEquipmentNoStack(window.playerData.inventory)) {
    persistPlayerData();
  }

  // 初始化临时背包
  for (let i = 0; i < TEMP_CAPACITY; i++) {
    tempBackpack.push(null);
  }

  // 绑定事件
  bindEvents();

  // 渲染页面
  renderItems();
  updateCapacity();

  console.log('inventory.js 初始化完成！');
}

// 绑定事件
function bindEvents() {
  // 页签点击
  if (tabsBar) {
    tabsBar.addEventListener('click', (e) => {
      const tab = e.target.closest('.tab');
      if (tab) {
        switchCategory(tab.dataset.category);
      }
    });
  }

  // 排序按钮
  if (btnSort) {
    btnSort.addEventListener('click', sortInventory);
  }

  // 离开按钮
  if (btnClose) {
    btnClose.addEventListener('click', closeInventory);
  }

  // 临时背包关闭
  if (btnCloseTemp) {
    btnCloseTemp.addEventListener('click', closeTempBackpack);
  }

  // 角色选择关闭
  if (closeCharacterSelectBtn) {
    closeCharacterSelectBtn.addEventListener('click', closeCharacterSelect);
  }

  if (characterSelectOverlay) {
    characterSelectOverlay.addEventListener('click', (e) => {
      if (e.target === characterSelectOverlay) {
        closeCharacterSelect();
      }
    });
  }
}

// 切换页签
function switchCategory(category) {
  currentCategory = category;
  
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelector(`[data-category="${category}"]`).classList.add('active');
  
  renderItems();
  clearSelection();
}

// 渲染物品
function renderItems() {
  if (!itemsGrid) return;
  
  itemsGrid.innerHTML = '';
  
  const filteredItems = getItemsByCategory(currentCategory);
  
  filteredItems.sort((a, b) => {
    const itemA = window.ITEMS[a.id];
    const itemB = window.ITEMS[b.id];
    const qualityOrder = {
      legendary: 9,
      epic: 8,
      jue_jie: 7,
      gao_jie: 6,
      rare: 5,
      zhong_jie: 4,
      uncommon: 3,
      chu_jie: 2,
      common: 1
    };

    if (itemA.category === 'equipment' && itemB.category === 'equipment') {
      const qualityCompare = (qualityOrder[itemB.quality] || 0) - (qualityOrder[itemA.quality] || 0);
      if (qualityCompare !== 0) return qualityCompare;
      return (itemB.requiredLevel || 0) - (itemA.requiredLevel || 0);
    }

    if (itemA.category === 'skillbook' && itemB.category === 'skillbook') {
      const qualityCompare = (qualityOrder[itemB.quality] || 0) - (qualityOrder[itemA.quality] || 0);
      if (qualityCompare !== 0) return qualityCompare;
    }

    return itemA.name.localeCompare(itemB.name);
  });
  
  filteredItems.forEach(item => {
    const slot = createItemSlot(item);
    if (slot) itemsGrid.appendChild(slot);
  });
  
  if (filteredItems.length === 0) {
    itemsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #666; padding-top: 50px;">该分类暂无物品</div>';
  }
}

// 创建物品格子
function createItemSlot(item) {
  const itemData = window.ITEMS[item.id];
  if (!itemData) return null;
  
  const slot = document.createElement('div');
  slot.className = 'item-slot';
  slot.setAttribute('data-item-id', item.id);
  
  const quality = itemData.quality || 'common';
  const qualityColors = {
    common: '#9ca3af',
    uncommon: '#22c55e',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b',
    chu_jie: '#9e9e9e',
    zhong_jie: '#4caf50',
    gao_jie: '#2196f3',
    jue_jie: '#ff9800'
  };
  slot.style.borderColor = qualityColors[quality] || '#d4c4a8';
  
  if (quality === 'legendary') {
    slot.style.background = 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)';
  }
  
  const icon = document.createElement('div');
  icon.className = 'slot-icon';
  icon.textContent = itemData.icon || '📦';
  slot.appendChild(icon);
  
  if (item.quantity > 1) {
    const quantity = document.createElement('div');
    quantity.className = 'slot-quantity';
    quantity.textContent = item.quantity;
    slot.appendChild(quantity);
  }
  
  slot.addEventListener('click', () => selectItem(item));
  slot.draggable = true;
  slot.addEventListener('dragstart', (e) => handleDragStart(e, item, slot));
  slot.addEventListener('dragover', handleDragOver);
  slot.addEventListener('drop', (e) => handleDrop(e, 'inventory'));
  
  return slot;
}

// 选择物品
function selectItem(item) {
  selectedItem = item;
  
  document.querySelectorAll('.item-slot').forEach(slot => {
    slot.classList.remove('selected');
  });
  document.querySelector(`[data-item-id="${item.id}"]`)?.classList.add('selected');
  
  showItemDetail(item);
}

// 显示物品详情
function showItemDetail(item) {
  const itemData = window.ITEMS[item.id];
  if (!itemData) return;
  
  const playerLevel = getProtagonistLevelForInventoryUi();
  const isHighLevel = itemData.requiredLevel && itemData.requiredLevel > playerLevel;
  const isEquipment = itemData.category === 'equipment';
  const isSkillbook = itemData.category === 'skillbook';
  
  let html = `
    <div class="item-detail-content">
      <div class="item-header">
        <div class="item-icon">${itemData.icon || '📦'}</div>
        <div class="item-info">
          <div class="item-name">${itemData.name}</div>
          ${itemData.requiredLevel ? `<div class="item-level ${isHighLevel ? 'high-level' : ''}">需要等级 ${itemData.requiredLevel}</div>` : ''}
        </div>
      </div>
      ${itemData.quality ? `<div class="item-quality ${QUALITY_CONFIG[itemData.quality]?.class || 'quality-common'}">${QUALITY_CONFIG[itemData.quality]?.name || '残品'}</div>` : ''}
      <div class="item-description">${itemData.description}</div>
  `;
  
  // 显示秘籍学习条件
  if (isSkillbook && itemData.learningRequirement && itemData.learningRequirement.value > 0) {
    const skillTypeNames = {
      sword: '剑术',
      innerSkill: '内功',
      lightSkill: '轻功',
      fist: '拳脚',
      blade: '刀术'
    };
    html += `
      <div class="learning-requirement" style="margin: 10px 0; padding: 10px; background: #fff3e0; border-radius: 4px; border-left: 4px solid #ff9800;">
        <strong>学习条件：</strong>${skillTypeNames[itemData.learningRequirement.skillType]}修为 ${itemData.learningRequirement.value}
      </div>
    `;
  }
  
  if (isEquipment && itemData.bonus) {
    html += '<div class="attr-list">';
    Object.entries(itemData.bonus).forEach(([attr, value]) => {
      const attrName = getAttrName(attr);
      const isPositive = value > 0;
      html += `
        <div class="attr-item">
          <span class="attr-name">${attrName}</span>
          <span class="attr-value ${isPositive ? 'positive' : 'negative'}">${isPositive ? '+' : ''}${value}</span>
        </div>
      `;
    });
    html += '</div>';
  }
  
  html += '<div class="item-actions">';
  
  if (isEquipment) {
    const canEquip = !isHighLevel;
    html += `<button class="btn-equip" ${!canEquip ? 'disabled' : ''} onclick="equipItem('${item.id}')">装备</button>`;
  }
  
  if (isSkillbook) {
    html += `<button class="btn-use" onclick="openCharacterSelect('${item.id}')">学习</button>`;
  } else if (itemData.effects && Object.keys(itemData.effects).length > 0) {
    html += `<button class="btn-use" onclick="useItem('${item.id}')">使用</button>`;
  } else {
    html += `<button class="btn-use" disabled>使用</button>`;
  }
  
  html += `<button class="btn-drop" onclick="dropItem('${item.id}')">丢弃</button>`;
  html += '</div></div>';
  
  if (itemDetail) {
    itemDetail.innerHTML = html;
  }
}

function getAttrName(attr) {
  const extras = {
    vitality: '体质',
    spirit: '内力属性',
    critRate: '暴击率',
    dodgeRate: '闪避率'
  };
  if (extras[attr]) return extras[attr];
  if (typeof AttributeHelper !== 'undefined') {
    return AttributeHelper.getDisplayName(attr);
  }
  const attrNames = {
    attack: '攻击',
    defense: '防御',
    hp: '气血',
    mp: '内力',
    parry: '招架',
    hit: '命中',
    dodge: '闪避',
    speed: '速度'
  };
  return attrNames[attr] || attr;
}

// 装备物品 - 跳转到角色系统
function equipItem(itemId) {
  localStorage.setItem('openCharacterOnLoad', '1');
  window.location.href = 'map.html';
}

// 使用物品
function useItem(itemId) {
  const itemData = window.ITEMS[itemId];
  if (!itemData) return;
  
  if (!itemData.effects) return;
  
  const player = window.playerData;
  const effects = itemData.effects;
  
  let message = '';
  if (effects.hpRestore) {
    player.hp = Math.min(player.maxHp || 100, (player.hp || 100) + effects.hpRestore);
    message += `恢复 ${effects.hpRestore} 点生命\n`;
  }
  if (effects.mpRestore) {
    player.mp = Math.min(player.maxMp || 50, (player.mp || 50) + effects.mpRestore);
    message += `恢复 ${effects.mpRestore} 点内力\n`;
  }
  
  removeFromInventory(itemId, 1);
  
  renderItems();
  updateCapacity();
  clearSelection();
  
  alert(message.trim());
}

// 丢弃物品
function dropItem(itemId) {
  if (!confirm('确定要丢弃这个物品吗？')) return;
  
  removeFromInventory(itemId, 1);
  renderItems();
  updateCapacity();
  clearSelection();
}

function persistPlayerData() {
  try {
    if (window.playerData) {
      localStorage.setItem('playerData', JSON.stringify(window.playerData));
    }
  } catch (e) {
    console.warn('persistPlayerData', e);
  }
}

function bumpMartialCultivation(charId, skillType, delta) {
  if (!skillType || !delta) return;
  try {
    let list = null;
    const raw = localStorage.getItem('playerCharacters');
    if (raw) {
      list = JSON.parse(raw);
    } else if (typeof window !== 'undefined' && Array.isArray(window.characters) && window.characters.length) {
      list = JSON.parse(JSON.stringify(window.characters));
    }
    if (Array.isArray(list)) {
      const c = list.find(x => x.id === charId);
      if (c) {
        if (!c.stats) c.stats = {};
        c.stats[skillType] = (c.stats[skillType] || 0) + delta;
        localStorage.setItem('playerCharacters', JSON.stringify(list));
      }
    }
  } catch (e) {
    console.warn('bumpMartialCultivation', e);
  }
  const ic = characters.find(x => x.id === charId);
  if (ic) {
    if (!ic.stats) ic.stats = {};
    ic.stats[skillType] = (ic.stats[skillType] || 0) + delta;
  }
  if (typeof window !== 'undefined' && Array.isArray(window.characters)) {
    const wc = window.characters.find(x => x.id === charId);
    if (wc) {
      if (!wc.stats) wc.stats = {};
      wc.stats[skillType] = (wc.stats[skillType] || 0) + delta;
    }
  }
}

/** 装备类（items.js category === 'equipment'）不占同一格叠加，每件一格 quantity 恒为 1 */
function isInventoryEquipmentNoStack(itemId) {
  const def = window.ITEMS && window.ITEMS[itemId];
  return !!(def && def.category === 'equipment');
}

/**
 * 将旧档中 quantity>1 的装备拆成多格；打开背包时调用一次即可落盘。
 * @returns {boolean} 是否改动了数组
 */
function normalizeInventoryEquipmentNoStack(inventory) {
  if (!Array.isArray(inventory) || !window.ITEMS) return false;
  let changed = false;
  let i = 0;
  while (i < inventory.length) {
    const slot = inventory[i];
    if (!slot || !slot.id) {
      i++;
      continue;
    }
    const def = window.ITEMS[slot.id];
    const n = Math.max(1, Math.min(99, Math.floor(Number(slot.quantity)) || 1));
    if (def && def.category === 'equipment' && n > 1) {
      slot.quantity = 1;
      for (let k = 1; k < n; k++) {
        inventory.splice(i + k, 0, { id: slot.id, quantity: 1 });
      }
      changed = true;
      i += n;
    } else {
      i++;
    }
  }
  return changed;
}

// 从背包移除
function removeFromInventory(itemId, quantity) {
  const player = window.playerData;
  if (!player || !player.inventory) return;
  
  const index = player.inventory.findIndex(item => item.id === itemId);
  if (index !== -1) {
    player.inventory[index].quantity -= quantity;
    if (player.inventory[index].quantity <= 0) {
      player.inventory.splice(index, 1);
    }
  }
  persistPlayerData();
}

// 添加到背包
function addToInventory(itemId, quantity) {
  const player = window.playerData;
  if (!player) return;
  if (!player.inventory) player.inventory = [];

  let remaining = Math.max(0, Math.floor(Number(quantity)) || 0);
  if (remaining <= 0) return;

  if (isInventoryEquipmentNoStack(itemId)) {
    for (let q = 0; q < remaining; q++) {
      player.inventory.push({ id: itemId, quantity: 1 });
    }
    persistPlayerData();
    return;
  }

  // 先尝试填满已有的同 id 格子（不超过99）；装备类不走此分支
  for (let item of player.inventory) {
    if (item.id === itemId && item.quantity < 99) {
      const canAdd = 99 - item.quantity;
      const toAdd = Math.min(canAdd, remaining);
      item.quantity += toAdd;
      remaining -= toAdd;

      if (remaining <= 0) break;
    }
  }

  while (remaining > 0) {
    const toAdd = Math.min(remaining, 99);
    player.inventory.push({ id: itemId, quantity: toAdd });
    remaining -= toAdd;
  }
  persistPlayerData();
}

// 获取分类物品
function getItemsByCategory(category) {
  const player = window.playerData;
  if (!player || !player.inventory) return [];
  
  const filter = TAB_CONFIG[category]?.filter;
  if (!filter) return [];
  
  return player.inventory.filter(item => {
    const itemData = window.ITEMS[item.id];
    if (!itemData) return false;
    return filter(itemData);
  });
}

// 更新容量
function updateCapacity() {
  if (!capacityCount) return;
  
  const player = window.playerData;
  const count = player?.inventory?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  capacityCount.textContent = `${count}/${MAX_CAPACITY}`;
}

// 排序背包
function sortInventory() {
  const player = window.playerData;
  if (!player || !player.inventory) return;
  
  player.inventory.sort((a, b) => {
    const itemA = window.ITEMS[a.id];
    const itemB = window.ITEMS[b.id];
    
    const categoryOrder = { equipment: 1, skillbook: 2, potion: 3, material: 4, quest: 5 };
    const orderA = categoryOrder[itemA?.category] || 10;
    const orderB = categoryOrder[itemB?.category] || 10;
    
    if (orderA !== orderB) return orderA - orderB;
    
    return itemA.name.localeCompare(itemB.name);
  });
  
  renderItems();
  alert('背包整理完成');
}

// 清除选择
function clearSelection() {
  selectedItem = null;
  document.querySelectorAll('.item-slot').forEach(slot => {
    slot.classList.remove('selected');
  });
  
  if (itemDetail) {
    itemDetail.innerHTML = `
      <div class="empty-detail">
        <div class="empty-icon">📦</div>
        <p>请选择物品查看详情</p>
      </div>
    `;
  }
}

// 拖拽处理
function handleDragStart(e, item, slot) {
  draggedItem = item;
  draggedSlot = slot;
  slot.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e, targetType) {
  e.preventDefault();
  
  if (!draggedItem) return;
  
  draggedSlot?.classList.remove('dragging');
  draggedItem = null;
  draggedSlot = null;
}

// 临时背包
function renderTempBackpack() {
  // 暂时简化
}

function openTempBackpack() {
  // 暂时简化
}

function closeTempBackpack() {
  // 暂时简化
}

// 关闭背包（若从小地图/嵌套正阳进入则回到原界面）
function closeInventory() {
  try {
    var ret = sessionStorage.getItem('game_ui_return_href');
    if (ret) {
      sessionStorage.removeItem('game_ui_return_href');
      window.location.href = ret;
      return;
    }
  } catch (e) {}
  window.location.href = 'map.html';
}

// 秘籍学习相关函数

// 打开角色选择
function openCharacterSelect(itemId) {
  currentLearningItemId = itemId;
  renderCharacterList();
  if (characterSelectOverlay) {
    characterSelectOverlay.style.display = 'flex';
  }
}

// 关闭角色选择
function closeCharacterSelect() {
  currentLearningItemId = null;
  if (characterSelectOverlay) {
    characterSelectOverlay.style.display = 'none';
  }
}

// 渲染角色列表
function renderCharacterList() {
  if (!characterList) return;
  
  const itemData = window.ITEMS[currentLearningItemId];
  if (!itemData) return;
  
  characterList.innerHTML = characters.map(char => {
    const charMartialArts = getPlayerMartialArts(char.id);
    const alreadyLearned = charMartialArts.some(m => m.id === itemData.martialArtId);
    
    // 获取角色基础修为
    const baseStats = {
      fist: (char.stats && char.stats.fist) || 0,
      sword: (char.stats && char.stats.sword) || 0,
      blade: (char.stats && char.stats.blade) || 0,
      lightSkill: (char.stats && char.stats.lightSkill) || 0,
      innerSkill: (char.stats && char.stats.innerSkill) || 0
    };
    
    // 计算武学加成
    const martialBonuses = calculateCurrentBonuses(charMartialArts);
    
    // 总修为 = 基础修为 + 武学加成
    const totalBonuses = {
      fist: baseStats.fist + martialBonuses.fist,
      sword: baseStats.sword + martialBonuses.sword,
      blade: baseStats.blade + martialBonuses.blade,
      lightSkill: baseStats.lightSkill + martialBonuses.lightSkill,
      innerSkill: baseStats.innerSkill + martialBonuses.innerSkill
    };
    
    let meetsRequirement = true;
    let requirementText = '';
    
    if (itemData.learningRequirement) {
      meetsRequirement = totalBonuses[itemData.learningRequirement.skillType] >= itemData.learningRequirement.value;
      const skillTypeNames = {
        sword: '剑术',
        innerSkill: '内功',
        lightSkill: '轻功',
        fist: '拳脚',
        blade: '刀术'
      };
      requirementText = `${skillTypeNames[itemData.learningRequirement.skillType]}修为 ${totalBonuses[itemData.learningRequirement.skillType]}/${itemData.learningRequirement.value}`;
    }
    
    return `
      <div class="character-item ${alreadyLearned ? 'already-learned' : ''} ${!meetsRequirement && !alreadyLearned ? 'cannot-learn' : ''}"
           onclick="selectCharacterToLearn(${char.id})">
        <div class="char-icon">${char.icon}</div>
        <div class="char-info">
          <div class="char-name">${char.name}</div>
          <div class="char-status">
            ${alreadyLearned ? '✓ 已学会' : requirementText}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// 选择角色学习
function selectCharacterToLearn(charId) {
  if (!currentLearningItemId) return;
  
  learnMartialArt(window.ITEMS[currentLearningItemId], currentLearningItemId, charId);
  closeCharacterSelect();
}

// 学习武学
function learnMartialArt(itemData, itemId, charId = 1) {
  const martialArtId = itemData.martialArtId;
  const requirement = itemData.learningRequirement;
  
  let playerMartialArts = getPlayerMartialArts(charId);
  
  const char = characters.find(c => c.id === charId);
  const alreadyLearned = playerMartialArts.some(m => m.id === martialArtId);
  if (alreadyLearned) {
    showInventoryFloatText(`${char.name}已经学会这门武学了！`, '#ff9800');
    return;
  }
  
  // 获取角色基础修为
  const baseStats = {
    fist: char.stats.fist || 0,
    sword: char.stats.sword || 0,
    blade: char.stats.blade || 0,
    lightSkill: char.stats.lightSkill || 0,
    innerSkill: char.stats.innerSkill || 0
  };
  
  // 计算武学加成
  const martialBonuses = calculateCurrentBonuses(playerMartialArts);
  
  // 总修为 = 基础修为 + 武学加成
  const totalBonuses = {
    fist: baseStats.fist + martialBonuses.fist,
    sword: baseStats.sword + martialBonuses.sword,
    blade: baseStats.blade + martialBonuses.blade,
    lightSkill: baseStats.lightSkill + martialBonuses.lightSkill,
    innerSkill: baseStats.innerSkill + martialBonuses.innerSkill
  };
  
  if (requirement && totalBonuses[requirement.skillType] < requirement.value) {
    const skillTypeNames = {
      sword: '剑术',
      innerSkill: '内功',
      lightSkill: '轻功',
      fist: '拳脚',
      blade: '刀术'
    };
    showInventoryFloatText(`${char.name}的${skillTypeNames[requirement.skillType]}修为不足！`, '#f44336');
    return;
  }
  
  const martialArtToLearn = window.MARTIAL_ARTS_LIBRARY.find(m => m.id === martialArtId);
  if (!martialArtToLearn) {
    showInventoryFloatText('武学不存在！', '#f44336');
    return;
  }
  
  playerMartialArts.push({
    ...martialArtToLearn,
    currentLevel: 1,
    practiceTimes: 0,
    equipped: false
  });
  
  localStorage.setItem(`playerMartialArts_${charId}`, JSON.stringify(playerMartialArts));

  const cultivationGain = itemData.cultivationGain != null ? itemData.cultivationGain : 5;
  bumpMartialCultivation(charId, martialArtToLearn.skillType, cultivationGain);
  const cultivationLabels = {
    sword: '剑术',
    fist: '拳脚',
    blade: '刀术',
    innerSkill: '内功',
    lightSkill: '轻功'
  };
  const culLab = cultivationLabels[martialArtToLearn.skillType] || '武学';

  if (itemData.category === 'skillbook') {
    removeFromInventory(itemId, 1);
  }

  showInventoryFloatText(
    `${char.name}研读悟通【${martialArtToLearn.name}】！${culLab}修为 +${cultivationGain}；秘籍抄本已化入心得。行囊若无该册，教头处仍可再购。`,
    '#4caf50'
  );
  
  renderItems();
  updateCapacity();
  clearSelection();
}

// 计算当前修为
function calculateCurrentBonuses(martialArts) {
  const bonuses = {
    fist: 0,
    sword: 0,
    blade: 0,
    lightSkill: 0,
    innerSkill: 0
  };
  
  martialArts.forEach(martial => {
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

// 飘字提示
function showInventoryFloatText(text, color) {
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

// 暴露全局函数
window.equipItem = equipItem;
window.useItem = useItem;
window.dropItem = dropItem;
window.addToInventory = addToInventory;
window.removeFromInventory = removeFromInventory;
window.isInventoryEquipmentNoStack = isInventoryEquipmentNoStack;
window.normalizeInventoryEquipmentNoStack = normalizeInventoryEquipmentNoStack;
window.openCharacterSelect = openCharacterSelect;
window.closeCharacterSelect = closeCharacterSelect;
window.selectCharacterToLearn = selectCharacterToLearn;
window.learnMartialArt = learnMartialArt;

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', init);
