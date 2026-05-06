extends Control

# 完整的对话系统
class_name DialogSystemUI

# UI 元素
@onready var dialog_box: Panel = $DialogBox
@onready var speaker_name: Label = $DialogBox/SpeakerName
@onready var dialog_text: RichTextLabel = $DialogBox/DialogText
@onready var continue_button: Button = $DialogBox/ContinueButton

# 对话数据
var dialog_data: Array = []
var current_index: int = 0
var is_typing: bool = false
var typing_speed: float = 0.05

# 信号
signal dialog_ended()
signal dialog_started()

func _ready():
    continue_button.connect("pressed", _on_continue_pressed)
    hide()

func start_dialog(dialog_array: Array):
    dialog_data = dialog_array
    current_index = 0
    show()
    emit_signal("dialog_started")
    show_next_line()

func show_next_line():
    if current_index >= dialog_data.size():
        hide()
        emit_signal("dialog_ended")
        return
    
    var line = dialog_data[current_index]
    speaker_name.text = line.speaker if line.has("speaker") else ""
    dialog_text.text = ""
    continue_button.visible = false
    
    is_typing = true
    _type_text(line.text)

func _type_text(text: String):
    var index = 0
    dialog_text.text = ""
    
    while index < text.length():
        if not is_typing:
            dialog_text.text = text
            break
        
        dialog_text.text += text[index]
        index += 1
        await get_tree().create_timer(typing_speed).timeout
    
    is_typing = false
    continue_button.visible = true

func _on_continue_pressed():
    if is_typing:
        is_typing = false
        return
    
    current_index += 1
    show_next_line()

func skip_dialog():
    hide()
    emit_signal("dialog_ended")