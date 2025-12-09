import os
from google.cloud import storage
from backend.services.local_storage_service import LocalStorageService

class GCSStorageService(LocalStorageService):
    def __init__(self):
        super().__init__()
        # Use environment variable or default to a specific bucket
        self.bucket_name = os.getenv("GCS_BUCKET_NAME", "banana-fashion-assets-vital-octagon-19612")
        self.client = storage.Client()
        try:
            self.bucket = self.client.bucket(self.bucket_name)
        except Exception as e:
            print(f"Failed to initialize GCS bucket {self.bucket_name}: {e}")
            self.bucket = None

    def upload_file(self, file_bytes, destination_blob_name, content_type):
        """Uploads a file to GCS."""
        if not self.bucket:
            print("GCS bucket not available, falling back to local storage")
            return super().upload_file(file_bytes, destination_blob_name, content_type)

        try:
            blob = self.bucket.blob(destination_blob_name)
            blob.upload_from_string(file_bytes, content_type=content_type)
            
            # Assuming the bucket is public or we want to use the public link
            # For private buckets, we would need to generate signed URLs
            # blob.make_public() 
            
            return f"https://storage.googleapis.com/{self.bucket_name}/{destination_blob_name}"
        except Exception as e:
            print(f"GCS upload failed: {e}. Falling back to local storage.")
            return super().upload_file(file_bytes, destination_blob_name, content_type)

    def delete_asset(self, user_id, asset_id):
        """Deletes an asset record and tries to delete the file from GCS."""
        # First get the asset to find the URL/path
        file_path = self._get_user_file(user_id, "assets")
        assets = self._read_json(file_path)
        
        asset_to_delete = next((a for a in assets if str(a.get('id')) == str(asset_id)), None)
        
        # Call parent to delete metadata
        success = super().delete_asset(user_id, asset_id)
        
        if success and asset_to_delete and self.bucket:
            try:
                url = asset_to_delete.get('url', '')
                if f"https://storage.googleapis.com/{self.bucket_name}/" in url:
                    # Extract blob name
                    blob_name = url.replace(f"https://storage.googleapis.com/{self.bucket_name}/", "")
                    blob = self.bucket.blob(blob_name)
                    blob.delete()
                    print(f"Deleted GCS blob: {blob_name}")
            except Exception as e:
                print(f"Failed to delete GCS blob: {e}")
                
        return success
