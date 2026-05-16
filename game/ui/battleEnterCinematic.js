/**
 * 进战过场：「战」字闪烁 → 黑屏 → 写入 battle_enter_cinematic 后跳转战斗页。
 * 供青石镇、山林、黑风寨等小地图共用。
 */
(function (global) {
  let enterLock = false;

  function sleepMs(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function cinematicStorageKey() {
    return (
      (global.BattleEntry && global.BattleEntry.KEYS && global.BattleEntry.KEYS.battleEnterCinematic) ||
      'battle_enter_cinematic'
    );
  }

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

  /**
   * @param {() => void} navigate - 黑屏就绪后执行（内应 setPartyBattleContext + location.href）
   * @returns {Promise<void>}
   */
  async function runBeforeBattleNavigate(navigate) {
    if (enterLock) return;
    enterLock = true;

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

    try {
      localStorage.setItem(cinematicStorageKey(), '1');
    } catch (e) {}

    if (typeof navigate === 'function') {
      navigate();
    }
  }

  global.BattleEnterCinematic = {
    ensureOverlay: ensureBattleEnterOverlay,
    runBeforeBattleNavigate: runBeforeBattleNavigate
  };
})(typeof window !== 'undefined' ? window : globalThis);
