/**
 * 战斗入口（四阶段改造 · 阶段 1）
 * 全项目进入「队伍战 battle.html」时，请走本模块，避免各处散落 localStorage + location。
 *
 * 阶段 4（单入口形态）未实施：主菜单 Game 仍可使用 BattleSystem（单敌），与队伍战并存。
 */
const BattleEntry = {
  KEYS: {
    enemyId: 'battleEnemyId',
    preBattleLocation: 'preBattleLocation',
    /** 可选：来源页面 id，便于日后统计/调试 */
    source: 'battle_entry_source',
    /** 地图过场黑屏切入后，战斗页做一次黑幕淡出 */
    battleEnterCinematic: 'battle_enter_cinematic'
  },

  /**
   * 仅写入进入战斗所需的 localStorage（不跳转）。用于地图页先播过场再 `location.href`。
   * @param {string} enemyId
   * @param {object} [opts] 同 startPartyBattle
   */
  setPartyBattleContext(enemyId, opts = {}) {
    if (!enemyId) {
      console.warn('BattleEntry.setPartyBattleContext: enemyId 为空');
      return;
    }
    localStorage.setItem(this.KEYS.enemyId, enemyId);
    if (opts.preBattleLocation != null && opts.preBattleLocation !== '') {
      localStorage.setItem(this.KEYS.preBattleLocation, String(opts.preBattleLocation));
    } else {
      localStorage.removeItem(this.KEYS.preBattleLocation);
    }
    if (opts.source) {
      localStorage.setItem(this.KEYS.source, String(opts.source));
    } else {
      localStorage.removeItem(this.KEYS.source);
    }
  },

  /**
   * 进入队伍战页面（相对当前目录加载 battle.html）。
   * @param {string} enemyId - 敌人 id（与 ENEMIES / 战斗逻辑一致）
   * @param {object} [opts]
   * @param {string} [opts.preBattleLocation] - 战后返回用（如山林节点 id）
   * @param {string} [opts.source] - 可选，标记从哪张图进入
   * @param {string} [opts.battlePageHref] - 默认 'battle.html'
   */
  startPartyBattle(enemyId, opts = {}) {
    this.setPartyBattleContext(enemyId, opts);
    window.location.href = opts.battlePageHref || 'battle.html';
  },

  peekEnemyId() {
    return localStorage.getItem(this.KEYS.enemyId);
  },

  clearEnemyLaunchContext() {
    localStorage.removeItem(this.KEYS.enemyId);
    localStorage.removeItem(this.KEYS.source);
  }
};

if (typeof window !== 'undefined') {
  window.BattleEntry = BattleEntry;
}
