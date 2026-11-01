"""Mounir Academy gateway. Real Supabase, no seeds or mock fallback.

Uses hosting environment variables for the existing Supabase connection.
Never imports main.py: its startup seeds/migrates the separate SQLite database.
"""
import argparse
import collections
from contextlib import closing
import datetime as dt
import hashlib
import hmac
import math
import http.cookies
import json
import mimetypes
import os
import pathlib
import re
import secrets
import sqlite3
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from zoneinfo import ZoneInfo

ROOT = pathlib.Path(__file__).resolve().parents[1]
FRONT = ROOT / 'frontend'
ASSETS = pathlib.Path(__file__).resolve().parent / 'assets'
SESSIONS = {}
LOGIN_ATTEMPTS = collections.defaultdict(list)
LOCK = threading.RLock()
ThreadingHTTPServer.request_queue_size = 64
TABLES = {'students','enrollments','teachers','attendance','support_tickets','payments','teacher_payouts','courses','lectures','quizzes','quiz_questions','quiz_submissions','notifications','users'}
URL = os.environ.get('SUPABASE_URL','').rstrip('/')
KEY = os.environ.get('SUPABASE_ANON_KEY','')
PRODUCTION = os.environ.get('APP_ENV','development') == 'production'
PUBLIC_ORIGIN = (os.environ.get('PUBLIC_ORIGIN') or os.environ.get('RENDER_EXTERNAL_URL','')).rstrip('/')
REQUIRE_PERSISTENT_DISK = os.environ.get('REQUIRE_PERSISTENT_DISK','false').lower() == 'true'
STATE_DIR = pathlib.Path(os.environ.get('DATA_DIR',str(ROOT/'.runtime'))).resolve()
STATE_DIR.mkdir(parents=True,exist_ok=True)
AUDIT_DB = STATE_DIR/'operations.sqlite3'
COOKIE_SECURE = '; Secure' if PRODUCTION else ''

class APIError(Exception):
    def __init__(self,status,message): self.status,self.message=status,message

def cloud(table, query=None, method='GET', payload=None, headers=None):
    if table not in TABLES: raise APIError(404,'مصدر البيانات غير متاح')
    query = query or []
    if isinstance(query,dict): query=list(query.items())
    url=URL+'/rest/v1/'+table+'?'+urllib.parse.urlencode(query)
    hdr={'apikey':KEY,'Authorization':'Bearer '+KEY,'Content-Type':'application/json','Prefer':'return=representation'}
    for k,v in (headers or {}).items():
        if k.lower() in {'prefer','range','range-unit','accept'}: hdr[k]=v
    data=json.dumps(payload,ensure_ascii=False).encode() if payload is not None else None
    try:
        with urllib.request.urlopen(urllib.request.Request(url,data=data,headers=hdr,method=method),timeout=25) as response:
            raw=response.read()
            return response.status,json.loads(raw) if raw else None,dict(response.headers)
    except urllib.error.HTTPError as e:
        try: message=json.loads(e.read()).get('message','تعذّر تنفيذ العملية على قاعدة البيانات')
        except Exception: message='تعذّر تنفيذ العملية على قاعدة البيانات'
        raise APIError(e.code,message) from None
    except (urllib.error.URLError,TimeoutError): raise APIError(503,'تعذّر الاتصال بقاعدة المنصة. حاول مرة أخرى.') from None

def rows(table,query=None):
    q=list((query or {}).items()) if isinstance(query,dict) else list(query or [])
    q=[(k,v) for k,v in q if k not in {'limit','offset'}]
    result=[]
    for offset in range(0,100000,1000):
        _,data,_=cloud(table,q+[('limit','1000'),('offset',str(offset))])
        result.extend(data or [])
        if len(data or [])<1000: break
    return result

def clean(value,role='admin'):
    if isinstance(value,list): return [clean(x,role) for x in value]
    if isinstance(value,dict):
        hidden={'password','password_hash','token','access_token','refresh_token'}
        if role=='teacher': hidden|={'parent_phone','parent_name','phone','email'}
        return {k:clean(v,role) for k,v in value.items() if k not in hidden}
    return value

def related(user): return user.get('student_id') or user.get('teacher_id') or user.get('related_id')
def ro(user): return bool(user.get('is_read_only')) or 'view' in user.get('username','').lower()
def identifier(value):
    if not str(value).isdigit(): raise APIError(400,'معرّف غير صالح')
    return str(int(value))
def assigned(user):
    if user['role']=='student': return {int(related(user))}
    if user['role']=='teacher': return {e['student_id'] for e in rows('enrollments',{'select':'student_id','teacher_id':'eq.'+identifier(related(user))})}
    return set()
def in_filter(values): return 'in.('+','.join(str(x) for x in sorted(values))+')' if values else 'eq.-1'

def scoped(user,table,query,method,payload):
    """Append mandatory scope; user supplied OR filters cannot escape it."""
    role=user['role']; query=list(query)
    if role=='admin':
        if method!='GET' and ro(user): raise APIError(403,'حساب مشاهدة فقط؛ التعديل غير مسموح')
        if table=='users':
            if method!='GET': raise APIError(403,'إدارة حسابات الدخول ليست ضمن هذه الواجهة')
            query=[(k,v) for k,v in query if k!='select']+[('select','id,username,role,related_id,full_name')]
        return query,payload
    sid=identifier(related(user)); ids=None
    selection=next((v for k,v in query if k=='select'),'*')
    if '(' in selection and table!='enrollments':raise APIError(403,'الاستعلام المتداخل غير مسموح لهذا الحساب')
    if table=='enrollments' and '(' in selection and not re.fullmatch(r'[\w*, ()]+',selection):raise APIError(403,'الاستعلام غير مسموح')
    if table=='enrollments' and any(x+'(' in selection.replace(' ','') for x in TABLES-{'students','teachers'}):raise APIError(403,'الاستعلام غير مسموح')
    if table in {'users','teacher_payouts'}:
        if table=='users': raise APIError(403,'غير مصرح بالوصول إلى حسابات الآخرين')
        if role!='teacher': raise APIError(403,'غير مصرح')
        query.append(('teacher_id','eq.'+sid))
    elif table=='students':
        ids=assigned(user);query.append(('id',in_filter(ids)))
    elif table=='enrollments': query.append(('student_id' if role=='student' else 'teacher_id','eq.'+sid))
    elif table=='teachers':
        tids={int(sid)} if role=='teacher' else {e['teacher_id'] for e in rows('enrollments',{'select':'teacher_id','student_id':'eq.'+sid}) if e.get('teacher_id')}
        query.append(('id',in_filter(tids)))
    elif table=='support_tickets':
        query.append(('student_id','eq.'+sid)) if role=='student' else query.append(('student_name','like.*[معلم #'+sid+']*'))
    elif table in {'attendance','notifications','payments','quiz_submissions'}:
        ids=assigned(user);query.append(('student_id',in_filter(ids)))
        if table=='payments' and role=='teacher': raise APIError(403,'بيانات المدفوعات خاصة بالطالب والإدارة')
    elif table in {'courses','lectures','quizzes','quiz_questions'}:
        if method!='GET': raise APIError(403,'إدارة المحتوى للإشراف فقط')
    else: raise APIError(403,'غير مصرح')
    if method=='GET': return query,payload
    # Explicit writes used by the existing UI. Scope is checked server-side.
    if role=='student':
        allowed={'support_tickets':{'POST'},'notifications':{'PATCH'}}
    else:
        allowed={'attendance':{'POST','DELETE'},'enrollments':{'PATCH'},'support_tickets':{'POST'},'notifications':{'POST','PATCH'}}
    if method not in allowed.get(table,set()): raise APIError(403,'هذه العملية غير مصرح بها لهذا الحساب')
    data=payload if isinstance(payload,list) else [payload] if payload else []
    if table=='enrollments' and method=='PATCH':
        keys={'current_surah','current_aya','remaining_credits','excuse_count','present_count','absent_count','rating','status'}
        if any(set(x)-keys for x in data): raise APIError(403,'تعديل هذه الحقول يحتاج صلاحية الإشراف')
    if table=='notifications' and method=='PATCH' and any(set(x)-{'is_read'} for x in data): raise APIError(403,'يسمح بتحديث حالة القراءة فقط')
    if method=='POST':
        ids=assigned(user)
        for record in data:
            if table=='support_tickets':
                if role=='student':record['student_id']=int(sid);record['student_name']=user.get('full_name','')
                else:record['student_id']=None;record['student_name']=f"المعلم: {user.get('full_name','')} [معلم #{sid}]"
                record['status']='open';record.pop('admin_reply',None)
            elif int(record.get('student_id') or -1) not in ids: raise APIError(403,'الطالب خارج نطاق حسابك')
    if method in {'PATCH','DELETE'} and not any(k not in {'select','order','limit','offset'} for k,v in query): raise APIError(400,'يلزم تحديد السجل')
    return query,payload

