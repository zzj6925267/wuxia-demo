/**
 * 地图系统
 * @module MapSystem
 */

import { getLocationById, getAdjacentLocations } from '../data/maps.js';

/**
 * 地图系统类
 */
export class MapSystem {
  /**
   * 构造函数
   * @param {PlayerSystem} playerSystem - 玩家系统
   * @param {function} onLocationChange - 地点变更回调
   * @param {function} onTravelStart - 开始移动回调
   * @param {function} onTravelEnd - 移动结束回调
   */
  constructor(playerSystem, onLocationChange, onTravelStart, onTravelEnd) {
    this.playerSystem = playerSystem;
    this.onLocationChange = onLocationChange;
    this.onTravelStart = onTravelStart;
    this.onTravelEnd = onTravelEnd;
    
    this.currentLocation = null;
    this.isTraveling = false;
  }

  /**
   * 初始化地图
   * @param {string} initialLocation - 初始地点
   */
  init(initialLocation = 'yuelai_inn') {
    this.currentLocation = getLocationById(initialLocation);
    this.playerSystem.setFlag('current_location', initialLocation);
    
    if (this.onLocationChange) {
      this.onLocationChange(this.currentLocation);
    }
  }

  /**
   * 获取当前地点
   * @returns {object|null} 当前地点
   */
  getCurrentLocation() {
    return this.currentLocation;
  }

  /**
   * 获取相邻地点
   * @returns {Array} 相邻地点数组
   */
  getAdjacentLocations() {
    if (!this.currentLocation) return [];
    return getAdjacentLocations(this.currentLocation.id);
  }

  /**
   * 检查是否可以移动到指定地点
   * @param {string} targetLocationId - 目标地点ID
   * @returns {boolean} 是否可以移动
   */
  canTravelTo(targetLocationId) {
    if (!this.currentLocation) return false;
    if (this.isTraveling) return false;
    
    const adjacent = getAdjacentLocations(this.currentLocation.id);
    return adjacent.some(loc => loc.id === targetLocationId);
  }

  /**
   * 移动到指定地点
   * @param {string} targetLocationId - 目标地点ID
   * @returns {boolean} 是否成功开始移动
   */
  travelTo(targetLocationId) {
    if (!this.canTravelTo(targetLocationId)) {
      return false;
    }

    const targetLocation = getLocationById(targetLocationId);
    if (!targetLocation) return false;

    this.isTraveling = true;

    if (this.onTravelStart) {
      this.onTravelStart(this.currentLocation, targetLocation);
    }

    // 模拟移动时间
    setTimeout(() => {
      this._completeTravel(targetLocation);
    }, 1500);

    return true;
  }

  /**
   * 完成移动
   * @param {object} targetLocation - 目标地点
   */
  _completeTravel(targetLocation) {
    this.currentLocation = targetLocation;
    this.playerSystem.setFlag('current_location', targetLocation.id);
    this.isTraveling = false;

    if (this.onLocationChange) {
      this.onLocationChange(this.currentLocation);
    }

    if (this.onTravelEnd) {
      this.onTravelEnd(this.currentLocation);
    }
  }

  /**
   * 检查是否正在移动
   * @returns {boolean} 是否正在移动
   */
  isTravelingNow() {
    return this.isTraveling;
  }

  /**
   * 获取地点信息
   * @param {string} locationId - 地点ID
   * @returns {object|null} 地点信息
   */
  getLocationInfo(locationId) {
    return getLocationById(locationId);
  }

  /**
   * 获取移动路径
   * @param {string} targetLocationId - 目标地点ID
   * @returns {Array|null} 路径数组
   */
  getPath(targetLocationId) {
    if (!this.currentLocation) return null;
    
    // 简单实现：如果相邻则直接返回
    if (this.canTravelTo(targetLocationId)) {
      return [this.currentLocation.id, targetLocationId];
    }
    
    return null;
  }
}