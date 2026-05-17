/**
 * 青石镇 · 奇遇《陌路相逢》（叶轻绾入队）
 * 依赖 qingstone_map.html 注入的 window.__qingstoneMapApi
 */
(function (global) {
  const CHAIN_IDS = [
    'adv_companion_01',
    'adv_companion_02',
    'adv_companion_03',
    'adv_companion_04',
    'adv_companion_05'
  ];
  const LS_BATTLE1 = 'adv_companion_battle1_victory';
  const LS_BATTLE2 = 'adv_companion_battle2_victory';

  function api() {
    return global.__qingstoneMapApi || null;
  }

  function readState() {
    const a = api();
    if (a && a.readState) return a.readState();
    try {
      const raw = localStorage.getItem('playerState');
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function writeState(state) {
    const a = api();
    if (a && a.writeState) {
      a.writeState(state);
      return;
    }
    localStorage.setItem('playerState', JSON.stringify(state));
  }

  function isJoined() {
    return !!readState().companionJoined;
  }

  function taskEntry(taskId) {
    const at = readState().activeTasks || {};
    return at[taskId] || null;
  }

  function isTaskDone(taskId) {
    const t = taskEntry(taskId);
    return !!(t && (t.completed || t.isCompleted));
  }

  function isTaskActive(taskId) {
    const t = taskEntry(taskId);
    return !!(t && !(t.completed || t.isCompleted));
  }

  function acceptTask(taskId) {
    const state = readState();
    if (!state.activeTasks) state.activeTasks = {};
    if (!state.activeTasks[taskId]) {
      state.activeTasks[taskId] = { completed: false, isCompleted: false };
    }
    writeState(state);
  }

  function markTaskRewardsGranted(taskId) {
    const state = readState();
    if (!state.activeTasks || !state.activeTasks[taskId]) return;
    state.activeTasks[taskId].rewardsGranted = true;
    writeState(state);
  }

  function grantTaskRewardsIfNeeded(taskId, showFloatRewards) {
    const a = api();
    if (!a || !a.applyRewards) return false;
    const t = taskEntry(taskId);
    if (!t || !(t.completed || t.isCompleted)) return false;
    if (t.rewardsGranted) return false;
    a.applyRewards(taskId);
    if (showFloatRewards && a.floatRewards) a.floatRewards(taskId);
    markTaskRewardsGranted(taskId);
    return true;
  }

  function completeTaskWithRewards(taskId) {
    const a = api();
    if (!a || !a.markStepComplete) return false;
    const t = taskEntry(taskId);
    const alreadyDone = !!(t && (t.completed || t.isCompleted));
    const newlyDone = a.markStepComplete(taskId);
    if (newlyDone) {
      if (a.applyRewards) a.applyRewards(taskId);
      if (a.floatRewards) a.floatRewards(taskId);
      markTaskRewardsGranted(taskId);
      return true;
    }
    if (alreadyDone) {
      return grantTaskRewardsIfNeeded(taskId, false);
    }
    return false;
  }

  /** 镇口战 2 已胜、待后巷邀请（持久化，防 LS 旗标被清后断档） */
  function isAwaitingCompanionInvite() {
    if (isJoined()) return false;
    const st = readState();
    return !!(st.advCompanionAwaitInvite || st.companionBattle2Cleared);
  }

  function ensureCompanionPostBattle2State() {
    if (isJoined()) return false;
    let battle2Won = false;
    try {
      battle2Won = global.localStorage.getItem(LS_BATTLE2) === '1';
    } catch (e) {}
    const state = readState();
    let changed = false;
    if (battle2Won) {
      try {
        global.localStorage.removeItem(LS_BATTLE2);
      } catch (e) {}
      if (!state.companionBattle2Cleared) {
        state.companionBattle2Cleared = true;
        changed = true;
      }
      if (!state.advCompanionAwaitInvite) {
        state.advCompanionAwaitInvite = true;
        changed = true;
      }
      if (changed) writeState(state);
      return true;
    }
    if (state.companionBattle2Cleared && !state.advCompanionAwaitInvite) {
      state.advCompanionAwaitInvite = true;
      writeState(state);
      return true;
    }
    return false;
  }

  function getCurrentStepId() {
    if (isJoined()) return null;
    if (isAwaitingCompanionInvite()) return 'invite';
    const at = readState().activeTasks || {};
    for (let i = 0; i < CHAIN_IDS.length; i++) {
      const id = CHAIN_IDS[i];
      const t = at[id];
      if (t && !(t.completed || t.isCompleted)) return id;
    }
    if (!at[CHAIN_IDS[0]]) return 'discover';
    for (let j = 0; j < CHAIN_IDS.length; j++) {
      if (!isTaskDone(CHAIN_IDS[j])) return CHAIN_IDS[j];
    }
    return null;
  }

  /** 修复断链：上一节已完成但下一节未 accept 时自动接上；补发已完成未领奖 */
  function reconcileCompanionQuestChain() {
    if (isJoined()) return;
    ensureCompanionPostBattle2State();
    const state = readState();
    if (!state.activeTasks || !state.activeTasks[CHAIN_IDS[0]]) return;

    let chainFixed = false;
    for (let i = 0; i < CHAIN_IDS.length - 1; i++) {
      const id = CHAIN_IDS[i];
      const nextId = CHAIN_IDS[i + 1];
      if (isTaskDone(id) && !taskEntry(nextId)) {
        acceptTask(nextId);
        chainFixed = true;
      }
    }

    let rewardsFixed = false;
    CHAIN_IDS.forEach(function (id) {
      if (grantTaskRewardsIfNeeded(id, false)) rewardsFixed = true;
    });

    if (chainFixed && api()) {
      showFloat('奇遇进度已接续，请按任务指引继续（仁心药铺找贺行舟）。', '#ce93d8');
    } else if (rewardsFixed && api()) {
      showFloat('已补发先前未到账的奇遇奖励。', '#d4af37');
    }

    if (chainFixed || rewardsFixed) updatePanel();
  }

  function showFloat(msg, color) {
    const a = api();
    if (a && a.showFloat) a.showFloat(msg, color || '#d4af37');
  }

  function findCompanionTaskDef(taskId) {
    if (typeof ALL_TASKS === 'undefined' || !ALL_TASKS.adventure) return null;
    return ALL_TASKS.adventure.find(function (t) {
      return t.id === taskId;
    });
  }

  function showNextStepHint(taskId) {
    if (taskId === 'invite') {
      showFloat('请回后巷与叶轻绾话别，可邀她同行。', '#e91e8c');
      return;
    }
    const def = findCompanionTaskDef(taskId);
    if (!def) return;
    let loc = def.location || def.name;
    if (loc.indexOf('青石镇 · ') === 0) loc = loc.slice('青石镇 · '.length);
    showFloat('下一步 · ' + loc, '#ce93d8');
  }

  /** 完成当前节并自动接取下一节（无需打开任务面板） */
  function advanceCompanionChainAfter(completedTaskId) {
    if (!completedTaskId || CHAIN_IDS.indexOf(completedTaskId) < 0) return;
    reconcileCompanionQuestChain();

    acceptTask(completedTaskId);
    completeTaskWithRewards(completedTaskId);

    const idx = CHAIN_IDS.indexOf(completedTaskId);
    const nextId = idx >= 0 && idx < CHAIN_IDS.length - 1 ? CHAIN_IDS[idx + 1] : null;
    if (nextId) acceptTask(nextId);

    reconcileCompanionQuestChain();
    showNextStepHint(nextId || completedTaskId);
    updatePanel();
  }

  function getObjectiveHintForStep(step) {
    if (!step) return '';
    if (step === 'discover') return '后巷似有呼救，前去与叶轻绾搭话。';
    if (step === 'invite') return '回后巷与叶轻绾话别，可点「邀请同行」。';
    const def = findCompanionTaskDef(step);
    if (!def) return '';
    if (def.location) {
      let loc = def.location;
      if (loc.indexOf('青石镇 · ') === 0) loc = loc.slice('青石镇 · '.length);
      return '前往 ' + loc;
    }
    return def.description;
  }

  function updatePanel() {
    const a = api();
    if (a && a.updatePanel) a.updatePanel();
  }

  function startDialogue(steps, onComplete) {
    const a = api();
    if (!a || !a.startDialogue) return;
    a.startDialogue(steps, onComplete);
  }

  function hideNpcRows() {
    const a = api();
    if (a && a.hideNpcRows) a.hideNpcRows();
  }

  const DIALOGUE_DISCOVER = [
    {
      name: '叶轻绾',
      title: '浣花剑阁外门',
      icon: '🌸',
      body: '少侠……请留步。我……我乃浣花剑阁外门弟子叶轻绾，奉命下山送信，却在镇外遭劫，信物被夺，只得躲进这条后巷……'
    },
    {
      name: '旁白',
      icon: '📜',
      body: '她按着肋下伤口，脸色苍白，目光却清亮。巷口风过，带来远处东市的喧哗。'
    },
    {
      name: '叶轻绾',
      title: '浣花剑阁外门',
      icon: '🌸',
      body: '若少侠肯援手，轻绾必记今日之恩。先去仁心药铺请大夫瞧瞧伤势，再……再寻那伙贼人下落。'
    }
  ];

  const DIALOGUE_HERBAL = [
    {
      name: '贺行舟',
      title: '仁心药铺掌柜',
      icon: '🧓',
      body: '哎哟，这脉象浮而急，是外伤兼惊气。姑娘且坐，老夫先熬一剂活血汤。'
    },
    {
      name: '贺行舟',
      title: '仁心药铺掌柜',
      icon: '🧓',
      body: '方才东市有人来问过「浣花剑阁」的信使，口气不善。少侠若要去，当心竹棚后头那几人。'
    },
    {
      name: '叶轻绾',
      title: '浣花剑阁外门',
      icon: '🌸',
      body: '（低声）他们追得紧……少侠去东市时，轻绾在此候着，万勿深入镇外。'
    }
  ];

  const DIALOGUE_AFTER_BATTLE1 = [
    {
      name: '叶轻绾',
      title: '浣花剑阁外门',
      icon: '🌸',
      body: '少侠平安回来了……东市那伙人，可是阁中死对头「断云会」的外围爪牙？'
    },
    {
      name: '叶轻绾',
      title: '浣花剑阁外门',
      icon: '🌸',
      body: '这枚玉佩碎片是阁主留作记号的信物之一。他们夺了信函，却漏了它——镇口只怕还有埋伏。'
    },
    {
      name: '旁白',
      icon: '📜',
      body: '她将碎片系回腰间，指尖微颤，语气却稳了下来。'
    }
  ];

  const DIALOGUE_INVITE_PROMPT = [
    {
      name: '叶轻绾',
      title: '浣花剑阁外门',
      icon: '🌸',
      body: '镇口那一战，多亏少侠。轻绾无以为报，只余这一条命与同路之心。'
    },
    {
      name: '叶轻绾',
      title: '浣花剑阁外门',
      icon: '🌸',
      body: '若少侠不弃，愿随少侠行走江湖，剑阁所学，亦不敢藏私。'
    }
  ];

  function openInviteChoicePanel() {
    const panel = document.getElementById('qingstoneDialoguePanel');
    if (!panel) return;
    hideNpcRows();
    panel.style.display = 'block';
    document.getElementById('qingstoneDialogueNpcIcon').textContent = '🌸';
    document.getElementById('qingstoneDialogueNpcName').textContent = '叶轻绾（浣花剑阁）';
    document.getElementById('qingstoneDialogueText').textContent =
      '她扶着墙站定，目光澄澈，等你开口。';
    const optsEl = document.getElementById('qingstoneDialogueOptions');
    if (!optsEl) return;
    optsEl.innerHTML =
      '<button type="button" class="dialogue-option companion-quest-invite-btn" id="companionQuestInviteBtn">🌸 邀请同行</button>' +
      '<button type="button" class="dialogue-option return" id="companionQuestInviteLater">暂且别过</button>';
    document.getElementById('companionQuestInviteBtn').addEventListener('click', onInviteCompanion);
    document.getElementById('companionQuestInviteLater').addEventListener('click', closeInvitePanel);
  }

  function closeInvitePanel() {
    const panel = document.getElementById('qingstoneDialoguePanel');
    if (panel) panel.style.display = 'none';
    updatePanel();
  }

  function onInviteCompanion() {
    if (isJoined()) {
      closeInvitePanel();
      return;
    }
    const state = readState();
    state.companionJoined = true;
    state.advCompanionAwaitInvite = false;
    delete state.companionBattle2Cleared;
    writeState(state);
    if (isTaskActive('adv_companion_05')) {
      completeTaskWithRewards('adv_companion_05');
    }
    if (typeof window.applyPlayerCharactersFromStorage === 'function') {
      window.applyPlayerCharactersFromStorage();
    }
    if (typeof window.syncCharacterBaseStatsById === 'function') {
      try {
        window.syncCharacterBaseStatsById(2);
      } catch (e) {
        console.warn('onInviteCompanion stat sync', e);
      }
    }
    closeInvitePanel();
    showFloat('叶轻绾拱手道：「此后同路，请少侠多多指教。」', '#e91e8c');
    updatePanel();
  }

  function onDiscoverTalkComplete() {
    advanceCompanionChainAfter('adv_companion_01');
  }

  function onHerbalTalkComplete() {
    if (isJoined()) return;
    reconcileCompanionQuestChain();
    if (isTaskDone('adv_companion_02')) return;
    advanceCompanionChainAfter('adv_companion_02');
  }

  function onAfterBattle1TalkComplete() {
    if (isJoined()) return;
    reconcileCompanionQuestChain();
    if (isTaskDone('adv_companion_04')) return;
    advanceCompanionChainAfter('adv_companion_04');
  }

  function startInviteFlow() {
    startDialogue(DIALOGUE_INVITE_PROMPT, function () {
      openInviteChoicePanel();
    });
  }

  async function startCompanionBattle(enemyId, returnLoc) {
    if (typeof BattleEntry === 'undefined' || typeof BattleEntry.setPartyBattleContext !== 'function') {
      showFloat('战斗入口未加载，请刷新页面重试。', '#f44336');
      return;
    }
    const opts = {
      source: 'qingstone_map',
      preBattleLocation: returnLoc
    };
    const goBattle = function () {
      BattleEntry.setPartyBattleContext(enemyId, opts);
      window.location.href = 'battle.html';
    };
    if (global.BattleEnterCinematic && BattleEnterCinematic.runBeforeBattleNavigate) {
      await BattleEnterCinematic.runBeforeBattleNavigate(goBattle);
    } else {
      BattleEntry.startPartyBattle(enemyId, opts);
    }
  }

  function tryPostBattleReturns() {
    reconcileCompanionQuestChain();
    if (isJoined()) return;

    if (global.localStorage.getItem(LS_BATTLE1) === '1') {
      try {
        global.localStorage.removeItem(LS_BATTLE1);
      } catch (e) {}
      if (!isTaskDone('adv_companion_03')) {
        advanceCompanionChainAfter('adv_companion_03');
        showFloat('东市劫信之徒已退。请回「后巷」与叶轻绾会合。', '#d4af37');
      }
    }

    if (ensureCompanionPostBattle2State() && isTaskActive('adv_companion_05')) {
      showFloat('镇口来犯已退。请回「后巷」与叶轻绾话别，可邀她同行。', '#e91e8c');
    }
    updatePanel();
  }

  function setSectionVisible(id, show) {
    const el = document.getElementById(id);
    if (el) el.style.display = show ? 'block' : 'none';
  }

  function refreshSections() {
    if (typeof global.refreshQingstoneNpcHub === 'function') {
      global.refreshQingstoneNpcHub();
    }
  }

  function hideNpcSections() {
    const a = api();
    if (a && a.hideNpcRows) a.hideNpcRows();
  }

  function getYeLiuqingHubTitle(step) {
    if (step === 'invite') return '浣花剑阁 · 可邀请同行';
    if (step === 'discover') return '浣花剑阁 · 似有人呼救';
    return '浣花剑阁 · 可交谈';
  }

  function getHerbalQuestMenuOption() {
    if (isJoined()) return null;
    if (getCurrentStepId() !== 'adv_companion_02' || !isTaskActive('adv_companion_02')) return null;
    return {
      act: 'companion-herbal',
      label: '为叶姑娘请掌柜诊治熬药（奇遇）'
    };
  }

  function runHerbalQuestDialogue() {
    startDialogue(DIALOGUE_HERBAL, onHerbalTalkComplete);
  }

  function getLocationNpcs(locId) {
    const list = [];
    if (isJoined()) return list;

    const step = getCurrentStepId();

    if (
      locId === 'back_lane' &&
      (step === 'discover' || step === 'adv_companion_04' || step === 'invite')
    ) {
      list.push({
        id: 'ye_liuqing',
        icon: '🌸',
        name: '叶轻绾',
        title: getYeLiuqingHubTitle(step)
      });
    }

    if (locId === 'east_market' && step === 'adv_companion_03') {
      list.push({
        id: 'companion_east_fight',
        icon: '⚔️',
        name: '竹棚劫匪',
        title: '进入战斗'
      });
    }
    if (locId === 'qingstone_gate' && step === 'adv_companion_05' && !isAwaitingCompanionInvite()) {
      list.push({
        id: 'companion_gate_fight',
        icon: '⚔️',
        name: '镇口来犯',
        title: '进入战斗'
      });
    }
    return list;
  }

  function handleNpcClick(npcId) {
    if (npcId === 'ye_liuqing') {
      onMeetNpcClick();
      return true;
    }
    if (npcId === 'he_xingzhou') {
      return false;
    }
    if (npcId === 'companion_east_fight') {
      if (!isTaskActive('adv_companion_03')) return true;
      void startCompanionBattle('adv_companion_ambush', 'east_market');
      return true;
    }
    if (npcId === 'companion_gate_fight') {
      if (!isTaskActive('adv_companion_05')) return true;
      if (isAwaitingCompanionInvite()) return true;
      void startCompanionBattle('adv_companion_enforcer', 'qingstone_gate');
      return true;
    }
    return false;
  }

  function onMeetNpcClick() {
    const step = getCurrentStepId();
    if (step === 'discover') {
      startDialogue(DIALOGUE_DISCOVER, onDiscoverTalkComplete);
      return;
    }
    if (step === 'adv_companion_04') {
      startDialogue(DIALOGUE_AFTER_BATTLE1, onAfterBattle1TalkComplete);
      return;
    }
    if (step === 'invite') {
      startInviteFlow();
    }
  }

  function bindEventsOnce() {
    /* NPC 点击由 qingstone_map 统一 #qingstoneNpcList 委托 */
  }

  function getLocationDescExtra(locId) {
    if (isJoined()) return '';
    const step = getCurrentStepId();
    if (locId === 'back_lane' && step === 'discover') {
      return ' 巷深处似有人低声呼救，隐约带「浣花」二字。';
    }
    if (locId === 'back_lane' && step === 'invite') {
      return ' 叶轻绾倚墙等候，似有话要与你说。';
    }
    if (locId === 'renxin_herbal' && step === 'adv_companion_02') {
      return ' 药香里，坐堂掌柜贺行舟朝你点了点头，似在等你说清来意。';
    }
    if (locId === 'renxin_herbal') {
      return ' 药香清苦，坐堂掌柜贺行舟仍在秤药配方。';
    }
    if (locId === 'east_market' && step === 'adv_companion_03') {
      return ' 竹棚后头人影晃动，气氛不对。';
    }
    if (locId === 'qingstone_gate' && step === 'adv_companion_05') {
      return ' 牌坊下有人横棍拦路，来者不善。';
    }
    return '';
  }

  global.QingstoneCompanionQuest = {
    refreshSections: refreshSections,
    hideNpcSections: hideNpcSections,
    bindEventsOnce: bindEventsOnce,
    getLocationNpcs: getLocationNpcs,
    getHerbalQuestMenuOption: getHerbalQuestMenuOption,
    runHerbalQuestDialogue: runHerbalQuestDialogue,
    handleNpcClick: handleNpcClick,
    tryPostBattleReturns: tryPostBattleReturns,
    reconcileCompanionQuestChain: reconcileCompanionQuestChain,
    getLocationDescExtra: getLocationDescExtra,
    getObjectiveHintForStep: getObjectiveHintForStep,
    getCurrentStepId: getCurrentStepId,
    advanceCompanionChainAfter: advanceCompanionChainAfter,
    isJoined: isJoined
  };
})(typeof window !== 'undefined' ? window : global);
