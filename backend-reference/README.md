# Backend reference implementations

Not part of the Expo app. This folder is reference code for `NUTRIFLOW_BACKEND`
(which isn't checked out on this machine) — copy these files into that repo and
wire them up, adjusting to match its actual structure (auth middleware, storage,
etc). Two independent features live here: AI lab-report analyses, and the home
screen's daily article.

## Daily article (`routes/articles.js`)

What the client expects:
- `GET /articles/today` — returns the most recently published article as
  `{ id, title, excerpt?, body, imageUrl?, publishedAt }`. `imageUrl` is
  optional — the app shows a generic icon card when it's missing, exactly like
  "an image if it was added in the admin panel."
- `GET /articles/:id` — same shape, for opening a specific article (used as a
  fallback if the client doesn't already have it cached).
- `POST /articles` — how you publish the day's article. This repo has no admin
  UI, so treat this as a bare curl/Postman call for now:
  ```bash
  curl -X POST https://nutriapi.myoffer.life/api/v1/articles \
    -H "Authorization: Bearer <your admin token>" \
    -H "Content-Type: application/json" \
    -d '{"title": "...", "excerpt": "...", "body": "...", "imageUrl": "https://..."}'
  ```
  Swap `requireAdmin` in the route for whatever role-check this backend uses
  (or just gate it behind your own account's user id to start). If you'll be
  publishing daily by hand, a tiny script or a Postman saved request is enough
  — building a real admin screen isn't required for this to work.
- `db.articles` in the route file stands in for whatever this backend's data
  layer actually is (Prisma/Knex/raw SQL) — swap it for the real thing.

## AI lab-report analysis — what the client expects

`POST /ai/analyses` — `multipart/form-data`, field `file` (a PDF), `Authorization: Bearer <token>` like every other authed route.

Response:
```json
{ "id": "uuid", "pdfUrl": "https://.../ai/analyses/uuid/pdf", "createdAt": "ISO8601", "summary": "optional string" }
```

The client (`src/store/aiAnalysisStore.js` in the NutriFlow app) downloads `pdfUrl`
and stores it on-device. `GET /ai/analyses/:id/pdf` must be reachable with that
same bearer token and return the raw PDF bytes.

## Files

- `routes/articles.js` — Express route for the daily article (see above).
- `routes/ai-analyses.js` — Express route: receives the PDF, calls Gemini, generates
  the report PDF, saves it, returns the JSON the client expects.
- `services/geminiAnalysisService.js` — Calls the Gemini API directly over REST
  (plain `fetch`, no SDK dependency — future-proof against SDK churn) with the
  PDF as inline data. Gemini reads PDFs natively, no OCR step needed.
- `services/reportPdfService.js` — Turns Gemini's structured JSON output into a
  simple PDF report via `pdfkit`.

## Setup

1. `npm install pdfkit multer` (adjust if the backend already has a file-upload
   middleware — reuse that instead of adding multer).
2. Get a free API key at [ai.google.dev](https://ai.google.dev) (Google AI Studio)
   and set `GEMINI_API_KEY` in the backend's `.env`. No credit card needed for
   the free tier.
3. Mount the route in the main app (wherever the other `/auth/*`, `/app/*` routes
   are registered), swapping `requireAuth` for whatever this backend's real auth
   middleware is called — see how `AuthService.js` / existing routes do it.
4. Set `PUBLIC_BASE_URL` (e.g. `https://nutriapi.myoffer.life`) so the returned
   `pdfUrl` is a real, reachable URL.
5. Replace the local-disk storage in `routes/ai-analyses.js` with S3/cloud
   storage if this backend already has one — local disk is fine to start with,
   but won't survive a redeploy on most hosting platforms.

## Free → paid later

Everything here is provider-agnostic on the client side — switching from the
free Gemini tier to the paid one later is just changing `GEMINI_MODEL` /
`GEMINI_API_KEY` (or the request URL, if moving to Vertex AI) in
`geminiAnalysisService.js`. No client changes needed.

**Privacy note**: lab results are health data. Google's free tier may use
submitted content to improve their models (unlike the paid/enterprise tier) —
worth deciding explicitly whether that's acceptable for this feature before
shipping it, rather than defaulting into it.
