/**
 * 正阳派地图数据
 */

// 正阳派建筑数据（按参考图布局）
const ZHENGYANG_BUILDINGS = {
  zhengyang_hall: { id: 'zhengyang_hall', name: '正阳主殿', icon: '🏰', x: 500, y: 180, connections: ['wangjian_peak', 'yifeng_xuan', 'chengxin_tang', 'chunyang_ping'], desc: '门派大典、掌门议事、接待重要正道访客的核心场所。以玄玉为基、紫檀木为梁，殿顶刻满纯阳符文，正午阳光洒下时，符文会映出金色光纹，自带正气威压；殿中悬挂开山祖师手书的「正心为剑」匾额。' },
  wangjian_peak: { id: 'wangjian_peak', name: '望剑峰', icon: '⛰️', x: 500, y: 60, connections: ['zhengyang_hall'], desc: '正阳派的禁地，历代掌门闭关突破的地方。峰顶常年被阳气笼罩，是练纯阳剑法的绝佳之地，峰下有历代掌门的衣冠冢。' },
  yifeng_xuan: { id: 'yifeng_xuan', name: '逸风轩', icon: '🏡', x: 180, y: 180, connections: ['zhengyang_hall'], desc: '李逸的私人居所，也是他日常闭关、练剑的地方。没有奢华装饰，就是一间带小院的木屋，院里有个石桌、一把剑架，墙上挂着他和其他正派掌门的书信，还有几坛他爱喝的烈酒。' },
  chengxin_tang: { id: 'chengxin_tang', name: '澄心堂', icon: '🏛️', x: 820, y: 180, connections: ['zhengyang_hall'], desc: '长老议事、处理弟子奖惩、宣讲门规的场所。堂内只有长桌和木凳，墙上刻着李逸亲自修订的门规：「不欺弱、不附邪、不滥杀、不藏私」。' },
  chunyang_ping: { id: 'chunyang_ping', name: '纯阳剑坪', icon: '⚔️', x: 500, y: 340, connections: ['zhengyang_hall', 'ningyang_bieyuan', 'gui_zhen_lou', 'cuifeng_fang'], desc: '门派弟子练剑的核心场所。位于正阳峰前的开阔平地，青石板被历代弟子的剑痕磨得光滑如镜；坪边立着十数块「剑痕碑」，刻着李逸和历代掌门的剑招心得。' },
  gui_zhen_lou: { id: 'gui_zhen_lou', name: '归真藏经楼', icon: '📚', x: 720, y: 340, connections: ['chunyang_ping', 'huichun_tang'], desc: '存放门派武学典籍、剑谱和江湖正道秘闻的地方。楼分三层：一层放外门弟子可借阅的基础剑法，二层放内门弟子的进阶剑谱，三层藏着镇派的《纯阳剑谱》全本和开山祖师手札。' },
  ningyang_bieyuan: { id: 'ningyang_bieyuan', name: '凝阳别院', icon: '🏠', x: 280, y: 340, connections: ['chunyang_ping', 'suxin_zhai'], desc: '内门弟子的居所，也是核心弟子闭关的地方。都是带小院的竹屋，每个院子里都有一个小剑台，方便弟子日常练剑。' },
  cuifeng_fang: { id: 'cuifeng_fang', name: '淬锋坊', icon: '⚒️', x: 500, y: 480, connections: ['chunyang_ping', 'huichun_tang', 'xijian_chi'], desc: '打造、修复门派佩剑的铸剑坊，也是正阳派的兵器库。坊里用「纯阳真火」铸剑，铸出的剑自带正气，能克制血刀门的毒器。' },
  huichun_tang: { id: 'huichun_tang', name: '回春堂', icon: '💊', x: 720, y: 480, connections: ['gui_zhen_lou', 'cuifeng_fang'], desc: '门派的医馆，由懂医术的长老坐诊，给弟子疗伤，也会救济山下百姓。堂里常备「纯阳正气丹」，能压制阴邪毒素。' },
  suxin_zhai: { id: 'suxin_zhai', name: '素心斋', icon: '🍚', x: 280, y: 480, connections: ['ningyang_bieyuan', 'menkou'], desc: '门派的食堂，弟子、长老、掌门都在这里吃饭。以素食为主，也会给练剑辛苦的弟子准备肉食。' },
  xijian_chi: { id: 'xijian_chi', name: '洗剑池', icon: '🏊', x: 500, y: 580, connections: ['cuifeng_fang'], desc: '山间的天然泉水池，弟子练剑后会在这里洗剑，据说能洗去剑上的戾气，也能洗去心中的杂念。池水常年清澈，带着淡淡的阳气。' },
  menkou: { id: 'menkou', name: '门派入口', icon: '🚪', x: 280, y: 580, connections: ['suxin_zhai'], desc: '正阳派的山门入口，门外即是下山的石阶路。从此处可以离开门派，返回江湖大地图。' }
};

const ZHENGYANG_CONNECTIONS = [
  ['zhengyang_hall', 'wangjian_peak'],
  ['zhengyang_hall', 'yifeng_xuan'],
  ['zhengyang_hall', 'chengxin_tang'],
  ['zhengyang_hall', 'chunyang_ping'],
  ['chunyang_ping', 'ningyang_bieyuan'],
  ['chunyang_ping', 'gui_zhen_lou'],
  ['chunyang_ping', 'cuifeng_fang'],
  ['gui_zhen_lou', 'huichun_tang'],
  ['ningyang_bieyuan', 'suxin_zhai'],
  ['suxin_zhai', 'menkou'],
  ['cuifeng_fang', 'huichun_tang'],
  ['cuifeng_fang', 'xijian_chi']
];

// 暴露到全局
window.ZHENGYANG_BUILDINGS = ZHENGYANG_BUILDINGS;
window.ZHENGYANG_CONNECTIONS = ZHENGYANG_CONNECTIONS;