def student_profile(user,ident):
    field='id' if str(ident).isdigit() else 'student_code'
    q,p=scoped(user,'students',[(field,'eq.'+str(ident))],'GET',None)
    found=rows('students',q)
    if not found: raise APIError(404,'الطالب غير موجود أو خارج صلاحية الحساب')
    student=found[0]; enrs=rows('enrollments',{'student_id':'eq.'+str(student['id']),'select':'*,teachers(id,name,bio)'})
    if user['role']=='teacher':enrs=[e for e in enrs if e.get('teacher_id')==int(related(user))]
    for e in enrs:
        teacher=e.get('teachers') or {}
        e.update(teacher_name=teacher.get('name',''),group_id=e.get('group_id') or student.get('qr_code'),google_meet_url=teacher.get('bio','') if str(teacher.get('bio','')).startswith('https://') else '')
    student['group_id']=student.get('qr_code');student['account_status']='نشط' if student.get('status')=='active' else 'موقوف'
    return clean({'student':student,'enrolled_courses':enrs,'enrolled_courses_count':len(enrs)},user['role'])

def group_data(user):
    q,_=scoped(user,'enrollments',[('select','*,students(id,name,student_code,age,qr_code,status),teachers(id,name,bio)')],'GET',None)
    grouped={}
    for e in rows('enrollments',q):
        s=e.get('students') or {};t=e.get('teachers') or {};gid=e.get('group_id') or s.get('qr_code') or ''
        key=(gid,e.get('teacher_id'),e.get('course_name'))
        g=grouped.setdefault(key,{'group_id':gid,'group_name':gid or 'بدون مجموعة','teacher_id':e.get('teacher_id'),'teacher_name':t.get('name',''),'course_name':e.get('course_name',''),'subscription_days':e.get('subscription_days',''),'lecture_time':e.get('lecture_time',''),'session_duration':e.get('session_duration'),'google_meet_url':t.get('bio','') if str(t.get('bio','')).startswith('https://') else '', 'students':[]})
        g['students'].append({**s,**{k:v for k,v in e.items() if k not in {'students','teachers','id'}},'id':s.get('id'),'enrollment_id':e['id'],'status':s.get('status'),'enrollment_status':e.get('status'),'account_status':'نشط' if s.get('status')=='active' else 'موقوف'})
    for g in grouped.values():g['student_count']=len(g['students']);g['total_students']=len(g['students'])
    return list(grouped.values())

def payroll(user):
    ts=rows('teachers',{'id':'eq.'+identifier(related(user))}) if user['role']=='teacher' else rows('teachers')
    es=rows('enrollments');pays=rows('teacher_payouts');lectures=rows('lectures');result=[]
    for t in ts:
        own=[e for e in es if e.get('teacher_id')==t['id']]
        courses={e['course_name'] for e in own}
        # Same accounting basis as the existing backend, not student attendance totals.
        completed=sum(l.get('status')=='completed' and l.get('course_name') in courses for l in lectures)
        rate=float(t.get('rate_per_session') or 0);earned=round(completed*rate,2)
        paid=round(sum(float(p.get('amount') or 0) for p in pays if p.get('teacher_id')==t['id']),2)
        result.append({'teacher_id':t['id'],'name':t['name'],'phone':t.get('phone',''),'courses_supervised':list(courses),'rate_per_session':rate,'completed_sessions':completed,'total_earned':earned,'total_paid':paid,'balance_due':max(0,earned-paid),'payouts_history':[p for p in pays if p.get('teacher_id')==t['id']]})
    return {'teachers_payroll':result,'summary':{'total_balance_due':sum(t['balance_due'] for t in result)},'basis':'وفق الحساب الحالي: المحاضرات المكتملة في مسارات المعلم × سعر الحصة. لا تمثل سجلات حضور الطلاب عدداً مستقلاً لحصص المعلم.'}

def day_of(value):
    try:return dt.datetime.fromisoformat(value.replace('Z','+00:00')).astimezone(ZoneInfo('Africa/Cairo')).date().isoformat()
    except (ValueError,AttributeError):return ''

def enrollment_for(user,eid):
    q,p=scoped(user,'enrollments',[('id','eq.'+identifier(eid))],'GET',None)
    found=rows('enrollments',q)
    if not found:raise APIError(404,'الاشتراك غير موجود أو خارج صلاحية الحساب')
    return found[0]

def audit_event(user,kind,detail):
    with LOCK,sqlite3.connect(AUDIT_DB) as db:
        db.execute('CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY, actor TEXT, kind TEXT, detail TEXT, at TEXT)')
        db.execute('INSERT INTO audit(actor,kind,detail,at) VALUES (?,?,?,?)',(user.get('username',''),kind,json.dumps(detail,ensure_ascii=False),dt.datetime.now(dt.timezone.utc).isoformat()))

def operation(user,body,kind,fn):
    """Persistent local idempotency. Incomplete cross-table operations are never retried blindly."""
    op=str(body.get('operation_id',''))
    if not re.fullmatch(r'[a-zA-Z0-9-]{20,80}',op):raise APIError(400,'معرّف العملية مطلوب')
    fingerprint=hashlib.sha256(json.dumps(body,sort_keys=True).encode()).hexdigest()
    key=str(user['id'])+':'+kind+':'+op
    with LOCK,sqlite3.connect(AUDIT_DB) as db:
        db.execute('CREATE TABLE IF NOT EXISTS operations (key TEXT PRIMARY KEY, fingerprint TEXT, state TEXT, response TEXT)')
        old=db.execute('SELECT fingerprint,state,response FROM operations WHERE key=?',(key,)).fetchone()
        if old:
            if old[0]!=fingerprint:raise APIError(409,'معرّف العملية مستخدم لبيانات مختلفة')
            if old[1]=='done':return json.loads(old[2])
            raise APIError(409,'هذه العملية بدأت بالفعل؛ راجع حالة السجل قبل محاولة جديدة')
        db.execute('INSERT INTO operations VALUES (?,?,?,?)',(key,fingerprint,'pending',''));db.commit()
        try:result=fn()
        except Exception:
            db.execute('UPDATE operations SET state=? WHERE key=?',('needs_review',key));db.commit();raise
        db.execute('UPDATE operations SET state=?,response=? WHERE key=?',('done',json.dumps(result),key));db.commit()
        return result

