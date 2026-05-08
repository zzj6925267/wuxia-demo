/**
 * 山林NPC和敌人数据
 */

// 山林NPC数据
const FOREST_NPCS = {
  // 暂时没有NPC，只有敌人
};

// 山林敌人数据
const FOREST_ENEMIES = {
  shanze_louluo1: {
    id: 'shanze_louluo1',
    name: '山贼喽啰',
    title: 'Lv.1',
    icon: '🗡️',
    location: ['shanze_patrol'],
    type: 'enemy',
    level: 1,
    hp: 50,
    attack: 10,
    defense: 5,
    expReward: 20,
    goldReward: 10
  },
  shanze_louluo2: {
    id: 'shanze_louluo2',
    name: '山贼喽啰',
    title: 'Lv.2',
    icon: '🗡️',
    location: ['shanze_patrol'],
    type: 'enemy',
    level: 2,
    hp: 70,
    attack: 15,
    defense: 8,
    expReward: 30,
    goldReward: 15
  },
  qingshe1: {
    id: 'qingshe1',
    name: '青竹蛇',
    title: 'Lv.2',
    icon: '🐍',
    location: ['sheku_entrance'],
    type: 'enemy',
    level: 2,
    hp: 40,
    attack: 12,
    defense: 3,
    expReward: 25,
    goldReward: 12
  },
  qingshe2