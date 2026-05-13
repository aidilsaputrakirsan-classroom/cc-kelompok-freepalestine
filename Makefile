.PHONY: help up down build logs ps clean restart logs-backend shell-backend shell-db \
        compose-config images-build images-tag images-push release-images show-image-sizes \
        lint test pr-check

# Gunakan .env.docker jika ada, fallback ke template agar command tetap bisa dijalankan.
ENV_FILE ?= $(if $(wildcard .env.docker),.env.docker,.env.docker.example)
COMPOSE := docker compose --env-file $(ENV_FILE)

# Registry/image variables (untuk tugas Lead CI/CD modul 6-7)
DOCKERHUB_USERNAME ?= CHANGE_ME
BACKEND_REPO ?= cloudapp-backend
FRONTEND_REPO ?= cloudapp-frontend
BACKEND_TAG ?= v2
FRONTEND_TAG ?= v1
BACKEND_IMAGE ?= $(DOCKERHUB_USERNAME)/$(BACKEND_REPO)
FRONTEND_IMAGE ?= $(DOCKERHUB_USERNAME)/$(FRONTEND_REPO)
LOCAL_BACKEND_IMAGE ?= cloudapp-backend:latest
LOCAL_FRONTEND_IMAGE ?= cloudapp-frontend:latest

help:
	@echo "ENV_FILE=$(ENV_FILE)"
	@echo "DOCKERHUB_USERNAME=$(DOCKERHUB_USERNAME)"
	@echo ""
	@echo "Compose targets:"
	@echo "  make up             # Start semua services"
	@echo "  make build          # Rebuild lalu start"
	@echo "  make ps             # Status services"
	@echo "  make logs           # Logs semua services"
	@echo "  make logs-backend   # Logs backend saja"
	@echo "  make down           # Stop dan remove containers"
	@echo "  make clean          # Down -v + system prune"
	@echo "  make restart        # Restart semua services"
	@echo "  make compose-config # Validasi docker-compose.yml"
	@echo ""
	@echo "Image release targets:"
	@echo "  make images-build   # Build backend+frontend images lokal"
	@echo "  make images-tag     # Tag vX dan latest untuk Docker Hub"
	@echo "  make images-push    # Push tag version + latest"
	@echo "  make release-images # Build + tag + push (pipeline ringkas)"
	@echo "  make show-image-sizes # Lihat ukuran image cloudapp"
	@echo ""
	@echo "PR validation targets:"
	@echo "  make lint           # Lint frontend + cek sintaks backend"
	@echo "  make test           # Jalankan backend test suite (pytest)"
	@echo "  make pr-check       # Compose config + build image + lint + test"
	@echo ""
	@echo "Debug targets:"
	@echo "  make shell-backend  # Masuk shell backend"
	@echo "  make shell-db       # Masuk psql database"

up:
	$(COMPOSE) up -d

build:
	$(COMPOSE) up --build -d

down:
	$(COMPOSE) down

clean:
	$(COMPOSE) down -v
	docker system prune -f

restart:
	$(COMPOSE) restart

logs:
	$(COMPOSE) logs -f

logs-backend:
	$(COMPOSE) logs -f backend

ps:
	$(COMPOSE) ps

compose-config:
	$(COMPOSE) config

shell-backend:
	$(COMPOSE) exec backend sh

shell-db:
	$(COMPOSE) exec db psql -U $${POSTGRES_USER:-postgres} -d $${POSTGRES_DB:-cloudapp}

images-build:
	docker build -t $(LOCAL_BACKEND_IMAGE) ./backend
	docker build -t $(LOCAL_FRONTEND_IMAGE) ./frontend

images-tag:
	@if [ "$(DOCKERHUB_USERNAME)" = "CHANGE_ME" ]; then \
		echo "Set DOCKERHUB_USERNAME sebelum tagging/push."; \
		echo "Contoh: make images-tag DOCKERHUB_USERNAME=usernameanda"; \
		exit 1; \
	fi
	docker tag $(LOCAL_BACKEND_IMAGE) $(BACKEND_IMAGE):$(BACKEND_TAG)
	docker tag $(LOCAL_BACKEND_IMAGE) $(BACKEND_IMAGE):latest
	docker tag $(LOCAL_FRONTEND_IMAGE) $(FRONTEND_IMAGE):$(FRONTEND_TAG)
	docker tag $(LOCAL_FRONTEND_IMAGE) $(FRONTEND_IMAGE):latest

images-push:
	@if [ "$(DOCKERHUB_USERNAME)" = "CHANGE_ME" ]; then \
		echo "Set DOCKERHUB_USERNAME sebelum push."; \
		echo "Contoh: make images-push DOCKERHUB_USERNAME=usernameanda"; \
		exit 1; \
	fi
	docker push $(BACKEND_IMAGE):$(BACKEND_TAG)
	docker push $(BACKEND_IMAGE):latest
	docker push $(FRONTEND_IMAGE):$(FRONTEND_TAG)
	docker push $(FRONTEND_IMAGE):latest

release-images: images-build images-tag images-push

show-image-sizes:
	docker images | (grep cloudapp || true)

lint:
	npm --prefix frontend run lint
	python -m compileall -q backend

test:
	cd backend && pytest test_main.py -v

pr-check: compose-config build lint test
