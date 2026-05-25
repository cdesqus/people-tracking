FROM python:3.10-slim

WORKDIR /app

# Install system dependencies (minimal for headless OpenCV)
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p logs uploads

# Expose port
EXPOSE 8000

# Run migrations and start application
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port 8000"]
