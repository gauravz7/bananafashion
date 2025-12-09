from google import genai
import inspect

client = genai.Client(vertexai=True, project="vital-octagon-19612", location="global")

print("Checking client.models.vertexai...")
try:
    vertexai_attr = client.models.vertexai
    print(f"Type: {type(vertexai_attr)}")
    print(f"Dir: {dir(vertexai_attr)}")
except Exception as e:
    print(f"Error accessing vertexai: {e}")

print("\nChecking generate_images signature...")
try:
    sig = inspect.signature(client.models.generate_images)
    print(f"Signature: {sig}")
except Exception as e:
    print(f"Error getting signature: {e}")

print("\nChecking edit_image signature...")
try:
    sig = inspect.signature(client.models.edit_image)
    print(f"Signature: {sig}")
except Exception as e:
    print(f"Error getting signature: {e}")
