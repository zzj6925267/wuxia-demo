/**
 * 地图UI组件
 */

// 打开武学系统
function openMartialArts(type) {
  // 如果指定了type，通过URL传递
  if (type) {
    window.location.href = 'martialArts.html?type=' + encodeURIComponent(type);
  } else {
    window.location.href = 'martialArts.html';
  }
}

// 打开背包系统
function openInventory() {
  window.location.href = 'inventory.html';
}

// 当前正阳派位置（默认在门派入口）
let currentZhengyangBuilding = 'menkou';

// 当前对话状态
let currentDialogue = null;
let currentNpc = null;

// DOM元素缓存
const UI = {
  worldMap: document.getElementById('worldMap'),
  zhengyangMap: document.getElementById('zhengyangMap'),
  mapNodes: document.getElementById('worldMapNodes'),
  mapLines: document.querySelector('#worldMap .map-lines'),
  locationIcon: document.getElementById('locationIcon'),
  locationName: document.getElementById('locationName'),
  locationDesc: document.getElementById('locationDesc'),
  locationStatus: document.getElementById('locationStatus'),
  travelOverlay: document.getElementById('travelOverlay'),
  travelText: document.getElementById('travelText'),
  btnExplore: document.getElementById('btnExplore'),
  btnRest: document.getElementById('btnRest'),
  btnLeave: document.getElementById('btnLeave'),
  zhengyangMapNodes: document.getElementById('zhengyangMapNodes'),
  zhengyangMapLines: document.querySelector('#zhengyangMap .map-lines'),
  zhengyangLocationIcon: document.getElementById('zhengyangLocationIcon'),
  zhengyangLocationName: document.getElementById('zhengyangLocationName'),
  zhengyangLocationDesc: document.getElementById('zhengyangLocationDesc'),
  npcSection: document.getElementById('npcSection'),
  npcList: document.getElementById('npcList'),
  dialoguePanel: document.getElementById('dialoguePanel'),
  dialogueNpcIcon: document.getElementById('dialogueNpcIcon'),
  dialogueNpcName: document.getElementById('dialogueNpcName'),
  dialogueText: document.getElementById('dialogueText'),
  dialogueOptions: document.getElementById('dialogueOptions')
};

/**
 * 初始化地图UI
 */
function initMapUI(mapData, playerData) {
  window.gameMapData = mapData;
  window.gamePlayer = playerData;
  
  bindEvents();
  renderMap();
}

/**
 * 绑定事件
 */
function bindEvents() {
  UI.btnExplore.addEventListener('click', handleExplore);
  UI.btnRest.addEventListener('click', handleRest);
  UI.btnLeave.addEventListener('click', handleLeave);
}

/**
 * 渲染大地图
 */
function renderMap() {
  const { locations, connections } = window.gameMapData;
  const { currentLocation } = window.gamePlayer;
  
  UI.mapNodes.innerHTML = '';
  UI.mapLines.innerHTML = createWorldSvgDefs();

  const currentLoc = locations[currentLocation];
  const adjacentIds = currentLoc.connections;

  connections.forEach(([fromId, toId]) => {
    drawWorldConnection(locations[fromId], locations[toId], currentLocation);
  });

  Object.values(locations).forEach(loc => {
    const isCurrent = loc.id === currentLocation;
    const isAvailable = adjacentIds.includes(loc.id);
    drawWorldLocationNode(loc, isCurrent, isAvailable);
  });
}

/**
 * 创建大地图SVG定义
 */
function createWorldSvgDefs() {
  return `
    <defs>
      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#c9a227" />
        <stop offset="50%" stop-color="#f4d03f" />
        <stop offset="100%" stop-color="#c9a227" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
  `;
}

/**
 * 绘制大地图连接线
 */
function drawWorldConnection(fromLoc, toLoc, currentLocationId) {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', fromLoc.x);
  line.setAttribute('y1', fromLoc.y);
  line.setAttribute('x2', toLoc.x);
  line.setAttribute('y2', toLoc.y);
  line.setAttribute('stroke', 'url(#lineGradient)');
  line.setAttribute('stroke-width', '3');
  line.setAttribute('filter', 'url(#glow)');
  
  const isCurrentConnection = (fromLoc.id === currentLocationId || toLoc.id === currentLocationId);
  line.setAttribute('opacity', isCurrentConnection ? '1' : '0.5');
  
  UI.mapLines.appendChild(line);
}

/**
 * 绘制大地图地点节点
 */
