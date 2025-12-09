from google import genai
import os

try:
    client = genai.Client(vertexai=True, project="vital-octagon-19612", location="global")
    print("Client created.")
    print("client.models attributes:", dir(client.models))
    if hasattr(client, 'imagen'):
        print("client.imagen attributes:", dir(client.imagen))
except Exception as e:
    print(f"Error: {e}")
