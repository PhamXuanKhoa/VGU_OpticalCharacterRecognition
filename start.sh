#!/bin/bash

# Start Nginx in the background
nginx

# Start the FastAPI backend
uvicorn main:app --host 0.0.0.0 --port 8000