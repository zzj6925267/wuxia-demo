# AI文案接入指南

## 概述

本项目已集成AI文案能力，可以通过调用文心一言、豆包、通义千问等AI服务生成武侠风格的对话、场景描述和角色台词。

## 接入步骤

### 第一步：注册AI服务

#### 方案A：文心一言（推荐）
1. 访问：https://cloud.baidu.com/product/ernie
2. 注册百度智能云账号
3. 创建应用，获取 **API Key** 和 **Secret Key**
4. 在文心一言开放平台创建对话模型

#### 方案B：豆包
1. 访问：https://www.doubao.com/
2. 注册账号，进入开发者平台
3. 创建应用，获取 **API Key**

#### 方案C：通义千问
1. 访问：https://tongyi.aliyun.com/
2. 注册阿里云账号
3. 创建应用，获取 **API Key**

### 第二步：配置API Key

打开 `Scripts/ai_writer.gd` 文件，修改以下配置：

```gdscript
@export var api_key: String = "你的API Key"
@export var api_url: String = "对应服务商的API地址"
```

或者在编辑器中通过Inspector面板设置。

### 第三步：在场景中使用

#### 方法一：添加节点
在你的场景中添加 `AIWriter` 节点，然后连接信号：

```gdscript
@onready var ai_writer: AIWriter = $AIWriter

func _ready():
    ai_writer.connect("ai_response_received", _on_ai_response)
    ai_writer.connect("ai_error", _on_ai_error)

func _on_ai_response(text: String):
    print("AI生成内容:", text)
    # 可以将text传递给对话系统
    
func _on_ai_error(error: String):
    print("AI错误:", error)
```

#### 方法二：直接调用

```gdscript
# 生成场景描述
ai_writer.generate_scene_description("华山之巅")

# 生成角色台词
var character = {
    "name": "令狐冲",
    "role": "华山派大弟子",
    "personality": "放荡不羁"
}
ai_writer.generate_character_line(character, "豪迈", "在酒馆饮酒")

# 生成武侠对话
ai_writer.generate_wuxia_dialog(
    "写一段比武前的对话",
    "令狐冲",
    "华山论剑前夕"
)

# 通用生成
ai_writer.generate_content("请写一首武侠诗")
```

## 使用示例

### 集成到对话系统

```gdscript
# 在dialog_system.gd中添加AI生成功能
func generate_dialog_with_ai(prompt: String):
    var ai_writer = AIWriter.new()
    ai_writer.api_key = "你的API Key"
    
    ai_writer.connect("ai_response_received", func(text):
        var dialog_data = [{"speaker": "AI角色", "text": text}]
        start_dialog(dialog_data)
    )
    
    ai_writer.generate_wuxia_dialog(prompt)
```

### 动态生成故事内容

```gdscript
func generate_story_chapter(chapter_title: String):
    var prompt = """
    请帮我写一段武侠小说章节：
    
    章节标题：%s
    
    要求：
    1. 包含至少3个角色互动
    2. 有精彩的打斗场面
    3. 语言古风雅致
    4. 字数约500字
    """ % chapter_title
    
    ai_writer.generate_content(prompt)
```

## API配置说明

### 文心一言配置
- API URL: `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions`
- Model: `eb-instant` 或 `eb-turbo`

### 豆包配置
- API URL: `https://api.doubao.com/v1/chat/completions`
- 需要使用Bearer Token认证

### 通义千问配置
- API URL: `https://dashscope.aliyuncs.com/api/text-generation/generation`
- 需要阿里云API Key

## 注意事项

1. **API费用**：各服务商都有免费额度，但大规模使用需要付费
2. **网络请求**：需要在项目设置中启用网络权限
3. **异步处理**：AI调用是异步的，通过信号机制获取结果
4. **内容审核**：建议对AI生成的内容进行审核后再展示
5. **错误处理**：需要处理网络超时、API限制等异常情况

## 文件结构

```
Scripts/
├── ai_writer.gd      # AI文案生成器核心类
├── ai_config.gd      # AI配置管理类
├── ai_demo.gd        # 使用演示脚本
├── dialog_system.gd  # 原有的对话系统
└── dialog_loader.gd  # 原有的对话加载器
```

## 下一步建议

1. 在场景中添加AI配置界面，让玩家可以输入自己的API Key
2. 添加内容缓存机制，避免重复调用API
3. 实现内容模板系统，让AI生成更符合游戏风格
4. 添加AI生成内容的编辑和保存功能

---

如有问题，请查看各AI服务商的官方文档：
- 文心一言：https://ai.baidu.com/docs
- 豆包：https://ai.bytedance.net/docs
- 通义千问：https://help.aliyun.com/document_detail/611472.html