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

const TAB_CONFIG = {
  misc: { name: '杂项', filter: item => (item.id === 'lingzhi_cao') || !['equipment', 'potion', 'skillbook', 'material', 'quest'].includes(item.category) },
  equipment: { name: '装备', filter: item => item.category === 'equipment' },
  potion: { name: '丹药', filter: item => item.category === 'potion' },
  skillbook: { name: '秘籍', filter: item => item.category === 'skillbook' },
  material: { name: '材料', filter: item => item.category === 'material' },
  quest: { name: '任务', filter: item => item.category === 'quest' }
};

const QUALITY_CONFIG = {
  common: { name: '普通', class: 'quality-common' },
  uncommon: { name: '优秀', class: 'quality-uncommon' },
  rare: { name: '稀有', class: 'quality-rare' },
  epic: { name: '史诗', class: 'quality-epic' },
  legendary: { name: '传说', class: 'quality-legendary' }
};

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
    console.log('window.playerData 不存在，初始化默认值...');
    window.playerData = {
      inventory: [
        { id: 'potion_small', quantity: 5 },
        { id: 'potion_medium', quantity: 3 },
        { id: 'iron_sword', quantity: 1 },
        { id: 'leather_armor', quantity: 1 },
        { id: 'skillbook_liuyun', quantity: 1 }
      ],
      equipment: {
        weapon: null,
        armor: null,
        helmet: null,
        shoes: null,
        accessory: null
      },
      level: 10
    };
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
    
    if (itemA.category === 'equipment' && itemB.category === 'equipment') {
      const qualityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
      const qualityCompare = (qualityOrder[itemB.quality] || 0) - (qualityOrder[itemA.quality] || 0);
      if (qualityCompare !== 0) return qualityCompare;
      return (itemB.requiredLevel || 0) - (itemA.requiredLevel || 0);
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
    legendary: '#f59e0b'
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
  
  const playerLevel = window.playerData?.level || 1;
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
      ${itemData.quality ? `<div class="item-quality ${QUALITY_CONFIG[itemData.quality]?.class || 'quality-common'}">${QUALITY_CONFIG[itemData.quality]?.name || '普通'}</div>` : ''}
      <div class="item-description">${itemData.description}</div>
  `;
  
  // 显示秘籍学习条件
  if (isSkillbook && itemData.learningRequirement) {
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
  const attrNames = {
    attack: '攻击',
    defense: '防御',
    hp: '气血',
    mp: '内力',
    strength: '力量',
    agility: '敏捷',
    vitality: '体质',
    spirit: '内力属性',
    critRate: '暴击率',
    dodgeRate: '闪避率'
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
}

// 添加到背包
function addToInventory(itemId, quantity) {
  const player = window.playerData;
  if (!player) return;
  
  let remaining = quantity;
  
  // 先尝试填满已有的同类型格子（不超过99）
  for (let item of player.inventory) {
    if (item.id === itemId && item.quantity < 99) {
      const canAdd = 99 - item.quantity;
      const toAdd = Math.min(canAdd, remaining);
      item.quantity += toAdd;
      remaining -= toAdd;
      
      if (remaining <= 0) break;
    }
  }
  
  // 如果还有剩余，创建新格子
  while (remaining > 0) {
    const toAdd = Math.min(remaining, 99);
    player.inventory.push({ id: itemId, quantity: toAdd });
    remaining -= toAdd;
  }
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

// 关闭背包
function closeInventory() {
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
  
  removeFromInventory(itemId, 1);
  
  showInventoryFloatText(`${char.name}学会了【${martialArtToLearn.name}】！`, '#4caf50');
  
  renderItems();
  updateCapacity();
  clearSelection();
}

// 获取角色武学数据
function getPlayerMartialArts(charId) {
  const saved = localStorage.getItem(`playerMartialArts_${charId}`);
  if (saved) return JSON.parse(saved);
  
  return [
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
window.openCharacterSelect = openCharacterSelect;
window.closeCharacterSelect = closeCharacterSelect;
window.selectCharacterToLearn = selectCharacterToLearn;
window.learnMartialArt = learnMartialArt;

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', init);
