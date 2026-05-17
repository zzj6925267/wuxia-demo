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

/** 玩家立绘（纯头像 PNG，无金框/名牌）：战斗 `avatar` 与武学顶栏内层 `img` 同源；武学另叠 `ma_ui_char_card` + 竖名条。 */
const PLAYER_PORTRAIT_MALE = '../assets/images/UI/ma_ui_char_portrait_xiao_yunche.png';
const PLAYER_PORTRAIT_FEMALE = '../assets/images/UI/ma_ui_char_portrait_su_qingli.png';
if (typeof window !== 'undefined') {
  window.PLAYER_PORTRAIT_MALE = PLAYER_PORTRAIT_MALE;
  window.PLAYER_PORTRAIT_FEMALE = PLAYER_PORTRAIT_FEMALE;
}

/**
 * 战斗 / 武学顶栏共用头像：须在画面中 **面朝右**。
 * `scaleX(-1)` 用于「底图人物朝左」时翻成朝右；底图已朝右的 id 须为 `false`。
 * 少侠侧资源多为已朝右；苏瑶若未跑 `crop_avatars.mjs` 的 flop，PNG 仍朝左，故默认仅 id2 翻转。
 * 换图后请对照画面，把仍朝左的角色改为 `true`、已朝右的改为 `false`。
 */
