/**
 * 地图UI组件
 */

/**
 * 从嵌套正阳打开背包/武学/任务前写入 sessionStorage，关闭子页时回到 map 并恢复正阳视图。
 */
function rememberReturnContextIfZhengyangOrSubmapPage() {
  try {
    var zy = document.getElementById('zhengyangMap');
    if (zy) {
      var disp = window.getComputedStyle(zy).display;
      if (disp !== 'none') {
        sessionStorage.setItem('game_ui_return_href', 'map.html');
        sessionStorage.setItem('game_map_restore_view', 'zhengyang');
      }
    }
  } catch (e) {}
}

/**
 * 从 inventory / martialArts / task 返回 map.html 后，若之前在嵌套正阳则恢复正阳视图。
 */
function tryRestoreMapViewAfterReturn() {
  try {
    var v = sessionStorage.getItem('game_map_restore_view');
    if (v === 'zhengyang' && UI.zhengyangMap && UI.worldMap) {
      sessionStorage.removeItem('game_map_restore_view');
      enterZhengyangMap();
    }
  } catch (e) {}
  try {
    document.documentElement.classList.remove('map-restore-zhengyang');
  } catch (e2) {}
}

// 打开武学系统（与 martialArts.js 一致：类型走 localStorage.martialArtsType）
function openMartialArts(type) {
  rememberReturnContextIfZhengyangOrSubmapPage();
  if (type) {
    try {
      localStorage.setItem('martialArtsType', type);
    } catch (e) {}
  }
  window.location.href = 'martialArts.html';
}

// 打开背包系统
function openInventory() {
  rememberReturnContextIfZhengyangOrSubmapPage();
  window.location.href = 'inventory.html';
}

/** 正阳派内上次所在建筑（sessionStorage），避免每次进山都回到山门又见不到 NPC */
const ZHENGYANG_LAST_BUILDING_KEY = 'zhengyang_last_building_id';

// 当前正阳派位置（默认在门派入口；进入时会尝试恢复上次位置）
let currentZhengyangBuilding = 'menkou';

// 当前对话状态
let currentDialogue = null;
let currentNpc = null;

// 飘字队列
let floatTextQueue = [];
let isShowingFloatText = false;

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
  
  UI.btnExplore.textContent =
    location.id === 'zhengyang_clan'
      ? '进入门派'
      : location.id === 'forest'
        ? '探索山林'
        : location.id === 'qingstone_town'
          ? '进入青石镇'
          : '探索此地';
}

/**
 * 处理探索/进入门派
 */
function handleExplore() {
  const { locations } = window.gameMapData;
  const location = locations[window.gamePlayer.currentLocation];
  
  if (location.id === 'zhengyang_clan') {
    enterZhengyangMap();
  } else if (location.id === 'forest') {
    window.location.href = 'forest_map.html';
  } else if (location.id === 'qingstone_town') {
    window.location.href = 'qingstone_map.html';
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
  let saved = '';
  try {
    saved = sessionStorage.getItem(ZHENGYANG_LAST_BUILDING_KEY) || '';
  } catch (e) {}
  currentZhengyangBuilding =
    saved && typeof ZHENGYANG_BUILDINGS !== 'undefined' && ZHENGYANG_BUILDINGS[saved] ? saved : 'menkou';
  UI.worldMap.style.display = 'none';
  UI.zhengyangMap.style.display = 'flex';
  renderZhengyangMap();
  updateZhengyangPanel();
}

/**
 * 返回大地图
 */
function goBackToWorldMap() {
  // 离开门派前先关闭对话面板
  closeDialogue();
  
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
  // 移动前先关闭对话面板，清除状态
  closeDialogue();
  
  currentZhengyangBuilding = buildingId;
  try {
    sessionStorage.setItem(ZHENGYANG_LAST_BUILDING_KEY, buildingId);
  } catch (e) {}
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
    UI.npcSection.style.display = 'block';
    UI.npcList.innerHTML = `
      <div class="npc-hint" style="padding:10px 12px;font-size:13px;color:#bbb;line-height:1.55;border-radius:8px;background:rgba(0,0,0,0.25);">
        当前位置暂无对话人物。执事长老<strong style="color:#e8d89a;">赵恪</strong>在<strong style="color:#e8d89a;">澄心堂</strong>；请点击上方地图中<strong>相邻可前往</strong>的地点，沿路走到澄心堂后再与长老对话、领交门派差事。
      </div>
    `;
  }
}

