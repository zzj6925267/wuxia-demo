// 任务系统主逻辑
let currentType = 'main'; // 默认显示主线（与 task.html 侧栏一致）
let selectedTaskId = null;

// DOM 元素
const UI = {
  taskList: document.getElementById('taskList'),
  taskDetail: document.getElementById('taskDetail'),
  currentTypeTitle: document.getElementById('currentTypeTitle'),
  btnClose: document.getElementById('btnClose')
};

// 同步侧栏高亮与标题（与 task.html 默认 currentType 一致）
function renderTaskTypes() {
  document.querySelectorAll('.task-type').forEach((el) => {
    el.classList.toggle('active', el.dataset.type === currentType);
  });
  if (typeof TASK_TYPE_CONFIG !== 'undefined' && TASK_TYPE_CONFIG[currentType]) {
    UI.currentTypeTitle.textContent = TASK_TYPE_CONFIG[currentType].name + '任务';
  }
}

function syncCompanionQuestFromStorage() {
  if (window.QingstoneCompanionQuest && QingstoneCompanionQuest.reconcileCompanionQuestChain) {
    QingstoneCompanionQuest.reconcileCompanionQuestChain();
  }
}

function applyTaskPageTypeFromUrl() {
  try {
    const type = new URLSearchParams(window.location.search).get('type');
    if (type && typeof TASK_TYPE_CONFIG !== 'undefined' && TASK_TYPE_CONFIG[type]) {
      currentType = type;
    } else {
      const st = JSON.parse(localStorage.getItem('playerState') || '{}');
      if (st.activeTasks && st.activeTasks.adv_companion_01 && !st.companionJoined) {
        currentType = 'adventure';
      }
    }
  } catch (e) {}
}

// 初始化
function init() {
  applyTaskPageTypeFromUrl();
  syncCompanionQuestFromStorage();
  bindEvents();
  renderTaskTypes();
  renderTaskList();
  renderTaskDetail();
  window.addEventListener('pageshow', function () {
    applyTaskPageTypeFromUrl();
    syncCompanionQuestFromStorage();
    renderTaskTypes();
    renderTaskList();
    renderTaskDetail();
  });
}

// 绑定事件
function bindEvents() {
  // 任务分类点击
  document.querySelectorAll('.task-type').forEach(el => {
    el.addEventListener('click', () => {
      const type = el.dataset.type;
      switchTaskType(type);
    });
  });

  // 离开按钮（若从小地图/嵌套正阳进入则回到原界面）
  UI.btnClose.addEventListener('click', () => {
    try {
      var ret = sessionStorage.getItem('game_ui_return_href');
      if (ret) {
        sessionStorage.removeItem('game_ui_return_href');
        window.location.href = ret;
        return;
      }
    } catch (e) {}
    window.history.back();
  });
}

// 切换任务类型
function switchTaskType(type) {
  currentType = type;
  selectedTaskId = null;
  
  // 更新分类高亮
  document.querySelectorAll('.task-type').forEach(el => {
    el.classList.toggle('active', el.dataset.type === type);
  });
  
  // 更新标题
  const typeConfig = TASK_TYPE_CONFIG[type];
  UI.currentTypeTitle.textContent = typeConfig.name + '任务';
  
  // 渲染任务列表
  renderTaskList();
  renderTaskDetail();
}

/** 奇遇《陌路相逢》：只显示链上当前一节（避免多节同时「已完成」误导） */
function getAdventureCompanionQuestSlice(adventureTasks, playerState) {
  const active = playerState.activeTasks || {};
  const companion = adventureTasks
    .filter(function (t) {
      return t.id && String(t.id).indexOf('adv_companion_') === 0;
    })
    .sort(function (a, b) {
      return (a.chainOrder || 0) - (b.chainOrder || 0);
    });
  const other = adventureTasks.filter(function (t) {
    return !t.id || String(t.id).indexOf('adv_companion_') !== 0;
  });
  let companionSlice = [];
  if (companion.length && active[companion[0].id]) {
    for (let i = 0; i < companion.length; i++) {
      const ts = active[companion[i].id];
      if (!ts || !(ts.completed || ts.isCompleted)) {
        companionSlice = [companion[i]];
        break;
      }
    }
    if (!companionSlice.length) {
      const last = companion[companion.length - 1];
      if (active[last.id]) companionSlice = [last];
    }
  }
  const otherDisplay = other.filter(function (task) {
    return active[task.id];
  });
  return companionSlice.concat(otherDisplay);
}

// 主线串行：只显示「当前」一条（按 chainOrder 首个未完成的）；全部完成后列表为空并提示
function getCurrentMainQuestSlice(sortedMain, playerState) {
  const active = playerState.activeTasks || {};
  const isDone = (id) => {
    const ts = active[id];
    return ts && (ts.completed || ts.isCompleted);
  };
  for (let i = 0; i < sortedMain.length; i++) {
    if (!isDone(sortedMain[i].id)) return [sortedMain[i]];
  }
  return [];
}

