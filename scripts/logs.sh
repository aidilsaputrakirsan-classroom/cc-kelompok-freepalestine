#!/usr/bin/env bash
# Log helper — Microservices (Modul 14)
# Usage: ./scripts/logs.sh {all|errors|trace <correlation-id>|metrics|export}

set -euo pipefail

COMPOSE="docker compose -f docker-compose.microservices.yml"
GATEWAY_URL="${GATEWAY_URL:-http://localhost:8080}"
SERVICES="auth-service dashboard-service gateway auth-db dashboard-db"

cmd="${1:-}"

case "$cmd" in
  all)
    echo "📋 Following logs (auth, dashboard, gateway, DBs)..."
    $COMPOSE logs -f $SERVICES
    ;;
  errors)
    echo "❌ ERROR-level JSON logs..."
    $COMPOSE logs --no-color $SERVICES 2>&1 | grep '"level":"ERROR"' || true
    ;;
  trace)
    if [ -z "${2:-}" ]; then
      echo "Usage: ./scripts/logs.sh trace <correlation-id>"
      exit 1
    fi
    echo "🔗 Tracing correlation ID: $2"
    $COMPOSE logs --no-color $SERVICES 2>&1 | grep "$2" || true
    ;;
  metrics)
    echo "📊 Fetching metrics via gateway ($GATEWAY_URL)..."
    echo "--- Auth Service ---"
    curl -sf "${GATEWAY_URL}/metrics/auth" | python3 -m json.tool 2>/dev/null || curl -sf "${GATEWAY_URL}/metrics/auth"
    echo ""
    echo "--- Dashboard Service ---"
    curl -sf "${GATEWAY_URL}/metrics/dashboard" | python3 -m json.tool 2>/dev/null || curl -sf "${GATEWAY_URL}/metrics/dashboard"
    echo ""
    ;;
  export)
    OUT="logs/microservices-$(date +%Y%m%d-%H%M%S).log"
    mkdir -p logs
    echo "💾 Exporting to $OUT ..."
    $COMPOSE logs --no-color > "$OUT" 2>&1
    echo "Done."
    ;;
  *)
    echo "Usage: ./scripts/logs.sh {all|errors|trace <id>|metrics|export}"
    exit 1
    ;;
esac
