/**
 * 对话系统
 * @module DialogSystem
 */

/**
 * 对话系统类
 */
class DialogSystem {
  /**
   * 构造函数
   * @param {PlayerSystem} playerSystem - 玩家系统
   * @param {function} onDialogStart - 对话开始回调
   * @param {function} onDialogEnd - 对话结束回调
   * @param {function} onChoice - 选项选择回调
   */
  constructor(playerSystem, onDialogStart, onDialogEnd, onChoice) {
    this.playerSystem = playerSystem;
    this.onDialogStart = onDialogStart;
    this.onDialogEnd = onDialogEnd;
    this.onChoice = onChoice;
    
    this.currentDialog = null;
    this.currentLine = null;
    this.currentLineIndex = 0;
    this.isActive = false;
  }

  /**
   * 开始对话
   * @param {string} dialogId - 对话ID
   * @returns {boolean} 是否成功开始
   */
  startDialog(dialogId) {
    const dialog = window.getDialogById(dialogId);
    if (!dialog) {
      console.error(`Dialog not found: ${dialogId}`);
      return false;
    }

    this.currentDialog = dialog;
    this.currentLineIndex = 0;
    this.currentLine = dialog.lines[0];
    this.isActive = true;

    if (this.onDialogStart) {
      this.onDialogStart(dialog);
    }

    return true;
  }

  /**
   * 获取当前对话行
   * @returns {object|null} 当前对话行
   */
  getCurrentLine() {
    return this.currentLine;
  }

  /**
   * 获取当前对话
   * @returns {object|null} 当前对话
   */
  getCurrentDialog() {
    return this.currentDialog;
  }

  /**
   * 获取可用选项
   * @returns {Array} 可用选项列表
   */
  getAvailableChoices() {
    if (!this.currentLine || !this.currentLine.choices) {
      return [];
    }

    return this.currentLine.choices.filter(choice => {
      if (!choice.requirement) return true;
      return this._checkRequirement(choice.requirement);
    });
  }

  /**
   * 检查需求条件
   * @param {object} requirement - 需求条件
   * @returns {boolean} 是否满足条件
   */
  _checkRequirement(requirement) {
    const player = this.playerSystem.getPlayer();

    // 检查金币需求
    if (requirement.gold && player.gold < requirement.gold) {
      return false;
    }

    // 检查等级需求
    if (requirement.level && player.level < requirement.level) {
      return false;
    }

    // 检查物品需求
    if (requirement.item) {
      const hasItem = player.inventory.some(item => item.id === requirement.item);
      if (!hasItem) return false;
    }

    // 检查标记需求
    if (requirement.flag) {
      const flagValue = this.playerSystem.getFlag(requirement.flag);
      if (!flagValue) return false;
    }

    return true;
  }

  /**
   * 选择选项
   * @param {number} choiceIndex - 选项索引
   * @returns {boolean} 是否成功
   */
  selectChoice(choiceIndex) {
    const choices = this.getAvailableChoices();
    if (choiceIndex < 0 || choiceIndex >= choices.length) {
      return false;
    }

    const choice = choices[choiceIndex];
    
    if (this.onChoice) {
      this.onChoice(choice);
    }

    return this.goToLine(choice.next);
  }

  /**
   * 跳转到指定对话行
   * @param {string} lineId - 行ID
   * @returns {boolean} 是否成功
   */
  goToLine(lineId) {
    if (!this.currentDialog) return false;

    const line = window.getDialogLine(this.currentDialog.id, lineId);
    if (!line) {
      return this.endDialog();
    }

    this.currentLine = line;
    this.currentLineIndex = this.currentDialog.lines.findIndex(l => l.id === lineId);

    // 应用奖励
    if (line.rewards) {
      this._applyRewards(line.rewards);
    }

    // 设置标记
    if (line.flags) {
      this._applyFlags(line.flags);
    }

    return true;
  }

  /**
   * 应用奖励
   * @param {object} rewards - 奖励对象
   */
  _applyRewards(rewards) {
    if (rewards.gold) {
      if (rewards.gold > 0) {
        this.playerSystem.addGold(rewards.gold);
      } else {
        this.playerSystem.spendGold(-rewards.gold);
      }
    }

    if (rewards.hpRestore) {
      this.playerSystem.heal(rewards.hpRestore);
    }

    if (rewards.mpRestore) {
      this.playerSystem.restoreMp(rewards.mpRestore);
    }

    if (rewards.items && rewards.items.length > 0) {
      rewards.items.forEach(item => {
        this.playerSystem.addItem(item.id, item.quantity || 1);
      });
    }
  }

  /**
   * 应用标记
   * @param {object} flags - 标记对象
   */
  _applyFlags(flags) {
    Object.keys(flags).forEach(flagName => {
      this.playerSystem.setFlag(flagName, flags[flagName]);
    });
  }

  /**
   * 继续到下一行
   * @returns {boolean} 是否成功
   */
  nextLine() {
    if (!this.currentLine) {
      return this.endDialog();
    }

    // 如果有选项，不自动继续
    if (this.currentLine.choices && this.currentLine.choices.length > 0) {
      return true;
    }

    // 如果有下一行ID，跳转到下一行
    if (this.currentLine.next) {
      return this.goToLine(this.currentLine.next);
    }

    // 否则结束对话
    return this.endDialog();
  }

  /**
   * 结束对话
   * @returns {boolean} 是否成功
   */
  endDialog() {
    this.isActive = false;
    
    if (this.onDialogEnd) {
      this.onDialogEnd(this.currentDialog);
    }

    this.currentDialog = null;
    this.currentLine = null;
    this.currentLineIndex = 0;

    return true;
  }

  /**
   * 检查是否正在对话
   * @returns {boolean} 是否活跃
   */
  isDialogActive() {
    return this.isActive;
  }
}

// 暴露到全局
window.DialogSystem = DialogSystem;