/**
 * 黑风寨副本子地图逻辑
 */
(function () {
  const RUN_KEY = 'heifeng_dungeon_run';
  const INTERACT_BUNDLE = 'heifeng_interact_bundle';
  const INTERACT_JAR = 'heifeng_interact_jar';
  const PARTY_ONCE_PREFIX = 'heifeng_party_once_';
  const UNIQUE_IDS = ['luocao_jianjing', 'jingang_sword', 'pojiu_yeyi'];
  const RETURN_ROOM_KEY = 'heifeng_post_battle_room';
  const FOREST_EXIT_LOC_KEY = 'forest_after_heifeng_exit';

  const LOCATIONS = window.HEIFENG_LOCATIONS;
  const CONNECTIONS = window.HEIFENG_CONNECTIONS;

  let currentRoom = 'hf_camp';

  function partyOnceKey(itemId) {
    return PARTY_ONCE_PREFIX + itemId;
  }

  function hasPartyOnce(itemId) {
    return localStorage.getItem(partyOnceKey(itemId)) === '1';
  }

  function setPartyOnce(itemId) {
    localStorage.setItem(partyOnceKey(itemId), '1');
  }

  function getRun() {
    try {
      const raw = localStorage.getItem(RUN_KEY);
      if (!raw) return { killed: [] };
      const o = JSON.parse(raw);
      if (!o || !Array.isArray(o.killed)) return { killed: [] };
      return o;
    } catch (e) {
      return { killed: [] };
    }
  }

  function setRun(run) {
    localStorage.setItem(RUN_KEY, JSON.stringify(run));
  }

  function clearRun() {
    localStorage.removeItem(RUN_KEY);
  }

  function isKilled(enemyId) {
    return getRun().killed.indexOf(enemyId) >= 0;
  }

  function addKill(enemyId) {
    const r = getRun();
    if (r.killed.indexOf(enemyId) < 0) r.killed.push(enemyId);
    setRun(r);
  }

  const ORDER = ['hf_camp', 'hf_outer', 'hf_yard', 'hf_hall', 'hf_exit'];

  function edgeAllowed(fromId, toId) {
    const from = LOCATIONS[fromId];
    if (!from || !from.connections.includes(toId)) return false;
    const fi = ORDER.indexOf(fromId);
    const ti = ORDER.indexOf(toId);
    if (fi < 0 || ti < 0) return false;
    if (ti < fi) return true;
    if (toId === 'hf_outer') return true;
    if (toId === 'hf_yard') return isKilled('wang_erzhu');
    if (toId === 'hf_hall') return isKilled('diao_laopao');
    if (toId === 'hf_exit') return isKilled('mao_laohuan');
    return true;
  }

  function sleepMs(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function showFloat(text, color) {
    const el = document.createElement('div');
    el.style.cssText = [
      'position:fixed',
      'top:50%',
      'left:50%',
      'transform:translate(-50%,-50%)',
      'z-index:9999',
      'font-size:clamp(16px,2.8vw,22px)',
      'font-weight:bold',
      'color:' + (color || '#ffcc80'),
      'text-shadow:0 0 12px rgba(0,0,0,0.9)',
      'pointer-events:none',
      'max-width:90vw',
      'text-align:center'
    ].join(';');
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2400);
  }

  function updateGoldHud() {
    const el = document.getElementById('goldValue');
    if (!el) return;
    try {
      const save = JSON.parse(localStorage.getItem('game_save_0') || '{}');
      const g = save.player && save.player.gold != null ? save.player.gold : 0;
      el.textContent = String(g);
    } catch (e) {
      el.textContent = '0';
    }
  }

  function addToPlayerInventory(itemId, qty) {
    const q = Math.max(1, qty | 0);
    if (!window.playerData) {
      window.playerData = { inventory: [], equipment: {} };
    }
    const inv = window.playerData.inventory || (window.playerData.inventory = []);
    let left = q;
    for (let i = 0; i < inv.length && left > 0; i++) {
      if (inv[i].id === itemId && inv[i].quantity < 99) {
        const add = Math.min(99 - inv[i].quantity, left);
        inv[i].quantity += add;
        left -= add;
      }
    }
    while (left > 0) {
      const add = Math.min(99, left);
      inv.push({ id: itemId, quantity: add });
      left -= add;
    }
    localStorage.setItem('playerData', JSON.stringify(window.playerData));
  }

  function addGoldToSave(amount) {
    if (amount <= 0) return;
    try {
      let save = JSON.parse(localStorage.getItem('game_save_0') || '{}');
      if (!save.player) save.player = {};
      save.player.gold = (save.player.gold || 0) + amount;
      localStorage.setItem('game_save_0', JSON.stringify(save));
    } catch (e) {}
  }

  function rollDropTable(enemyId) {
    const enemy = window.ENEMIES && window.ENEMIES[enemyId];
    if (!enemy || !enemy.drops) return;
    enemy.drops.forEach((d) => {
      if (!d.itemId) return;
      if (Math.random() > (d.chance != null ? d.chance : 0)) return;
      if (d.itemId === 'gold') {
        const mn = d.minAmount != null ? d.minAmount : 1;
        const mx = d.maxAmount != null ? d.maxAmount : mn;
        const amt = mn + Math.floor(Math.random() * (mx - mn + 1));
        addGoldToSave(amt);
        return;
      }
      if (UNIQUE_IDS.indexOf(d.itemId) >= 0 && hasPartyOnce(d.itemId)) return;
      const n = d.minAmount != null ? d.minAmount : 1;
      const mx = d.maxAmount != null ? d.maxAmount : n;
      const qty = mx > n ? n + Math.floor(Math.random() * (mx - n + 1)) : n;
      addToPlayerInventory(d.itemId, qty);
      if (UNIQUE_IDS.indexOf(d.itemId) >= 0) setPartyOnce(d.itemId);
    });
  }

  /** 粗布劲装：在 30% 掉落命中后，白/绿/蓝三档权重（约 48% / 34% / 18%） */
  function rollCubuJinzhuangArmorId() {
    const r = Math.random();
    if (r < 0.48) return 'cubu_jinzhuang_bai';
    if (r < 0.82) return 'cubu_jinzhuang_lv';
    return 'cubu_jinzhuang_lan';
  }

  function qualityLabelZh(q) {
    if (q === 'common') return '残品';
    if (q === 'uncommon') return '低品';
    if (q === 'rare') return '中品';
    if (q === 'epic') return '极品';
    if (q === 'legendary') return '绝品';
    return q || '';
  }

  /** 首领额外：全队唯一三件各 30% 独立判定 */
  function rollMaoUniques() {
    const rolls = [
      { id: 'luocao_jianjing', p: 0.3 },
      { id: 'jingang_sword', p: 0.3 },
      { id: 'pojiu_yeyi', p: 0.3 }
    ];
    rolls.forEach((r) => {
      if (hasPartyOnce(r.id)) return;
      if (Math.random() > r.p) return;
      addToPlayerInventory(r.id, 1);
      setPartyOnce(r.id);
      showFloat('获得：' + (window.ITEMS && window.ITEMS[r.id] ? window.ITEMS[r.id].name : r.id), '#ffb74d');
    });
  }

  function peekDungeonEnemyId() {
    const key =
      window.BattleEntry && window.BattleEntry.KEYS && window.BattleEntry.KEYS.dungeonBattleContext
        ? window.BattleEntry.KEYS.dungeonBattleContext
        : 'dungeon_battle_context';
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      const ctx = JSON.parse(raw);
      if (ctx && ctx.dungeon === 'heifeng' && ctx.enemyId) return ctx.enemyId;
    } catch (e) {}
    return null;
  }

  function runSmallMapBattleRewardFloat(text, color, onDone) {
    const floatDiv = document.createElement('div');
    floatDiv.style.cssText = [
      'position:fixed',
      'top:52%',
      'left:50%',
      'transform:translate(-50%,0)',
      'font-size:clamp(15px,2.6vw,21px)',
      'font-weight:bold',
      'color:' + (color || '#f4d03f'),
      'text-shadow:0 1px 2px rgba(0,0,0,0.95),0 0 8px rgba(0,0,0,0.75)',
      'z-index:9999',
      'pointer-events:none',
      'opacity:0',
      'white-space:nowrap',
      'max-width:min(92vw,420px)',
      'overflow:hidden',
      'text-overflow:ellipsis',
      'will-change:transform,opacity',
      'transition:transform 0.88s cubic-bezier(0.22,1,0.36,1),opacity 0.35s ease'
    ].join(';');
    floatDiv.textContent = text;
    document.body.appendChild(floatDiv);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        floatDiv.style.opacity = '1';
        floatDiv.style.transform = 'translate(-50%,calc(-22vh - 28px))';
      });
    });
    setTimeout(() => {
      floatDiv.style.opacity = '0';
    }, 720);
    setTimeout(() => {
      try {
        document.body.removeChild(floatDiv);
      } catch (e) {}
      if (typeof onDone === 'function') onDone();
    }, 1000);
  }

  /** 战后数值飘字：按数额从低到高依次播放（再打再结，留在副本地图页） */
  function playHeifengNumericRewardFloatsAscending(onDone) {
    let data = null;
    if (window.BattleSettlement && typeof BattleSettlement.takePostBattleMapRewardFloats === 'function') {
      data = BattleSettlement.takePostBattleMapRewardFloats();
    } else {
      const raw = localStorage.getItem('battle_map_reward_floats');
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch (e) {
          data = null;
        }
        localStorage.removeItem('battle_map_reward_floats');
      }
    }
    if (!data) {
      if (typeof onDone === 'function') onDone();
      return;
    }
    const exp = parseInt(data.exp, 10) || 0;
    const gold = parseInt(data.gold, 10) || 0;
    const expReward = parseInt(data.expReward, 10) || 0;
    const lines = [];
    if (exp > 0) lines.push({ v: exp, text: '经验 +' + exp, color: '#ffeb3b' });
    if (gold > 0) lines.push({ v: gold, text: '银两 +' + gold, color: '#ff9800' });
    if (expReward > 0) lines.push({ v: expReward, text: '阅历 +' + expReward, color: '#9c27b0' });
    lines.sort(function (a, b) {
      return a.v - b.v;
    });
    if (lines.length === 0) {
      if (typeof onDone === 'function') onDone();
      return;
    }
    let idx = 0;
    function next() {
      if (idx >= lines.length) {
        if (typeof onDone === 'function') onDone();
        return;
      }
      const row = lines[idx++];
      runSmallMapBattleRewardFloat(row.text, row.color, function () {
        setTimeout(next, 380);
      });
    }
    next();
  }

  function playHeifengSettlementSequence(snapEnemyId, onDone) {
    const en = window.ENEMIES && window.ENEMIES[snapEnemyId];
    const label = en ? '【Lv.' + en.level + ' ' + en.name + '】战利结算' : '战利结算';
    runSmallMapBattleRewardFloat(label, '#d7ccc8', function () {
      setTimeout(function () {
        playHeifengNumericRewardFloatsAscending(onDone);
      }, 220);
    });
  }

  function processBattleReturn(won) {
    const key =
      window.BattleEntry && window.BattleEntry.KEYS && window.BattleEntry.KEYS.dungeonBattleContext
        ? window.BattleEntry.KEYS.dungeonBattleContext
        : 'dungeon_battle_context';
    const raw = localStorage.getItem(key);
    if (!raw) return;
    let ctx = null;
    try {
      ctx = JSON.parse(raw);
    } catch (e) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.removeItem(key);
    if (!ctx || ctx.dungeon !== 'heifeng' || !ctx.enemyId) return;
    if (!won) return;
    const eid = ctx.enemyId;
    addKill(eid);
    rollDropTable(eid);
    if (eid === 'mao_laohuan') {
      if (Math.random() < 0.3) {
        const aid = rollCubuJinzhuangArmorId();
        addToPlayerInventory(aid, 1);
        const meta = window.ITEMS && window.ITEMS[aid];
        const ql = meta && meta.quality ? qualityLabelZh(meta.quality) : '';
        showFloat('获得：粗布劲装（' + ql + '）', '#a5d6a7');
      }
      rollMaoUniques();
    }
  }

  /** 与 forest_map 同结构的待领取奖励应用 */
  function applyPendingBattleRewards() {
    const pendingData = window.BattleSettlement
      ? window.BattleSettlement.getPendingRaw()
      : localStorage.getItem('pending_battle_rewards');
    if (!pendingData) return false;
    try {
      const rewards = JSON.parse(pendingData);
      let saveData = localStorage.getItem('game_save_0');
      let save;
      if (!saveData) {
        save = { player: { gold: 0, exp: 0, level: 10 }, timestamp: Date.now(), version: '1.0.0' };
      } else save = JSON.parse(saveData);
      if (!save.player) save.player = {};
      const goldReward = parseInt(rewards.gold, 10) || 0;
      if (goldReward > 0) {
        save.player.gold = (save.player.gold || 0) + goldReward;
      }
      const expReward = parseInt(rewards.exp, 10) || 0;
      if (expReward > 0) {
        save.player.exp = (save.player.exp || 0) + expReward;
      }
      localStorage.setItem('game_save_0', JSON.stringify(save));
      if (window.BattleSettlement) window.BattleSettlement.clearPendingRewards();
      else localStorage.removeItem('pending_battle_rewards');
      return true;
    } catch (e) {
      return false;
    }
  }

  function renderMap() {
    const mapNodes = document.getElementById('mapNodes');
    const mapLines = document.querySelector('.map-lines');
    if (!mapNodes || !mapLines || !LOCATIONS) return;

    mapNodes.innerHTML = '';
    mapLines.innerHTML =
      '<defs><linearGradient id="hfLineGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="800" y2="0">' +
      '<stop offset="0%" stop-color="#5d4037" /><stop offset="50%" stop-color="#a1887f" /><stop offset="100%" stop-color="#5d4037" /></linearGradient></defs>';

    const cur = LOCATIONS[currentRoom];
    const adjacentIds = cur.connections;

    CONNECTIONS.forEach(([fromId, toId]) => {
      const from = LOCATIONS[fromId];
      const to = LOCATIONS[toId];
      if (!from || !to) return;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', from.x);
      line.setAttribute('y1', from.y);
      line.setAttribute('x2', to.x);
      line.setAttribute('y2', to.y);
      line.setAttribute('stroke', 'url(#hfLineGrad)');
      line.setAttribute('stroke-width', '3');
      line.setAttribute('stroke-linecap', 'round');
      const lit = fromId === currentRoom || toId === currentRoom;
      line.setAttribute('opacity', lit ? '1' : '0.35');
      mapLines.appendChild(line);
    });

    Object.values(LOCATIONS).forEach((loc) => {
      const isCurrent = loc.id === currentRoom;
      const isAdj = adjacentIds.includes(loc.id);
      const avail = isAdj && edgeAllowed(currentRoom, loc.id);
      const node = document.createElement('div');
      node.className =
        'location-node ' +
        (isCurrent ? 'current ' : '') +
        (avail ? 'available' : 'unavailable') +
        (loc.kind === 'exit' ? ' exit-node' : '');
      node.style.left = loc.x + 'px';
      node.style.top = loc.y + 'px';
      node.innerHTML =
        '<div class="node-inner">' +
        '<span class="node-icon">' +
        loc.icon +
        '</span>' +
        '<span class="node-name">' +
        loc.name +
        '</span>' +
        '<span class="node-status">' +
        (isCurrent ? '当前位置' : avail ? '可前往' : '未通') +
        '</span></div>';
      if (avail) {
        node.addEventListener('click', () => travelTo(loc.id));
      }
      mapNodes.appendChild(node);
    });
  }

  function travelTo(roomId) {
    if (!LOCATIONS[currentRoom].connections.includes(roomId)) return;
    if (!edgeAllowed(currentRoom, roomId)) {
      showFloat('前路未清，尚有强敌挡道。', '#ffab91');
      return;
    }
    currentRoom = roomId;
    renderMap();
    updatePanel();
  }

  function updatePanel() {
    const loc = LOCATIONS[currentRoom];
    document.getElementById('locIcon').textContent = loc.icon;
    document.getElementById('locName').textContent = loc.name;
    document.getElementById('locDesc').textContent = loc.desc;

    const actions = document.getElementById('dungeonActions');
    actions.innerHTML = '';

    if (loc.kind === 'camp') {
      const wrap = document.createElement('div');
      wrap.className = 'interact-list';
      const bDone = localStorage.getItem(INTERACT_BUNDLE) === '1';
      const jDone = localStorage.getItem(INTERACT_JAR) === '1';
      const b = document.createElement('div');
      b.className = 'interact-item' + (bDone ? ' done' : '');
      b.textContent = bDone ? '已翻查过地上的包裹' : '翻查地上包裹（概率碎银、干肉）';
      if (!bDone)
        b.onclick = () => {
          localStorage.setItem(INTERACT_BUNDLE, '1');
          addGoldToSave(5 + Math.floor(Math.random() * 16));
          addToPlayerInventory('lingzhi_cao', 1);
          showFloat('翻出些许碎银与干肉（灵芝草占位）。', '#ffcc80');
          updateGoldHud();
          updatePanel();
        };
      const j = document.createElement('div');
      j.className = 'interact-item' + (jDone ? ' done' : '');
      j.textContent = jDone ? '酒坛已被踢翻' : '踢翻酒坛（略泄愤，无额外战斗）';
      if (!jDone)
        j.onclick = () => {
          localStorage.setItem(INTERACT_JAR, '1');
          showFloat('酒坛碎裂，酒香混着泥腥散开。', '#bcaaa4');
          updatePanel();
        };
      wrap.appendChild(b);
      wrap.appendChild(j);
      const sec = document.createElement('div');
      sec.className = 'action-section';
      sec.innerHTML = '<div class="action-title">营地互动（全队各限一次）</div>';
      sec.appendChild(wrap);
      actions.appendChild(sec);
    }

    if (loc.kind === 'boss' && loc.enemyId) {
      const dead = isKilled(loc.enemyId);
      const sec = document.createElement('div');
      sec.className = 'action-section';
      sec.innerHTML = '<div class="action-title">' + loc.bossLine + '</div>';
      const btn = document.createElement('button');
      btn.className = 'btn-dungeon primary';
      btn.textContent = dead ? '已击退' : '进入战斗';
      btn.disabled = !!dead;
      if (!dead) {
        btn.onclick = () => startDungeonBattle(loc.enemyId);
      }
      sec.appendChild(btn);
      actions.appendChild(sec);
    }

    if (loc.kind === 'exit') {
      const sec = document.createElement('div');
      sec.className = 'action-section';
      const btn = document.createElement('button');
      btn.className = 'btn-dungeon exit';
      btn.textContent = '离开山寨（返回山贼窝棚）';
      btn.onclick = leaveDungeon;
      sec.appendChild(btn);
      actions.appendChild(sec);
    }
  }

  function leaveDungeon() {
    clearRun();
    localStorage.removeItem(RETURN_ROOM_KEY);
    localStorage.setItem(FOREST_EXIT_LOC_KEY, 'shanze_shed');
    window.location.href = 'forest_map.html';
  }

  let battleEnterLock = false;

  function ensureBattleEnterOverlay() {
    let root = document.getElementById('battleEnterOverlay');
    if (root) return root;
    root = document.createElement('div');
    root.id = 'battleEnterOverlay';
    root.className = 'battle-enter-overlay';
    root.setAttribute('aria-hidden', 'true');
    root.innerHTML =
      '<div class="battle-enter-zhan-layer" id="battleEnterZhanLayer">' +
      '<div class="battle-enter-zhan-badge">战</div>' +
      '</div>' +
      '<div class="battle-enter-black" id="battleEnterBlack"></div>';
    document.body.appendChild(root);
    return root;
  }

  async function startDungeonBattle(enemyId) {
    if (battleEnterLock) return;
    if (isKilled(enemyId)) {
      showFloat('此敌已被击退。', '#bcaaa4');
      updatePanel();
      return;
    }
    battleEnterLock = true;

    localStorage.setItem(RETURN_ROOM_KEY, currentRoom);

    const root = ensureBattleEnterOverlay();
    const black = document.getElementById('battleEnterBlack');
    const zhanLayer = document.getElementById('battleEnterZhanLayer');
    root.style.display = 'block';
    if (black) {
      black.classList.remove('is-on');
      black.style.opacity = '';
    }
    if (zhanLayer) {
      zhanLayer.style.opacity = '1';
      zhanLayer.style.transition = '';
      const badge = zhanLayer.querySelector('.battle-enter-zhan-badge');
      if (badge) {
        badge.style.animation = 'none';
        void badge.offsetWidth;
        badge.style.animation = '';
      }
    }

    await sleepMs(950);

    if (zhanLayer) {
      zhanLayer.style.transition = 'opacity 0.15s ease-out';
      zhanLayer.style.opacity = '0';
    }
    await sleepMs(150);
    if (black) {
      black.style.transition = 'none';
      black.style.opacity = '1';
    }
    await sleepMs(120);

    localStorage.setItem(
      (window.BattleEntry && window.BattleEntry.KEYS && window.BattleEntry.KEYS.battleEnterCinematic) ||
        'battle_enter_cinematic',
      '1'
    );
    const opts = {
      source: 'heifeng_dungeon',
      dungeonBattleContext: { dungeon: 'heifeng', enemyId: enemyId, submap: true }
    };
    if (window.BattleEntry) {
      window.BattleEntry.setPartyBattleContext(enemyId, opts);
    } else {
      localStorage.setItem('battleEnemyId', enemyId);
      localStorage.setItem('dungeon_battle_context', JSON.stringify(opts.dungeonBattleContext));
    }
    window.location.href = 'battle.html';
  }

  function init() {
    const exitBlack =
      window.BattleSettlement && typeof BattleSettlement.attachPostBattleMapBlackout === 'function'
        ? BattleSettlement.attachPostBattleMapBlackout()
        : null;

    const savedPlayerData = localStorage.getItem('playerData');
    if (savedPlayerData) {
      try {
        window.playerData = JSON.parse(savedPlayerData);
      } catch (e) {}
    }
    if (!window.playerData) window.playerData = { inventory: [], equipment: {} };

    const snapEnemyId = peekDungeonEnemyId();
    const won = applyPendingBattleRewards();

    if (!won) {
      processBattleReturn(false);
    } else if (snapEnemyId) {
      /** 飘字前先记击杀并刷新按钮，避免结算动画期间仍可点「进入战斗」 */
      processBattleReturn(true);
    }

    const rr = localStorage.getItem(RETURN_ROOM_KEY);
    if (rr && LOCATIONS[rr]) {
      currentRoom = rr;
      localStorage.removeItem(RETURN_ROOM_KEY);
    }

    updateGoldHud();
    renderMap();
    updatePanel();

    /** 战后 addKill 等会改变 edgeAllowed，必须重绘节点与点击态 */
    function refreshDungeonAfterBattle() {
      updateGoldHud();
      renderMap();
      updatePanel();
    }

    function finishInit() {
      if (won && snapEnemyId) {
        playHeifengSettlementSequence(snapEnemyId, refreshDungeonAfterBattle);
      } else if (won && !snapEnemyId) {
        processBattleReturn(true);
        refreshDungeonAfterBattle();
      }
    }

    if (exitBlack && window.BattleSettlement) {
      BattleSettlement.dismissPostBattleMapBlackout(exitBlack, finishInit);
    } else {
      finishInit();
    }
  }

  window.heifengTravelTo = travelTo;
  window.heifengLeaveDungeon = leaveDungeon;
  window.addEventListener('DOMContentLoaded', init);
})();
