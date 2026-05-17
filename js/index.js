/**
 * 游戏主入口
 * @module index
 */

// 使用全局变量（浏览器环境，已在config.js中定义）

/**
 * 游戏主类
 */
class Game {
  constructor() {
    // 游戏系统
    this.playerSystem = null;
    this.dialogSystem = null;
    this.battleSystem = null;
    this.inventorySystem = null;
    this.mapSystem = null;
    this.saveManager = null;
    this.aiWriter = null;

    // 游戏状态
    this.currentState = window.GAME_STATE ? window.GAME_STATE.MENU : 'menu';

    // 回调函数
    this.callbacks = {};
  }

  /**
   * 初始化游戏
   */
  async init() {
    // 创建玩家系统
    this.playerSystem = new PlayerSystem();

    // 创建存档管理器
    this.saveManager = new SaveManager(this.playerSystem);

    // 自动加载存档（如果有）
    await this._autoLoadSave();

    // 创建地图系统
    this.mapSystem = new MapSystem(
      this.playerSystem,
      (location) => this._onLocationChange(location),
      (from, to) => this._onTravelStart(from, to),
      (location) => this._onTravelEnd(location)
    );

    // 创建对话系统
    this.dialogSystem = new DialogSystem(
      this.playerSystem,
      (dialog) => this._onDialogStart(dialog),
      (dialog) => this._onDialogEnd(dialog),
      (choice) => this._onChoice(choice)
    );

    // 创建战斗系统
    this.battleSystem = new BattleSystem(
      this.playerSystem,
      (player, enemy) => this._onBattleStart(player, enemy),
      (result) => this._onBattleEnd(result),
      (turn, isPlayerTurn) => this._onTurn(turn, isPlayerTurn),
      (attacker, skillName, damage, isCritical, isDodge, isDead) =>
        this._onDamage(attacker, skillName, damage, isCritical, isDodge, isDead)
    );

    // 创建背包系统
    this.inventorySystem = new InventorySystem(
      this.playerSystem,
      () => this._onInventoryChange()
    );

    // 创建AI文案系统
    if (GAME_CONFIG.AI && GAME_CONFIG.AI.ENABLED) {
      this._initAI();
    }

    console.log('游戏初始化完成');
  }

  /**
   * 自动加载存档
   */
  async _autoLoadSave() {
    const saveInfo = await this.saveManager.getSaveInfo(0);
    if (!saveInfo) return;

    const loaded = await this.saveManager.load(0);
    if (!loaded) return;

    console.log('自动加载存档成功');
    await this._applyPendingBattleRewards();
  }

  /**
   * 应用待处理的战斗奖励
   */
  async _applyPendingBattleRewards() {
    const pendingData = window.BattleSettlement
      ? window.BattleSettlement.getPendingRaw()
      : localStorage.getItem('pending_battle_rewards');
    if (!pendingData) return;

    try {
      const rewards = JSON.parse(pendingData);

      // 应用阅历奖励
      if (rewards.expReward > 0) {
        this.playerSystem.addExperience(rewards.expReward);
        console.log(`应用阅历奖励: +${rewards.expReward}`);
      }

      // 应用银两奖励
      if (rewards.goldReward > 0) {
        this.playerSystem.addGold(rewards.goldReward);
        console.log(`应用银两奖励: +${rewards.goldReward}`);
      }

      // 清除待处理奖励
      if (window.BattleSettlement) {
        window.BattleSettlement.clearPendingRewards();
      } else {
        localStorage.removeItem('pending_battle_rewards');
      }
      console.log('战斗奖励已应用');

      await this.saveGame(0);
      console.log('存档已保存');
    } catch (error) {
      console.error('应用战斗奖励失败:', error);
    }
  }

  /**
   * 初始化AI文案系统
   */
  _initAI() {
    try {
      this.aiWriter = new AIWriter();

      // 加载保存的配置
      const config = localStorage.getItem('ai_config');
      if (config) {
        const data = JSON.parse(config);
        this.aiWriter.setProvider(data.provider || 'WENXIN_YIYAN');
        this.aiWriter.setApiKey(data.apiKey || '', data.secretKey || '');
      }

      console.log('AI文案系统初始化完成');
    } catch (error) {
      console.warn('AI文案系统初始化失败:', error.message);
      this.aiWriter = null;
    }
  }

