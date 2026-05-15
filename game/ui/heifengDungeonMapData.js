/**
 * 黑风寨副本 · 子地图（多房间，对齐正阳派式节点图）
 * 坐标系与山林 map-area 一致：800×580
 */
const HEIFENG_LOCATIONS = {
  hf_camp: {
    id: 'hf_camp',
    name: '乱石林营',
    icon: '⛺',
    x: 120,
    y: 290,
    connections: ['hf_outer'],
    desc: '林间用乱石堆起的简易营寨，围了半圈歪扭的木栅栏，地上丢着啃剩的兽骨、空酒坛和抢来的粗布包裹。营中插着根歪脖子木杆，挂着块染血的粗麻布。风一吹就飘来股酒臭、汗臭混着烟火的味道。',
    kind: 'camp'
  },
  hf_outer: {
    id: 'hf_outer',
    name: '外寨偏房',
    icon: '👹',
    x: 280,
    y: 200,
    connections: ['hf_camp', 'hf_yard'],
    desc: '柴堆与破桌旁守着一名矮壮喽啰，豁口砍柴刀就靠在桌腿，地上酒渍未干。',
    kind: 'boss',
    enemyId: 'wang_erzhu',
    bossLine: '王二柱（守寨喽啰）'
  },
  hf_yard: {
    id: 'hf_yard',
    name: '中庭旗侧',
    icon: '👺',
    x: 480,
    y: 200,
    connections: ['hf_outer', 'hf_hall'],
    desc: '歪旗杆下堆着巡山用的锣鼓，斜叼草梗的刁老炮带一名喽啰守在此处，正斜眼打量来人。',
    kind: 'boss',
    enemyId: 'diao_laopao',
    bossLine: '刁老炮（掌旗头目）· 山贼喽啰'
  },
  hf_hall: {
    id: 'hf_hall',
    name: '聚义厅',
    icon: '👾',
    x: 620,
    y: 320,
    connections: ['hf_yard', 'hf_exit'],
    desc: '破草顶下摆着几张条凳，正中一张虎皮椅空着，干瘦老头握锈剑踞坐一旁，目光阴鸷。',
    kind: 'boss',
    enemyId: 'mao_laohuan',
    bossLine: '茅老獾（山寨首领）'
  },
  hf_exit: {
    id: 'hf_exit',
    name: '北口·离开山寨',
    icon: '🚪',
    x: 720,
    y: 480,
    connections: ['hf_hall'],
    desc: '木栅豁口外便是下山小径，可退回山贼窝棚方向，离开本次探寨。',
    kind: 'exit'
  }
};

const HEIFENG_CONNECTIONS = [
  ['hf_camp', 'hf_outer'],
  ['hf_outer', 'hf_yard'],
  ['hf_yard', 'hf_hall'],
  ['hf_hall', 'hf_exit']
];

window.HEIFENG_LOCATIONS = HEIFENG_LOCATIONS;
window.HEIFENG_CONNECTIONS = HEIFENG_CONNECTIONS;
