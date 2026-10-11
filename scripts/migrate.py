"""Rebuild from the read-only wget capture. No network calls or source writes."""
from pathlib import Path
from urllib.parse import unquote, quote
import hashlib, re, json, shutil
ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / 'agoura-migration/reference-download'
PUBLIC = ROOT / 'public'
manifest = {}
for p in sorted(SOURCE.rglob('*')):
    if not p.is_file(): continue
    rel = p.relative_to(SOURCE).as_posix()
    manifest[rel] = hashlib.sha256(p.read_bytes()).hexdigest()
    if not any(x in rel for x in ('/gfonts/', '/isteam/', 'isteam.wsimg.com/ip/')): continue
    suffix = '.woff2' if p.suffix == '.woff2' else '.png' if '.png/' in rel else '.jpg'
    dest = '/assets/' + hashlib.sha256(rel.encode()).hexdigest()[:16] + suffix
    shutil.copyfile(p, PUBLIC / dest.lstrip('/'))
    manifest[rel] = {'sha256': manifest[rel], 'local': dest}
logo = next(v['local'] for k,v in manifest.items() if 'rs=w:813,h:312' in k)
hero = next(v['local'] for k,v in manifest.items() if 'Rick Horn' in k and k.endswith('rs=w:1920,m'))
def localize(url):
    raw = unquote(url.removeprefix('../').removeprefix('https://').removeprefix('//'))
    entry = manifest.get(raw)
    if isinstance(entry,dict): return entry['local']
    if 'AgouraAccounting_Logo' in raw: return logo
    if 'Rick' in raw and 'OakTree' in raw: return hero
    for name,width,target in [('Recklab_logo','198','recklab-2x.png'),('Recklab_logo','296','recklab-3x.png'),('ea_color','595','enrolled-agent-2x.jpg'),('thervo-2021','200','thervo-2x.jpg')]:
        if name in raw and 'rs=w:'+width+',' in raw: return '/assets/'+target
    for name,target in [('Recklab_logo','recklab.png'),('ea_color','enrolled-agent.jpg'),('thervo-2021','thervo.png')]:
        if name in raw: return '/assets/'+target
    raise ValueError('Uncaptured asset: '+url)
asset_pattern = r'(?:\.\./|https://|//)(?:img1|isteam)\.wsimg\.com/[^\s"\'<>]*'
for name in ['index.html','contact-us.html']:
    s=(SOURCE/'agouraaccounting.com'/name).read_text()
    s=re.sub(r'<script\b[^>]*>.*?</script>', '', s, flags=re.S)
    s=re.sub(r'<meta name="generator"[^>]*>', '', s)
    # Replace lazy placeholders with the actual source before localizing URLs.
    def image(m):
        tag=m.group(0)
        if 'data-srclazy' in tag:
            src=re.search(r'data-srclazy="([^"]+)"',tag)[1]
            srcset=re.search(r'data-srcsetlazy="([^"]+)"',tag)[1]
            tag=re.sub(r'(?<![\w-])src="[^"]*"',lambda _: 'src="'+src+'"',tag)
            tag=re.sub(r'(?<![\w-])srcSet="[^"]*"',lambda _: 'srcset="'+srcset+'"',tag,flags=re.I)
            tag=re.sub(r' data-(?:lazyimg|srclazy|srcsetlazy)="[^"]*"','',tag)
            tag=tag.replace('<img ','<img loading="lazy" ')
        return tag
    s=re.sub(r'<img\b[^>]+>',image,s)
    # srcset URLs contain commas; descriptors are separated by comma + space.
    s=re.sub(asset_pattern,lambda m: localize(m[0].rstrip(',)'))+m[0][len(m[0].rstrip(',)')):],s)
    s=s.replace('href="index.html"','href="/"').replace('href="contact-us.html"','href="/contact-us"').replace('href="manifest.webmanifest"','href="/manifest.webmanifest"')
    s=re.sub(r'(<meta (?:property="og:image"|name="twitter:image") content=")([^"]+)',lambda m:m[1]+'https://agouraaccounting.com'+m[2],s)
    s=re.sub(r'(<form\b)',r'\1 action="/api/contact" method="post"',s)
    def field(m):
        tag=m[0]; aid=re.search(r'data-aid="CONTACT_FORM_(NAME|EMAIL|MESSAGE)"',tag)[1].lower()
        tag=tag.replace(' type="text"',' type="email"' if aid=='email' else ' type="text"')
        return tag.replace(' data-aid=',f' name="{aid}" maxlength="{5000 if aid=="message" else 254}"'+(' required autocomplete="email"' if aid=='email' else ' autocomplete="name"' if aid=='name' else '')+' data-aid=')
    s=re.sub(r'<(?:input|textarea)\b[^>]*data-aid="CONTACT_FORM_(?:NAME|EMAIL|MESSAGE)"[^>]*>',field,s)
    s=s.replace('name="_app_id"','name="website"')
    # Disclosure only appears when configured reCAPTCHA protection is active.
    s=s.replace('<p data-ux="DetailsMinor"','<p data-recaptcha-disclosure data-ux="DetailsMinor"')
    s=s.replace('</form>','<p class="form-status" role="status" aria-live="polite" hidden></p></form>')
    # Hosting attribution no longer describes the platform; retain spacing via its existing container.
    s=re.sub(r'(<p[^>]*data-aid="FOOTER_POWERED_BY_RENDERED"[^>]*>).*?</p>',r'\1<span aria-hidden="true">&nbsp;</span></p>',s)
    s=s.replace('</head>','<link rel="icon" href="'+logo+'"/><link rel="stylesheet" href="/assets/migration.css"/><link rel="canonical" href="https://agouraaccounting.com'+('/' if name=='index.html' else '/contact-us')+'"/></head>')
    s=s.replace('</body>','<script defer src="/assets/font-scaler.js"></script><script defer src="/assets/site.js"></script></body>')
    (PUBLIC/name).write_text(s)
# Preserve the original standalone heading scaling algorithm, without GoDaddy runtime.
script=(SOURCE/'img1.wsimg.com/blobby/go/27aef4ca-5cb6-4765-a9e9-4c2cff8a4ba6/gpub/420dfd68d20a1d2f/script.js').read_text()
start=script.index('window.wsb["DynamicFontScaler"]=')
end=script.index("window.wsb['context-bs-1']")
(PUBLIC/'assets/font-scaler.js').write_text('// Heading sizing retained from the captured page.\nwindow.wsb = {};\n'+script[start:end]+ '\ndocument.fonts.ready.then(() => window.dispatchEvent(new Event("resize")));\n')
wm=json.loads((SOURCE/'agouraaccounting.com/manifest.webmanifest').read_text())
for i in wm['icons']: i['src']=logo; i.pop('sizes',None)
(PUBLIC/'manifest.webmanifest').write_text(json.dumps(wm,indent=2)+'\n')
shutil.copyfile(SOURCE/'agouraaccounting.com/robots.txt',PUBLIC/'robots.txt')
(ROOT/'docs/capture-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Migrated two pages; recorded',len(manifest),'original hashes.')