const CHARACTER_PORTRAIT_FLIP_H_BY_ID = { 1: false, 2: true };
if (typeof window !== 'undefined') {
  window.CHARACTER_PORTRAIT_FLIP_H_BY_ID = CHARACTER_PORTRAIT_FLIP_H_BY_ID;
}

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
      { id: 1, name: '直刺', type: '主动', unlockLevel: 1, icon: '🗡️', mpCost: 20, description: '基础剑招，直刺敌人，臂力越高伤害越高', detail: '基础伤害120%，每点臂力额外+2%伤害' },
      { id: 2, name: '阳刚', type: '被动', unlockLevel: 4, icon: '☀️', description: '被动增加攻击，臂力越高加成越多', passiveIds: ['zhenyang_jianfa_yanggang'], detail: '基础攻击+10%，每点臂力额外+3%' },
      { id: 3, name: '剑影', type: '被动', unlockLevel: 7, icon: '✨', description: '直刺后有20%概率跟随一剑，身法越高触发概率越高', passiveIds: ['jianying_follow'], detail: '直刺后有20%概率跟随一剑，身法越高触发概率越高（当前额外加成见浮窗）' }
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
      { id: 1, name: '培元', type: '被动', unlockLevel: 1, icon: '🔋', description: '固本培元，增加防御力', passiveIds: ['zhenyang_tunxi_peiyuan'], detail: '基础防御+30，每点根骨额外+0.5' },
      { id: 2, name: '固本', type: '被动', unlockLevel: 4, icon: '💪', description: '稳固根基，增加气血上限', passiveIds: ['zhenyang_tunxi_guben'], detail: '气血上限+50，每点根骨额外+0.5' },
      { id: 3, name: '调息', type: '被动', unlockLevel: 7, icon: '🧘', description: '吐纳调息，每回合自动恢复气血', passiveIds: ['inner_tunxi_zhenyang'], detail: '每回合恢复5+等级×3+内息×0.8点气血' }
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
      { id: 1, name: '踏云', type: '被动', unlockLevel: 1, icon: '☁️', description: '脚踏祥云，增加闪避', passiveIds: ['zhenyang_tayun_tayun'], detail: '基础闪避+15，每点身法额外+0.5' },
      { id: 2, name: '逐日', type: '被动', unlockLevel: 4, icon: '☀️', description: '追逐烈日，增加攻击', passiveIds: ['zhenyang_tayun_zhuri'], detail: '基础攻击+10，每点臂力额外+0.5' },
      { id: 3, name: '凌虚', type: '被动', unlockLevel: 7, icon: '✨', description: '凌空虚步，增加速度', passiveIds: ['zhenyang_tayun_lingxu'], detail: '基础速度+15，每点身法额外+0.6' }
    ]
  },
  {
    id: 6,
    name: '落草剑经',
    type: '武功',
    skillType: 'sword',
    rank: '初阶',
    school: '江湖',
    description:
      '绿林里口口相传的手抄剑经，共录三式：快刺、贴影、脱身。品阶虽仍是初阶，却比馆里教头的剑诀多一式，全在身法，不求势沉，落草之后第一本像样的剑谱。',
    currentLevel: 0,
    maxLevel: 10,
    practiceTimes: 0,
    equipped: false,
    /** 比武馆五本（sword+3）略高：绿林精品初阶 */
    baseBonus: { sword: 5 },
    stats: { attack: 26, hit: 14 },
    skills: [
      {
        id: 1,
        name: '疾刺',
        type: '主动',
        unlockLevel: 3,
        icon: '⚔️',
        mpCost: 10,
        plainFx: true,
        useHitRoll: true,
        passiveIds: ['luocao_jici_miss_follow'],
        description:
          '抢步上前，剑尖抢在人反应之前先到；这一式要快，身法越高，剑越险。',
        detail:
          '消耗内力出刺，伤害随身法而增。对手若闪避过去，常能依身法再补一记「续刺」；续刺能否跟上，身法越高越易成。'
      },
      {
        id: 2,
        name: '缠影',
        type: '被动',
        unlockLevel: 6,
        icon: '🪢',
        description: '剑随身走，人影与剑影缠在一处；贴住了，便不易再让对手脱身。',
        passiveIds: ['luocao_chanying_hit'],
        detail: '剑路贴人，命中随身法而增，愈难刺空。'
      },
      {
        id: 3,
        name: '绝尘',
        type: '被动',
        unlockLevel: 9,
        icon: '🍃',
        description:
          '刺出便退，脚步不沾尘；战局拖久，身法愈发轻灵，每一回合都比上一回合更快一线。',
        passiveIds: ['juechen_turn_start'],
        detail:
          '从第二回合起，每回合开始时身法渐疾（战斗内「绝尘」Buff），最多叠三层；层数越高，行动越快。'
      }
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
      { id: 1, name: '对位刺', type: '主动', unlockLevel: 3, icon: '·', mpCost: 10, plainFx: true, description: '先对上身前那人的方位，再顺势递出一剑。', detail: '对正了人再刺，伤害与寻常一剑相仿。' },
      { id: 2, name: '守拙', type: '被动', unlockLevel: 6, icon: '🛡️', description: '剑随身列，胸肋少露，人更扛打些。', passiveIds: ['wuguan_zhenxing_shouzhuo'], detail: '固定防御+10。' }
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
        detail: '抡拳短打：与武馆诸主动同档（约一倍攻 + 臂力每点 +0.6%），耗蓝 10；朴素拳击命中特效。'
      },
      {
        id: 2,
        name: '沉肩',
        type: '被动',
        unlockLevel: 6,
        icon: '🛡️',
        description: '肩肘一沉，门户封得更死，敢贴身去架。',
        passiveIds: ['wuguan_chenqiao_chenjian'],
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
        detail: '与武馆诸主动同档（约一倍攻 + 臂力每点 +0.6%），耗蓝 10；刀类 bladeFx 头像劈斩特效。'
      },
      {
        id: 2,
        name: '合',
        type: '被动',
        unlockLevel: 6,
        icon: '⚔️',
        description: '腕底一沉一拧，劲往刃口「合」；出手便带三分狠劲，刀才听人使唤。',
        passiveIds: ['wuguan_kaihe_he'],
        detail: '基础攻击+10；每点臂力额外+0.5。'
      }
    ]
  },
  {
    id: 15,
    name: '巡山斧诀',
    type: '武功',
    /** 无独立「斧」修为；短柄铁斧路数归入刀法门类，战斗走 axeFx（与 bladeFx 刀劈区分） */
    skillType: 'blade',
    rank: '初阶',
    school: '江湖',
    description: '绿林巡山头目惯用的短柄铁斧几式：腰胯带斧、势沉刃短，不求花巧，只求一斧砍实。暂无玩家秘籍，仅副本敌人引用。',
    currentLevel: 0,
    maxLevel: 10,
    practiceTimes: 0,
    equipped: false,
    baseBonus: { blade: 3 },
    stats: { attack: 20, hit: 9 },
    skills: [
      {
        id: 1,
        name: '劈风',
        type: '主动',
        unlockLevel: 3,
        icon: '🪓',
        mpCost: 10,
        axeFx: true,
        description: '借步拧腰，短斧自外弧劈落；旗侧巡山时最常用的开招。',
        detail: '与武馆刀法主动同档（约一倍攻 + 臂力每点 +0.6%），耗蓝 10；axeFx 斧劈特效（与开合刀法 bladeFx 区分）。'
      },
      {
        id: 2,
        name: '贯劲',
        type: '被动',
        unlockLevel: 6,
        icon: '⚒️',
        description: '斧刃未至，劲已贯入；腕沉肘坠，劈砍才听得使唤。',
        effect: { type: 'buff', stat: 'attack', baseValue: 12, bonusAttr: 'strength', bonusPerPoint: 0.5 },
        detail: '基础攻击+12；每点臂力额外+0.5。'
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
        passiveIds: ['wuguan_yangqi_naxi'],
        detail: '气血上限：基础+30，每点根骨额外+0.45（初阶可先调）。'
      },
      {
        id: 2,
        name: '归根',
        type: '被动',
        unlockLevel: 6,
        icon: '🌿',
        description: '气机沉回丹田，像水渗进土里；每回合只回一小口，贵在细水长流。',
        passiveIds: ['inner_yangqi_guigen'],
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
        passiveIds: ['wuguan_nuobu_nuocun'],
        detail: '基础闪避+10（初阶定数，后可调）。'
      },
      {
        id: 2,
        name: '卸风',
        type: '被动',
        unlockLevel: 6,
        icon: '🍃',
        description: '劲从侧卸、步随身转；脚下愈轻，愈跟得上自己的挪。',
        passiveIds: ['wuguan_nuobu_xiefeng'],
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
      { id: 1, name: '直刺', type: '主动', unlockLevel: 1, icon: '🗡️', mpCost: 20, description: '基础剑招，直刺敌人，臂力越高伤害越高', detail: '基础伤害120%，每点臂力额外+2%伤害' },
      { id: 2, name: '阳刚', type: '被动', unlockLevel: 4, icon: '☀️', description: '被动增加攻击，臂力越高加成越多', passiveIds: ['zhenyang_jianfa_yanggang'], detail: '基础攻击+10%，每点臂力额外+3%' },
      { id: 3, name: '剑影', type: '被动', unlockLevel: 7, icon: '✨', description: '直刺后有20%概率跟随一剑，身法越高触发概率越高', passiveIds: ['jianying_follow'], detail: '直刺后有20%概率跟随一剑，身法越高触发概率越高（当前额外加成见浮窗）' }
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
      { id: 1, name: '培元', type: '被动', unlockLevel: 1, icon: '🔋', description: '固本培元，增加防御力', passiveIds: ['zhenyang_tunxi_peiyuan'], detail: '基础防御+30，每点根骨额外+0.5' },
      { id: 2, name: '固本', type: '被动', unlockLevel: 4, icon: '💪', description: '稳固根基，增加气血上限', passiveIds: ['zhenyang_tunxi_guben'], detail: '气血上限+50，每点根骨额外+0.5' },
      { id: 3, name: '调息', type: '被动', unlockLevel: 7, icon: '🧘', description: '吐纳调息，每回合自动恢复气血', passiveIds: ['inner_tunxi_zhenyang'], detail: '每回合恢复5+等级×3+内息×0.8点气血' }
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
      { id: 1, name: '踏云', type: '被动', unlockLevel: 1, icon: '☁️', description: '脚踏祥云，增加闪避', passiveIds: ['zhenyang_tayun_tayun'], detail: '基础闪避+15，每点身法额外+0.5' },
      { id: 2, name: '逐日', type: '被动', unlockLevel: 4, icon: '☀️', description: '追逐烈日，增加攻击', passiveIds: ['zhenyang_tayun_zhuri'], detail: '基础攻击+10，每点臂力额外+0.5' },
      { id: 3, name: '凌虚', type: '被动', unlockLevel: 7, icon: '✨', description: '凌空虚步，增加速度', passiveIds: ['zhenyang_tayun_lingxu'], detail: '基础速度+15，每点身法额外+0.6' }
    ]
  }
];