class Handler(BaseHTTPRequestHandler):
    server_version='MounirLocal/1.0'
    def log_message(self,fmt,*args): pass # Do not log credentials, identifiers or query strings.
    def send(self,status,data,content_type='application/json; charset=utf-8',extra=None):
        raw=(json.dumps(data,ensure_ascii=False).encode() if not isinstance(data,(bytes,str)) else data.encode() if isinstance(data,str) else data)
        self.send_response(status);self.send_header('Content-Type',content_type);self.send_header('Content-Length',str(len(raw)))
        self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff');self.send_header('Referrer-Policy','same-origin')
        for k,v in (extra or {}).items():self.send_header(k,v)
        self.end_headers();self.wfile.write(raw)
    def body(self):
        n=int(self.headers.get('Content-Length','0'))
        if n>2000000:raise APIError(413,'حجم الطلب أكبر من الحد المسموح')
        try:return json.loads(self.rfile.read(n)) if n else None
        except ValueError:raise APIError(400,'طلب غير صالح')
    def session(self,required=True):
        cookie=http.cookies.SimpleCookie();cookie.load(self.headers.get('Cookie',''));token=cookie.get('mounir_local_session')
        session=SESSIONS.get(token.value) if token else None
        if session and session['expires']>time.time(): return session['user']
        if required:raise APIError(401,'انتهت الجلسة؛ سجّل الدخول مجدداً')
        return None
    def do_GET(self):self.dispatch()
    def do_POST(self):self.dispatch()
    def do_PATCH(self):self.dispatch()
    def do_DELETE(self):self.dispatch()
    def do_PUT(self):self.dispatch()
    def dispatch(self):
        try:
            host=self.headers.get('Host','')
            allowed_hosts={f'127.0.0.1:{self.server.server_port}',f'localhost:{self.server.server_port}'}
            if PRODUCTION:allowed_hosts.add(urllib.parse.urlsplit(PUBLIC_ORIGIN).netloc)
            if host not in allowed_hosts:raise APIError(403,'عنوان الخادم غير مسموح')
            allowed_origin=PUBLIC_ORIGIN if PRODUCTION else 'http://'+host
            if self.command!='GET' and self.headers.get('Origin') not in {None,allowed_origin}:raise APIError(403,'مصدر الطلب غير مسموح')
            path=urllib.parse.urlsplit(self.path).path
            if path=='/api/health':return self.send(200,{'status':'ok','data_source':'live-cloud','mock':False})
            if path=='/api/auth/login':return self.login()
            if path=='/api/auth/logout':
                if self.command!='POST':raise APIError(405,'POST required')
                cookie=http.cookies.SimpleCookie();cookie.load(self.headers.get('Cookie',''))
                if cookie.get('mounir_local_session'):SESSIONS.pop(cookie['mounir_local_session'].value,None)
                return self.send(200,{'success':True},extra={'Set-Cookie':'mounir_local_session=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict'+COOKIE_SECURE})
            if path=='/api/auth/me':return self.send(200,{'user':clean(self.session())})
            if path=='/js/local-session.js':return self.bootstrap()
            if path.startswith('/_cloud/rest/v1/'):
                user=self.session();table=path.rsplit('/',1)[-1]
                if table not in TABLES:raise APIError(403,'المصدر غير مسموح')
                q=urllib.parse.parse_qsl(urllib.parse.urlsplit(self.path).query,keep_blank_values=True)
                q,data=scoped(user,table,q,self.command,self.body() if self.command!='GET' else None)
                status,result,hdr=cloud(table,q,self.command,data,dict(self.headers))
                # Credentials and parent contact data never leave this gateway for teachers.
                if table=='quiz_questions' and user['role']!='admin' and isinstance(result,list):
                    result=[{k:v for k,v in r.items() if k not in {'correct_answer','correct_option','explanation'}} for r in result]
                return self.send(status,clean(result,user['role']),extra={k:v for k,v in hdr.items() if k.lower()=='content-range'})
            if path.startswith('/api/'):return self.api(path)
            return self.static(path)
        except APIError as e:self.send(e.status,{'detail':e.message,'message':e.message,'error':e.message})
        except (BrokenPipeError,ConnectionResetError):pass
        except Exception as e:
            print('Request failed:',type(e).__name__,flush=True)
            self.send(500,{'detail':'تعذّر تنفيذ الطلب. لم يتم عرض بيانات بديلة.'})
    def login(self):
        if self.command!='POST':raise APIError(405,'POST required')
        b=self.body() or {};name=str(b.get('username','')).strip();pw=str(b.get('password','')).strip();role=b.get('expected_role') or b.get('role')
        if not name or not pw or len(name)>100 or any(x in name for x in '*(),'):raise APIError(400,'اكتب اسم المستخدم وكلمة المرور')
        key=(self.client_address[0],hashlib.sha256(name.casefold().encode()).hexdigest());now=time.time()
        with LOCK:
            LOGIN_ATTEMPTS[key]=[t for t in LOGIN_ATTEMPTS[key] if now-t<60]
            if len(LOGIN_ATTEMPTS[key])>=10:raise APIError(429,'محاولات كثيرة؛ انتظر دقيقة ثم أعد المحاولة')
            LOGIN_ATTEMPTS[key].append(now)
        # Preserve the aliases accepted by the production supervisor login.
        # Aliases resolve only to admin accounts and never bypass the password.
        aliases={'admin':('admin','mounir'),'mounir':('admin','mounir'),'view':('mounirview','supervisorview'),'mounirview':('mounirview','supervisorview'),'supervisorview':('mounirview','supervisorview')}
        alias=aliases.get(name.casefold()) if role in {None,'admin'} else None
        if alias:
            emails=('admin@monir-academy.edu.eg','mounir@monir-academy.edu.eg') if name.casefold() in {'admin','mounir'} else ('view@monir-academy.edu.eg',)
            conditions=','.join(['username.ilike.'+n for n in alias]+['email.ilike.'+e for e in emails])
            users=rows('users',{'role':'eq.admin','or':'('+conditions+')','select':'*'})
            users=[u for u in users if u.get('role')=='admin' and (str(u.get('username','')).casefold() in alias or str(u.get('email','')).casefold() in emails)]
        else:users=rows('users',{'username':'ilike.'+name,'select':'*'})
        u=next((u for u in users if hmac.compare_digest(str(u.get('password_hash','')).encode(),pw.encode())),None)
        if not u or (role and role!=u.get('role')):raise APIError(401,'اسم المستخدم أو كلمة المرور أو البوابة غير صحيحة')
        if u.get('role') not in {'student','teacher','admin'}:raise APIError(403,'الحساب غير مصرح')
        user=clean(u);student=None
        if user['role']=='student':
            found=rows('students',{'id':'eq.'+identifier(related(user))})
            if not found:raise APIError(403,'الحساب غير مرتبط بطالب')
            student=found[0];user.update(student_id=student['id'],student_code=student.get('student_code'),related_id=student['id'])
        token=secrets.token_urlsafe(32)
        with LOCK:SESSIONS[token]={'user':user,'expires':time.time()+8*3600}
        self.send(200,{'success':True,'user':user,'student':student,'token':'server-session'},extra={'Set-Cookie':f'mounir_local_session={token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800'+COOKIE_SECURE})
    def bootstrap(self):
        u=self.session(False);payload=json.dumps(clean(u) if u else None,ensure_ascii=False).replace('<','\\u003c')
        js=f"window.MOUNIR_LIVE=true;window.MOUNIR_SESSION={payload};window.MONIR_SUPABASE_CONFIG={{url:location.origin+'/_cloud',anonKey:'local-session'}};"
        js+="if(!sessionStorage.getItem('mounir_live_clean_v1')){['monir_smart_lms_db_v3','monir_smart_lms_db_v2','monir_group_schedules','monir_student_schedules'].forEach(k=>localStorage.removeItem(k));sessionStorage.setItem('mounir_live_clean_v1','1');}"
        js+="if(window.MOUNIR_SESSION){localStorage.setItem('monir_current_user',JSON.stringify(window.MOUNIR_SESSION));if(window.MOUNIR_SESSION.role==='admin')localStorage.setItem('monir_admin_session_epoch','20261025_session_v2');}else{localStorage.removeItem('monir_current_user');localStorage.removeItem('monir_auth_token');}"
        return self.send(200,js,'text/javascript; charset=utf-8')
    def api(self,path):
        user=self.session();role=user['role'];method=self.command
        if path.startswith('/api/admin/') and role!='admin':raise APIError(403,'هذا الإجراء للإشراف فقط')
        if method!='GET' and ro(user):raise APIError(403,'حساب مشاهدة فقط')
        if path.startswith('/api/live/manage/'):
            return self.manage(path,user)
        def read(table,q=None):
            scope,_=scoped(user,table,list((q or {}).items()),'GET',None)
            return clean(rows(table,scope),role)
        def write(table,method,payload,q=None):
            scope,payload=scoped(user,table,list((q or {}).items()),method,payload)
            return clean(cloud(table,scope,method,payload)[1],role)
        match=re.fullmatch(r'/api/student/([^/]+)',path)
        if match:return self.send(200,student_profile(user,urllib.parse.unquote(match[1])))
        if path in {'/api/students','/api/admin/students'}:return self.send(200,read('students'))
        if path=='/api/teachers':return self.send(200,read('teachers'))
        if path=='/api/courses':return self.send(200,read('courses'))
        if path=='/api/quizzes':return self.send(200,read('quizzes'))
        if path=='/api/admin/quizzes/submissions':return self.send(200,read('quiz_submissions'))
        if path in {'/api/admin/groups','/api/live/groups'}:return self.send(200,clean(group_data(user),role))
        match=re.fullmatch(r'/api/teacher/(\d+)/groups',path)
        if match:
            if role=='teacher' and int(match[1])!=int(related(user)):raise APIError(403,'غير مصرح')
            g=group_data(user if role=='teacher' else {**user,'role':'teacher','related_id':int(match[1])})
            return self.send(200,{'groups':clean(g,role),'total_groups':len(g),'total_students':sum(len(x['students']) for x in g)})
        if path in {'/api/admin/teachers/payroll','/api/live/payroll'}:
            if role not in {'admin','teacher'}:raise APIError(403,'غير مصرح')
            return self.send(200,clean(payroll(user),role))
        if path=='/api/admin/overview':
            students=read('students');tickets=read('support_tickets');courses=read('courses')
            return self.send(200,{'total_students':len(students),'total_teachers':len(read('teachers')),'total_courses':len(courses),'open_tickets_count':sum(t.get('status')=='open' for t in tickets),'lectures':read('lectures'),'courses':courses})
        if path=='/api/live/summary':
            if role!='admin':raise APIError(403,'غير مصرح')
            es=read('enrollments');ss=read('students');tickets=read('support_tickets')
            return self.send(200,{'students':len(ss),'teachers':len(read('teachers')),'low_credits':sum(float(e.get('remaining_credits') or 0)<=1 for e in es),'paused':sum(s.get('status')!='active' for s in ss),'open_tickets':sum(t.get('status')=='open' for t in tickets),'updated_at':dt.datetime.now(dt.timezone.utc).isoformat()})
        if path=='/api/courses/analytics':
            cs=read('courses');es=read('enrollments');ss={s['id']:s for s in read('students')};result=[]
            for c in cs:
                en=[e for e in es if e.get('course_name')==c['name']];ages=[ss[e['student_id']]['age'] for e in en if e['student_id'] in ss and ss[e['student_id']].get('age') is not None]
                result.append({**c,'course_name':c['name'],'student_count':len(en),'enrolled_count':len(en),'enrolled_ages':ages,'vacant_seats':max(0,int(c.get('max_capacity') or 0)-len(en)),'is_incomplete':len(en)<int(c.get('max_capacity') or 0),'total_students':len(en),'average_age':round(sum(ages)/len(ages),1) if ages else 0,'avg_age':round(sum(ages)/len(ages),1) if ages else 0,'groups_count':len({e.get('group_id') for e in en if e.get('group_id')}),'current_capacity':len(en)})
            return self.send(200,result)
        if path=='/api/admin/teachers/performance-report':
            ts=read('teachers');es=read('enrollments');ls=read('lectures');report=[]
            for t in ts:
                own=[e for e in es if e.get('teacher_id')==t['id']];courses={e['course_name'] for e in own}
                dropped=sum(e.get('status')=='expired' or e.get('remaining_credits')==0 for e in own)
                late=t.get('late_count') or 0;cancel=t.get('cancellation_count') or 0
                report.append({'teacher_id':t['id'],'name':t['name'],'specialty':t.get('specialty',''),'phone':t.get('phone',''),'total_assigned_students':len(own),'dropouts_count':dropped,'dropout_rate_pct':round(dropped/max(len(own),1)*100,1),'late_starts_count':late,'cancellations_count':cancel,'postponed_lectures_count':sum(l.get('status')=='postponed' and l.get('course_name') in courses for l in ls),'commitment_score':max(50,100-(cancel*10+late*5+dropped*10)),'supervised_courses':list(courses)})
            return self.send(200,report)
        if path=='/api/admin/students/status-summary':
            ss=read('students');es=read('enrollments');paused=[]
            for s in ss:
                own=[e for e in es if e['student_id']==s['id']]
                if s.get('status')!='active' or any(float(e.get('remaining_credits') or 0)<=0 for e in own):paused.append({**s,'remaining_credits':sum(float(e.get('remaining_credits') or 0) for e in own),'course_name':'، '.join(e['course_name'] for e in own),'reason':'نفاد الرصيد' if any(float(e.get('remaining_credits') or 0)<=0 for e in own) else 'موقوف'})
            return self.send(200,{'paused_students':paused,'students':paused,'summary':{'total_paused':len(paused)},'total_paused':len(paused),'active_count':len(ss)-len(paused),'total_students':len(ss)})
        if path=='/api/admin/support/tickets':return self.send(200,read('support_tickets',{'order':'created_at.desc'}))
        if path=='/api/live/tickets' and method=='GET':return self.send(200,read('support_tickets',{'order':'created_at.desc'}))
        if path in {'/api/support/tickets','/api/live/tickets'} and method=='POST':
            b=self.body() or {}
            if not str(b.get('message','')).strip() or not str(b.get('subject','')).strip():raise APIError(400,'اكتب عنوان الطلب وتفاصيله')
            record={k:v for k,v in b.items() if k in {'student_id','course_name','category','subject','message'}}
            record.update(status='open',created_at=dt.datetime.now(dt.timezone.utc).isoformat(),updated_at=dt.datetime.now(dt.timezone.utc).isoformat())
            return self.send(200,{'success':True,'ticket':write('support_tickets','POST',record)})
        match=re.fullmatch(r'/api/student/([^/]+)/(notifications|support/tickets|quizzes)',path)
        if match:
            sid=student_profile(user,match[1])['student']['id'];table={'notifications':'notifications','support/tickets':'support_tickets','quizzes':'quiz_submissions'}[match[2]]
            return self.send(200,read(table,{'student_id':'eq.'+str(sid)}))
        match=re.fullmatch(r'/api/admin/support/tickets/(\d+)/reply',path)
        if match and method=='POST':
            b=self.body() or {};reply=str(b.get('admin_reply','')).strip()
            if not reply:raise APIError(400,'اكتب الرد')
            write('support_tickets','PATCH',{'admin_reply':reply,'status':b.get('status','replied'),'updated_at':dt.datetime.now(dt.timezone.utc).isoformat()},{'id':'eq.'+match[1]})
            return self.send(200,{'success':True,'message':'تم حفظ الرد'})
        if path=='/api/admin/db/export':
            if role!='admin':raise APIError(403,'غير مصرح')
            return self.send(200,{t:read(t) for t in sorted(TABLES-{'users','quiz_questions'})})
        match=re.fullmatch(r'/api/live/quizzes/(\d+)(/submit)?',path)
        if match:
            qid=match[1];quiz=rows('quizzes',{'id':'eq.'+qid})
            if not quiz:raise APIError(404,'الاختبار غير موجود')
            b=self.body() if method=='POST' else {}
            sid=int(related(user)) if role=='student' else int((b or {}).get('student_id') or 0)
            if role!='student':raise APIError(403,'تسليم الاختبارات متاح لحساب الطالب فقط')
            es=rows('enrollments',{'student_id':'eq.'+str(sid),'course_name':'eq.'+quiz[0]['course_name']})
            if not es:raise APIError(403,'الاختبار خارج اشتراكات الطالب')
            try:meta=json.loads(quiz[0].get('description') or '{}')
            except ValueError:meta={}
            if meta.get('local_draft'):raise APIError(403,'الاختبار ما زال مسودة ولم ينشر')
            now=dt.datetime.now(dt.timezone.utc)
            for key,predicate in [('open_date',lambda d:now<d),('close_date',lambda d:now>d)]:
                if meta.get(key):
                    d=dt.datetime.fromisoformat(meta[key].replace('Z','+00:00'))
                    if d.tzinfo is None:d=d.replace(tzinfo=dt.timezone.utc)
                    if predicate(d):raise APIError(403,'الاختبار خارج فترة الإتاحة')
            questions=rows('quiz_questions',{'quiz_id':'eq.'+qid,'order':'id.asc'})
            if not match[2]:return self.send(200,{'quiz':clean(quiz[0]),'questions':[{k:v for k,v in q.items() if k not in {'correct_answer','correct_option','explanation'}} for q in questions]})
            if method!='POST':raise APIError(405,'POST required')
            answers=(b or {}).get('answers',{})
            if not questions or any(str(q['id']) not in answers for q in questions):raise APIError(400,'أجب عن كل الأسئلة قبل التسليم')
            with LOCK:
                if rows('quiz_submissions',{'quiz_id':'eq.'+qid,'student_id':'eq.'+str(sid)}):raise APIError(409,'سبق تسليم هذا الاختبار')
                total=sum(float(q.get('points') or q.get('score') or 1) for q in questions)
                score=sum(float(q.get('points') or q.get('score') or 1) for q in questions if str(answers[str(q['id'])]).strip().lower()==str(q.get('correct_option',q.get('correct_answer'))).strip().lower())
                percentage=round(score/total*100,2)
                result={'quiz_id':int(qid),'student_id':sid,'score':score,'max_score':total,'percentage':percentage,'status':'passed' if percentage>=70 else 'failed','answers_json':answers,'submitted_at':now.isoformat()}
                cloud('quiz_submissions',method='POST',payload=result)
            return self.send(200,result)
        if path=='/api/live/topup' and method=='POST':
            if role!='admin':raise APIError(403,'غير مصرح')
            b=self.body() or {};sid=identifier(b.get('student_id'));eid=identifier(b.get('enrollment_id'));count=b.get('credits');amount=b.get('amount')
            if type(count) is not int or not 1<=count<=100 or type(amount) not in {int,float} or not math.isfinite(amount) or amount<0 or not str(b.get('reason','')).strip():raise APIError(400,'راجع عدد الحصص والمبلغ وسبب الشحن')
            def topup():
                en=rows('enrollments',{'id':'eq.'+eid,'student_id':'eq.'+sid})
                st=rows('students',{'id':'eq.'+sid})
                if not en or not st:raise APIError(404,'الاشتراك غير موجود')
                en=en[0];before=float(en.get('remaining_credits') or 0)
                if before!=b.get('expected_credits'):raise APIError(409,'الرصيد تغير منذ فتح المراجعة؛ حدّث الملف')
                after=before+count
                _,updated,_=cloud('enrollments',{'id':'eq.'+eid,'remaining_credits':'eq.'+str(before)},'PATCH',{'remaining_credits':after,'status':'active'})
                if not updated:raise APIError(409,'تغير الرصيد؛ لم يُنفّذ الشحن')
                try:
                    cloud('students',{'id':'eq.'+sid},'PATCH',{'status':'active'})
                    cloud('payments',method='POST',payload={'student_id':int(sid),'course_name':en['course_name'],'amount':amount,'currency':'EGP','block_unlocked':count,'transaction_id':'LOCAL-'+b['operation_id'],'receipt_number':'LOCAL-'+b['operation_id'][:8],'payment_method':b['reason'],'status':'completed','whatsapp_message':f'إضافة {count} حصص؛ من {before} إلى {after}؛ اشتراك {eid}؛ بواسطة {user["username"]}','created_at':dt.datetime.now(dt.timezone.utc).isoformat()})
                except Exception:raise APIError(502,'تحدّث الرصيد لكن تعذّر استكمال سجل العملية. لا تكرر الشحن؛ راجع الحساب وسجل المدفوعات.') from None
                audit_event(user,'شحن رصيد',{'student_id':int(sid),'enrollment_id':int(eid),'before':before,'after':after,'amount':amount})
                return {'success':True,'before':before,'after':after,'enrollment_id':int(eid)}
            return self.send(200,operation(user,b,'topup',topup))
        if path=='/api/live/settle' and method=='POST':
            if role!='admin':raise APIError(403,'غير مصرح')
            b=self.body() or {};tid=int(identifier(b.get('teacher_id')));amount=b.get('amount')
            if type(amount) not in {int,float} or not math.isfinite(amount) or amount<=0 or not str(b.get('reference','')).strip():raise APIError(400,'راجع المبلغ ومرجع السداد')
            def settle():
                p=next((x for x in payroll(user)['teachers_payroll'] if x['teacher_id']==tid),None)
                if not p or amount>p['balance_due']:raise APIError(409,'المبلغ يتجاوز المستحق؛ حدّث الحساب أولاً')
                cloud('teacher_payouts',method='POST',payload={'teacher_id':tid,'amount':amount,'sessions_count':p['completed_sessions'],'period_month':dt.datetime.now().strftime('%Y-%m'),'payment_method':'manual','reference_number':b['reference'],'notes':'تسجيل تسوية بواسطة '+user['username'],'created_at':dt.datetime.now(dt.timezone.utc).isoformat()})
                audit_event(user,'تسوية معلم',{'teacher_id':tid,'amount':amount,'reference':b['reference']})
                return {'success':True,'remaining':p['balance_due']-amount}
            return self.send(200,operation(user,b,'settle',settle))
        # Fail closed rather than silently mutate a stale SQLite copy or return mock success.
        raise APIError(501,'هذه العملية تحتاج ربطاً إضافياً بالخدمة السحابية؛ لم يتم تنفيذ أي تغيير')
    def manage(self,path,user):
        role=user['role'];method=self.command;q=dict(urllib.parse.parse_qsl(urllib.parse.urlsplit(self.path).query));b=self.body() or {} if method!='GET' else {}
        if role not in {'teacher','admin'}:raise APIError(403,'غير مصرح')
        action=path.rsplit('/',1)[-1]
        if action=='students' and method=='GET':
            sq,_=scoped(user,'students',[],'GET',None);eq,_=scoped(user,'enrollments',[],'GET',None)
            ss=rows('students',sq);es=rows('enrollments',eq);teachers={t['id']:t for t in rows('teachers')}
            for s in ss:
                s['enrollments']=[{**e,'teacher_name':teachers.get(e.get('teacher_id'),{}).get('name','')} for e in es if e['student_id']==s['id']]
            return self.send(200,clean(ss,role))
        if action=='attendance' and method=='GET':
            day=q.get('date',dt.datetime.now(ZoneInfo('Africa/Cairo')).date().isoformat())
            aq,_=scoped(user,'attendance',[],'GET',None)
            aq.extend([('joined_at','gte.'+(dt.datetime.fromisoformat(day).replace(tzinfo=ZoneInfo('Africa/Cairo'))-dt.timedelta(days=1)).isoformat()),('joined_at','lt.'+(dt.datetime.fromisoformat(day).replace(tzinfo=ZoneInfo('Africa/Cairo'))+dt.timedelta(days=2)).isoformat())])
            return self.send(200,clean([a for a in rows('attendance',aq) if day_of(a.get('joined_at'))==day],role))
        if action=='history' and method=='GET':
            sid=identifier(q.get('student_id'));student_profile(user,sid)
            return self.send(200,clean(rows('attendance',{'student_id':'eq.'+sid,'order':'joined_at.desc'}),role))
        if action=='audit' and method=='GET':
            if role!='admin':raise APIError(403,'غير مصرح')
            with LOCK,sqlite3.connect(AUDIT_DB) as db:
                db.execute('CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY, actor TEXT, kind TEXT, detail TEXT, at TEXT)')
                result=[dict(zip(['id','actor','kind','detail','at'],r)) for r in db.execute('SELECT * FROM audit ORDER BY id DESC LIMIT 150')]
            return self.send(200,result)
        if method!='POST':raise APIError(405,'طريقة طلب غير مدعومة')
        if action in {'status','move','ticket','profile','teacher','lecture','quiz','group'} and role!='admin':raise APIError(403,'هذا الإجراء للإشراف فقط')
        if action=='group':
            gid=str(b.get('group_id',''));old_tid=identifier(b.get('teacher_id'));course=str(b.get('course_name',''));values=b.get('values',{})
            if not gid or not isinstance(values,dict) or set(values)!={'teacher_id','subscription_days','lecture_time','session_duration'}:raise APIError(400,'بيانات المجموعة غير مكتملة')
            if not rows('teachers',{'id':'eq.'+identifier(values['teacher_id'])}):raise APIError(400,'المعلم غير موجود')
            if not re.fullmatch(r'(?:[01]\d|2[0-3]):[0-5]\d',str(values['lecture_time'])) or not str(values['subscription_days']).strip() or type(values['session_duration']) is not int or not 5<=values['session_duration']<=240:raise APIError(400,'راجع الأيام والوقت والمدة')
            def edit_group():
                where={'group_id':'eq.'+gid,'teacher_id':'eq.'+old_tid,'course_name':'eq.'+course};enrs=rows('enrollments',where)
                if sorted(e['id'] for e in enrs)!=sorted(b.get('enrollment_ids',[])):raise APIError(409,'طلاب المجموعة تغيروا؛ أعد فتح المجموعة')
                if any(any(e.get(k)!=v for k,v in b.get('expected',{}).items()) for e in enrs):raise APIError(409,'المواعيد تغيرت أو بيانات المجموعة غير متسقة؛ أعد تحميلها')
                _,updated,_=cloud('enrollments',where,'PATCH',values)
                if len(updated or [])!=len(enrs):raise APIError(409,'تغيرت بعض السجلات أثناء الحفظ؛ راجع المجموعة')
                audit_event(user,'تعديل مجموعة',{'group_id':gid,'enrollment_ids':[e['id'] for e in enrs],'before':b.get('expected'),'after':values})
                return {'success':True}
            return self.send(200,operation(user,b,'group',edit_group))
        if action in {'teacher','lecture'}:
            table='teachers' if action=='teacher' else 'lectures';rid=identifier(b.get('id'));values=b.get('values',{})
            allowed={'name','specialty','bio','rate_per_session'} if action=='teacher' else {'title','description','drive_recording_url','drive_materials_url','duration_minutes','scheduled_time','status'}
            if not isinstance(values,dict) or not values or set(values)-allowed:raise APIError(400,'حقول غير صالحة')
            for k,v in values.items():
                if k in {'rate_per_session','duration_minutes'}:
                    if type(v) not in {int,float} or not math.isfinite(v) or v<0 or k=='duration_minutes' and not 5<=v<=240:raise APIError(400,'قيمة رقمية غير صالحة')
                elif not isinstance(v,str) or len(v)>10000:raise APIError(400,'قيمة نصية غير صالحة')
                if k in {'bio','drive_recording_url','drive_materials_url'} and v and not v.startswith('https://'):raise APIError(400,'الرابط يجب أن يبدأ بـ https://')
                if k=='status' and v not in {'scheduled','completed','postponed','cancelled'}:raise APIError(400,'حالة غير صالحة')
            def edit_resource():
                old=rows(table,{'id':'eq.'+rid})
                if not old:raise APIError(404,'السجل غير موجود')
                if any(old[0].get(k)!=v for k,v in b.get('expected',{}).items()):raise APIError(409,'البيانات تغيرت؛ حدّث الملف')
                cloud(table,{'id':'eq.'+rid},'PATCH',values)
                audit_event(user,'تعديل معلم' if action=='teacher' else 'تعديل محاضرة',{'id':int(rid),'fields':list(values)})
                return {'success':True}
            return self.send(200,operation(user,b,action,edit_resource))
        if action=='quiz':
            values=b.get('values',{});questions=b.get('questions',[]);qid=b.get('id')
            if not isinstance(values,dict) or set(values)-{'title','course_name','description','time_limit_minutes'} or not str(values.get('title','')).strip():raise APIError(400,'عنوان الاختبار مطلوب')
            if not rows('courses',{'name':'eq.'+str(values.get('course_name',''))}):raise APIError(400,'اختر مساراً مسجلاً')
            if type(values.get('time_limit_minutes')) is not int or not 1<=values['time_limit_minutes']<=180:raise APIError(400,'مدة الاختبار من دقيقة إلى 180 دقيقة')
            try:meta=json.loads(values.get('description','{}'))
            except ValueError:raise APIError(400,'بيانات الاختبار غير صالحة')
            if not isinstance(meta,dict):raise APIError(400,'بيانات الاختبار غير صالحة')
            for k in ['open_date','close_date']:
                if meta.get(k):
                    try:dt.datetime.fromisoformat(meta[k].replace('Z','+00:00'))
                    except (TypeError,ValueError):raise APIError(400,'موعد الاختبار غير صالح')
            if meta.get('open_date') and meta.get('close_date') and meta['close_date']<=meta['open_date']:raise APIError(400,'الإغلاق يجب أن يكون بعد الفتح')
            if not qid:
                if not isinstance(questions,list) or not 1<=len(questions)<=50:raise APIError(400,'أضف من سؤال إلى 50 سؤالاً')
                for q in questions:
                    if not isinstance(q,dict) or set(q)-{'question_text','option_a','option_b','option_c','option_d','correct_option','points'} or any(not str(q.get(k,'')).strip() for k in ['question_text','option_a','option_b','option_c','option_d']) or q.get('correct_option') not in {'a','b','c','d'} or type(q.get('points')) is not int or not 1<=q['points']<=100:raise APIError(400,'راجع نصوص الأسئلة والخيارات والإجابة والدرجات')
            def save_quiz():
                if qid:
                    ident=identifier(qid);old=rows('quizzes',{'id':'eq.'+ident})
                    if not old:raise APIError(404,'الاختبار غير موجود')
                    if old[0].get('description')!=b.get('expected'):raise APIError(409,'الاختبار تغير؛ أعد فتحه')
                    if old[0]['course_name']!=values['course_name'] and rows('quiz_submissions',{'quiz_id':'eq.'+ident}):raise APIError(409,'لا يمكن تغيير مسار اختبار له تسليمات')
                    cloud('quizzes',{'id':'eq.'+ident},'PATCH',values)
                else:
                    draft={**values,'description':json.dumps({**meta,'local_draft':True},ensure_ascii=False),'total_score':sum(q['points'] for q in questions)}
                    _,saved,_=cloud('quizzes',method='POST',payload=draft);ident=str(saved[0]['id'])
                    try:
                        cloud('quiz_questions',method='POST',payload=[{**q,'quiz_id':int(ident)} for q in questions])
                        cloud('quizzes',{'id':'eq.'+ident},'PATCH',{'description':values['description']})
                    except Exception:raise APIError(502,'حُفظت مسودة الاختبار لكن لم يكتمل النشر. راجع المحتوى قبل إعادة الإنشاء.') from None
                audit_event(user,'حفظ اختبار',{'id':int(ident),'created':not bool(qid)})
                return {'success':True,'id':int(ident)}
            return self.send(200,operation(user,b,'quiz',save_quiz))
        if action=='status':
            sid=identifier(b.get('student_id'));status=b.get('status');reason=str(b.get('reason','')).strip()
            if status not in {'active','inactive'} or not reason:raise APIError(400,'اختر الحالة واكتب السبب')
            def change_status():
                old=rows('students',{'id':'eq.'+sid})
                if not old:raise APIError(404,'الطالب غير موجود')
                if old[0].get('status')!=b.get('expected_status'):raise APIError(409,'الحالة تغيرت؛ حدّث الملف')
                _,updated,_=cloud('students',{'id':'eq.'+sid,'status':'eq.'+b['expected_status']},'PATCH',{'status':status})
                if not updated:raise APIError(409,'الحالة تغيرت؛ لم يُحفظ التعديل')
                audit_event(user,'تغيير حالة طالب',{'student_id':int(sid),'before':old[0]['status'],'after':status,'reason':reason})
                return {'success':True}
            return self.send(200,operation(user,b,'status',change_status))
        if action=='profile':
            sid=identifier(b.get('student_id'));values=b.get('values',{})
            if not isinstance(values,dict) or not values or set(values)-{'name','age','parent_name','parent_phone','phone'}:raise APIError(400,'حقول التعديل غير صالحة')
            if 'age' in values and (type(values['age']) is not int or not 1<=values['age']<=100):raise APIError(400,'العمر غير صالح')
            if any(not isinstance(v,(str,int)) or len(str(v))>150 for v in values.values()):raise APIError(400,'قيمة حقل غير صالحة')
            def edit_profile():
                previous=rows('students',{'id':'eq.'+sid})
                if not previous:raise APIError(404,'الطالب غير موجود')
                expected=b.get('expected',{})
                if any(previous[0].get(k)!=v for k,v in expected.items()):raise APIError(409,'الملف تغير؛ أعد فتحه قبل الحفظ')
                cloud('students',{'id':'eq.'+sid},'PATCH',values)
                audit_event(user,'تعديل ملف طالب',{'student_id':int(sid),'fields':list(values)})
                return {'success':True}
            return self.send(200,operation(user,b,'profile',edit_profile))
        if action=='plan':
            en=enrollment_for(user,b.get('enrollment_id'));plan=b.get('plan',{})
            if not isinstance(plan,dict) or set(plan)-{'hifz','madi_qareeb','madi_baeed','notes'} or any(not isinstance(v,str) or len(v)>2000 for v in plan.values()):raise APIError(400,'خطة غير صالحة')
            def save_plan():
                current=enrollment_for(user,en['id'])
                if current.get('current_surah')!=b.get('expected'):raise APIError(409,'الخطة تغيرت؛ أعد فتحها')
                cloud('enrollments',{'id':'eq.'+str(en['id'])},'PATCH',{'current_surah':json.dumps(plan,ensure_ascii=False),'current_aya':1})
                audit_event(user,'تحديث خطة الحفظ',{'student_id':en['student_id'],'enrollment_id':en['id']})
                return {'success':True}
            return self.send(200,operation(user,b,'plan',save_plan))
        if action=='record':
            en=enrollment_for(user,b.get('enrollment_id'));status=b.get('status');day=str(b.get('date',''))
            today=dt.datetime.now(ZoneInfo('Africa/Cairo')).date().isoformat()
            try:dt.date.fromisoformat(day)
            except ValueError:raise APIError(400,'تاريخ غير صالح')
            if day>today or role=='teacher' and day!=today:raise APIError(400,'المعلم يرصد اليوم الحالي فقط؛ مراجعة الأيام السابقة للإشراف')
            if status not in {'present','absent','excused'}:raise APIError(400,'حالة رصد غير صالحة')
            def record():
                current=enrollment_for(user,en['id']);before=float(current.get('remaining_credits') or 0)
                if before!=b.get('expected_credits'):raise APIError(409,'الرصيد تغير؛ حدّث الملف قبل الرصد')
                if role=='teacher':
                    student=rows('students',{'id':'eq.'+str(en['student_id'])})[0]
                    if before<=0 or student.get('status')!='active':raise APIError(409,'الاشتراك موقوف أو الرصيد منتهٍ؛ راجع الإشراف قبل الرصد')
                existing=rows('attendance',{'student_id':'eq.'+str(en['student_id'])})
                if any(day_of(a.get('joined_at'))==day and str(a.get('course_name','')).split(' [')[0]==en['course_name'] for a in existing):raise APIError(409,'تم رصد هذا الطالب للمسار في اليوم المختار بالفعل')
                updates={};cost=min(1,max(0,before)) if status!='excused' else 0
                if status=='present':updates['present_count']=int(current.get('present_count') or 0)+1
                elif status=='absent':updates['absent_count']=int(current.get('absent_count') or 0)+1
                else:
                    if role=='teacher':
                        student=rows('students',{'id':'eq.'+str(en['student_id'])})[0]
                        days=str(current.get('subscription_days') or '').replace('أ','ا').replace('إ','ا').replace('ة','ه')
                        count=sum(k in days for k in ['سبت','احد','اثنين','اتنين','ثلاثاء','تلاتاء','اربعاء','خميس','جمعه'])
                        cycle=8 if count>=2 else 4;current_cycle=(int(current.get('present_count') or 0)+int(current.get('absent_count') or 0))//cycle+1
                        excuses=int(current.get('excuse_count') or 0)
                        if before<=0 or student.get('status')!='active' or excuses>0 and (int(current.get('max_allowed_excuses') or 0)==current_cycle or excuses>=current_cycle):raise APIError(409,'العذر غير متاح في دورة الاشتراك الحالية')
                        updates['max_allowed_excuses']=current_cycle;updates['absent_count']=int(current.get('absent_count') or 0)+1
                    updates['excuse_count']=int(current.get('excuse_count') or 0)+1
                if cost:updates['remaining_credits']=before-cost
                joined=dt.datetime.now(dt.timezone.utc).isoformat() if day==today else dt.datetime.fromisoformat(day+'T12:00:00').replace(tzinfo=ZoneInfo('Africa/Cairo')).astimezone(dt.timezone.utc).isoformat()
                where={'id':'eq.'+str(en['id']),'remaining_credits':'eq.'+str(before)}
                for k in updates:
                    if current.get(k) is not None:where[k]='eq.'+str(current[k])
                _,updated,_=cloud('enrollments',where,'PATCH',updates)
                if not updated:raise APIError(409,'بيانات الرصد تغيرت؛ أعد التحميل')
                try:
                    _,saved,_=cloud('attendance',method='POST',payload={'student_id':en['student_id'],'lecture_id':None,'course_name':en['course_name']+(' [إشراف]' if role=='admin' else ' [معلم]'),'status':status,'joined_at':joined,'duration_minutes':int(current.get('session_duration') or 20)})
                except Exception:
                    # A timeout can mean the insert committed. Do not refund blindly or retry.
                    raise APIError(502,'تحدّث عدّاد الحضور لكن لم نتأكد من حفظ السجل. لا تكرر الرصد؛ راجع الملف وسجل العمليات.') from None
                audit_event(user,'رصد حضور',{'student_id':en['student_id'],'enrollment_id':en['id'],'attendance_id':saved[0].get('id') if saved else None,'date':day,'status':status,'before':before,'after':before-cost,'deducted':cost})
                return {'success':True,'deducted':cost,'after':before-cost}
            return self.send(200,operation(user,b,'record',record))
        if action=='undo':
            en=enrollment_for(user,b.get('enrollment_id'));aid=identifier(b.get('attendance_id'));refund=b.get('refund');reason=str(b.get('reason','')).strip()
            if type(refund) is not int or refund not in {0,1} or not reason:raise APIError(400,'راجع مقدار الخصم الأصلي واكتب سبب الإلغاء')
            def undo():
                records=rows('attendance',{'id':'eq.'+aid,'student_id':'eq.'+str(en['student_id'])})
                if not records:raise APIError(409,'الرصد غير موجود أو تم إلغاؤه')
                a=records[0]
                if role=='teacher':
                    if '[معلم]' not in str(a.get('course_name')) or day_of(a.get('joined_at'))!=dt.datetime.now(ZoneInfo('Africa/Cairo')).date().isoformat():raise APIError(403,'يمكنك إلغاء رصدك لليوم الحالي فقط؛ الرصد السابق أو الإشرافي يحتاج مراجعة الإشراف')
                    with sqlite3.connect(AUDIT_DB) as db:
                        db.execute('CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY, actor TEXT, kind TEXT, detail TEXT, at TEXT)')
                        history=[json.loads(x[0]) for x in db.execute('SELECT detail FROM audit WHERE actor=? AND kind=?',(user['username'],'رصد حضور'))]
                    matching=[x for x in history if x.get('attendance_id')==int(aid) and x.get('enrollment_id')==en['id']]
                    if not matching or matching[-1].get('deducted')!=refund:raise APIError(409,'الرصد الأصلي يحتاج مراجعة الإشراف لتحديد الرصيد المستعاد')
                if str(a.get('course_name','')).split(' [')[0]!=en['course_name']:raise APIError(400,'الرصد لا يخص هذا الاشتراك')
                if a['status'] not in {'present','absent','excused'} or a['status']=='excused' and refund:raise APIError(400,'مقدار الإرجاع غير متوافق مع حالة الرصد')
                current=enrollment_for(user,en['id']);before=float(current.get('remaining_credits') or 0)
                if before!=b.get('expected_credits'):raise APIError(409,'الرصيد تغير؛ حدّث الملف')
                updates={'remaining_credits':before+refund}
                if a['status']=='present':updates['present_count']=max(0,int(current.get('present_count') or 0)-1)
                if a['status']=='absent' or a['status']=='excused' and '[معلم]' in a.get('course_name',''):updates['absent_count']=max(0,int(current.get('absent_count') or 0)-1)
                if a['status']=='excused':updates['excuse_count']=max(0,int(current.get('excuse_count') or 0)-1)
                _,removed,_=cloud('attendance',{'id':'eq.'+aid},'DELETE')
                if not removed:raise APIError(409,'الرصد أُلغي بالفعل')
                _,updated,_=cloud('enrollments',{'id':'eq.'+str(en['id']),'remaining_credits':'eq.'+str(before)},'PATCH',updates)
                if not updated:raise APIError(409,'حُذف الرصد لكن الرصيد تغير قبل الإرجاع؛ راجع الاشتراك يدوياً ولا تكرر الإلغاء')
                audit_event(user,'إلغاء رصد',{'student_id':en['student_id'],'attendance_id':int(aid),'refund':refund,'reason':reason,'removed_record':a})
                return {'success':True,'after':before+refund}
            return self.send(200,operation(user,b,'undo',undo))
        if action=='ticket':
            tid=identifier(b.get('ticket_id'));values={};status=b.get('status')
            if status not in {'open','replied','closed'}:raise APIError(400,'حالة تذكرة غير صالحة')
            values['status']=status
            if 'reply' in b:
                reply=str(b['reply']).strip()
                if not reply or len(reply)>6000:raise APIError(400,'اكتب رداً مناسباً')
                values['admin_reply']=reply
            values['updated_at']=dt.datetime.now(dt.timezone.utc).isoformat()
            def ticket_update():
                old=rows('support_tickets',{'id':'eq.'+tid})
                if not old:raise APIError(404,'التذكرة غير موجودة')
                if old[0].get('updated_at')!=b.get('expected'):raise APIError(409,'التذكرة تغيرت؛ أعد فتحها')
                cloud('support_tickets',{'id':'eq.'+tid},'PATCH',values)
                audit_event(user,'تحديث تذكرة دعم',{'ticket_id':int(tid),'status':status})
                return {'success':True}
            return self.send(200,operation(user,b,'ticket',ticket_update))
        if action=='move':
            ids=b.get('enrollment_ids',[]);target=str(b.get('target',''));reason=str(b.get('reason','')).strip()
            if not isinstance(ids,list) or not 1<=len(ids)<=50 or len(set(ids))!=len(ids) or not target or not reason:raise APIError(400,'حدّد الطلاب والمجموعة وسبب النقل')
            def move():
                all_es=rows('enrollments');selected=[e for e in all_es if e['id'] in ids];dest=[e for e in all_es if e.get('group_id')==target]
                if len(selected)!=len(ids) or not dest:raise APIError(404,'المجموعة أو أحد الاشتراكات غير موجود')
                template=dest[0];keys=('teacher_id','course_name','subscription_days','lecture_time','session_duration')
                if any(any(e.get(k)!=template.get(k) for k in keys) for e in dest):raise APIError(409,'بيانات المجموعة المستقبلة غير متسقة؛ راجعها أولاً')
                if any(e.get('group_id')!=b.get('source') for e in selected):raise APIError(409,'أحد الطلاب انتقل بالفعل؛ حدّث القائمة')
                if target==b.get('source') or any(e['course_name']!=template['course_name'] for e in selected):raise APIError(400,'النقل يجب أن يكون إلى مجموعة أخرى من المسار نفسه')
                cs=rows('courses',{'name':'eq.'+template['course_name']});course=cs[0] if cs else {}
                cap=course.get('max_capacity')
                if not cap or len(dest)+len(selected)>cap:raise APIError(409,'المقاعد المتاحة لا تكفي وفق السعة المسجلة للمسار')
                students=rows('students',{'id':in_filter({e['student_id'] for e in selected})})
                if any(s.get('age') is not None and (course.get('min_age') is not None and s['age']<course['min_age'] or course.get('max_age') is not None and s['age']>course['max_age']) for s in students):raise APIError(409,'عمر أحد الطلاب خارج حدود المسار')
                changes={k:template.get(k) for k in keys if k!='course_name'};changes['group_id']=target
                _,updated,_=cloud('enrollments',{'id':in_filter(set(ids)),'group_id':'eq.'+str(b.get('source'))},'PATCH',changes)
                if len(updated or [])!=len(ids):raise APIError(409,'تغيرت بعض السجلات أثناء النقل؛ راجع المجموعتين قبل محاولة جديدة')
                audit_event(user,'نقل طلاب',{'enrollment_ids':ids,'from':b.get('source'),'to':target,'reason':reason})
                return {'success':True,'count':len(ids)}
            return self.send(200,operation(user,b,'move',move))
        raise APIError(404,'الإجراء غير متاح')

    def static(self,path):
        if self.command!='GET':raise APIError(405,'GET required')
        if path=='/':path='/login.html'
        if path.startswith('/local-assets/'):
            target=(ASSETS/path.removeprefix('/local-assets/')).resolve();base=ASSETS.resolve()
        else:
            target=(FRONT/urllib.parse.unquote(path).lstrip('/')).resolve();base=FRONT.resolve()
        if not target.is_relative_to(base) or target.suffix.lower() not in {'.html','.js','.css','.png','.jpg','.jpeg','.svg','.ico','.mp3','.wav','.pdf','.woff','.woff2'}:raise APIError(404,'غير موجود')
        if target.name in {'api_mock.js','db_seed.json'}:raise APIError(404,'البيانات التجريبية غير مفعّلة')
        if not target.is_file():raise APIError(404,'الملف غير موجود')
        if target.suffix=='.html':
            name=target.name;user=self.session(False)
            if name in {'student.html','teacher.html','admin.html'}:
                needed={'student.html':'student','teacher.html':'teacher','admin.html':'admin'}[name]
                if not user:return self.send(302,b'',extra={'Location':'/admin-login.html' if needed=='admin' else '/login.html'})
                if user['role']!=needed and user['role']!='admin' and not (user['role']=='teacher' and needed=='student'):raise APIError(403,'هذه البوابة ليست ضمن صلاحية الحساب')
            html=target.read_text(encoding='utf-8-sig')
            html=re.sub(r'<script\b[^>]*src=["\']js/api_mock\.js[^"\']*["\'][^>]*>\s*</script>','',html)
            html=html.replace('maximum-scale=1.0, user-scalable=no, ','')
            html=html.replace('<head>','<head><script src="/js/local-session.js"></script><link rel="stylesheet" href="/local-assets/live.css">',1)
            html=html.replace('</head>','<script defer src="/local-assets/supervisor.js"></script><script defer src="/local-assets/live.js"></script></head>',1)
            # Disable mock default objects and placeholder names in the initial DOM.
            html=html.replace('>عمر</span>','>…</span>').replace('images/logo-wide.png','images/monir_logo_trans.png')
            if name=='admin.html':html=html.replace('images/monir_logo_white.png','images/monir_logo_trans.png')
            if name=='student.html':
                html=re.sub(r'<script\b[^>]*src=["\']js/(?:student|student_ledger)\.js[^"\']*["\'][^>]*>\s*</script>','',html)
            if name=='teacher.html':
                html=html.replace('setInterval(syncTeacherDisplay, 4000);','').replace('setTimeout(syncTeacherDisplay, 600);','').replace('setTimeout(syncTeacherDisplay, 2000);','')
                legacy_ids=['teacherName','teacherContact','teacherSpecialty','statStudentCount','statGroupCount','teacherGroupsCount','searchInput']
                compat=''.join('<span id="'+id+'"></span>' for id in legacy_ids if not re.search(r'\bid=["\']'+id+r'["\']',html))
                html=html.replace('</header>','</header><div hidden aria-hidden="true">'+compat+'</div>',1)
            html=re.sub(r'(<script\b[^>]*src=["\']js/supabase_client\.js[^>]*>\s*</script>)',r'\1<script src="/local-assets/cloud-mode.js"></script>',html)
            return self.send(200,html,'text/html; charset=utf-8')
        if target.name=='supabase_client.js':
            source=target.read_text(encoding='utf-8-sig')
            source=re.sub(r"window.MONIR_SUPABASE_CONFIG = window.MONIR_SUPABASE_CONFIG \|\| \{[\s\S]*?\};","window.MONIR_SUPABASE_CONFIG = {url:location.origin+'/_cloud',anonKey:'local-session'};",source,count=1)
            return self.send(200,source,'text/javascript; charset=utf-8')
        return self.send(200,target.read_bytes(),mimetypes.guess_type(target.name)[0] or 'application/octet-stream')

