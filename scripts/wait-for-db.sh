#!/bin/bash
# wait-for-db.sh - Script untuk menunggu PostgreSQL ready

echo "Waiting for PostgreSQL..."
while ! pg_isready -h db -p 5432 -U postgres -q; do
  sleep 1
done
echo "PostgreSQL is ready!"

# Eksekusi command yang diteruskan ke script ini
exec "$@"
