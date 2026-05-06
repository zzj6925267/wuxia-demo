// 武学系统逻辑

let currentType = '武功';
let selectedMartialArt = null;

// 图标映射
const TYPE_ICONS = {
  '武功': '⚔️',
  '内功': '📿',
  '轻功': '👟'
};

const RANK_CLASSES = {
  '初阶': 'rank-chu-jie',
  '中阶': 'rank-zhong-jie',
  '高阶': 'rank-gao-jie',
  '绝阶': 'rank-jue-jie'
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  initPage();
});

function initPage() {
  // 渲染角色选择器
  renderCharacterList();

  // 读取URL参数
  const urlParams = new URLSearchParams(window.location.search);
  const typeParam = urlParams.get('type');
  if (typeParam) {
    currentType = typeParam;
    document.querySelectorAll('.type-tab').forEach(tab => {
      if (tab.dataset.type === currentType) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  }

  // 更新阅历显示
  document.getElementById('playerExp').textContent = playerExperience;

  // 绑定返回按钮
  document.getElementById('backBtn').addEventListener('click', function() {
    window.location.href = 'map.html';
  });

  // 绑定页签切换
  document.querySelectorAll('.type-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      switchType(this.dataset.type);
    });
  });

  // 渲染初始列表
  renderList();

  // 创建tooltip
  createSkillTooltip();
}

// 渲染角色选择器
function renderCharacterList() {
  const container = document.getElementById('martialCharacterList');
  container.innerHTML = martialCharacters.map((char, index) => `
    <div class="martial-char-item ${char.id === currentMartialCharacterId ? 'active' : ''}" 
         onclick="handleCharacterSwitch(${char.id})">
      <span class="martial-char-icon">${char.icon}</span>
      <span class="martial-char-name">${char.name}</span>
    </div>
  `).join('');
}

// 处理角色切换
function handleCharacterSwitch(charId) {
  if (charId === currentMartialCharacterId) return;
  if (typeof switchMartialCharacter === 'function') {
    switchMartialCharacter(charId);
  }
}

// 切换类型
function switchType(type) {
  currentType = type;
  
  // 更新页签样式
  document.querySelectorAll('.type-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.type === type) {
      tab.classList.add('active');
    }
  });

  // 清空选中
  selectedMartialArt = null;
  document.getElementById('noSelection').style.display = 'flex';
  document.getElementById('detailPanel').style.display = 'none';

  // 重新渲染列表
  renderList();
}

// 渲染武学列表
function renderList() {
  const list = document.getElementById('martialList');
  let items = playerMartialArts.filter(m => m.type === currentType);

  // 排序：已装备的排前面
  items.sort((a, b) => {
    if (a.equipped && !b.equipped) return -1;
    if (!a.equipped && b.equipped) return 1;
    return 0;
  });

  if (items.length === 0) {
    list.innerHTML = '<div style="padding:40px;text-align:center;color:#666;"><div style="font-size:40px;margin-bottom:10px;">📚</div><div>暂无武学</div></div>';
    return;
  }

  list.innerHTML = items.map(martial => `
    <div class="martial-item ${selectedMartialArt?.id === martial.id ? 'selected' : ''} ${martial.equipped ? 'equipped' : ''}" 
         onclick="selectMartialArt(${martial.id})">
      <div class="martial-item-header">
        <span class="martial-item-icon">${TYPE_ICONS[martial.type]}</span>
        <span class="martial-item-name">${martial.name}</span>
        <span class="martial-item-rank ${RANK_CLASSES[martial.rank]}">${martial.rank}</span>
      </div>
      <div class="martial-item-info">
        <span>所属：${martial.school}</span>
        <span class="martial-item-level">第 ${martial.currentLevel} 重</span>
      </div>
    </div>
  `).join('');
}

// 选择武学
function selectMartialArt(id) {
  selectedMartialArt = playerMartialArts.find(m => m.id === id);
  
  // 更新列表选中样式
  renderList();
  
  // 显示详情
  document.getElementById('noSelection').style.display = 'none';
  document.getElementById('detailPanel').style.display = 'block';
  
  renderDetail();
}

