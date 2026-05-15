/**
 * 青苍山麓（山林）地图数据
 */

// 山林地点数据（使用像素坐标，与大地图保持一致）
const FOREST_LOCATIONS = {
  qingcang_entrance: { 
    id: 'qingcang_entrance', 
    name: '青苍山道口', 
    icon: '🚪', 
    x: 450, 
    y: 60, 
    connections: ['linjian_path'], 
    desc: '通往青苍山的土路入口，两旁长满齐腰的杂草，林间偶有鸟鸣，越往深处越显昏暗。路边立着半块残破石碑，刻着「山林凶险，独行慎入」。'
  },
  linjian_path: { 
    id: 'linjian_path', 
    name: '林间浅道', 
    icon: '🌲', 
    x: 450, 
    y: 160, 
    connections: ['qingcang_entrance', 'shanze_patrol', 'luancao_slope'], 
    desc: '稀疏的松林，地面落满松针，踩上去沙沙作响，风一吹便有松涛声。远处能听到隐约的人声与蛇嘶。'
  },
  shanze_patrol: { 
    id: 'shanze_patrol', 
    name: '山贼巡路', 
    icon: '🗡️', 
    x: 680, 
    y: 160, 
    connections: ['linjian_path', 'shanze_shed', 'duanya_edge'], 
    desc: '山道被人为踩得平整，路边常有折断的树枝与散落的干粮碎渣，一看便是常有强人往来。空气中飘着淡淡的酒气与汗臭。'
  },
  shanze_shed: { 
    id: 'shanze_shed', 
    name: '山贼窝棚', 
    icon: '🏚️', 
    x: 680, 
    y: 300, 
    connections: ['shanze_patrol', 'heifeng_entrance'], 
    desc: '林间搭着三个破旧的茅草棚，堆着柴火与抢来的杂物，地上还有未干的血迹，是山贼临时歇脚的地方。'
  },
  heifeng_entrance: { 
    id: 'heifeng_entrance', 
    name: '黑风山寨入口', 
    icon: '⛩️', 
    x: 680, 
    y: 440, 
    connections: ['shanze_shed'], 
    desc: '【副本入口】用原木围起的山寨营地。由此进入「黑风寨」子地图，逐房清剿后再从北口返回山林。'
  },
  luancao_slope: { 
    id: 'luancao_slope', 
    name: '乱草坡', 
    icon: '🐍', 
    x: 220, 
    y: 160, 
    connections: ['linjian_path', 'sheku_entrance', 'shanjian_stream'], 
    desc: '茂密的荒草盖住大半地面，草叶潮湿阴冷，地面时不时有细长的影子窜过，空气中带着一股腥气，踩草时要格外小心。'
  },
  sheku_entrance: { 
    id: 'sheku_entrance', 
    name: '蛇窟洞口', 
    icon: '🕳️', 
    x: 220, 
    y: 300, 
    connections: ['luancao_slope'], 
    desc: '山坡下一个黑黝黝的山洞，洞口爬满藤蔓，腥气比乱草坡更重，洞内传来嘶嘶的吐信声，不敢轻易深入。'
  },
  shanjian_stream: { 
    id: 'shanjian_stream', 
    name: '山涧溪旁', 
    icon: '💧', 
    x: 80, 
    y: 300, 
    connections: ['luancao_slope', 'poshan_temple'], 
    desc: '一道山泉从山上流下，汇成浅溪，溪水清澈冰凉，溪边石头光滑，偶尔有小鱼游过，是山林里少有的清净地方。'
  },
  poshan_temple: { 
    id: 'poshan_temple', 
    name: '破山神庙', 
    icon: '🛕', 
    x: 80, 
    y: 440, 
    connections: ['shanjian_stream', 'gusong_platform'], 
    desc: '林间一座塌了半边的山神庙，神像残缺不全，香案上积满灰尘，只有角落还留着几根旧香。'
  },
  gusong_platform: { 
    id: 'gusong_platform', 
    name: '古松台', 
    icon: '🌳', 
    x: 220, 
    y: 440, 
    connections: ['poshan_temple', 'duanya_edge'], 
    desc: '一块平坦的青石台，中央长着一棵百年老松，枝干虬曲，站在此处能俯瞰小半山林，风大时松叶哗哗作响。'
  },
  duanya_edge: { 
    id: 'duanya_edge', 
    name: '断崖边', 
    icon: '🏔️', 
    x: 450, 
    y: 440, 
    connections: ['gusong_platform', 'shanze_patrol'], 
    desc: '山道尽头是陡峭的山崖，下面云雾缭绕，深不见底，崖边只有几根枯藤，风大时站都站不稳。'
  }
};

const FOREST_CONNECTIONS = [
  ['qingcang_entrance', 'linjian_path'],
  ['linjian_path', 'shanze_patrol'],
  ['linjian_path', 'luancao_slope'],
  ['shanze_patrol', 'shanze_shed'],
  ['shanze_patrol', 'duanya_edge'],
  ['shanze_shed', 'heifeng_entrance'],
  ['luancao_slope', 'sheku_entrance'],
  ['luancao_slope', 'shanjian_stream'],
  ['shanjian_stream', 'poshan_temple'],
  ['poshan_temple', 'gusong_platform'],
  ['gusong_platform', 'duanya_edge']
];

// 暴露到全局
window.FOREST_LOCATIONS = FOREST_LOCATIONS;
window.FOREST_CONNECTIONS = FOREST_CONNECTIONS;
