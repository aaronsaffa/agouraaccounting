const failure = (status) => Response.json({ accepted: false }, { status, headers: { 'Cache-Control': 'no-store' } });
export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return failure(405);
  const url = new URL(request.url);
  if (request.headers.get('Origin') !== url.origin) return failure(403);
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) return failure(415);
  if (!['RESEND_API_KEY', 'CONTACT_TO', 'CONTACT_FROM', 'RECAPTCHA_SECRET_KEY', 'RECAPTCHA_SITE_KEY', 'RECAPTCHA_HOSTNAMES'].every(key => env[key])) return failure(503);
  let data;
  try {
    const text = await request.text();
    if (text.length > 14000) return failure(413);
    data = JSON.parse(text);
  } catch { return failure(400); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return failure(400);
  const limits = { name: 254, email: 254, message: 5000, phone: 40, token: 4096, website: 254, page: 100, kind: 20 };
  for (const [field, max] of Object.entries(limits)) {
    if (data[field] !== undefined && (typeof data[field] !== 'string' || data[field].length > max)) return failure(400);
  }
  if (data.website) return failure(400);
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || /[\r\n]/.test(data.email)) return failure(400);
  if (!data.token || !['contact','messaging'].includes(data.kind) || !['/','/contact-us','/contact-us/','/contact-us.html'].includes(data.page)) return failure(400);
  if (data.kind === 'messaging' && (!data.name?.trim() || !data.message?.trim() || !data.phone?.trim())) return failure(400);
  try {
    const verification = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST', body: new URLSearchParams({ secret: env.RECAPTCHA_SECRET_KEY, response: data.token }),
      signal: AbortSignal.timeout(8000)
    });
    if (!verification.ok) return failure(502);
    const captcha = await verification.json();
    const hostnames = env.RECAPTCHA_HOSTNAMES.split(',').map(host => host.trim());
    if (!captcha.success || captcha.action !== 'contact' || !(captcha.score >= 0.5) || !hostnames.includes(captcha.hostname)) return failure(403);
    const delivery = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.CONTACT_FROM, to: [env.CONTACT_TO], reply_to: data.email,
        subject: 'Agoura Accounting website inquiry',
        text: `Page: ${data.page}\nForm: ${data.kind}\nName: ${data.name || ''}\nEmail: ${data.email}\nMobile: ${data.phone || ''}\n\n${data.message || ''}`
      }), signal: AbortSignal.timeout(10000)
    });
    if (!delivery.ok) return failure(502);
    const result = await delivery.json();
    if (typeof result.id !== 'string' || !result.id) return failure(502);
    return Response.json({ accepted: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return failure(502); }
}
