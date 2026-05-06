/**
 * 地图数据
 * 职责：纯数据定义，不包含业务逻辑
 */

/**
 * 地图地点定义
 */
const MAP_LOCATIONS = {
  yuelai_inn: {
    id: 'yuelai_inn',
    name: '悦来客栈',
    description: '江湖中最有名的客栈，南来北往的侠客都在此歇脚',
    type: 'town',
    x: 200,
    y: 350,
    connections: ['tianji_market', 'broken_temple', 'mysterious_cave'],
    icon: '🏠',
    isSafe: true
  },
  tianji_market: {
    id: 'tianji_market',
    name: '天机集市',
    description: '繁华的市集，各种奇珍异宝应有尽有',
    type: 'market',
    x: 380,
    y: 220,
    connections: ['yuelai_inn', 'liequan_clan', 'mysterious_cave'],
    icon: '🏪',
    isSafe: true
  },
  liequan_clan: {
    id: 'liequan_clan',
    name: '烈拳宗',
    description: '以刚猛拳法闻名的门派',
    type: 'clan',
    x: 560,
    y: 160,
    connections: ['tianji_market', 'xuedao_clan'],
    icon: '🏯',
    isSafe: false
  },
  xuedao_clan: {
    id: 'xuedao_clan',
    name: '血刀门',
    description: '行事狠辣的邪派，门中弟子皆使独门血刀',
    type: 'clan',
    x: 720,
    y: 320,
    connections: ['liequan_clan', 'broken_cliff', 'mysterious_cave'],
    icon: '🗡️',
    isSafe: false
  },
  mysterious_cave: {
    id: 'mysterious_cave',
    name: '神秘山洞',
    description: '隐藏在深山之中的神秘洞穴，相传有宝藏',
    type: 'dungeon',
    x: 520,
    y: 450,
    connections: ['yuelai_inn', 'tianji_market', 'xuedao_clan', 'zhengyang_clan'],
    icon: '🕳️',
    isSafe: false
  },
  broken_temple: {
    id: 'broken_temple',
    name: '破旧古寺',
    description: '荒废多年的古寺，据说夜晚常有奇怪的声音',
    type: 'dungeon',
    x: 280,
    y: 520,
    connections: ['yuelai_inn', 'zhengyang_clan', 'forest'],
    icon: '⛩️',
    isSafe: false
  },
  zhengyang_clan: {
    id: 'zhengyang_clan',
    name: '正阳派',
    description: '名门正派，以剑法和内功闻名江湖',
    type: 'clan',
    x: 450,
    y: 580,
    connections: ['broken_temple', 'mysterious_cave', 'broken_cliff'],
    icon: '🏰',
    isSafe: true
  },
  broken_cliff: {
    id: 'broken_cliff',
    name: '断魂崖',
    description: '悬崖峭壁，下面是万丈深渊',
    type: 'dungeon',
    x: 680,
    y: 560,
    connections: ['xuedao_clan', 'zhengyang_clan'],
    icon: '🪨',
    isSafe: false
  },
  forest: {
    id: 'forest',
    name: '山林',
    description: '茂密的树林，常有野兽出没',
    type: 'dungeon',
    x: 160,
    y: 650,
    connections: ['broken_temple'],
    icon: '🌲',
    isSafe: false
  }
};

/**
 * 所有连接关系（完整地图网络）
 */
const ALL_CONNECTIONS = [
  ['yuelai_inn', 'tianji_market'],
  ['yuelai_inn', 'broken_temple'],
  ['yuelai_inn', 'mysterious_cave'],
  ['tianji_market', 'liequan_clan'],
  ['tianji_market', 'mysterious_cave'],
  ['liequan_clan', 'xuedao_clan'],
  ['xuedao_clan', 'broken_cliff'],
  ['xuedao_clan', 'mysterious_cave'],
  ['mysterious_cave', 'zhengyang_clan'],
  ['broken_temple', 'zhengyang_clan'],
  ['broken_temple', 'forest'],
  ['zhengyang_clan', 'broken_cliff']
];

/**
 * 地点类型配置
 */
const LOCATION_TYPES = {
  town: { name: '城镇', color: '#4CAF50', bgColor: 'rgba(76, 175, 80, 0.2)' },
  market: { name: '市集', color: '#FF9800', bgColor: 'rgba(255, 152, 0, 0.2)' },
  clan: { name: '门派', color: '#2196F3', bgColor: 'rgba(33, 150, 243, 0.2)' },
  dungeon: { name: '秘境', color: '#F44336', bgColor: 'rgba(244, 67, 54, 0.2)' }
};

/**
 * 暴露到全局
 */
window.MAP_LOCATIONS = MAP_LOCATIONS;
window.ALL_CONNECTIONS = ALL_CONNECTIONS;
window.LOCATION_TYPES = LOCATION_TYPES;