# Backend Cloud App — FastAPI + Uvicorn
# Base image ringan; layer pip di-cache saat requirements tidak berubah
FROM python:3.12-slim

WORKDIR /app

# Dependency layer (cache-friendly)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Application code
COPY . .

# Non-root user
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
