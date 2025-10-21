import uuid
import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import List, Optional, Dict
from pydantic import BaseModel
import factory

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost"],  # Allow requests from your frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)


class EngineSelection(BaseModel):
    ocr: Optional[str] = "dummy"
    nlp: Optional[str] = "dummy"
    search: Optional[str] = "dummy"
    summarizer: Optional[str] = "dummy"


task_store = {}
TEMP_UPLOAD_DIR = "temp_uploads"

#Apps
@app.on_event("startup")
async def startup_event():
    os.makedirs(TEMP_UPLOAD_DIR, exist_ok=True)
    print(f"Created {TEMP_UPLOAD_DIR}/")

@app.on_event("shutdown")
async def shutdown_event():
    if os.path.exists(TEMP_UPLOAD_DIR):
        shutil.rmtree(TEMP_UPLOAD_DIR)
        print(f"Removed {TEMP_UPLOAD_DIR}/")
    task_store.clear()
    print("Task store cleared.")

#Endpoints
@app.post("/upload-image", summary="Upload an image")
async def upload_image(file: UploadFile = File(...)):
    if file.filename is None:
        raise HTTPException(status_code=400, detail="No filename provided for the uploaded image.")
        
    task_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1] 
    
    temp_file_path = os.path.join(TEMP_UPLOAD_DIR, f"{task_id}{file_extension}")

    try:
        with open(temp_file_path, "wb") as buffer:
            buffer.write(await file.read())
        
        task_store[task_id] = {
            "image_path": temp_file_path,
            "extracted_text": None, "keywords": None,
            "document_links": None, "final_summary": None,
            "status": "uploaded",
            "selected_engines": {
                "ocr": "dummy",
                "nlp": "dummy",
                "search": "dummy",
                "summarizer": "dummy"
            }
        }
        print(f"[{task_id}] Image uploaded.")
        return {"task_id": task_id, "message": "Image uploaded, ready for engine selection."}
    except Exception as e:
        print(f"[{task_id}] Upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {e}")

@app.get("/available-engines", summary="Get a list of all available engines for each step")
async def get_available_engines():
    return {
        "ocr_engines": factory.get_available_ocr_engines(),
        "nlp_engines": factory.get_available_nlp_engines(),
        "search_engines": factory.get_available_search_engines(),
        "summarizer_engines": factory.get_available_summarizer_engines(),
    }

@app.post("/select-engines/{task_id}", summary="Select engines for a specific task")
async def select_engines(task_id: str, engines: EngineSelection):
    if task_id not in task_store:
        raise HTTPException(status_code=404, detail="Task ID not found.")

    task = task_store[task_id]
    # Engines can only be selected/changed if the task is 'uploaded' or 'engines_selected'
    if task["status"] not in ["uploaded", "engines_selected"]:
        raise HTTPException(status_code=409, detail=f"Cannot change engines for task {task_id} in status: {task['status']}. Must be 'uploaded' or 'engines_selected'.")

    # Update selected engines for this task
    task["selected_engines"]["ocr"] = engines.ocr
    task["selected_engines"]["nlp"] = engines.nlp
    task["selected_engines"]["search"] = engines.search
    task["selected_engines"]["summarizer"] = engines.summarizer
    task["status"] = "engines_selected"

    print(f"[{task_id}] Engines selected: {task['selected_engines']}")
    return {"task_id": task_id, "message": "Engines selected successfully.", "selected_engines": task["selected_engines"]}


@app.post("/process-task/{task_id}", summary="Trigger processing pipeline")
async def process_task(task_id: str):
    if task_id not in task_store:
        raise HTTPException(status_code=404, detail="Task ID not found.")

    task = task_store[task_id]
    # Ensure engines have been selected or are at default before processing
    if task["status"] == "uploaded": # If status is still just 'uploaded', use defaults
        print(f"[{task_id}] No engines explicitly selected, using defaults: {task['selected_engines']}")
        task["status"] = "engines_selected" # Transition to this status
    elif task["status"] in ["processing", "completed", "failed"]:
        raise HTTPException(status_code=409, detail=f"Task {task_id} status: {task['status']}")

    task["status"] = "processing"
    print(f"[{task_id}] Starting pipeline with engines: {task['selected_engines']}")

    try:
        # Dynamically get engine instances based on selection stored for this task
        ocr_service = factory.get_ocr_engine(task["selected_engines"]["ocr"])
        nlp_service = factory.get_nlp_engine(task["selected_engines"]["nlp"])
        search_service = factory.get_search_engine(task["selected_engines"]["search"])
        summarizer_service = factory.get_summarizer_engine(task["selected_engines"]["summarizer"])

        task["extracted_text"] = ocr_service.extract_text(task["image_path"])
        print(f"[{task_id}] OCR done.")

        task["keywords"] = nlp_service.find_keywords(task["extracted_text"])
        print(f"[{task_id}] NLP done.")

        task["document_links"] = search_service.find_related_documents(task["keywords"])
        print(f"[{task_id}] Search done.")

        task["final_summary"] = summarizer_service.summarize(task["extracted_text"], task["document_links"])
        print(f"[{task_id}] Summarization done.")

        task["status"] = "completed"
        print(f"[{task_id}] Pipeline completed.")
        return {"task_id": task_id, "message": "Processing completed."}
    except ValueError as ve: # Catch errors from factory if an invalid engine name was selected
        task["status"] = "failed"
        print(f"[{task_id}] Engine selection error: {ve}")
        raise HTTPException(status_code=400, detail=f"Engine selection error: {ve}")
    except Exception as e:
        task["status"] = "failed"
        print(f"[{task_id}] Processing error: {e}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {e}")


def _get_task_result_data(task_id: str, key: str):
    if task_id not in task_store:
        raise HTTPException(status_code=404, detail="Task ID not found.")
    task = task_store[task_id]
    
    if task["status"] != "completed":
        raise HTTPException(status_code=409, detail=f"Task {task_id} not completed. Status: {task['status']}")
    
    result = task.get(key)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Result '{key}' not available for task {task_id}.")
    return {"task_id": task_id, key: result, "engines_used": task["selected_engines"]} # Include engines used

@app.get("/results/{task_id}/extracted-text", summary="Get extracted text")
async def get_extracted_text(task_id: str):
    return _get_task_result_data(task_id, "extracted_text")

@app.get("/results/{task_id}/keywords", summary="Get keywords")
async def get_keywords(task_id: str):
    return _get_task_result_data(task_id, "keywords")

@app.get("/results/{task_id}/document-links", summary="Get document links")
async def get_document_links(task_id: str):
    return _get_task_result_data(task_id, "document_links")

@app.get("/results/{task_id}/summary", summary="Get final summary")
async def get_final_summary(task_id: str):
    return _get_task_result_data(task_id, "final_summary")

@app.get("/tasks/{task_id}/status", summary="Get task status and selected engines")
async def get_task_status(task_id: str):
    if task_id not in task_store:
        raise HTTPException(status_code=404, detail="Task ID not found.")
    task = task_store[task_id]
    return {
        "task_id": task_id,
        "status": task["status"],
        "selected_engines": task["selected_engines"]
    }