// 所有任务数据配置
const ALL_TASKS = {
  main: [],
  branch: [],
  faction: [
    {
      id: 'collect_herbs',
      name: '采集灵芝草',
      type: 'faction',
      description: '赵长老让你去山涧溪旁采集5朵灵芝草。',
      rewards: [
        { type: 'contribution', value: 100, name: '门派贡献' }
      ],
      target: { type: 'collect', item: 'lingzhi_cao', count: 5 },
      location: '山涧溪旁'
    },
    {
      id: 'bandit_clear',
      name: '清理山门前山贼',
      type: 'faction',
      description: '赵长老让你去清理山门前作恶的山贼，杀3个山贼。',
      rewards: [
        { type: 'contribution', value: 200, name: '门派贡献' }
      ],
      target: { type: 'kill', enemy: '山贼', count: 3 },
      location: '山贼巡逻点'
    },
    {
      id: 'organize_books',
      name: '整理藏经楼书籍',
      type: 'faction',
      description: '赵长老让你去藏经楼帮秦长老整理一下混乱的书籍。',
      rewards: [
        { type: 'contribution', value: 150, name: '门派贡献' }
      ],
      target: { type: 'organize', count: 1 },
      location: '归真藏经楼'
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
