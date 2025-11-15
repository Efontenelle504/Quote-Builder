# Zuppardo's Quote Platform

This project bundles a mobile-friendly quote builder, a product/catalog manager, and an API service that stores quotes, synchronizes with GoHighLevel, and renders PDF proposals with the Zuppardo's Renovations theme.

## Stack

- **Backend:** Node.js + Express + Prisma (Postgres)
- **Database:** PostgreSQL 15 (Dockerized)
- **PDF generation:** pdfkit
- **CRM integration:** GoHighLevel REST API
- **Frontend:** Vanilla HTML/JS (mobile-ready quote builder + catalog manager)

## Getting started

1. **Install dependencies** (only needed for local development outside Docker):
   ```bash
   cd quote-platform/backend
   npm install
   ```
2. **Environment variables:** Copy `backend/.env.example` to `backend/.env` and adjust values.
   - `DATABASE_URL` should point to your Postgres instance. When running via Docker, the default works.
   - Set all GoHighLevel values (`GOHIGHLEVEL_API_KEY`, `GOHIGHLEVEL_PIPELINE_ID`, `GOHIGHLEVEL_STAGE_ID`, `GOHIGHLEVEL_USER_ID`). Leave them blank to disable syncing. The API defaults to the **v2** host (`https://services.leadconnectorhq.com`), so keep that in `GOHIGHLEVEL_API_BASE` unless LeadConnector instructs otherwise.
   - (Optional) Set `OPENAI_API_KEY` and `OPENAI_MODEL` (defaults to `gpt-5.0-nano`) if you want the “AI Adjust Scope & Components” button in the builder to work.
   - `QUOTE_STORAGE_DIR` is where generated PDFs are saved.
   - `PUBLIC_DIR` points to the folder that contains the static HTML files. (Defaults to `../public`).
3. **Database migrations + seed data:**
   ```bash
   cd quote-platform/backend
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/zuppardos_quote?schema=public" npm run prisma:migrate
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/zuppardos_quote?schema=public" npm run prisma:seed
   ```
   (When using Docker the `postgres` hostname is available inside the container. From your host you should target `localhost`.)

## Running with Docker

From the `quote-platform` directory:

```bash
docker compose up --build
```

Services:
- `backend` – Express API serving both `/api/*` endpoints and static files from `public/` on port `4000`.
- `postgres` – persistent database with data stored in the `pgdata` volume.

Open http://localhost:4000/final_quote_builder.html for the quote builder, and http://localhost:4000/catalog.html for the catalog/default manager.

### Running locally without Docker

1. Start Postgres (or use an existing instance) and update `DATABASE_URL` to point to it.
2. Run migrations/seed (see above).
3. Start the API:
   ```bash
   cd quote-platform/backend
   npm run dev
   ```
4. Serve the `public/` folder with any static server (or run `npm run dev` which already serves it via Express).

## Frontend apps

### Quote Builder (`public/final_quote_builder.html`)

- Pulls live product templates from `/api/products` and fills the system dropdown.
- Sales reps can add custom products (they are stored via the API, flagged for approval, and automatically become selectable once saved).
- Quick Paste + GHL Lookup button parses clipboard data or fetches a contact via `/api/crm/lookup` (requires GoHighLevel credentials).
- `Save Quote` posts the full state to `/api/quotes`. `Save + Sync GHL` stores the quote and triggers GoHighLevel sync (opportunity + PDF upload) when credentials are present.
- Generated PDFs are saved under `QUOTE_STORAGE_DIR` and downloadable via `/api/quotes/:id/pdf`.

### Catalog Manager (`public/catalog.html`)

- Lists all products (approved + pending) and lets admins edit/approve/delete entries.
- The form supports editing descriptions, scope bullets, warranty language, and tags.
- The Defaults card updates the shared scope/disclaimer templates via `/api/settings/defaults`.

## API overview

- `GET /api/products?includeUnapproved=true` – list product templates.
- `POST /api/products` – create product/custom product.
- `PUT /api/products/:id` – update product.
- `DELETE /api/products/:id` – delete product.
- `GET /api/quotes` / `POST /api/quotes` – list + create quotes.
- `POST /api/quotes/:id/sync` – re-sync an existing quote with GoHighLevel.
- `GET /api/quotes/:id/pdf` – download the generated PDF.
- `POST /api/crm/lookup` – proxy lookup against GoHighLevel (requires API key).
- `POST /api/ai/components` – sends the current scope/components to OpenAI for automatic rewriting (requires `OPENAI_API_KEY`).
- `GET/PUT /api/settings/defaults` – read/update the default scope bullets + disclaimer.

## GoHighLevel integration

Set all GoHighLevel environment variables to enable syncing. When `GOHIGHLEVEL_API_KEY` is empty the server silently skips syncing (quotes are still saved locally). The backend now targets the v2 REST endpoints on `https://services.leadconnectorhq.com/v2`, sending the required `Version: 2021-07-28` header with each request.

## OpenAI integration

Add `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`) to enable the “AI Adjust Scope & Components” button. The backend uses the Responses API and expects JSON describing the updated scope intro, bullets, and components tailored to the job’s square footage.

- `Save + Sync GHL` creates/updates a contact, opportunity, uploads the PDF, and appends a note summarizing the quote total.
- The backend stores `goHighLevelContactId` and `goHighLevelOpportunityId` so you can re-sync later via `POST /api/quotes/:id/sync`.

## Storage

Generated PDFs live under `backend/storage/quotes` (mapped to `/files` via Express and to the `backend_storage` Docker volume). Clean this directory periodically if needed.

## Development tips

- `npm run dev` (backend) uses `ts-node-dev` with hot reload.
- Update Prisma schema -> `npm run prisma:migrate` + `npm run prisma:generate`.
- Frontend files sit in `public/`. Because Express serves them directly, any HTML/JS changes are picked up immediately.
