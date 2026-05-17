/**
 * 战斗特效工具类
 * @module BattleEffects
 */
const BattleEffects = {
  /**
   * 显示内功回血特效（绿色圆点从下往上漂浮）
   * @param {HTMLElement} targetElement - 目标DOM元素（头像容器）
   * @param {number} healAmount - 回血量
   * @param {boolean} isPlayer - 是否是玩家（已废弃，统一绿色）
   */
  showInnerSkillHeal(targetElement, healAmount, isPlayer = true) {
    if (!targetElement) return;

    // 创建特效容器
    const effectContainer = document.createElement('div');
    effectContainer.className = 'inner-skill-heal-effect';
    effectContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
      overflow: visible;
    `;

    // 1. 从下往上漂浮的绿色圆点粒子（12个粒子）
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: absolute;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #4CAF50;
        box-shadow: 0 0 6px #4CAF50, 0 0 12px rgba(76, 175, 80, 0.6);
        left: ${30 + Math.random() * 40}%;
        bottom: 20%;
      `;
      
      const delay = i * 0.1;
      const duration = 1 + Math.random() * 0.5;
      const offsetX = (Math.random() - 0.5) * 60;
      
      const keyframes = `
        @keyframes floatUp-${i} {
          0% { 
            transform: translateY(0) translateX(0) scale(0.5); 
            opacity: 0; 
          }
          20% { 
            opacity: 1; 
            transform: translateY(-20px) translateX(${offsetX * 0.3}px) scale(1); 
          }
          80% { 
            opacity: 0.8; 
            transform: translateY(-80px) translateX(${offsetX}px) scale(0.8); 
          }
          100% { 
            transform: translateY(-120px) translateX(${offsetX * 0.5}px) scale(0.3); 
            opacity: 0; 
          }
        }
      `;
      
      const style = document.createElement('style');
      style.textContent = keyframes;
      document.head.appendChild(style);
      
      particle.style.animation = `floatUp-${i} ${duration}s ease-out ${delay}s forwards`;
      
      effectContainer.appendChild(particle);
    }

    // 2. 底部发光效果（模拟光晕从下往上扩散）
    const bottomGlow = document.createElement('div');
    bottomGlow.style.cssText = `
      position: absolute;
      width: 60px;
      height: 30px;
      left: 50%;
      bottom: 15%;
      transform: translateX(-50%);
      background: radial-gradient(ellipse at center bottom, rgba(76, 175, 80, 0.5) 0%, rgba(76, 175, 80, 0.2) 50%, transparent 70%);
      animation: bottomGlow 1s ease-out forwards;
    `;
    
    const bottomGlowStyle = document.createElement('style');
    bottomGlowStyle.textContent = `
      @keyframes bottomGlow {
        0% { 
          transform: translateX(-50%) scaleY(0.5); 
          opacity: 0; 
        }
        30% { 
          opacity: 1; 
        }
        100% { 
          transform: translateX(-50%) scaleY(2) translateY(-20px); 
          opacity: 0; 
        }
      }
    `;
    document.head.appendChild(bottomGlowStyle);
    
    effectContainer.appendChild(bottomGlow);

    // 3. 绿色回血数字
    const number = document.createElement('div');
    number.textContent = `+${healAmount}`;
    number.style.cssText = `
      position: absolute;
      top: 30%;
      left: 50%;
      transform: translateX(-50%);
      font-size: 28px;
      font-weight: bold;
      color: #4CAF50;
      text-shadow: 0 0 10px rgba(76, 175, 80, 1), 0 2px 0 rgba(0, 0, 0, 0.5);
      animation: healNumberFloat 1s ease-out forwards;
      white-space: nowrap;
    `;
    
    const numberStyle = document.createElement('style');
    numberStyle.textContent = `
      @keyframes healNumberFloat {
        0% { 
          transform: translateX(-50%) translateY(20px) scale(0.5); 
          opacity: 0; 
        }
        30% { 
          transform: translateX(-50%) translateY(0) scale(1.2); 
          opacity: 1; 
        }
        100% { 
          transform: translateX(-50%) translateY(-50px) scale(1); 
          opacity: 0; 
        }
      }
    `;
    document.head.appendChild(numberStyle);
    
    effectContainer.appendChild(number);

    // 添加特效到目标元素
    targetElement.appendChild(effectContainer);

    // 1.2秒后移除特效
    setTimeout(() => {
      effectContainer.remove();
    }, 1200);
  }
};

// 暴露到全局
window.BattleEffects = BattleEffects;
