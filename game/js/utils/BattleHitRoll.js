/**
 * 队伍战：闪避 / 招架 / 命中 / 暴击 结算（battle.html 使用的角色卡数据结构）。
 * 逻辑由原 battle.js 的 calculateDamage 原样迁入，作为唯一维护点。
 * 四阶段改造 · 阶段 3（规则单点）：队伍战物理结算集中于此。
 * @module BattleHitRoll
 */
const BattleHitRoll = {
  /**
   * @param {{ attack: number, hit: number }} attacker
   * @param {{ defense: number, dodge: number, parry: number }} defender
   * @returns {{ damage: number, isDodge: boolean, isParry: boolean, isCritical: boolean }}
   */
  resolveDamage(attacker, defender) {
    const hitRoll = Math.random() * 100;
    const dodgeRoll = Math.random() * 100;
    const parryRoll = Math.random() * 100;
    /** 敌人数据可选 accuracy：结算闪避档前从 defender.dodge 扣除（副本 Boss 对高闪避少侠） */
    const effDodge = Math.max(
      0,
      (defender.dodge || 0) - (attacker.accuracy || 0)
    );

    if (dodgeRoll < effDodge) {
      return { damage: 0, isDodge: true, isParry: false, isCritical: false };
    }

    if (parryRoll < defender.parry && hitRoll >= attacker.hit) {
      const baseDamage = attacker.attack - defender.defense;
      const damage = Math.max(1, Math.floor(baseDamage * 0.5));
      return { damage, isDodge: false, isParry: true, isCritical: false };
    }

    if (hitRoll < attacker.hit) {
      const critRoll = Math.random() * 100;
      const isCritical = critRoll < 15;
      const baseDamage = attacker.attack - defender.defense;
      const damage = Math.max(1, Math.floor(baseDamage * (isCritical ? 1.5 : 1)));
      return { damage, isDodge: false, isParry: false, isCritical };
    }

    return { damage: 0, isDodge: false, isParry: false, isCritical: false };
  }
};

if (typeof window !== 'undefined') {
  window.BattleHitRoll = BattleHitRoll;
}