def validate_runtime():
    if not FRONT.exists() or not URL or not KEY:raise SystemExit('Set SUPABASE_URL and SUPABASE_ANON_KEY in the server environment before starting.')
    if not URL.startswith('https://'):raise SystemExit('SUPABASE_URL must use HTTPS.')
    origin=urllib.parse.urlsplit(PUBLIC_ORIGIN)
    if PRODUCTION and (origin.scheme!='https' or not origin.netloc or origin.path or origin.query or origin.fragment or origin.username):raise SystemExit('Production requires PUBLIC_ORIGIN as the exact HTTPS origin, without a path.')
    if REQUIRE_PERSISTENT_DISK and not os.path.ismount(STATE_DIR):
        raise SystemExit('DATA_DIR must be the mounted persistent disk; refusing ephemeral operation storage.')
    # Fail before accepting requests if the operation journal cannot be written.
    with closing(sqlite3.connect(AUDIT_DB)) as db:
        with db:
            db.execute('CREATE TABLE IF NOT EXISTS operations (key TEXT PRIMARY KEY, fingerprint TEXT, state TEXT, response TEXT)')

def main():
    p=argparse.ArgumentParser();p.add_argument('--port',type=int,default=int(os.environ.get('PORT','8010')));args=p.parse_args()
    validate_runtime()
    bind='0.0.0.0' if PRODUCTION else '127.0.0.1'
    server=ThreadingHTTPServer((bind,args.port),Handler)
    print('Mounir Academy ready on port '+str(args.port),flush=True)
    try:server.serve_forever()
    except KeyboardInterrupt:pass
    finally:server.server_close()
if __name__=='__main__':main()
