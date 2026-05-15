/**
 * 战斗 Buff 头像特效 · 第三档（高阶/绝阶）Canvas 2D 粒子
 * 仅挂在 .character-avatar-container 内，不铺满屏；初阶仍走 CSS 轻量档。
 */
const CombatBuffCanvasFx = {
  _runners: {},

  _runnerKey(holder, buffId) {
    const host = holder && holder.dataset ? holder.dataset.combatBuffHostId || '0' : '0';
    return host + ':' + (buffId || 'fx');
  },

  stop(holder, buffId) {
    if (!holder) return;
    const key = buffId ? this._runnerKey(holder, buffId) : null;
    const keys = key ? [key] : Object.keys(this._runners).filter(function (k) {
      const r = CombatBuffCanvasFx._runners[k];
      return r && r.holder === holder;
    });
    keys.forEach(function (k) {
      const runner = CombatBuffCanvasFx._runners[k];
      if (!runner) return;
      if (runner.rafId) cancelAnimationFrame(runner.rafId);
      if (runner.canvas && runner.canvas.parentNode) runner.canvas.remove();
      delete CombatBuffCanvasFx._runners[k];
    });
  },

  stopAll(holder) {
    this.stop(holder, null);
  },

  /**
   * 绝尘 premium：15～25 粒 + 多层风线，配合 CSS 头像位移/残影
   * @param {object} opts stacks, visualTier, particleCount
   */
  setIntroFade(holder, buffId, durationMs) {
    const key = this._runnerKey(holder, buffId);
    const runner = this._runners[key];
    if (!runner) return;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    runner.introFadeStart = now;
    runner.introFadeDuration = Math.max(400, Number(durationMs) || 900);
    if (runner.canvas) {
      runner.canvas.classList.add('is-intro');
      requestAnimationFrame(function () {
        if (runner.canvas) runner.canvas.classList.add('is-intro-active');
      });
    }
  },

  startSpeedDust(holder, buffId, opts) {
    if (!holder || typeof document === 'undefined') return null;
    this.stop(holder, buffId);

    const stacks = Math.min(Math.max(Number(opts && opts.stacks) || 1, 1), 3);
    const visualTier = Number(opts && opts.visualTier) || 3;
    const introFade = !!(opts && opts.introFade);
    const baseCount = visualTier >= 3 ? 15 : 10;
    const particleCount = Math.min(
      25,
      Math.max(baseCount, baseCount + (stacks - 1) * 4)
    );
    const stackBoost = 0.85 + stacks * 0.22;

    const size = 108;
    const canvas = document.createElement('canvas');
    canvas.className = 'combat-buff-canvas-fx combat-buff-canvas-fx--speed-dust';
    canvas.width = size;
    canvas.height = size;
    canvas.setAttribute('data-buff-id', buffId);
    canvas.setAttribute('aria-hidden', 'true');

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(this._spawnSpeedDustParticle(size, true));
    }

    const windLines = [];
    const windCount = visualTier >= 3 ? 5 : 3;
    for (let w = 0; w < windCount; w++) {
      windLines.push({
        y: size * (0.28 + w * 0.11),
        phase: Math.random() * Math.PI * 2,
        speed: 2.8 + w * 0.35 + stacks * 0.25
      });
    }

    const key = this._runnerKey(holder, buffId);
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const runner = {
      holder: holder,
      buffId: buffId,
      canvas: canvas,
      rafId: 0,
      particles: particles,
      windLines: windLines,
      stackBoost: stackBoost,
      size: size,
      introFadeStart: introFade ? now : 0,
      introFadeDuration: introFade ? 920 : 0
    };
    this._runners[key] = runner;

    holder.appendChild(canvas);
    if (introFade) {
      canvas.classList.add('is-intro');
      requestAnimationFrame(function () {
        if (runner.canvas) runner.canvas.classList.add('is-intro-active');
      });
    }

    const self = this;
    function tick() {
      if (!runner.canvas.isConnected) {
        self.stop(holder, buffId);
        return;
      }
      ctx.clearRect(0, 0, size, size);

      let fadeMul = 1;
      if (runner.introFadeDuration > 0) {
        const t = typeof performance !== 'undefined' ? performance.now() : Date.now();
        const elapsed = t - runner.introFadeStart;
        fadeMul = Math.min(1, elapsed / runner.introFadeDuration);
        fadeMul = fadeMul * fadeMul * (3 - 2 * fadeMul);
      }

      for (let wi = 0; wi < runner.windLines.length; wi++) {
        const line = runner.windLines[wi];
        line.phase += 0.08 * line.speed * (0.35 + fadeMul * 0.65);
        const progress = (Math.sin(line.phase) + 1) * 0.5;
        const x = size * (1.05 - progress * 1.35);
        const alpha = (0.12 + progress * 0.38) * fadeMul;
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 236, 179, ' + alpha + ')';
        ctx.lineWidth = 1.2 + wi * 0.15;
        ctx.shadowColor = 'rgba(129, 212, 250, 0.45)';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.moveTo(x, line.y);
        ctx.lineTo(x + size * 0.42, line.y - 1);
        ctx.stroke();
        ctx.restore();
      }

      for (let i = 0; i < runner.particles.length; i++) {
        const p = runner.particles[i];
        p.x += p.vx * runner.stackBoost;
        p.y += p.vy * runner.stackBoost;
        p.life -= p.decay;
        if (p.life <= 0 || p.y < -4 || p.x < -8) {
          runner.particles[i] = self._spawnSpeedDustParticle(size, false);
          continue;
        }
        const a = Math.min(1, p.life * 1.4) * fadeMul;
        ctx.save();
        ctx.globalAlpha = a * 0.92;
        ctx.fillStyle = 'hsla(' + p.hue + ', 88%, 72%, ' + a + ')';
        ctx.shadowColor = 'rgba(255, 224, 130, 0.65)';
        ctx.shadowBlur = p.size * 2.2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        if (p.streak > 0.3) {
          ctx.strokeStyle = 'rgba(200, 235, 255, ' + (a * 0.55) + ')';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 4, p.y - p.vy * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      runner.rafId = requestAnimationFrame(tick);
    }

    runner.rafId = requestAnimationFrame(tick);
    return runner;
  },

  _spawnSpeedDustParticle(size, scatter) {
    return {
      x: scatter ? Math.random() * size : size * (0.55 + Math.random() * 0.35),
      y: scatter ? size * (0.45 + Math.random() * 0.5) : size * 0.92,
      vx: -(1.4 + Math.random() * 2.8),
      vy: -(0.7 + Math.random() * 2.2),
      life: 0.45 + Math.random() * 0.55,
      decay: 0.014 + Math.random() * 0.012,
      size: 0.8 + Math.random() * 2.2,
      hue: 42 + Math.random() * 28,
      streak: Math.random()
    };
  },

  updateSpeedDust(holder, buffId, opts) {
    const key = this._runnerKey(holder, buffId);
    const runner = this._runners[key];
    if (!runner) {
      return this.startSpeedDust(holder, buffId, opts);
    }
    const stacks = Math.min(Math.max(Number(opts && opts.stacks) || 1, 1), 3);
    runner.stackBoost = 0.85 + stacks * 0.22;
    while (runner.particles.length < Math.min(25, 15 + (stacks - 1) * 4)) {
      runner.particles.push(this._spawnSpeedDustParticle(runner.size, true));
    }
  }
};

if (typeof window !== 'undefined') {
  window.CombatBuffCanvasFx = CombatBuffCanvasFx;
}
