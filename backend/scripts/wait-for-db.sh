#!/bin/sh
# ============================================================
# Dashboard Telkom TREG 4 Kalimantan — wait-for-db.sh
# (Modul 6 — Tugas Terstruktur Lead Backend)
#
# Script ini menunggu PostgreSQL siap menerima koneksi sebelum
# menjalankan perintah selanjutnya (biasanya `uvicorn main:app`).
# Dipakai sebagai ENTRYPOINT container backend supaya tidak crash
# saat DB container belum selesai booting.
#
# Cara pakai di Dockerfile:
#     COPY scripts/wait-for-db.sh /usr/local/bin/wait-for-db.sh
#     RUN chmod +x /usr/local/bin/wait-for-db.sh
#     ENTRYPOINT ["/usr/local/bin/wait-for-db.sh"]
#     CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
#
# Variabel yang dibaca (punya default aman):
#     DB_HOST      (default: db)
#     DB_PORT      (default: 5432)
#     DB_USER      (default: postgres)
#     DB_MAX_WAIT  (default: 60 detik)
# ============================================================

set -e

DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_MAX_WAIT="${DB_MAX_WAIT:-60}"

echo "[wait-for-db] Menunggu PostgreSQL di ${DB_HOST}:${DB_PORT} (max ${DB_MAX_WAIT}s)..."

elapsed=0
# `pg_isready` tersedia di image python slim jika dependency
# `postgresql-client` terpasang. Kalau tidak ada, fallback ke
# pengecekan TCP sederhana via /dev/tcp (didukung di sh busybox).
if command -v pg_isready >/dev/null 2>&1; then
    CHECK_CMD="pg_isready -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -q"
else
    CHECK_CMD="nc -z ${DB_HOST} ${DB_PORT}"
fi

until eval "$CHECK_CMD" 2>/dev/null; do
    if [ "$elapsed" -ge "$DB_MAX_WAIT" ]; then
        echo "[wait-for-db] Timeout ${DB_MAX_WAIT}s — PostgreSQL belum siap."
        exit 1
    fi
    sleep 1
    elapsed=$((elapsed + 1))
done

echo "[wait-for-db] PostgreSQL siap setelah ${elapsed}s. Melanjutkan..."
exec "$@"
