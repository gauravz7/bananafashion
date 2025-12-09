import inspect
from google import genai
from google.genai import types

def search_file(module, query):
    try:
        path = inspect.getfile(module)
        print(f"Searching {path} for '{query}'...")
        with open(path, 'r') as f:
            lines = f.readlines()
            for i, line in enumerate(lines):
                if query in line:
                    print(f"{i+1}: {line.strip()}")
    except Exception as e:
        print(f"Error searching {module}: {e}")

search_file(genai.models, "recontext_image")
search_file(types, "Recontext")
