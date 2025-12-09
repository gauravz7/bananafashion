from google import genai
import inspect
import os

client = genai.Client(vertexai=True, project="vital-octagon-19612", location="global")
models = client.models

print(f"Type of client.models: {type(models)}")
try:
    print(f"File of client.models: {inspect.getfile(type(models))}")
except Exception as e:
    print(f"Could not get file: {e}")

print("\nMethods of client.models:")
for name in dir(models):
    if not name.startswith("_"):
        print(name)

# Check if there is a mixin or base class that might have it
print("\nMRO of client.models:")
for cls in type(models).mro():
    print(cls)
    # Check if this class has recontext_image
    if hasattr(cls, 'recontext_image'):
        print(f"!!! Found recontext_image in {cls} !!!")

# Check types module file
from google.genai import types
print(f"\nFile of types: {inspect.getfile(types)}")
