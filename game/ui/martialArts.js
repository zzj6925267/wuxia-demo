// 武学系统逻辑

/** 追击类被动：旧 effect.followAttack 或 passiveIds→battlePassives（武学页已引 battlePassives.js） */
function getFollowAttackEffectForTooltip(skill) {
  if (skill && skill.effect && skill.effect.type === 'followAttack') return skill.effect;
  if (!skill || !skill.passiveIds || !skill.passiveIds.length) return null;
  if (typeof getBattlePassivesByIds !== 'function') return null;
  const passives = getBattlePassivesByIds(skill.passiveIds);
  for (let i = 0; i < passives.length; i++) {
    const p = passives[i];
    if (!p || p.trigger !== 'afterActiveHit') continue;
    const actions = p.actions || [];
    for (let j = 0; j < actions.length; j++) {
      const act = actions[j];
      if (act && act.type === 'followAttack') return act;
    }
  }
  return null;
}

function getInnerAutoHealEffectForTooltip(skill) {
  if (skill && skill.effect && skill.effect.type === 'autoHeal') return skill.effect;
  if (!skill || !skill.passiveIds || !skill.passiveIds.length) return null;
  if (typeof expandTurnStartAutoHealActions !== 'function') return null;
  const segs = expandTurnStartAutoHealActions(skill);
  return segs.length ? segs[0] : null;
}

/** 守拙/纳息/挪步等 loadoutPassive：与 battlePassives 表 actions 同形，供浮窗数值 */
function getLoadoutPassiveStatEffectForTooltip(skill) {
  if (!skill || typeof expandLoadoutPassiveStatBonuses !== 'function') return null;
  const arr = expandLoadoutPassiveStatBonuses(skill);
  return arr && arr.length ? arr[0] : null;
}

/** 招式 PNG 路径约定：game/assets/images/UI/skills/ma_skill_{武学id}_{招式id}.png */
function getMartialSkillIconUrl(martialId, skill) {
  if (!skill) return '';
  if (skill.iconUrl) return String(skill.iconUrl);
  const mid = parseInt(martialId, 10);
  const sid = parseInt(skill.id, 10);
  if (!Number.isFinite(mid) || !Number.isFinite(sid)) return '';
  return '../assets/images/UI/skills/ma_skill_' + mid + '_' + sid + '.png';
}

/** 招式格内图标：有 PNG 用图，失败回退 emoji（见 martialArts.css） */
function renderMartialSkillIconInner(skill, martialId) {
  const emoji = skill.icon || '❓';
  const url = getMartialSkillIconUrl(martialId, skill);
  if (!url) {
    return '<span class="skill-icon-emoji" aria-hidden="true">' + emoji + '</span>';
  }
  return (
    '<img class="skill-icon-img" src="' +
    url +
    '" alt="" loading="lazy" decoding="async" ' +
    'onerror="this.style.display=\'none\';var s=this.nextElementSibling;if(s)s.style.display=\'\'" />' +
    '<span class="skill-icon-emoji skill-icon-emoji--fallback" aria-hidden="true" style="display:none">' +
    emoji +
    '</span>'
  );
}

/**
 * 武学招式浮窗用：每次读取最新四维（勿把 stats 塞进 HTML 字符串，否则会停在旧值）。
 * 优先当前武学页选中的 `window.characters` 条目；否则用 `game_save_0.player`，扁平字段覆盖 `player.stats`。
 */
function getPlayerStatsForMartialTooltip() {
  const defaults = { strength: 10, agility: 10, bone: 10, qi: 10, level: 1 };
  const charId =
    typeof currentMartialCharacterId !== 'undefined' && currentMartialCharacterId != null
      ? Number(currentMartialCharacterId)
      : 1;
  if (typeof window !== 'undefined' && Array.isArray(window.characters) && window.characters.length) {
    const ch = window.characters.find((c) => c && Number(c.id) === charId);
    if (ch && ch.stats) {
      const s = ch.stats;
      return {
        strength: s.strength != null ? Number(s.strength) : defaults.strength,
        agility: s.agility != null ? Number(s.agility) : defaults.agility,
        bone: s.bone != null ? Number(s.bone) : s.vitality != null ? Number(s.vitality) : defaults.bone,
        qi: s.qi != null ? Number(s.qi) : s.spirit != null ? Number(s.spirit) : defaults.qi,
        level: ch.level != null ? Number(ch.level) : defaults.level
      };
    }
  }
  try {
    const raw = localStorage.getItem('game_save_0');
    if (!raw) return defaults;
    const data = JSON.parse(raw);
    const p = data.player;
    if (!p) return defaults;
    const merged = Object.assign({}, defaults, p.stats && typeof p.stats === 'object' ? p.stats : {});
    if (typeof p.strength === 'number') merged.strength = p.strength;
    if (typeof p.agility === 'number') merged.agility = p.agility;
    if (typeof p.bone === 'number') merged.bone = p.bone;
    if (typeof p.qi === 'number') merged.qi = p.qi;
    if (p.level != null) merged.level = Number(p.level) || merged.level;
    return merged;
  } catch (e) {
    console.warn('getPlayerStatsForMartialTooltip', e);
    return defaults;
  }
}