function drawWorldLocationNode(location, isCurrent, isAvailable) {
  const node = document.createElement('div');
  node.className = `location-node ${isCurrent ? 'current' : ''} ${isAvailable ? 'available' : 'unavailable'}`;
  node.style.left = `${location.x}px`;
  node.style.top = `${location.y}px`;

  node.innerHTML = `
    <div class="node-inner">
      <span class="node-icon">${location.icon}</span>
      <span class="node-name">${location.name}</span>
      <span class="node-status">${isCurrent ? '当前所在' : isAvailable ? '可前往' : '需经相邻'}</span>
    </div>
  `;

  if (isAvailable && !isCurrent) {
    node.addEventListener('click', () => handleTravel(location.id));
  }

  UI.mapNodes.appendChild(node);
}

/**
 * 处理大地图移动
 */
function handleTravel(locationId) {
  const { locations } = window.gameMapData;
  const targetLoc = locations[locationId];
  if (!targetLoc) return;

  UI.travelText.textContent = `正在从 ${locations[window.gamePlayer.currentLocation].name} 前往 ${targetLoc.name}...`;
  UI.travelOverlay.style.display = 'flex';

  setTimeout(() => {
    window.gamePlayer.currentLocation = locationId;
    UI.travelOverlay.style.display = 'none';
    renderMap();
    updateLocationPanel();
  }, 1500);
}

/**
 * 更新大地图地点信息面板
 */
function updateLocationPanel() {
  const { locations } = window.gameMapData;
  const location = locations[window.gamePlayer.currentLocation];
  
  UI.locationIcon.textContent = location.icon;
  UI.locationName.textContent = location.name;
  UI.locationDesc.textContent = location.description;
  UI.locationStatus.innerHTML = `<span class="status-tag ${location.isSafe ? 'safe' : 'danger'}">${location.isSafe ? '安全区域' : '危险区域'}</span>`;
  
  UI.btnExplore.textContent = location.id === 'zhengyang_clan' ? '进入门派' : '探索此地';
}

/**
 * 处理探索/进入门派
 */
function handleExplore() {
  const { locations } = window.gameMapData;
  const location = locations[window.gamePlayer.currentLocation];
  
  if (location.id === 'zhengyang_clan') {
    enterZhengyangMap();
  } else {
    alert(`\u63A2\u7D22 ${location.name}...\n\n${location.description}`);
    
    if (Math.random() < 0.5) {
      const goldAmount = Math.floor(Math.random() * 20) + 5;
      window.gamePlayer.gold += goldAmount;
      alert(`\u53D1\u73B0\u4E86 ${goldAmount} 金币！`);
    }
  }
}

/**
 * 进入正阳派地图
 */
function enterZhengyangMap() {
  currentZhengyangBuilding = 'menkou';
  UI.worldMap.style.display = 'none';
  UI.zhengyangMap.style.display = 'flex';
  renderZhengyangMap();
  updateZhengyangPanel();
}

/**
 * 返回大地图
 */
function goBackToWorldMap() {
  UI.zhengyangMap.style.display = 'none';
  UI.worldMap.style.display = 'flex';
}

/**
 * 渲染正阳派地图
 */
function renderZhengyangMap() {
  UI.zhengyangMapNodes.innerHTML = '';
  UI.zhengyangMapLines.innerHTML = createZhengyangSvgDefs();

  const current = ZHENGYANG_BUILDINGS[currentZhengyangBuilding];
  const adjacentIds = current.connections;

  ZHENGYANG_CONNECTIONS.forEach(([fromId, toId]) => {
    drawZhengyangConnection(ZHENGYANG_BUILDINGS[fromId], ZHENGYANG_BUILDINGS[toId], currentZhengyangBuilding);
  });

  Object.values(ZHENGYANG_BUILDINGS).forEach(building => {
    const isCurrent = building.id === currentZhengyangBuilding;
    const isAvailable = adjacentIds.includes(building.id);
    drawZhengyangNode(building, isCurrent, isAvailable);
  });
}

/**
 * 创建正阳派地图SVG定义
 */
function createZhengyangSvgDefs() {
  return `
    <defs>
      <linearGradient id="zhengyangLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#c9a227" />
        <stop offset="50%" stop-color="#f4d03f" />
        <stop offset="100%" stop-color="#c9a227" />
      </linearGradient>
    </defs>
  `;
}

/**
 * 绘制正阳派连接线
 */
