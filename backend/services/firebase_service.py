import firebase_admin
from firebase_admin import credentials, firestore, storage, auth
import os
import time
import uuid

class FirebaseService:
    def __init__(self):
        # Initialize Firebase Admin SDK
        # Check if already initialized to avoid errors during hot reload
        if not firebase_admin._apps:
            cred_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "serviceAccountKey.json")
            if os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred, {
                    'storageBucket': os.getenv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', 'vital-octagon-19612.appspot.com')
                })
            else:
                print(f"Warning: {cred_path} not found. Attempting to use default credentials.")
                try:
                    firebase_admin.initialize_app(options={
                        'storageBucket': os.getenv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', 'vital-octagon-19612.appspot.com')
                    })
                except Exception as e:
                    print(f"Failed to initialize default app: {e}")
        
        self.db = firestore.client()
        self.bucket = storage.bucket()

    def verify_token(self, token):
        """Verifies a Firebase ID token."""
        try:
            decoded_token = auth.verify_id_token(token)
            return decoded_token
        except Exception as e:
            print(f"Error verifying token: {e}")
            return None

    def upload_file(self, file_bytes, destination_blob_name, content_type):
        """Uploads a file to Firebase Storage, with local fallback."""
        try:
            blob = self.bucket.blob(destination_blob_name)
            blob.upload_from_string(file_bytes, content_type=content_type)
            blob.make_public() # Optional: Make public or use signed URLs
            return blob.public_url
        except Exception as e:
            print(f"Firebase upload failed: {e}. Falling back to local storage.")
            return self.save_local(file_bytes, destination_blob_name)

    def save_local(self, file_bytes, filename):
        """Saves file locally and returns a URL."""
        # Ensure media directory exists
        media_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "media")
        os.makedirs(media_path, exist_ok=True)
        
        # Create user directory if needed
        full_path = os.path.join(media_path, filename)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        
        with open(full_path, "wb") as f:
            f.write(file_bytes)
            
        # Return localhost URL
        # Assuming backend is on port 8000
        return f"http://localhost:8000/media/{filename}"

    def save_request(self, user_id, request_data):
        """Saves a request record to Firestore."""
        doc_ref = self.db.collection('users').document(user_id).collection('requests').document()
        data = {
            'userId': user_id,
            'timestamp': firestore.SERVER_TIMESTAMP,
            **request_data
        }
        doc_ref.set(data)
        return doc_ref.id

    def save_asset(self, user_id, asset_data):
        """Saves an asset record to Firestore."""
        doc_ref = self.db.collection('users').document(user_id).collection('assets').document()
        data = {
            'id': doc_ref.id,
            'userId': user_id,
            'createdAt': firestore.SERVER_TIMESTAMP,
            **asset_data
        }
        doc_ref.set(data)
        return doc_ref.id

    def get_assets(self, user_id, asset_type=None, limit=None):
        """Retrieves assets for a user from Firestore."""
        assets_ref = self.db.collection('users').document(user_id).collection('assets')
        
        query = assets_ref.order_by('createdAt', direction=firestore.Query.DESCENDING)
        
        if asset_type:
            query = query.where('type', '==', asset_type)
            
        if limit:
            query = query.limit(int(limit))
            
        docs = query.stream()
        
        assets = []
        for doc in docs:
            asset = doc.to_dict()
            # Convert timestamp to something JSON serializable if needed, or let FastAPI handle it (Pydantic)
            # Firestore timestamps are objects, we might need to convert to ISO string or int
            if 'createdAt' in asset and asset['createdAt']:
                asset['createdAt'] = asset['createdAt'].timestamp() * 1000
            assets.append(asset)
            
        return assets
    def update_asset(self, user_id, asset_id, updates):
        """Updates an asset record in Firestore."""
        doc_ref = self.db.collection('users').document(user_id).collection('assets').document(asset_id)
        doc_ref.update(updates)
        return True
