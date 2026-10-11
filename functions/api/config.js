export function onRequestGet({ env }) {
  return Response.json({
    enabled: Boolean(env.RESEND_API_KEY && env.CONTACT_TO && env.CONTACT_FROM && env.RECAPTCHA_SECRET_KEY && env.RECAPTCHA_SITE_KEY && env.RECAPTCHA_HOSTNAMES),
    siteKey: env.RECAPTCHA_SITE_KEY || null
  }, { headers: { 'Cache-Control': 'no-store' } });
}
