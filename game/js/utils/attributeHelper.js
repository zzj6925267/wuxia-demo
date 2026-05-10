// 属性访问工具函数
// 提供安全的属性访问和兼容性处理

const AttributeHelper = {
  /**
   * 安全获取角色属性值
   * @param {Object} char - 角色对象
   * @param {string} attrName - 属性名称
   * @param {number} defaultValue - 默认值
   * @returns {number}
   */
  get(char, attrName, defaultValue = 0) {
    if (!char || typeof char !== 'object') {
      console.warn(`AttributeHelper.get: 角色对象无效 - char=${char}`);
      return defaultValue;
    }
    
    if (!char.stats || typeof char.stats !== 'object') {
      console.warn(`AttributeHelper.get: 角色属性不存在 - char.stats=${char.stats}`);
      return defaultValue;
    }
    
    // 直接获取属性
    if (char.stats[attrName] !== undefined) {
      return char.stats[attrName];
    }
    
    // 兼容旧属性名映射
    const compatibilityMap = {
      'vitality': 'bone',
      'spirit': 'qi'
    };
    
    // 尝试映射后的属性名
    if (compatibilityMap[attrName]) {
      const mappedName = compatibilityMap[attrName];
      console.warn(`AttributeHelper.get: 属性名 "${attrName}" 已废弃，请使用 "${mappedName}"`);
      return char.stats[mappedName] || defaultValue;
    }
    
    console.warn(`AttributeHelper.get: 属性 "${attrName}" 不存在于角色数据中`);
    return defaultValue;
  },
  
  /**
   * 计算技能加成（自动处理属性名兼容性）
   * @param {Object} effect - 技能效果配置
   * @param {Object} char - 角色对象
   * @returns {number}
   */
  calculateBonus(effect, char) {
    let bonus = effect.baseValue || 0;
    
    if (effect.bonusAttr && effect.bonusPerPoint) {
      const attrValue = this.get(char, effect.bonusAttr);
      bonus += attrValue * effect.bonusPerPoint;
    }
    
    return Math.ceil(bonus);
  },
  
  /**
   * 验证属性名是否有效
   * @param {string} attrName - 属性名称
   * @returns {boolean}
   */
  isValid(attrName) {
    const validAttrs = [
      'strength', 'agility', 'bone', 'qi',
      'attack', 'defense', 'hp', 'maxHp', 'mp', 'maxMp',
      'speed', 'hit', 'dodge', 'parry',
      'fist', 'sword', 'blade', 'lightSkill', 'innerSkill'
    ];
    return validAttrs.includes(attrName);
  }
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.AttributeHelper = AttributeHelper;
}