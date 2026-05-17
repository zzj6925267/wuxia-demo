/**
 * 战斗内 Buff 表 — 所有战斗 Buff 的定义与通用逻辑集中在此。
 *
 * - 数值、叠层上限、小标样式、叠层日志、头像特效档：只改本表。
 * - 武学被动通过 buffId 引用：`passiveIds` → `battlePassives.js`（回合开始叠层等），或旧版 `effect.type === 'turnStartSelfBuff'`（仍兼容）。
 * - battle.js 只负责「何时触发」与写战斗日志，不硬编码 Buff 内容。
 *
 * 头像特效分档（按武学 rank，见 MARTIAL_RANK_TO_BUFF_FX_TIER）：
 * - 1 档·初阶：CSS 轻量（约 3 风线 + 5 尘粒）— 当前默认
 * - 2 档·中阶：CSS 加强（更多风线/尘粒）
 * - 3 档·高阶/绝阶：Canvas 2D 粒子（约 15～25 粒 + 多层风线）+ 头像轻位移/残影
 */
const MARTIAL_RANK_TO_BUFF_FX_TIER = {
  初阶: 1,
  中阶: 2,
  高阶: 3,
  绝阶: 3
};
const BATTLE_BUFFS = {
  juechen_dust: {
    id: 'juechen_dust',
    name: '绝尘',
    /** 卡面 Buff 较多时用的短标文字 */
    shortName: '绝',
    stat: 'speed',
    /** 每层增加的速度（叠加在 baseSpeed 上） */
    valuePerStack: 10,
    maxStacks: 3,
    icon: '🍃',
    cardClass: 'combat-buff-badge--juechen',
    /** 头像持续特效键（见 battle.html CSS：combat-buff-avatar-fx--*） */
    avatarFx: 'speed_dust',
    /** 叠层成功时战斗日志；{actor} 角色名，{buff} 全名，{stacks} 当前层数 */
    gainLog: '{actor} 身法渐疾！【{buff}】×{stacks}'
  }
};

function resolveCombatBuffFxVisualTier(char, buffId) {
  let rank = '初阶';
  if (typeof window.getMartialRankForCombatBuff === 'function') {
    rank = window.getMartialRankForCombatBuff(char, buffId) || '初阶';
  }
  return MARTIAL_RANK_TO_BUFF_FX_TIER[rank] || 1;
}

function buildSpeedDustCssLayer(stacks, buffId, visualTier) {
  const stackTier = String(Math.min(Math.max(stacks, 1), 3));
  const layer = document.createElement('div');
  layer.className = 'combat-buff-avatar-fx combat-buff-avatar-fx--speed-dust';
  layer.setAttribute('data-stack-tier', stackTier);
  layer.setAttribute('data-visual-tier', String(visualTier));
  layer.setAttribute('data-buff-id', buffId);
  layer.setAttribute('aria-hidden', 'true');
  let html =
    '<div class="speed-dust-glow"></div>' +
    '<div class="speed-dust-wind speed-dust-wind--a"></div>' +
    '<div class="speed-dust-wind speed-dust-wind--b"></div>' +
    '<div class="speed-dust-wind speed-dust-wind--c"></div>' +
    '<div class="speed-dust-mote speed-dust-mote--1"></div>' +
    '<div class="speed-dust-mote speed-dust-mote--2"></div>' +
    '<div class="speed-dust-mote speed-dust-mote--3"></div>' +
    '<div class="speed-dust-mote speed-dust-mote--4"></div>' +
    '<div class="speed-dust-mote speed-dust-mote--5"></div>';
  if (visualTier >= 2) {
    html +=
      '<div class="speed-dust-wind speed-dust-wind--d"></div>' +
      '<div class="speed-dust-wind speed-dust-wind--e"></div>' +
      '<div class="speed-dust-mote speed-dust-mote--6"></div>' +
      '<div class="speed-dust-mote speed-dust-mote--7"></div>' +
      '<div class="speed-dust-mote speed-dust-mote--8"></div>';
  }
  layer.innerHTML = html;
  return layer;
}

function attachSpeedDustAfterimage(holder) {
  if (!holder || holder.querySelector('.speed-dust-afterimage')) return;
  const img = holder.querySelector('.character-avatar, .character-avatar-emoji');
  if (!img) return;
  const ghost = img.cloneNode(true);
  ghost.classList.add('speed-dust-afterimage');
  ghost.removeAttribute('id');
  holder.insertBefore(ghost, img);
}

