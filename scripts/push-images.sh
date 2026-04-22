#!/usr/bin/env sh
set -eu

# Release helper untuk tugas Lead CI/CD (Modul 6 & 7):
# - build image backend + frontend
# - tag versi dan latest
# - push ke Docker Hub

DOCKERHUB_USERNAME="${DOCKERHUB_USERNAME:-}"
BACKEND_TAG="${BACKEND_TAG:-v2}"
FRONTEND_TAG="${FRONTEND_TAG:-v1}"
BACKEND_LOCAL_IMAGE="${BACKEND_LOCAL_IMAGE:-cloudapp-backend:latest}"
FRONTEND_LOCAL_IMAGE="${FRONTEND_LOCAL_IMAGE:-cloudapp-frontend:latest}"

if [ -z "$DOCKERHUB_USERNAME" ]; then
  echo "ERROR: set DOCKERHUB_USERNAME terlebih dahulu."
  echo "Contoh:"
  echo "  DOCKERHUB_USERNAME=usernameanda sh scripts/push-images.sh"
  exit 1
fi

BACKEND_REMOTE_IMAGE="$DOCKERHUB_USERNAME/cloudapp-backend"
FRONTEND_REMOTE_IMAGE="$DOCKERHUB_USERNAME/cloudapp-frontend"

echo "==> Building local images..."
docker build -t "$BACKEND_LOCAL_IMAGE" ./backend
docker build -t "$FRONTEND_LOCAL_IMAGE" ./frontend

echo "==> Tagging backend image..."
docker tag "$BACKEND_LOCAL_IMAGE" "$BACKEND_REMOTE_IMAGE:$BACKEND_TAG"
docker tag "$BACKEND_LOCAL_IMAGE" "$BACKEND_REMOTE_IMAGE:latest"

echo "==> Tagging frontend image..."
docker tag "$FRONTEND_LOCAL_IMAGE" "$FRONTEND_REMOTE_IMAGE:$FRONTEND_TAG"
docker tag "$FRONTEND_LOCAL_IMAGE" "$FRONTEND_REMOTE_IMAGE:latest"

echo "==> Pushing backend image..."
docker push "$BACKEND_REMOTE_IMAGE:$BACKEND_TAG"
docker push "$BACKEND_REMOTE_IMAGE:latest"

echo "==> Pushing frontend image..."
docker push "$FRONTEND_REMOTE_IMAGE:$FRONTEND_TAG"
docker push "$FRONTEND_REMOTE_IMAGE:latest"

echo "==> Release selesai."
echo "Backend : $BACKEND_REMOTE_IMAGE:$BACKEND_TAG dan :latest"
echo "Frontend: $FRONTEND_REMOTE_IMAGE:$FRONTEND_TAG dan :latest"
