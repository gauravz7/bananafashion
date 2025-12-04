import os
from google import genai
from google.genai import types
from google.genai.types import (
    RecontextImageConfig,
    RecontextImageSource,
    ProductImage,
    Image
)

PROJECT_ID = "vital-octagon-19612"
LOCATION = "global"
MODEL_NAME = "virtual-try-on-preview-08-04"

class VTONService:
    def __init__(self):
        self.client = genai.Client(vertexai=True, project=PROJECT_ID, location=LOCATION)

    def try_on(self, person_image_bytes: bytes, garment_image_bytes: bytes, category: str = "tops") -> bytes:
        # category isn't explicitly used in the recontext_image call in the notebook, 
        # but usually VTON models might need it. The notebook example just passes images.
        # We will just pass the images as per the notebook "Recipe 8" and "Virtual Try-On" notebook.
        
        # Note: The notebook uses `Image.from_file` or `Image(gcs_uri=...)`.
        # We need to see if `Image` supports bytes directly or if we need to upload/save temp.
        # Looking at the SDK types, `types.Image` usually has `image_bytes` or similar.
        # Let's check the notebook import: `from google.genai.types import Image`.
        # If `Image` is a Pydantic model, it might accept bytes.
        # However, `types.Part.from_bytes` is used for Gemini.
        # For VTON, the notebook uses `Image.from_file`.
        # Let's try to use `types.Image(image_bytes=...)` if available, or save to temp.
        # To be safe and robust, I will save to temp files if I can't find a bytes method, 
        # but `types.Image` likely supports bytes.
        
        # Actually, looking at `google.genai.types.Image`, it often wraps raw bytes.
        # Let's try `types.Image(image_bytes=person_image_bytes)`.
        
        # Wait, the notebook uses `Image.from_file`.
        # Let's assume we can pass bytes.
        
        person_img = types.Image(image_bytes=person_image_bytes, mime_type="image/jpeg")
        garment_img = types.Image(image_bytes=garment_image_bytes, mime_type="image/jpeg")
        
        response = self.client.models.recontext_image(
            model=MODEL_NAME,
            source=RecontextImageSource(
                person_image=person_img,
                product_images=[
                    ProductImage(product_image=garment_img)
                ],
            ),
            config=RecontextImageConfig(
                output_mime_type="image/jpeg",
                number_of_images=1,
                safety_filter_level="BLOCK_LOW_AND_ABOVE",
            ),
        )
        
        if response.generated_images and response.generated_images[0].image:
             # The response image is likely a `types.Image` object.
             # We need to get bytes from it.
             return response.generated_images[0].image.image_bytes
             
        raise Exception("No VTON image generated")
