# ============================================================
# Stage 1: Builder — install dependency ke virtualenv
# ============================================================
FROM python:3.12-alpine AS builder

WORKDIR /app

COPY requirements.txt .

# Simpan semua dependency di venv agar bisa dicopy ke image final
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN pip install --no-cache-dir -r requirements.txt


# ============================================================
# Stage 2: Runtime — hanya venv + source code aplikasi
# ============================================================
FROM python:3.12-alpine

WORKDIR /app

# Runtime package minimum untuk healthcheck
RUN apk add --no-cache curl

COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY . .

# Non-root user (security best practice)
RUN addgroup -S appuser \
    && adduser -S appuser -G appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Healthcheck: cek endpoint /health setiap 30 detik
# Jika gagal 3x berturut-turut, container dianggap unhealthy
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
