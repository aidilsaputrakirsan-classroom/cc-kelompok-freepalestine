# Frontend Dashboard Telkom — Multi-stage build (Modul 6)
# Stage 1: Build React app
FROM node:20-alpine AS builder

WORKDIR /app

# Salin file dependency lebih dulu supaya layer `npm ci` di-cache
# selama package.json tidak berubah.
COPY package.json package-lock.json* ./

# `npm ci` = clean install, lebih cepat & reproducible daripada
# `npm install`. Wajib ada package-lock.json.
RUN npm ci

# Baru salin sisa source code (layer ini yang paling sering rebuild).
COPY . .
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
