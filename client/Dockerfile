# Build aşaması
FROM node:20-alpine AS builder

WORKDIR /app

# Bağımlılıkları kopyala ve yükle
COPY package*.json ./
RUN npm ci

# Kaynak kodları kopyala
COPY . .

# Next.js için gerekli dizinleri oluştur
RUN mkdir -p public .next

# Uygulamayı derle
RUN npm run build

# Çalışma aşaması
FROM node:20-alpine AS runner

WORKDIR /app

# Bağımlılıkları kopyala
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production

# Next.js için gerekli dosyaları kopyala
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/tsconfig.json ./

# Sağlık kontrolü için wget yükle
RUN apk add --no-cache wget

# Port ve sağlık kontrolü
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

# Geliştirme ortamı için environment değişkeni
ENV NODE_ENV=development

# Uygulamayı başlat
CMD ["npm", "run", "dev"] 