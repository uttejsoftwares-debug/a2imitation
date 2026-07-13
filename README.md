# A2 Imitation Jewellery

A premium, production-ready eCommerce platform for A2 Imitation Jewellery built with Next.js, Express, Prisma, and Tailwind CSS.

## Quick start

1. Install dependencies
   ```bash
   npm install
   ```
2. Start the full stack
   ```bash
   npm run dev
   ```
3. Open the storefront at http://localhost:3000 and the API at http://localhost:4000

## Docker

```bash
docker compose up --build
```

## Production deployment

Build and run the stack in detached mode:

```bash
docker compose up -d --build
```

Then point your browser to `http://<server-ip>`.

## GitHub-based deployment

### Frontend on Vercel
- Connect the GitHub repo to Vercel
- Set the root directory to `apps/web`
- Build command: `npm run build`
- Output directory: `.next`
- Add environment variable:
  - `NEXT_PUBLIC_API_URL=https://your-api-url.com`

### API on Render
- Connect the repo to Render
- Use the included `render.yaml`
- Add the same environment variables as in `.env.example`
- Set `DATABASE_URL` to your managed Postgres URL

### Admin panel on Render
- Deploy the admin service with the name `a2imitation-admin`
- Configure a custom domain like `admin.a2imitation.in` for the admin service
- Set `API_INTERNAL_URL` in Render to point to your API service URL

### Domain
- Point `a2imitation.in` and `www.a2imitation.in` to the host provider for the storefront
- Point `admin.a2imitation.in` to the admin service if using a separate admin domain
- Enable HTTPS from the hosting platform
