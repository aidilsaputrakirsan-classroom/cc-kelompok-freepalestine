# Backend Cloud App — FastAPI + Uvicorn
# Base image ringan; layer pip di-cache saat requirements tidak berubah
FROM python:3.12-slim

WORKDIR /app

# Dependency layer (cache-friendly)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install curl untuk healthcheck (harus sebelum USER non-root)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Application code
COPY . .

# Non-root user (security best practice)
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Healthcheck: cek endpoint /health setiap 30 detik
# Jika gagal 3x berturut-turut, container dianggap unhealthy
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
