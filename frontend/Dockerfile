# ============================================================
# Dashboard Telkom TREG 4 Kalimantan — Frontend Image
# Multi-stage build (Modul 6 — Workshop 6.2)
#
# Stage 1: Build React app dengan Node + Vite
# Stage 2: Serve file statis dengan Nginx
#
# Output akhir ~25 MB (vs ~1 GB kalau single-stage).
# ============================================================


# ------------------------------------------------------------
# STAGE 1 — Builder
# ------------------------------------------------------------
FROM node:18-alpine AS builder

WORKDIR /app

# Salin file dependency lebih dulu supaya layer `npm ci` di-cache
# selama package.json tidak berubah.
COPY package.json package-lock.json* ./

# `npm ci` = clean install, lebih cepat & reproducible daripada
# `npm install`. Wajib ada package-lock.json.
RUN npm ci

# Baru salin sisa source code (layer ini yang paling sering rebuild).
COPY . .

# VITE_API_URL harus di-inject saat build karena Vite mem-bundle
# nilai env ke dalam JS statis. Default diarahkan ke service
# "backend" agar cocok saat dijalankan via docker compose.
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build


# ------------------------------------------------------------
# STAGE 2 — Production (Nginx)
# ------------------------------------------------------------
FROM nginx:alpine

# Hapus config default bawaan image (digantikan milik kita).
RUN rm /etc/nginx/conf.d/default.conf

# Salin hasil build React dari stage builder.
COPY --from=builder /app/dist/ /usr/share/nginx/html/

# Custom config: SPA routing, gzip, security headers.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Jalankan nginx di foreground (wajib untuk container).
CMD ["nginx", "-g", "daemon off;"]
