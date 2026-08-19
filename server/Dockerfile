# Сборка сервера приложений для своего сервера (заменяет сборку на Render).
# Двухэтапная: инструменты сборки не попадают в итоговый образ.

FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
# postinstall запускает prisma generate, поэтому схема нужна до установки.
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

# Не от root: если приложение взломают, у злоумышленника не будет прав в системе.
USER node
EXPOSE 4000
CMD ["node", "dist/src/main"]
