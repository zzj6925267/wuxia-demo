/**
 * 存档管理系统
 * @module SaveManager
 */

class SaveManager {
  constructor(playerSystem) {
    this.playerSystem = playerSystem;
    this.autoSaveTimer = null;
    this.storage = window.StorageFactory ? 
      window.StorageFactory.getBestStorage() : 
      new window.LocalStorageLayer();
    this._startAutoSave();
  }

  _startAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    this.autoSaveTimer = setInterval(() => {
      this.autoSave();
    }, window.GAME_CONFIG.SAVE.AUTO_SAVE_INTERVAL);
  }

  autoSave() {
    this.save(0);
  }

  async save(slot) {
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

      const key = `game_save_${slot}`;
      const success = await this.storage.save(key, saveData);
      
      if (success) {
        console.log(`Game saved to slot ${slot}`);
      } else {
        console.warn('Falling back to localStorage');
        localStorage.setItem(key, JSON.stringify(saveData));
      }
      return success;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }

  async load(slot) {
    if (slot < 0 || slot >= window.GAME_CONFIG.SAVE.MAX_SAVE_SLOTS) {
      console.error('Invalid save slot');
      return false;
    }

    try {
      const key = `game_save_${slot}`;
      let data = await this.storage.load(key);
      
      if (!data) {
        data = localStorage.getItem(key);
        if (data) {
          data = JSON.parse(data);
          console.log('Loaded from localStorage fallback');
        } else {
          console.log('No save data found in slot', slot);
          return false;
        }
      }

      this.playerSystem.player = window.deepClone(data.player);
      console.log(`Game loaded from slot ${slot}`);
      return true;
    } catch (error) {
      console.error('Failed to load game:', error);
      return false;
    }
  }

  async getSaveInfo(slot) {
    if (slot < 0 || slot >= window.GAME_CONFIG.SAVE.MAX_SAVE_SLOTS) {
      return null;
    }

    try {
      const key = `game_save_${slot}`;
      let data = await this.storage.load(key);
      
      if (!data) {
        const localStorageData = localStorage.getItem(key);
        if (localStorageData) {
          data = JSON.parse(localStorageData);
        } else {
          return null;
        }
      }

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

  async getAllSaveInfo() {
    const saves = [];
    for (let i = 0; i < window.GAME_CONFIG.SAVE.MAX_SAVE_SLOTS; i++) {
      const info = await this.getSaveInfo(i);
      if (info) {
        saves.push(info);
      }
    }
    return saves;
  }

  async deleteSave(slot) {
    if (slot < 0 || slot >= window.GAME_CONFIG.SAVE.MAX_SAVE_SLOTS) {
      return false;
    }

    try {
      const key = `game_save_${slot}`;
      const success = await this.storage.delete(key);
      localStorage.removeItem(key);
      
      if (success) {
        console.log(`Save deleted from slot ${slot}`);
      }
      return success;
    } catch (error) {
      console.error('Failed to delete save:', error);
      return false;
    }
  }

  resetGame() {
    this.playerSystem.player = window.deepClone(window.PLAYER_INITIAL);
    console.log('Game reset to initial state');
  }

  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }
}

window.SaveManager = SaveManager;