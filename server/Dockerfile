# Build aşaması
FROM node:20-alpine AS builder

WORKDIR /app

# Bağımlılıkları kopyala ve yükle
COPY package*.json ./
RUN npm ci

# TypeScript ve ts-node'u global olarak yükle
RUN npm install -g typescript ts-node

# Kaynak kodları kopyala
COPY . .

# TypeScript için gerekli dizini oluştur
RUN mkdir -p dist

# Uygulamayı derle
RUN npm run build

# Çalışma aşaması
FROM node:20-alpine AS runner

WORKDIR /app

# TypeScript ve ts-node'u global olarak yükle
RUN npm install -g typescript ts-node

# Bağımlılıkları kopyala
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Derlenen dosyaları ve yapılandırmaları kopyala
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/server.ts ./

# Sağlık kontrolü için wget yükle
RUN apk add --no-cache wget

# Sağlık kontrolü endpoint'i oluştur
RUN echo 'import express from "express"; const app = express(); app.get("/api/health", (_, res) => res.send("OK")); app.listen(5000);' > health.ts

# Port ve sağlık kontrolü
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

# Geliştirme ortamı için environment değişkeni
ENV NODE_ENV=development
ENV PATH=/app/node_modules/.bin:$PATH

# Uygulamayı başlat
CMD ["ts-node", "server.ts"] 