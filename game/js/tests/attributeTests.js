// 属性系统测试用例

const AttributeTests = {
  /**
   * 测试 AttributeHelper 工具函数
   */
  testAttributeHelper() {
    console.log('\n=== 测试 AttributeHelper ===');

    // 模拟角色数据
    const testChar = {
      name: '测试角色',
      stats: {
        strength: 10,
        agility: 10,
        bone: 10,
        qi: 10
      }
    };

    // 测试1: 正常属性访问
    console.log('\n1. 正常属性访问:');
    const bone = window.AttributeHelper.get(testChar, 'bone');
    console.log(`   根骨: ${bone} (预期: 10)`, bone === 10 ? '✓' : '✗');

    // 测试2: 旧属性名兼容性
    console.log('\n2. 旧属性名兼容性:');
    const vitality = window.AttributeHelper.get(testChar, 'vitality');
    console.log(`   vitality -> bone: ${vitality} (预期: 10)`, vitality === 10 ? '✓' : '✗');

    const spirit = window.AttributeHelper.get(testChar, 'spirit');
    console.log(`   spirit -> qi: ${spirit} (预期: 10)`, spirit === 10 ? '✓' : '✗');

    // 测试3: 默认值处理
    console.log('\n3. 默认值处理:');
    const unknown = window.AttributeHelper.get(testChar, 'unknown', 0);
    console.log(`   未知属性: ${unknown} (预期: 0)`, unknown === 0 ? '✓' : '✗');

    // 测试4: 技能加成计算
    console.log('\n4. 技能加成计算:');
    const gubenEffect = {
      type: 'maxHpBuff',
      baseValue: 50,
      bonusAttr: 'bone',
      bonusPerPoint: 0.5
    };
    const bonus = window.AttributeHelper.calculateBonus(gubenEffect, testChar);
    console.log(`   固本加成: ${bonus} (预期: 55)`, bonus === 55 ? '✓' : '✗');

    // 测试5: 旧属性名加成计算
    console.log('\n5. 旧属性名加成计算:');
    const oldEffect = {
      type: 'maxHpBuff',
      baseValue: 50,
      bonusAttr: 'vitality',
      bonusPerPoint: 0.5
    };
    const oldBonus = window.AttributeHelper.calculateBonus(oldEffect, testChar);
    console.log(`   旧属性名加成: ${oldBonus} (预期: 55)`, oldBonus === 55 ? '✓' : '✗');

    // 测试6: 空角色处理
    console.log('\n6. 空角色处理:');
    const emptyBonus = window.AttributeHelper.calculateBonus(gubenEffect, null);
    console.log(`   空角色加成: ${emptyBonus} (预期: 50)`, emptyBonus === 50 ? '✓' : '✗');
  },

  /**
   * 测试内功技能加成
   */
  testInnerSkillBonuses() {
    console.log('\n=== 测试内功技能加成 ===');

    if (!window.characters || !window.characters[0]) {
      console.log('警告: 没有角色数据');
      return;
    }

    const char = window.characters[0];
    console.log(`测试角色: ${char.name}`);
    console.log(`根骨: ${char.stats.bone}, 内息: ${char.stats.qi}`);

    // 获取武学数据
    const martialData = JSON.parse(localStorage.getItem('playerMartialArts_1'));
    const neigong = martialData && martialData.find(m => m.type === '内功');

    if (!neigong) {
      console.log('警告: 没有内功数据');
      return;
    }

    // 测试每个内功技能
    neigong.skills.forEach(skill => {
      if (skill.effect && skill.effect.bonusAttr) {
        const bonus = window.AttributeHelper.calculateBonus(skill.effect, char);
        const expected = skill.effect.baseValue + char.stats[skill.effect.bonusAttr] * skill.effect.bonusPerPoint;
        console.log(`\n技能: ${skill.name}`);
        console.log(`  配置: baseValue=${skill.effect.baseValue}, bonusAttr=${skill.effect.bonusAttr}, bonusPerPoint=${skill.effect.bonusPerPoint}`);
        console.log(`  计算结果: ${bonus} (预期: ${Math.ceil(expected)})`, bonus === Math.ceil(expected) ? '✓' : '✗');
      }
    });
  },

  /**
   * 测试 Validator 验证器
   */
  testValidator() {
    console.log('\n=== 测试 Validator ===');

    if (window.Validator) {
      window.Validator.validateAll();
    } else {
      console.log('警告: Validator 未加载');
    }
  },

  /**
   * 运行所有测试
   */
  runAll() {
    console.log('=============================');
    console.log(' 属性系统测试套件 ');
    console.log('=============================');

    this.testAttributeHelper();
    this.testInnerSkillBonuses();
    this.testValidator();

    console.log('\n=============================');
    console.log(' 测试完成 ');
    console.log('=============================');
  }
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.AttributeTests = AttributeTests;
}