function removeSpeedDustAfterimage(holder) {
  if (!holder) return;
  holder.querySelectorAll('.speed-dust-afterimage').forEach(function (el) {
    el.remove();
  });
  holder.classList.remove('has-speed-premium-fx');
}

function mountSpeedDustAvatarFx(holder, buffId, stacks, char) {
  const visualTier = resolveCombatBuffFxVisualTier(char, buffId);
  const stackTier = Math.min(Math.max(stacks, 1), 3);

  if (char && char.id != null) {
    holder.dataset.combatBuffHostId = String(char.id);
  }

  removeSpeedDustAfterimage(holder);
  if (typeof CombatBuffCanvasFx !== 'undefined') {
    CombatBuffCanvasFx.stop(holder, buffId);
  }

  let marker = null;
  if (visualTier >= 3) {
    if (stackTier > 1) {
      holder.classList.add('has-speed-premium-fx');
      attachSpeedDustAfterimage(holder);
    }
    if (typeof CombatBuffCanvasFx !== 'undefined') {
      CombatBuffCanvasFx.startSpeedDust(holder, buffId, {
        stacks: stackTier,
        visualTier: visualTier,
        introFade: stackTier === 1
      });
    }
    marker = document.createElement('div');
    marker.className =
      'combat-buff-avatar-fx combat-buff-avatar-fx--speed-dust combat-buff-avatar-fx--premium-marker';
    marker.setAttribute('data-stack-tier', String(stackTier));
    marker.setAttribute('data-visual-tier', String(visualTier));
    marker.setAttribute('data-buff-id', buffId);
    marker.setAttribute('aria-hidden', 'true');
    return marker;
  }

  return buildSpeedDustCssLayer(stackTier, buffId, visualTier);
}

const BATTLE_BUFF_AVATAR_FX_BUILDERS = {
  speed_dust: mountSpeedDustAvatarFx
};

function getBattleBuffDef(buffId) {
  if (!buffId) return null;
  return BATTLE_BUFFS[buffId] || null;
}

function initCombatBuffState(char) {
  if (!char) return char;
  if (char.baseSpeed == null) char.baseSpeed = Number(char.speed) || 0;
  if (!char.combatBuffs) char.combatBuffs = {};
  return char;
}

function getCombatBuffStatBonus(char, stat) {
  if (!char || !char.combatBuffs || !stat) return 0;
  let sum = 0;
  for (const buffId of Object.keys(char.combatBuffs)) {
    const inst = char.combatBuffs[buffId];
    const def = getBattleBuffDef(buffId);
    if (!def || !inst || inst.stacks <= 0 || def.stat !== stat) continue;
    sum += (Number(def.valuePerStack) || 0) * inst.stacks;
  }
  return sum;
}

function getEffectiveSpeed(char) {
  if (!char) return 0;
  initCombatBuffState(char);
  return Math.floor(char.baseSpeed + getCombatBuffStatBonus(char, 'speed'));
}

function syncCharEffectiveSpeed(char) {
  if (!char) return;
  char.speed = getEffectiveSpeed(char);
}

function tryAddCombatBuffStack(char, buffId, delta) {
  const def = getBattleBuffDef(buffId);
  if (!def || !char) return { added: false, newStacks: 0 };
  initCombatBuffState(char);
  const maxStacks = Number(def.maxStacks) || 1;
  const inst = char.combatBuffs[buffId] || { stacks: 0 };
  if (inst.stacks >= maxStacks) {
    return { added: false, newStacks: inst.stacks };
  }
  const add = Math.min(Number(delta) || 1, maxStacks - inst.stacks);
  inst.stacks += add;
  char.combatBuffs[buffId] = inst;
  syncCharEffectiveSpeed(char);
  return { added: add > 0, newStacks: inst.stacks };
}

function formatCombatBuffGainLog(actorName, buffId, stacks) {
  const def = getBattleBuffDef(buffId);
  const actor = actorName != null ? String(actorName) : '';
  const n = stacks != null ? stacks : 1;
  if (!def) return `${actor} 获得 Buff ×${n}`;
  if (def.gainLog) {
    return def.gainLog
      .replace(/\{actor\}/g, actor)
      .replace(/\{buff\}/g, def.name)
      .replace(/\{stacks\}/g, String(n));
  }
  return `${actor}【${def.name}】×${n}`;
}

