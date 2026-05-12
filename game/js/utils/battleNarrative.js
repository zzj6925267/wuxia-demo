/**
 * 战斗日志文案：随机组合动作描写 + 结果，避免「某某使用某某造成几点」过于生硬。
 */
(function (global) {
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function fill(str, map) {
    return str.replace(/\{(\w+)\}/g, (_, k) =>
      map[k] !== undefined && map[k] !== null ? String(map[k]) : ''
    );
  }

  const SKILL_DAMAGE_CLOSERS = [
    '{target}拆招不及，气血翻涌，受了 {damage} 点伤。',
    '劲风过处，{target}闷哼一声，折去 {damage} 点气血。',
    '{target}踉跄退步，肩背一麻，被削去 {damage} 点气血。',
    '剑气余波荡开，{target}喉间发紧，损失 {damage} 点气血。',
  ];

  const SKILL_OPENERS = {
    直刺: [
      '{actor}足尖轻点，身形如矢掠向{target}，「{skill}」飒然出手——',
      '{actor}一挽剑诀，寒芒陡现，{skill}直取{target}要害——',
      '{actor}欺身贴近，剑走偏锋，{skill}挟风雷之势奔{target}而去——',
      '{actor}衣袂猎猎，剑光一线，{skill}已递到{target}胸前——',
    ],
    _default: [
      '{actor}身形一晃，已至{target}近前，「{skill}」应手而发——',
      '{actor}吐气开声，{skill}破空而至，直扑{target}——',
      '{actor}足下生风，{skill}连环递出，罩定{target}周身——',
    ],
  };

  const FOLLOW_ATTACK = [
    '{actor}剑意未绝，余势再起，剑影如虹追斩{target}，又造成 {damage} 点伤害！',
    '寒芒乍分，{actor}借势再进，剑尾一扫，{target}再受 {damage} 点创痛！',
    '{actor}腕底一沉，隐有龙吟，剑影追袭{target}，额外 {damage} 点伤害！',
  ];

  const ALLY_PLAIN = [
    '{actor}纵身贴近，拳脚齐出，{target}硬接一招，受了 {damage} 点伤。',
    '{actor}内力一提，掌风扑面，{target}脚下发虚，损失 {damage} 点气血。',
    '{actor}抢上半步，招式朴实却狠，{target}格挡稍慢，折了 {damage} 点气血。',
  ];

  const ENEMY_HIT = [
    '{actor}狞笑一声，刀风劈落，{target}肩头一沉，受了 {damage} 点伤。',
    '{actor}踏步进逼，攻势如潮，{target}勉力招架，仍损 {damage} 点气血。',
    '{actor}欺身猛攻，{target}衣袂裂响，气血激荡，失去 {damage} 点。',
  ];

  const ENEMY_CRIT = [
    '{actor}暴喝如雷，杀招陡变，{target}胸前空门大露，重创 {damage} 点！',
    '刀光暴涨，{actor}这一记狠辣无匹，{target}喉头一甜，气血狂泻 {damage} 点！',
  ];

  const DODGE_LINES = [
    '{target}身法灵动，侧身一让，{actor}这一击竟落了空。',
    '{target}足尖点地，如柳絮飘开，{actor}的攻势擦衣而过。',
    '{target}眼明手快，矮身错步，将{actor}的杀招化于无形。',
  ];

  const PARRY_LINES = [
    '{target}横剑一封，金铁交鸣，{actor}的劲力被卸去大半，仍渗入 {damage} 点。',
    '{target}以守为攻，招架间火星四溅，仍被震去 {damage} 点气血。',
    '{target}双掌合围，勉强化开来势，气血仍是一荡，损了 {damage} 点。',
  ];

  const INNER_HEAL = [
    '{actor}吐纳绵绵，内息周行，恢复 {heal} 点气血。',
    '{actor}闭目调息，丹田微温，伤势平复 {heal} 点。',
    '气机流转间，{actor}面色稍霁，回升 {heal} 点气血。',
  ];

  const DEFEAT_LINES = [
    '{name}再也支撑不住，身形一晃，败下阵来。',
    '{name}气竭力尽，眼前发黑，终难再战。',
    '{name}喉间一甜，单膝跪地，已无力起身。',
  ];

  function skillUse(actor, skill, target, damage) {
    const skillName = (skill && skill.name) || '招式';
    const pool = SKILL_OPENERS[skillName] || SKILL_OPENERS._default;
    const map = { actor: actor.name, target: target.name, skill: skillName, damage };
    return fill(pick(pool) + pick(SKILL_DAMAGE_CLOSERS), map);
  }

  function followAttack(actor, target, damage) {
    const map = { actor: actor.name, target: target.name, damage };
    return fill(pick(FOLLOW_ATTACK), map);
  }

  function allyPlainAttack(actor, target, damage) {
    const map = { actor: actor.name, target: target.name, damage };
    return fill(pick(ALLY_PLAIN), map);
  }

  function enemyHit(actor, target, damage, isCritical) {
    const map = { actor: actor.name, target: target.name, damage };
    return fill(pick(isCritical ? ENEMY_CRIT : ENEMY_HIT), map);
  }

  function dodge(actor, target) {
    const map = { actor: actor.name, target: target.name };
    return fill(pick(DODGE_LINES), map);
  }

  function parry(actor, target, damage) {
    const map = { actor: actor.name, target: target.name, damage };
    return fill(pick(PARRY_LINES), map);
  }

  function innerHeal(actor, heal) {
    const map = { actor: actor.name, heal };
    return fill(pick(INNER_HEAL), map);
  }

  function defeated(name) {
    return fill(pick(DEFEAT_LINES), { name });
  }

  global.BattleNarrative = {
    skillUse,
    followAttack,
    allyPlainAttack,
    enemyHit,
    dodge,
    parry,
    innerHeal,
    defeated,
  };
})(typeof window !== 'undefined' ? window : globalThis);
