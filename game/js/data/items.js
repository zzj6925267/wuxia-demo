/**
 * 物品数据
 * @module items
 */

/**
 * 物品定义
 */
export const ITEMS = {
  // 消耗品
  potion_small: {
    id: 'potion_small',
    name: '小型疗伤药',
    type: 'consumable',
    category: 'potion',
    description: '恢复少量生命值',
    icon: '🧪',
    effects: {
      hpRestore: 30
    },
    price: 10
  },

  potion_medium: {
    id: 'potion_medium',
    name: '中型疗伤药',
    type: 'consumable',
    category: 'potion',
    description: '恢复中等生命值',
    icon: '🧴',
    effects: {
      hpRestore: 60
    },
    price: 25
  },

  potion_large: {
    id: 'potion_large',
    name: '大型疗伤药',
    type: 'consumable',
    category: 'potion',
    description: '恢复大量生命值',
    icon: '⚗️',
    effects: {
      hpRestore: 100
    },
    price: 50
  },

  mp_potion_small: {
    id: 'mp_potion_small',
    name: '小型内力丹',
    type: 'consumable',
    category: 'potion',
    description: '恢复少量内力',
    icon: '💎',
    effects: {
      mpRestore: 20
    },
    price: 15
  },

  mp_potion_medium: {
    id: 'mp_potion_medium',
    name: '中型内力丹',
    type: 'consumable',
    category: 'potion',
    description: '恢复中等内力',
    icon: '🔮',
    effects: {
      mpRestore: 40
    },
    price: 35
  },

  meat: {
    id: 'meat',
    name: '生肉',
    type: 'consumable',
    category: 'food',
    description: '可以食用的生肉',
    icon: '🥩',
    effects: {
      hpRestore: 15
    },
    price: 5
  },

  gold: {
    id: 'gold',
    name: '金币',
    type: 'consumable',
    category: 'currency',
    description: '江湖通用货币',
    icon: '💰',
    effects: {
      gold: 10
    },
    price: 0
  },

  // 武器
  iron_sword: {
    id: 'iron_sword',
    name: '铁剑',
    type: 'weapon',
    category: 'weapon',
    description: '普通的铁制长剑',
    icon: '⚔️',
    bonus: {
      attack: 10
    },
    price: 30
  },

  steel_sword: {
    id: 'steel_sword',
    name: '钢剑',
    type: 'weapon',
    category: 'weapon',
    description: '精钢打造的长剑，锋利无比',
    icon: '🗡️',
    bonus: {
      attack: 20
    },
    price: 80
  },

  jade_sword: {
    id: 'jade_sword',
    name: '玉剑',
    type: 'weapon',
    category: 'weapon',
    description: '罕见的玉石宝剑',
    icon: '💚',
    bonus: {
      attack: 35
    },
    price: 200
  },

  dagger: {
    id: 'dagger',
    name: '匕首',
    type: 'weapon',
    category: 'weapon',
    description: '短小精悍的短刀',
    icon: '🔪',
    bonus: {
      attack: 8
    },
    price: 20
  },

  // 护甲
  cloth_armor: {
    id: 'cloth_armor',
    name: '布袍',
    type: 'armor',
    category: 'armor',
    description: '普通的布制长袍',
    icon: '👕',
    bonus: {
      defense: 3
    },
    price: 15
  },

  leather_armor: {
    id: 'leather_armor',
    name: '皮甲',
    type: 'armor',
    category: 'armor',
    description: '轻便的皮制护甲',
    icon: '🥋',
    bonus: {
      defense: 8
    },
    price: 40
  },

  iron_armor: {
    id: 'iron_armor',
    name: '铁甲',
    type: 'armor',
    category: 'armor',
    description: '坚固的铁制铠甲',
    icon: '🛡️',
    bonus: {
      defense: 15
    },
    price: 100
  },

  // 其他
  skill_book: {
    id: 'skill_book',
    name: '武学秘籍',
    type: 'consumable',
    category: 'book',
    description: '记载着失传武学的秘籍',
    icon: '📖',
    effects: {},
    price: 150
  },

  key: {
    id: 'key',
    name: '钥匙',
    type: 'consumable',
    category: 'key',
    description: '一把古老的钥匙',
    icon: '🔑',
    effects: {},
    price: 25
  }
};

/**
 * 获取物品列表
 * @returns {Array} 物品数组
 */
export function getItemList() {
  return Object.values(ITEMS);
}

/**
 * 根据ID获取物品
 * @param {string} itemId - 物品ID
 * @returns {object|null} 物品对象
 */
export function getItemById(itemId) {
  return ITEMS[itemId] || null;
}

/**
 * 获取分类物品
 * @param {string} category - 分类名称
 * @returns {Array} 物品数组
 */
export function getItemsByCategory(category) {
  return Object.values(ITEMS).filter(item => item.category === category);
}