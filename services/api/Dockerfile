FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY services/api/package*.json ./services/api/
COPY packages/shared/package*.json ./packages/shared/
RUN npm install
COPY . .
RUN npx prisma generate --workspace=services/api
EXPOSE 4000
CMD ["sh", "-c", "npx prisma db push --workspace=services/api && npm run dev --workspace=services/api"]
