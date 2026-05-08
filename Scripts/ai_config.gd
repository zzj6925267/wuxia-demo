extends Node

class_name AIConfig

# AI服务提供商枚举
enum AIService {
    WENXIN_YIYAN,
    DOUBAO,
    TONGYI_QIANWEN,
    OPENAI
}

# 配置数据
var config: Dictionary = {
    "service": AIService.WENXIN_YIYAN,
    "api_key": "",
    "secret_key": "",
    "temperature": 0.8,
    "max_tokens": 500
}

# 各服务商的API配置
var service_configs: Dictionary = {
    AIService.WENXIN_YIYAN: {
        "name": "文心一言",
        "api_url": "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions",
        "token_url": "https://aip.baidubce.com/oauth/2.0/token",
        "model": "eb-instant"
    },
    AIService.DOUBAO: {
        "name": "豆包",
        "api_url": "https://api.doubao.com/v1/chat/completions",
        "token_url": "",
        "model": "Doubao"
    },
    AIService.TONGYI_QIANWEN: {
        "name": "通义千问",
        "api_url": "https://dashscope.aliyuncs.com/api/text-generation/generation",
        "token_url": "",
        "model": "qwen-turbo"
    },
    AIService.OPENAI: {
        "name": "OpenAI",
        "api_url": "https://api.openai.com/v1/chat/completions",
        "token_url": "",
        "model": "gpt-3.5-turbo"
    }
}

func get_current_service_name() -> String:
    return service_configs[config.service].name

func get_api_url() -> String:
    return service_configs[config.service].api_url

func get_model() -> String:
    return service_configs[config.service].model

func save_config(file_path: String = "user://ai_config.json"):
    var file = FileAccess.open(file_path, FileAccess.WRITE)
    if file:
        var json = JSON.new()
        file.write_string(json.stringify(config))
        file.close()
        print("AI配置已保存")

func load_config(file_path: String = "user://ai_config.json"):
    var file = FileAccess.open(file_path, FileAccess.READ)
    if file:
        var json_content = file.get_as_text()
        file.close()
        var json = JSON.new()
        if json.parse(json_content) == OK:
            config = json.data
            print("AI配置已加载")