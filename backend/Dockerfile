# Use an official Python runtime as a parent image
FROM python:3.10-slim-buster

# Set the working directory in the container
WORKDIR /app/backend

# Copy the requirements file to the working directory
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu

# Copy the rest of the application's code
COPY . .

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Run the app when the container launches with hot-reloading
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]