// 渲染详情
function renderDetail() {
  if (!selectedMartialArt) return;
  const m = selectedMartialArt;

  // 基础信息
  document.getElementById('detailIcon').textContent = TYPE_ICONS[m.type];
  document.getElementById('detailName').textContent = m.name;
  document.getElementById('detailDesc').textContent = m.description;

  // 品阶和门派
  const rankBadge = document.getElementById('detailRank');
  rankBadge.textContent = m.rank;
  rankBadge.className = 'rank-badge ' + RANK_CLASSES[m.rank];
  document.getElementById('detailSchool').textContent = m.school;

  // 境界
  document.getElementById('detailLevel').textContent = m.currentLevel === 0 ? '未修炼' : `第 ${m.currentLevel} 重`;
  
  // 更新三个境界框
  for (let i = 1; i <= 3; i++) {
    const box = document.getElementById('realm' + i);
    if (i <= m.practiceTimes) {
      box.classList.add('filled');
    } else {
      box.classList.remove('filled');
    }
  }

  document.getElementById('practiceTimes').textContent = m.practiceTimes;

  // 修炼按钮
  const practiceBtn = document.getElementById('practiceBtn');
  const cost = calculatePracticeCost(m);
  
  if (m.currentLevel >= m.maxLevel) {
    practiceBtn.textContent = '已达最高境界';
    practiceBtn.disabled = true;
  } else if (playerExperience < cost) {
    practiceBtn.textContent = `修炼 (消耗 ${cost} 阅历) - 阅历不足`;
    practiceBtn.disabled = true;
  } else {
    practiceBtn.textContent = `修炼 (消耗 ${cost} 阅历)`;
    practiceBtn.disabled = false;
    practiceBtn.onclick = () => practiceMartialArt();
  }

  // 属性加成
  const statsHtml = Object.entries(m.stats).map(([key, val]) => {
    const labels = { attack: '攻击', hp: '气血', hit: '命中', dodge: '躲闪', 
                     defense: '防御', parry: '招架', speed: '速度', 
                     innerSkill: '内功', lightSkill: '轻功', sword: '剑术',
                     fist: '拳脚', blade: '刀术' };
    return `
      <div class="stat-badge">
        <div class="stat-badge-label">${labels[key] || key}</div>
        <div class="stat-badge-value">+${val}</div>
      </div>
    `;
  }).join('');
  document.getElementById('detailStats').innerHTML = statsHtml;

  // 招式
  const skillsHtml = m.skills.map(skill => {
    const isUnlocked = m.currentLevel >= skill.unlockLevel;
    return `
      <div class="skill-item ${!isUnlocked ? 'locked' : ''}" 
           onmouseenter="showSkillTooltip(event, ${JSON.stringify(skill).replace(/"/g, '&quot;')})"
           onmouseleave="hideSkillTooltip()">
        <div class="skill-icon">${skill.icon}</div>
        <div class="skill-name">${skill.name}</div>
        <div class="skill-type ${skill.type === '主动' ? 'active' : 'passive'}">${skill.type}</div>
        ${!isUnlocked ? `<div class="skill-unlock">${skill.unlockLevel}重解锁</div>` : ''}
      </div>
    `;
  }).join('');
  document.getElementById('detailSkills').innerHTML = skillsHtml;

  // 装备按钮
  const equipBtn = document.getElementById('equipBtn');
  if (m.equipped) {
    equipBtn.textContent = '卸 下';
    equipBtn.classList.add('unequip');
    equipBtn.onclick = () => unequipMartialArt();
  } else {
    equipBtn.textContent = '激 活';
    equipBtn.classList.remove('unequip');
    equipBtn.onclick = () => equipMartialArt();
  }
}

// 计算修炼消耗
function calculatePracticeCost(martial) {
  const baseCosts = { '初阶': 30, '中阶': 60, '高阶': 100, '绝阶': 150 };
  return baseCosts[martial.rank] + martial.currentLevel * 10;
}

// 修炼武学
function practiceMartialArt() {
  if (!selectedMartialArt) return;
  
  const cost = calculatePracticeCost(selectedMartialArt);
  
  if (playerExperience < cost) {
    alert('阅历不足！');
    return;
  }

  // 消耗阅历
  playerExperience -= cost;
  document.getElementById('playerExp').textContent = playerExperience;

  // 增加修炼次数
  selectedMartialArt.practiceTimes++;

  // 检查是否升重
  if (selectedMartialArt.practiceTimes >= 3) {
    if (selectedMartialArt.currentLevel < selectedMartialArt.maxLevel) {
      selectedMartialArt.currentLevel++;
      selectedMartialArt.practiceTimes = 0;
      alert(`恭喜！${selectedMartialArt.name} 突破至第 ${selectedMartialArt.currentLevel} 重！`);
    }
  }

  // 重新渲染
  renderDetail();
  renderList();
  
  // 保存数据
  if (typeof saveMartialData === 'function') saveMartialData();
}

// 装备武学
function equipMartialArt() {
  // 卸载同类型已装备的
  playerMartialArts.forEach(m => {
    if (m.type === selectedMartialArt.type && m.equipped) {
      m.equipped = false;
    }
  });

  // 装备当前
  selectedMartialArt.equipped = true;
  
  renderDetail();
  renderList();
  
  // 保存数据
  if (typeof saveMartialData === 'function') saveMartialData();
}

// 卸载武学
function unequipMartialArt() {
  selectedMartialArt.equipped = false;
  
  renderDetail();
  renderList();
  
  // 保存数据
  if (typeof saveMartialData === 'function') saveMartialData();
}

// 创建技能tooltip
function createSkillTooltip() {
  const tooltip = document.createElement('div');
  tooltip.id = 'skillTooltip';
  tooltip.className = 'skill-tooltip';
  document.body.appendChild(tooltip);
}

// 显示技能tooltip
function showSkillTooltip(event, skill) {
  const tooltip = document.getElementById('skillTooltip');
  tooltip.innerHTML = `
    <div class="skill-tooltip-name">${skill.name}</div>
    <div class="skill-tooltip-type">${skill.type}</div>
    <div class="skill-tooltip-desc">${skill.description}</div>
  `;
  tooltip.style.display = 'block';
  
  const rect = event.target.getBoundingClientRect();
  tooltip.style.left = rect.right + 15 + 'px';
  tooltip.style.top = rect.top + 'px';
}

// 隐藏tooltip
function hideSkillTooltip() {
  document.getElementById('skillTooltip').style.display = 'none';
}
