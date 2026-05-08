/**
 * 存档管理系统
 * @module SaveManager
 */

// 使用全局变量（浏览器环境，已在config.js和characters.js中定义）

/**
 * 存档管理类
 */
class SaveManager {
  /**
   * 构造函数
   * @param {PlayerSystem} playerSystem - 玩家系统
   */
  constructor(playerSystem) {
    this.playerSystem = playerSystem;
    this.autoSaveTimer = null;
    this._startAutoSave();
  }

  /**
   * 开始自动存档
   */
  _startAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    this.autoSaveTimer = setInterval(() => {
      this.autoSave();
    }, window.GAME_CONFIG.SAVE.AUTO_SAVE_INTERVAL);
  }

  /**
   * 自动存档
   */
  autoSave() {
    this.save(0); // 使用第一个存档槽位进行自动存档
  }

  /**
   * 保存游戏
   * @param {number} slot - 存档槽位（0-4）
   * @returns {boolean} 是否成功
   */
  save(slot) {
    if (slot < 0 || slot >= window.GAME_CONFIG.SAVE.MAX_SAVE_SLOTS) {
      console.error('Invalid save slot');
      return false;
    }

    try {
      const saveData = {
        player: this.playerSystem.getPlayer(),
        timestamp: Date.now(),
        version: '1.0.0'
      };

      localStorage.setItem(`game_save_${slot}`, JSON.stringify(saveData));
      console.log(`Game saved to slot ${slot}`);
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }

  /**
   * 加载游戏
   * @param {number} slot - 存档槽位（0-4）
   * @returns {boolean} 是否成功
   */
  load(slot) {
    if (slot < 0 || slot >= window.GAME_CONFIG.SAVE.MAX_SAVE_SLOTS) {
      console.error('Invalid save slot');
      return false;
    }

    try {
      const saveData = localStorage.getItem(`game_save_${slot}`);
      if (!saveData) {
        console.log('No save data found in slot', slot);
        return false;
      }

      const data = JSON.parse(saveData);
      this.playerSystem.player = deepClone(data.player);
      console.log(`Game loaded from slot ${slot}`);
      return true;
    } catch (error) {
      console.error('Failed to load game:', error);
      return false;
    }
  }

  /**
   * 获取存档信息
   * @param {number} slot - 存档槽位（0-4）
   * @returns {object|null} 存档信息
   */
  getSaveInfo(slot) {
    if (slot < 0 || slot >= window.GAME_CONFIG.SAVE.MAX_SAVE_SLOTS) {
      return null;
    }

    try {
      const saveData = localStorage.getItem(`game_save_${slot}`);
      if (!saveData) {
        return null;
      }

      const data = JSON.parse(saveData);
      return {
        slot,
        timestamp: data.timestamp,
        version: data.version,
        playerName: data.player.name,
        level: data.player.level,
        gold: data.player.gold
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * 获取所有存档信息
   * @returns {Array} 存档信息数组
   */
  getAllSaveInfo() {
    const saves = [];
    for (let i = 0; i < window.GAME_CONFIG.SAVE.MAX_SAVE_SLOTS; i++) {
      const info = this.getSaveInfo(i);
      if (info) {
        saves.push(info);
      }
    }
    return saves;
  }

  /**
   * 删除存档
   * @param {number} slot - 存档槽位（0-4）
   * @returns {boolean} 是否成功
   */
  deleteSave(slot) {
    if (slot < 0 || slot >= window.GAME_CONFIG.SAVE.MAX_SAVE_SLOTS) {
      return false;
    }

    try {
      localStorage.removeItem(`game_save_${slot}`);
      console.log(`Save deleted from slot ${slot}`);
      return true;
    } catch (error) {
      console.error('Failed to delete save:', error);
      return false;
    }
  }

  /**
   * 重置游戏
   */
  resetGame() {
    this.playerSystem.player = window.deepClone(window.PLAYER_INITIAL);
    console.log('Game reset to initial state');
  }

  /**
   * 停止自动存档
   */
  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }
}

// 暴露到全局
window.SaveManager = SaveManager;