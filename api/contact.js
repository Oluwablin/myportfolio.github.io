const EMAILJS_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send';

const requestCounts = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

function getAllowedOrigins() {
  const configured = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Set([
    'https://oyelekeseun.vercel.app',
    'https://oluwablin.github.io',
    ...configured
  ]);
}

function setCorsHeaders(req, res, allowedOrigins) {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitize(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function getClientAddress(req) {
  const forwardedFor = req.headers['x-forwarded-for'];

  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim();
  }

  return 'unknown';
}

function isRateLimited(key) {
  const now = Date.now();
  const current = requestCounts.get(key);

  if (!current || now - current.windowStart > RATE_LIMIT_WINDOW_MS) {
    requestCounts.set(key, { count: 1, windowStart: now });
    return false;
  }

  current.count += 1;
  requestCounts.set(key, current);

  return current.count > RATE_LIMIT_MAX_REQUESTS;
}

export default async function handler(req, res) {
  const allowedOrigins = getAllowedOrigins();
  setCorsHeaders(req, res, allowedOrigins);

  const origin = req.headers.origin;

  if (origin && !allowedOrigins.has(origin)) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if ((req.headers['content-type'] || '').split(';')[0] !== 'application/json') {
    return res.status(415).json({ error: 'Content-Type must be application/json' });
  }

  const {
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    EMAILJS_PUBLIC_KEY,
    EMAILJS_PRIVATE_KEY
  } = process.env;

  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY || !EMAILJS_PRIVATE_KEY) {
    return res.status(500).json({ error: 'Server email configuration is missing' });
  }

  const name = sanitize(req.body?.name, 120);
  const email = sanitize(req.body?.email, 160);
  const subject = sanitize(req.body?.subject, 180);
  const message = sanitize(req.body?.message, 4000);
  const website = sanitize(req.body?.website, 200);

  if (website) {
    return res.status(400).json({ error: 'Invalid form submission' });
  }

  if (isRateLimited(`${getClientAddress(req)}:${email || 'anonymous'}`)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    const emailJsRes = await fetch(EMAILJS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        accessToken: EMAILJS_PRIVATE_KEY,
        template_params: {
          from_name: name,
          from_email: email,
          subject,
          message
        }
      })
    });

    if (!emailJsRes.ok) {
      const details = await emailJsRes.text();
      console.error('EmailJS send failed', details);
      return res.status(502).json({
        error: 'Failed to send message via email provider'
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Contact API error', error);
    return res.status(500).json({
      error: 'Unexpected server error'
    });
  }
}