function getCombatBuffBadgeLabel(def, stacks, compact) {
  if (!def) return '';
  const label = compact && def.shortName ? def.shortName : def.name;
  const n = stacks != null ? stacks : 1;
  return `${label}×${n}`;
}

function getCombatBuffBadgeTitle(def, stacks) {
  if (!def) return '';
  const n = stacks != null ? stacks : 1;
  return n > 1 ? `${def.name} ×${n}` : def.name;
}

function escapeHtmlForBuffTooltip(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttrForBuffTooltip(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function combatBuffStatLabelZh(stat) {
  const m = {
    speed: '速度',
    attack: '攻击',
    hit: '命中',
    dodge: '闪避',
    parry: '招架',
    defense: '防御'
  };
  return m[stat] || stat || '';
}

/**
 * 悬停第二行：一行说清数值（每层 + 层数 + 合计）；无 stat 时用表里 tooltipEffectLine 或兜底
 */
function getCombatBuffTooltipEffectLine(def, stacks) {
  if (!def) return '';
  const n = Math.max(1, Math.floor(Number(stacks)) || 1);
  if (def.stat && def.valuePerStack != null) {
    const per = Math.floor(Number(def.valuePerStack)) || 0;
    const label = combatBuffStatLabelZh(def.stat);
    const total = per * n;
    return '每层' + label + '+' + per + '，×' + n + '层，' + label + '合计+' + total;
  }
  if (typeof def.tooltipEffectLine === 'string' && def.tooltipEffectLine.trim()) {
    return def.tooltipEffectLine.trim();
  }
  return '战斗内增益';
}

function renderCombatBuffTooltipHtml(def, stacks) {
  const name = escapeHtmlForBuffTooltip(def.name);
  const effect = escapeHtmlForBuffTooltip(getCombatBuffTooltipEffectLine(def, stacks));
  return (
    '<div class="combat-buff-tooltip" role="tooltip">' +
    '<div class="combat-buff-tooltip__name">' +
    name +
    '</div>' +
    '<div class="combat-buff-tooltip__effect">' +
    effect +
    '</div></div>'
  );
}

function getActiveCombatBuffEntries(char) {
  if (!char || !char.combatBuffs) return [];
  const out = [];
  for (const [id, inst] of Object.entries(char.combatBuffs)) {
    if (!inst || inst.stacks <= 0) continue;
    const def = getBattleBuffDef(id);
    if (!def) continue;
    out.push({ id, inst, def });
  }
  return out;
}

function renderCombatBuffBadgeHtml(entry, compact) {
  const { inst, def } = entry;
  const text = getCombatBuffBadgeLabel(def, inst.stacks, compact);
  const effectLine = getCombatBuffTooltipEffectLine(def, inst.stacks);
  const titleFallback = escapeAttrForBuffTooltip(def.name + '：' + effectLine);
  const cls = def.cardClass ? ` ${def.cardClass}` : '';
  const iconHtml = def.icon ? `<span class="combat-buff-badge__icon">${def.icon}</span>` : '';
  const tip = renderCombatBuffTooltipHtml(def, inst.stacks);
  return (
    `<div class="combat-buff-badge${cls}" tabindex="0" title="${titleFallback}">` +
    iconHtml +
    '<span class="combat-buff-badge__text">' +
    escapeHtmlForBuffTooltip(text) +
    '</span>' +
    tip +
    '</div>'
  );
}

function renderCombatBuffRowHtml(char, options) {
  const entries = getActiveCombatBuffEntries(char);
  if (!entries.length) return '';
  const compact = entries.length > 1;
  const intro = options && options.intro;
  const inner = entries.map(function (e) {
    return renderCombatBuffBadgeHtml(e, compact);
  }).join('');
  const rowCls = compact ? ' combat-buff-row--compact' : '';
  const introCls = intro ? ' combat-buff-row--intro' : '';
  return `<div class="combat-buff-row${rowCls}${introCls}">${inner}</div>`;
}

/** 首次叠层（如绝尘第 1 层）：头像特效与 Buff 小标淡入，避免第二回合突然弹出 */
function playCombatBuffAvatarFxIntro(holder, layer, ctx) {
  if (!holder || !ctx || ctx.stacks !== 1) return;
  holder.classList.add('combat-buff-fx-intro');
  if (layer) layer.classList.add('is-intro');
  if (ctx.visualTier >= 3 && typeof CombatBuffCanvasFx !== 'undefined') {
    CombatBuffCanvasFx.setIntroFade(holder, ctx.buffId, 960);
  }
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      holder.classList.add('combat-buff-fx-intro-active');
      if (layer) layer.classList.add('is-intro-active');
      if (ctx.visualTier >= 3) {
        holder.classList.add('has-speed-premium-fx');
        attachSpeedDustAfterimage(holder);
      }
    });
  });
  setTimeout(function () {
    holder.classList.remove('combat-buff-fx-intro', 'combat-buff-fx-intro-active');
    if (layer) layer.classList.remove('is-intro', 'is-intro-active');
  }, 1020);
}

