// 任务系统主逻辑
let currentType = 'faction'; // 默认显示门派任务
let selectedTaskId = null;

// DOM 元素
const UI = {
  taskList: document.getElementById('taskList'),
  taskDetail: document.getElementById('taskDetail'),
  currentTypeTitle: document.getElementById('currentTypeTitle'),
  btnClose: document.getElementById('btnClose')
};

// 初始化
function init() {
  bindEvents();
  renderTaskTypes();
  renderTaskList();
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

  // 离开按钮
  UI.btnClose.addEventListener('click', () => {
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

// 渲染任务列表
function renderTaskList() {
  const savedState = localStorage.getItem('playerState');
  let playerState = savedState ? JSON.parse(savedState) : {};
  
  if (!playerState.activeTasks) {
    playerState.activeTasks = {};
  }
  
  const tasksInType = ALL_TASKS[currentType] || [];
  
  // 只显示已接取的任务（主线除外）
  const displayTasks = tasksInType.filter(task => {
    if (currentType === 'main') {
      return true; // 主线任务始终显示
    }
    return playerState.activeTasks[task.id]; // 只显示已接取的
  });
  
  if (displayTasks.length === 0) {
    UI.taskList.innerHTML = `
      <div class="no-tasks">
        <div class="no-tasks-icon">📭</div>
        <p>暂无任务</p>
      </div>
    `;
    return;
  }
  
  UI.taskList.innerHTML = displayTasks.map(task => {
    const taskState = playerState.activeTasks[task.id];
    const isCompleted = taskState && (taskState.completed || taskState.isCompleted);
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
}

// 获取任务进度
function getTaskProgress(task, taskState) {
  if (!taskState) {
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
    current = taskState.completed || taskState.isCompleted ? 1 : 0;
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
  const taskState = playerState.activeTasks && playerState.activeTasks[task.id];
  const isCompleted = taskState && (taskState.completed || taskState.isCompleted);
  const typeConfig = TASK_TYPE_CONFIG[task.type];
  const progress = getTaskProgress(task, taskState);
  
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
              <span class="reward-name">${reward.name}</span>
              <span class="reward-value">+${reward.value}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// 获取奖励图标
function getRewardIcon(type) {
  switch (type) {
    case 'contribution': return '⭐';
    case 'gold': return '💰';
    case 'exp': return '✨';
    case 'item': return '📦';
    default: return '🎁';
  }
}

// 页面加载后初始化
window.addEventListener('DOMContentLoaded', init);
