extends Control

func _ready():
	print("Dialog System Ready!")
	
	var dialog_box = get_node("DialogBox")
	var vbox = dialog_box.get_node("VBoxContainer")
	var speaker_label = vbox.get_node("SpeakerLabel")
	var text_label = vbox.get_node("TextLabel")
	var choices_container = vbox.get_node("ChoicesContainer")
	
	print("dialog_box:", dialog_box)
	print("vbox:", vbox)
	print("speaker_label:", speaker_label)
	print("text_label:", text_label)
	print("choices_container:", choices_container)
	
	load_story(dialog_box, speaker_label, text_label, choices_container)

func load_story(dialog_box, speaker_label, text_label, choices_container):
	var file_path = "res://Data/Story/chapter1.json"
	var file = FileAccess.open(file_path, FileAccess.READ)
	
	var story_data = {}
	
	if not file:
		print("Failed to open story file:", file_path)
		story_data = {
			"start": "intro",
			"intro": {"speaker": "旁白", "text": "江湖风云再起！"},
			"meeting": {"speaker": "老者", "text": "年轻人，你来了。", "choices": [{"text": "继续", "goto": "ending"}]},
			"ending": {"speaker": "黄药师", "text": "这是一本武林秘籍！"}
		}
	else:
		var json_content = file.get_as_text()
		file.close()
		var json = JSON.new()
		if json.parse(json_content) == OK:
			story_data = json.data
			print("Story loaded!")
		else:
			print("JSON parse error!")
	
	show_node(story_data, story_data.get("start", "intro"), dialog_box, speaker_label, text_label, choices_container)

func show_node(story_data, node_name, dialog_box, speaker_label, text_label, choices_container):
	var current_node = story_data.get(node_name, {})
	
	if current_node.is_empty():
		print("Node not found:", node_name)
		return
	
	for child in choices_container.get_children():
		choices_container.remove_child(child)
	
	speaker_label.text = current_node.get("speaker", "")
	text_label.text = current_node.get("text", "")
	
	dialog_box.visible = true
	
	print("Showing:", node_name)

func _input(event):
	if event.is_action_pressed("ui_accept"):
		print("UI accept pressed!")
