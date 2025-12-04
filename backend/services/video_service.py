import os
import time
from google import genai
from google.genai import types

PROJECT_ID = "vital-octagon-19612"
LOCATION = "global"
MODEL_NAME = "veo-3.1-generate-001"

class VideoService:
    def __init__(self):
        self.client = genai.Client(vertexai=True, project=PROJECT_ID, location=LOCATION)

    def generate_video(self, prompt: str, image_bytes: bytes = None) -> bytes:
        # Veo 3.1 supports text-to-video and image-to-video.
        
        image_input = None
        if image_bytes:
            image_input = types.Image(image_bytes=image_bytes, mime_type="image/png")
            
        operation = self.client.models.generate_videos(
            model=MODEL_NAME,
            prompt=prompt,
            image=image_input,
            config=types.GenerateVideosConfig(
                aspect_ratio="16:9",
                resolution="1080p",
                number_of_videos=1,
                duration_seconds=6, # Default to 6s
                person_generation="allow_adult",
                generate_audio=True,
            ),
        )
        
        # Poll for completion
        while not operation.done:
            time.sleep(5)
            operation = self.client.operations.get(operation)
            
        if operation.response and operation.result.generated_videos:
            return operation.result.generated_videos[0].video.video_bytes
            
        raise Exception("No video generated")
