/**
 * 背包系统
 * @module InventorySystem
 */

import { ITEMS } from '../data/items.js';

/**
 * 背包系统类
 */
export class InventorySystem {
  /**
   * 构造函数
   * @param {PlayerSystem} playerSystem - 玩家系统
   * @param {function} onInventoryChange - 背包变化回调
   */
  constructor(playerSystem, onInventoryChange) {
    this.playerSystem = playerSystem;
    this.onInventoryChange = onInventoryChange;
  }

  /**
   * 获取背包物品
   * @returns {Array} 物品数组
   */
  getInventory() {
    const player = this.playerSystem.getPlayer();
    return player.inventory.map(item => ({
      ...item,
      data: ITEMS[item.id] || null
    }));
  }

  /**
   * 获取物品数量
   * @param {string} itemId - 物品ID
   * @returns {number} 数量
   */
  getItemCount(itemId) {
    const player = this.playerSystem.getPlayer();
    const item = player.inventory.find(i => i.id === itemId);
    return item ? item.quantity : 0;
  }

  /**
   * 添加物品
   * @param {string} itemId - 物品ID
   * @param {number} quantity - 数量
   * @returns {boolean} 是否成功
   */
  addItem(itemId, quantity = 1) {
    if (!ITEMS[itemId]) {
      console.error(`Item not found: ${itemId}`);
      return false;
    }

    this.playerSystem.addItem(itemId, quantity);
    
    if (this.onInventoryChange) {
      this.onInventoryChange();
    }

    return true;
  }

  /**
   * 移除物品
   * @param {string} itemId - 物品ID
   * @param {number} quantity - 数量
   * @returns {boolean} 是否成功
   */
  removeItem(itemId, quantity = 1) {
    const success = this.playerSystem.removeItem(itemId, quantity);
    
    if (success && this.onInventoryChange) {
      this.onInventoryChange();
    }

    return success;
  }

  /**
   * 使用物品
   * @param {string} itemId - 物品ID
   * @returns {object} 使用结果
   */
  useItem(itemId) {
    const item = ITEMS[itemId];
    if (!item) {
      return { success: false, message: '物品不存在' };
    }

    if (!this.playerSystem.removeItem(itemId, 1)) {
      return { success: false, message: '物品不足' };
    }

    let result = { success: true, item };

    // 根据物品类型执行效果
    switch (item.type) {
      case 'consumable':
        result = this._useConsumable(item);
        break;

      case 'weapon':
        result = this._equipWeapon(item);
        break;

      case 'armor':
        result = this._equipArmor(item);
        break;
    }

    if (this.onInventoryChange) {
      this.onInventoryChange();
    }

    return result;
  }

  /**
   * 使用消耗品
   * @param {object} item - 物品
   * @returns {object} 结果
   */
  _useConsumable(item) {
    let message = '';

    if (item.effects) {
      if (item.effects.hpRestore) {
        this.playerSystem.heal(item.effects.hpRestore);
        message += `恢复了 ${item.effects.hpRestore} 点生命`;
      }

      if (item.effects.mpRestore) {
        this.playerSystem.restoreMp(item.effects.mpRestore);
        if (message) message += '，';
        message += `恢复了 ${item.effects.mpRestore} 点内力`;
      }

      if (item.effects.gold) {
        this.playerSystem.addGold(item.effects.gold);
        if (message) message += '，';
        message += `获得了 ${item.effects.gold} 金币`;
      }
    }

    return {
      success: true,
      item,
      message: message || `${item.name}使用成功`
    };
  }

  /**
   * 装备武器
   * @param {object} item - 武器
   * @returns {object} 结果
   */
  _equipWeapon(item) {
    const player = this.playerSystem.getPlayer();
    
    // 如果已有装备，先卸下
    if (player.equippedWeapon) {
      this.playerSystem.addItem(player.equippedWeapon, 1);
    }

    player.equippedWeapon = item.id;
    
    // 更新攻击属性
    if (item.bonus && item.bonus.attack) {
      player.attack += item.bonus.attack;
    }

    return {
      success: true,
      item,
      message: `装备了 ${item.name}`
    };
  }

  /**
   * 装备护甲
   * @param {object} item - 护甲
   * @returns {object} 结果
   */
  _equipArmor(item) {
    const player = this.playerSystem.getPlayer();
    
    // 如果已有装备，先卸下
    if (player.equippedArmor) {
      this.playerSystem.addItem(player.equippedArmor, 1);
    }

    player.equippedArmor = item.id;
    
    // 更新防御属性
    if (item.bonus && item.bonus.defense) {
      player.defense += item.bonus.defense;
    }

    return {
      success: true,
      item,
      message: `装备了 ${item.name}`
    };
  }

  /**
   * 获取物品信息
   * @param {string} itemId - 物品ID
   * @returns {object|null} 物品信息
   */
  getItemInfo(itemId) {
    return ITEMS[itemId] || null;
  }

  /**
   * 获取分类物品
   * @param {string} category - 分类名称
   * @returns {Array} 物品数组
   */
  getItemsByCategory(category) {
    const inventory = this.getInventory();
    return inventory.filter(item => item.data && item.data.category === category);
  }

  /**
   * 检查是否有物品
   * @param {string} itemId - 物品ID
   * @param {number} quantity - 数量
   * @returns {boolean} 是否有足够数量
   */
  hasItem(itemId, quantity = 1) {
    return this.getItemCount(itemId) >= quantity;
  }
}