/**
 * 开始对话
 */
function startDialogue(npcId) {
  currentNpc = ZHENGYANG_NPCS[npcId];
  currentDialogue = 'default';
  
  // 重新加载玩家状态，确保贡献显示是最新的
  if (typeof loadPlayerState === 'function') {
    loadPlayerState();
  }
  
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
 * 显示飘字效果（带队列防止重叠）
 */
function showFloatText(text, color) {
  // 添加到队列
  floatTextQueue.push({ text, color });
  
  // 如果没有正在显示的飘字，直接显示
  if (!isShowingFloatText) {
    processFloatTextQueue();
  }
}

// 处理飘字队列
function processFloatTextQueue() {
  if (floatTextQueue.length === 0) {
    isShowingFloatText = false;
    return;
  }
  
  isShowingFloatText = true;
  const { text, color } = floatTextQueue.shift();
  
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
    // 当前飘字显示完，处理下一个
    processFloatTextQueue();
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
  const selectedOption = options[optionIndex];
  const nextDialogue = selectedOption.next;
  
  // 检查选项是否有单独的 action
  if (selectedOption.action) {
    if (selectedOption.action === 'startOrganizeBooks') {
      // 直接调用整理书籍函数
      startOrganizeBooks();
      return; // 不继续跳转
    }
    // 其他选项 action 可以在这里添加
  }
  // 如果是学习技能的确认对话框
  else if (dialogue.action === 'learn_skill') {
    // 只有点击"确定！"选项时才执行学习技能
    if (selectedOption.text === '确定！') {
      handleDialogueAction(dialogue, () => {
        if (nextDialogue && currentNpc.dialogues[nextDialogue]) {
          currentDialogue = nextDialogue;
          showDialogue();
        } else {
          closeDialogue();
        }
      });
    } else {
      // 点击"我再想想"或其他选项，直接跳转
      if (nextDialogue && currentNpc.dialogues[nextDialogue]) {
        currentDialogue = nextDialogue;
        showDialogue();
      } else {
        closeDialogue();
      }
    }
  } else {
    // 处理其他动作
    if (dialogue.action) {
      handleDialogueAction(dialogue);
    }
    
    if (nextDialogue && currentNpc.dialogues[nextDialogue]) {
      currentDialogue = nextDialogue;
      showDialogue();
    } else {
      closeDialogue();
    }
  }
}

/**
 * 处理对话动作
 * 返回是否成功处理（false表示需要停留在当前对话）
 */
function handleDialogueAction(dialogue, callback) {
  const action = dialogue.action;
  
  if (action === 'join_faction') {
    // 检查是否已经加入门派
    if (!playerState.joinedFaction) {
      playerState.joinedFaction = true;
      // 保存状态到localStorage
      const savedState = localStorage.getItem('playerState');
      let state = savedState ? JSON.parse(savedState) : {};
      
      // 确保所有必要的属性都存在
      state.joinedFaction = true;
      if (!state.learnedSkills) state.learnedSkills = [];
      if (state.factionContribution === undefined) state.factionContribution = 0;
      if (!state.activeTasks) state.activeTasks = {};
      
      localStorage.setItem('playerState', JSON.stringify(state));
      showFloatText('✓ 加入正阳派', '#4caf50');
      if (typeof window.onMainQuestJoinedFaction === 'function') {
        window.onMainQuestJoinedFaction();
      }
    }
  } else if (action === 'learn_skill' && dialogue.skill) {
    // 从localStorage获取玩家状态
    const savedState = localStorage.getItem('playerState');
    let playerStateFromStorage = savedState ? JSON.parse(savedState) : {};
    
    // 确保所有必要的属性都存在
    if (!playerStateFromStorage.learnedSkills) playerStateFromStorage.learnedSkills = [];
    if (playerStateFromStorage.factionContribution === undefined) playerStateFromStorage.factionContribution = 0;
    
    // 检查是否已经学会
    if (playerStateFromStorage.learnedSkills.includes(dialogue.skill)) {
      showFloatText('你已经学会这个技能了', '#ff9800');
      // 不继续跳转，让用户留在当前对话
      return;
    }
    
    // 检查贡献是否足够
    // 与 taskData 门派三条差事对齐：采药28+剿匪58+理书38=124/轮；连做三轮（各任务接交共9次）≈372，换一门入门武
    const skillCost = 372; // 3×(28+58+38)
    if (playerStateFromStorage.factionContribution < skillCost) {
      showFloatText(`贡献不足！需要${skillCost}贡献`, '#f44336');
      // 不继续跳转，让用户留在当前对话
      return;
    }
    
    // 扣除贡献
    playerStateFromStorage.factionContribution -= skillCost;
    
    // 学习技能
    playerStateFromStorage.learnedSkills.push(dialogue.skill);
    
    // 保存到localStorage
    localStorage.setItem('playerState', JSON.stringify(playerStateFromStorage));
    
    // 更新当前playerState
    playerState.learnedSkills = playerStateFromStorage.learnedSkills;
    playerState.factionContribution = playerStateFromStorage.factionContribution;

    tryCompleteMainB07AfterLearnSkill();

    // 先显示教学文字
    let teachingText = '';
    if (dialogue.skill === '正阳基础剑式') {
      teachingText = '好，我来教你正阳基础剑式的要诀...看好了...';
    } else if (dialogue.skill === '正阳吐纳诀') {
      teachingText = '正阳吐纳诀是我们门派的基础内功，来，跟着我一起调息...';
    } else if (dialogue.skill === '踏云步') {
      teachingText = '踏云步是一门轻盈的轻功，身法飘逸，来，我示范一遍给你看...';
    }
    UI.dialogueText.textContent = `${currentNpc.name}：${teachingText}`;
    
    if (dialogue.delay) {
      showLoadingDots(() => {
        showFloatText(`✓ 已学会 ${dialogue.skill}`, '#4caf50');
        if (callback) callback();
      });
    } else {
      showFloatText(`✓ 已学会 ${dialogue.skill}`, '#4caf50');
      if (callback) callback();
    }
  } else if (action === 'accept_task') {
    // 接受任务
    acceptTask(dialogue.task, dialogue.reward);
  } else if (action === 'complete_single_task') {
    // 完成单个任务并领取奖励
    completeSingleTask(dialogue.task);
  } else if (action === 'complete_main_b_07_report') {
    tryCompleteMainB07IfAllEntrySkillsKnown();
  } else if (action === 'organize_books') {
    // 整理书籍任务
    startOrganizeBooks(callback);
    return; // 不自动跳转
  }
}

/**
 * 接受任务
 */
function acceptTask(taskId, reward) {
  // 从localStorage获取玩家状态
  const savedState = localStorage.getItem('playerState');
  let playerState = savedState ? JSON.parse(savedState) : {};
  
  // 确保activeTasks存在
  if (!playerState.activeTasks) {
    playerState.activeTasks = {};
  }
  if (!playerState.completedFactionQuests) {
    playerState.completedFactionQuests = {};
  }
  
  // 检查任务是否已接取
  if (playerState.activeTasks[taskId]) {
    showFloatText('该任务已接取', '#f44336');
    return;
  }

  // 新接同一门派差事时去掉旧的「已交差」记录，避免任务页仍显示已完成
  delete playerState.completedFactionQuests[taskId];
  
  // 初始化任务进度
  const taskData = {
    collected: 0,
    completed: false,
    reward: reward
  };
  
  // 根据任务类型设置目标
  if (taskId === 'bandit_clear') {
    // 山贼任务需要特殊处理
    playerState.activeTasks[taskId] = {
      killCount: 0,
      targetKill: 3,
      isCompleted: false,
      reward: reward
    };
  } else if (taskId === 'collect_herbs') {
    // 采集任务
    playerState.activeTasks[taskId] = taskData;
  } else {
    // 其他任务
    playerState.activeTasks[taskId] = {
      completed: false,
      reward: reward
    };
  }
  
  showFloatText('✓ 任务已接取', '#4caf50');

  // 保存状态
  localStorage.setItem('playerState', JSON.stringify(playerState));
  if (typeof loadPlayerState === 'function') {
    loadPlayerState();
  }
  // 「整理书籍」须等藏经楼内摆书完成后再记主线「贡献与艺」，避免刚接任务就飘主线达成被误认为书已整理好
  if (taskId !== 'organize_books') {
    tryCompleteMainB05AfterFactionAccept(taskId);
  }
}

const FACTION_TASK_IDS = ['collect_herbs', 'bandit_clear', 'organize_books'];

function isMainQuestStepDoneMq(state, questId) {
  const t = state.activeTasks && state.activeTasks[questId];
  return !!(t && (t.completed || t.isCompleted));
}

function markMainQuestStepMq(questId) {
  if (typeof ALL_TASKS === 'undefined' || !ALL_TASKS.main) return false;
  const raw = localStorage.getItem('playerState');
  const state = raw ? JSON.parse(raw) : {};
  if (!state.activeTasks) state.activeTasks = {};
  const cur = state.activeTasks[questId];
  if (cur && (cur.completed || cur.isCompleted)) return false;
  state.activeTasks[questId] = Object.assign({}, cur, { completed: true, isCompleted: true });
  localStorage.setItem('playerState', JSON.stringify(state));
  if (typeof loadPlayerState === 'function') {
    loadPlayerState();
  }
  return true;
}

function applyMainQuestRewardsMq(questId) {
  if (typeof ALL_TASKS === 'undefined' || !ALL_TASKS.main) return;
  const task = ALL_TASKS.main.find((t) => t.id === questId);
  if (!task || !task.rewards) return;
  const saveData = localStorage.getItem('game_save_0');
  if (!saveData) return;
  try {
    const save = JSON.parse(saveData);
    if (!save.player) return;
    task.rewards.forEach((r) => {
      const v = parseInt(r.value, 10) || 0;
      if (!v) return;
      if (r.type === 'gold') save.player.gold = (save.player.gold || 0) + v;
      else if (r.type === 'yueli' || r.type === 'exp') save.player.exp = (save.player.exp || 0) + v;
    });
    localStorage.setItem('game_save_0', JSON.stringify(save));
    const goldEl = document.getElementById('goldValue');
    if (goldEl) goldEl.textContent = save.player.gold;
  } catch (e) {
    console.warn('applyMainQuestRewardsMq', e);
  }
}

function floatMainQuestRewardsMq(questId) {
  if (typeof ALL_TASKS === 'undefined' || !ALL_TASKS.main) return;
  const task = ALL_TASKS.main.find((t) => t.id === questId);
  if (!task || !task.rewards) return;
  showFloatText(`主线 · 「${task.name}」达成`, '#FFD700');
  let delay = 500;
  task.rewards.forEach((r) => {
    const v = parseInt(r.value, 10) || 0;
    if (!v) return;
    let color = '#f4d03f';
    if (r.type === 'gold') color = '#ff9800';
    else if (r.type === 'exp') color = '#ffeb3b';
    else if (r.type === 'yueli') color = '#9c27b0';
    const label = `${r.name || '奖励'} +${v}`;
    setTimeout(() => showFloatText(label, color), delay);
    delay += 450;
  });
}

/** 在澄心堂首次领取三门派差事之一后，推进主线「贡献与艺」 */
function tryCompleteMainB05AfterFactionAccept(taskId) {
  if (!FACTION_TASK_IDS.includes(taskId)) return;
  const state = JSON.parse(localStorage.getItem('playerState') || '{}');
  if (!isMainQuestStepDoneMq(state, 'main_b_04')) return;
  if (isMainQuestStepDoneMq(state, 'main_b_05')) return;
  if (markMainQuestStepMq('main_b_05')) {
    applyMainQuestRewardsMq('main_b_05');
    floatMainQuestRewardsMq('main_b_05');
  }
}

/**
 * 首次向赵长老交差成功后：补记主线「贡献与艺」（若缺）并推进「三事九回」
 */
function tryAdvanceMainQuestOnFactionTurnIn(taskId) {
  if (!FACTION_TASK_IDS.includes(taskId)) return;
  let state = JSON.parse(localStorage.getItem('playerState') || '{}');
  if (!isMainQuestStepDoneMq(state, 'main_b_04')) return;
  if (!isMainQuestStepDoneMq(state, 'main_b_05')) {
    if (markMainQuestStepMq('main_b_05')) {
      applyMainQuestRewardsMq('main_b_05');
      floatMainQuestRewardsMq('main_b_05');
    }
  }
  state = JSON.parse(localStorage.getItem('playerState') || '{}');
  if (!isMainQuestStepDoneMq(state, 'main_b_05')) return;
  if (isMainQuestStepDoneMq(state, 'main_b_06')) return;
  if (markMainQuestStepMq('main_b_06')) {
    applyMainQuestRewardsMq('main_b_06');
    floatMainQuestRewardsMq('main_b_06');
  }
}

/** 苏瑶处成功学会任一门入门武式后，推进主线「授式入门」(main_b_07) */
function tryCompleteMainB07AfterLearnSkill() {
  if (typeof ALL_TASKS === 'undefined' || !ALL_TASKS.main) return;
  const state = JSON.parse(localStorage.getItem('playerState') || '{}');
  if (!isMainQuestStepDoneMq(state, 'main_b_06')) return;
  if (isMainQuestStepDoneMq(state, 'main_b_07')) return;
  if (markMainQuestStepMq('main_b_07')) {
    applyMainQuestRewardsMq('main_b_07');
    floatMainQuestRewardsMq('main_b_07');
  }
}

/**
 * 若 learnedSkills 已含三门入门（例如武学页版本清档后仍保留苏瑶传授记录），
 * 与苏瑶对话「复命」可补记 main_b_07，避免卡关。
 */
function tryCompleteMainB07IfAllEntrySkillsKnown() {
  const state = JSON.parse(localStorage.getItem('playerState') || '{}');
  const skills = state.learnedSkills || [];
  const need = ['正阳基础剑式', '正阳吐纳诀', '踏云步'];
  if (!need.every((s) => skills.includes(s))) {
    showFloatText('尚未学全三门入门武学，无法复命。', '#f44336');
    return false;
  }
  if (!isMainQuestStepDoneMq(state, 'main_b_06')) {
    showFloatText('主线未到「授式入门」阶段。', '#f44336');
    return false;
  }
  if (isMainQuestStepDoneMq(state, 'main_b_07')) {
    showFloatText('主线「授式入门」已完成。', '#ff9800');
    return false;
  }
  if (markMainQuestStepMq('main_b_07')) {
    applyMainQuestRewardsMq('main_b_07');
    floatMainQuestRewardsMq('main_b_07');
    return true;
  }
  return false;
}

/**
 * 完成单个任务并领取奖励
 */
function completeSingleTask(taskId) {
  // 从localStorage获取玩家状态
  const savedState = localStorage.getItem('playerState');
  if (!savedState) return;
  
  let playerState = JSON.parse(savedState);
  
  // 确保activeTasks和factionContribution存在
  if (!playerState.activeTasks) playerState.activeTasks = {};
  if (!playerState.factionContribution) playerState.factionContribution = 0;
  
  // 获取任务
  const task = playerState.activeTasks[taskId];
  if (!task) {
    showFloatText('未找到该差事记录，或已结算。', '#f44336');
    return;
  }
  
  // 检查任务是否完成（两种标记方式都支持）
  const isTaskCompleted = task.completed || task.isCompleted;
  if (!isTaskCompleted) {
    showFloatText('差事尚未办妥，请完成目标后再回澄心堂复命。', '#f44336');
    return;
  }
  
  // 如果是采集任务，扣除对应物品
  if (taskId === 'collect_herbs') {
    const itemId = 'lingzhi_cao';
    const needToRemove = 5;
    let remainingToRemove = needToRemove;
    
    // 读取playerData（背包）
    let playerData = null;
    try {
      const savedPlayerData = localStorage.getItem('playerData');
      if (savedPlayerData) {
        playerData = JSON.parse(savedPlayerData);
      }
    } catch (e) {
      console.error('读取playerData失败:', e);
    }
    
    if (playerData && playerData.inventory) {
      // 从后往前遍历，优先扣减数量少的格子
      for (let i = playerData.inventory.length - 1; i >= 0 && remainingToRemove > 0; i--) {
        const item = playerData.inventory[i];
        if (item.id === itemId) {
          if (item.quantity <= remainingToRemove) {
            // 这个格子全扣完，删除该格子
            remainingToRemove -= item.quantity;
            playerData.inventory.splice(i, 1);
          } else {
            // 扣减部分数量
            item.quantity -= remainingToRemove;
            remainingToRemove = 0;
          }
        }
      }
      
      // 保存更新后的playerData
      localStorage.setItem('playerData', JSON.stringify(playerData));
      console.log(`已扣除 ${needToRemove - remainingToRemove} 个灵芝草`);
    }
  }
  
  // 发放奖励
  let reward = 0;
  if (task.reward && task.reward.contribution) {
    reward = task.reward.contribution;
    playerState.factionContribution += reward;
    showFloatText(`🎉 获得 ${reward} 门派贡献`, '#4caf50');
  }

  if (!playerState.completedFactionQuests) playerState.completedFactionQuests = {};
  playerState.completedFactionQuests[taskId] = {
    completed: true,
    isCompleted: true,
    contribution: reward || 0,
    turnedInAt: Date.now()
  };

  // 删除已领取中的条目（任务页改看 completedFactionQuests 显示「已完成」）
  delete playerState.activeTasks[taskId];
  
  // 保存状态
  localStorage.setItem('playerState', JSON.stringify(playerState));
  if (typeof loadPlayerState === 'function') {
    loadPlayerState();
  }
  tryAdvanceMainQuestOnFactionTurnIn(taskId);
}

/**
 * 保存玩家状态
 */
function savePlayerState() {
  localStorage.setItem('playerState', JSON.stringify(playerState));
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

/**
 * 将「整理藏经楼书籍」标为已完成并写入存档（与秦松处整理动画结束时调用）
 */
function markOrganizeBooksTaskCompleteInStorage() {
  try {
    const raw = localStorage.getItem('playerState');
    const state = raw ? JSON.parse(raw) : {};
    if (!state.activeTasks) state.activeTasks = {};
    const t = state.activeTasks.organize_books;
    if (!t) {
      console.warn('markOrganizeBooksTaskCompleteInStorage: 未接取整理差事');
      return false;
    }
    if (t.completed || t.isCompleted) {
      tryCompleteMainB05AfterFactionAccept('organize_books');
      return true;
    }
    t.completed = true;
    t.isCompleted = true;
    localStorage.setItem('playerState', JSON.stringify(state));
    if (typeof loadPlayerState === 'function') {
      loadPlayerState();
    }
    tryCompleteMainB05AfterFactionAccept('organize_books');
    return true;
  } catch (e) {
    console.error('markOrganizeBooksTaskCompleteInStorage', e);
    return false;
  }
}

/**
 * 整理书籍任务（三段话动画）
 */
function startOrganizeBooks() {
  let st = {};
  try {
    const raw = localStorage.getItem('playerState');
    st = raw ? JSON.parse(raw) : {};
  } catch (e) {
    st = {};
  }
  if (!st.activeTasks || !st.activeTasks.organize_books) {
    return;
  }
  const ob = st.activeTasks.organize_books;
  if (ob.completed || ob.isCompleted) {
    return;
  }

  // 隐藏选项，显示整理过程
  UI.dialogueOptions.innerHTML = '';
  
  // 第一段：3秒
  UI.dialogueText.textContent = '你将散落的《武当剑法》《纯阳内功》整理好放到书架上...';
  let dots = 0;
  const dotTimer1 = setInterval(() => {
    dots = (dots % 3) + 1;
    UI.dialogueText.textContent = '你将散落的《武当剑法》《纯阳内功》整理好放到书架上' + '.'.repeat(dots);
  }, 600);
  
  setTimeout(() => {
    clearInterval(dotTimer1);
    
    // 第二段：3秒
    UI.dialogueText.textContent = '你小心翼翼地拂去《太极心法》上的灰尘，把它摆到最显眼的位置...';
    dots = 0;
    const dotTimer2 = setInterval(() => {
      dots = (dots % 3) + 1;
      UI.dialogueText.textContent = '你小心翼翼地拂去《太极心法》上的灰尘，把它摆到最显眼的位置' + '.'.repeat(dots);
    }, 600);
    
    setTimeout(() => {
      clearInterval(dotTimer2);
      
      // 第三段：3秒
      UI.dialogueText.textContent = '最后一本《易筋经》也放好了，书籍整整齐齐排列在书架上！';
      dots = 0;
      const dotTimer3 = setInterval(() => {
        dots = (dots % 3) + 1;
        UI.dialogueText.textContent = '最后一本《易筋经》也放好了，书籍整整齐齐排列在书架上' + '.'.repeat(dots);
      }, 600);
      
      setTimeout(() => {
        clearInterval(dotTimer3);
        
        markOrganizeBooksTaskCompleteInStorage();
        
        try {
          if (currentNpc && currentNpc.dialogues) {
            currentDialogue = 'default';
            const dialogue = currentNpc.dialogues[currentDialogue];
            const text = dialogue.getText ? dialogue.getText() : dialogue.text;
            const fullText = `${currentNpc.name}：${text}`;
            UI.dialogueText.textContent = fullText;
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
          }
        } catch (e) {
          console.error('startOrganizeBooks refresh dialogue', e);
        }
      }, 3000);
    }, 3000);
  }, 3000);
}

// 打开任务系统
function openTask() {
  rememberReturnContextIfZhengyangOrSubmapPage();
  window.location.href = 'task.html';
}

// 暴露函数给全局
window.initMapUI = initMapUI;
window.goBackToWorldMap = goBackToWorldMap;
window.openTask = openTask;
window.tryRestoreMapViewAfterReturn = tryRestoreMapViewAfterReturn;
