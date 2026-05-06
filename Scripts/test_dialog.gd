extends Node

# 对话系统示例
class_name DialogSystem

var dialog_text: String = ""
var current_line: int = 0

func show_dialog(text: String):
    dialog_text = text
    current_line = 0
    print("显示对话: ", dialog_text)

func next_line():
    current_line += 1
    print("下一行: ", current_line)