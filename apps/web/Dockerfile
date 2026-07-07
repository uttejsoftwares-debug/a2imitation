FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY services/api/package*.json ./services/api/
COPY packages/shared/package*.json ./packages/shared/
RUN npm install
COPY . .
RUN npm run build --workspace=apps/web
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace=apps/web"]
