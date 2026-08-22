// ADBTweaks pre-registration backend.
// 1. Create a Google Sheet with a tab named "Registrations".
// 2. Put: Timestamp | Email | Android Version | Device Model in row 1.
// 3. Replace REGISTRATION_SECRET below with your own long random value.
// 4. Deploy as Web app: Execute as Me, Who has access: Anyone.
// 5. Put the deployment /exec URL and the same secret into Vercel.

const REGISTRATION_SECRET = 'CHANGE_THIS_TO_YOUR_SECRET';
const SHEET_NAME = 'Registrations';
const ALLOWED_ANDROID_VERSIONS = new Set([
  'android-10', 'android-11', 'android-12', 'android-13',
  'android-14', 'android-15', 'android-16'
]);
const MAX_EMAIL_LENGTH = 254;
const MAX_DEVICE_MODEL_LENGTH = 80;

function json(output) {
  return ContentService
    .createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

function clean(value) {
  const text = String(value || '').replace(/[\u0000-\u001F\u007F]/g, '').trim();
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function doPost(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};

    if (String(params.secret || '') !== REGISTRATION_SECRET) {
      return json({ ok: false, status: 403, error: 'Forbidden' });
    }

    const email = normalizeEmail(params.email);
    const androidVersion = String(params.android_version || '').trim().toLowerCase();
    const deviceModel = String(params.device_model || '').trim();

    if (!email || email.length > MAX_EMAIL_LENGTH || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ ok: false, status: 400, error: 'Invalid email' });
    }

    if (!ALLOWED_ANDROID_VERSIONS.has(androidVersion)) {
      return json({ ok: false, status: 400, error: 'Invalid Android version' });
    }

    if (deviceModel.length > MAX_DEVICE_MODEL_LENGTH) {
      return json({ ok: false, status: 400, error: 'Device model too long' });
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);

    try {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
      if (!sheet) {
        return json({ ok: false, status: 500, error: 'Sheet not found' });
      }

      const lastRow = sheet.getLastRow();
      if (lastRow >= 2) {
        const emails = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
        const exists = emails.some(row => normalizeEmail(row[0]) === email);
        if (exists) {
          return json({ ok: false, status: 409, error: 'Email already registered' });
        }
      }

      sheet.appendRow([
        new Date(),
        clean(email),
        clean(androidVersion),
        clean(deviceModel)
      ]);

      return json({ ok: true, status: 200 });
    } finally {
      lock.releaseLock();
    }
  } catch (error) {
    console.error(error);
    return json({ ok: false, status: 500, error: 'Server error' });
  }
}
