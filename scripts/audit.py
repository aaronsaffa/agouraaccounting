from pathlib import Path
from html.parser import HTMLParser
import hashlib,json,re
class Audit(HTMLParser):
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  for k in ['src','href','srcset']:
   if k in a and a[k].startswith('/assets/'):
    for v in re.split(r',\s+',a[k]):
     asset=v.split()[0];assert (Path('public')/asset.lstrip('/')).is_file(),asset
for p in Path('public').glob('*.html'):
 s=p.read_text();Audit().feed(s)
 for url in re.findall(r'url\([\"\']?(/assets/[^\"\')]+)',s): assert (Path('public')/url.lstrip('/')).is_file(),url
 assert 'wsimg.com' not in s and 'secureserver.net' not in s and 'godaddy.com' not in s,p
r=Path('../agoura-migration/reference-download');manifest=json.loads(Path('docs/capture-manifest.json').read_text())
for p,d in manifest.items():assert hashlib.sha256((r/p).read_bytes()).hexdigest()==(d['sha256'] if isinstance(d,dict) else d)
print('All 68 original hashes unchanged; HTML and CSS asset references exist; no GoDaddy runtime URLs.')
