extends Node

class_name AIWriter

# AI配置
@export var api_key: String = ""
@export var api_url: String = "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions"
@export var model: String = "eb-instant"

# 信号
signal ai_response_received(text: String)
signal ai_error(error: String)

# 生成武侠风格的文案
func generate_wuxia_dialog(prompt: String, character_name: String = "", context: String = ""):
    var full_prompt = """
    你是一位精通武侠小说创作的大师，请用古风雅致的语言，帮我生成一段武侠风格的对话。
    
    人物：%s
    
    背景：%s
    
    需求：%s
    
    请输出符合武侠风格的对话内容，不要有现代词汇，保持古风韵味。
    """ % [character_name, context, prompt]
    
    _call_ai_api(full_prompt)

# 生成场景描述
func generate_scene_description(location: String, style: String = "古风武侠"):
    var prompt = """
    请描述一个%s风格的%s场景，要求：
    1. 语言优美，富有画面感
    2. 使用古风词汇
    3. 描述细致入微
    4. 字数在100-200字之间
    """ % [style, location]
    
    _call_ai_api(prompt)

# 生成角色台词
func generate_character_line(character: Dictionary, emotion: String, situation: String):
    var prompt = """
    角色信息：
    姓名：%s
    身份：%s
    性格：%s
    
    场景：%s
    情绪：%s
    
    请为这个角色生成一句符合其身份和性格的台词，保持古风武侠风格。
    """ % [character.name, character.role, character.personality, situation, emotion]
    
    _call_ai_api(prompt)

# 通用AI调用
func generate_content(prompt: String):
    _call_ai_api(prompt)

# 内部API调用方法
func _call_ai_api(prompt: String):
    if api_key.empty():
        emit_signal("ai_error", "请配置API Key")
        return
    
    var http_request = HTTPRequest.new()
    add_child(http_request)
    
    var headers = [
        "Content-Type: application/json",
        "Accept: application/json"
    ]
    
    var request_data = {
        "model": model,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.8,
        "max_tokens": 500
    }
    
    var json = JSON.new()
    var body = json.stringify(request_data)
    
    var url = "%s?access_token=%s" % [api_url, api_key]
    
    http_request.request(url, headers, false, HTTPClient.METHOD_POST, body)
    
    http_request.connect("request_completed", _on_request_completed)

func _on_request_completed(result: int, response_code: int, headers: PackedStringArray, body: PackedByteArray):
    var http_request = get_node_or_null("HTTPRequest")
    if http_request:
        http_request.queue_free()
    
    if result != HTTPRequest.RESULT_SUCCESS:
        emit_signal("ai_error", "网络请求失败: " + str(result))
        return
    
    if response_code != 200:
        emit_signal("ai_error", "API返回错误: " + str(response_code))
        return
    
    var json = JSON.new()
    var parse_result = json.parse(body.get_string_from_utf8())
    
    if parse_result != OK:
        emit_signal("ai_error", "JSON解析失败")
        return
    
    var data = json.data
    
    if data.has("result"):
        emit_signal("ai_response_received", data.result.strip_edges())
    elif data.has("choices") and data.choices.size() > 0:
        emit_signal("ai_response_received", data.choices[0].message.content.strip_edges())
    else:
        emit_signal("ai_error", "未知的API返回格式")