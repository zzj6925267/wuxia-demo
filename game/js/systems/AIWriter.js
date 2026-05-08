/**
 * AI文案生成系统
 * @module AIWriter
 */

/**
 * AI服务配置
 */
const AI_CONFIG = {
  // 服务提供商
  SERVICE_PROVIDER: 'DOUBAO', // WENXIN_YIYAN, DOUBAO, TONGYI_QIANWEN, OPENAI
  
  // API密钥（需要用户自己配置）
  API_KEY: '',
  SECRET_KEY: '',
  
  // 各服务商配置
  PROVIDERS: {
    WENXIN_YIYAN: {
      name: '文心一言',
      apiUrl: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions',
      tokenUrl: 'https://aip.baidubce.com/oauth/2.0/token',
      model: 'eb-instant'
    },
    DOUBAO: {
      name: '豆包',
      apiUrl: 'https://chat.bytedance.net/api/text-generation',
      model: 'Doubao'
    },
    TONGYI_QIANWEN: {
      name: '通义千问',
      apiUrl: 'https://dashscope.aliyuncs.com/api/text-generation/generation',
      model: 'qwen-turbo'
    },
    OPENAI: {
      name: 'OpenAI',
      apiUrl: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-3.5-turbo'
    }
  },
  
  // 请求配置
  REQUEST_CONFIG: {
    temperature: 0.8,      // 创意程度 0-1
    maxTokens: 500,        // 最大token数
    timeout: 30000         // 请求超时时间（毫秒）
  },
  
  // Mock数据模式（用于演示）
  ENABLE_MOCK: true
};

/**
 * AI文案生成器类
 */
class AIWriter {
  /**
   * 构造函数
   */
  constructor() {
    this.config = { ...AI_CONFIG };
    this.accessToken = null;
    this.tokenExpireTime = 0;
  }

  /**
   * 设置API密钥
   * @param {string} apiKey - API密钥
   * @param {string} secretKey - 密钥（某些服务商需要）
   */
  setApiKey(apiKey, secretKey = '') {
    this.config.API_KEY = apiKey;
    this.config.SECRET_KEY = secretKey;
  }

  /**
   * 设置服务提供商
   * @param {string} provider - 提供商名称
   */
  setProvider(provider) {
    if (this.config.PROVIDERS[provider]) {
      this.config.SERVICE_PROVIDER = provider;
    }
  }

  /**
   * 获取当前服务商信息
   * @returns {object} 服务商配置
   */
  getCurrentProvider() {
    return this.config.PROVIDERS[this.config.SERVICE_PROVIDER];
  }

  /**
   * 生成武侠风格对话
   * @param {string} prompt - 生成提示
   * @param {string} characterName - 角色名称
   * @param {string} context - 背景描述
   * @returns {Promise<string>} 生成的对话内容
   */
  async generateWuxiaDialog(prompt, characterName = '', context = '') {
    const fullPrompt = `
    你是一位精通武侠小说创作的大师，请用古风雅致的语言，帮我生成一段武侠风格的对话。
    
    人物：${characterName || '无'}
    
    背景：${context || '无'}
    
    需求：${prompt}
    
    请输出符合武侠风格的对话内容，不要有现代词汇，保持古风韵味。
    `.trim();

    return this._callApi(fullPrompt);
  }

  /**
   * 生成场景描述
   * @param {string} location - 地点名称
   * @param {string} style - 风格描述
   * @returns {Promise<string>} 场景描述
   */
  async generateSceneDescription(location, style = '古风武侠') {
    const prompt = `
    请描述一个${style}风格的${location}场景，要求：
    1. 语言优美，富有画面感
    2. 使用古风词汇
    3. 描述细致入微
    4. 字数在100-200字之间
    `.trim();

    return this._callApi(prompt);
  }

  /**
   * 生成角色台词
   * @param {object} character - 角色信息
   * @param {string} emotion - 情绪状态
   * @param {string} situation - 场景描述
   * @returns {Promise<string>} 角色台词
   */
  async generateCharacterLine(character, emotion, situation) {
    const prompt = `
    角色信息：
    姓名：${character.name || '未知'}
    身份：${character.role || '未知'}
    性格：${character.personality || '未知'}
    
    场景：${situation}
    情绪：${emotion}
    
    请为这个角色生成一句符合其身份和性格的台词，保持古风武侠风格。
    `.trim();

    return this._callApi(prompt);
  }