function drawZhengyangConnection(from, to, currentId) {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', from.x);
  line.setAttribute('y1', from.y);
  line.setAttribute('x2', to.x);
  line.setAttribute('y2', to.y);
  line.setAttribute('stroke', 'url(#zhengyangLineGrad)');
  line.setAttribute('stroke-width', '2');
  
  const isConnected = (from.id === currentId || to.id === currentId);
  line.setAttribute('opacity', isConnected ? '1' : '0.5');
  
  UI.zhengyangMapLines.appendChild(line);
}

/**
 * 绘制正阳派建筑节点
 */
function drawZhengyangNode(building, isCurrent, isAvailable) {
  const node = document.createElement('div');
  node.className = `location-node ${isCurrent ? 'current' : ''} ${isAvailable ? 'available' : 'unavailable'}`;
  node.style.left = `${building.x}px`;
  node.style.top = `${building.y}px`;
  
  node.innerHTML = `
    <div class="node-inner">
      <span class="node-icon">${building.icon}</span>
      <span class="node-name">${building.name}</span>
      <span class="node-status">${isCurrent ? '当前所在' : isAvailable ? '可前往' : '需经相邻'}</span>
    </div>
  `;

  if (isAvailable && !isCurrent) {
    node.addEventListener('click', () => travelZhengyang(building.id));
  }
  
  UI.zhengyangMapNodes.appendChild(node);
}

/**
 * 正阳派内移动
 */
function travelZhengyang(buildingId) {
  currentZhengyangBuilding = buildingId;
  renderZhengyangMap();
  updateZhengyangPanel();
}

/**
 * 更新正阳派信息面板
 */
function updateZhengyangPanel() {
  const building = ZHENGYANG_BUILDINGS[currentZhengyangBuilding];
  UI.zhengyangLocationIcon.textContent = building.icon;
  UI.zhengyangLocationName.textContent = building.name;
  
  if (currentZhengyangBuilding === 'menkou') {
    UI.zhengyangLocationDesc.innerHTML = building.desc + '<br/><button class="leave-btn" onclick="goBackToWorldMap()">离开门派</button>';
  } else {
    UI.zhengyangLocationDesc.textContent = building.desc;
  }
  
  updateNpcList();
}

/**
 * 获取当前地点的NPC
 */
function getCurrentLocationNpcs() {
  return Object.values(ZHENGYANG_NPCS).filter(npc => 
    npc.location.includes(currentZhengyangBuilding)
  );
}

/**
 * 更新NPC列表显示
 */
function updateNpcList() {
  const npcs = getCurrentLocationNpcs();
  
  if (npcs.length > 0) {
    UI.npcSection.style.display = 'block';
    UI.npcList.innerHTML = npcs.map(npc => `
      <div class="npc-item" onclick="startDialogue('${npc.id}')">
        <span class="npc-icon">${npc.icon}</span>
        <div>
          <div class="npc-name">${npc.name}</div>
          <div class="npc-title-text">${npc.title}</div>
        </div>
      </div>
    `).join('');
  } else {
    UI.npcSection.style.display = 'none';
  }
}

/**
 * 开始对话
 */
function startDialogue(npcId) {
  currentNpc = ZHENGYANG_NPCS[npcId];
  currentDialogue = 'default';
  
  showDialogue();
}

/**
 * 显示对话
 */
function showDialogue() {
  if (!currentNpc) return;
  
  const dialogue = currentNpc.dialogues[currentDialogue];
  
  UI.dialogueNpcIcon.textContent = currentNpc.icon;
  UI.dialogueNpcName.textContent = `${currentNpc.name} (${currentNpc.title})`;
  
  const text = dialogue.getText ? dialogue.getText() : dialogue.text;
  const fullText = `${currentNpc.name}：${text}`;
  
  UI.dialogueText.textContent = '';
  
  if (dialogue.action) {
    executeAction(dialogue.action, dialogue.skill, dialogue.delay);
  }
  
  UI.dialogueOptions.innerHTML = '';
  
  typeWriter(fullText, () => {
    const options = dialogue.getOptions ? dialogue.getOptions() : dialogue.options;
    
    const optionsHtml = options.map((option, index) => `
      <button class="dialogue-option" onclick="selectDialogueOption(${index})">
        ${option.text}
      </button>
    `).join('');
    
    UI.dialogueOptions.innerHTML = optionsHtml + `
      <button class="dialogue-option return" onclick="closeDialogue()">
        ← 返回
      </button>
    `;
  });
  
  UI.dialoguePanel.style.display = 'block';
  UI.npcSection.style.display = 'none';
}

/**
 * 打字机效果
 */
