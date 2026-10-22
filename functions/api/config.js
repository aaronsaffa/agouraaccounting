export function onRequestGet({ env }) {
  return Response.json({
    enabled: Boolean(env.RESEND_API_KEY && env.CONTACT_TO && env.CONTACT_FROM && env.TURNSTILE_SECRET_KEY && env.TURNSTILE_SITE_KEY && env.TURNSTILE_HOSTNAMES),
    siteKey: env.TURNSTILE_SITE_KEY || null
  }, { headers: { 'Cache-Control': 'no-store' } });
}