  /**
   * 生成故事章节
   * @param {string} title - 章节标题
   * @param {number} length - 字数要求
   * @returns {Promise<string>} 故事内容
   */
  async generateStoryChapter(title, length = 500) {
    const prompt = `
    请帮我写一段武侠小说章节：
    
    章节标题：${title}
    
    要求：
    1. 语言古风雅致，符合武侠风格
    2. 情节紧凑，有吸引力
    3. 字数约${length}字
    4. 包含角色对话和场景描写
    `.trim();

    return this._callApi(prompt);
  }

  /**
   * 通用内容生成
   * @param {string} prompt - 提示内容
   * @returns {Promise<string>} 生成内容
   */
  async generateContent(prompt) {
    return this._callApi(prompt);
  }

  /**
   * 调用AI API
   * @param {string} prompt - 提示内容
   * @returns {Promise<string>} 响应内容
   */
  async _callApi(prompt) {
    // 如果启用mock模式，返回模拟数据
    if (this.config.ENABLE_MOCK) {
      return this._getMockResponse(prompt);
    }
    
    if (!this.config.API_KEY) {
      throw new Error('请先配置API Key');
    }

    const provider = this.getCurrentProvider();
    let url = provider.apiUrl;
    let headers = {};
    let body = {};

    // 根据服务商构建请求
    switch (this.config.SERVICE_PROVIDER) {
      case 'WENXIN_YIYAN':
        // 文心一言需要access_token
        await this._ensureAccessToken();
        url = `${provider.apiUrl}?access_token=${this.accessToken}`;
        headers = {
          'Content-Type': 'application/json'
        };
        body = {
          model: provider.model,
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: this.config.REQUEST_CONFIG.temperature,
          max_tokens: this.config.REQUEST_CONFIG.maxTokens
        };
        break;

      case 'DOUBAO':
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.API_KEY}`
        };
        body = {
          model: provider.model,
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: this.config.REQUEST_CONFIG.temperature,
          max_tokens: this.config.REQUEST_CONFIG.maxTokens
        };
        break;

      case 'TONGYI_QIANWEN':
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.API_KEY}`
        };
        body = {
          model: provider.model,
          input: {
            messages: [
              { role: 'user', content: prompt }
            ]
          },
          parameters: {
            temperature: this.config.REQUEST_CONFIG.temperature,
            max_tokens: this.config.REQUEST_CONFIG.maxTokens
          }
        };
        break;

