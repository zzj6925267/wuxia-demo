/**
 * 战斗战后「待发放奖励」队列（四阶段改造 · 阶段 2）
 * 统一 pending_battle_rewards 的读写键名，避免各处硬编码字符串。
 * 具体如何把奖励写入 game_save_0 仍由各页面逻辑处理（后续可再抽到同一函数）。
 *
 * 战后回地图：battle_exit_cinematic + battle_map_reward_floats
 * —— 先全黑盖住地图并应用存档，再淡出，最后在地图上飘字（经验/银两/阅历）。
 */
const BattleSettlement = {
  PENDING_KEY: 'pending_battle_rewards',
  /** 从战斗页返回小地图/大地图时，首帧全黑再淡出 */
  MAP_EXIT_CINE_KEY: 'battle_exit_cinematic',
  /** 淡出结束后由地图页读取并飘字，与 pending 存档写入分离 */
  MAP_REWARD_FLOATS_KEY: 'battle_map_reward_floats',

  getPendingRaw() {
    return localStorage.getItem(this.PENDING_KEY);
  },

  /**
   * @param {{ exp?: number, gold?: number, expReward?: number }} data
   */
  setPendingRewards(data) {
    localStorage.setItem(this.PENDING_KEY, JSON.stringify(data));
  },

  clearPendingRewards() {
    localStorage.removeItem(this.PENDING_KEY);
  },

  setBattleExitCinematicFlag() {
    localStorage.setItem(this.MAP_EXIT_CINE_KEY, '1');
  },

  /**
   * @param {{ exp?: number, gold?: number, expReward?: number }} payload
   */
  setPostBattleMapRewardFloats(payload) {
    if (!payload) return;
    localStorage.setItem(this.MAP_REWARD_FLOATS_KEY, JSON.stringify(payload));
  },

  /** @returns {object|null} */
  takePostBattleMapRewardFloats() {
    const raw = localStorage.getItem(this.MAP_REWARD_FLOATS_KEY);
    if (!raw) return null;
    localStorage.removeItem(this.MAP_REWARD_FLOATS_KEY);
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  },

  /**
   * 若存在战后回图标记，在 document.body 上叠一层纯黑（地图页首帧调用）。
   * @returns {HTMLElement|null}
   */
  attachPostBattleMapBlackout() {
    if (typeof document === 'undefined' || !document.body) return null;
    const existing = document.getElementById('postBattleMapBlackout');
    if (existing) return existing;
    if (localStorage.getItem(this.MAP_EXIT_CINE_KEY) !== '1') return null;
    const el = document.createElement('div');
    el.id = 'postBattleMapBlackout';
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:2147483000',
      'background:#000',
      'opacity:1',
      'pointer-events:none',
      'transition:opacity 0.45s ease-out'
    ].join(';');
    document.body.appendChild(el);
    return el;
  },

  /**
   * @param {HTMLElement|null} el
   * @param {() => void} [onDone] 淡出结束且节点移除后调用（例如开始飘奖励字）
   */
  dismissPostBattleMapBlackout(el, onDone) {
    if (!el) {
      if (typeof onDone === 'function') onDone();
      return;
    }
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      localStorage.removeItem(this.MAP_EXIT_CINE_KEY);
      try {
        document.documentElement.style.background = '';
        document.body.style.background = '';
      } catch (e) {
        /* ignore */
      }
      try {
        el.remove();
      } catch (e) {
        /* ignore */
      }
      if (typeof onDone === 'function') onDone();
    };

    el.style.transition = 'opacity 0.45s ease-out';
    const onEnd = (ev) => {
      if (ev.propertyName !== 'opacity') return;
      el.removeEventListener('transitionend', onEnd);
      done();
    };
    el.addEventListener('transitionend', onEnd);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.opacity = '0';
      });
    });
    setTimeout(() => {
      if (!el.parentNode) return;
      el.removeEventListener('transitionend', onEnd);
      done();
    }, 650);
  }
};

if (typeof window !== 'undefined') {
  window.BattleSettlement = BattleSettlement;
}
