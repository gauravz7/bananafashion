from google.cloud import storage
import os
import datetime

bucket_name = os.getenv("GCS_BUCKET_NAME", "banana-fashion-assets-vital-octagon-19612")
print(f"Testing bucket: {bucket_name}")

try:
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob("test_public.txt")
    blob.upload_from_string("Hello Public World!")
    
    print("Attempting to make public...")
    try:
        blob.make_public()
        print(f"SUCCESS: Blob made public. URL: {blob.public_url}")
    except Exception as e:
        print(f"FAILURE: make_public failed: {e}")
        
    print("Attempting to generate signed URL...")
    try:
        url = blob.generate_signed_url(version="v4", expiration=datetime.timedelta(minutes=15), method="GET")
        print(f"SUCCESS: Signed URL generated: {url}")
    except Exception as e:
        print(f"FAILURE: generate_signed_url failed: {e}")
        
    # blob.delete()
except Exception as e:
    print(f"FAILURE: Script error: {e}")
