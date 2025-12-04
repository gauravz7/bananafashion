import os
from google import genai
from google.genai import types

PROJECT_ID = "vital-octagon-19612"
LOCATION = "global"

class GeminiTextService:
    def __init__(self):
        self.client = genai.Client(vertexai=True, project=PROJECT_ID, location=LOCATION)

    def generate_text(
        self,
        prompt: str,
        model: str = "gemini-experimental",
        temperature: float = 1.0,
        top_p: float = 0.95,
        top_k: int = 40,
        max_output_tokens: int = 8192,
        response_mime_type: str = "text/plain",
        system_instruction: str = None
    ) -> str:
        config = types.GenerateContentConfig(
            temperature=temperature,
            top_p=top_p,
            top_k=top_k,
            max_output_tokens=max_output_tokens,
            response_mime_type=response_mime_type,
            system_instruction=system_instruction
        )
        
        response = self.client.models.generate_content(
            model=model,
            contents=prompt,
            config=config,
        )
        
        return response.text
