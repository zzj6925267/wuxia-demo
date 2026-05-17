// 所有任务数据配置
const ALL_TASKS = {
  main: [
    {
      id: 'main_b_01',
      chainOrder: 1,
      name: '青石初履',
      type: 'main',
      description:
        '入镇后可在镇口与巡丁闲聊两句认路（可选）。要完成本节，须到「青石板街」与杂货摊王福寿把话说完。',
      rewards: [
        { type: 'gold', value: 8, name: '银两' },
        { type: 'exp', value: 380, name: '经验' },
        { type: 'yueli', value: 40, name: '历练' }
      ],
      target: { type: 'story', count: 1 },
      location: '青石镇 · 青石板街'
    },
    {
      id: 'main_b_02',
      chainOrder: 2,
      name: '武馆问径',
      type: 'main',
      description:
        '到「青石武馆」寻教头。对话里两项：前一句带「（主线）」为听门前道理、推进当前事；带「（购武）」为银两换图谱。主街未踩熟前，他仍会撵你回街上。主线推进含：领入门抄本与木械 → 背包研读悟通后记入武学 → 在武学页修炼至第三重 → 再请教头喂招考校（不必另接任务，按对话与武学界面完成即可）。',
      rewards: [
        { type: 'gold', value: 10, name: '银两' },
        { type: 'exp', value: 540, name: '经验' },
        { type: 'yueli', value: 60, name: '历练' }
      ],
      target: { type: 'story', count: 1 },
      location: '青石镇 · 青石武馆'
    },
    {
      id: 'main_b_03',
      chainOrder: 3,
      name: '图开山门',
      type: 'main',
      description:
        '展江湖舆图，往正阳一行。此去非为逞勇，乃为求一安身立命之法。离开青石镇后，进入「江湖舆图」页面（大地图）即视为已展图。',
      rewards: [
        { type: 'gold', value: 12, name: '银两' },
        { type: 'exp', value: 504, name: '经验' },
        { type: 'yueli', value: 56, name: '历练' }
      ],
      target: { type: 'story', count: 1 },
      location: '江湖舆图（离开青石镇后进入的大地地图页）'
    },
    {
      id: 'main_b_04',
      chainOrder: 4,
      name: '正阳入籍',
      type: 'main',
      description:
        '谒内门弟子苏瑶，陈明来意，登记入派。自此身属山门，言行皆系门墙。',
      rewards: [
        { type: 'gold', value: 15, name: '银两' },
        { type: 'exp', value: 702, name: '经验' },
        { type: 'yueli', value: 78, name: '历练' }
      ],
      target: { type: 'story', count: 1 },
      location: '正阳派 · 凝阳别院'
    },
    {
      id: 'main_b_05',
      chainOrder: 5,
      name: '贡献与艺',
      type: 'main',
      description:
        '苏瑶道：门中授艺，以功过簿上之贡献为凭。无贡献，则口诀不得轻传。可往澄心堂，向赵长老请领差遣。',
      rewards: [
        { type: 'gold', value: 12, name: '银两' },
        { type: 'exp', value: 666, name: '经验' },
        { type: 'yueli', value: 74, name: '历练' }
      ],
      target: { type: 'story', count: 1 },
      location: '正阳派 · 澄心堂'
    },
    {
      id: 'main_b_06',
      chainOrder: 6,
      name: '三事九回',
      type: 'main',
      description:
        '赵长老所遣，不外采药、剿匪、理籍三类。在澄心堂「领取」仅表示接下差事，不算办妥；须到指定地点达成目标后，再回澄心堂向赵长老交差，该条方计完成。三类可轮换多回以积贡献，切忌急功近利。',
      rewards: [
        { type: 'gold', value: 18, name: '银两' },
        { type: 'exp', value: 846, name: '经验' },
        { type: 'yueli', value: 94, name: '历练' }
      ],
      target: { type: 'story', count: 1 },
      location: '正阳派 · 澄心堂'
    },
    {
      id: 'main_b_07',
      chainOrder: 7,
      name: '授式入门',
      type: 'main',
      description:
        '携功复命于苏瑶。贡献既足，方许择一门入门武学；三门皆熟后，师姐会命你赴青苍山麓查北峰黑风寨之事（见下节）。',
      rewards: [
        { type: 'gold', value: 20, name: '银两' },
        { type: 'exp', value: 1080, name: '经验' },
        { type: 'yueli', value: 120, name: '历练' }
      ],
      target: { type: 'story', count: 1 },
      location: '正阳派 · 凝阳别院'
    },
    {
      id: 'main_b_08',
      chainOrder: 8,
      name: '林樾试锋',
      type: 'main',
      description:
        '苏瑶嘱你从江湖舆图进入「青苍山麓」：北峰黑风寨近来绑票，猎户孟青松自寨中逃出至山贼窝棚报信，须先踏入山林（首次入图记结），再往窝棚搭话（见「北峰问讯」与「清剿黑风寨」）。',
      rewards: [
        { type: 'gold', value: 22, name: '银两' },
        { type: 'exp', value: 1260, name: '经验' },
        { type: 'yueli', value: 150, name: '历练' }
      ],
      target: { type: 'story', count: 1 },
      location: '后山 · 山林'
    },
    {
      id: 'main_b_09',
      chainOrder: 9,
      name: '北峰问讯',
      type: 'main',
      description:
        '行至「山贼窝棚」，与孟青松搭话问明黑风寨绑票缘由（可先查看伤势）。问清后即可领取本节奖励；与副本内战利品、战后阅历无关。',
      rewards: [
        { type: 'gold', value: 20, name: '银两' },
        { type: 'exp', value: 360, name: '经验' },
        { type: 'yueli', value: 40, name: '历练' }
      ],
      target: { type: 'story', count: 1 },
      location: '山林 · 山贼窝棚'
    },
    {
      id: 'main_b_10',
      chainOrder: 10,
      name: '清剿黑风寨',
      type: 'main',
      description:
        '从寨口进入「黑风寨」副本，逐房清剿并击败首领茅老獾（可从北口离寨）。本节须通关方了结；打不过则主线停在此处。副本内战斗银两、掉落、战后阅历另算，与本节任务奖励不冲突。',
      rewards: [
        { type: 'gold', value: 28, name: '银两' },
        { type: 'exp', value: 600, name: '经验' },
        { type: 'yueli', value: 66, name: '历练' }
      ],
      target: { type: 'story', count: 1 },
      location: '山林 · 黑风寨副本（击败茅老獾）'
    }
  ],
  branch: [],
  faction: [
    {
      id: 'collect_herbs',
      name: '采集灵芝草',
      type: 'faction',
      description:
        '赵长老让你采集5朵灵芝草。差事在正阳派澄心堂赵长老处接取，采齐后仍回澄心堂复命方得贡献。灵芝只长在「山涧溪旁」——须从江湖舆图进入「探索山林」（青苍山麓小地图），在地图内走到「山涧溪旁」地点，于该处林草生长区域采集。',
      rewards: [
        { type: 'contribution', value: 11, name: '门派贡献' }
      ],
      target: { type: 'collect', item: 'lingzhi_cao', count: 5 },
      location: '接取/复命：正阳派 · 澄心堂；办事：山林地图 · 山涧溪旁'
    },
    {
      id: 'bandit_clear',
      name: '清理山门前山贼',
      type: 'faction',
      description:
        '赵长老让你清理山门前作恶的山贼，累计击杀3名山贼。差事在澄心堂接取，达成后回澄心堂复命方得贡献。山贼在山林地图中与「山贼」相关的战斗点出现。',
      rewards: [
        { type: 'contribution', value: 11, name: '门派贡献' }
      ],
      target: { type: 'kill', enemy: '山贼', count: 3 },
      location: '接取/复命：正阳派 · 澄心堂；办事：山林地图（山贼战斗点）'
    },
    {
      id: 'organize_books',
      name: '整理藏经楼书籍',
      type: 'faction',
      description:
        '赵长老让你去藏经楼帮秦松长老整理混乱的书籍。差事在澄心堂接取，整理完毕后再回澄心堂复命方得贡献。',
      rewards: [
        { type: 'contribution', value: 12, name: '门派贡献' }
      ],
      target: { type: 'organize', count: 1 },
      location: '接取/复命：正阳派 · 澄心堂；办事：正阳派 · 归真藏经楼'
    }
  ],
  adventure: [
    {
      id: 'adv_companion_01',
      chainOrder: 1,
      name: '陌路相逢 · 巷中呼救',
      type: 'adventure',
      description:
        '后巷传来女子压抑的呼救。她自称浣花剑阁外门弟子叶轻绾，下山送信途中遭劫，信物被夺，只得躲入此巷。',
      rewards: [
        { type: 'gold', value: 6, name: '银两' },
        { type: 'exp', value: 120, name: '经验' },
        { type: 'yueli', value: 18, name: '历练' }
      ],
      target: { type: 'story', count: 1 },
      location: '青石镇 · 后巷'
    },
    {
      id: 'adv_companion_02',
      chainOrder: 2,
      name: '陌路相逢 · 仁心堂诊脉',
      type: 'adventure',
      description:
        '叶轻绾伤势不轻，须至仁心药铺请坐堂大夫诊治。药铺掌柜贺行舟愿代为熬药，并低声说起近日镇口生人的闲话。',
      rewards: [
        { type: 'gold', value: 8, name: '银两' },
        { type: 'exp', value: 160, name: '经验' },
        { type: 'yueli', value: 22, name: '历练' }
      ],
      target: { type: 'story', count: 1 },
      location: '青石镇 · 仁心药铺'
    },
    {
      id: 'adv_companion_03',
      chainOrder: 3,
      name: '陌路相逢 · 东市夜袭',
      type: 'adventure',
      description:
        '贺行舟指点：劫信之人或仍在东市杂摊附近徘徊。前往东市，击退来袭的劫信之徒。',
      rewards: [
        { type: 'gold', value: 12, name: '银两' },
        { type: 'exp', value: 220, name: '经验' },
        { type: 'yueli', value: 30, name: '历练' }
      ],
      target: { type: 'kill', enemy: 'adv_companion_ambush', count: 1 },
      location: '青石镇 · 东市杂摊'
    },
    {
      id: 'adv_companion_04',
      chainOrder: 4,
      name: '陌路相逢 · 阁中信物',
      type: 'adventure',
      description:
        '回后巷旧屋与叶轻绾会合。她取出阁中留作记号的玉佩碎片，坦言仇家与镇口那伙人同源，须再阻其一步。',
      rewards: [
        { type: 'gold', value: 10, name: '银两' },
        { type: 'exp', value: 180, name: '经验' },
        { type: 'yueli', value: 26, name: '历练' }
      ],
      target: { type: 'story', count: 1 },
      location: '青石镇 · 后巷'
    },
    {
      id: 'adv_companion_05',
      chainOrder: 5,
      name: '陌路相逢 · 镇口狂澜',
      type: 'adventure',
      description:
        '镇口牌坊下，仇家带人堵路。击退来犯之后，回后巷与叶轻绾话别——若愿，可邀她同行。',
      rewards: [
        { type: 'gold', value: 15, name: '银两' },
        { type: 'exp', value: 260, name: '经验' },
        { type: 'yueli', value: 36, name: '历练' }
      ],
      target: { type: 'kill', enemy: 'adv_companion_enforcer', count: 1 },
      location: '青石镇 · 镇口牌坊'
    }
  ]
};

