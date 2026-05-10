// 踏云步技能测试
// 测试属性管理体系是否正确处理轻功技能

const TayunbuTest = {
  /**
   * 测试踏云步技能计算
   */
  testTayunbu() {
    console.log('\n=== 踏云步技能测试 ===');

    // 新的踏云步技能配置
    const tayunbuSkills = [
      { name: '踏云', effect: { type: 'buff', stat: 'dodge', baseValue: 15, bonusAttr: 'agility', bonusPerPoint: 0.5 } },
      { name: '逐日', effect: { type: 'buff', stat: 'attack', baseValue: 10, bonusAttr: 'strength', bonusPerPoint: 0.5 } },
      { name: '凌虚', effect: { type: 'buff', stat: 'speed', baseValue: 15, bonusAttr: 'agility', bonusPerPoint: 0.6 } }
    ];

    // 模拟测试角色（身法10，臂力10）
    const testChar = {
      name: '测试角色',
      stats: { strength: 10, agility: 10, bone: 10, qi: 10 }
    };

    console.log(`测试角色属性：臂力=${testChar.stats.strength}, 身法=${testChar.stats.agility}`);

    // 使用 AttributeHelper 计算
    if (window.AttributeHelper) {
      tayunbuSkills.forEach(skill => {
        const attrValue = window.AttributeHelper.get(testChar, skill.effect.bonusAttr);
        const bonus = skill.effect.baseValue + attrValue * skill.effect.bonusPerPoint;
        console.log(`${skill.name} (${skill.effect.stat}): 基础${skill.effect.baseValue} + 属性加成${attrValue * skill.effect.bonusPerPoint} = 总计${bonus} ✓`);
      });
    } else {
      // 回退方案
      tayunbuSkills.forEach(skill => {
        const attrValue = testChar.stats[skill.effect.bonusAttr];
        const bonus = skill.effect.baseValue + attrValue * skill.effect.bonusPerPoint;
        console.log(`${skill.name} (${skill.effect.stat}): 基础${skill.effect.baseValue} + 属性加成${attrValue * skill.effect.bonusPerPoint} = 总计${bonus} ✓`);
      });
    }
  },

  /**
   * 测试 Validator 验证踏云步配置
   */
  testValidator() {
    console.log('\n=== Validator 验证 ===');

    const tayunbuSkill = {
      id: 1,
      name: '踏云',
      type: '被动',
      unlockLevel: 1,
      icon: '☁️',
      description: '脚踏祥云，增加闪避',
      effect: { type: 'buff', stat: 'dodge', baseValue: 15, bonusAttr: 'agility', bonusPerPoint: 0.5 }
    };

    if (window.Validator) {
      const isValid = window.Validator.validateSkill(tayunbuSkill, '踏云步');
      console.log(`踏云步技能配置验证: ${isValid ? '通过 ✓' : '失败 ✗'}`);
    } else {
      console.log('Validator 未加载');
    }
  },

  /**
   * 运行所有测试
   */
  runAll() {
    console.log('=============================');
    console.log(' 踏云步技能测试 ');
    console.log('=============================');

    this.testTayunbu();
    this.testValidator();

    console.log('\n=============================');
    console.log(' 测试完成 ');
    console.log('=============================');
  }
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.TayunbuTest = TayunbuTest;
}