function getAvatarHolderForChar(char) {
  if (!char || char.id == null || typeof document === 'undefined') return null;
  const card = document.getElementById(`char-${char.id}`);
  if (!card) return null;
  return card.querySelector('.character-avatar-container');
}

function ensureAvatarHolderPosition(holder) {
  if (!holder) return;
  if (getComputedStyle(holder).position === 'static') {
    holder.style.position = 'relative';
  }
}

function clearCombatBuffAvatarFx(holder) {
  if (!holder) return;
  if (typeof CombatBuffCanvasFx !== 'undefined') {
    CombatBuffCanvasFx.stopAll(holder);
  }
  removeSpeedDustAfterimage(holder);
  holder.querySelectorAll(
    '.combat-buff-avatar-fx, .combat-buff-canvas-fx, .speed-dust-gain-pop, .battle-intro-bubble'
  ).forEach(function (el) {
    el.remove();
  });
  holder.classList.remove(
    'has-buff-avatar-fx',
    'has-speed-premium-fx',
    'combat-buff-fx-intro',
    'combat-buff-fx-intro-active',
    'is-burst-premium'
  );
  delete holder.dataset.combatBuffHostId;
}

/** 角色阵亡：立刻卸头像 Buff 特效与小标（战斗未结束、同伴仍存活时也须清） */
function clearCombatBuffFxForChar(char) {
  if (!char || char.id == null || typeof document === 'undefined') return;
  const card = document.getElementById('char-' + char.id);
  if (card) {
    card.classList.remove('battle-cue-speaking');
    const row = card.querySelector('.combat-buff-row');
    if (row) row.remove();
  }
  const holder = getAvatarHolderForChar(char);
  if (holder) clearCombatBuffAvatarFx(holder);
}

function mountCombatBuffAvatarFx(holder, buffId, stacks, char) {
  const def = getBattleBuffDef(buffId);
  if (!def || !def.avatarFx || !holder) return null;
  const build = BATTLE_BUFF_AVATAR_FX_BUILDERS[def.avatarFx];
  if (typeof build !== 'function') return null;
  const layer = build(holder, buffId, stacks, char);
  if (!layer) return null;
  holder.insertBefore(layer, holder.firstChild);
  holder.classList.add('has-buff-avatar-fx');
  ensureAvatarHolderPosition(holder);
  return layer;
}

/** 按当前 combatBuffs 同步头像持续特效（有层则挂、无层则卸） */
function syncCombatBuffAvatarFx(char) {
  const holder = getAvatarHolderForChar(char);
  if (!holder) return;
  clearCombatBuffAvatarFx(holder);
  if (!char || char.isDead || !char.combatBuffs) return;
  for (const buffId of Object.keys(char.combatBuffs)) {
    const inst = char.combatBuffs[buffId];
    if (!inst || inst.stacks <= 0) continue;
    mountCombatBuffAvatarFx(holder, buffId, inst.stacks, char);
  }
}

