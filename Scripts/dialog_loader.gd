extends Node

func load_story(file_path):
    var file = FileAccess.open(file_path, FileAccess.READ)
    if not file:
        print("Failed to open file: ", file_path)
        return null

    var json_content = file.get_as_text()
    file.close()

    var json = JSON.new()
    var result = json.parse(json_content)
    if result != OK:
        print("JSON parse error: ", json.get_error_message())
        return null

    var story_data = json.data
    if not story_data.has("start"):
        print("Start node key not found in story data.")
        return null

    return story_data