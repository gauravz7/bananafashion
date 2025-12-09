import os
import sys

# Add current directory to path so we can import backend
sys.path.append(os.getcwd())

from backend.services.vton_service import VTONService

def main():
    person_path = "media/local-user/4414a2f1-d41d-452c-a126-173450935910.png"
    garment_path = "media/local-user/61dba348-3549-42bf-a007-8d9c96af96f3.png"
    output_path = "test_vton_result.png"

    if not os.path.exists(person_path):
        print(f"Error: Person image not found at {person_path}")
        return
    if not os.path.exists(garment_path):
        print(f"Error: Garment image not found at {garment_path}")
        return

    print(f"Loading person image from {person_path}...")
    with open(person_path, "rb") as f:
        person_bytes = f.read()
    
    print(f"Loading garment image from {garment_path}...")
    with open(garment_path, "rb") as f:
        garment_bytes = f.read()

    print("Initializing VTON Service...")
    service = VTONService()

    print("Calling try_on...")
    try:
        result_bytes = service.try_on(person_bytes, garment_bytes, category="tops")
        print(f"Success! Received {len(result_bytes)} bytes.")
        
        with open(output_path, "wb") as f:
            f.write(result_bytes)
        print(f"Saved result to {output_path}")
    except Exception as e:
        print(f"Error during VTON: {e}")

if __name__ == "__main__":
    main()
