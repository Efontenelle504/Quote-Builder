# syntax=docker/dockerfile:1.7
FROM node:20-alpine AS base
WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend/tsconfig.json ./
COPY backend/prisma ./prisma
COPY backend/prisma.config.ts ./prisma.config.ts
COPY backend/src ./src
COPY public ./public

ENV DATABASE_URL="postgresql://postgres:postgres@postgres:5432/zuppardos_quote?schema=public"
RUN npx prisma generate
RUN npm run build

EXPOSE 4000
CMD ["node", "dist/index.js"]
