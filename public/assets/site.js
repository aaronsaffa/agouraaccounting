'use strict';
const originalError = 'Something went wrong while sending your message, please try again later';
let scriptReady;
async function loadTurnstile() {
  const response = await fetch('/api/config', { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error('Unavailable');
  const configuration = await response.json();
  if (!configuration.enabled || !configuration.siteKey) throw new Error('Unavailable');
  if (!scriptReady) {
    scriptReady = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const timeout = setTimeout(() => fail(), 15000);
      const fail = () => { clearTimeout(timeout); script.remove(); scriptReady = undefined; reject(new Error('Unavailable')); };
      window.agouraTurnstileReady = () => { clearTimeout(timeout); resolve(); };
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=agouraTurnstileReady&render=explicit';
      script.onerror = fail;
      document.head.append(script);
    });
  }
  await scriptReady;
  return configuration;
}
function initializeForm(form, kind = 'contact') {
  form.querySelectorAll('[data-ux="InputFloatLabel"] > input').forEach(input => {
    const update = () => input.parentElement.classList.toggle('has-value', Boolean(input.value));
    input.addEventListener('input', update);
    update();
  });
  let submitting = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting || !form.reportValidity()) return;
    submitting = true;
    const button = form.querySelector('[type="submit"]');
    const status = form.querySelector('.form-status');
    status.hidden = false;
    status.textContent = 'Sending';
    button.disabled = true;
    let widget;
    let container;
    let challengeTimer;
    try {
      const configuration = await loadTurnstile();
      container = document.createElement('div');
      container.className = 'turnstile-container';
      button.before(container);
      status.textContent = 'Verifying. Please complete the security check if prompted.';
      const token = await new Promise((resolve, reject) => {
        const fail = () => reject(new Error('Verification failed'));
        challengeTimer = setTimeout(fail, 120000);
        widget = window.turnstile.render(container, {
          sitekey: configuration.siteKey, action: kind,
          execution: 'execute', appearance: 'interaction-only', size: 'flexible',
          'response-field': false, retry: 'never', 'refresh-expired': 'never',
          callback: resolve, 'error-callback': fail,
          'expired-callback': fail, 'timeout-callback': fail
        });
        window.turnstile.execute(widget);
      });
      clearTimeout(challengeTimer);
      status.textContent = 'Sending';
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
      clearTimeout(challengeTimer);
      if (widget !== undefined) window.turnstile.remove(widget);
      container?.remove();
      submitting = false;
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
    <p class="messaging-welcome">Hi! Let us know how we can help and we’ll respond shortly.</p>
    <form action="/api/contact" method="post">
      <input name="website" type="text" tabindex="-1" autocomplete="off" hidden>
      <label>Name*<input name="name" autocomplete="name" maxlength="254" required></label>
      <label>Email*<input name="email" type="email" autocomplete="email" maxlength="254" required></label>
      <label>How can we help?*<textarea name="message" rows="4" maxlength="5000" required></textarea></label>
      <button type="submit">Send</button>
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
