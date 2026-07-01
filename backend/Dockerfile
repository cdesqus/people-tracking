FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
# libgomp1  : required by ONNX Runtime (InsightFace) on CPU
# libgl1    : required by OpenCV
# libglib2.0-0 : required by OpenCV
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    python3-dev \
    postgresql-client \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download InsightFace buffalo_sc model weights into the image.
# This avoids a cold-start download (>100MB) on first container run,
# which would block face recognition for several minutes in production.
RUN python3 -c "\
from insightface.app import FaceAnalysis; \
print('Pre-downloading InsightFace buffalo_sc model...'); \
app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider']); \
app.prepare(ctx_id=0, det_size=(320, 320)); \
print('InsightFace model pre-download complete.')"

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p logs uploads

# Expose port
EXPOSE 8000

# Run migrations and start application
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port 8000"]
