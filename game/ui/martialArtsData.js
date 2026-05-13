// 武学系统数据

// 武学品阶
const MARTIAL_ARTS_RANKS = {
  CHU_JIE: { name: '初阶', color: '#9e9e9e' },
  ZHONG_JIE: { name: '中阶', color: '#4caf50' },
  GAO_JIE: { name: '高阶', color: '#2196f3' },
  JUE_JIE: { name: '绝阶', color: '#ff9800' }
};

// 武学类型
const MARTIAL_ARTS_TYPES = {
  WU_GONG: '武功',
  NEI_GONG: '内功',
  QING_GONG: '轻功'
};

// 武学数据库
const MARTIAL_ARTS_LIBRARY = [
  {
    id: 1,
    name: '正阳基础剑式',
    type: '武功',
    skillType: 'sword',
    rank: '初阶',
    school: '正阳派',
    description: '正阳派入门剑法，朴实无华，根基扎实',
    currentLevel: 3,
    maxLevel: 10,
    practiceTimes: 2,
    equipped: true,
    baseBonus: { sword: 5 },
    stats: { attack: 25, hit: 10 },
    skills: [
      { id: 1, name: '直刺', type: '主动', unlockLevel: 1, icon: '🗡️', mpCost: 20, description: '基础剑招，直刺敌人，臂力越高伤害越高', effect: { type: 'damage', value: 1.2, bonusAttr: 'strength', bonusPerPoint: 0.02 }, detail: '基础伤害120%，每点臂力额外+2%伤害' },
      { id: 2, name: '阳刚', type: '被动', unlockLevel: 4, icon: '☀️', description: '被动增加攻击，臂力越高加成越多', effect: { type: 'buff', stat: 'attack', value: 0.1, bonusAttr: 'strength', bonusPerPoint: 0.03 }, detail: '基础攻击+10%，每点臂力额外+3%' },
      { id: 3, name: '剑影', type: '被动', unlockLevel: 7, icon: '✨', description: '直刺后有20%概率跟随一剑，身法越高触发概率越高', effect: { type: 'followAttack', baseChance: 0.2, damage: 0.8, chanceAttr: 'agility', chancePerPoint: 0.01 } }
    ]
  },
  {
    id: 3,
    name: '正阳吐纳诀',
    type: '内功',
    skillType: 'innerSkill',
    rank: '初阶',
    school: '正阳派',
    description: '正阳派入门吐纳法，调养内息',
    currentLevel: 7,
    maxLevel: 10,
    practiceTimes: 1,
    equipped: true,
    baseBonus: { innerSkill: 5 },
    stats: { hp: 50, defense: 10, innerSkill: 15 },
    skills: [
      { id: 1, name: '培元', type: '被动', unlockLevel: 1, icon: '🔋', description: '固本培元，增加防御力', effect: { type: 'defenseBuff', baseValue: 30, bonusAttr: 'bone', bonusPerPoint: 0.5 }, detail: '基础防御+30，每点根骨额外+0.5' },
      { id: 2, name: '固本', type: '被动', unlockLevel: 4, icon: '💪', description: '稳固根基，增加气血上限', effect: { type: 'maxHpBuff', baseValue: 50, bonusAttr: 'bone', bonusPerPoint: 0.5 }, detail: '气血上限+50，每点根骨额外+0.5' },
      { id: 3, name: '调息', type: '被动', unlockLevel: 7, icon: '🧘', description: '吐纳调息，每回合自动恢复气血', effect: { type: 'autoHeal', baseValue: 5, levelMultiplier: 3, bonusAttr: 'qi', bonusPerPoint: 0.8 }, detail: '每回合恢复5+等级×3+内息×0.8点气血' }
    ]
  },
  {
    id: 4,
    name: '紫霞心经',
    type: '内功',
    skillType: 'innerSkill',
    rank: '高阶',
    school: '正阳派',
    description: '正阳派高深内功，紫气东来',
    currentLevel: 0,
    maxLevel: 10,
    practiceTimes: 0,
    equipped: false,
    baseBonus: { innerSkill: 10 },
    stats: { hp: 150, defense: 30, parry: 20, innerSkill: 40 },
    skills: [
      { id: 1, name: '紫霞护体', type: '主动', unlockLevel: 1, icon: '🔮', description: '增加防御力' },
      { id: 2, name: '紫气东来', type: '被动', unlockLevel: 4, icon: '🟣', description: '受伤时有几率反伤' },
      { id: 3, name: '霞光万道', type: '主动', unlockLevel: 7, icon: '🌟', description: '爆发内力' },
      { id: 4, name: '天地同寿', type: '被动', unlockLevel: 10, icon: '💫', description: '濒死时大幅增伤' }
    ]
  },
  {
    id: 5,
    name: '踏云步',
    type: '轻功',
    skillType: 'lightSkill',
    rank: '初阶',
    school: '正阳派',
    description: '正阳派基础轻功，脚踏祥云，气势如虹',
    currentLevel: 1,
    maxLevel: 10,
    practiceTimes: 0,
    equipped: true,
    baseBonus: { lightSkill: 5 },
    stats: { speed: 25, dodge: 20, attack: 10 },
    skills: [
      { id: 1, name: '踏云', type: '被动', unlockLevel: 1, icon: '☁️', description: '脚踏祥云，增加闪避', effect: { type: 'buff', stat: 'dodge', baseValue: 15, bonusAttr: 'agility', bonusPerPoint: 0.5 }, detail: '基础闪避+15，每点身法额外+0.5' },
      { id: 2, name: '逐日', type: '被动', unlockLevel: 4, icon: '☀️', description: '追逐烈日，增加攻击', effect: { type: 'buff', stat: 'attack', baseValue: 10, bonusAttr: 'strength', bonusPerPoint: 0.5 }, detail: '基础攻击+10，每点臂力额外+0.5' },
      { id: 3, name: '凌虚', type: '被动', unlockLevel: 7, icon: '✨', description: '凌空虚步，增加速度', effect: { type: 'buff', stat: 'speed', baseValue: 15, bonusAttr: 'agility', bonusPerPoint: 0.6 }, detail: '基础速度+15，每点身法额外+0.6' }
    ]
  },
  {
    id: 6,
    name: '落草快剑',
    type: '武功',
    skillType: 'sword',
    rank: '初阶',
    school: '江湖',
    description: '绿林里口口相传的几式快剑，狠辣不足，只求一个快字。',
    currentLevel: 0,
    maxLevel: 10,
    practiceTimes: 0,
    equipped: false,
    baseBonus: { sword: 4 },
    stats: { attack: 22, hit: 12 },
    skills: [
      { id: 1, name: '疾刺', type: '主动', unlockLevel: 1, icon: '⚔️', description: '抢步疾刺', effect: { type: 'damage', value: 1.12, bonusAttr: 'agility', bonusPerPoint: 0.018 }, detail: '基础伤害112%，每点身法额外+1.8%伤害' },
      { id: 2, name: '缠斗', type: '被动', unlockLevel: 4, icon: '🪢', description: '黏住对手身形', effect: { type: 'buff', stat: 'hit', value: 0.05, bonusAttr: 'agility', bonusPerPoint: 0.02 }, detail: '基础命中+5%，每点身法额外+2%' },
      { id: 3, name: '回风', type: '被动', unlockLevel: 7, icon: '🌀', description: '剑走偏锋，偶有一式回扫', effect: { type: 'followAttack', baseChance: 0.1, damage: 0.55, chanceAttr: 'agility', chancePerPoint: 0.006 } }
    ]
  },
  {
    id: 10,
    name: '阵形剑诀',
    type: '武功',
    skillType: 'sword',
    rank: '初阶',
    school: '青石武馆',
    description: '教头处粗浅剑谱，以垫剑术修为为主，无甚花巧。',
    currentLevel: 0,
    maxLevel: 10,
    practiceTimes: 0,
    equipped: false,
    baseBonus: { sword: 3 },
    stats: { attack: 18, hit: 8 },
    skills: [
      { id: 1, name: '对位刺', type: '主动', unlockLevel: 3, icon: '·', mpCost: 10, plainFx: true, description: '先对上身前那人的方位，再顺势递出一剑。', effect: { type: 'damage', value: 1.0, bonusAttr: 'strength', bonusPerPoint: 0.006 }, detail: '对正了人再刺，伤害与寻常一剑相仿。' },
      { id: 2, name: '守拙', type: '被动', unlockLevel: 6, icon: '🛡️', description: '剑随身列，胸肋少露，人更扛打些。', effect: { type: 'defenseBuff', stat: 'defense', baseValue: 10 }, detail: '固定防御+10。' }
    ]
  },
  {
    id: 13,
    name: '沉桥拳诀',
    type: '武功',
    skillType: 'fist',
    rank: '初阶',
    school: '青石武馆',
    description: '馆中口令不离「沉肩、坠肘、钉桥」六字：桥手要沉得下去，马步才生根；捶法不求花，只求劲从脚底起、落在人身上。为拳脚修为打底子。',
    currentLevel: 0,
    maxLevel: 10,
    practiceTimes: 0,
    equipped: false,
    baseBonus: { fist: 3 },
    stats: { attack: 17, hit: 9 },
    skills: [
      {
        id: 1,
        name: '钉小锤',
        type: '主动',
        unlockLevel: 3,
        icon: '✊',
        mpCost: 10,
        punchFx: true,
        description: '劲落如钉，小抡一拳自肋下翻出；教头要的是短劲里门，不是花架子。',
        effect: { type: 'damage', value: 1.0, bonusAttr: 'strength', bonusPerPoint: 0.006 },
        detail: '抡拳短打：与武馆诸主动同档（约一倍攻 + 臂力每点 +0.6%），耗蓝 10；朴素拳击命中特效。'
      },
      {
        id: 2,
        name: '沉肩',
        type: '被动',
        unlockLevel: 6,
        icon: '🛡️',
        description: '肩肘一沉，门户封得更死，敢贴身去架。',
        effect: { type: 'buff', stat: 'parry', baseValue: 10, bonusAttr: 'bone', bonusPerPoint: 0.5 },
        detail: '招架 +10；每点根骨额外 +0.5。'
      }
    ]
  },
  {
    id: 14,
    name: '开合刀法',
    type: '武功',
    skillType: 'blade',
    rank: '初阶',
    school: '青石武馆',
    description: '武馆柴刀入门，教头口传「开、合」二字：开是势要放得出去，合是劲要收得住刃；不讲花巧，先把一刀一脚练老实。',
    currentLevel: 0,
    maxLevel: 10,
    practiceTimes: 0,
    equipped: false,
    baseBonus: { blade: 3 },
    stats: { attack: 19, hit: 8 },
    skills: [
      {
        id: 1,
        name: '开',
        type: '主动',
        unlockLevel: 3,
        icon: '⛰️',
        mpCost: 10,
        bladeFx: true,
        description: '借步拧腰，一刀自外弧劈出，势先「开」满；教头只问落点准不准。',
        effect: { type: 'damage', value: 1.0, bonusAttr: 'strength', bonusPerPoint: 0.006 },
        detail: '与武馆诸主动同档（约一倍攻 + 臂力每点 +0.6%），耗蓝 10；刀类 bladeFx 头像劈斩特效。'
      },
      {
        id: 2,
        name: '合',
        type: '被动',
        unlockLevel: 6,
        icon: '⚔️',
        description: '腕底一沉一拧，劲往刃口「合」；出手便带三分狠劲，刀才听人使唤。',
        effect: { type: 'buff', stat: 'attack', baseValue: 10, bonusAttr: 'strength', bonusPerPoint: 0.5 },
        detail: '基础攻击+10；每点臂力额外+0.5。'
      }
    ]
  },
  {
    id: 11,
    name: '养气术',
    type: '内功',
    skillType: 'innerSkill',
    rank: '初阶',
    school: '青石武馆',
    description: '武馆抄本里最薄的一册，专讲「先养后练」：初阶只练两件事——把气血底子垫厚些，再把气机沉稳了慢慢回；**两式皆是被动**，不以气外放伤人。',
    currentLevel: 0,
    maxLevel: 10,
    practiceTimes: 0,
    equipped: false,
    baseBonus: { innerSkill: 3 },
    stats: { hp: 35, defense: 8, innerSkill: 10 },
    skills: [
      {
        id: 1,
        name: '纳息',
        type: '被动',
        unlockLevel: 3,
        icon: '◇',
        description: '吐浊纳清，肩背略松；根骨厚实的人，胸腹间更能多容一口气血。',
        effect: { type: 'maxHpBuff', baseValue: 30, bonusAttr: 'bone', bonusPerPoint: 0.45 },
        detail: '气血上限：基础+30，每点根骨额外+0.45（初阶可先调）。'
      },
      {
        id: 2,
        name: '归根',
        type: '被动',
        unlockLevel: 6,
        icon: '🌿',
        description: '气机沉回丹田，像水渗进土里；每回合只回一小口，贵在细水长流。',
        effect: { type: 'autoHeal', baseValue: 4, levelMultiplier: 2, bonusAttr: 'qi', bonusPerPoint: 0.35 },
        detail: '每回合回血：4 + 武学等级×2 + 内息×0.35（与「调息」同类，多件 autoHeal 可叠加求和；数值可先调）。'
      }
    ]
  },
  {
    id: 12,
    name: '挪步诀',
    type: '轻功',
    skillType: 'lightSkill',
    rank: '初阶',
    school: '青石武馆',
    description: '武馆抄本专讲「挪」字：不求飞檐走壁，只求脚下半步能挪活。两式皆被动：「挪寸」先学让拳风擦身过，「卸风」再学把脚步带快。为轻功修为打底子。',
    currentLevel: 0,
    maxLevel: 10,
    practiceTimes: 0,
    equipped: false,
    baseBonus: { lightSkill: 3 },
    stats: { speed: 18, dodge: 15, attack: 5 },
    skills: [
      {
        id: 1,
        name: '挪寸',
        type: '被动',
        unlockLevel: 3,
        icon: '👣',
        description: '脚尖里挪半寸，肩胯先让一线；来招常从衣角掠过，看着险，其实不沾身。',
        effect: { type: 'buff', stat: 'dodge', baseValue: 10 },
        detail: '基础闪避+10（初阶定数，后可调）。'
      },
      {
        id: 2,
        name: '卸风',
        type: '被动',
        unlockLevel: 6,
        icon: '🍃',
        description: '劲从侧卸、步随身转；脚下愈轻，愈跟得上自己的挪。',
        effect: { type: 'buff', stat: 'speed', baseValue: 10 },
        detail: '基础速度+10（初阶定数，后可调）。'
      }
    ]
  }
];