// 任务类型显示配置
const TASK_TYPE_CONFIG = {
  main: { name: '主线', color: '#FFD700', icon: '🏆' },
  branch: { name: '支线', color: '#00CED1', icon: '🎯' },
  faction: { name: '门派', color: '#4CAF50', icon: '🏛️' },
  adventure: { name: '奇遇', color: '#9C27B0', icon: '🎲' }
};

/**
 * 澄心堂单条门派差事交差时写入的贡献（与 ALL_TASKS.faction 中对应 id 的 rewards 一致）。
 */
function getFactionQuestContributionAmount(taskId) {
  if (typeof ALL_TASKS === 'undefined' || !ALL_TASKS.faction) return 0;
  const task = ALL_TASKS.faction.find((t) => t.id === taskId);
  if (!task || !task.rewards) return 0;
  const row = task.rewards.find((r) => r.type === 'contribution');
  return row ? parseInt(String(row.value), 10) || 0 : 0;
}

/** 苏瑶处换一门入门武学所需贡献（策划：100 贡换一本，三门合计 300） */
const ZHENGYANG_INTRO_SKILL_CONTRIBUTION_COST = 100;
/** 三门入门武学全部换齐累计消耗贡献 */
const ZHENGYANG_ALL_INTRO_SKILLS_CONTRIBUTION_TOTAL = 300;
/** 苏瑶传授名 → 武学库 id（与 dev_chapter_skip ENTRY_MARTIAL_IDS 一致） */
const ZHENGYANG_INTRO_SKILL_MARTIAL_ID = {
  正阳基础剑式: 1,
  正阳吐纳诀: 3,
  踏云步: 5
};

function getZhengyangIntroMartialIdBySkillName(skillName) {
  if (!skillName) return null;
  const id = ZHENGYANG_INTRO_SKILL_MARTIAL_ID[skillName];
  return id != null ? id : null;
}

/**
 * 苏瑶处换一门入门武学所需贡献（固定 100；九次交差约 3×(11+11+12)=102，略有余量）。
 */
function getZhengyangIntroSkillContributionCost() {
  return ZHENGYANG_INTRO_SKILL_CONTRIBUTION_COST;
}

function getZhengyangAllIntroSkillsContributionTotal() {
  return ZHENGYANG_ALL_INTRO_SKILLS_CONTRIBUTION_TOTAL;
}

if (typeof window !== 'undefined') {
  window.getZhengyangIntroMartialIdBySkillName = getZhengyangIntroMartialIdBySkillName;
}
