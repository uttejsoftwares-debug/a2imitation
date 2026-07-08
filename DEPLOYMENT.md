# Deployment Guide

This repository contains a Next.js storefront (`apps/web`), an Express API (`services/api`), and a Postgres database.

## Recommended production setup

Use Docker Compose to run the stack in production.

### 1. Prepare a server

- Provision a Linux VPS or cloud VM (DigitalOcean, Hetzner, AWS EC2, etc.)
- Install Docker and Docker Compose

### 2. Copy the repo and environment

- Clone the repo on the server
- Copy `.env.example` to `services/api/.env`
- Set values for:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `JWT_REFRESH_SECRET`
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_REDIRECT_URI`
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`
  - SMTP settings (optional)
  - `WHATSAPP_NUMBER`

### 3. Update `docker-compose.yml`

For production, use a real DB service or managed Postgres instead of the local `postgres` container if needed.

Example service values:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_DB: a2jewels
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build:
      context: .
      dockerfile: services/api/Dockerfile
    environment:
      PORT: 4000
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
      GOOGLE_REDIRECT_URI: ${GOOGLE_REDIRECT_URI}
      RAZORPAY_KEY_ID: ${RAZORPAY_KEY_ID}
      RAZORPAY_KEY_SECRET: ${RAZORPAY_KEY_SECRET}
      SMTP_HOST: ${SMTP_HOST}
      SMTP_PORT: ${SMTP_PORT}
      SMTP_SECURE: ${SMTP_SECURE}
      SMTP_USER: ${SMTP_USER}
      SMTP_PASS: ${SMTP_PASS}
      EMAIL_FROM: ${EMAIL_FROM}
      WHATSAPP_NUMBER: ${WHATSAPP_NUMBER}
    ports:
      - "4000:4000"
    depends_on:
      - postgres

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: http://api:4000
    ports:
      - "3000:3000"
    depends_on:
      - api

volumes:
  postgres_data:
```

### 4. Deploy

Run:

```bash
docker compose up -d --build
```

Then open `http://your-server-ip`.

### 5. Point your domain to the server

Create these DNS records for your domain `a2imitation.in`:

- `A` record: `a2imitation.in` -> your server IP
- `A` record: `www.a2imitation.in` -> your server IP

The included Nginx config will serve the storefront on the domain and proxy `/api/*` to the API service.

### 6. Enable HTTPS

Place your TLS certificate and private key in `nginx/certs/` as:

- `nginx/certs/fullchain.pem`
- `nginx/certs/privkey.pem`

Then update `nginx/default.conf` to enable the `443 ssl` listener.

### 5. Use HTTPS

Add an Nginx or Traefik reverse proxy and obtain SSL certificates with Let's Encrypt.

### Notes

- `services/api/Dockerfile` currently builds and starts the API in production mode.
- Ensure `GOOGLE_REDIRECT_URI` matches exactly the URL registered in Google Cloud Console.
- If you want, I can also add an Nginx reverse proxy config or a Render/Railway deployment guide.
