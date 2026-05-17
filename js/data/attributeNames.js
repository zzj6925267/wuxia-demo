// 属性名称常量定义
// 所有代码必须从这里引用属性名，禁止硬编码
export const ATTRIBUTES = {
  // 四维属性
  STRENGTH: 'strength',    // 臂力
  AGILITY: 'agility',      // 身法
  BONE: 'bone',            // 根骨
  QI: 'qi',                // 内息
  
  // 战斗属性
  ATTACK: 'attack',        // 攻击
  DEFENSE: 'defense',      // 防御
  HP: 'hp',               // 气血
  MAX_HP: 'maxHp',         // 气血上限
  MP: 'mp',               // 内力
  MAX_MP: 'maxMp',         // 内力上限
  SPEED: 'speed',          // 速度
  HIT: 'hit',             // 命中
  DODGE: 'dodge',          // 闪避
  PARRY: 'parry',          // 招架
  
  // 武学修为
  FIST: 'fist',           // 拳脚
  SWORD: 'sword',         // 剑法
  BLADE: 'blade',         // 刀术
  LIGHT_SKILL: 'lightSkill', // 轻功
  INNER_SKILL: 'innerSkill'  // 内功
};

// 属性显示名称映射
export const ATTRIBUTE_DISPLAY_NAMES = {
  [ATTRIBUTES.STRENGTH]: '臂力',
  [ATTRIBUTES.AGILITY]: '身法',
  [ATTRIBUTES.BONE]: '根骨',
  [ATTRIBUTES.QI]: '内息',
  [ATTRIBUTES.ATTACK]: '攻击',
  [ATTRIBUTES.DEFENSE]: '防御',
  [ATTRIBUTES.HP]: '气血',
  [ATTRIBUTES.MAX_HP]: '气血上限',
  [ATTRIBUTES.MP]: '内力',
  [ATTRIBUTES.MAX_MP]: '内力上限',
  [ATTRIBUTES.SPEED]: '速度',
  [ATTRIBUTES.HIT]: '命中',
  [ATTRIBUTES.DODGE]: '闪避',
  [ATTRIBUTES.PARRY]: '招架',
  [ATTRIBUTES.FIST]: '拳脚',
  [ATTRIBUTES.SWORD]: '剑法',
  [ATTRIBUTES.BLADE]: '刀术',
  [ATTRIBUTES.LIGHT_SKILL]: '轻功',
  [ATTRIBUTES.INNER_SKILL]: '内功'
};

// 导出到全局（供非ES模块使用）
if (typeof window !== 'undefined') {
  window.ATTRIBUTES = ATTRIBUTES;
  window.ATTRIBUTE_DISPLAY_NAMES = ATTRIBUTE_DISPLAY_NAMES;
}