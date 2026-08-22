const ALLOWED_ANDROID_VERSIONS = new Set([
  'android-10',
  'android-11',
  'android-12',
  'android-13',
  'android-14',
  'android-15',
  'android-16'
]);

const MAX_DEVICE_MODEL_LENGTH = 80;
const MAX_EMAIL_LENGTH = 254;

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.end(JSON.stringify(body));
}

function originAllowed(req) {
  const origin = req.headers.origin;
  if (!origin) return true;

  try {
    const url = new URL(origin);
    return url.protocol === 'https:' && (url.hostname.endsWith('.vercel.app') || url.hostname === 'localhost' || url.hostname === '127.0.0.1');
  } catch {
    return false;
  }
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function validEmail(email) {
  return email.length <= MAX_EMAIL_LENGTH &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function clean(value) {
  return String(value ?? '').replace(/[\u0000-\u001F\u007F]/g, '').trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok: false, error: 'Method not allowed' });
  }

  if (!originAllowed(req)) {
    return json(res, 403, { ok: false, error: 'Forbidden' });
  }

  const contentType = String(req.headers['content-type'] || '').toLowerCase();
  if (!contentType.includes('application/json')) {
    return json(res, 415, { ok: false, error: 'Unsupported content type' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};

  // Honeypot for basic bots.
  if (clean(body.website) !== '') {
    return json(res, 400, { ok: false, error: 'Invalid submission' });
  }

  const email = normalizeEmail(body.email);
  const androidVersion = clean(body.android_version).toLowerCase();
  const deviceModel = clean(body.device_model);

  if (!validEmail(email)) {
    return json(res, 400, { ok: false, error: 'Enter a valid email address' });
  }

  if (!ALLOWED_ANDROID_VERSIONS.has(androidVersion)) {
    return json(res, 400, { ok: false, error: 'Select a valid Android version' });
  }

  if (deviceModel.length > MAX_DEVICE_MODEL_LENGTH) {
    return json(res, 400, { ok: false, error: 'Device model is too long' });
  }

  const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  const secret = process.env.REGISTRATION_SECRET;

  if (!scriptUrl || !secret) {
    console.error('Missing GOOGLE_APPS_SCRIPT_URL or REGISTRATION_SECRET');
    return json(res, 500, { ok: false, error: 'Registration service is not configured' });
  }

  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: new URLSearchParams({
        secret,
        email,
        android_version: androidVersion,
        device_model: deviceModel
      }).toString()
    });

    const text = await response.text();
    let result = {};
    try {
      result = text ? JSON.parse(text) : {};
    } catch {
      result = { ok: false, error: 'Invalid Apps Script response' };
    }

    if (!response.ok || !result.ok) {
      const status = Number(result.status) || response.status || 500;
      if (status === 409 || /already registered/i.test(String(result.error || result.message || ''))) {
        return json(res, 409, { ok: false, error: 'This email is already registered' });
      }
      console.error('Apps Script registration failed:', status, result.error || result.message || 'unknown error');
      return json(res, 502, { ok: false, error: 'Unable to save your registration right now' });
    }

    return json(res, 200, { ok: true });
  } catch (error) {
    console.error('Registration request failed:', error.message);
    return json(res, 502, { ok: false, error: 'Unable to connect to the registration service' });
  }
}