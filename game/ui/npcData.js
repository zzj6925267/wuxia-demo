/**
 * NPC数据
 */

// 玩家状态
let playerState = {
  joinedFaction: false,
  learnedSkills: []
};

// NPC数据
const ZHENGYANG_NPCS = {
  liyi: {
    id: 'liyi',
    name: '李逸',
    title: '正阳派掌门',
    icon: '👨‍🦰',
    location: ['zhengyang_hall'],
    dialogues: {
      default: {
        text: '嗯？是你啊。来得正好，陪我练两招？',
        options: [
          { text: '晚辈不敢与掌门过招', next: 'humble' },
          { text: '请掌门指点！', next: 'fight' },
          { text: '掌门，我有要事禀报', next: 'serious' }
        ]
      },
      humble: {
        text: '哈哈，年轻人谦虚是好事，但学武之人不可怯战。罢了，你若有心事，不妨说来听听。',
        options: [
          { text: '多谢掌门', next: 'default' }
        ]
      },
      fight: {
        text: '好！有胆识！不过点到为止。（李逸拔出纯阳剑，剑气森然）',
        options: [
          { text: '承让！', next: 'default' }
        ]
      },
      serious: {
        text: '哦？何事如此郑重？',
        options: [
          { text: '关于血刀门的动向...', next: 'bloodknife' },
          { text: '其实也没什么大事', next: 'default' }
        ]
      },
      bloodknife: {
        text: '血刀门...他们最近确实在附近活动频繁。你有线索？',
        options: [
          { text: '弟子发现他们在打听正阳派的消息', next: 'warn' },
          { text: '暂时还没有具体线索', next: 'default' }
        ]
      },
      warn: {
        text: '我知道了。你做得很好，继续留意，有情况立刻禀报。',
        options: [
          { text: '弟子明白！', next: 'default' }
        ]
      }
    }
  },
  zhaoke: {
    id: 'zhaoke',
    name: '赵恪',
    title: '内门执法长老',
    icon: '👨‍🦳',
    location: ['chengxin_tang'],
    dialogues: {
      default: {
        text: '嗯？你不在剑坪练剑，来这里做什么？',
        options: [
          { text: '长老安好，弟子只是路过', next: 'pass' },
          { text: '弟子有门规方面的疑问', next: 'rule' },
          { text: '想请教长老武学心得', next: 'martial' }
        ]
      },
      pass: {
        text: '哼，无事便去练剑！正阳派的弟子，当以剑法为重。',
        options: [
          { text: '弟子告退', next: 'default' }
        ]
      },
      rule: {
        text: '门规？说吧。',
        options: [
          { text: '请问「不滥杀」一条如何界定？', next: 'rule_detail' },
          { text: '没什么了，多谢长老', next: 'default' }
        ]
      },
      rule_detail: {
        text: '对敌当制而不杀，除非对方是穷凶极恶之徒。记住，剑是用来守护的，不是用来杀戮的。',
        options: [
          { text: '弟子谨记', next: 'default' }
        ]
      },
      martial: {
        text: '武学心得？去看剑痕碑吧，那里有历代掌门的体悟，比我说的有用。',
        options: [
          { text: '弟子明白了', next: 'default' }
        ]
      }
    }
  },
  qinsong: {
    id: 'qinsong',
    name: '秦松',
    title: '藏经楼守阁长老',
    icon: '🧓',
    location: ['gui_zhen_lou'],
    dialogues: {
      default: {
        text: '年轻人，你来到藏经楼，是想借阅典籍吗？',
        options: [
          { text: '想借阅基础剑谱', next: 'basic' },
          { text: '想见识镇派绝学', next: 'secret' },
          { text: '只是好奇进来看看', next: 'curious' }
        ]
      },
      basic: {
        text: '基础剑谱在一楼，自己去挑吧。记住，看完要归位。',
        options: [
          { text: '多谢长老', next: 'default' }
        ]
      },
      secret: {
        text: '镇派绝学？非核心弟子不得入内。你若有天赋，李掌门自然会指点你。',
        options: [
          { text: '弟子明白了', next: 'default' }
        ]
      },
      curious: {
        text: '藏经楼不是闲逛的地方。想看就去一楼，那里的典籍足以让你学上几年。',
        options: [
          { text: '是，弟子告退', next: 'default' }
        ]
      }
    }
  },
  shitie: {
    id: 'shitie',
    name: '石铁',
    title: '淬锋坊坊主',
    icon: '👷',
    location: ['cuifeng_fang'],
    dialogues: {
      default: {
        text: '叮叮当当...哦，是你啊。来铸剑还是修剑？',
        options: [
          { text: '来看看铸剑', next: 'watch' },
          { text: '想请坊主修剑', next: 'repair' },
          { text: '听说这里有纯阳真火？', next: 'fire' }
        ]
      },
      watch: {
        text: '铸剑讲究火候和心境。你看这炉中火，乃是纯阳真火，淬炼出的剑自带正气。',
        options: [
          { text: '真是神奇', next: 'default' }
        ]
      },
      repair: {
        text: '把剑拿来我看看。嗯...这剑伤得不轻，需要用纯阳真火重铸一番。',
        options: [
          { text: '有劳坊主', next: 'default' }
        ]
      },
      fire: {
        text: '纯阳真火？那是护山大阵引动的阳气所化，寻常人可碰不得。不过用来铸剑，倒是绝佳。',
        options: [
          { text: '长见识了', next: 'default' }
        ]
      }
    }
  },
  suhe: {
    id: 'suhe',
    name: '苏和',
    title: '回春堂医官',
    icon: '👨‍⚕️',
    location: ['huichun_tang'],
    dialogues: {
      default: {
        text: '这位少侠，可是受伤了？还是来取药的？',
        options: [
          { text: '来看看有没有适合的丹药', next: 'medicine' },
          { text: '听说有纯阳正气丹？', next: 'zhenqi' },
          { text: '只是来拜访一下', next: 'visit' }
        ]
      },
      medicine: {
        text: '要看你需要什么。强身健体的、疗伤的、解毒的...我们这里都有。',
        options: [
          { text: '先看看解毒的', next: 'default' },
          { text: '不用了，谢谢', next: 'default' }
        ]
      },
      zhenqi: {
        text: '纯阳正气丹？那是我们的镇堂之宝，专门克制阴邪毒素，对付血刀门正合适。',
        options: [
          { text: '果然名不虚传', next: 'default' }
        ]
      },
      visit: {
        text: '哈哈，欢迎欢迎。不过我这里可是医馆，没病没痛的人可不多来呢。',
        options: [
          { text: '打扰了', next: 'default' }
        ]
      }
    }
  },
  suyao: {
    id: 'suyao',
    name: '苏瑶',
    title: '内门弟子',
    icon: '👧',
    location: ['ningyang_bieyuan'],
    dialogues: {
      default: {
        getText: () => playerState.joinedFaction 
          ? '大师兄！又见面了，今天想练点什么？' 
          : '呀，是你！又见面了。你也是来正阳派学艺的吗？',
        getOptions: () => {
          if (playerState.joinedFaction) {
            return [
              { text: '请教武功', next: 'learn' },
              { text: '闲聊几句', next: 'chat' }
            ];
          }
          return [
            { text: '加入门派', next: 'join' },
            { text: '表明身份', next: 'identity' }
          ];
        }
      },
      join: {
        text: '太好了！我早就觉得你是个可塑之才。掌门最近正好在招收新弟子，我带你去登记吧！',
        options: [
          { text: '麻烦你了！', next: 'join_success' }
        ]
      },
      join_success: {
        text: '不客气！从今天起，你就是正阳派的一员了。以后有什么不懂的，随时可以来问我。',
        options: [
          { text: '请教武功', next: 'learn' },
          { text: '闲聊几句', next: 'chat' }
        ],
        action: 'join_faction'
      },
      identity: {
        text: '原来如此。既然你不是来学艺的，那来我们正阳派有什么事吗？',
        options: [
          { text: '只是来拜访一下', next: 'default' }
        ]
      },
      learn: {
        text: '想学武功吗？我可以教你一些入门的功夫。想学哪一样？',
        getOptions: () => {
          const options = [];
          if (!playerState.learnedSkills.includes('正阳基础剑式')) {
            options.push({ text: '正阳基础剑式', next: 'sword_skill' });
          }
          if (!playerState.learnedSkills.includes('正阳吐纳诀')) {
            options.push({ text: '正阳吐纳诀', next: 'breath_skill' });
          }
          if (!playerState.learnedSkills.includes('踏云步')) {
            options.push({ text: '踏云步', next: 'step_skill' });
          }
          if (options.length === 0) {
            return [{ text: '我已经学会所有入门功夫了', next: 'chat' }];
          }
          return options;
        }
      },
      sword_skill: {
        text: '好，我来教你正阳基础剑式的要诀...看好了...',
        options: [
          { text: '多谢师姐！', next: 'default' }
        ],
        action: 'learn_skill',
        skill: '正阳基础剑式',
        delay: true
      },
      breath_skill: {
        text: '正阳吐纳诀是我们门派的基础内功，来，跟着我一起调息...',
        options: [
          { text: '多谢师姐！', next: 'default' }
        ],
        action: 'learn_skill',
        skill: '正阳吐纳诀',
        delay: true
      },
      step_skill: {
        text: '踏云步是一门轻盈的轻功，身法飘逸，来，我示范一遍给你看...',
        options: [
          { text: '多谢师姐！', next: 'default' }
        ],
        action: 'learn_skill',
        skill: '踏云步',
        delay: true
      },
      chat: {
        text: '哈哈，其实我也是刚入门没多久呢。不过这里的师兄师姐都很照顾我，感觉就像一家人一样。',
        options: [
          { text: '真让人羡慕', next: 'default' }
        ]
      }
    }
  }
};

// 暴露到全局
window.ZHENGYANG_NPCS = ZHENGYANG_NPCS;
