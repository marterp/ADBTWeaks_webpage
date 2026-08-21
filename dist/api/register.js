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

