# Deploy & Ops Guide

## Fast deploy (server)
```bash
ssh root@app.zuppardos.bid

cd /root/quote-platform
git pull origin main

docker compose down
docker compose up -d postgres
docker compose run --rm backend npx prisma migrate deploy
docker compose run --rm backend npx prisma db seed
docker compose up -d --build
```

## Health checks
```bash
# App health
curl http://localhost:4000/health

# Product API sanity (should return CSV)
curl http://localhost:4000/api/products/export/csv | head

# GoHighLevel integration health
curl http://localhost:4000/api/crm/health
```

## Logs
```bash
cd /root/quote-platform
docker compose logs -n 100 backend
docker compose logs -n 100 postgres
```

## Notes
- Make sure `backend/.env` on the server has the correct secrets (DB, GOHIGHLEVEL_API_KEY, GOHIGHLEVEL_LOCATION_ID, etc.).
- Seeding is idempotent; it updates products by slug without deleting existing rows.
- Auth is currently disabled for non-admin routes; `/api/admin/users` remains protected.