// 角色列表（跟角色系统一致）
const martialCharacters = [
  { id: 1, name: '少侠', portraitUrl: PLAYER_PORTRAIT_MALE, iconFallback: '👨‍🦰' },
  { id: 2, name: '叶轻绾', portraitUrl: PLAYER_PORTRAIT_FEMALE, iconFallback: '🌸' }
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
    // id3《正阳吐纳诀》：培元/固本表驱动 + 调息 passiveIds；旧档内联 effect 或缺 passiveIds 时从库同步
    if (m.id === 3 && tmpl && Array.isArray(tmpl.skills)) {
      const s0 = m.skills && m.skills[0];
      const s1 = m.skills && m.skills[1];
      const s2 = m.skills && m.skills[2];
      const oldShape =
        !s0 ||
        s0.name !== '培元' ||
        !Array.isArray(s0.passiveIds) ||
        s0.passiveIds.indexOf('zhenyang_tunxi_peiyuan') < 0 ||
        !s1 ||
        s1.name !== '固本' ||
        !Array.isArray(s1.passiveIds) ||
        s1.passiveIds.indexOf('zhenyang_tunxi_guben') < 0 ||
        !s2 ||
        s2.name !== '调息' ||
        s2.unlockLevel !== 7 ||
        !Array.isArray(s2.passiveIds) ||
        s2.passiveIds.indexOf('inner_tunxi_zhenyang') < 0;
      if (oldShape) {
        changed = true;
        return { ...m, skills: JSON.parse(JSON.stringify(tmpl.skills)) };
      }
    }
    // id1《正阳基础剑式》：阳刚表驱动 + 剑影 passiveIds；旧档内联 followAttack / 阳刚 effect 从库同步
    if (m.id === 1 && tmpl && Array.isArray(tmpl.skills)) {
      const s1 = m.skills && m.skills[1];
      const s2 = m.skills && m.skills[2];
      const oldShape =
        !s1 ||
        s1.name !== '阳刚' ||
        !Array.isArray(s1.passiveIds) ||
        s1.passiveIds.indexOf('zhenyang_jianfa_yanggang') < 0 ||
        !s2 ||
        s2.name !== '剑影' ||
        s2.unlockLevel !== 7 ||
        !Array.isArray(s2.passiveIds) ||
        s2.passiveIds.indexOf('jianying_follow') < 0;
      if (oldShape) {
        changed = true;
        return { ...m, skills: JSON.parse(JSON.stringify(tmpl.skills)) };
      }
    }
    // id5《踏云步》：三被动表驱动；旧档内联 buff 从库同步
    if (m.id === 5 && tmpl && Array.isArray(tmpl.skills)) {
      const s0 = m.skills && m.skills[0];
      const s1 = m.skills && m.skills[1];
      const s2 = m.skills && m.skills[2];
      const oldShape =
        !s0 ||
        s0.name !== '踏云' ||
        !Array.isArray(s0.passiveIds) ||
        s0.passiveIds.indexOf('zhenyang_tayun_tayun') < 0 ||
        !s1 ||
        s1.name !== '逐日' ||
        !Array.isArray(s1.passiveIds) ||
        s1.passiveIds.indexOf('zhenyang_tayun_zhuri') < 0 ||
        !s2 ||
        s2.name !== '凌虚' ||
        !Array.isArray(s2.passiveIds) ||
        s2.passiveIds.indexOf('zhenyang_tayun_lingxu') < 0;
      if (oldShape) {
        changed = true;
        return { ...m, skills: JSON.parse(JSON.stringify(tmpl.skills)) };
      }
    }
    // id6《落草剑经》：旧档名/旧三式（缠斗、1/4/7 解锁等）从库同步
    if (m.id === 6 && tmpl && Array.isArray(tmpl.skills)) {
      const s0 = m.skills && m.skills[0];
      const s1 = m.skills && m.skills[1];
      const s2 = m.skills && m.skills[2];
      const oldShape =
        m.name === '落草快剑' ||
        m.name !== tmpl.name ||
        !s0 ||
        s0.name !== '疾刺' ||
        s0.unlockLevel !== 3 ||
        !s0.plainFx ||
        !s0.useHitRoll ||
        !Array.isArray(s0.passiveIds) ||
        s0.passiveIds.indexOf('luocao_jici_miss_follow') < 0 ||
        s0.mpCost == null ||
        !s1 ||
        s1.name !== '缠影' ||
        s1.unlockLevel !== 6 ||
        !Array.isArray(s1.passiveIds) ||
        s1.passiveIds.indexOf('luocao_chanying_hit') < 0 ||
        !s2 ||
        s2.name !== '绝尘' ||
        s2.unlockLevel !== 9 ||
        !Array.isArray(s2.passiveIds) ||
        s2.passiveIds.indexOf('juechen_turn_start') < 0;
      if (oldShape) {
        changed = true;
        return {
          ...m,
          name: tmpl.name,
          description: tmpl.description,
          baseBonus: tmpl.baseBonus ? { ...tmpl.baseBonus } : m.baseBonus,
          stats: tmpl.stats ? { ...tmpl.stats } : m.stats,
          skills: JSON.parse(JSON.stringify(tmpl.skills))
        };
      }
    }
    // 《阵形剑诀》id10：旧档可能仍为垫步刺 / 守拙无 passiveIds，从库同步技能表
    if (m.id === 10 && tmpl && Array.isArray(tmpl.skills)) {
      const s0 = m.skills && m.skills[0];
      const s1 = m.skills && m.skills[1];
      const oldShape =
        !s0 ||
        s0.name !== '对位刺' ||
        !s1 ||
        s1.name !== '守拙' ||
        !Array.isArray(s1.passiveIds) ||
        s1.passiveIds.indexOf('wuguan_zhenxing_shouzhuo') < 0;
      if (oldShape) {
        changed = true;
        return { ...m, skills: JSON.parse(JSON.stringify(tmpl.skills)) };
      }
    }
    // 《沉桥拳诀》id13：旧档技能名或被动非招架表驱动，从库同步
    if (m.id === 13 && tmpl && Array.isArray(tmpl.skills)) {
      const s0 = m.skills && m.skills[0];
      const s1 = m.skills && m.skills[1];
      const oldShape =
        !s0 ||
        s0.name !== '钉小锤' ||
        !s0.punchFx ||
        !s1 ||
        s1.name !== '沉肩' ||
        !Array.isArray(s1.passiveIds) ||
        s1.passiveIds.indexOf('wuguan_chenqiao_chenjian') < 0;
      if (oldShape) {
        changed = true;
        return { ...m, skills: JSON.parse(JSON.stringify(tmpl.skills)) };
      }
    }
    // id14《开合刀法》：旧档「破荒/劈荒/砺锋」等或缺 bladeFx / 被动非表驱动「合」时，从库同步
    if (m.id === 14 && tmpl && Array.isArray(tmpl.skills)) {
      const s0 = m.skills && m.skills[0];
      const s1 = m.skills && m.skills[1];
      const oldShape =
        !s0 ||
        s0.name !== '开' ||
        !s0.bladeFx ||
        !s1 ||
        s1.name !== '合' ||
        !Array.isArray(s1.passiveIds) ||
        s1.passiveIds.indexOf('wuguan_kaihe_he') < 0;
      if (oldShape) {
        changed = true;
        return { ...m, skills: JSON.parse(JSON.stringify(tmpl.skills)) };
      }
    }
    // 《养气术》id11：旧档带主动/换气固元等，或「纳息」非表驱动，从库同步（现为两被动）
    if (m.id === 11 && tmpl && Array.isArray(tmpl.skills)) {
      const s0 = m.skills && m.skills[0];
      const s1 = m.skills && m.skills[1];
      const oldShape =
        !s0 ||
        s0.name !== '纳息' ||
        s0.type !== '被动' ||
        !Array.isArray(s0.passiveIds) ||
        s0.passiveIds.indexOf('wuguan_yangqi_naxi') < 0 ||
        !s1 ||
        s1.name !== '归根' ||
        s1.unlockLevel !== 6 ||
        !Array.isArray(s1.passiveIds) ||
        s1.passiveIds.indexOf('inner_yangqi_guigen') < 0;
      if (oldShape) {
        changed = true;
        return { ...m, skills: JSON.parse(JSON.stringify(tmpl.skills)) };
      }
    }
    // 《挪步诀》id12：旧档「抢位/挫步」主动或被动非表驱动等，从库同步（现为双被动）
    if (m.id === 12 && tmpl && Array.isArray(tmpl.skills)) {
      const s0 = m.skills && m.skills[0];
      const s1 = m.skills && m.skills[1];
      const oldShape =
        !s0 ||
        s0.name !== '挪寸' ||
        s0.type !== '被动' ||
        !Array.isArray(s0.passiveIds) ||
        s0.passiveIds.indexOf('wuguan_nuobu_nuocun') < 0 ||
        !s1 ||
        s1.name !== '卸风' ||
        !Array.isArray(s1.passiveIds) ||
        s1.passiveIds.indexOf('wuguan_nuobu_xiefeng') < 0;
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
      console.log('武学数据已清理，新局无已学武学');
      return [];
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
      console.warn('武学数据格式错误（非数组），视为未学');
    }
  } catch (e) {
    console.warn('解析武学数据失败，视为未学', e);
  }
  return [];
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

  if (!savedMartialArts.length) {
    return [];
  }

  if (typeof MARTIAL_ARTS_LIBRARY === 'undefined' || !MARTIAL_ARTS_LIBRARY.length) {
    if (typeof getPlayerMartialArts === 'function') return getPlayerMartialArts(cid);
    return savedMartialArts;
  }

  return savedMartialArts
    .map(function (savedMartial) {
      if (!savedMartial || typeof savedMartial.id !== 'number') return savedMartial;
      const martial = MARTIAL_ARTS_LIBRARY.find(function (x) {
        return x && x.id === savedMartial.id;
      });
      if (!martial) return savedMartial;
      return Object.assign({}, martial, {
        currentLevel:
          savedMartial.currentLevel != null ? savedMartial.currentLevel : 0,
        equipped: !!savedMartial.equipped,
        practiceTimes:
          savedMartial.practiceTimes != null
            ? savedMartial.practiceTimes
            : martial.practiceTimes
      });
    })
    .filter(Boolean);
}