/** 招式浮窗数值 → 整数字符串（依赖 helpers.js） */
function fmtInt(value, mode) {
  if (typeof formatDisplayInt === 'function') return String(formatDisplayInt(value, mode));
  const n = Number(value);
  if (!Number.isFinite(n)) return '0';
  if (mode === 'ceil') return String(Math.ceil(n));
  if (mode === 'floor') return String(Math.floor(n));
  return String(Math.round(n));
}

function fmtPctFromMultiplier(multiplier) {
  if (typeof formatMultiplierAsPercent === 'function') return String(formatMultiplierAsPercent(multiplier));
  return fmtInt(Number(multiplier) * 100, 'round');
}

function fmtPctFromFraction(fraction) {
  if (typeof formatFractionAsPercent === 'function') return String(formatFractionAsPercent(fraction));
  return fmtPctFromMultiplier(fraction);
}

function fmtAttrBonus(attrValue, perPoint) {
  if (typeof formatAttrBonusInt === 'function') return String(formatAttrBonusInt(attrValue, perPoint));
  return fmtInt(Number(attrValue) * Number(perPoint), 'ceil');
}

function fmtAttrBonusPct(attrValue, perPoint) {
  if (typeof formatAttrBonusPercentInt === 'function') {
    return String(formatAttrBonusPercentInt(attrValue, perPoint));
  }
  return fmtInt(Number(attrValue) * Number(perPoint) * 100, 'ceil');
}

let currentType = '武功';
let selectedMartialArt = null;

function yueliLabel() {
  return typeof getMartialPracticeDisplayName === 'function'
    ? getMartialPracticeDisplayName()
    : '历练';
}

/**
 * 测试重置阅历（仅供测试用）
 */
function testResetExp() {
  try {
    // playerExperience 存在 localStorage.playerExperience 里
    const currentExp = parseInt(localStorage.getItem('playerExperience') || '0');
    const newExp = currentExp + 2000;
    localStorage.setItem('playerExperience', newExp);

    // 刷新显示
    const expElement = document.getElementById('playerExp');
    if (expElement) {
      expElement.textContent = newExp;
    }

    // 同时更新全局变量
    if (typeof playerExperience !== 'undefined') {
      playerExperience = newExp;
    }

    // 刷新详情面板的按钮状态
    if (typeof renderDetail === 'function') {
      renderDetail();
    }

    alert(`已添加2000${yueliLabel()}！当前${yueliLabel()}：${newExp}`);
  } catch (e) {
    console.error('添加' + yueliLabel() + '失败:', e);
    alert('添加' + yueliLabel() + '失败！');
  }
}

// 图标映射（非初阶或 PNG 加载失败时回退）
const TYPE_ICONS = {
  '武功': '⚔️',
  '内功': '📿',
  '轻功': '👟'
};

/** 品阶通用武学图标：初阶武功/内功/轻功列表与详情共用 */
const MARTIAL_RANK_ICON_URL = {
  初阶: '../assets/images/UI/ma_ui_martial_icon_chu.png'
};
function getMartialRankIconUrl(rank) {
  return MARTIAL_RANK_ICON_URL[rank] || '';
}

