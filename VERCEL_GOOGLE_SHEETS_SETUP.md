# ADBTweaks Registration — Easy Connection Setup

The website does not need a Google URL in the form, HTML, or client-side JavaScript.
The Google connection is kept inside Vercel's server environment.

## How it works

Website form → Vercel `/api/register` → Google Apps Script → private Google Sheet

## Step 1 — Create the Sheet

Create a Google Sheet and rename the first tab to `Registrations`.

Put these headers in row 1:

`Timestamp | Email | Android Version | Device Model`

Keep the Sheet private.

## Step 2 — Add the Apps Script

In the Sheet open **Extensions → Apps Script**.

Copy `google-apps-script/Code.gs` from this project into the editor.

Change only this line:

`const REGISTRATION_SECRET = 'CHANGE_THIS_TO_A_LONG_RANDOM_SECRET';`

Use a long random secret. Keep it private.

Save.

## Step 3 — Deploy Apps Script

Choose **Deploy → New deployment → Web app**.

Use:

- Execute as: **Me**
- Who has access: **Anyone**

Click **Deploy** and authorize the script.

Copy the Web app `/exec` URL. You only need it for the Vercel server setting; it is not shown on the website.

## Step 4 — Connect Vercel

In Vercel open:

**Project → Settings → Environment Variables**

Add exactly two variables:

### `GOOGLE_APPS_SCRIPT_URL`

Value: the Apps Script `/exec` URL from Step 3.

### `REGISTRATION_SECRET`

Value: exactly the same secret used in `Code.gs`.

No `SITE_URL` setting is required.

## Step 5 — Redeploy

Redeploy the Vercel project after saving the two variables.

## Step 6 — Test

Open the deployed website and submit the registration form.

A successful submission adds a new row to `Registrations`.

Submitting the same email again returns:

`This email is already registered`

## If the form says “Unable to connect”

Check these in order:

1. Apps Script deployment is **Web app**.
2. **Execute as** is **Me**.
3. **Who has access** is **Anyone**.
4. The Vercel `GOOGLE_APPS_SCRIPT_URL` ends in `/exec`.
5. The Vercel `REGISTRATION_SECRET` exactly matches the Apps Script secret.
6. Redeploy Vercel after changing environment variables.
7. Submit the form again after opening the newest deployment.

## Security

- No Google credentials are placed in the website.
- No Google connection URL is exposed in the form UI.
- The shared secret is only in Vercel and Apps Script.
- Input is validated on both sides.
- Duplicate emails are blocked.
- Spreadsheet formula injection is filtered.
