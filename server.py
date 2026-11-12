"""KICK KICK SKIP photo sharing server. Run: python server.py"""
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse
import os,json,base64,secrets,time,io,re,threading
try:
 import qrcode
except ImportError:
 qrcode=None
from PIL import Image
ROOT=Path(__file__).resolve().parent
DATA=Path(os.environ.get('KKS_PHOTO_DIR',str(ROOT.parent/'kks-private-photos'))).resolve()
DATA.mkdir(parents=True,exist_ok=True)
PUBLIC=os.environ.get('KKS_PUBLIC_URL','').rstrip('/')
TTL=86400
MAX_BYTES=8*1024*1024
LOCK=threading.Lock()
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
 def end_headers(self):
  self.send_header('X-Content-Type-Options','nosniff')
  self.send_header('Referrer-Policy','no-referrer')
  if self.path.startswith('/api/'):self.send_header('Cache-Control','no-store')
  super().end_headers()
 def reply(self,status,data,kind='application/json'):
  if isinstance(data,dict):data=json.dumps(data,ensure_ascii=False).encode()
  self.send_response(status);self.send_header('Content-Type',kind);self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data)
 def do_POST(self):
  if self.path!='/api/photos':return self.reply(404,{'error':'not_found'})
  try:
   n=int(self.headers.get('Content-Length','0'))
   if n<=0 or n>MAX_BYTES:return self.reply(413,{'error':'too_large'})
   body=json.loads(self.rfile.read(n));raw=body['image']
   if not raw.startswith('data:image/jpeg;base64,'):raise ValueError()
   image=Image.open(io.BytesIO(base64.b64decode(raw.split(',',1)[1],validate=True)))
   if image.width*image.height>12000000:raise ValueError()
   image=image.convert('RGB');buff=io.BytesIO();image.save(buff,'JPEG',quality=94)
   with LOCK:
    files=list(DATA.glob('*.jpg'))
    for f in files:
     if time.time()-f.stat().st_mtime>TTL:f.unlink(missing_ok=True)
    if len(list(DATA.glob('*.jpg')))>=2000:return self.reply(503,{'error':'storage_full'})
    token=secrets.token_hex(24);(DATA/(token+'.jpg')).write_bytes(buff.getvalue())
   # Configure the externally reachable HTTPS base before using QR on phones.
   host=self.headers.get('Host','localhost:8000')
   if not re.fullmatch(r'[a-zA-Z0-9.\-:\[\]]+',host):raise ValueError()
   base=PUBLIC or 'http://'+host
   self.reply(201,{'id':token,'url':base+'/photo.html?id='+token,'expiresAt':int(time.time()+TTL)})
  except (ValueError,KeyError,TypeError,Image.DecompressionBombError):self.reply(400,{'error':'invalid_image'})
  except Exception:self.reply(500,{'error':'upload_failed'})
 def do_GET(self):
  path=urlparse(self.path).path
  if path.endswith('.mp4'):
   f=(ROOT/path.lstrip('/')).resolve()
   if ROOT not in f.parents or not f.is_file():return self.reply(404,{'error':'not_found'})
   size=f.stat().st_size;start=0;end=size-1;partial=False
   value=self.headers.get('Range','');match=re.fullmatch(r'bytes=(\d+)-(\d*)',value)
   if match:
    start=int(match[1]);end=min(int(match[2]) if match[2] else end,end);partial=True
    if start>end:
     self.send_response(416);self.send_header('Content-Range',f'bytes */{size}');self.end_headers();return
   self.send_response(206 if partial else 200);self.send_header('Content-Type','video/mp4');self.send_header('Accept-Ranges','bytes');self.send_header('Content-Length',str(end-start+1))
   if partial:self.send_header('Content-Range',f'bytes {start}-{end}/{size}')
   self.end_headers()
   try:
    with f.open('rb') as video:
     video.seek(start);remaining=end-start+1
     while remaining:
      data=video.read(min(262144,remaining))
      if not data:break
      self.wfile.write(data);remaining-=len(data)
   except (BrokenPipeError,ConnectionResetError):pass
   return
  if path.startswith('/api/photos/'):
   m=re.fullmatch(r'/api/photos/([a-f0-9]{48})(/qr)?',path)
   if not m:return self.reply(404,{'error':'not_found'})
   f=DATA/(m[1]+'.jpg')
   if not f.exists():return self.reply(404,{'error':'not_found'})
   if time.time()-f.stat().st_mtime>TTL:
    f.unlink(missing_ok=True);return self.reply(410,{'error':'expired'})
   if m[2]:
    host=self.headers.get('Host','localhost:8000')
    if not re.fullmatch(r'[a-zA-Z0-9.\-:\[\]]+',host):return self.reply(400,{'error':'invalid_host'})
    url=(PUBLIC or 'http://'+host)+'/photo.html?id='+m[1];buf=io.BytesIO();qrcode.make(url).save(buf,format='PNG');return self.reply(200,buf.getvalue(),'image/png')
   return self.reply(200,f.read_bytes(),'image/jpeg')
  if path.endswith(('.py','.md','.txt')) or '/.' in path:return self.reply(404,{'error':'not_found'})
  return super().do_GET()
 def list_directory(self,path):return self.reply(404,{'error':'not_found'})
 def log_message(self,format,*args):pass

def purge():
 while True:
  with LOCK:
   for f in DATA.glob('*.jpg'):
    if time.time()-f.stat().st_mtime>TTL:f.unlink(missing_ok=True)
  time.sleep(60)
if __name__=='__main__':
 threading.Thread(target=purge,daemon=True).start()
 import argparse
 parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=int(os.environ.get('PORT','8000')));parser.add_argument('--host',default='0.0.0.0');parser.add_argument('--strictPort',action='store_true');args=parser.parse_args()
 port=args.port;print(f'KICK KICK SKIP: http://localhost:{port}',flush=True)
 ThreadingHTTPServer(('0.0.0.0',port),Handler).serve_forever()