window.getMergedMartialArtsListForCharId = getMergedMartialArtsListForCharId;

/** 苏瑶传授：写入 playerMartialArts_{charId}（武学页/战斗读此键，勿只写 playerState.learnedSkills） */
function grantZhengyangIntroMartialArt(charId, skillName) {
  const martialId =
    typeof getZhengyangIntroMartialIdBySkillName === 'function'
      ? getZhengyangIntroMartialIdBySkillName(skillName)
      : null;
  if (!martialId) return { ok: false, reason: 'unknown_skill' };
  if (typeof MARTIAL_ARTS_LIBRARY === 'undefined' || !MARTIAL_ARTS_LIBRARY.length) {
    return { ok: false, reason: 'no_library' };
  }
  const lib = MARTIAL_ARTS_LIBRARY.find(function (m) {
    return m && m.id === martialId;
  });
  if (!lib) return { ok: false, reason: 'not_in_library' };

  const cid = charId == null || isNaN(Number(charId)) ? 1 : Number(charId);
  let list = getPlayerMartialArts(cid);
  if (list.some(function (m) {
    return m && Number(m.id) === martialId;
  })) {
    return { ok: true, already: true };
  }

  list = list.map(function (m) {
    if (!m) return m;
    if (m.type === lib.type && m.equipped) {
      return Object.assign({}, m, { equipped: false });
    }
    return m;
  });

  list.push({
    id: lib.id,
    name: lib.name,
    type: lib.type,
    skillType: lib.skillType,
    rank: lib.rank,
    school: lib.school,
    description: lib.description,
    currentLevel: 1,
    maxLevel: lib.maxLevel != null ? lib.maxLevel : 10,
    practiceTimes: 0,
    equipped: true,
    baseBonus: lib.baseBonus ? Object.assign({}, lib.baseBonus) : {},
    stats: lib.stats ? Object.assign({}, lib.stats) : {},
    skills: Array.isArray(lib.skills)
      ? lib.skills.map(function (s) {
          return Object.assign({}, s);
        })
      : []
  });

  try {
    localStorage.setItem('playerMartialArts_' + cid, JSON.stringify(list));
  } catch (e) {
    console.warn('grantZhengyangIntroMartialArt: 写入失败', e);
    return { ok: false, reason: 'persist_failed' };
  }

  if (lib.skillType) {
    try {
      const raw = localStorage.getItem('playerCharacters');
      if (raw) {
        const chars = JSON.parse(raw);
        const c = Array.isArray(chars) ? chars.find(function (x) {
          return x && Number(x.id) === cid;
        }) : null;
        if (c) {
          if (!c.stats) c.stats = {};
          c.stats[lib.skillType] = (c.stats[lib.skillType] || 0) + 5;
          localStorage.setItem('playerCharacters', JSON.stringify(chars));
        }
      }
    } catch (e2) {
      console.warn('grantZhengyangIntroMartialArt: 修为同步失败', e2);
    }
  }

  return { ok: true, already: false };
}

/** 已扣贡献且 learnedSkills 有记录但武学列表缺失时补写（不扣贡献） */
function repairZhengyangIntroMartialsFromLearnedSkills(charId) {
  let state;
  try {
    state = JSON.parse(localStorage.getItem('playerState') || '{}');
  } catch (e) {
    return 0;
  }
  const names = state.learnedSkills || [];
  let fixed = 0;
  names.forEach(function (name) {
    const r = grantZhengyangIntroMartialArt(charId, name);
    if (r.ok && !r.already) fixed += 1;
  });
  return fixed;
}

window.grantZhengyangIntroMartialArt = grantZhengyangIntroMartialArt;
window.repairZhengyangIntroMartialsFromLearnedSkills = repairZhengyangIntroMartialsFromLearnedSkills;

function getPlayerExperience() {
  const saved = localStorage.getItem('playerExperience');
  if (saved != null && saved !== '') return parseInt(saved, 10) || 0;
  return 0;
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
