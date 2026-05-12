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
        { type: 'exp', value: 12, name: '经验' },
        { type: 'yueli', value: 2, name: '阅历' }
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
        '到「青石武馆」寻教头。对话里两项：前一句带「（主线）」为听门前道理、推进当前事；带「（购武）」为银两换图谱。主街未踩熟前，他仍会撵你回街上。',
      rewards: [
        { type: 'gold', value: 10, name: '银两' },
        { type: 'exp', value: 14, name: '经验' },
        { type: 'yueli', value: 2, name: '阅历' }
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
        { type: 'exp', value: 16, name: '经验' },
        { type: 'yueli', value: 3, name: '阅历' }
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
        { type: 'exp', value: 22, name: '经验' },
        { type: 'yueli', value: 4, name: '阅历' }
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
        { type: 'exp', value: 18, name: '经验' },
        { type: 'yueli', value: 3, name: '阅历' }
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
        { type: 'exp', value: 26, name: '经验' },
        { type: 'yueli', value: 5, name: '阅历' }
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
        '携功复命于苏瑶。贡献既足，方许择一门入门武学，自此勤练不辍。',
      rewards: [
        { type: 'gold', value: 20, name: '银两' },
        { type: 'exp', value: 30, name: '经验' },
        { type: 'yueli', value: 6, name: '阅历' }
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
        '山门之外，林深径险。须往林间一行，以战验所学，以险砺心志。',
      rewards: [
        { type: 'gold', value: 22, name: '银两' },
        { type: 'exp', value: 34, name: '经验' },
        { type: 'yueli', value: 6, name: '阅历' }
      ],
      target: { type: 'story', count: 1 },
      location: '后山 · 山林'
    },
    {
      id: 'main_b_09',
      chainOrder: 9,
      name: '北峰记闻',
      type: 'main',
      description:
        '闻北峰山寨之名，见于林畔残碑木牍。山门未启，且记此约，以待来日。',
      rewards: [
        { type: 'gold', value: 25, name: '银两' },
        { type: 'exp', value: 38, name: '经验' },
        { type: 'yueli', value: 8, name: '阅历' }
      ],
      target: { type: 'story', count: 1 },
      location: '山林 · 北峰传闻'
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
        { type: 'contribution', value: 28, name: '门派贡献' }
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
        { type: 'contribution', value: 58, name: '门派贡献' }
      ],
      target: { type: 'kill', enemy: '山贼', count: 3 },
      location: '接取/复命：正阳派 · 澄心堂；办事：山林地图（山贼战斗点）'
    },
    {
      id: 'organize_books',
      name: '整理藏经楼书籍',
      type: 'faction',
      description:
        '赵长老让你去藏经楼帮涂长老整理混乱的书籍。差事在澄心堂接取，整理完毕后再回澄心堂复命方得贡献。',
      rewards: [
        { type: 'contribution', value: 38, name: '门派贡献' }
      ],
      target: { type: 'organize', count: 1 },
      location: '接取/复命：正阳派 · 澄心堂；办事：正阳派 · 归真藏经楼'
    }
  ],
  adventure: []
};

// 任务类型显示配置
const TASK_TYPE_CONFIG = {
  main: { name: '主线', color: '#FFD700', icon: '🏆' },
  branch: { name: '支线', color: '#00CED1', icon: '🎯' },
  faction: { name: '门派', color: '#4CAF50', icon: '🏛️' },
  adventure: { name: '奇遇', color: '#9C27B0', icon: '🎲' }
};
