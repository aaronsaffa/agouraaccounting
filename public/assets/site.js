'use strict';
const originalError = 'Something went wrong while sending your message, please try again later';
let configuration;
const configReady = fetch('/api/config').then(async response => {
  if (!response.ok) throw new Error('Unavailable');
  configuration = await response.json();
  if (!configuration.enabled || !configuration.siteKey) return;
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(configuration.siteKey)}`;
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
  document.querySelectorAll('[data-recaptcha-disclosure]').forEach(p => { p.hidden = false; p.classList.add('captcha-active'); });
}).catch(() => { configuration = { enabled: false }; });
function initializeForm(form, kind = 'contact') {
  form.querySelectorAll('[data-ux="InputFloatLabel"] > input').forEach(input => {
    const update = () => input.parentElement.classList.toggle('has-value', Boolean(input.value));
    input.addEventListener('input', update);
    update();
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const button = form.querySelector('[type="submit"]');
    const status = form.querySelector('.form-status');
    status.hidden = false;
    status.textContent = 'Sending';
    button.disabled = true;
    try {
      await configReady;
      if (!configuration?.enabled || !window.grecaptcha) throw new Error('Unavailable');
      const token = await new Promise((resolve, reject) => {
        grecaptcha.ready(() => grecaptcha.execute(configuration.siteKey, { action: 'contact' }).then(resolve, reject));
      });
      const payload = Object.fromEntries(new FormData(form));
      Object.assign(payload, { kind, page: location.pathname, token });
      const response = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), signal: AbortSignal.timeout(25000)
      });
      const result = await response.json();
      if (!response.ok || result.accepted !== true) throw new Error('Not accepted');
      status.textContent = "Thanks for the message. We'll get back to you as soon as we can.";
      form.reset();
      form.querySelectorAll('.has-value').forEach(el => el.classList.remove('has-value'));
    } catch {
      status.textContent = originalError;
    } finally {
      button.disabled = false;
    }
  });
}
document.querySelectorAll('form').forEach(form => initializeForm(form));
const launcher = document.querySelector('[data-aid="MESSAGING_FAB"]');
if (launcher) {
  launcher.setAttribute('role', 'button');
  launcher.setAttribute('tabindex', '0');
  launcher.setAttribute('aria-label', 'Contact Agoura Accounting');
  launcher.setAttribute('aria-haspopup', 'dialog');
  const dialog = document.createElement('dialog');
  dialog.className = 'messaging-dialog';
  dialog.setAttribute('aria-labelledby', 'messaging-title');
  dialog.innerHTML = `<button type="button" class="close-dialog" aria-label="Close">×</button>
    <h2 id="messaging-title">Agoura Accounting</h2>
    <p>Hi! Let us know how we can help and we’ll respond shortly.</p>
    <form action="/api/contact" method="post">
      <input name="website" type="text" tabindex="-1" autocomplete="off" hidden>
      <label>Name<input name="name" autocomplete="name" maxlength="254" required></label>
      <label>Mobile<input name="phone" type="tel" autocomplete="tel" maxlength="40" required></label>
      <label>Email<input name="email" type="email" autocomplete="email" maxlength="254" required></label>
      <label>How can we help?<textarea name="message" rows="4" maxlength="5000" required></textarea></label>
      <button type="submit">Send</button>
      <p hidden data-recaptcha-disclosure>This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy">Privacy Policy</a> and <a href="https://policies.google.com/terms">Terms of Service</a> apply.</p>
      <p class="form-status" role="status" aria-live="polite" hidden></p>
    </form>`;
  document.body.append(dialog);
  initializeForm(dialog.querySelector('form'), 'messaging');
  const open = () => dialog.showModal();
  launcher.addEventListener('click', open);
  launcher.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); }
  });
  dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
}
