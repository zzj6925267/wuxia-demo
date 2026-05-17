/**
 * 通用工具函数
 * @module helpers
 */

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 格式化数字（千分位）
 * @param {number} num - 数字
 * @returns {string} 格式化后的字符串
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * UI 展示用整数（内部计算可仍用浮点；文案禁止出现小数尾巴）
 * @param {number} value
 * @param {'round'|'ceil'|'floor'} [mode='round']
 * @returns {number}
 */
function formatDisplayInt(value, mode) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  if (mode === 'ceil') return Math.ceil(n);
  if (mode === 'floor') return Math.floor(n);
  return Math.round(n);
}

/** 伤害倍率 1.14 → 114（%） */
function formatMultiplierAsPercent(multiplier) {
  return formatDisplayInt(Number(multiplier) * 100, 'round');
}

/** 概率/比例 0.2 → 20（%） */
function formatFractionAsPercent(fraction) {
  return formatMultiplierAsPercent(fraction);
}

/** 属性×每点系数 → 整数（加成展示偏保守用 ceil） */
function formatAttrBonusInt(attrValue, perPoint) {
  return formatDisplayInt(Number(attrValue) * Number(perPoint), 'ceil');
}

/** 属性×每点系数 → 整数百分比 */
function formatAttrBonusPercentInt(attrValue, perPoint) {
  return formatDisplayInt(Number(attrValue) * Number(perPoint) * 100, 'ceil');
}

/**
 * 随机数生成
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 随机数
 */
function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 计算伤害
 * @param {number} baseDamage - 基础伤害
 * @param {number} attack - 攻击力
 * @param {number} defense - 防御力
 * @returns {number} 最终伤害
 */
function calculateDamage(baseDamage, attack, defense) {
  const damage = baseDamage + attack * 0.5 - defense * 0.3;
  return Math.max(1, Math.floor(damage));
}

/**
 * 计算治疗量
 * @param {number} baseHeal - 基础治疗量
 * @param {number} spirit - 内力属性
 * @returns {number} 最终治疗量
 */
function calculateHeal(baseHeal, spirit) {
  return Math.floor(baseHeal + spirit * 0.2);
}

/**
 * 检查是否暴击
 * @param {number} critChance - 暴击率
 * @returns {boolean} 是否暴击
 */
function checkCritical(critChance) {
  return Math.random() < critChance;
}

/**
 * 检查是否闪避
 * @param {number} dodgeChance - 闪避率
 * @returns {boolean} 是否闪避
 */
function checkDodge(dodgeChance) {
  return Math.random() < dodgeChance;
}

/**
 * 深拷贝对象
 * @param {object} obj - 要拷贝的对象
 * @returns {object} 拷贝后的对象
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 防抖函数
 * @param {Function} fn - 要执行的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * 节流函数
 * @param {Function} fn - 要执行的函数
 * @param {number} delay - 节流时间（毫秒）
 * @returns {Function} 节流后的函数
 */
function throttle(fn, delay) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

// 暴露到全局
window.generateId = generateId;
window.formatNumber = formatNumber;
window.formatDisplayInt = formatDisplayInt;
window.formatMultiplierAsPercent = formatMultiplierAsPercent;
window.formatFractionAsPercent = formatFractionAsPercent;
window.formatAttrBonusInt = formatAttrBonusInt;
window.formatAttrBonusPercentInt = formatAttrBonusPercentInt;
window.randomRange = randomRange;
window.calculateDamage = calculateDamage;
window.calculateHeal = calculateHeal;
window.checkCritical = checkCritical;
window.checkDodge = checkDodge;
window.deepClone = deepClone;
window.debounce = debounce;
window.throttle = throttle;
