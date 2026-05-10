/**
 * 角色基础属性
 * @typedef {Object} CharacterStats
 * @property {number} strength - 臂力
 * @property {number} agility - 身法
 * @property {number} vitality - 根骨
 * @property {number} spirit - 内息
 */

/**
 * 玩家数据结构
 * @typedef {Object} PlayerData
 * @property {string} name - 角色名称
 * @property {number} level - 等级
 * @property {number} exp - 阅历
 * @property {number} gold - 银两
 * @property {number} hp - 当前气血
 * @property {number} maxHp - 最大气血
 * @property {number} mp - 当前内力
 * @property {number} maxMp - 最大内力
 * @property {number} attack - 攻击力
 * @property {number} defense - 防御力
 * @property {CharacterStats} stats - 四维属性
 * @property {MartialArt[]} martialArts - 武学列表
 * @property {Equipment[]} equipment - 装备列表
 * @property {InventoryItem[]} inventory - 背包物品
 * @property {Object} flags - 游戏标记
 */

/**
 * 武学数据结构
 * @typedef {Object} MartialArt
 * @property {string} id - 武学ID
 * @property {string} name - 武学名称
 * @property {'武功' | '内功' | '轻功'} type - 武学类型
 * @property {number} currentLevel - 当前等级
 * @property {number} maxLevel - 最高等级
 * @property {boolean} equipped - 是否装备
 * @property {Skill[]} skills - 技能列表
 * @property {Object} bonuses - 属性加成
 */

/**
 * 技能数据结构
 * @typedef {Object} Skill
 * @property {string} id - 技能ID
 * @property {string} name - 技能名称
 * @property {'active' | 'passive'} type - 技能类型
 * @property {number} mpCost - 内力消耗
 * @property {number} unlockLevel - 解锁等级
 * @property {SkillEffect} effect - 技能效果
 * @property {string} description - 技能描述
 */

/**
 * 技能效果
 * @typedef {Object} SkillEffect
 * @property {'damage' | 'heal' | 'buff' | 'debuff'} type - 效果类型
 * @property {number} value - 效果数值
 * @property {number} [baseChance] - 触发概率
 * @property {string} [chanceAttr] - 影响概率的属性
 */

/**
 * 装备数据结构
 * @typedef {Object} Equipment
 * @property {string} id - 装备ID
 * @property {string} name - 装备名称
 * @property {'weapon' | 'armor' | 'accessory'} type - 装备类型
 * @property {boolean} equipped - 是否装备
 * @property {Object} bonuses - 属性加成
 */

/**
 * 背包物品
 * @typedef {Object} InventoryItem
 * @property {string} id - 物品ID
 * @property {number} quantity - 数量
 */

/**
 * 敌人数据结构
 * @typedef {Object} EnemyData
 * @property {string} id - 敌人ID
 * @property {string} name - 敌人名称
 * @property {number} level - 等级
 * @property {number} hp - 当前气血
 * @property {number} maxHp - 最大气血
 * @property {number} attack - 攻击力
 * @property {number} defense - 防御力
 * @property {number} goldReward - 银两奖励
 * @property {number} expReward - 阅历奖励
 * @property {Skill[]} skills - 技能列表
 */

/**
 * 对话选项
 * @typedef {Object} DialogChoice
 * @property {string} id - 选项ID
 * @property {string} text - 选项文本
 * @property {string} nextDialogId - 下一段对话ID
 * @property {Object} [requirements] - 触发条件
 * @property {Object} [rewards] - 奖励
 */

/**
 * 对话数据结构
 * @typedef {Object} DialogData
 * @property {string} id - 对话ID
 * @property {string} speaker - 说话者
 * @property {string} text - 对话文本
 * @property {DialogChoice[]} [choices] - 对话选项
 * @property {string} [nextId] - 下一段对话ID
 */

/**
 * 地图节点
 * @typedef {Object} MapNode
 * @property {string} id - 节点ID
 * @property {string} name - 节点名称
 * @property {number} x - X坐标
 * @property {number} y - Y坐标
 * @property {string[]} connections - 连接的节点ID
 * @property {string} [description] - 节点描述
 */

// 注意：SKILL_TYPE 已在 config.js 中定义，这里不再重复定义