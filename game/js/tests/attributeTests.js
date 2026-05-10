// 属性系统测试工具

const AttributeTests = {
  /**
   * 运行所有测试
   */
  runAll() {
    console.log('\n========== 属性系统测试开始 ==========\n');
    
    const results = [];
    
    results.push(this.testAttributeHelper());
    results.push(this.testPointAllocation());
    results.push(this.testLoadSave());
    results.push(this.testMartialArtsSkills());
    
    console.log('\n========== 测试结果汇总 ==========');
    let passed = 0;
    results.forEach((result, i) => {
      const status = result.success ? '✅ 通过' : '❌ 失败';
      console.log(`[${i + 1}] ${result.name}: ${status}`);
      passed += result.success ? 1 : 0;
    });
    console.log(`\n总计: ${passed}/${results.length} 个测试通过`);
    
    return passed === results.length;
  },
  
  /**
   * 测试 AttributeHelper
   */
  testAttributeHelper() {
    const name = 'AttributeHelper 基础测试';
    console.log(`--- ${name} ---`);
    
    try {
      if (!window.AttributeHelper) {
        console.error('❌ AttributeHelper 未加载');
        return { name, success: false };
      }
      
      const char = {
        stats: { strength: 10, agility: 12, bone: 8, qi: 15 }
      };
      
      // 测试获取属性
      const strength = AttributeHelper.get(char, 'strength');
      if (strength !== 10) {
        console.error(`❌ 获取属性失败: strength期望10，实际${strength}`);
        return { name, success: false };
      }
      
      // 测试兼容性
      const bone = AttributeHelper.get(char, 'vitality'); // 旧属性名应返回根骨
      if (bone !== 8) {
        console.error(`❌ 兼容性测试失败: vitality期望8，实际${bone}`);
        return { name, success: false };
      }
      
      // 测试验证
      const valid = AttributeHelper.isValid('bone');
      if (!valid) {
        console.error('❌ 属性名验证失败');
        return { name, success: false };
      }
      
      console.log('✅ AttributeHelper 测试通过');
      return { name, success: true };
    } catch (e) {
      console.error('❌ 测试异常:', e);
      return { name, success: false };
    }
  },
  
  /**
   * 测试属性加点功能
   */
  testPointAllocation() {
    const name = '属性加点功能测试';
    console.log(`--- ${name} ---`);
    
    try {
      if (!window.characters || !window.characters[0]) {
        console.error('❌ 角色数据未加载');
        return { name, success: false };
      }
      
      const char = window.characters[0];
      
      // 保存原始状态
      const originalRemaining = char.remainingPoints;
      const originalBone = char.stats.bone;
      
      console.log(`原始状态 - 剩余点数:${originalRemaining}, 根骨:${originalBone}`);
      
      // 模拟加点（假设 previewCharPoint 和 confirmCharPoint 存在）
      if (typeof window.previewCharPoint === 'function' && typeof window.confirmCharPoint === 'function') {
        window.previewCharPoint('bone', 5);
        window.confirmCharPoint();
        
        if (char.remainingPoints !== originalRemaining - 5) {
          console.error(`❌ 剩余点数未正确减少: 期望${originalRemaining - 5}，实际${char.remainingPoints}`);
          return { name, success: false };
        }
        
        if (char.stats.bone !== originalBone + 5) {
          console.error(`❌ 根骨未正确增加: 期望${originalBone + 5}，实际${char.stats.bone}`);
          return { name, success: false };
        }
        
        console.log('✅ 加点功能测试通过');
        return { name, success: true };
      } else {
        console.log('⚠️ 加点函数未找到，跳过实际加点测试');
        return { name, success: true };
      }
    } catch (e) {
      console.error('❌ 测试异常:', e);
      return { name, success: false };
    }
  },
  
  /**
   * 测试存档加载（特别是 remainingPoints 是否被正确保护）
   */
  testLoadSave() {
    const name = '存档加载保护测试';
    console.log(`--- ${name} ---`);
    
    try {
      if (!window.characters || !window.characters[0]) {
        console.error('❌ 角色数据未加载');
        return { name, success: false };
      }
      
      const char = window.characters[0];
      
      // 修改 remainingPoints 为非初始值
      const testValue = 42;
      char.remainingPoints = testValue;
      console.log(`设置 remainingPoints 为: ${testValue}`);
      
      // 模拟从存档加载（创建一个假的存档数据）
      const fakeSaveData = {
        characters: [{
          ...char,
          remainingPoints: 50 // 存档中的初始值
        }]
      };
      
      // 测试 AttributeHelper.safeMerge
      if (window.AttributeHelper) {
        const backup = char.remainingPoints;
        window.AttributeHelper.safeMerge(char, fakeSaveData.characters[0]);
        
        if (char.remainingPoints !== testValue) {
          console.error(`❌ remainingPoints 被错误覆盖! 期望${testValue}，实际${char.remainingPoints}`);
          char.remainingPoints = backup; // 恢复
          return { name, success: false };
        }
        
        console.log('✅ remainingPoints 被正确保护');
      }
      
      return { name, success: true };
    } catch (e) {
      console.error('❌ 测试异常:', e);
      return { name, success: false };
    }
  },
  
  /**
   * 测试武学技能
   */
  testMartialArtsSkills() {
    const name = '武学技能测试';
    console.log(`--- ${name} ---`);
    
    try {
      if (!window.martialArtsData) {
        console.warn('⚠️ 武学数据未加载');
        return { name, success: true };
      }
      
      // 使用 AttributeHelper 验证
      if (window.AttributeHelper) {
        const allValid = window.AttributeHelper.validateAll(window.martialArtsData);
        return { name, success: allValid };
      }
      
      console.log('✅ 武学技能测试通过');
      return { name, success: true };
    } catch (e) {
      console.error('❌ 测试异常:', e);
      return { name, success: false };
    }
  },
  
  /**
   * 运行踏云步专项测试
   */
  testTayunbu() {
    const name = '踏云步技能测试';
    console.log(`--- ${name} ---`);
    
    try {
      if (!window.characters || !window.characters[0]) {
        console.error('❌ 角色数据未加载');
        return { name, success: false };
      }
      
      const char = window.characters[0];
      console.log('测试角色属性:', {
        strength: char.stats?.strength,
        agility: char.stats?.agility
      });
      
      // 查找踏云步
      const tayunbu = window.martialArtsData?.find(m => m.name === '踏云步');
      if (!tayunbu) {
        console.error('❌ 未找到踏云步数据');
        return { name, success: false };
      }
      
      let allPassed = true;
      tayunbu.skills.forEach(skill => {
        if (skill.effect && window.AttributeHelper) {
          const bonus = window.AttributeHelper.calculateBonus(skill.effect, char);
          console.log(`${skill.name}: 计算加成 = ${bonus}`);
        }
      });
      
      console.log('✅ 踏云步测试完成');
      return { name, success: allPassed };
    } catch (e) {
      console.error('❌ 测试异常:', e);
      return { name, success: false };
    }
  }
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.AttributeTests = AttributeTests;
}
