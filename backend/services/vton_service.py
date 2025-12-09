import os
import json
import requests
import google.auth
from google.auth.transport.requests import Request
from google.oauth2 import service_account

PROJECT_ID = "vital-octagon-19612"
LOCATION = "us-central1" # VTON is usually in us-central1
MODEL_NAME = "virtual-try-on-preview-08-04"

class VTONService:
    def __init__(self):
        self.credentials, self.project = google.auth.default(
            scopes=["https://www.googleapis.com/auth/cloud-platform"]
        )
        self.auth_req = Request()

    def try_on(self, person_image_bytes: bytes, garment_image_bytes: bytes, category: str = "tops") -> bytes:
        print(f"VTON try_on called with person_image_bytes: {len(person_image_bytes)} bytes, garment_image_bytes: {len(garment_image_bytes)} bytes")
        
        # Refresh credentials if needed
        self.credentials.refresh(self.auth_req)
        token = self.credentials.token

        url = f"https://{LOCATION}-aiplatform.googleapis.com/v1/projects/{PROJECT_ID}/locations/{LOCATION}/publishers/google/models/{MODEL_NAME}:predict"

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json; charset=utf-8",
        }

        # Construct the payload
        # Based on standard Vertex AI VTON payload structure
        import base64
        person_b64 = base64.b64encode(person_image_bytes).decode("utf-8")
        garment_b64 = base64.b64encode(garment_image_bytes).decode("utf-8")

        payload = {
            "instances": [
                {
                    "personImage": {
                        "image": {
                            "bytesBase64Encoded": person_b64
                        }
                    },
                    "productImages": [
                        {
                            "image": {
                                "bytesBase64Encoded": garment_b64
                            }
                        }
                    ]
                }
            ]
        }

        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code != 200:
            raise Exception(f"VTON API failed with status {response.status_code}: {response.text}")

        response_json = response.json()
        
        # Parse response
        # Expected response structure:
        # {
        #   "predictions": [
        #     "bytesBase64EncodedString..." 
        #   ]
        # }
        # OR
        # {
        #   "predictions": [
        #     {
        #       "bytesBase64Encoded": "..."
        #     }
        #   ]
        # }
        
        predictions = response_json.get("predictions")
        if not predictions:
             raise Exception(f"No predictions in response: {response.text}")

        # Vertex AI VTON usually returns the image bytes directly or in a struct
        prediction = predictions[0]
        
        if isinstance(prediction, str):
            return base64.b64decode(prediction)
        elif isinstance(prediction, dict) and "bytesBase64Encoded" in prediction:
            return base64.b64decode(prediction["bytesBase64Encoded"])
        elif isinstance(prediction, dict) and "image" in prediction:
             # Some models return { "image": { "bytesBase64Encoded": "..." } }
             image_data = prediction["image"]
             if isinstance(image_data, dict) and "bytesBase64Encoded" in image_data:
                 return base64.b64decode(image_data["bytesBase64Encoded"])
        
        # Fallback debug
        raise Exception(f"Unexpected prediction format: {prediction}")

