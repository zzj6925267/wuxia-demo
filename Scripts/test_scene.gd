extends Node2D

@onready var dialog_system: DialogSystemUI = $DialogSystem

# 测试对话数据
var test_dialog = [
    {"speaker": "老者", "text": "年轻人，你来了。江湖险恶，万事小心。"},
    {"speaker": "主角", "text": "多谢前辈指点，晚辈谨记在心。"},
    {"speaker": "老者", "text": "这是一本武林秘籍，你拿去好好修炼。"},
    {"speaker": "", "text": "你获得了【九阳神功】！"}
]

func _ready():
    # 延迟1秒后开始对话
    await get_tree().create_timer(1.0).timeout
    dialog_system.start_dialog(test_dialog)

func _input(event):
    # 按空格继续对话
    if event.is_action_pressed("ui_accept"):
        if dialog_system.visible:
            dialog_system._on_continue_pressed()