// Exercise the browser controller with a small DOM/Turnstile harness; no live services.
const source = await Deno.readTextFile(new URL('../public/assets/site.js', import.meta.url));
function assert(value, message = 'Assertion failed') { if (!value) throw new Error(message); }
Deno.test('form challenge failure, expiry, retries, provider rejection and success preserve state', async () => {
  const button = {disabled:false, before() {}};
  const status = {};
  let submit, resetCount = 0, removed = 0, options, calls = 0, outcome = 'failure';
  const form = {
    reportValidity: () => true, querySelectorAll: () => [],
    querySelector: selector => selector === '[type="submit"]' ? button : status,
    addEventListener: (_, callback) => {submit = callback;},
    reset: () => {resetCount++;}
  };
  const document = {
    querySelectorAll: () => [form], querySelector: () => null,
    head: {append: () => window.agouraTurnstileReady()},
    createElement: () => ({remove() {}})
  };
  const window = {turnstile: {
    render: (_, config) => {options = config; return 'widget';},
    execute: () => {
      if (outcome === 'failure') options['error-callback']();
      else if (outcome === 'expired') options['expired-callback']();
      else if (outcome === 'timeout') options['timeout-callback']();
      else options.callback('fresh-token');
    },
    remove: () => {removed++;}
  }};
  const fetch = async (url, init) => {
    if (url === '/api/config') return Response.json({enabled:true,siteKey:'public-test-key'});
    calls++;
    assert(JSON.parse(init.body).token === 'fresh-token');
    return Response.json({accepted:outcome === 'accept'}, {status:outcome === 'accept' ? 200 : 502});
  };
  const FakeFormData = class { *[Symbol.iterator]() {yield ['email','visitor@example.com'];} };
  new Function('document','window','fetch','FormData','location',source)(document,window,fetch,FakeFormData,{pathname:'/'});
  for (outcome of ['failure','expired','timeout','reject','accept']) {
    await submit({preventDefault() {}});
    assert(!button.disabled);
    assert(options.action === 'contact');
    assert(options.execution === 'execute' && options.appearance === 'interaction-only');
    assert(resetCount === (outcome === 'accept' ? 1 : 0), 'Input resets only after acceptance');
  }
  assert(calls === 2 && removed === 5, 'Failed challenges never submit; every attempt removes spent widget');
  assert(status.textContent.startsWith('Thanks'));
});
Deno.test('all rendered forms expose the same three required fields without phone', async () => {
  const popup = source.slice(source.indexOf('dialog.innerHTML'), source.indexOf('document.body.append(dialog)'));
  const pages = await Promise.all(['index.html','contact-us.html'].map(name => Deno.readTextFile(new URL(`../public/${name}`, import.meta.url))));
  for (const markup of [...pages, popup]) {
    const controls = [...markup.matchAll(/<(?:input|textarea)\b[^>]*>/g)].map(match => match[0]);
    for (const name of ['name','email','message']) {
      const field = controls.find(control => control.includes(`name="${name}"`));
      assert(field && /\brequired\b/.test(field), `${name} must be required`);
    }
    assert(!controls.some(control => /name="phone"/.test(control)), 'Phone must not be collected');
  }
});
