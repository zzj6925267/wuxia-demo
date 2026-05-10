// 数据验证器
// 在开发过程中验证配置数据的正确性

const Validator = {
  // 有效的属性名称列表
  validAttributes: [
    'strength', 'agility', 'bone', 'qi',
    'attack', 'defense', 'hp', 'maxHp', 'mp', 'maxMp',
    'speed', 'hit', 'dodge', 'parry',
    'fist', 'sword', 'blade', 'lightSkill', 'innerSkill'
  ],

  // 有效的技能效果类型
  validEffectTypes: [
    'attackBuff', 'defenseBuff', 'maxHpBuff', 'maxMpBuff',
    'speedBuff', 'hitBuff', 'dodgeBuff', 'parryBuff',
    'heal', 'damage', 'dot', 'hot'
  ],

  /**
   * 验证单个技能配置
   * @param {Object} skill - 技能对象
   * @param {string} martialName - 武学名称（用于错误提示）
   */
  validateSkill(skill, martialName = '未知武学') {
    if (!skill || typeof skill !== 'object') {
      console.error(`[Validator] 技能配置无效 - 武学: ${martialName}`);
      return false;
    }

    if (!skill.name) {
      console.error(`[Validator] 技能缺少名称 - 武学: ${martialName}`);
      return false;
    }

    if (skill.effect) {
      // 验证效果类型
      if (skill.effect.type && !this.validEffectTypes.includes(skill.effect.type)) {
        console.error(`[Validator] 无效的效果类型 "${skill.effect.type}" - 武学: ${martialName}, 技能: ${skill.name}`);
        console.error(`[Validator] 有效的效果类型:`, this.validEffectTypes);
        return false;
      }

      // 验证属性名称
      if (skill.effect.bonusAttr && !this.validAttributes.includes(skill.effect.bonusAttr)) {
        console.error(`[Validator] 无效的属性名称 "${skill.effect.bonusAttr}" - 武学: ${martialName}, 技能: ${skill.name}`);
        console.error(`[Validator] 有效的属性名称:`, this.validAttributes);
        return false;
      }

      // 验证数值类型
      if (skill.effect.baseValue !== undefined && typeof skill.effect.baseValue !== 'number') {
        console.error(`[Validator] baseValue 必须是数字类型 - 武学: ${martialName}, 技能: ${skill.name}, 值: ${skill.effect.baseValue}`);
        return false;
      }

      if (skill.effect.bonusPerPoint !== undefined && typeof skill.effect.bonusPerPoint !== 'number') {
        console.error(`[Validator] bonusPerPoint 必须是数字类型 - 武学: ${martialName}, 技能: ${skill.name}, 值: ${skill.effect.bonusPerPoint}`);
        return false;
      }
    }

    return true;
  },

  /**
   * 验证整个武学数据
   * @param {Array} martialArts - 武学数组
   */
  validateMartialArts(martialArts) {
    if (!Array.isArray(martialArts)) {
      console.error('[Validator] 武学数据必须是数组');
      return false;
    }

    let allValid = true;

    martialArts.forEach(martial => {
      if (!martial.name) {
        console.error('[Validator] 武学缺少名称');
        allValid = false;
        return;
      }

      if (martial.skills && Array.isArray(martial.skills)) {
        martial.skills.forEach(skill => {
          if (!this.validateSkill(skill, martial.name)) {
            allValid = false;
          }
        });
      }
    });

    if (allValid) {
      console.log('[Validator] 武学数据验证通过');
    }

    return allValid;
  },

  /**
   * 验证角色数据
   * @param {Object} character - 角色对象
   */
  validateCharacter(character) {
    if (!character || typeof character !== 'object') {
      console.error('[Validator] 角色数据无效');
      return false;
    }

    if (!character.name) {
      console.error('[Validator] 角色缺少名称');
      return false;
    }

    if (!character.stats || typeof character.stats !== 'object') {
      console.error(`[Validator] 角色 ${character.name} 缺少属性数据`);
      return false;
    }

    // 检查是否有未知属性
    const unknownAttrs = Object.keys(character.stats).filter(attr => !this.validAttributes.includes(attr));
    if (unknownAttrs.length > 0) {
      console.warn(`[Validator] 角色 ${character.name} 包含未知属性: ${unknownAttrs.join(', ')}`);
    }

    return true;
  },

  /**
   * 验证所有角色数据
   * @param {Array} characters - 角色数组
   */
  validateCharacters(characters) {
    if (!Array.isArray(characters)) {
      console.error('[Validator] 角色数据必须是数组');
      return false;
    }

    let allValid = true;

    characters.forEach(character => {
      if (!this.validateCharacter(character)) {
        allValid = false;
      }
    });

    if (allValid) {
      console.log('[Validator] 角色数据验证通过');
    }

    return allValid;
  },

  /**
   * 执行所有验证
   */
  validateAll() {
    console.log('[Validator] 开始验证游戏数据...');

    let allValid = true;

    // 验证武学数据
    if (window.martialArtsData) {
      allValid = this.validateMartialArts(window.martialArtsData) && allValid;
    }

    // 验证角色数据
    if (window.characters) {
      allValid = this.validateCharacters(window.characters) && allValid;
    }

    if (allValid) {
      console.log('[Validator] 所有数据验证通过！');
    }

    return allValid;
  }
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.Validator = Validator;
}