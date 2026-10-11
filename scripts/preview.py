"""Static preview with Cloudflare-style clean URLs. Email deliberately unavailable."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import json
ROOT = Path(__file__).resolve().parents[1] / 'public'
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs): super().__init__(*args,directory=str(ROOT),**kwargs)
    def do_GET(self):
        if self.path == '/api/config':
            self.send_response(200); self.send_header('Content-Type','application/json');self.end_headers()
            self.wfile.write(json.dumps({'enabled':False,'siteKey':None}).encode());return
        if self.path == '/contact-us.html':
            self.send_response(301); self.send_header('Location','/contact-us'); self.end_headers(); return
        if self.path.split('?')[0].rstrip('/') == '/contact-us': self.path='/contact-us.html'
        return super().do_GET()
    def do_POST(self):
        self.send_response(503);self.send_header('Content-Type','application/json');self.end_headers()
        self.wfile.write(b'{"accepted":false}')
print('Preview: http://127.0.0.1:8788',flush=True)
ThreadingHTTPServer(('127.0.0.1',8788),Handler).serve_forever()