      case 'OPENAI':
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.API_KEY}`
        };
        body = {
          model: provider.model,
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: this.config.REQUEST_CONFIG.temperature,
          max_tokens: this.config.REQUEST_CONFIG.maxTokens
        };
        break;

      default:
        throw new Error('未知的服务提供商');
    }

    // 发送请求
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
      timeout: this.config.REQUEST_CONFIG.timeout
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    return this._parseResponse(data);
  }

  /**
   * 获取文心一言的access_token
   * @returns {Promise<string>} access_token
   */
  async _ensureAccessToken() {
    const now = Date.now();
    
    // 如果token还没过期，直接返回
    if (this.accessToken && now < this.tokenExpireTime) {
      return this.accessToken;
    }

    const provider = this.getCurrentProvider();
    const url = `${provider.tokenUrl}?grant_type=client_credentials&client_id=${this.config.API_KEY}&client_secret=${this.config.SECRET_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      throw new Error('获取access_token失败');
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpireTime = now + (data.expires_in - 60) * 1000; // 提前1分钟过期

    return this.accessToken;
  }

  /**
   * 解析API响应
   * @param {object} data - 响应数据
   * @returns {string} 提取的文本内容
   */
  _parseResponse(data) {
    // 文心一言响应格式
    if (data.result) {
      return data.result.trim();
    }

    // OpenAI/Doubao响应格式
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content.trim();
    }

    // 通义千问响应格式
    if (data.output && data.output.text) {
      return data.output.text.trim();
    }

    // 其他格式
    throw new Error('无法解析API响应');
  }

  /**
   * 获取Mock响应数据（用于演示）
   * @param {string} prompt - 提示内容
   * @returns {string} Mock响应内容
   */
  async _getMockResponse(prompt) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 地点-specific响应（优先匹配）
    const locationResponses = {
      '华山': [
        '华山之巅，云雾缭绕，狂风呼啸。只见那万丈悬崖之上，一块青石板静静伫立，仿佛在诉说着千年的江湖恩怨。远处云海翻涌，如波涛般壮阔，近处松涛阵阵，似龙吟虎啸。山巅之上，剑气纵横，映照着天边的残阳，将整个世界染成一片金红。',
        '西岳华山，奇险天下第一。千尺幢、百尺峡、老君犁沟，处处皆是绝险。山峰如利剑直插云霄，山间栈道蜿蜒曲折，行走其上，如履薄冰。每当云海翻腾之时，整座山峰仿佛悬浮于云端，宛如仙境。',
        '华山论剑，英雄汇聚。山顶平台上，各路豪杰各展绝技，剑气纵横，掌风呼啸。夕阳西下，将众人的身影拉得很长，映照着他们脸上的坚毅与豪情。这是江湖的巅峰，也是武者的荣耀之地。'
      ],
      '江南': [
        '江南水乡，细雨绵绵。青石板路上，油纸伞下，一位青衣女子缓步而行。河畔垂柳依依，桃花纷飞，画舫在碧波上轻轻摇曳。远处传来悠扬的笛声，与潺潺流水交织成一曲动人的乐章。',
        '江南三月，草长莺飞。苏堤春晓，断桥残雪，处处皆是诗情画意。西湖之上，荷花映日，莲叶接天。远处雷峰塔影影绰绰，仿佛在诉说着千年的爱情传说。',
        '江南古镇，青瓦白墙，小桥流水。午后的阳光透过雕花窗棂，洒在斑驳的石板路上。茶馆里传来阵阵茶香，说书人正在讲述着江湖轶事，引人入胜。'
      ],
      '大漠': [
        '大漠孤烟直，长河落日圆。黄沙漫天中，一座古城巍然屹立，城墙上斑驳的痕迹诉说着无数次的金戈铁马。夕阳将战士们的身影拉得很长，他们的目光坚定，望向远方的地平线。',
        '茫茫戈壁，风沙漫天。驼铃声声，穿越无垠的沙漠。远处的海市蜃楼若隐若现，仿佛是沙漠中的仙境。商队在沙丘间缓缓前行，追逐着心中的绿洲。',
        '大漠之夜，星光璀璨。篝火旁，牧民们围坐在一起，讲述着古老的传说。远处传来狼嚎，为这片广袤的土地增添了几分神秘与苍凉。'
      ],
      '洛阳': [
        '洛阳古都，繁华依旧。朱雀大街上，车水马龙，人来人往。酒楼茶馆，生意兴隆，处处可见江湖人士的身影。城中的白马寺香烟缭绕，钟声悠扬，为这座繁华都市增添了几分宁静。',
        '洛阳城外，牡丹盛开。姹紫嫣红，争奇斗艳。赏花的人群络绎不绝，其中不乏身着古装的侠士佳人。花香弥漫，沁人心脾，让人沉醉其中。',
        '洛阳比武大会，群英荟萃。擂台上，各路高手各展绝技，刀光剑影，精彩纷呈。台下观众呐喊助威，声震云霄，尽显江湖豪情。'
      ],
      '竹林': [
        '一片幽静的竹林，竹叶沙沙作响，仿佛在诉说着什么。阳光透过竹叶的缝隙洒落，在地上形成斑驳的光影。林间小溪潺潺流淌，鸟语花香，宛如世外桃源。',
        '竹林深处，隐者居所。一间竹屋，几竿翠竹，一壶清茶。隐者抚琴而坐，琴声悠扬，与风声、竹声、水声交织成一曲天籁之音。',
        '竹林之战，剑气纵横。青竹剑影，快如闪电。竹叶纷飞，剑气所过之处，竹断枝折。两位高手在竹林间穿梭往来，尽显轻功与剑法的精妙。'
      ],
      '酒馆': [
        '江湖酒馆，人声鼎沸。酒旗飘扬，酒香四溢。各路江湖人士在此相聚，谈天说地，议论江湖大事。店小二忙前忙后，吆喝声此起彼伏，一派热闹景象。',
        '酒馆角落，一位青衣剑客独自饮酒。他神情落寞，眼中带着一丝忧郁。桌上放着一把长剑，剑穗随风轻摆，仿佛在诉说着主人的故事。',
        '酒馆之中，突发争执。两拨人马互不相让，眼看就要大打出手。就在此时，一位白衣书生挺身而出，几句话便化解了这场纷争，尽显高手风范。'
      ]
    };
    
    // 先检查是否有地点-specific的响应
    for (const [location, responses] of Object.entries(locationResponses)) {
      if (prompt.includes(location)) {
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }
    
    // 根据提示内容返回不同的mock数据
    const mockResponses = [
      // 角色台词
      {
        keywords: ['令狐冲', '台词', '说'],
        responses: [
          '"哈哈！人生在世，当纵情江湖，管他什么正邪之分！来，干了这碗酒！"令狐冲手提酒壶，朗声大笑，酒液顺着嘴角流淌，却丝毫不减其豪迈之气。',
          '"师傅曾说，剑道的最高境界是无招胜有招。今日我终于明白了，真正的剑法，不在于招式的精妙，而在于心境的通达。"令狐冲望着手中的长剑，眼中闪过一丝顿悟。',
          '"盈盈，无论江湖如何险恶，我令狐冲都会陪在你身边。哪怕是刀山火海，我也绝不退缩！"令狐冲紧紧握住任盈盈的手，眼中满是坚定。'
        ]
      },
      // 武侠对话
      {
        keywords: ['对话', '相遇', '谈话'],
        responses: [
          '令狐冲："姑娘，在下令狐冲，敢问芳名？"\n任盈盈："小女子任盈盈。令狐少侠，久仰大名。"\n令狐冲："不敢当。不知姑娘为何独自在此？"\n任盈盈："听闻华山剑法精妙，特来见识一番。"',
          '神秘老者："年轻人，你的路还很长。"\n令狐冲："前辈何出此言？"\n神秘老者："江湖险恶，人心难测。记住，真正的强大不在于武功，而在于本心。"\n令狐冲："晚辈谨记前辈教诲。"',
          '岳不群："冲儿，你太让为师失望了！"\n令狐冲："师傅，弟子何错之有？"\n岳不群："结交魔教妖人，败坏门风！你可知错？"\n令狐冲："弟子只知正邪自在人心，并非出身所能决定！"'
        ]
      },
      // 故事章节
      {
        keywords: ['章节', '故事', '第一章'],
        responses: [
          '第一章：初入江湖\n\n少年令狐冲，年方十六，手持长剑，踏出华山派山门。\n\n"师傅，弟子走了！"他朝着山上遥遥一拜，转身毅然走向那未知的江湖。\n\n山下，正是繁华的洛阳城。酒旗飘扬，人声鼎沸。令狐冲找了一家酒馆，要了一壶烈酒，几碟小菜，静静观察着来往的江湖中人。\n\n忽然，一阵马蹄声由远及近，只见一队人马疾驰而过，为首一人面色冷峻，腰间佩剑，气势不凡。"是青城派的人！"邻座有人低声说道。\n\n令狐冲端起酒杯，眼中闪过一丝好奇。他知道，自己的江湖之路，从此刻正式开始了。',
          '第二章：竹林奇遇\n\n洛阳城外，一片幽静的竹林。\n\n令狐冲信步其间，竹叶沙沙作响，仿佛在诉说着什么。忽然，他听到一阵悠扬的琴声，如流水般清澈动人。\n\n循声寻去，只见竹林深处，一位白衣女子正抚琴而坐。她容貌绝美，气质高雅，宛如仙子下凡。\n\n"姑娘的琴艺，真是绝妙。"令狐冲忍不住赞道。\n\n女子抬起头，微微一笑："公子过奖了。不知公子如何称呼？"\n\n"在下令狐冲。"\n\n"原来是华山派的令狐少侠，久仰大名。小女子任盈盈。"\n\n两人目光相遇，仿佛有某种缘分在悄然绽放。'
        ]
      }
    ];
    
    // 找到匹配的响应
    for (const item of mockResponses) {
      for (const keyword of item.keywords) {
        if (prompt.includes(keyword)) {
          return item.responses[Math.floor(Math.random() * item.responses.length)];
        }
      }
    }
    
    // 默认响应
    return `
    （AI生成文案演示）
    
    武侠世界，风起云涌。江湖儿女，快意恩仇。
    
    一剑西来，千军辟易；
    十年磨剑，今朝试锋。
    
    英雄莫问出处，
    侠骨柔情，义薄云天。
    
    这正是：
    江湖路远，道阻且长；
    仗剑天涯，不负此生。
    `.trim();
  }
}

// 暴露到全局
window.AI_CONFIG = AI_CONFIG;
window.AIWriter = AIWriter;