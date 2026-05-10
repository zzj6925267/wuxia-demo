// 属性访问工具函数
// 提供安全的属性访问和兼容性处理

const AttributeHelper = {
  // === 配置 ===
  _debug: true, // 调试模式
  _lastWarnings: [], // 记录最后几个警告，避免重复

  // === 受保护的属性 ===
  _protectedProps: ['remainingPoints', 'martialArts', 'equipped', 'stats'],
  
  // === 有效属性列表 ===
  _validAttrs: {
    // 四维属性
    strength: '臂力',
    agility: '身法',
    bone: '根骨',
    qi: '内息',
    // 战斗属性
    attack: '攻击',
    defense: '防御',
    hp: '气血',
    maxHp: '气血上限',
    mp: '内力',
    maxMp: '内力上限',
    speed: '速度',
    hit: '命中',
    dodge: '闪避',
    parry: '招架',
    // 武学修为
    fist: '拳脚',
    sword: '剑法',
    blade: '刀法',
    lightSkill: '轻功',
    innerSkill: '内功'
  },

  // === 兼容性映射 ===
  _compatibilityMap: {
    'vitality': 'bone',
    'spirit': 'qi'
  },

  /**
   * 安全获取角色属性值
   * @param {Object} char - 角色对象
   * @param {string} attrName - 属性名称
   * @param {number} defaultValue - 默认值
   * @returns {number}
   */
  get(char, attrName, defaultValue = 0) {
    if (!char || typeof char !== 'object') {
      this._warn(`get: 角色对象无效 - char=${char}`);
      return defaultValue;
    }
    
    if (!char.stats || typeof char.stats !== 'object') {
      this._warn(`get: 角色属性不存在 - char.stats=${char.stats}`);
      return defaultValue;
    }
    
    // 直接获取属性
    if (char.stats[attrName] !== undefined) {
      return char.stats[attrName];
    }
    
    // 尝试映射后的属性名
    if (this._compatibilityMap[attrName]) {
      const mappedName = this._compatibilityMap[attrName];
      this._warn(`get: 属性名 "${attrName}" 已废弃，请使用 "${mappedName}"`);
      return char.stats[mappedName] || defaultValue;
    }
    
    this._warn(`get: 属性 "${attrName}" 不存在于角色数据中`);
    return defaultValue;
  },
  
  /**
   * 安全设置角色属性值
   * @param {Object} char - 角色对象
   * @param {string} attrName - 属性名称
   * @param {number} value - 新值
   */
  set(char, attrName, value) {
    if (!char || typeof char !== 'object') {
      this._warn(`set: 角色对象无效`);
      return;
    }
    
    if (!char.stats || typeof char.stats !== 'object') {
      this._warn(`set: 角色属性不存在`);
      return;
    }
    
    // 验证属性名
    if (!this.isValid(attrName)) {
      this._warn(`set: 属性名 "${attrName}" 无效`);
      return;
    }
    
    const oldValue = char.stats[attrName];
    char.stats[attrName] = value;
    
    if (this._debug) {
      console.log(`[AttributeHelper] 设置属性: ${attrName} 从 ${oldValue} → ${value}`);
    }
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
    return this._validAttrs[attrName] !== undefined;
  },

  /**
   * 验证所有武学技能配置
   * @param {Array} martialArts - 武学数据
   */
  validateAll(martialArts) {
    if (!Array.isArray(martialArts)) return;
    
    console.log('=== AttributeHelper 验证开始 ===');
    let errors = 0;

    martialArts.forEach((ma, maIndex) => {
      if (!ma.skills) return;
      
      ma.skills.forEach((skill, skIndex) => {
        if (!skill.effect) return;
        
        // 验证 bonusAttr
        if (skill.effect.bonusAttr && !this.isValid(skill.effect.bonusAttr)) {
          console.error(`[错误] ${ma.name} - ${skill.name}: bonusAttr "${skill.effect.bonusAttr}" 无效`);
          errors++;
        }
        
        // 验证是否使用了废弃属性名
        if (skill.effect.bonusAttr && this._compatibilityMap[skill.effect.bonusAttr]) {
          const newName = this._compatibilityMap[skill.effect.bonusAttr];
          console.warn(`[警告] ${ma.name} - ${skill.name}: 使用废弃属性名 "${skill.effect.bonusAttr}"，应改为 "${newName}"`);
        }
      });
    });
    
    console.log(`=== 验证完成: ${errors} 个错误 ===`);
    return errors === 0;
  },

  /**
   * 从存档安全合并数据（保护重要属性不被覆盖）
   * @param {Object} target - 目标角色对象
   * @param {Object} source - 源存档数据
   */
  safeMerge(target, source) {
    if (!target || !source) return;
    
    // 保存受保护的属性
    const backup = {};
    this._protectedProps.forEach(prop => {
      backup[prop] = target[prop];
    });
    
    // 合并数据
    Object.assign(target, source);
    
    // 恢复受保护的属性
    this._protectedProps.forEach(prop => {
      if (backup[prop] !== undefined) {
        target[prop] = backup[prop];
      }
    });
    
    if (this._debug) {
      console.log('[AttributeHelper] 安全合并数据完成，保护了以下属性:', this._protectedProps);
    }
  },

  /**
   * 获取属性显示名称
   * @param {string} attrName - 属性名
   * @returns {string}
   */
  getDisplayName(attrName) {
    return this._validAttrs[attrName] || attrName;
  },

  /**
   * 内部方法：输出警告（避免重复）
   * @param {string} msg - 警告信息
   */
  _warn(msg) {
    if (!this._debug) return;
    
    const now = Date.now();
    // 只记录最近10个警告，避免重复刷屏
    const recent = this._lastWarnings.filter(w => now - w.time < 5000);
    const isDuplicate = recent.some(w => w.msg === msg);
    
    if (!isDuplicate) {
      console.warn('[AttributeHelper]', msg);
      this._lastWarnings.push({ msg, time: now });
      while (this._lastWarnings.length > 10) {
        this._lastWarnings.shift();
      }
    }
  }
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.AttributeHelper = AttributeHelper;
}
