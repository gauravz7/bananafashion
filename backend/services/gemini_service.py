import os
import io
from PIL import Image
from google import genai
from google.genai import types

PROJECT_ID = "vital-octagon-19612"
LOCATION = "global"
MODEL_NAME = "gemini-2.5-flash-image"

class GeminiService:
    def __init__(self):
        self.client = genai.Client(vertexai=True, project=PROJECT_ID, location=LOCATION)
        self.config = types.GenerateContentConfig(
            temperature=1,
            top_p=0.95,
            max_output_tokens=32768,
            response_modalities=["TEXT", "IMAGE"],
        )

    def create_blank_canvas(self, width: int = 1024, height: int = 1024, color: str = "white") -> types.Part:
        image = Image.new("RGB", (width, height), color)
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        return types.Part.from_bytes(data=buffer.getvalue(), mime_type="image/png")

    def generate_image(self, prompt: str, aspect_ratio: str = "1:1") -> bytes:
        # Handle aspect ratio by creating a canvas if needed, or just prompt
        # For simplicity, if aspect ratio is standard, we might rely on model or canvas
        # The notebook uses canvas for aspect ratio control.
        
        aspect_ratios = {
            "1:1": (1024, 1024),
            "3:4": (768, 1024),
            "4:3": (1024, 768),
            "9:16": (720, 1280),
            "16:9": (1280, 720),
        }
        
        width, height = aspect_ratios.get(aspect_ratio, (1024, 1024))
        canvas = self.create_blank_canvas(width, height)
        
        contents = [
            types.Content(role="user", parts=[canvas, types.Part.from_text(text=prompt)])
        ]
        
        response = self.client.models.generate_content(
            model=MODEL_NAME,
            contents=contents,
            config=self.config,
        )
        
        if response.candidates and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                if part.inline_data and part.inline_data.data:
                    return part.inline_data.data
        
        raise Exception(f"No image generated. Response: {response}")

    def edit_image(self, image_bytes: bytes, prompt: str) -> bytes:
        source_image = types.Part.from_bytes(data=image_bytes, mime_type="image/png") # Assuming PNG or JPEG, model handles it
        
        # Enhance prompt for background change if it's not explicit
        # The frontend sends "Describe new background", so we should frame it as an instruction.
        enhanced_prompt = f"Change the background to {prompt}" if "background" not in prompt.lower() else prompt
        
        contents = [
            types.Content(role="user", parts=[source_image, types.Part.from_text(text=enhanced_prompt)])
        ]
        
        response = self.client.models.generate_content(
            model=MODEL_NAME,
            contents=contents,
            config=self.config,
        )
        
        if response.candidates and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                if part.inline_data and part.inline_data.data:
                    return part.inline_data.data
                    
        raise Exception("No image generated")
