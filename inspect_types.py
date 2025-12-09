from google import genai
from google.genai import types

print("Checking types for RecontextImage...")
for name in dir(types):
    if "Recontext" in name:
        print(f"Found type: {name}")

client = genai.Client(vertexai=True, project="vital-octagon-19612", location="global")
# Check if there is any method that looks like it could be VTON
print("\nChecking client methods...")
for name in dir(client):
    if "recontext" in name.lower() or "try" in name.lower():
        print(f"Found client method: {name}")

print("\nChecking client.models methods again...")
for name in dir(client.models):
    if "recontext" in name.lower() or "try" in name.lower():
        print(f"Found client.models method: {name}")