// 渲染任务列表
function renderTaskList() {
  const savedState = localStorage.getItem('playerState');
  let playerState = savedState ? JSON.parse(savedState) : {};
  
  if (!playerState.activeTasks) {
    playerState.activeTasks = {};
  }
  if (!playerState.completedFactionQuests) {
    playerState.completedFactionQuests = {};
  }
  
  let tasksInType = ALL_TASKS[currentType] || [];

  let displayTasks;
  if (currentType === 'main') {
    const sorted =
      tasksInType.length > 0
        ? [...tasksInType].sort((a, b) => (a.chainOrder || 0) - (b.chainOrder || 0))
        : [];
    displayTasks = getCurrentMainQuestSlice(sorted, playerState);
  } else if (currentType === 'adventure') {
    displayTasks = getAdventureCompanionQuestSlice(tasksInType, playerState);
  } else {
    const doneFq = playerState.completedFactionQuests || {};
    displayTasks = tasksInType.filter(
      (task) => playerState.activeTasks[task.id] || doneFq[task.id]
    );
  }

  if (displayTasks.length === 0) {
    const mains = ALL_TASKS.main || [];
    const isMainAllDone =
      currentType === 'main' &&
      mains.length > 0 &&
      mains.every(t => {
        const ts = playerState.activeTasks && playerState.activeTasks[t.id];
        return ts && (ts.completed || ts.isCompleted);
      });
    const tip =
      currentType === 'faction'
        ? (typeof isPlayerJoinedZhengyangFaction === 'function' && !isPlayerJoinedZhengyangFaction()
            ? '<p>暂无已领取的门派差事</p><p style="color:#888;font-size:13px;margin-top:8px;line-height:1.5;">须先至<strong>宁阳别院</strong>找苏瑶师妹<strong>加入正阳派</strong>，再到<strong>澄心堂</strong>向赵长老领取差事。</p>'
            : '<p>暂无已领取的门派差事</p><p style="color:#888;font-size:13px;margin-top:8px;line-height:1.5;">请至<strong>正阳派 · 澄心堂</strong>找赵长老领取。「领取」只登记差事；须达成目标后<strong>再回澄心堂向赵长老交差</strong>，该条方算完成并获得贡献。三门派差事任领其一或轮换均可，并非「点领即完成」。</p>')
        : isMainAllDone
          ? '<p>主线已定，江湖路远。</p><p style="color:#888;font-size:13px;margin-top:8px;">当前章节皆已完成。</p>'
          : '<p>暂无任务</p>';
    UI.taskList.innerHTML = `
      <div class="no-tasks">
        <div class="no-tasks-icon">${isMainAllDone ? '✨' : '📭'}</div>
        ${tip}
      </div>
    `;
    if (currentType === 'main') selectedTaskId = null;
    renderTaskDetail();
    return;
  }

  if (currentType === 'main') {
    if (!selectedTaskId || !displayTasks.some(t => t.id === selectedTaskId)) {
      selectedTaskId = displayTasks[0].id;
    }
  } else if (displayTasks.length > 0) {
    if (!selectedTaskId || !displayTasks.some((t) => t.id === selectedTaskId)) {
      selectedTaskId = displayTasks[0].id;
    }
  }
  
  const doneFq = playerState.completedFactionQuests || {};
  UI.taskList.innerHTML = displayTasks.map(task => {
    const taskState = playerState.activeTasks[task.id] || doneFq[task.id];
    const isCompleted = !!(taskState && (taskState.completed || taskState.isCompleted));
    const progress = getTaskProgress(task, taskState);
    
    return `
      <div class="task-card ${isCompleted ? 'completed' : ''} ${selectedTaskId === task.id ? 'active' : ''}" 
           onclick="selectTask('${task.id}')">
        <div class="task-card-header">
          <div class="task-name">${task.name}</div>
          <div class="task-status ${isCompleted ? 'completed' : 'accepted'}">
            ${isCompleted ? '已完成' : '进行中'}
          </div>
        </div>
        <div class="task-description">${task.description}</div>
        ${!isCompleted ? `
          <div class="task-progress">
            <div class="task-progress-bar" style="width: ${progress.percent}%"></div>
          </div>
          <div class="task-progress-text">${progress.text}</div>
        ` : ''}
      </div>
    `;
  }).join('');

  renderTaskDetail();
}