// 玩家初始拥有的武学（只有基础武学）
const INITIAL_PLAYER_MARTIAL_ARTS = [
  {
    id: 1,
    name: '正阳基础剑式',
    type: '武功',
    skillType: 'sword',
    rank: '初阶',
    school: '正阳派',
    description: '正阳派入门剑法，朴实无华，根基扎实',
    currentLevel: 3,
    maxLevel: 10,
    practiceTimes: 2,
    equipped: true,
    baseBonus: { sword: 5 },
    stats: { attack: 25, hit: 10 },
    skills: [
      { id: 1, name: '直刺', type: '主动', unlockLevel: 1, icon: '🗡️', mpCost: 20, description: '基础剑招，直刺敌人，臂力越高伤害越高', effect: { type: 'damage', value: 1.2, bonusAttr: 'strength', bonusPerPoint: 0.02 }, detail: '基础伤害120%，每点臂力额外+2%伤害' },
      { id: 2, name: '阳刚', type: '被动', unlockLevel: 4, icon: '☀️', description: '被动增加攻击，臂力越高加成越多', effect: { type: 'buff', stat: 'attack', value: 0.1, bonusAttr: 'strength', bonusPerPoint: 0.03 }, detail: '基础攻击+10%，每点臂力额外+3%' },
      { id: 3, name: '剑影', type: '被动', unlockLevel: 7, icon: '✨', description: '直刺后有20%概率跟随一剑，身法越高触发概率越高', effect: { type: 'followAttack', baseChance: 0.2, damage: 0.8, chanceAttr: 'agility', chancePerPoint: 0.01 } }
    ]
  },
  {
    id: 3,
    name: '正阳吐纳诀',
    type: '内功',
    skillType: 'innerSkill',
    rank: '初阶',
    school: '正阳派',
    description: '正阳派入门吐纳法，调养内息',
    currentLevel: 7,
    maxLevel: 10,
    practiceTimes: 1,
    equipped: true,
    baseBonus: { innerSkill: 5 },
    stats: { hp: 50, defense: 10, innerSkill: 15 },
    skills: [
      { id: 1, name: '培元', type: '被动', unlockLevel: 1, icon: '🔋', description: '固本培元，增加防御力', effect: { type: 'defenseBuff', baseValue: 30, bonusAttr: 'bone', bonusPerPoint: 0.5 }, detail: '基础防御+30，每点根骨额外+0.5' },
      { id: 2, name: '固本', type: '被动', unlockLevel: 4, icon: '💪', description: '稳固根基，增加气血上限', effect: { type: 'maxHpBuff', baseValue: 50, bonusAttr: 'bone', bonusPerPoint: 0.5 }, detail: '气血上限+50，每点根骨额外+0.5' },
      { id: 3, name: '调息', type: '被动', unlockLevel: 7, icon: '🧘', description: '吐纳调息，每回合自动恢复气血', effect: { type: 'autoHeal', baseValue: 5, levelMultiplier: 3, bonusAttr: 'qi', bonusPerPoint: 0.8 }, detail: '每回合恢复5+等级×3+内息×0.8点气血' }
    ]
  },
  {
    id: 5,
    name: '踏云步',
    type: '轻功',
    skillType: 'lightSkill',
    rank: '初阶',
    school: '正阳派',
    description: '正阳派基础轻功，脚踏祥云，气势如虹',
    currentLevel: 1,
    maxLevel: 10,
    practiceTimes: 0,
    equipped: true,
    baseBonus: { lightSkill: 5 },
    stats: { speed: 25, dodge: 20, attack: 10 },
    skills: [
      { id: 1, name: '踏云', type: '被动', unlockLevel: 1, icon: '☁️', description: '脚踏祥云，增加闪避', effect: { type: 'buff', stat: 'dodge', baseValue: 15, bonusAttr: 'agility', bonusPerPoint: 0.5 }, detail: '基础闪避+15，每点身法额外+0.5' },
      { id: 2, name: '逐日', type: '被动', unlockLevel: 4, icon: '☀️', description: '追逐烈日，增加攻击', effect: { type: 'buff', stat: 'attack', baseValue: 10, bonusAttr: 'strength', bonusPerPoint: 0.5 }, detail: '基础攻击+10，每点臂力额外+0.5' },
      { id: 3, name: '凌虚', type: '被动', unlockLevel: 7, icon: '✨', description: '凌空虚步，增加速度', effect: { type: 'buff', stat: 'speed', baseValue: 15, bonusAttr: 'agility', bonusPerPoint: 0.6 }, detail: '基础速度+15，每点身法额外+0.6' }
    ]
  }
];