function typeWriter(text, callback) {
  let index = 0;
  UI.dialogueText.textContent = '';
  
  const timer = setInterval(() => {
    if (index < text.length) {
      UI.dialogueText.textContent += text.charAt(index);
      index++;
    } else {
      clearInterval(timer);
      if (callback) callback();
    }
  }, 50);
}

/**
 * 执行动作
 */
function executeAction(action, skillName, delay = false) {
  if (action === 'join_faction') {
    playerState.joinedFaction = true;
    showFloatText('✓ 加入正阳派', '#4caf50');
  } else if (action === 'learn_skill' && skillName) {
    if (!playerState.learnedSkills.includes(skillName)) {
      playerState.learnedSkills.push(skillName);
    }
    
    if (delay) {
      showLoadingDots(() => {
        showFloatText(`✓ 已学会 ${skillName}`, '#4caf50');
      });
    } else {
      showFloatText(`✓ 已学会 ${skillName}`, '#4caf50');
    }
  }
}

/**
 * 显示飘字效果
 */
function showFloatText(text, color) {
  const floatDiv = document.createElement('div');
  floatDiv.className = 'float-text';
  floatDiv.textContent = text;
  floatDiv.style.color = color;
  
  floatDiv.style.position = 'fixed';
  floatDiv.style.top = '50%';
  floatDiv.style.left = '50%';
  floatDiv.style.transform = 'translate(-50%, -50%)';
  floatDiv.style.fontSize = '28px';
  floatDiv.style.fontWeight = 'bold';
  floatDiv.style.textShadow = '0 0 15px rgba(76, 175, 80, 0.8)';
  floatDiv.style.zIndex = '9999';
  floatDiv.style.opacity = '0';
  floatDiv.style.transition = 'all 0.5s ease-out';
  
  document.body.appendChild(floatDiv);
  
  setTimeout(() => {
    floatDiv.style.opacity = '1';
  }, 50);
  
  setTimeout(() => {
    floatDiv.style.opacity = '0';
    floatDiv.style.transform = 'translate(-50%, -60%)';
  }, 2000);
  
  setTimeout(() => {
    document.body.removeChild(floatDiv);
  }, 3500);
}

/**
 * 显示加载中动画（在对话框中）
 */
function showLoadingDots(callback) {
  let dots = 0;
  const dotTimer = setInterval(() => {
    dots = (dots % 3) + 1;
    UI.dialogueText.textContent = UI.dialogueText.textContent.replace(/\.{1,3}$/, '') + '.'.repeat(dots);
  }, 600);
  
  setTimeout(() => {
    clearInterval(dotTimer);
    UI.dialogueText.textContent = UI.dialogueText.textContent.replace(/\.{1,3}$/, '');
    if (callback) callback();
  }, 4500);
}

/**
 * 选择对话选项
 */
function selectDialogueOption(optionIndex) {
  if (!currentNpc) return;
  
  const dialogue = currentNpc.dialogues[currentDialogue];
  const options = dialogue.getOptions ? dialogue.getOptions() : dialogue.options;
  const nextDialogue = options[optionIndex].next;
  
  if (nextDialogue && currentNpc.dialogues[nextDialogue]) {
    currentDialogue = nextDialogue;
    showDialogue();
  } else {
    closeDialogue();
  }
}

/**
 * 关闭对话
 */
function closeDialogue() {
  UI.dialoguePanel.style.display = 'none';
  currentDialogue = null;
  currentNpc = null;
  
  updateNpcList();
}

/**
 * 处理休息
 */
function handleRest() {
  const { locations } = window.gameMapData;
  const location = locations[window.gamePlayer.currentLocation];
  
  if (!location.isSafe) {
    alert('此地不宜久留，无法休息！');
    return;
  }

  const hpRestore = Math.floor(window.gamePlayer.maxHp * 0.3);
  const mpRestore = Math.floor(window.gamePlayer.maxMp * 0.3);
  
  window.gamePlayer.hp = Math.min(window.gamePlayer.maxHp, window.gamePlayer.hp + hpRestore);
  window.gamePlayer.mp = Math.min(window.gamePlayer.maxMp, window.gamePlayer.mp + mpRestore);
  
  alert(`\u4F11\u606F\u5B8C\u6210\uFF01\n\u6062\u590D\u4E86 ${hpRestore} 点生命\n\u6062\u590D\u4E86 ${mpRestore} 点内力`);
}

/**
 * 处理离开
 */
function handleLeave() {
  window.close();
}

// 暴露函数给全局
window.initMapUI = initMapUI;
window.goBackToWorldMap = goBackToWorldMap;