/** 叠层成功时：刷新强度 + 播一次爆发飘字 */
function playCombatBuffGainFx(char, buffId, stacks, options) {
  const def = getBattleBuffDef(buffId);
  if (!def || !def.avatarFx || !char || char.isDead) return;
  const holder = getAvatarHolderForChar(char);
  if (!holder) return;
  ensureAvatarHolderPosition(holder);

  const stackTier = Math.min(Math.max(stacks, 1), 3);
  const visualTier = resolveCombatBuffFxVisualTier(char, buffId);
  const isFirstStack = stackTier === 1 || !!(options && options.isFirstStack);
  let layer = holder.querySelector('[data-buff-id="' + buffId + '"]');
  if (!layer) {
    layer = mountCombatBuffAvatarFx(holder, buffId, stacks, char);
  } else {
    layer.setAttribute('data-stack-tier', String(stackTier));
    layer.setAttribute('data-visual-tier', String(visualTier));
    if (visualTier >= 3 && typeof CombatBuffCanvasFx !== 'undefined') {
      CombatBuffCanvasFx.updateSpeedDust(holder, buffId, {
        stacks: stackTier,
        visualTier: visualTier
      });
    }
  }

  if (isFirstStack) {
    playCombatBuffAvatarFxIntro(holder, layer, {
      stacks: stackTier,
      visualTier: visualTier,
      buffId: buffId,
      char: char
    });
  } else {
    if (layer && visualTier < 3) {
      layer.classList.remove('is-burst');
      void layer.offsetWidth;
      layer.classList.add('is-burst');
    }
    if (visualTier >= 3) {
      holder.classList.add('has-speed-premium-fx', 'is-burst-premium');
      attachSpeedDustAfterimage(holder);
      setTimeout(function () {
        holder.classList.remove('is-burst-premium');
      }, 520);
    }
  }

  if (def.avatarFx === 'speed_dust') {
    const pop = document.createElement('div');
    pop.className = 'speed-dust-gain-pop' + (isFirstStack ? ' speed-dust-gain-pop--intro' : '');
    pop.textContent = stacks >= 3 ? '极速' : '身疾';
    holder.appendChild(pop);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        pop.classList.add('show');
      });
    });
    setTimeout(function () {
      pop.remove();
    }, isFirstStack ? 1100 : 920);
  }
}

function updateCombatBuffDomForChar(char, options) {
  if (!char || char.id == null || typeof document === 'undefined') return;
  if (char.isDead) {
    clearCombatBuffFxForChar(char);
    return;
  }
  const card = document.getElementById(`char-${char.id}`);
  if (!card) return;
  const intro = options && options.intro;
  const html = renderCombatBuffRowHtml(char, { intro: intro });
  let row = card.querySelector('.combat-buff-row');
  if (!html) {
    if (row) row.remove();
  } else if (row) {
    row.outerHTML = html;
    if (intro) {
      row = card.querySelector('.combat-buff-row');
      if (row) {
        requestAnimationFrame(function () {
          row.classList.add('combat-buff-row--intro-active');
        });
      }
    }
  } else {
    const nameEl = card.querySelector('.character-name');
    if (nameEl) nameEl.insertAdjacentHTML('afterend', html);
    if (intro) {
      row = card.querySelector('.combat-buff-row');
      if (row) {
        requestAnimationFrame(function () {
          row.classList.add('combat-buff-row--intro-active');
        });
      }
    }
  }
}

if (typeof window !== 'undefined') {
  window.BATTLE_BUFFS = BATTLE_BUFFS;
  window.getBattleBuffDef = getBattleBuffDef;
  window.initCombatBuffState = initCombatBuffState;
  window.getCombatBuffStatBonus = getCombatBuffStatBonus;
  window.getEffectiveSpeed = getEffectiveSpeed;
  window.syncCharEffectiveSpeed = syncCharEffectiveSpeed;
  window.tryAddCombatBuffStack = tryAddCombatBuffStack;
  window.formatCombatBuffGainLog = formatCombatBuffGainLog;
  window.getCombatBuffBadgeLabel = getCombatBuffBadgeLabel;
  window.getCombatBuffBadgeTitle = getCombatBuffBadgeTitle;
  window.getCombatBuffTooltipEffectLine = getCombatBuffTooltipEffectLine;
  window.getActiveCombatBuffEntries = getActiveCombatBuffEntries;
  window.renderCombatBuffBadgeHtml = renderCombatBuffBadgeHtml;
  window.renderCombatBuffRowHtml = renderCombatBuffRowHtml;
  window.updateCombatBuffDomForChar = updateCombatBuffDomForChar;
  window.syncCombatBuffAvatarFx = syncCombatBuffAvatarFx;
  window.clearCombatBuffFxForChar = clearCombatBuffFxForChar;
  window.playCombatBuffGainFx = playCombatBuffGainFx;
  window.MARTIAL_RANK_TO_BUFF_FX_TIER = MARTIAL_RANK_TO_BUFF_FX_TIER;
  window.resolveCombatBuffFxVisualTier = resolveCombatBuffFxVisualTier;
}
