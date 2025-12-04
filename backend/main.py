from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Header, BackgroundTasks
from fastapi.responses import Response, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.services.gemini_service import GeminiService
from backend.services.vton_service import VTONService
from backend.services.video_service import VideoService
from backend.services.local_storage_service import LocalStorageService
import uvicorn
import io
import uuid
import asyncio
import os
import pydantic

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Banana Fashion Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
gemini_service = GeminiService()
vton_service = VTONService()
video_service = VideoService()
# storage_service = LocalStorageService()
from backend.services.firebase_service import FirebaseService
storage_service = FirebaseService()
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

# Make security optional so we don't strictly require the header if we are mocking
security = HTTPBearer(auto_error=False)

# Mount media directory (keep for fallback or temp files if needed)
media_path = os.path.join(os.path.dirname(__file__), "media")
os.makedirs(media_path, exist_ok=True)
app.mount("/media", StaticFiles(directory=media_path), name="media")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        # Fallback for no auth header - maybe return a default or error
        # For now, let's return the old default if absolutely needed, but frontend should send it.
        return {"uid": "123", "email": "mock@example.com"}
    
    token = credentials.credentials
    # In a real app, we would verify_id_token(token).
    # Here, we treat the token AS the uid if it starts with "guest_" or is "mock-token"
    # or just use it as is for simplicity in this dev phase.
    
    return {"uid": token, "email": f"{token}@guest.com"}

@app.get("/")
def health_check():
    return {"status": "ok", "project": "banana-fashion-local"}

import httpx

@app.get("/proxy-image")
async def proxy_image(url: str):
    async with httpx.AsyncClient() as client:
        resp = await client.get(url)
        return Response(content=resp.content, media_type=resp.headers.get("content-type", "image/png"))

@app.get("/assets")
def get_assets(type: str = None, limit: int = None, user: dict = Depends(get_current_user)):
    return storage_service.get_assets(user['uid'], type, limit)


class AssetCreate(pydantic.BaseModel):
    url: str
    type: str

@app.post("/assets")
def create_asset(asset: AssetCreate, user: dict = Depends(get_current_user)):
    return storage_service.save_asset(user['uid'], asset.dict())

class AssetUpdate(pydantic.BaseModel):
    tags: list[str]

@app.put("/assets/{asset_id}")
def update_asset(asset_id: str, updates: AssetUpdate, user: dict = Depends(get_current_user)):
    storage_service.update_asset(user['uid'], asset_id, updates.dict())
    return {"status": "success"}

@app.post("/assets/upload")
async def upload_asset(
    file: UploadFile = File(...),
    type: str = Form(...),
    user: dict = Depends(get_current_user)
):
    try:
        content = await file.read()
        # Simple extension detection
        ext = "png"
        if file.filename and "." in file.filename:
            ext = file.filename.split(".")[-1]
        elif file.content_type == "video/mp4":
            ext = "mp4"
            
        filename = f"{user['uid']}/{uuid.uuid4()}.{ext}"
        public_url = storage_service.upload_file(content, filename, file.content_type or "image/png")
        
        asset_id = storage_service.save_asset(user['uid'], {
            "url": public_url,
            "type": type,
            "category": "user-data",
            "requestId": None
        })
        
        return {"id": asset_id, "url": public_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Generation Endpoints (Multipart/Form-Data) ---

@app.post("/generate-image")
def generate_image(
    background_tasks: BackgroundTasks,
    prompt: str = Form(...),
    aspect_ratio: str = Form("3:4"),
    user: dict = Depends(get_current_user)
):
    try:
        image_bytes = gemini_service.generate_image(prompt, aspect_ratio)
        
        def save_gen_assets(uid, img_bytes, p):
            filename = f"{uid}/{uuid.uuid4()}_gen.png"
            url = storage_service.upload_file(img_bytes, filename, "image/png")
            storage_service.save_asset(uid, {
                "url": url,
                "type": "generated-image",
                "category": "user-generated-data",
                "prompt": p,
                "source": "text-to-image"
            })
            
        background_tasks.add_task(save_gen_assets, user['uid'], image_bytes, prompt)
        
        return Response(content=image_bytes, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi.concurrency import run_in_threadpool

# ... imports ...

@app.post("/try-on")
async def try_on(
    background_tasks: BackgroundTasks,
    person_image: UploadFile = File(...),
    garment_image: UploadFile = File(...),
    category: str = Form("tops"),
    user: dict = Depends(get_current_user)
):
    try:
        person_bytes = await person_image.read()
        garment_bytes = await garment_image.read()

        result_bytes = await run_in_threadpool(vton_service.try_on, person_bytes, garment_bytes, category)
        
        def save_tryon_assets(uid, r_bytes, p_filename, g_filename):
            try:
                # Save Result
                r_filename = f"{uid}/{uuid.uuid4()}_tryon.jpg"
                r_url = storage_service.upload_file(r_bytes, r_filename, "image/jpeg")
                
                # We don't have original URLs anymore since we received bytes.
                # We could upload the inputs if we wanted to persist them as "User Data" if they weren't already,
                # but the frontend likely already uploaded them or selected them.
                # For now, we just save the result.
                
                storage_service.save_asset(uid, {
                    "url": r_url,
                    "type": "try-on-result",
                    "category": "user-generated-data",
                    "source": "try-on-output",
                    "personFilename": p_filename,
                    "garmentFilename": g_filename
                })
            except Exception as e:
                print(f"Error in background save: {e}")
                import traceback
                traceback.print_exc()

        background_tasks.add_task(save_tryon_assets, user['uid'], result_bytes, person_image.filename, garment_image.filename)

        return Response(content=result_bytes, media_type="image/jpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/edit-image")
async def edit_image(
    background_tasks: BackgroundTasks,
    image: UploadFile = File(...),
    prompt: str = Form(...),
    user: dict = Depends(get_current_user)
):
    try:
        image_bytes = await image.read()
        edited_image_bytes = await run_in_threadpool(gemini_service.edit_image, image_bytes, prompt)
        
        def save_edit_assets(uid, edited_bytes, p, input_filename):
            # Save Output
            output_filename = f"{uid}/{uuid.uuid4()}_output.png"
            output_url = storage_service.upload_file(edited_bytes, output_filename, "image/png")
            storage_service.save_asset(uid, {
                "url": output_url,
                "type": "edited-image",
                "category": "user-generated-data",
                "prompt": p,
                "source": "edit-image-output",
                "parentFilename": input_filename
            })

        background_tasks.add_task(save_edit_assets, user['uid'], edited_image_bytes, prompt, image.filename)

        return Response(content=edited_image_bytes, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-video")
async def generate_video(
    background_tasks: BackgroundTasks,
    prompt: str = Form(...),
    image: UploadFile = File(None),
    user: dict = Depends(get_current_user)
):
    try:
        image_bytes = None
        if image:
            image_bytes = await image.read()

        video_bytes = await run_in_threadpool(video_service.generate_video, prompt, image_bytes)
        
        def save_video_assets(uid, vid_bytes, p, input_filename):
            v_filename = f"{uid}/{uuid.uuid4()}.mp4"
            v_url = storage_service.upload_file(vid_bytes, v_filename, "video/mp4")
            storage_service.save_asset(uid, {
                "url": v_url,
                "type": "generated-video",
                "category": "user-generated-data",
                "prompt": p,
                "inputImageFilename": input_filename,
                "source": "text-to-video" if not input_filename else "image-to-video"
            })

        background_tasks.add_task(save_video_assets, user['uid'], video_bytes, prompt, image.filename if image else None)

        return Response(content=video_bytes, media_type="video/mp4")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
