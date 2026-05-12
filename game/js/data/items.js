/**
 * 物品数据
 * @module items
 */

/**
 * 物品定义
 */
const ITEMS = {
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

  // 装备 - 武器
  iron_sword: {
    id: 'iron_sword',
    name: '铁剑',
    type: 'equipment',
    category: 'equipment',
    equipSlot: 'weapon',
    quality: 'common',
    requiredLevel: 1,
    description: '普通的铁制长剑',
    icon: '⚔️',
    bonus: {
      attack: 10
    },
    price: 30
  },
  
  tie_sword: {
    id: 'tie_sword',
    name: '铁剑',
    type: 'equipment',
    category: 'equipment',
    equipSlot: 'weapon',
    quality: 'common',
    requiredLevel: 1,
    description: '普通的铁制长剑',
    icon: '⚔️',
    bonus: {
      attack: 10
    },
    price: 30
  },
  
  shijian_sword: {
    id: 'shijian_sword',
    name: '石剑',
    type: 'equipment',
    category: 'equipment',
    equipSlot: 'weapon',
    quality: 'common',
    requiredLevel: 5,
    description: '石制长剑，较为粗糙',
    icon: '🗿',
    bonus: {
      attack: 15
    },
    price: 50
  },
  
  jingang_sword: {
    id: 'jingang_sword',
    name: '金刚剑',
    type: 'equipment',
    category: 'equipment',
    equipSlot: 'weapon',
    quality: 'rare',
    requiredLevel: 10,
    description: '精钢打造，坚硬无比',
    icon: '⚔️',
    bonus: {
      attack: 30,
      defense: 5
    },
    price: 200
  },

  steel_sword: {
    id: 'steel_sword',
    name: '钢剑',
    type: 'equipment',
    category: 'equipment',
    equipSlot: 'weapon',
    quality: 'uncommon',
    requiredLevel: 10,
    description: '精钢打造的长剑，锋利无比',
    icon: '🗡️',
    bonus: {
      attack: 20,
      critRate: 2
    },
    price: 80
  },

  jade_sword: {
    id: 'jade_sword',
    name: '玉剑',
    type: 'equipment',
    category: 'equipment',
    equipSlot: 'weapon',
    quality: 'rare',
    requiredLevel: 25,
    description: '罕见的玉石宝剑，蕴含灵气',
    icon: '💚',
    bonus: {
      attack: 35,
      critRate: 5
    },
    price: 200
  },

  dragon_sword: {
    id: 'dragon_sword',
    name: '青龙剑',
    type: 'equipment',
    category: 'equipment',
    equipSlot: 'weapon',
    quality: 'epic',
    requiredLevel: 40,
    description: '传说中的青龙宝剑，削铁如泥',
    icon: '🐉',
    bonus: {
      attack: 60,
      critRate: 8,
      strength: 10
    },
    price: 500
  },

  divine_sword: {
    id: 'divine_sword',
    name: '大夏龙雀',
    type: 'equipment',
    category: 'equipment',
    equipSlot: 'weapon',
    quality: 'legendary',
    requiredLevel: 60,
    description: '上古神兵，威力无穷',
    icon: '⚡',
    bonus: {
      attack: 100,
      critRate: 15,
      strength: 20,
      agility: 10
    },
    price: 2000
  },

  // 装备 - 护甲
  cloth_armor: {
    id: 'cloth_armor',
    name: '布袍',
    type: 'equipment',
    category: 'equipment',
    equipSlot: 'armor',
    quality: 'common',
    requiredLevel: 1,
    description: '普通的布制长袍',
    icon: '👕',
    bonus: {
      defense: 3,
      mp: 10
    },
    price: 15
  },

  leather_armor: {
    id: 'leather_armor',
    name: '皮甲',
    type: 'equipment',
    category: 'equipment',
    equipSlot: 'armor',
    quality: 'common',
    requiredLevel: 5,
    description: '轻便的皮制护甲',
    icon: '🥋',
    bonus: {
      defense: 8,
      agility: 3
    },
    price: 40
  },
  
  pojiu_yeyi: {
    id: 'pojiu_yeyi',
    name: '破旧夜行衣',
    type: 'equipment',
    category: 'equipment',
    equipSlot: 'armor',
    quality: 'uncommon',
    requiredLevel: 8,
    description: '山贼常用的夜行衣，虽破旧但灵活',
    icon: '🥷',
    bonus: {
      defense: 10,
      agility: 8,
      dodgeRate: 5
    },
    price: 80
  },

  iron_armor: {
    id: 'iron_armor',
    name: '铁甲',
    type: 'equipment',
    category: 'equipment',
    equipSlot: 'armor',
    quality: 'uncommon',
    requiredLevel: 15,
    description: '坚固的铁制铠甲',
    icon: '🛡️',
    bonus: {
      defense: 15,
      vitality: 5
    },
    price: 100
  },

  silver_armor: {
    id: 'silver_armor',
    name: '银甲',
    type: 'equipment',
    category: 'equipment',
    equipSlot: 'armor',
    quality: 'rare',
    requiredLevel: 30,
    description: '银光闪耀的铠甲，轻便而坚固',
    icon: '✨',
    bonus: {
      defense: 25,
      vitality: 10,
      dodgeRate: 5
    },
    price: 300
  },

  // 装备 - 头盔
  iron_helmet: {
    id: 'iron_helmet',
    name: '铁盔',
    type: 'equipment',
    category: 'equipment',
    equipSlot: 'helmet',
    quality: 'common',
    requiredLevel: 8,
    description: '普通的铁制头盔',
    icon: '⛑️',
    bonus: {
      defense: 5
    },
    price: 35
  },

  steel_helmet: {
    id: 'steel_helmet',
    name: '精钢盔',
    type: 'equipment',
    category: 'equipment',
    equipSlot: 'helmet',
    quality: 'uncommon',
    requiredLevel: 20,
    description: '精钢打造的头盔',
    icon: '🪖',
    bonus: {
      defense: 10,
      vitality: 3
    },
    price: 85
  },

  // 装备 - 靴子
  cloth_boots: {
    id: 'cloth_boots',
    name: '布鞋',
    type: 'equipment',
    category: 'equipment',
    equipSlot: 'shoes',
    quality: 'common',
    requiredLevel: 1,
    description: '普通的布制鞋子',
    icon: '👟',
    bonus: {
      agility: 2
    },
    price: 10
  },

  leather_boots: {
    id: 'leather_boots',
    name: '皮靴',
    type: 'equipment',
    category: 'equipment',
    equipSlot: 'shoes',
    quality: 'uncommon',
    requiredLevel: 12,
    description: '轻便的皮制靴子',
    icon: '🥾',
    bonus: {
      agility: 5,
      dodgeRate: 3
    },
    price: 50
  },

  // 装备 - 饰品
  gold_ring: {
    id: 'gold_ring',
    name: '金戒指',
    type: 'equipment',
    category: 'equipment',
    equipSlot: 'accessory',
    quality: 'rare',
    requiredLevel: 20,
    description: '镶嵌宝石的金戒指',
    icon: '💍',
    bonus: {
      attack: 8,
      spirit: 5
    },
    price: 150
  },

  jade_pendant: {
    id: 'jade_pendant',
    name: '玉佩',
    type: 'equipment',
    category: 'equipment',
    equipSlot: 'accessory',
    quality: 'epic',
    requiredLevel: 35,
    description: '温润如玉的玉佩，蕴含灵气',
    icon: '🔮',
    bonus: {
      mp: 30,
      spirit: 10,
      hp: 20
    },
    price: 400
  },

  // 丹药
  hp_potion_small: {
    id: 'hp_potion_small',
    name: '小还丹',
    type: 'consumable',
    category: 'potion',
    description: '恢复少量生命值',
    icon: '🧪',
    effects: {
      hpRestore: 30
    },
    price: 10
  },

  hp_potion_medium: {
    id: 'hp_potion_medium',
    name: '中还丹',
    type: 'consumable',
    category: 'potion',
    description: '恢复中等生命值',
    icon: '🧴',
    effects: {
      hpRestore: 60
    },
    price: 25
  },

  hp_potion_large: {
    id: 'hp_potion_large',
    name: '大还丹',
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
    name: '清心丹',
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
    name: '凝神丹',
    type: 'consumable',
    category: 'potion',
    description: '恢复中等内力',
    icon: '🔮',
    effects: {
      mpRestore: 40
    },
    price: 35
  },

  strength_potion: {
    id: 'strength_potion',
    name: '大力丸',
    type: 'consumable',
    category: 'potion',
    description: '服用后力量大增',
    icon: '💪',
    effects: {
      strength: 5
    },
    price: 40
  },

  // 秘籍
  skillbook_liuyun: {
    id: 'skillbook_liuyun',
    name: '阵形剑诀秘籍',
    type: 'consumable',
    category: 'skillbook',
    quality: 'uncommon',
    description: '记载《阵形剑诀》，青石武馆初阶剑式；研读悟通后剑术修为见长。',
    icon: '📖',
    martialArtId: 10,
    cultivationGain: 5,
    learningRequirement: {
      skillType: 'sword',
      value: 0
    },
    effects: {},
    price: 200
  },

  skillbook_chenqiao_quan: {
    id: 'skillbook_chenqiao_quan',
    name: '沉桥拳诀秘籍',
    type: 'consumable',
    category: 'skillbook',
    quality: 'uncommon',
    description: '记载《沉桥拳诀》，青石武馆初阶拳法；研读悟通后拳脚修为见长。',
    icon: '📖',
    martialArtId: 13,
    cultivationGain: 5,
    learningRequirement: { skillType: 'fist', value: 0 },
    effects: {},
    price: 200
  },

  skillbook_polang_dao: {
    id: 'skillbook_polang_dao',
    name: '破浪刀谱秘籍',
    type: 'consumable',
    category: 'skillbook',
    quality: 'uncommon',
    description: '记载《破浪刀谱》，青石武馆初阶刀法；研读悟通后刀术修为见长。',
    icon: '📖',
    martialArtId: 14,
    cultivationGain: 5,
    learningRequirement: { skillType: 'blade', value: 0 },
    effects: {},
    price: 200
  },

  skillbook_yangqi_shu: {
    id: 'skillbook_yangqi_shu',
    name: '养气术秘籍',
    type: 'consumable',
    category: 'skillbook',
    quality: 'uncommon',
    description: '记载《养气术》，青石武馆初阶内功；研读悟通后内功修为见长。',
    icon: '📿',
    martialArtId: 11,
    cultivationGain: 5,
    learningRequirement: { skillType: 'innerSkill', value: 0 },
    effects: {},
    price: 200
  },

  skillbook_nuobu_jue: {
    id: 'skillbook_nuobu_jue',
    name: '挪步诀秘籍',
    type: 'consumable',
    category: 'skillbook',
    quality: 'uncommon',
    description: '记载《挪步诀》，青石武馆初阶轻功；研读悟通后轻功修为见长。',
    icon: '👟',
    martialArtId: 12,
    cultivationGain: 5,
    learningRequirement: { skillType: 'lightSkill', value: 0 },
    effects: {},
    price: 200
  },

  skillbook_zixia: {
    id: 'skillbook_zixia',
    name: '紫霞心经秘籍',
    type: 'consumable',
    category: 'skillbook',
    quality: 'epic',
    description: '记载紫霞心经的秘籍，需要内功修为30才能学习',
    icon: '📿',
    martialArtId: 4,
    learningRequirement: {
      skillType: 'innerSkill',
      value: 30
    },
    effects: {},
    price: 500
  },

  skillbook_tayun: {
    id: 'skillbook_tayun',
    name: '踏云步秘籍',
    type: 'consumable',
    category: 'skillbook',
    quality: 'uncommon',
    description: '记载踏云步的秘籍，需要轻功修为15才能学习',
    icon: '👟',
    martialArtId: 5,
    learningRequirement: {
      skillType: 'lightSkill',
      value: 15
    },
    effects: {},
    price: 150
  },
  
  luocao_jianjing: {
    id: 'luocao_jianjing',
    name: '落草剑经',
    type: 'consumable',
    category: 'skillbook',
    quality: 'rare',
    description: '山寨流传的《落草快剑》手抄，需要剑术修为25才能学习',
    icon: '📖',
    martialArtId: 6,
    learningRequirement: {
      skillType: 'sword',
      value: 25
    },
    effects: {},
    price: 300
  },

  // 材料
  herb_ginseng: {
    id: 'herb_ginseng',
    name: '人参',
    type: 'material',
    category: 'material',
    description: '珍贵的药材',
    icon: '🌿',
    price: 20
  },

  herb_lingzhi: {
    id: 'herb_lingzhi',
    name: '灵芝',
    type: 'material',
    category: 'material',
    description: '千年灵芝',
    icon: '🍄',
    price: 50
  },
  
  lingzhi_cao: {
    id: 'lingzhi_cao',
    name: '灵芝草',
    type: 'material',
    category: 'material',
    description: '山林里生长的普通灵芝草，可用于制药',
    icon: '🌿',
    price: 10
  },
  
  she_dan: {
    id: 'she_dan',
    name: '蛇胆',
    type: 'material',
    category: 'material',
    description: '青竹蛇的蛇胆，可用于制药',
    icon: '🐍',
    price: 25
  },
  
  she_tui: {
    id: 'she_tui',
    name: '蛇蜕',
    type: 'material',
    category: 'material',
    description: '青竹蛇蜕下的皮，可用于制药',
    icon: '🦴',
    price: 15
  },

  iron_ore: {
    id: 'iron_ore',
    name: '铁矿石',
    type: 'material',
    category: 'material',
    description: '坚硬的铁矿石',
    icon: '🪨',
    price: 5
  },

  silver_ore: {
    id: 'silver_ore',
    name: '银矿石',
    type: 'material',
    category: 'material',
    description: '闪亮的银矿石',
    icon: '⚪',
    price: 15
  },

  ancient_scroll: {
    id: 'ancient_scroll',
    name: '古卷',
    type: 'material',
    category: 'material',
    description: '古老的卷轴',
    icon: '📜',
    price: 30
  },

  // 任务物品
  quest_item_key: {
    id: 'quest_item_key',
    name: '任务钥匙',
    type: 'quest',
    category: 'quest',
    description: '任务所需的特殊钥匙',
    icon: '🔑',
    price: 0
  },

  quest_item_letter: {
    id: 'quest_item_letter',
    name: '密信',
    type: 'quest',
    category: 'quest',
    description: '重要的任务信件',
    icon: '✉️',
    price: 0
  },

  quest_item_medallion: {
    id: 'quest_item_medallion',
    name: '门派令牌',
    type: 'quest',
    category: 'quest',
    description: '证明身份的令牌',
    icon: '🛡️',
    price: 0
  },

  // 杂项
  gold: {
    id: 'gold',
    name: '金币',
    type: 'consumable',
    category: 'misc',
    description: '江湖通用货币',
    icon: '💰',
    effects: {
      gold: 10
    },
    price: 0
  },

  meat: {
    id: 'meat',
    name: '生肉',
    type: 'consumable',
    category: 'misc',
    description: '可以食用的生肉',
    icon: '🥩',
    effects: {
      hpRestore: 15
    },
    price: 5
  },

  water: {
    id: 'water',
    name: '清水',
    type: 'consumable',
    category: 'misc',
    description: '干净的清水',
    icon: '�',
    effects: {
      hpRestore: 5
    },
    price: 2
  }
};

/**
 * 获取物品列表
 * @returns {Array} 物品数组
 */
function getItemList() {
  return Object.values(ITEMS);
}

/**
 * 根据ID获取物品
 * @param {string} itemId - 物品ID
 * @returns {object|null} 物品对象
 */
function getItemById(itemId) {
  return ITEMS[itemId] || null;
}

// 暴露到全局
window.ITEMS = ITEMS;
window.getItemList = getItemList;
window.getItemById = getItemById;

/**
 * 获取分类物品
 * @param {string} category - 分类名称
 * @returns {Array} 物品数组
 */
function getItemsByCategory(category) {
  return Object.values(ITEMS).filter(item => item.category === category);
}

// 暴露到全局（续）
window.getItemsByCategory = getItemsByCategory;