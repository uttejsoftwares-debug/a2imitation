FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY services/api/package*.json ./services/api/
COPY services/api/prisma ./services/api/prisma
COPY packages/shared/package*.json ./packages/shared/
RUN npm install
COPY . .
RUN npx prisma generate --schema=./services/api/prisma/schema.prisma
RUN npm run build --workspace=services/api

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=base /app .
EXPOSE 4000
CMD ["sh", "-c", "npx prisma db push --workspace=services/api && npm run start --workspace=services/api"]