  /**
   * 获取AI文案生成器
   * @returns {AIWriter|null} AIWriter实例
   */
  getAIWriter() {
    return this.aiWriter;
  }

  /**
   * 检查AI是否可用
   * @returns {boolean} 是否可用
   */
  isAIEnabled() {
    return this.aiWriter !== null;
  }

  /**
   * 开始新游戏
   */
  startNewGame() {
    this.playerSystem = new PlayerSystem();
    this.saveManager = new SaveManager(this.playerSystem);
    this.mapSystem.init('yuelai_inn');
    this.currentState = window.GAME_STATE.MAP;
    this._fireCallback('gameStart');
    console.log('新游戏开始');
  }

  /**
   * 加载游戏
   * @param {number} slot - 存档槽位
   * @returns {Promise<boolean>} 是否成功
   */
  async loadGame(slot) {
    const ok = await this.saveManager.load(slot);
    if (!ok) return false;

    const location = this.playerSystem.getFlag('current_location');
    this.mapSystem.init(location || 'yuelai_inn');
    this.currentState = window.GAME_STATE.MAP;
    this._fireCallback('gameLoad', { slot });
    console.log(`从存档槽位 ${slot} 加载游戏`);
    return true;
  }

  /**
   * 保存游戏
   * @param {number} slot - 存档槽位
   * @returns {Promise<boolean>} 是否成功
   */
  async saveGame(slot) {
    return this.saveManager.save(slot);
  }

  /**
   * 获取游戏状态
   * @returns {Promise<object>} 游戏状态
   */
  async getGameState() {
    return {
      currentState: this.currentState,
      player: this.playerSystem.getStatusSummary(),
      location: this.mapSystem.getCurrentLocation(),
      isInDialog: this.dialogSystem.isDialogActive(),
      isInBattle: this.battleSystem.isBattleActive(),
      saves: await this.saveManager.getAllSaveInfo()
    };
  }

  /**
   * 设置回调函数
   * @param {string} eventName - 事件名称
   * @param {function} callback - 回调函数
   */
  on(eventName, callback) {
    if (!this.callbacks[eventName]) {
      this.callbacks[eventName] = [];
    }
    this.callbacks[eventName].push(callback);
  }

  /**
   * 触发回调
   * @param {string} eventName - 事件名称
   * @param {*} data - 事件数据
   */
  _fireCallback(eventName, data = null) {
    if (this.callbacks[eventName]) {
      this.callbacks[eventName].forEach(callback => callback(data));
    }
  }

  // ==================== 回调处理 ====================

  _onLocationChange(location) {
    this._fireCallback('locationChange', location);
  }

  _onTravelStart(from, to) {
    this._fireCallback('travelStart', { from, to });
  }

  _onTravelEnd(location) {
    this._fireCallback('travelEnd', location);
  }

  _onDialogStart(dialog) {
    this.currentState = window.GAME_STATE.DIALOG;
    this._fireCallback('dialogStart', dialog);
  }

  _onDialogEnd(dialog) {
    this.currentState = window.GAME_STATE.MAP;
    this._fireCallback('dialogEnd', dialog);
  }

  _onChoice(choice) {
    this._fireCallback('choice', choice);
  }

  _onBattleStart(player, enemy) {
    this.currentState = window.GAME_STATE.BATTLE;
    this._fireCallback('battleStart', { player, enemy });
  }

  _onBattleEnd(result) {
    this.currentState = window.GAME_STATE.MAP;
    this._fireCallback('battleEnd', result);
  }

  _onTurn(turn, isPlayerTurn) {
    this._fireCallback('turn', { turn, isPlayerTurn });
  }

  _onDamage(attacker, skillName, damage, isCritical, isDodge, isDead) {
    this._fireCallback('damage', { attacker, skillName, damage, isCritical, isDodge, isDead });
  }

  _onInventoryChange() {
    this._fireCallback('inventoryChange');
  }
}

// 创建全局游戏实例
const game = new Game();

// 暴露到全局
window.Game = Game;
window.game = game;
