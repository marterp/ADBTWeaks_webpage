# ADBTweaks — Simple Google Sheets Setup

## Google Sheet
1. Create a Google Sheet.
2. Rename the first tab to `Registrations`.
3. Row 1: `Timestamp | Email | Android Version | Device Model`.

## Google Apps Script
1. Open **Extensions → Apps Script**.
2. Paste `google-apps-script/Code.gs`.
3. Change `REGISTRATION_SECRET` to your own random secret.
4. Deploy → New deployment → **Web app**.
5. Execute as **Me**.
6. Who has access: **Anyone**.
7. Copy the URL ending in `/exec`.

## Vercel
Add only these two Environment Variables: `GOOGLE_APPS_SCRIPT_URL` and `REGISTRATION_SECRET`.
- `GOOGLE_APPS_SCRIPT_URL`: your Apps Script `/exec` URL.
- `REGISTRATION_SECRET`: exactly the same secret used in `Code.gs`.

Redeploy Vercel. The website uses `/api/register`; no Google URL is exposed in the frontend.

## Important
Do not add `.env` or real secrets to the ZIP or Git repository.
