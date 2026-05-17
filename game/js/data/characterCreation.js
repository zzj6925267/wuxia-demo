/**
 * 开局角色创建：开场文案 + 五道问答（每题选一，对应四维 +1）
 * 文案为本项目原创，勿复用其他游戏角色创建句式。
 */
window.CHARACTER_CREATION = {
  intro: {
    lines: [
      '师父在武馆后堂拍案定计：你先赴青石镇落脚，镇上有旧友接应，不可张扬。',
      '你背着青布包袱上路，道旁茶棚里有人议论镇口近来不太平，你只当耳旁风。',
      '日头偏西时，青石镇的牌坊已在雾后露出檐角。'
    ],
    clickHint: '点击继续'
  },

  /** 五题；每选项 stat 为 strength | agility | bone | qi */
  questions: [
    {
      id: 'q1_childhood',
      narrative:
        '回想在武馆打杂那些年，师父说你性子倔，可有一桩习惯最明显——',
      options: [
        { label: '爱搬重物、与人角力', stat: 'strength' },
        { label: '爱在檐上走、追猫撵狗', stat: 'agility' },
        { label: '挨罚站桩，从不偷懒', stat: 'bone' },
        { label: '夜里静坐，听风数息', stat: 'qi' }
      ]
    },
    {
      id: 'q2_farewell',
      narrative: '临行前夜，师父只叮嘱一句，你记在心里的是——',
      options: [
        { label: '出手要有分寸，别逞凶', stat: 'strength' },
        { label: '遇事先躲，留得青山在', stat: 'agility' },
        { label: '吃住从简，身子别垮', stat: 'bone' },
        { label: '少说话，先看清局势', stat: 'qi' }
      ]
    },
    {
      id: 'q3_road',
      narrative: '来青石镇这一路上，你花心思最多的是——',
      options: [
        { label: '把拳套绑紧，每日练拳', stat: 'strength' },
        { label: '认路标、记岔口，免得迷路', stat: 'agility' },
        { label: '按时歇脚，雨天避寒', stat: 'bone' },
        { label: '默背师父教的吐纳口诀', stat: 'qi' }
      ]
    },
    {
      id: 'q4_trouble',
      narrative: '茶棚里听说镇东有人滋事，你若撞见，多半会——',
      options: [
        { label: '上前问明缘由，该管则管', stat: 'strength' },
        { label: '绕开人群，从巷子走', stat: 'agility' },
        { label: '先观望，等对方露破绽', stat: 'bone' },
        { label: '打听消息，再定进退', stat: 'qi' }
      ]
    },
    {
      id: 'q5_gate',
      narrative: '牌坊在望，你头一回进青石镇，打算先——',
      options: [
        { label: '直奔武馆，拜访旧识', stat: 'strength' },
        { label: '沿市集闲逛，认认铺面', stat: 'agility' },
        { label: '找客栈住下，安顿包袱', stat: 'bone' },
        { label: '在镇口歇脚，听人闲聊', stat: 'qi' }
      ]
    }
  ],

  statLabels: {
    strength: '臂力',
    agility: '身法',
    bone: '根骨',
    qi: '内息'
  },

  outro: {
    line: '镇口风铃轻响，你提步踏入青石镇。',
    clickHint: '踏入江湖'
  }
};
