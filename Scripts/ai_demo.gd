extends Node

# AI文案演示脚本
# 展示如何将AI文案能力集成到武侠游戏中

@onready var ai_writer: AIWriter = $AIWriter
@onready var ai_config: AIConfig = $AIConfig

# 武侠角色配置
var characters: Dictionary = {
    "令狐冲": {
        "name": "令狐冲",
        "role": "华山派大弟子",
        "personality": "放荡不羁，重情重义",
        "style": "潇洒飘逸"
    },
    "任盈盈": {
        "name": "任盈盈",
        "role": "日月神教圣姑",
        "personality": "聪慧美丽，柔情似水",
        "style": "温婉典雅"
    },
    "岳不群": {
        "name": "岳不群",
        "role": "华山派掌门",
        "personality": "道貌岸然，野心勃勃",
        "style": "虚伪深沉"
    }
}

func _ready():
    # 连接AI响应信号
    ai_writer.connect("ai_response_received", _on_ai_response)
    ai_writer.connect("ai_error", _on_ai_error)
    
    # 加载配置
    ai_config.load_config()
    
    print("=== AI文案系统演示 ===")
    print("当前服务: ", ai_config.get_current_service_name())
    print("=")

# 示例1: 生成场景描述
func generate_scene():
    ai_writer.generate_scene_description("华山之巅")

# 示例2: 生成角色台词
func generate_line(character_name: String, emotion: String, situation: String):
    if characters.has(character_name):
        ai_writer.generate_character_line(characters[character_name], emotion, situation)
    else:
        print("角色不存在: ", character_name)

# 示例3: 生成武侠对话
func generate_dialog(prompt: String, character: String = "", context: String = ""):
    ai_writer.generate_wuxia_dialog(prompt, character, context)

# 示例4: 直接调用生成任意内容
func generate_custom(prompt: String):
    ai_writer.generate_content(prompt)

# 处理AI响应
func _on_ai_response(text: String):
    print("\n【AI生成内容】")
    print(text)
    print("-" * 50)
    
    # 可以在这里将生成的内容传递给对话系统
    # dialog_system.start_dialog([{"speaker": "AI", "text": text}])

# 处理AI错误
func _on_ai_error(error: String):
    print("\n【AI错误】")
    print(error)
    print("-" * 50)

# 测试函数
func test_ai_writer():
    print("\n--- 测试1: 生成场景描述 ---")
    generate_scene()
    
    # 延迟后测试其他功能
    await get_tree().create_timer(5.0).timeout
    
    print("\n--- 测试2: 生成令狐冲台词 ---")
    generate_line("令狐冲", "豪迈", "在酒馆与朋友饮酒")
    
    await get_tree().create_timer(5.0).timeout
    
    print("\n--- 测试3: 生成武侠对话 ---")
    generate_dialog("请写一段令狐冲与任盈盈在竹林中相遇的对话", "令狐冲", "竹林幽静，月光如水")