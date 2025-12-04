import os
import json
import time
from pathlib import Path

class LocalStorageService:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.media_dir = Path("media")
        self.data_dir = Path("data")
        
        # Ensure directories exist
        self.media_dir.mkdir(exist_ok=True)
        self.data_dir.mkdir(exist_ok=True)

    def verify_token(self, token):
        """Verifies a token (Mock implementation)."""
        # For local dev, we accept any token or a specific one.
        # We'll return a fixed user or derive one from the token if it's a simple string.
        if not token:
            return None
        
        # Mock user
        return {
            "uid": "local-user",
            "email": "user@example.com",
            "name": "Local User"
        }

    def upload_file(self, file_bytes, destination_blob_name, content_type):
        """Uploads a file to the local media directory."""
        # destination_blob_name might contain folders (e.g. "user_id/uuid.png")
        file_path = self.media_dir / destination_blob_name
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(file_path, "wb") as f:
            f.write(file_bytes)
            
        return f"{self.base_url}/media/{destination_blob_name}"

    def _get_user_file(self, user_id, file_type):
        user_dir = self.data_dir / user_id
        user_dir.mkdir(exist_ok=True)
        return user_dir / f"{file_type}.json"

    def _read_json(self, file_path):
        if not file_path.exists():
            return []
        try:
            with open(file_path, "r") as f:
                return json.load(f)
        except:
            return []

    def _write_json(self, file_path, data):
        with open(file_path, "w") as f:
            json.dump(data, f, indent=2)

    def save_request(self, user_id, request_data):
        """Saves a request record to local JSON."""
        file_path = self._get_user_file(user_id, "requests")
        requests = self._read_json(file_path)
        
        data = {
            'userId': user_id,
            'timestamp': time.time() * 1000, # ms
            **request_data
        }
        requests.append(data)
        self._write_json(file_path, requests)
        return request_data['requestId']

    def save_asset(self, user_id, asset_data):
        """Saves an asset record to local JSON."""
        file_path = self._get_user_file(user_id, "assets")
        assets = self._read_json(file_path)
        
        doc_id = str(len(assets) + 1) # Simple ID generation
        data = {
            'id': doc_id,
            'userId': user_id,
            'createdAt': time.time() * 1000,
            **asset_data
        }
        assets.append(data)
        self._write_json(file_path, assets)
        return doc_id

    def get_assets(self, user_id, asset_type=None):
        """Retrieves assets for a user."""
        file_path = self._get_user_file(user_id, "assets")
        assets = self._read_json(file_path)
        
        if asset_type:
            assets = [a for a in assets if a.get('type') == asset_type]
            
        # Sort by createdAt desc
        assets.sort(key=lambda x: x.get('createdAt', 0), reverse=True)
    def delete_asset(self, user_id, asset_id):
        """Deletes an asset record."""
        file_path = self._get_user_file(user_id, "assets")
        assets = self._read_json(file_path)
        
        # Filter out the asset
        new_assets = [a for a in assets if str(a.get('id')) != str(asset_id)]
        
        if len(new_assets) == len(assets):
            return False # Not found
            
        self._write_json(file_path, new_assets)
        return True
