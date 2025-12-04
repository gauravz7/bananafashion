import requests
import os

BASE_URL = "http://localhost:8000"

def test_health():
    print("Testing Health Check...")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Failed: {e}")

def test_generate_image():
    print("\nTesting Generate Image...")
    try:
        data = {"prompt": "A futuristic fashion show with neon lights", "aspect_ratio": "1:1"}
        response = requests.post(f"{BASE_URL}/generate-image", data=data)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("Success! Image received.")
            with open("test_gen.png", "wb") as f:
                f.write(response.content)
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Failed: {e}")

def test_vton():
    print("\nTesting Virtual Try-On...")
    try:
        # Download sample images
        print("Downloading sample images...")
        person_url = "https://storage.googleapis.com/cloud-samples-data/generative-ai/image/man-in-field.png"
        garment_url = "https://storage.googleapis.com/cloud-samples-data/generative-ai/image/sweater.jpg"
        
        person_img = requests.get(person_url).content
        garment_img = requests.get(garment_url).content
        
        files = {
            "person_image": ("person.png", person_img, "image/png"),
            "garment_image": ("garment.jpg", garment_img, "image/jpeg")
        }
        data = {"category": "tops"}
        
        response = requests.post(f"{BASE_URL}/try-on", files=files, data=data)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("Success! VTON image received.")
            with open("test_vton.jpg", "wb") as f:
                f.write(response.content)
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Failed: {e}")

def test_video():
    print("\nTesting Video Generation...")
    try:
        data = {"prompt": "A cinematic drone shot of a beautiful mountain landscape at sunset"}
        # We can also test with image if we want, but text-to-video is simpler for now
        response = requests.post(f"{BASE_URL}/generate-video", data=data)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("Success! Video received.")
            with open("test_video.mp4", "wb") as f:
                f.write(response.content)
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    # test_health()
    # test_generate_image()
    # test_vton()
    test_video()
