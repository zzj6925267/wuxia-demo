/**
 * NPC数据
 */

// 玩家状态
let playerState = {
  joinedFaction: false,
  learnedSkills: [],
  activeTasks: {},
  completedFactionQuests: {},
  factionContribution: 0
};

// 从localStorage加载状态
function loadPlayerState() {
  const savedState = localStorage.getItem('playerState');
  if (savedState) {
    const loadedState = JSON.parse(savedState);
    playerState.joinedFaction = loadedState.joinedFaction || false;
    playerState.learnedSkills = loadedState.learnedSkills || [];
    playerState.activeTasks = loadedState.activeTasks || {};
    playerState.completedFactionQuests = loadedState.completedFactionQuests || {};
    playerState.factionContribution = loadedState.factionContribution || 0;
  }
}

function npcMainQuestStepDone(questId) {
  try {
    const st = JSON.parse(localStorage.getItem('playerState') || '{}');
    const t = st.activeTasks && st.activeTasks[questId];
    return !!(t && (t.completed || t.isCompleted));
  } catch (e) {
    return false;
  }
}

/**
 * 测试用：退出门派，便于重走「加入正阳」以验证主线第四节。
 * 控制台：leaveFactionForRetest()
 * 传 { keepMainB04: true } 可保留第四节已完成状态。
 */
window.leaveFactionForRetest = function (opt) {
  opt = opt || {};
  const savedState = localStorage.getItem('playerState');
  const state = savedState ? JSON.parse(savedState) : {};
  state.joinedFaction = false;
  if (!state.activeTasks) state.activeTasks = {};
  if (!opt.keepMainB04) {
    delete state.activeTasks.main_b_04;
  }
  localStorage.setItem('playerState', JSON.stringify(state));
  loadPlayerState();
  console.log(
    '[leaveFactionForRetest] 已退出门派。' +
      (opt.keepMainB04 ? 'main_b_04 已保留。' : '') +
      '请刷新正阳地图页或重新打开苏瑶对话再试加入。'
  );
};

