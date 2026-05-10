// 数据迁移工具
// 用于处理版本升级时的数据兼容性问题

const DataMigration = {
  version: '1.0.1',
  
  // 属性名映射（旧名称 -> 新名称）
  attributeMap: {
    'vitality': 'bone',
    'spirit': 'qi'
  },
  
  /**
   * 迁移武学数据中的属性名
   */
  migrateMartialArts() {
    let migrated = false;
    
    // 遍历所有角色的武学数据
    ['1', '2', '3', '4', '5'].forEach(charId => {
      const key = `playerMartialArts_${charId}`;
      const dataStr = localStorage.getItem(key);
      
      if (!dataStr) return;
      
      try {
        let data = JSON.parse(dataStr);
        let needsUpdate = false;
        
        // 检查并修复技能配置中的属性名
        data.forEach(martial => {
          if (martial.skills) {
            martial.skills.forEach(skill => {
              if (skill.effect && skill.effect.bonusAttr) {
                const oldAttr = skill.effect.bonusAttr;
                const newAttr = this.attributeMap[oldAttr];
                
                if (newAttr && oldAttr !== newAttr) {
                  skill.effect.bonusAttr = newAttr;
                  needsUpdate = true;
                  console.log(`DataMigration: 角色${charId} 技能${skill.name} 的属性名 ${oldAttr} -> ${newAttr}`);
                }
              }
            });
          }
        });
        
        if (needsUpdate) {
          localStorage.setItem(key, JSON.stringify(data));
          migrated = true;
        }
      } catch (e) {
        console.error(`DataMigration: 迁移角色${charId}数据失败`, e);
      }
    });
    
    return migrated;
  },
  
  /**
   * 检查是否需要迁移
   */
  needsMigration() {
    const currentVersion = localStorage.getItem('dataVersion');
    return currentVersion !== this.version;
  },
  
  /**
   * 执行所有迁移
   */
  init() {
    if (!this.needsMigration()) {
      console.log(`DataMigration: 当前版本 ${this.version}，无需迁移`);
      return;
    }
    
    console.log(`DataMigration: 开始迁移数据到版本 ${this.version}`);
    
    const migrated = this.migrateMartialArts();
    
    // 更新版本号
    localStorage.setItem('dataVersion', this.version);
    
    if (migrated) {
      console.log('DataMigration: 数据迁移完成');
    } else {
      console.log('DataMigration: 没有需要迁移的数据');
    }
  }
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.DataMigration = DataMigration;
}