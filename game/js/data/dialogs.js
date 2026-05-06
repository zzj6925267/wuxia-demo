/**
 * 对话数据
 * @module dialogs
 */

/**
 * 对话定义
 */
export const DIALOGS = {
  // 神秘老者对话
  dialog_mysterious_old_man: {
    id: 'dialog_mysterious_old_man',
    lines: [
      {
        id: 'mysterious_1',
        speaker: '神秘老者',
        text: '年轻人，你来了。我等候多时了。',
        avatar: 'assets/images/npcs/mysterious_old_man.png',
        choices: [
          { text: '请问您是？', next: 'mysterious_2a' },
          { text: '您知道我会来？', next: 'mysterious_2b' },
          { text: '武林大会何时开始？', next: 'mysterious_2c' }
        ]
      },
      {
        id: 'mysterious_2a',
        speaker: '神秘老者',
        text: '老朽无名，只是江湖中一个看客罢了。但我知道你的命运...',
        avatar: 'assets/images/npcs/mysterious_old_man.png',
        next: 'mysterious_3'
      },
      {
        id: 'mysterious_2b',
        speaker: '神秘老者',
        text: '天机不可泄露，但你的到来早已注定。',
        avatar: 'assets/images/npcs/mysterious_old_man.png',
        next: 'mysterious_3'
      },
      {
        id: 'mysterious_2c',
        speaker: '神秘老者',
        text: '三日后，在黄山之巅。但在此之前，你需要证明自己的实力。',
        avatar: 'assets/images/npcs/mysterious_old_man.png',
        next: 'mysterious_3'
      },
      {
        id: 'mysterious_3',
        speaker: '神秘老者',
        text: '去吧，年轻人。江湖之路，道阻且长。',
        avatar: 'assets/images/npcs/mysterious_old_man.png',
        next: null,
        flags: { 'talked_to_old_man': true }
      }
    ]
  },

  // 客栈老板对话
  dialog_inn_keeper: {
    id: 'dialog_inn_keeper',
    lines: [
      {
        id: 'inn_1',
        speaker: '客栈老板',
        text: '客官，打尖还是住店？',
        avatar: 'assets/images/npcs/inn_keeper.png',
        choices: [
          { text: '来一间上房', next: 'inn_2a', requirement: { gold: 20 } },
          { text: '只要一碗茶水', next: 'inn_2b' },
          { text: '打听一下消息', next: 'inn_2c' }
        ]
      },
      {
        id: 'inn_2a',
        speaker: '客栈老板',
        text: '好嘞！二楼天字第一号房，您里边请！',
        avatar: 'assets/images/npcs/inn_keeper.png',
        next: 'inn_end',
        rewards: { gold: -20, hpRestore: 50, mpRestore: 25 }
      },
      {
        id: 'inn_2b',
        speaker: '客栈老板',
        text: '好的，一碗热茶马上就来。',
        avatar: 'assets/images/npcs/inn_keeper.png',
        next: 'inn_end',
        rewards: { hpRestore: 10 }
      },
      {
        id: 'inn_2c',
        speaker: '客栈老板',
        text: '最近可不太平啊，听说山下出现了一伙山贼，不少过路人都被抢了。',
        avatar: 'assets/images/npcs/inn_keeper.png',
        choices: [
          { text: '山贼？在哪出没？', next: 'inn_3a' },
          { text: '多谢提醒', next: 'inn_end' }
        ]
      },
      {
        id: 'inn_3a',
        speaker: '客栈老板',
        text: '就在西边的山道上，为首的好像是什么"黑风寨"的头目，武功不弱。',
        avatar: 'assets/images/npcs/inn_keeper.png',
        next: 'inn_end',
        flags: { 'learned_about_bandits': true }
      },
      {
        id: 'inn_end',
        speaker: '客栈老板',
        text: '客官慢走，欢迎下次再来！',
        avatar: 'assets/images/npcs/inn_keeper.png',
        next: null
      }
    ]
  },

  // 铁匠师傅对话
  dialog_weapon_smith: {
    id: 'dialog_weapon_smith',
    lines: [
      {
        id: 'smith_1',
        speaker: '铁匠师傅',
        text: '小伙子，想要打造什么兵器？',
        avatar: 'assets/images/npcs/weapon_smith.png',
        choices: [
          { text: '我想打一把剑', next: 'smith_2a' },
          { text: '有什么好货？', next: 'smith_2b' },
          { text: '只是看看', next: 'smith_end' }
        ]
      },
      {
        id: 'smith_2a',
        speaker: '铁匠师傅',
        text: '打剑啊...上好的精铁剑要50两银子，需要等三天。',
        avatar: 'assets/images/npcs/weapon_smith.png',
        choices: [
          { text: '太贵了，算了', next: 'smith_end' },
          { text: '好，我订一把', next: 'smith_3a', requirement: { gold: 50 } }
        ]
      },
      {
        id: 'smith_3a',
        speaker: '铁匠师傅',
        text: '爽快！三天后来取货吧！',
        avatar: 'assets/images/npcs/weapon_smith.png',
        next: 'smith_end',
        rewards: { gold: -50 },
        flags: { 'ordered_sword': true }
      },
      {
        id: 'smith_2b',
        speaker: '铁匠师傅',
        text: '我这里有一把现成的铁剑，只要30两，锋利得很！',
        avatar: 'assets/images/npcs/weapon_smith.png',
        choices: [
          { text: '买了！', next: 'smith_3b', requirement: { gold: 30 } },
          { text: '还是算了', next: 'smith_end' }
        ]
      },
      {
        id: 'smith_3b',
        speaker: '铁匠师傅',
        text: '好眼光！这把剑可是我亲手打造的！',
        avatar: 'assets/images/npcs/weapon_smith.png',
        next: 'smith_end',
        rewards: { gold: -30, items: [{ id: 'iron_sword', quantity: 1 }] }
      },
      {
        id: 'smith_end',
        speaker: '铁匠师傅',
        text: '需要的时候再来！',
        avatar: 'assets/images/npcs/weapon_smith.png',
        next: null
      }
    ]
  }
};

/**
 * 获取对话数据
 * @param {string} dialogId - 对话ID
 * @returns {object|null} 对话对象
 */
export function getDialogById(dialogId) {
  return DIALOGS[dialogId] || null;
}

/**
 * 获取对话行
 * @param {string} dialogId - 对话ID
 * @param {string} lineId - 行ID
 * @returns {object|null} 对话行对象
 */
export function getDialogLine(dialogId, lineId) {
  const dialog = getDialogById(dialogId);
  if (!dialog) return null;
  return dialog.lines.find(line => line.id === lineId) || null;
}