/** 列表项 / 详情头图：初阶用卷轴 PNG，其余品阶仍按类型 emoji */
function renderMartialArtIconInner(martial, variant) {
  const url = getMartialRankIconUrl(martial.rank);
  const emoji = TYPE_ICONS[martial.type] || '📜';
  if (!url) {
    const cls = variant === 'list' ? 'martial-item-icon-emoji' : 'martial-icon-emoji';
    return '<span class="' + cls + '" aria-hidden="true">' + emoji + '</span>';
  }
  const imgClass =
    variant === 'list' ? 'martial-rank-icon-img martial-rank-icon-img--list' : 'martial-rank-icon-img martial-rank-icon-img--detail';
  const fallbackClass =
    variant === 'list'
      ? 'martial-item-icon-emoji martial-item-icon-emoji--fallback'
      : 'martial-icon-emoji martial-icon-emoji--fallback';
  return (
    '<img class="' +
    imgClass +
    '" src="' +
    url +
    '" alt="" loading="lazy" decoding="async" ' +
    'onerror="this.style.display=\'none\';var s=this.nextElementSibling;if(s)s.style.display=\'\'" />' +
    '<span class="' +
    fallbackClass +
    '" aria-hidden="true" style="display:none">' +
    emoji +
    '</span>'
  );
}

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
  if (typeof repairZhengyangIntroMartialsFromLearnedSkills === 'function') {
    repairZhengyangIntroMartialsFromLearnedSkills(
      typeof currentMartialCharacterId !== 'undefined' ? currentMartialCharacterId : 1
    );
  }
  // 渲染角色选择器
  renderCharacterList();

  // 从 localStorage 读取类型
  const savedType = localStorage.getItem('martialArtsType');
  
  // 英文到中文的映射
  const typeMap = {
    'martial': '武功',
    'internal': '内功',
    'light': '轻功'
  };
  
  if (savedType) {
    // 把英文参数转成中文
    currentType = typeMap[savedType] || savedType;
    document.querySelectorAll('.type-tab').forEach(tab => {
      if (tab.dataset.type === currentType) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
    // 读取完后清除
    localStorage.removeItem('martialArtsType');
  }

  const yl = yueliLabel();
  const ylEl = document.getElementById('martialYueliLabel');
  if (ylEl) ylEl.textContent = yl + '：';
  document.getElementById('playerExp').textContent = playerExperience;

  // 绑定返回按钮（若从小地图/嵌套正阳进入则回到原界面）
  document.getElementById('backBtn').addEventListener('click', function() {
    try {
      var ret = sessionStorage.getItem('game_ui_return_href');
      if (ret) {
        sessionStorage.removeItem('game_ui_return_href');
        window.location.href = ret;
        return;
      }
    } catch (e) {}
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
  if (!container) return;
  const flipMap =
    typeof window !== 'undefined' && window.CHARACTER_PORTRAIT_FLIP_H_BY_ID
      ? window.CHARACTER_PORTRAIT_FLIP_H_BY_ID
      : {};
  if (
    typeof CompanionParty !== 'undefined' &&
    !CompanionParty.canSelectCharacterId(currentMartialCharacterId) &&
    typeof switchMartialCharacter === 'function'
  ) {
    switchMartialCharacter(1);
  }
  const roster =
    typeof CompanionParty !== 'undefined'
      ? CompanionParty.filterMartialRoster(martialCharacters)
      : martialCharacters;
  container.innerHTML = roster.map((char) => `
    <div class="martial-char-item ${char.id === currentMartialCharacterId ? 'active' : ''}" 
         onclick="handleCharacterSwitch(${char.id})">
      <div class="martial-char-card" aria-label="${char.name}">
        <span class="martial-char-name-tag">${char.name}</span>
        <div class="martial-char-portrait-wrap">
          <img class="martial-char-portrait${flipMap[char.id] ? ' martial-char-portrait--flip-h' : ''}" src="${char.portraitUrl}" alt="" width="64" height="64" loading="lazy"
               data-fallback="${char.iconFallback || ''}"
               onerror="this.classList.add('martial-char-portrait--broken'); this.alt='';" />
          <span class="martial-char-icon-fallback" aria-hidden="true">${char.iconFallback || '?'}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// 处理角色切换
function handleCharacterSwitch(charId) {
  if (typeof CompanionParty !== 'undefined' && !CompanionParty.canSelectCharacterId(charId)) {
    return;
  }
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
        <span class="martial-item-icon">${renderMartialArtIconInner(martial, 'list')}</span>
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

  // 获取玩家的四维属性（用于计算具体加成数值）
  let playerStats = { strength: 10, agility: 10, bone: 10, qi: 10, level: 1 };
  try {
    const saveData = localStorage.getItem('game_save_0');
    if (saveData) {
      const data = JSON.parse(saveData);
      if (data.player && data.player.stats) {
        playerStats = { ...playerStats, ...data.player.stats };
      }
      if (data.player && data.player.level) {
        playerStats.level = data.player.level;
      }
    }
  } catch (e) {
    console.warn('获取玩家属性失败:', e);
  }

  // 基础信息
  const detailIconEl = document.getElementById('detailIcon');
  detailIconEl.className = getMartialRankIconUrl(m.rank)
    ? 'martial-icon martial-icon--rank-png'
    : 'martial-icon';
  detailIconEl.innerHTML = renderMartialArtIconInner(m, 'detail');
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
    practiceBtn.textContent = `修炼 (消耗 ${cost} ${yueliLabel()}) - ${yueliLabel()}不足`;
    practiceBtn.disabled = true;
  } else {
    practiceBtn.textContent = `修炼 (消耗 ${cost} ${yueliLabel()})`;
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

  // 招式（格内仅图标；名称/类型/说明在悬停 tooltip）
  const skillsHtml = (m.skills || []).map(skill => {
    if (!skill) return '';
    const isUnlocked = m.currentLevel >= (skill.unlockLevel || 1);
    const iconInner = renderMartialSkillIconInner(skill, m.id);
    const ariaLabel = (skill.name || '未知招式') + '（' + (skill.type || '被动') + '）';
    const skillName = skill.name || '未知招式';
    const skillType = skill.type || '被动';
    
    const iconBlock = `<div class="skill-icon-wrap${!isUnlocked ? ' skill-icon-wrap--locked' : ''}">
           <div class="skill-icon${!isUnlocked ? ' skill-icon--locked' : ''}">${iconInner}</div>
         </div>`;
    return `
      <div class="skill-item skill-item--icon-only ${!isUnlocked ? 'locked' : ''}"
           aria-label="${ariaLabel.replace(/"/g, '&quot;')}"
           onmouseenter="showSkillTooltip(event, ${JSON.stringify(skill).replace(/"/g, '&quot;')}, ${isUnlocked})"
           onmouseleave="hideSkillTooltip()">
        ${iconBlock}
        <div class="skill-name" aria-hidden="true">${skillName}</div>
        <div class="skill-type ${skillType === '主动' ? 'active' : 'passive'}" aria-hidden="true">${skillType}</div>
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