// 获取任务进度
function getTaskProgress(task, taskState) {
  const storyTotal = task.target && task.target.type === 'story' ? task.target.count || 1 : 0;

  if (!taskState) {
    if (storyTotal) {
      return { percent: 0, text: `0/${storyTotal}` };
    }
    return { percent: 0, text: '0/0' };
  }

  let current = 0;
  let total = 1;

  if (task.target.type === 'collect') {
    total = task.target.count;
    current = taskState.collected || 0;
  } else if (task.target.type === 'kill') {
    total = task.target.count;
    current = taskState.killCount || 0;
  } else if (task.target.type === 'organize') {
    total = 1;
    current = (taskState.completed || taskState.isCompleted) ? 1 : 0;
  } else if (task.target.type === 'main_step') {
    total = task.target.count || 1;
    current = taskState && (taskState.completed || taskState.isCompleted) ? 1 : 0;
  } else if (task.target.type === 'story') {
    total = task.target.count || 1;
    current = (taskState.completed || taskState.isCompleted) ? total : 0;
  }
  
  const percent = Math.min((current / total) * 100, 100);
  
  return {
    percent: percent,
    text: `${current}/${total}`
  };
}

// 选择任务
function selectTask(taskId) {
  selectedTaskId = taskId;
  renderTaskList();
  renderTaskDetail();
}

// 渲染任务详情
function renderTaskDetail() {
  if (!selectedTaskId) {
    UI.taskDetail.innerHTML = `
      <div class="empty-detail">
        <div class="empty-icon">📋</div>
        <p>请选择任务查看详情</p>
      </div>
    `;
    return;
  }
  
  // 查找任务数据
  let task = null;
  for (const type in ALL_TASKS) {
    const found = ALL_TASKS[type].find(t => t.id === selectedTaskId);
    if (found) {
      task = found;
      break;
    }
  }
  
  if (!task) {
    UI.taskDetail.innerHTML = `
      <div class="empty-detail">
        <div class="empty-icon">❓</div>
        <p>任务不存在</p>
      </div>
    `;
    return;
  }
  
  const savedState = localStorage.getItem('playerState');
  let playerState = savedState ? JSON.parse(savedState) : {};
  if (!playerState.completedFactionQuests) playerState.completedFactionQuests = {};
  const doneFq = playerState.completedFactionQuests;
  const taskState =
    (playerState.activeTasks && playerState.activeTasks[task.id]) || doneFq[task.id];
  const isCompleted = !!(taskState && (taskState.completed || taskState.isCompleted));
  const typeConfig = TASK_TYPE_CONFIG[task.type];
  const progress = getTaskProgress(task, taskState);
  const turnedContrib =
    task.type === 'faction' && doneFq[task.id] && doneFq[task.id].contribution
      ? doneFq[task.id].contribution
      : 0;

  UI.taskDetail.innerHTML = `
    <div class="task-detail-content">
      <div class="detail-header">
        <div class="detail-name">${task.name}</div>
        <div class="detail-type-badge" style="background: ${typeConfig.color}">
          ${typeConfig.icon} ${typeConfig.name}
        </div>
      </div>
      
      <div class="detail-section">
        <div class="detail-section-title">任务描述</div>
        <div class="detail-desc">${task.description}</div>
      </div>
      
      ${turnedContrib ? `
        <div class="detail-section">
          <div class="detail-section-title">交付记录</div>
          <div class="detail-desc" style="color:#a5d6a7;">已向赵长老交差，已获得 <strong>${turnedContrib}</strong> 点门派贡献。</div>
        </div>
      ` : ''}
      
      ${task.location ? `
        <div class="detail-section">
          <div class="detail-section-title">任务地点</div>
          <div class="detail-location">
            <span>📍</span>
            <span>${task.location}</span>
          </div>
        </div>
      ` : ''}
      
      ${!isCompleted ? `
        <div class="detail-section">
          <div class="detail-section-title">任务进度</div>
          <div class="task-progress">
            <div class="task-progress-bar" style="width: ${progress.percent}%"></div>
          </div>
          <div class="task-progress-text">${progress.text}</div>
        </div>
      ` : ''}
      
      <div class="detail-section">
        <div class="detail-section-title">任务奖励</div>
        <div class="detail-rewards">
          ${task.rewards.map(reward => `
            <div class="reward-item">
              <span class="reward-icon">${getRewardIcon(reward.type)}</span>
              <span class="reward-name">${getRewardDisplayName(reward)}</span>
              <span class="reward-value">+${reward.value}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function getRewardDisplayName(reward) {
  if (reward && reward.type === 'yueli') {
    return typeof getMartialPracticeDisplayName === 'function'
      ? getMartialPracticeDisplayName()
      : '历练';
  }
  if (reward && reward.type === 'exp') {
    return typeof getCharLevelExpDisplayName === 'function'
      ? getCharLevelExpDisplayName()
      : '经验';
  }
  return reward && reward.name != null ? reward.name : '';
}

// 获取奖励图标
function getRewardIcon(type) {
  switch (type) {
    case 'contribution': return '⭐';
    case 'gold': return '💰';
    case 'exp': return '✨';
    case 'yueli': return '📖';
    case 'item': return '📦';
    default: return '🎁';
  }
}

// 页面加载后初始化
window.addEventListener('DOMContentLoaded', init);
