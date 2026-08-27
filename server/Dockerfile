# Сборка сервера приложений. Двухэтапная: инструменты сборки не попадают в
# итоговый образ.

FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma

# --ignore-scripts обязателен: postinstall вызывает prisma generate, а сам
# prisma — инструмент разработки и в рабочий образ не ставится. Без этого
# установка падает. Готовый клиент копируем из сборочного слоя.
RUN npm ci --omit=dev --ignore-scripts

COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/dist ./dist

# Не от root: если приложение взломают, прав в системе у злоумышленника не будет.
USER node
EXPOSE 4000
CMD ["node", "dist/src/main"]
