FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY apps/admin/package*.json ./apps/admin/
COPY services/api/package*.json ./services/api/
COPY services/api/prisma ./services/api/prisma
COPY packages/shared/package*.json ./packages/shared/
RUN npm install
COPY . .
RUN npm run build --workspace=apps/admin
EXPOSE 3001
CMD ["npm", "run", "start", "--workspace=apps/admin"]
