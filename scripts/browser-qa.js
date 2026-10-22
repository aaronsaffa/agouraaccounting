// Uses the installed headless browser's Chrome DevTools protocol; no packages.
const targets = await (await fetch('http://127.0.0.1:9222/json/list')).json();
const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(resolve => ws.onopen = resolve);
let seq = 0;
const pending = new Map();
const events = [];
ws.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.id) { const p = pending.get(message.id); pending.delete(message.id); message.error ? p.reject(message.error) : p.resolve(message.result); }
  else events.push(message);
};
function send(method, params = {}) { return new Promise((resolve,reject) => { const id = ++seq; pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params})); }); }
const delay = ms => new Promise(resolve => setTimeout(resolve,ms));
await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
const reports = [];
for (const width of [1440,390]) {
  await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width===390});
  for (const path of ['/','/contact-us']) {
    for (const [label,base] of [['original','https://agouraaccounting.com'],['local','http://127.0.0.1:8788']]) {
      events.length=0;
      await send('Page.navigate',{url:base+path});
      await delay(4500);
      await send('Runtime.evaluate',{expression:'document.fonts.ready',awaitPromise:true});
      // Trigger original lazy-loaded logos, then return to top.
      await send('Runtime.evaluate',{expression:'window.scrollTo(0,document.body.scrollHeight)'});await delay(1500);
      await send('Runtime.evaluate',{expression:'window.scrollTo(0,0)'});await delay(300);
      const result=await send('Runtime.evaluate',{expression:`JSON.stringify({title:document.title,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,text:document.body.innerText,images:[...document.images].filter(i=>getComputedStyle(i).display!=='none').map(i=>({src:i.currentSrc,loaded:i.complete&&i.naturalWidth>0,rect:i.getBoundingClientRect().toJSON(),naturalWidth:i.naturalWidth})),headings:[...document.querySelectorAll('[data-ux="Heading"], [data-ux="HeadingMinor"], [id^="dynamic-tagline"]')].map(i=>({text:i.textContent,font:getComputedStyle(i).fontSize,rect:i.getBoundingClientRect().toJSON()}))})`,returnByValue:true});
      const metrics=JSON.parse(result.result.value);
      await send('Emulation.setDeviceMetricsOverride',{width,height:metrics.height,deviceScaleFactor:1,mobile:width===390});
      await delay(500);
      const screenshot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
      await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width===390});
      const name=`${label}-${width}-${path==='/'?'home':'contact'}`;
      await Deno.writeFile(`artifacts/${name}.png`,Uint8Array.from(atob(screenshot.data),c=>c.charCodeAt(0)));
      const errors=events.filter(e=>e.method==='Runtime.exceptionThrown'||e.method==='Network.loadingFailed'||(e.method==='Network.responseReceived'&&e.params.response.status>=400));
      reports.push({name,metrics,errors});
      console.log(name,JSON.stringify({height:metrics.height,overflow:metrics.scrollWidth>width,missing:metrics.images.filter(i=>!i.loaded),errors:errors.length}));
    }
  }
}
await Deno.writeTextFile('artifacts/browser-report.json',JSON.stringify(reports,null,2));
// Local interactions: invalid/failed submission, messaging dialog, links.
await send('Page.navigate',{url:'http://127.0.0.1:8788/contact-us'});await delay(700);
const interaction=await send('Runtime.evaluate',{expression:`(async()=>{const form=document.querySelector('form');form.querySelector('[name="email"]').value='qa@example.com';form.requestSubmit();await new Promise(r=>setTimeout(r,300));document.querySelector('[data-aid="MESSAGING_FAB"]').click();return {status:form.querySelector('.form-status').textContent,valuesRetained:form.querySelector('[name="email"]').value,dialogOpen:document.querySelector('dialog').open,links:[...document.querySelectorAll('a')].map(a=>a.getAttribute('href'))};})()`,awaitPromise:true,returnByValue:true});
console.log('interactions',JSON.stringify(interaction.result.value));
await Deno.writeTextFile('artifacts/interaction-report.json',JSON.stringify(interaction.result.value,null,2));
const close=await send('Runtime.evaluate',{expression:`(()=>{document.querySelector('.close-dialog').click();return !document.querySelector('dialog').open;})()`,returnByValue:true});
console.log('dialog close',close.result.value);
await send('Runtime.evaluate',{expression:`document.querySelector('[data-ux="NavFooterLink"][href="/"]').click()`});await delay(500);
const navHome=await send('Runtime.evaluate',{expression:'location.pathname',returnByValue:true});
await send('Runtime.evaluate',{expression:`document.querySelector('[href="/contact-us"]').click()`});await delay(500);
const navContact=await send('Runtime.evaluate',{expression:'location.pathname',returnByValue:true});
console.log('navigation',navHome.result.value,navContact.result.value);
console.log('redirect',(await fetch('http://127.0.0.1:8788/contact-us.html',{redirect:'manual'})).status);
ws.close();
