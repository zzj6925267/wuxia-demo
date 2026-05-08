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
    this.currentState = GAME_STATE.MENU;

    // 回调函数
    this.callbacks = {};
  }

  /**
   * 初始化游戏
   */
  init() {
    // 创建玩家系统
    this.playerSystem = new PlayerSystem();

    // 创建存档管理器
    this.saveManager = new SaveManager(this.playerSystem);

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
    this.currentState = GAME_STATE.MAP;
    this._fireCallback('gameStart');
    console.log('新游戏开始');
  }

  /**
   * 加载游戏
   * @param {number} slot - 存档槽位
   * @returns {boolean} 是否成功
   */
  loadGame(slot) {
    if (this.saveManager.load(slot)) {
      const location = this.playerSystem.getFlag('current_location');
      this.mapSystem.init(location || 'yuelai_inn');
      this.currentState = GAME_STATE.MAP;
      this._fireCallback('gameLoad', { slot });
      console.log(`从存档槽位 ${slot} 加载游戏`);
      return true;
    }
    return false;
  }

  /**
   * 保存游戏
   * @param {number} slot - 存档槽位
   * @returns {boolean} 是否成功
   */
  saveGame(slot) {
    return this.saveManager.save(slot);
  }

  /**
   * 获取游戏状态
   * @returns {object} 游戏状态
   */
  getGameState() {
    return {
      currentState: this.currentState,
      player: this.playerSystem.getStatusSummary(),
      location: this.mapSystem.getCurrentLocation(),
      isInDialog: this.dialogSystem.isDialogActive(),
      isInBattle: this.battleSystem.isBattleActive(),
      saves: this.saveManager.getAllSaveInfo()
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
    this.currentState = GAME_STATE.DIALOG;
    this._fireCallback('dialogStart', dialog);
  }

  _onDialogEnd(dialog) {
    this.currentState = GAME_STATE.MAP;
    this._fireCallback('dialogEnd', dialog);
  }

  _onChoice(choice) {
    this._fireCallback('choice', choice);
  }

  _onBattleStart(player, enemy) {
    this.currentState = GAME_STATE.BATTLE;
    this._fireCallback('battleStart', { player, enemy });
  }

  _onBattleEnd(result) {
    this.currentState = GAME_STATE.MAP;
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