// 飘字提示
function showMartialFloatText(text, color) {
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

// 修炼武学
function practiceMartialArt() {
  if (!selectedMartialArt) return;
  
  const cost = calculatePracticeCost(selectedMartialArt);
  
  if (playerExperience < cost) {
    showMartialFloatText(yueliLabel() + '不足！', '#ff4444');
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
      showMartialFloatText(`恭喜！${selectedMartialArt.name} 突破至第 ${selectedMartialArt.currentLevel} 重！`, '#44ff44');
    }
  }

  // 重新渲染
  renderDetail();
  renderList();
  
  // 保存数据
  if (typeof saveMartialData === 'function') saveMartialData();
}

// 装备武学（武功 / 内功 / 轻功：各大类同时只能激活一本）
function equipMartialArt() {
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
function showSkillTooltip(event, skill, isUnlocked) {
  const tooltip = document.getElementById('skillTooltip');
  const playerStats = getPlayerStatsForMartialTooltip();
  const unlocked = isUnlocked !== false && isUnlocked !== 'false';
  const unlockLevel = skill && skill.unlockLevel != null ? skill.unlockLevel : 1;
  const lockHint =
    !unlocked && unlockLevel > 1
      ? `<div class="skill-tooltip-lock">第 ${unlockLevel} 重解锁</div>`
      : '';

  let effectDesc = '';
  
  // 剑影等追击被动：数值来自 battlePassives 或旧内联 effect
  const followFx = getFollowAttackEffectForTooltip(skill);
  if (skill.name === '剑影' && followFx) {
    const agilityBonus = playerStats
      ? fmtAttrBonusPct(playerStats.agility, followFx.chancePerPoint || 0.01)
      : '0';
    effectDesc = `<div class="skill-tooltip-effect">基础${fmtPctFromFraction(followFx.baseChance || 0)}%概率，身法越高触发概率越高（当前额外+${agilityBonus}%）</div>`;
  }
  
  const healPass = getInnerAutoHealEffectForTooltip(skill);
  const loadoutStatFx = getLoadoutPassiveStatEffectForTooltip(skill);
  const resolvedDamage =
    skill &&
    skill.type === '主动' &&
    typeof resolveActiveDamageEffect === 'function' &&
    selectedMartialArt &&
    selectedMartialArt.id != null
      ? resolveActiveDamageEffect(skill, selectedMartialArt.id)
      : null;
  const fx =
    skill.effect ||
    resolvedDamage ||
    loadoutStatFx ||
    (healPass ? Object.assign({ type: 'autoHeal' }, healPass) : null);

  // 其他技能的详细说明（使用detail字段，并根据玩家属性计算具体数值）
  if (skill.detail && fx) {
    let calculatedDetail = skill.detail;

    // 如果有baseValue或具体效果类型，只显示计算后的结果，不使用detail
    if (fx.baseValue || (fx.type && ['defenseBuff', 'maxHpBuff', 'autoHeal', 'damage', 'buff'].indexOf(fx.type) !== -1)) {
      let baseText = '';
      const statNames = {
        attack: '攻击',
        defense: '防御',
        dodge: '闪避',
        parry: '招架',
        speed: '速度',
        hit: '命中',
        maxHp: '气血上限',
        maxMp: '内力上限'
      };
      if (fx.type === 'defenseBuff') {
        baseText = `基础防御+${fmtInt(fx.baseValue, 'round')}`;
      } else if (fx.type === 'maxHpBuff') {
        baseText = `基础气血上限+${fmtInt(fx.baseValue, 'round')}`;
      } else if (fx.type === 'autoHeal') {
        baseText = `每回合恢复${fmtInt(fx.baseValue, 'round')}`;
      } else if (fx.type === 'damage') {
        baseText = `基础伤害${fmtPctFromMultiplier(fx.value)}%`;
      } else if (fx.type === 'buff') {
        const statName = statNames[fx.stat] || fx.stat;
        const buffBase =
          fx.baseValue != null
            ? fmtInt(fx.baseValue, 'round')
            : fx.value != null
              ? fmtPctFromFraction(fx.value)
              : '0';
        baseText = `基础${statName}+${buffBase}`;
      }

      // 如果有bonusAttr和bonusPerPoint，添加玩家当前属性加成
      if (fx.bonusAttr && fx.bonusPerPoint && playerStats) {
        const attrs = window.ATTRIBUTES || { STRENGTH: 'strength', AGILITY: 'agility', BONE: 'bone', QI: 'qi' };
        const attrName = {
          [attrs.STRENGTH]: '臂力',
          [attrs.AGILITY]: '身法',
          [attrs.BONE]: '根骨',
          [attrs.QI]: '内息'
        }[fx.bonusAttr] || fx.bonusAttr;

        const attrValue = playerStats[fx.bonusAttr] || 0;

        // 根据配置类型决定显示格式
        if (fx.baseValue !== undefined) {
          const bonusValue = fmtAttrBonus(attrValue, fx.bonusPerPoint);
          calculatedDetail = baseText + `（${attrName}${fmtInt(attrValue, 'round')}点，额外+${bonusValue}）`;
        } else {
          const bonusPercent = fmtAttrBonusPct(attrValue, fx.bonusPerPoint);
          calculatedDetail = baseText + `（当前${attrName}${fmtInt(attrValue, 'round')}点，额外+${bonusPercent}%）`;
        }
      } else {
        calculatedDetail = baseText;
      }
    } else if (skill.detail) {
      // 其他情况使用detail字段
      calculatedDetail = skill.detail;
    }

    effectDesc = `<div class="skill-tooltip-effect">${calculatedDetail}</div>`;
  } else if (skill.detail) {
    effectDesc = `<div class="skill-tooltip-effect">${skill.detail}</div>`;
  }
  
  tooltip.innerHTML = `
    <div class="skill-tooltip-name">${skill.name}</div>
    <div class="skill-tooltip-type">${skill.type}</div>
    ${lockHint}
    <div class="skill-tooltip-desc">${skill.description}</div>
    ${effectDesc}
  `;
  tooltip.style.display = 'block';

  const anchor = event.currentTarget || (event.target && event.target.closest
    ? event.target.closest('.skill-item')
    : null) || event.target;
  const rect = anchor.getBoundingClientRect();
  tooltip.style.left = rect.right + 15 + 'px';
  tooltip.style.top = rect.top + 'px';
}

// 隐藏tooltip
function hideSkillTooltip() {
  document.getElementById('skillTooltip').style.display = 'none';
}