// 初始化时加载状态
loadPlayerState();

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
        getOptions: () => {
          loadPlayerState();
          const opts = [{ text: '弟子有门规方面的疑问', next: 'rule' }];
          if (playerState.joinedFaction) {
            opts.push({ text: '门派任务', next: 'faction_task' });
          }
          return opts;
        }
      },
      faction_need_join: {
        text: '老夫看你尚未在本门登记名册。门派差事只派发给正阳弟子——你可到宁阳别院找苏瑶师妹，先办妥入派事宜再来澄心堂。',
        options: [{ text: '弟子这就去', next: 'default' }]
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
      faction_task: {
        text: '门派任务？很好。办妥差事后，须点下方带「可交差」的一项，再向老夫道谢，贡献才会记入功过簿。',
        getOptions: () => {
          loadPlayerState();
          if (!playerState.joinedFaction) {
            return [{ text: '弟子尚未入派', next: 'faction_need_join' }];
          }

          // 获取任务状态
          const savedState = localStorage.getItem('playerState');
          let state = savedState ? JSON.parse(savedState) : {};
          
          // 确保activeTasks存在
          if (!state.activeTasks) state.activeTasks = {};
          
          const tasks = [
            {
              id: 'collect_herbs',
              name: '采集灵芝草',
              reward:
                (typeof getFactionQuestContributionAmount === 'function'
                  ? getFactionQuestContributionAmount('collect_herbs')
                  : 11) + '门派贡献'
            },
            {
              id: 'bandit_clear',
              name: '清理山门前山贼',
              reward:
                (typeof getFactionQuestContributionAmount === 'function'
                  ? getFactionQuestContributionAmount('bandit_clear')
                  : 11) + '门派贡献'
            },
            {
              id: 'organize_books',
              name: '整理藏经楼书籍',
              reward:
                (typeof getFactionQuestContributionAmount === 'function'
                  ? getFactionQuestContributionAmount('organize_books')
                  : 12) + '门派贡献'
            }
          ];
          
          const options = [];
          
          tasks.forEach(task => {
            let displayText = '';
            let nextNode = '';
            
            // 检查任务是否已接取
            const taskData = state.activeTasks && state.activeTasks[task.id];
            if (taskData) {
              const done = !!(taskData.completed || taskData.isCompleted);
              if (done) {
                displayText = `【可交差】${task.name} - ${task.reward}`;
                nextNode = `task_complete_${task.id}`;
              } else {
                const collected = taskData.collected || 0;
                const kc = taskData.killCount != null ? taskData.killCount : (taskData.progress && taskData.progress.killCount) || 0;
                const tk = taskData.targetKill != null ? taskData.targetKill : (taskData.progress && taskData.progress.targetKill) || 3;
                let progress = '';
                if (task.id === 'collect_herbs') progress = ` (${collected}/5)`;
                else if (task.id === 'bandit_clear') progress = ` (${kc}/${tk})`;
                displayText = `【已接取】${task.name}${progress} - ${task.reward}`;
                const remindById = {
                  collect_herbs: 'task_remind_collect',
                  bandit_clear: 'task_remind_bandit',
                  organize_books: 'task_remind_organize'
                };
                nextNode = remindById[task.id] || 'task_list';
              }
            } else {
              displayText = `【未接取】${task.name} - ${task.reward}`;
              nextNode = `task_${task.id}`;
            }
            
            options.push({ text: displayText, next: nextNode });
          });
          
          options.push({ text: '容我考虑一下', next: 'default' });
          
          return options;
        }
      },
      task_list: {
        text: '这是当前的任务列表。',
        options: [
          { text: '好的', next: 'faction_task' }
        ]
      },
      task_remind_collect: {
        text: '灵芝草须往江湖舆图点「探索山林」，在山涧溪旁采集够五朵；未满五朵前，回老夫这里只会看到「已接取」与进度。',
        options: [{ text: '弟子明白', next: 'default' }]
      },
      task_remind_bandit: {
        text: '山贼须在山林地图中与「山贼」相关的战斗点击败累计三只；未满三只前，请继续剿匪，勿忘战后回图。',
        options: [{ text: '弟子明白', next: 'default' }]
      },
      task_remind_organize: {
        text: '整理书籍须亲往「归真藏经楼」找秦松长老，对话中选「弟子这就开始整理」，在楼内把书摆齐；办妥后回澄心堂向赵长老复命。',
        options: [{ text: '弟子这就去藏经楼', next: 'default' }]
      },
      task_collect_herbs: {
        getText: () => {
          const n =
            typeof getFactionQuestContributionAmount === 'function'
              ? getFactionQuestContributionAmount('collect_herbs')
              : 11;
          return `好，灵芝草只长在山林里的「山涧溪旁」。你从江湖舆图点「探索山林」进那方小地图，走到山涧溪旁，在林草处采够5朵回来。完成后记你${n}点门派贡献。`;
        },
        options: [
          { text: '弟子这就去办！', next: 'default' }
        ],
        action: 'accept_task',
        task: 'collect_herbs',
        reward: { contribution: 11 }
      },
      task_bandit_clear: {
        getText: () => {
          const n =
            typeof getFactionQuestContributionAmount === 'function'
              ? getFactionQuestContributionAmount('bandit_clear')
              : 11;
          return `山门前黑风岭有伙山贼作乱，伤了几个路过的百姓。你去清理一下。完成后记你${n}点门派贡献。`;
        },
        options: [
          { text: '弟子领命！', next: 'default' }
        ],
        action: 'accept_task',
        task: 'bandit_clear',
        reward: { contribution: 11 }
      },
      task_organize_books: {
        getText: () => {
          const n =
            typeof getFactionQuestContributionAmount === 'function'
              ? getFactionQuestContributionAmount('organize_books')
              : 12;
          return `藏经楼的书有些乱了，秦松长老一个人忙不过来。你去藏经楼找秦松长老，帮他整理一下书籍吧。完成后记你${n}点门派贡献。`;
        },
        options: [
          { text: '弟子这就去帮忙！', next: 'default' }
        ],
        action: 'accept_task',
        task: 'organize_books',
        reward: { contribution: 12 }
      },
      task_complete_collect_herbs: {
        getText: () => {
          const n =
            typeof getFactionQuestContributionAmount === 'function'
              ? getFactionQuestContributionAmount('collect_herbs')
              : 11;
          return `很好！你完成了采集灵芝草的任务，这是你的奖励。${n}点门派贡献已计入你的账下。`;
        },
        options: [
          { text: '多谢长老！', next: 'faction_task' }
        ],
        action: 'complete_single_task',
        task: 'collect_herbs'
      },
      task_complete_bandit_clear: {
        getText: () => {
          const n =
            typeof getFactionQuestContributionAmount === 'function'
              ? getFactionQuestContributionAmount('bandit_clear')
              : 11;
          return `很好！你完成了清理山门前山贼的任务，这是你的奖励。${n}点门派贡献已计入你的账下。`;
        },
        options: [
          { text: '多谢长老！', next: 'faction_task' }
        ],
        action: 'complete_single_task',
        task: 'bandit_clear'
      },
      task_complete_organize_books: {
        getText: () => {
          const n =
            typeof getFactionQuestContributionAmount === 'function'
              ? getFactionQuestContributionAmount('organize_books')
              : 12;
          return `很好！藏经楼的书籍已经整整齐齐了！这是你的奖励，${n}点门派贡献已计入你的账下。`;
        },
        options: [
          { text: '多谢长老！', next: 'faction_task' }
        ],
        action: 'complete_single_task',
        task: 'organize_books'
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
        getText: () => {
          // 检查是否有整理书籍的任务
          const savedState = localStorage.getItem('playerState');
          if (savedState) {
            const state = JSON.parse(savedState);
            if (state.activeTasks && state.activeTasks.organize_books) {
              const task = state.activeTasks.organize_books;
              if (!(task.completed || task.isCompleted)) {
                return '太好了，你是来帮我整理书籍的吧！正好这架子上的书乱了，辛苦你了！';
              } else {
                return '书籍都整理好了！你去赵长老那里领赏吧！';
              }
            }
          }
          return '年轻人，你来到藏经楼，是想借阅典籍吗？';
        },
        getOptions: () => {
          const savedState = localStorage.getItem('playerState');
          if (savedState) {
            const state = JSON.parse(savedState);
            if (state.activeTasks && state.activeTasks.organize_books) {
              const task = state.activeTasks.organize_books;
              if (!(task.completed || task.isCompleted)) {
                return [
                  { text: '弟子这就开始整理！', action: 'startOrganizeBooks' }
                ];
              }
            }
          }
          return [
            { text: '想借阅基础剑谱', next: 'basic' },
            { text: '想见识镇派绝学', next: 'secret' },
            { text: '只是好奇进来看看', next: 'curious' }
          ];
        }
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
        getText: () => {
          loadPlayerState(); // 每次都重新加载最新状态
          return playerState.joinedFaction 
            ? '大师兄！又见面了，今天想练点什么？' 
            : '呀，是你！又见面了。你也是来正阳派学艺的吗？';
        },
        getOptions: () => {
          loadPlayerState(); // 每次都重新加载最新状态
          if (playerState.joinedFaction) {
            const options = [
              { text: '请教武功', next: 'learn' },
              { text: '闲聊几句', next: 'chat' }
            ];
            if (npcMainQuestStepDone('main_b_07') && !npcMainQuestStepDone('main_b_08')) {
              options.unshift({ text: '（主线）北峰猎户与黑风寨', next: 'remind_b08_dispatch' });
            }
            return options;
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
        getText: () => {
          loadPlayerState(); // 每次都重新加载最新状态
          const savedState = localStorage.getItem('playerState');
          let contribution = 0;
          if (savedState) {
            const state = JSON.parse(savedState);
            contribution = state.factionContribution || 0;
          }
          return `想学武功吗？我可以教你一些入门的功夫。想学哪一样？（贡献：${contribution}）`;
        },
        getOptions: () => {
          loadPlayerState(); // 每次都重新加载最新状态
          const options = [];
          const cost =
            typeof getZhengyangIntroSkillContributionCost === 'function'
              ? getZhengyangIntroSkillContributionCost()
              : 100;
          if (!playerState.learnedSkills.includes('正阳基础剑式')) {
            options.push({ text: `正阳基础剑式（${cost}贡献）`, next: 'confirm_sword' });
          }
          if (!playerState.learnedSkills.includes('正阳吐纳诀')) {
            options.push({ text: `正阳吐纳诀（${cost}贡献）`, next: 'confirm_breath' });
          }
          if (!playerState.learnedSkills.includes('踏云步')) {
            options.push({ text: `踏云步（${cost}贡献）`, next: 'confirm_step' });
          }
          if (options.length === 0) {
            return [{ text: '弟子三门入门皆已谙熟，特来向师姐复命', next: 'report_main_b_07' }];
          }
          return options;
        }
      },
      report_main_b_07: {
        text:
          '好，你既已把三门入门都过了一遍，我便替你记上功过簿这一笔。北峰黑风寨近来绑票勒赎，有猎户孟青松自寨中逃出，说是门里也有弟子被囚。你武学初成，正该下山历练——从江湖舆图进「青苍山麓」，到山贼窝棚寻他搭话问明，再视情形办差。',
        options: [{ text: '弟子这就去', next: 'default' }],
        action: 'complete_main_b_07_report'
      },
      remind_b08_dispatch: {
        text:
          '北峰的事你别耽搁：猎户孟青松蜷在山贼窝棚旁，衣上带血，口口声声说黑风寨扣了人。你从江湖舆图点「探索山林」进青苍山麓，沿山贼巡路往南便是窝棚。',
        options: [{ text: '弟子这就去', next: 'default' }]
      },
      confirm_sword: {
        text: '确定是正阳基础剑式吗？',
        options: [
          { text: '确定！', next: 'default' },
          { text: '我再想想', next: 'learn' }
        ],
        action: 'learn_skill',
        skill: '正阳基础剑式',
        delay: true
      },
      confirm_breath: {
        text: '确定是正阳吐纳诀吗？',
        options: [
          { text: '确定！', next: 'default' },
          { text: '我再想想', next: 'learn' }
        ],
        action: 'learn_skill',
        skill: '正阳吐纳诀',
        delay: true
      },
      confirm_step: {
        text: '确定是踏云步吗？',
        options: [
          { text: '确定！', next: 'default' },
          { text: '我再想想', next: 'learn' }
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
window.loadPlayerState = loadPlayerState; // 暴露加载状态函数

// 门派任务数据
const FACTION_TASKS = [
  {
    id: 'herb_collection',
    name: '下山采购药材',
    text: '嗯，眼下有个任务：下山采购药材。山下回春堂需要一些药材，你去采十株千年灵芝和五株天山雪莲回来。完成后记你11点门派贡献。',
    difficulty: '简单',
    reward: { contribution: 11 }
  },
  {
    id: 'bandit_clear',
    name: '清理山门前山贼',
    text: '嗯，眼下有个任务：清理山门前的山贼。黑风岭有伙山贼作乱，伤了几个路过的百姓，你去清理一下。完成后记你11点门派贡献。',
    difficulty: '普通',
    reward: { contribution: 11 }
  },
  {
    id: 'bloodknife_investigate',
    name: '追查血刀门踪迹',
    text: '嗯，眼下有个任务：追查血刀门踪迹。血刀门最近在附近活动频繁，你去打探一下他们的动向。完成后记你43点门派贡献。',
    difficulty: '困难',
    reward: { contribution: 43 }
  }
];

/**
 * 获取可用的门派任务（排除已接取的任务）
 */
function getAvailableFactionTasks() {
  // 如果没有当前任务，所有任务都可用
  if (!playerState.currentTask) {
    return FACTION_TASKS;
  }
  
  // 返回未接取的任务
  return FACTION_TASKS.filter(task => task.id !== playerState.currentTask);
}

// 暴露任务相关函数到全局
window.FACTION_TASKS = FACTION_TASKS;
window.getAvailableFactionTasks = getAvailableFactionTasks;

// 重置玩家状态函数 - 用于清除所有已学武功、门派贡献等
window.resetPlayerState = function() {
  console.log('========== 开始重置玩家状态 ==========');
  
  // 显示当前localStorage内容
  console.log('重置前 localStorage 内容:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    console.log('  ' + key + ':', localStorage.getItem(key));
  }
  
  // 清除主要的玩家状态
  localStorage.removeItem('playerState');
  localStorage.removeItem('playerMartialArts');
  
  // 清除所有可能的玩家数据
  let keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      if (key.includes('player') || 
          key.includes('skill') || 
          key.includes('task') ||
          key.includes('faction') ||
          key.includes('contribution')) {
        keysToRemove.push(key);
      }
    }
  }
  keysToRemove.forEach(function(key) {
    localStorage.removeItem(key);
  });
  
  console.log('========== 重置完成 ==========');
  console.log('已清除 ' + (keysToRemove.length + 2) + ' 条数据');
  console.log('所有武功已恢复到未学习状态，贡献值已重置为0');
  
  alert('玩家状态已成功重置！\n所有武功已恢复到未学习状态，贡献值已重置为0。\n页面将自动刷新。');
  
  // 刷新页面
  location.reload();
};

// 添加贡献函数
window.addContribution = function(amount) {
  const savedState = localStorage.getItem('playerState');
  let state = savedState ? JSON.parse(savedState) : {};
  
  if (!state.factionContribution) state.factionContribution = 0;
  state.factionContribution += amount;
  
  localStorage.setItem('playerState', JSON.stringify(state));
  
  console.log('已添加 ' + amount + ' 门派贡献，当前贡献：' + state.factionContribution);
  alert('已添加 ' + amount + ' 门派贡献！\n当前贡献：' + state.factionContribution);
};

console.log('玩家状态重置函数已加载！请在浏览器控制台输入 resetPlayerState() 来重置。');
console.log('添加贡献函数已加载！请在浏览器控制台输入 addContribution(500) 来添加500贡献。');
