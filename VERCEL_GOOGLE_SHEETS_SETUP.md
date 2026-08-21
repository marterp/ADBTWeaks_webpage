# ADBTweaks — Simple Vercel + Google Sheets Setup

This version does not require Google Cloud, a service account, API keys, or a downloaded JSON credential.

## 1. Create the Google Sheet

Create a Google Sheet and rename the first tab to:

`Registrations`

In row 1 enter:

`Timestamp | Email | Android Version | Device Model`

Keep the sheet private.

## 2. Create the Google Apps Script

In the Sheet, open:

**Extensions → Apps Script**

Open `google-apps-script/Code.gs` from this project and paste it into Apps Script.

Change this line:

`const REGISTRATION_SECRET = 'CHANGE_THIS_TO_A_LONG_RANDOM_SECRET';`

Use a long random secret, for example 40+ random characters.

## 3. Deploy the Apps Script

Choose:

**Deploy → New deployment → Web app**

Use:

- Execute as: **Me**
- Who has access: **Anyone**

Deploy and copy the `/exec` URL.

The sheet itself stays private. Only the Apps Script needs access to it.

## 4. Add 3 Vercel variables

Vercel → Project → Settings → Environment Variables:

`GOOGLE_APPS_SCRIPT_URL`

Paste the `/exec` URL.

`REGISTRATION_SECRET`

Paste the exact same secret you put in `Code.gs`.

`SITE_URL`

Your website URL, for example:

`https://adbtweaks.vercel.app`

For a custom domain, use the custom-domain URL instead.

## 5. Deploy the website

Push the project to GitHub or upload it to Vercel and deploy normally.

The form submits to:

`/api/register`

The browser never receives the Google Apps Script URL or registration secret.

## 6. Test

Submit the form once.

A new row should appear in `Registrations`.

Submit the same email again. It should be rejected as already registered.

## Security

The Vercel API:

- accepts POST only;
- checks the website Origin;
- validates email and Android version;
- limits device-model length;
- rejects the hidden honeypot field;
- keeps the Apps Script URL and secret server-side;
- does not expose Google credentials to visitors.

The Apps Script:

- requires the shared secret;
- validates all fields again;
- uses a script lock to prevent duplicate race conditions;
- checks for duplicate emails;
- prevents spreadsheet formula injection;
- writes directly to the private spreadsheet.

Do not put `REGISTRATION_SECRET` in client-side JavaScript or HTML.
