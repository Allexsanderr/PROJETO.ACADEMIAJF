import json
import os
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
import hashlib
import secrets

BASE=os.path.dirname(os.path.abspath(__file__))
USERS=os.path.join(BASE,'users.json')
PLANS=os.path.join(BASE,'plans.json')
SESS=os.path.join(BASE,'sessions.json')

def read_json(path,default):
    try:
        with open(path,'r',encoding='utf-8') as f:
            return json.load(f)
    except:
        return default

def write_json(path,data):
    with open(path,'w',encoding='utf-8') as f:
        json.dump(data,f,ensure_ascii=False,indent=2)

class Handler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header('Access-Control-Allow-Origin','*')
        self.send_header('Access-Control-Allow-Headers','Content-Type, X-Auth-Token')
        self.send_header('Access-Control-Allow-Methods','GET,POST,PUT,OPTIONS')

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if self.path.startswith('/api/ping'):
            self.send_response(200)
            self._cors()
            self.send_header('Content-Type','application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'ok':True}).encode('utf-8'))
            return
        if self.path.startswith('/api/plan'):
            token=self.headers.get('X-Auth-Token','')
            sessions=read_json(SESS,{})
            email=sessions.get(token,'')
            if not email:
                self.send_response(401)
                self._cors()
                self.end_headers()
                return
            plans=read_json(PLANS,{})
            plan=plans.get(email,{})
            self.send_response(200)
            self._cors()
            self.send_header('Content-Type','application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'plan':plan}).encode('utf-8'))
            return
        self.send_response(404)
        self._cors()
        self.end_headers()

    def _json_body(self):
        try:
            length=int(self.headers.get('Content-Length','0'))
            raw=self.rfile.read(length) if length>0 else b''
            return json.loads(raw.decode('utf-8') or '{}')
        except:
            return {}

    def do_POST(self):
        if self.path.startswith('/api/register'):
            data=self._json_body()
            name=data.get('name','').strip()
            email=data.get('email','').strip().lower()
            password=data.get('password','')
            if not name or not email or len(password)<6:
                self.send_response(400)
                self._cors()
                self.end_headers()
                return
            users=read_json(USERS,{})
            if email in users:
                self.send_response(409)
                self._cors()
                self.end_headers()
                return
            salt=secrets.token_hex(16)
            h=hashlib.sha256((password+salt).encode()).hexdigest()
            users[email]={'name':name,'salt':salt,'hash':h}
            write_json(USERS,users)
            token=secrets.token_hex(24)
            sessions=read_json(SESS,{})
            sessions[token]=email
            write_json(SESS,sessions)
            plans=read_json(PLANS,{})
            if email not in plans:
                plans[email]={'Segunda':[],'Terça':[],'Quarta':[],'Quinta':[],'Sexta':[],'Sábado':[],'Domingo':[]}
                write_json(PLANS,plans)
            self.send_response(200)
            self._cors()
            self.send_header('Content-Type','application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'token':token,'user':{'name':name,'email':email}}).encode('utf-8'))
            return
        if self.path.startswith('/api/login'):
            data=self._json_body()
            email=data.get('email','').strip().lower()
            password=data.get('password','')
            users=read_json(USERS,{})
            u=users.get(email)
            if not u:
                self.send_response(401)
                self._cors()
                self.end_headers()
                return
            h=hashlib.sha256((password+u['salt']).encode()).hexdigest()
            if h!=u['hash']:
                self.send_response(401)
                self._cors()
                self.end_headers()
                return
            token=secrets.token_hex(24)
            sessions=read_json(SESS,{})
            sessions[token]=email
            write_json(SESS,sessions)
            self.send_response(200)
            self._cors()
            self.send_header('Content-Type','application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'token':token,'user':{'name':u['name'],'email':email}}).encode('utf-8'))
            return
        self.send_response(404)
        self._cors()
        self.end_headers()

    def do_PUT(self):
        if self.path.startswith('/api/plan'):
            token=self.headers.get('X-Auth-Token','')
            sessions=read_json(SESS,{})
            email=sessions.get(token,'')
            if not email:
                self.send_response(401)
                self._cors()
                self.end_headers()
                return
            body=self._json_body()
            plan=body.get('plan',{})
            plans=read_json(PLANS,{})
            plans[email]=plan
            write_json(PLANS,plans)
            self.send_response(200)
            self._cors()
            self.send_header('Content-Type','application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'ok':True}).encode('utf-8'))
            return
        self.send_response(404)
        self._cors()
        self.end_headers()

if __name__=='__main__':
    port=8081
    server=ThreadingHTTPServer(('0.0.0.0',port),Handler)
    print(f'Serving API on http://localhost:{port}/')
    server.serve_forever()