// 角色列表（跟角色系统一致）
const martialCharacters = [
  { id: 1, name: '少侠', icon: '👨‍🦰' },
  { id: 2, name: '苏瑶', icon: '👩' }
];

let currentMartialCharacterId = 1;

// 武学数据版本号，用于检测旧数据
const MARTIAL_DATA_VERSION = 5;

// 修补存档：缺 skills 的条目从武学库补全，避免整表被判定无效后退回初始（地图商店会误判「未学」）
function normalizePlayerMartialArtsList(parsed) {
  const lib = typeof MARTIAL_ARTS_LIBRARY !== 'undefined' ? MARTIAL_ARTS_LIBRARY : [];
  let changed = false;
  const list = parsed.map((m) => {
    if (!m || typeof m.id !== 'number') return m;
    const tmpl = lib.find((x) => x && x.id === m.id);
    // 《阵形剑诀》id10：旧档可能仍为垫步刺 / 守拙 buff%，从库同步技能表
    if (m.id === 10 && tmpl && Array.isArray(tmpl.skills)) {
      const s0 = m.skills && m.skills[0];
      const s1 = m.skills && m.skills[1];
      const oldShape =
        !s0 ||
        s0.name !== '对位刺' ||
        !s1 ||
        s1.name !== '守拙' ||
        s1.effect?.type !== 'defenseBuff';
      if (oldShape) {
        changed = true;
        return { ...m, skills: JSON.parse(JSON.stringify(tmpl.skills)) };
      }
    }
    // 《沉桥拳诀》id13：旧档技能名或被动非招架 buff，从库同步
    if (m.id === 13 && tmpl && Array.isArray(tmpl.skills)) {
      const s0 = m.skills && m.skills[0];
      const s1 = m.skills && m.skills[1];
      const oldShape =
        !s0 ||
        s0.name !== '钉小锤' ||
        !s0.punchFx ||
        !s1 ||
        s1.name !== '沉肩' ||
        s1.effect?.type !== 'buff' ||
        s1.effect?.stat !== 'parry';
      if (oldShape) {
        changed = true;
        return { ...m, skills: JSON.parse(JSON.stringify(tmpl.skills)) };
      }
    }
    // id14《开合刀法》：旧档「破荒/劈荒/砺锋」等或缺 bladeFx / 被动非「合」攻击 buff 时，从库同步
    if (m.id === 14 && tmpl && Array.isArray(tmpl.skills)) {
      const s0 = m.skills && m.skills[0];
      const s1 = m.skills && m.skills[1];
      const oldShape =
        !s0 ||
        s0.name !== '开' ||
        !s0.bladeFx ||
        !s1 ||
        s1.name !== '合' ||
        s1.effect?.type !== 'buff' ||
        s1.effect?.stat !== 'attack';
      if (oldShape) {
        changed = true;
        return { ...m, skills: JSON.parse(JSON.stringify(tmpl.skills)) };
      }
    }
    // 《养气术》id11：旧档带主动/换气固元等，或「纳息」非 maxHpBuff+根骨，从库同步（现为两被动）
    if (m.id === 11 && tmpl && Array.isArray(tmpl.skills)) {
      const s0 = m.skills && m.skills[0];
      const s1 = m.skills && m.skills[1];
      const oldShape =
        !s0 ||
        s0.name !== '纳息' ||
        s0.type !== '被动' ||
        s0.effect?.type !== 'maxHpBuff' ||
        s0.effect?.bonusAttr !== 'bone' ||
        !s1 ||
        s1.name !== '归根' ||
        s1.effect?.type !== 'autoHeal';
      if (oldShape) {
        changed = true;
        return { ...m, skills: JSON.parse(JSON.stringify(tmpl.skills)) };
      }
    }
    // 《挪步诀》id12：旧档「抢位/挫步」主动或「卸风」非速度 buff 等，从库同步（现为双被动）
    if (m.id === 12 && tmpl && Array.isArray(tmpl.skills)) {
      const s0 = m.skills && m.skills[0];
      const s1 = m.skills && m.skills[1];
      const oldShape =
        !s0 ||
        s0.name !== '挪寸' ||
        s0.type !== '被动' ||
        s0.effect?.type !== 'buff' ||
        s0.effect?.stat !== 'dodge' ||
        !s1 ||
        s1.name !== '卸风' ||
        s1.effect?.type !== 'buff' ||
        s1.effect?.stat !== 'speed';
      if (oldShape) {
        changed = true;
        return { ...m, skills: JSON.parse(JSON.stringify(tmpl.skills)) };
      }
    }
    if (m.skills && Array.isArray(m.skills)) return m;
    changed = true;
    if (tmpl && Array.isArray(tmpl.skills)) {
      return { ...m, skills: JSON.parse(JSON.stringify(tmpl.skills)) };
    }
    return { ...m, skills: [] };
  });
  return { list, changed };
}

