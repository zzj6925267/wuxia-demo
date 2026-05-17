/**
 * 开局角色创建：黑屏开场 → 五题四维（选后预览，点确定写入）→ 黑屏淡出 → 青石镇
 */
(function () {
  var DATA = window.CHARACTER_CREATION;
  var BOOT = window.NewGameBootstrap;
  if (!DATA || !BOOT) {
    document.body.innerHTML =
      '<p style="color:#fff;padding:24px">缺少配置脚本，请通过 node server.js 访问。</p>';
    return;
  }

  var anchor = BOOT.FOUR_DIM_ANCHOR;
  var introOverlay = document.getElementById('introOverlay');
  var introText = document.getElementById('introText');
  var introHint = document.getElementById('introHint');
  var creationSheet = document.getElementById('creationSheet');
  var outroOverlay = document.getElementById('outroOverlay');
  var outroText = document.getElementById('outroText');
  var outroHint = document.getElementById('outroHint');
  var stepDots = document.getElementById('stepDots');
  var narrativeText = document.getElementById('narrativeText');
  var statsGrid = document.getElementById('statsGrid');
  var derivedPreview = document.getElementById('derivedPreview');
  var choicesList = document.getElementById('choicesList');
  var choicesTitle = document.getElementById('choicesTitle');
  var confirmBar = document.getElementById('confirmBar');
  var confirmPreviewText = document.getElementById('confirmPreviewText');
  var confirmBtn = document.getElementById('confirmBtn');

  var stats = BOOT.defaultFourDim();
  var questionIndex = 0;
  var answers = [];
  var pending = null;
  var typeTimer = null;

  confirmBtn.addEventListener('click', confirmPending);

  function typeWriter(el, text, speed, onDone) {
    if (typeTimer) {
      clearInterval(typeTimer);
      typeTimer = null;
    }
    var i = 0;
    el.textContent = '';
    typeTimer = setInterval(function () {
      if (i < text.length) {
        el.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(typeTimer);
        typeTimer = null;
        if (onDone) onDone();
      }
    }, speed || 48);
  }

  function runIntroLines(lines, idx, onComplete) {
    if (idx >= lines.length) {
      if (onComplete) onComplete();
      return;
    }
    var line = lines[idx];
    typeWriter(introText, line, 46, function () {
      introHint.hidden = false;
      introHint.textContent = DATA.intro.clickHint;
      function advance() {
        introHint.hidden = true;
        introOverlay.removeEventListener('click', advance);
        runIntroLines(lines, idx + 1, onComplete);
      }
      introOverlay.addEventListener('click', advance);
    });
  }

  function showCreationSheet() {
    introOverlay.classList.add('is-hidden');
    creationSheet.hidden = false;
    requestAnimationFrame(function () {
      creationSheet.classList.add('is-visible');
    });
    renderStepDots();
    renderStats();
    showQuestion(0);
  }

  function renderStepDots() {
    var total = DATA.questions.length;
    stepDots.innerHTML = '';
    for (var i = 0; i < total; i++) {
      var dot = document.createElement('div');
      dot.className = 'cc-step';
      if (i < questionIndex) dot.classList.add('is-done');
      if (i === questionIndex) dot.classList.add('is-current');
      stepDots.appendChild(dot);
    }
  }

  function getPreviewStats() {
    if (!pending) return stats;
    var opt = pending.option;
    var preview = {
      strength: stats.strength,
      agility: stats.agility,
      bone: stats.bone,
      qi: stats.qi
    };
    preview[opt.stat] = (preview[opt.stat] || anchor) + 1;
    return preview;
  }

  function renderStats(bumpStat, previewStatKey) {
    var labels = DATA.statLabels;
    var order = ['strength', 'agility', 'bone', 'qi'];
    var display = getPreviewStats();
    statsGrid.innerHTML = '';
    order.forEach(function (key) {
      var row = document.createElement('div');
      row.className = 'cc-stat-row';
      var lab = document.createElement('span');
      lab.className = 'cc-stat-label';
      lab.textContent = labels[key];
      var val = document.createElement('span');
      val.className = 'cc-stat-val';
      val.dataset.stat = key;
      var isPreview = previewStatKey === key && pending;
      val.textContent = String(display[key]);
      if (isPreview) val.classList.add('is-preview');
      if (bumpStat === key) val.classList.add('is-bump');
      row.appendChild(lab);
      row.appendChild(val);
      statsGrid.appendChild(row);
    });
    if (bumpStat) {
      setTimeout(function () {
        var el = statsGrid.querySelector('[data-stat="' + bumpStat + '"]');
        if (el) el.classList.remove('is-bump');
      }, 400);
    }
    updateDerivedPreview(display);
  }

  function updateDerivedPreview(four) {
    var s = four || stats;
    var lv = 1;
    var hp = 100;
    var mp = 50;
    var atk = 50;
    if (typeof deriveBaseStatFromFourDim === 'function') {
      hp = deriveBaseStatFromFourDim('hp', s.bone, lv);
      mp = deriveBaseStatFromFourDim('mp', s.qi, lv);
      atk = deriveBaseStatFromFourDim('attack', s.strength, lv);
    }
    derivedPreview.textContent =
      '预览 · 气血 ' + hp + '　内力 ' + mp + '　攻击 ' + atk + '（与角色系统公式一致）';
  }

  function highlightNarrative(text) {
    return text
      .replace(/青石镇/g, '<em>青石镇</em>')
      .replace(/武馆/g, '<em>武馆</em>')
      .replace(/师父/g, '<em>师父</em>');
  }

  function hideConfirmBar() {
    confirmBar.hidden = true;
    pending = null;
  }

  function updateConfirmBar() {
    if (!pending) {
      confirmBar.hidden = true;
      return;
    }
    var opt = pending.option;
    var statName = DATA.statLabels[opt.stat];
    var before = stats[opt.stat] || anchor;
    var after = before + 1;
    var isLast = questionIndex >= DATA.questions.length - 1;
    confirmPreviewText.textContent =
      '「' +
      opt.label +
      '」\n' +
      statName +
      '：' +
      before +
      ' → ' +
      after +
      '（确定后写入角色）' +
      (isLast ? '\n确定后将进入青石镇。' : '');
    confirmBar.hidden = false;
    confirmBtn.disabled = false;
    renderStats(null, opt.stat);
  }

  function showQuestion(idx) {
    questionIndex = idx;
    pending = null;
    hideConfirmBar();
    renderStepDots();
    var q = DATA.questions[idx];
    if (!q) {
      finishCreation();
      return;
    }
    choicesTitle.textContent = '第 ' + (idx + 1) + ' / ' + DATA.questions.length + ' 题';
    narrativeText.innerHTML = '';
    typeWriter(
      narrativeText,
      q.narrative.replace(/<[^>]+>/g, ''),
      32,
      function () {
        narrativeText.innerHTML = highlightNarrative(q.narrative);
      }
    );
    choicesList.innerHTML = '';
    q.options.forEach(function (opt, optIdx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cc-choice';
      btn.dataset.optionIndex = String(optIdx);
      btn.setAttribute('role', 'option');
      btn.innerHTML =
        '<span class="cc-choice-box" aria-hidden="true"></span><span>' +
        opt.label +
        ' <small style="color:#8b6914">（' +
        DATA.statLabels[opt.stat] +
        ' +1）</small></span>';
      btn.addEventListener('click', function () {
        selectOption(q, opt, optIdx);
      });
      choicesList.appendChild(btn);
    });
    renderStats();
  }

  function selectOption(question, option, optIdx) {
    pending = { question: question, option: option };
    choicesList.querySelectorAll('.cc-choice').forEach(function (btn, i) {
      btn.classList.toggle('is-selected', i === optIdx);
      btn.disabled = false;
    });
    updateConfirmBar();
  }

  function confirmPending() {
    if (!pending) return;
    var question = pending.question;
    var option = pending.option;
    stats[option.stat] = (stats[option.stat] || anchor) + 1;
    answers.push({
      questionId: question.id,
      stat: option.stat,
      label: option.label
    });
    hideConfirmBar();
    renderStats(option.stat);
    var next = questionIndex + 1;
    if (next >= DATA.questions.length) {
      setTimeout(finishCreation, 400);
    } else {
      setTimeout(function () {
        showQuestion(next);
      }, 320);
    }
  }

  function finishCreation() {
    creationSheet.classList.remove('is-visible');
    setTimeout(function () {
      creationSheet.hidden = true;
      var pendingSlot = sessionStorage.getItem('pending_new_game_slot');
      sessionStorage.removeItem('pending_new_game_slot');
      var slot =
        pendingSlot != null && pendingSlot !== '' ? parseInt(pendingSlot, 10) : null;
      if (slot != null && (isNaN(slot) || slot < 0 || slot > 4)) slot = null;
      BOOT.resetNewGame(stats, slot);
      outroOverlay.classList.remove('is-hidden');
      var line = DATA.outro.line;
      typeWriter(outroText, line, 46, function () {
        outroHint.hidden = false;
        outroHint.textContent = DATA.outro.clickHint;
        function goTown() {
          outroOverlay.removeEventListener('click', goTown);
          outroOverlay.classList.add('is-hidden');
          setTimeout(function () {
            window.location.replace('qingstone_map.html');
          }, 900);
        }
        outroOverlay.addEventListener('click', goTown);
      });
    }, 500);
  }

  function start() {
    runIntroLines(DATA.intro.lines, 0, showCreationSheet);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
