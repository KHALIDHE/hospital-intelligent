# ============================================================
# backend/Dockerfile
# ============================================================
# Django REST API container
# Python 3.11 slim — small image size
# ============================================================

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies needed for psycopg2
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (better Docker caching)
# If requirements.txt doesn't change, this layer is cached
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Expose Django port
EXPOSE 8000