// 玩家武学背包（每个角色单独一份）
function getPlayerMartialArts(charId) {
  try {
    // 检查版本号
    const savedVersion = localStorage.getItem('martialDataVersion');
    if (!savedVersion || parseInt(savedVersion) < MARTIAL_DATA_VERSION) {
      console.log('检测到旧版本武学数据，正在清理...');
      // 清理所有旧武学数据
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('playerMartialArts')) {
          localStorage.removeItem(key);
        }
      }
      // 更新版本号
      localStorage.setItem('martialDataVersion', MARTIAL_DATA_VERSION.toString());
      console.log('武学数据已清理，使用新数据');
      return [...INITIAL_PLAYER_MARTIAL_ARTS];
    }

    const saved = localStorage.getItem(`playerMartialArts_${charId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const { list, changed } = normalizePlayerMartialArtsList(parsed);
        if (changed) {
          try {
            localStorage.setItem(`playerMartialArts_${charId}`, JSON.stringify(list));
          } catch (persistErr) {
            console.warn('写回修补后的武学数据失败', persistErr);
          }
        }
        return list;
      }
      console.warn('武学数据格式错误（非数组），使用初始数据');
    }
  } catch (e) {
    console.warn('解析武学数据失败，使用初始数据', e);
  }
  // 默认初始武学（只有基础武学）
  return [...INITIAL_PLAYER_MARTIAL_ARTS];
}

/**
 * 武学库 + 某角色存档合并表（战斗、面板被动等共用）。
 * 与 `playerMartialArts_{charId}` 对齐；存档经 normalize 再合并。
 */
function getMergedMartialArtsListForCharId(charId) {
  const cid = charId == null || isNaN(Number(charId)) ? 1 : Number(charId);
  let savedMartialArts = [];
  try {
    const raw = localStorage.getItem('playerMartialArts_' + cid);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const norm = normalizePlayerMartialArtsList(parsed);
        savedMartialArts = norm.list;
      }
    }
  } catch (e) {
    console.warn('getMergedMartialArtsListForCharId: 解析失败', e);
  }

  if (typeof MARTIAL_ARTS_LIBRARY === 'undefined' || !MARTIAL_ARTS_LIBRARY.length) {
    if (typeof getPlayerMartialArts === 'function') return getPlayerMartialArts(cid);
    return savedMartialArts;
  }

  return MARTIAL_ARTS_LIBRARY.map(function (martial) {
    if (!martial) return martial;
    const savedMartial = savedMartialArts.find(function (m) {
      return m && m.id === martial.id;
    });
    if (savedMartial) {
      return Object.assign({}, martial, {
        currentLevel: savedMartial.currentLevel != null ? savedMartial.currentLevel : martial.currentLevel,
        equipped: !!savedMartial.equipped,
        practiceTimes: savedMartial.practiceTimes != null ? savedMartial.practiceTimes : martial.practiceTimes
      });
    }
    return Object.assign({}, martial);
  });
}

window.getMergedMartialArtsListForCharId = getMergedMartialArtsListForCharId;

function getPlayerExperience() {
  const saved = localStorage.getItem('playerExperience');
  if (saved) return parseInt(saved);
  return 200;
}

function resetPlayerExperience() {
  playerExperience = 200;
  localStorage.setItem('playerExperience', playerExperience);
  document.getElementById('playerExp').textContent = playerExperience;
  
  // 重新渲染详情，更新按钮状态
  if (typeof renderDetail === 'function') {
    renderDetail();
  }
}

function saveMartialData() {
  localStorage.setItem(`playerMartialArts_${currentMartialCharacterId}`, JSON.stringify(playerMartialArts));
  localStorage.setItem('playerExperience', playerExperience);
}

function switchMartialCharacter(charId) {
  // 保存当前角色数据
  saveMartialData();
  
  // 切换角色
  currentMartialCharacterId = charId;
  
  // 加载新角色数据（武学独立，阅历共享）
  playerMartialArts = getPlayerMartialArts(charId);
  // 阅历不变，保持共享
  
  // 重置界面
  selectedMartialArt = null;
  currentType = '武功';
  document.getElementById('noSelection').style.display = 'flex';
  document.getElementById('detailPanel').style.display = 'none';
  
  // 更新角色选择器样式
  document.querySelectorAll('.martial-char-item').forEach((item, idx) => {
    item.classList.toggle('active', martialCharacters[idx].id === charId);
  });
  
  // 重新渲染
  renderList();
  document.getElementById('playerExp').textContent = playerExperience;
}

// 重置武学数据
function resetMartialData() {
  localStorage.removeItem(`playerMartialArts_${currentMartialCharacterId}`);
  localStorage.removeItem(`playerExperience_${currentMartialCharacterId}`);
  playerMartialArts = [...MARTIAL_ARTS_LIBRARY];
  playerExperience = 500;
  selectedMartialArt = null;
  currentType = '武功';
  document.getElementById('noSelection').style.display = 'flex';
  document.getElementById('detailPanel').style.display = 'none';
  renderList();
  document.getElementById('playerExp').textContent = playerExperience;
  alert('已重置！');
}

// 暴露武学库到全局
window.MARTIAL_ARTS_LIBRARY = MARTIAL_ARTS_LIBRARY;

// 初始加载当前角色数据
let playerMartialArts = getPlayerMartialArts(currentMartialCharacterId);
let playerExperience = getPlayerExperience();

// 计算当前角色「修为」五项加成（全已学武学 baseBonus 之和，与装备/激活无关；战斗属性另算）
function calculateMartialArtsBonuses() {
  const bonuses = {
    fist: 0,
    sword: 0,
    blade: 0,
    lightSkill: 0,
    innerSkill: 0
  };

  playerMartialArts.forEach(martial => {
    if (martial.baseBonus && martial.currentLevel > 0) {
      Object.entries(martial.baseBonus).forEach(([key, val]) => {
        if (bonuses.hasOwnProperty(key)) {
          bonuses[key] += val * martial.currentLevel;
        }
      });
    }
  });

  Object.keys(bonuses).forEach(key => {
    if (bonuses[key] > 100) bonuses[key] = 100;
  });

  return bonuses;
}
