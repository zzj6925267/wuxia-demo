/**
 * 青石镇（小镇地图）—— 与山林 forestMapData、正阳派 zhengyangMapData 同构：节点 + 连线 + desc
 */

const QINGSTONE_LOCATIONS = {
  qingstone_gate: {
    id: 'qingstone_gate',
    name: '镇口牌坊',
    icon: '🏛️',
    x: 400,
    y: 520,
    connections: ['bluestone_street'],
    desc: '两座石狮蹲守道口，匾额上书「青石镇」三字，笔力浑厚。往来行商在此歇脚，挑夫的号子与卖茶老妪的吆喝混成一片，是江湖里少见的热闹与安稳。'
  },
  bluestone_street: {
    id: 'bluestone_street',
    name: '青石板街',
    icon: '🪨',
    x: 400,
    y: 300,
    connections: [
      'qingstone_gate',
      'town_notice',
      'qingshi_inn',
      'li_smithy',
      'qingstone_dojo',
      'renxin_herbal',
      'east_market',
      'back_lane'
    ],
    desc: '主街由整块青石铺就，被岁月与鞋底磨得发亮。两侧檐角高挑，酒旗与布幌交错；雨后积水映着天光，像一条浅浅的河。镇里人说：「脚踏青石，心也踏实。」'
  },
  town_notice: {
    id: 'town_notice',
    name: '镇衙告示墙',
    icon: '📜',
    x: 400,
    y: 80,
    connections: ['bluestone_street'],
    desc: '青砖墙上钉着桐油浸过的木板，墨字有的新有的旧：缉拿山贼的图形、征募护院的榜文、邻镇米价、还有一则不知真假的「黑风寨动向」。江湖消息，往往从这里传开。'
  },
  qingshi_inn: {
    id: 'qingshi_inn',
    name: '青石栈',
    icon: '🏮',
    x: 120,
    y: 200,
    connections: ['bluestone_street', 'qingstone_dojo'],
    desc: '二层木楼，门板漆成枣红。掌柜爱算账也爱听江湖闲话，楼上客房不大，被褥却晒得干爽。不少过路侠客在此打尖，夜里能听见楼下猜拳行令。'
  },
  li_smithy: {
    id: 'li_smithy',
    name: '李记铁匠铺',
    icon: '⚒️',
    x: 680,
    y: 200,
    connections: ['bluestone_street', 'east_market'],
    desc: '炉火终日不熄，风箱呼嗒作响。李师傅少言寡语，打出的菜刀、锄头和短剑却极耐使。墙角堆着待修的农具与几柄江湖人留下的断刃。'
  },
  qingstone_dojo: {
    id: 'qingstone_dojo',
    name: '青石武馆',
    icon: '🥋',
    x: 120,
    y: 100,
    connections: ['bluestone_street', 'qingshi_inn'],
    desc: '紧挨青石栈后身的小院，正厅悬匾「刚柔并济」。日头下几名学徒扎马挥拳，廊下立着几具木人，拳脚印痕深浅不一。教头嗓门洪亮，最看不惯花架子。'
  },
  renxin_herbal: {
    id: 'renxin_herbal',
    name: '仁心药铺',
    icon: '💊',
    x: 120,
    y: 400,
    connections: ['bluestone_street', 'back_lane'],
    desc: '药柜高及屋梁，抽屉上写满小楷药名。坐堂的老大夫须发皆白，把脉时眼半阖，开方却快。柜台上常摆着免费施舍的解暑茶汤。'
  },
  east_market: {
    id: 'east_market',
    name: '东市杂摊',
    icon: '🧺',
    x: 680,
    y: 400,
    connections: ['bluestone_street', 'li_smithy'],
    desc: '竹棚连成一片，卖针线、腌菜、草鞋与廉价首饰。小贩嗓门洪亮，主妇讨价还价毫不示弱。偶尔也有行脚商人摆出几件来路不明的「古物」，引人围观。'
  },
  back_lane: {
    id: 'back_lane',
    name: '后巷',
    icon: '🏚️',
    x: 260,
    y: 520,
    connections: ['bluestone_street', 'renxin_herbal'],
    desc: '窄巷两侧是灶间与堆柴的后院，晾衣绳横过头顶。白日里孩童追闹，入夜后灯笼稀疏，偶有醉汉靠墙打鼾——是镇上最烟火气、也最藏得住故事的地方。'
  }
};

const QINGSTONE_CONNECTIONS = [
  ['qingstone_gate', 'bluestone_street'],
  ['bluestone_street', 'town_notice'],
  ['bluestone_street', 'qingshi_inn'],
  ['bluestone_street', 'li_smithy'],
  ['bluestone_street', 'qingstone_dojo'],
  ['qingshi_inn', 'qingstone_dojo'],
  ['bluestone_street', 'renxin_herbal'],
  ['bluestone_street', 'east_market'],
  ['bluestone_street', 'back_lane'],
  ['li_smithy', 'east_market'],
  ['renxin_herbal', 'back_lane']
];

window.QINGSTONE_LOCATIONS = QINGSTONE_LOCATIONS;
window.QINGSTONE_CONNECTIONS = QINGSTONE_CONNECTIONS;
