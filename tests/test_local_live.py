"""Isolated integration tests. All cloud I/O is replaced; never writes production."""
import copy,importlib.util,json,pathlib,threading,urllib.request,urllib.error,http.cookiejar,unittest,sys,time
ROOT=pathlib.Path(__file__).resolve().parents[1]/'local_live'
spec=importlib.util.spec_from_file_location('mounir_test_server',ROOT/'local_live_server.py')
app=importlib.util.module_from_spec(spec);spec.loader.exec_module(app)
app.FRONT=ROOT.parent/'frontend'
app.ASSETS=ROOT/'assets'
FIXTURE={
 'users':[{'id':1,'username':'qa_student','password_hash':'qa_only','role':'student','related_id':11,'full_name':'طالب اختبار آلي'},{'id':2,'username':'qa_teacher','password_hash':'qa_only','role':'teacher','related_id':21,'full_name':'معلم اختبار آلي'},{'id':3,'username':'qa_admin','password_hash':'qa_only','role':'admin','full_name':'مشرف اختبار آلي'},{'id':4,'username':'qa_view','password_hash':'qa_only','role':'admin','full_name':'مشاهدة','is_read_only':True}],
 'students':[{'id':11,'name':'طالب اختبار آلي','student_code':'QA11','age':9,'status':'active','qr_code':'QA-G1','parent_phone':'PRIVATE','phone':'PRIVATE'},{'id':12,'name':'طالب خارج النطاق','student_code':'QA12','age':10,'status':'active','qr_code':'QA-G2','parent_phone':'PRIVATE'}],
 'teachers':[{'id':21,'name':'معلم اختبار آلي','bio':'https://meet.google.com/abc-defg-hij','rate_per_session':50,'specialty':'قرآن'},{'id':22,'name':'معلم آخر','rate_per_session':50}],
 'enrollments':[{'id':31,'student_id':11,'teacher_id':21,'course_name':'مسار اختبار','remaining_credits':4,'present_count':2,'absent_count':1,'group_id':'QA-G1','status':'active','subscription_days':'الأحد، الخميس','lecture_time':'17:00','session_duration':'40','current_surah':'الملك','current_aya':5,'total_lectures_unlocked':4},{'id':32,'student_id':12,'teacher_id':22,'course_name':'مسار اختبار','remaining_credits':6,'present_count':1,'group_id':'QA-G2','status':'active'}],
 'courses':[{'id':1,'name':'مسار اختبار','price_per_block':350,'total_lectures':8,'max_capacity':6}],
 'attendance':[{'id':41,'student_id':11,'course_name':'مسار اختبار','status':'present','joined_at':'2026-10-28T17:00:00Z'}],
 'support_tickets':[], 'teacher_payouts':[], 'payments':[], 'notifications':[],
 'lectures':[{'id':51,'course_name':'مسار اختبار','lecture_number':1,'title':'محاضرة اختبار','scheduled_time':'2026-10-29T17:00:00Z','google_meet_url':'https://meet.google.com/abc-defg-hij'}],
 'quizzes':[{'id':61,'course_name':'مسار اختبار','title':'اختبار آلي','description':'{}'}],
 'quiz_questions':[{'id':71,'quiz_id':61,'question_text':'سؤال اختبار','option_a':'أ','option_b':'ب','correct_answer':'a','points':2}], 'quiz_submissions':[]}
DB=copy.deepcopy(FIXTURE);WRITES=[]
def fake_cloud(table,query=None,method='GET',payload=None,headers=None):
 q=list((query or {}).items()) if isinstance(query,dict) else list(query or [])
 data=DB[table]
 def match(r):
  for k,v in q:
   v=str(v)
   if k in {'select','order','limit','offset','or','and'}:continue
   if v.startswith('eq.') and str(r.get(k))!=v[3:]:
    try:
     if float(r.get(k))==float(v[3:]):continue
    except (TypeError,ValueError):pass
    return False
   if v.startswith('ilike.') and str(r.get(k,'')).lower()!=v[6:].lower():return False
   if v.startswith('in.(') and str(r.get(k)) not in v[4:-1].split(','):return False
   if v.startswith('like.') and v[5:].strip('*') not in str(r.get(k,'')):return False
  return True
 found=[r for r in data if match(r)]
 if method=='GET':
  result=copy.deepcopy(found)
  if table=='enrollments':
   for e in result:
    e['students']=copy.deepcopy(next(x for x in DB['students'] if x['id']==e['student_id']))
    e['teachers']=copy.deepcopy(next(x for x in DB['teachers'] if x['id']==e['teacher_id']))
  offset=int(dict(q).get('offset',0));limit=int(dict(q).get('limit',1000));result=result[offset:offset+limit]
  if headers and 'object+json' in str(headers.get('Accept','')):result=result[0] if result else None
  return 200,result,{'Content-Range':f'0-{max(0,len(found)-1)}/{len(found)}'}
 WRITES.append((table,method,copy.deepcopy(payload)))
 if method=='POST':
  added=copy.deepcopy(payload if isinstance(payload,list) else [payload])
  for x in added:x.setdefault('id',max([r.get('id',0) for r in data]+[0])+1);data.append(x)
  return 201,added,{}
 if method=='PATCH':
  for x in found:x.update(payload)
  return 200,copy.deepcopy(found),{}
 if method=='DELETE':
  for x in found:data.remove(x)
  return 200,copy.deepcopy(found),{}
app.cloud=fake_cloud

class Tests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.server=app.ThreadingHTTPServer(('127.0.0.1',0),app.Handler);cls.url='http://127.0.0.1:'+str(cls.server.server_port)
  threading.Thread(target=cls.server.serve_forever,daemon=True).start()
 @classmethod
 def tearDownClass(cls):cls.server.shutdown();cls.server.server_close()
 def setUp(self):
  global DB;DB=copy.deepcopy(FIXTURE);WRITES.clear();app.LOGIN_ATTEMPTS.clear()
  self.client=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
 def call(self,path,data=None,method=None):
  r=urllib.request.Request(self.url+path,data=json.dumps(data).encode() if data is not None else None,headers={'Content-Type':'application/json'},method=method)
  try:
   with self.client.open(r) as response:raw=response.read();return response.status,json.loads(raw) if 'application/json' in response.headers.get('Content-Type','') else raw.decode()
  except urllib.error.HTTPError as e:return e.code,json.load(e)
 def login(self,role):return self.call('/api/auth/login',{'username':'qa_'+role,'password':'qa_only'})
 def test_auth_and_invalid_password(self):
  self.assertEqual(self.call('/api/students')[0],401)
  self.assertEqual(self.call('/api/auth/login',{'username':'qa_student','password':'wrong'})[0],401)
  status,res=self.login('student');self.assertEqual(status,200);self.assertNotIn('password_hash',res['user'])
  self.assertEqual(self.call('/api/admin/overview')[0],403)
  self.assertEqual(self.call('/api/student/12')[0],404)
 def test_scoped_reads_and_writes(self):
  self.login('teacher');data=self.call('/_cloud/rest/v1/students?select=*')[1]
  self.assertEqual(len(data),1);self.assertNotIn('parent_phone',data[0])
  self.assertEqual(self.call('/_cloud/rest/v1/users?select=*')[0],403)
  self.assertEqual(self.call('/_cloud/rest/v1/attendance',{'student_id':12,'status':'present'},'POST')[0],403)
  self.assertFalse(WRITES)
 def test_readonly(self):
  self.login('view');self.assertEqual(self.call('/api/admin/overview')[0],200)
  self.assertEqual(self.call('/_cloud/rest/v1/students?id=eq.11',{'status':'inactive'},'PATCH')[0],403)
  self.assertFalse(WRITES)
 def test_topup_scope_and_retry(self):
  self.login('admin');body={'student_id':11,'enrollment_id':31,'credits':4,'expected_credits':4,'amount':350,'reason':'test only','operation_id':__import__('uuid').uuid4().hex}
  self.assertEqual(self.call('/api/live/topup',body)[0],200)
  self.assertEqual(DB['enrollments'][0]['remaining_credits'],8);self.assertEqual(DB['enrollments'][1]['remaining_credits'],6)
  self.assertEqual(self.call('/api/live/topup',body)[0],200);self.assertEqual(len(DB['payments']),1)
 def test_real_ticket_only_after_write(self):
  self.login('teacher');self.assertEqual(self.call('/api/live/tickets',{'subject':'test','message':'test'})[0],200)
  self.assertEqual(len(DB['support_tickets']),1);self.assertIn('[معلم #21]',DB['support_tickets'][0]['student_name'])
 def test_quiz_server_grading_and_duplicate(self):
  self.login('student');q=self.call('/api/live/quizzes/61')[1];self.assertNotIn('correct_answer',q['questions'][0])
  status,r=self.call('/api/live/quizzes/61/submit',{'answers':{'71':'a'}});self.assertEqual(status,200);self.assertEqual(r['score'],2)
  self.assertEqual(self.call('/api/live/quizzes/61/submit',{'answers':{'71':'a'}})[0],409)
 def test_pages_no_mock(self):
  for role,page in [('student','student'),('teacher','teacher'),('admin','admin')]:
   self.login(role);status,html=self.call('/'+page+'.html');self.assertEqual(status,200)
   self.assertNotIn('src="js/api_mock.js',html);self.assertIn('/local-assets/live.js',html)
  self.assertEqual(self.call('/js/db_seed.json')[0],404)
 def test_logout_invalidates_cookie(self):
  self.login('student');self.assertEqual(self.call('/api/auth/logout',{})[0],200);self.assertEqual(self.call('/api/auth/me')[0],401)
 def action(self,name,body):
  body.setdefault('operation_id',__import__('uuid').uuid4().hex)
  return self.call('/api/live/manage/'+name,body)
 def test_supervisor_scoped_lists_and_cairo(self):
  self.login('teacher');status,data=self.call('/api/live/manage/students');self.assertEqual(status,200);self.assertEqual([s['id'] for s in data],[11]);self.assertNotIn('parent_phone',data[0])
  status,data=self.call('/api/live/manage/attendance?date=2026-10-28');self.assertEqual(status,200);self.assertEqual(len(data),1)
 def test_attendance_deduction_duplicate_and_undo(self):
  self.login('admin');day=app.dt.datetime.now(app.ZoneInfo('Africa/Cairo')).date().isoformat()
  body={'enrollment_id':31,'date':day,'status':'present','expected_credits':4}
  code,res=self.action('record',body);self.assertEqual(code,200,res);self.assertEqual(DB['enrollments'][0]['remaining_credits'],3)
  self.assertEqual(self.action('record',body)[0],200);self.assertEqual(DB['enrollments'][0]['present_count'],3)
  self.assertEqual(self.action('record',{**body,'operation_id':__import__('uuid').uuid4().hex,'expected_credits':3})[0],409)
  aid=DB['attendance'][-1]['id'];code,res=self.action('undo',{'enrollment_id':31,'attendance_id':aid,'expected_credits':3,'refund':1,'reason':'تصحيح اختبار'})
  self.assertEqual(code,200,res);self.assertEqual(DB['enrollments'][0]['remaining_credits'],4);self.assertEqual(DB['enrollments'][0]['present_count'],2)
 def test_teacher_no_zero_credit_and_no_supervisor_actions(self):
  self.login('teacher');DB['enrollments'][0]['remaining_credits']=0;day=app.dt.datetime.now(app.ZoneInfo('Africa/Cairo')).date().isoformat()
  self.assertEqual(self.action('record',{'enrollment_id':31,'date':day,'status':'present','expected_credits':0})[0],409)
  self.assertEqual(self.action('status',{'student_id':11,'status':'inactive','expected_status':'active','reason':'test'})[0],403);self.assertFalse(WRITES)
 def test_status_profile_plan_conflicts(self):
  self.login('admin');self.assertEqual(self.action('status',{'student_id':11,'status':'inactive','expected_status':'active','reason':'test'})[0],200)
  self.assertEqual(self.action('status',{'student_id':11,'status':'active','expected_status':'active','reason':'stale'})[0],409)
  self.assertEqual(self.action('profile',{'student_id':11,'values':{'age':10},'expected':{'age':9}})[0],200)
  self.assertEqual(self.action('profile',{'student_id':11,'values':{'age':11},'expected':{'age':9}})[0],409)
  self.assertEqual(self.action('plan',{'enrollment_id':31,'expected':'الملك','plan':{'hifz':'النبأ'}})[0],200)
 def test_group_move_keeps_balance(self):
  self.login('admin');code,res=self.action('move',{'source':'QA-G1','target':'QA-G2','enrollment_ids':[31],'reason':'test'})
  self.assertEqual(code,200,res);self.assertEqual(DB['enrollments'][0]['teacher_id'],22);self.assertEqual(DB['enrollments'][0]['remaining_credits'],4)
 def test_ticket_state_and_reply(self):
  self.login('student');self.call('/api/live/tickets',{'subject':'test','message':'test'});self.login('admin');t=DB['support_tickets'][0]
  code,res=self.action('ticket',{'ticket_id':t['id'],'expected':t.get('updated_at'),'status':'replied','reply':'رد اختبار'})
  self.assertEqual(code,200,res);self.assertEqual(t['admin_reply'],'رد اختبار')
 def test_current_question_schema(self):
  DB['quiz_questions'][0]['correct_option']='b';self.login('student');q=self.call('/api/live/quizzes/61')[1];self.assertNotIn('correct_option',q['questions'][0])
  code,res=self.call('/api/live/quizzes/61/submit',{'answers':{'71':'b'}});self.assertEqual(code,200);self.assertEqual(res['score'],2)
 def test_teacher_can_undo_own_local_record(self):
  self.login('teacher');day=app.dt.datetime.now(app.ZoneInfo('Africa/Cairo')).date().isoformat()
  code,res=self.action('record',{'enrollment_id':31,'date':day,'status':'present','expected_credits':4});self.assertEqual(code,200,res)
  aid=DB['attendance'][-1]['id'];code,res=self.action('undo',{'enrollment_id':31,'attendance_id':aid,'expected_credits':3,'refund':1,'reason':'test'})
  self.assertEqual(code,200,res);self.assertEqual(DB['enrollments'][0]['remaining_credits'],4)
 def test_group_edit_scope_conflict_and_balance(self):
  self.login('admin');body={'group_id':'QA-G1','teacher_id':21,'course_name':'مسار اختبار','enrollment_ids':[31],'expected':{'lecture_time':'17:00'},'values':{'teacher_id':22,'subscription_days':'الاثنين','lecture_time':'18:00','session_duration':45}}
  code,res=self.action('group',body);self.assertEqual(code,200,res);self.assertEqual(DB['enrollments'][0]['remaining_credits'],4);self.assertEqual(DB['enrollments'][0]['teacher_id'],22)
  self.assertEqual(self.action('group',{**body,'operation_id':__import__('uuid').uuid4().hex})[0],409)
 def test_quiz_creation_and_published_questions(self):
  self.login('admin');body={'values':{'title':'اختبار جديد','course_name':'مسار اختبار','description':'{}','time_limit_minutes':20},'questions':[{'question_text':'سؤال','option_a':'أ','option_b':'ب','option_c':'ج','option_d':'د','correct_option':'a','points':2}]}
  code,res=self.action('quiz',body);self.assertEqual(code,200,res);qid=res['id'];self.assertEqual(len([q for q in DB['quiz_questions'] if q['quiz_id']==qid]),1)
  self.login('student');self.assertEqual(self.call('/api/live/quizzes/'+str(qid))[0],200)
 def test_teacher_and_lecture_forms_validate(self):
  self.login('admin');code,res=self.action('teacher',{'id':21,'expected':{'rate_per_session':50},'values':{'rate_per_session':75,'bio':'https://meet.google.com/abc-defg-hij'}});self.assertEqual(code,200,res)
  self.assertEqual(self.action('lecture',{'id':51,'values':{'duration_minutes':0}})[0],400)
  self.assertEqual(self.action('lecture',{'id':51,'values':{'duration_minutes':45,'status':'completed'}})[0],200)
 def test_admin_alias_requires_real_password_and_admin_role(self):
  DB['users'][2]['username']='mounir'
  self.assertEqual(self.call('/api/auth/login',{'username':'admin','password':'wrong','expected_role':'admin'})[0],401)
  status,result=self.call('/api/auth/login',{'username':' admin ','password':' qa_only ','expected_role':'admin'})
  self.assertEqual(status,200,result);self.assertEqual(result['user']['username'],'mounir');self.assertNotIn('password_hash',result['user'])
  DB['users'][2]['role']='student'
  self.assertEqual(self.call('/api/auth/login',{'username':'admin','password':'qa_only','expected_role':'admin'})[0],401)
 def test_readonly_alias_keeps_readonly(self):
  DB['users'][3]['username']='mounirview'
  code,result=self.call('/api/auth/login',{'username':'view','password':'qa_only','expected_role':'admin'})
  self.assertEqual(code,200,result);self.assertEqual(self.action('status',{'student_id':11,'status':'inactive','expected_status':'active','reason':'test'})[0],403)
 def test_untrusted_host_and_origin_rejected(self):
  for headers in [{'Host':'attacker.invalid'},{'Origin':'https://attacker.invalid'}]:
   request=urllib.request.Request(self.url+'/api/auth/login',data=b'{}',headers={'Content-Type':'application/json',**headers})
   with self.assertRaises(urllib.error.HTTPError) as result:self.client.open(request)
   self.assertEqual(result.exception.code,403)
 def test_runtime_and_configuration_files_are_not_public(self):
  for path in ['/.env','/.runtime/operations.sqlite3','/local_live/local_live_server.py']:
   self.assertEqual(self.call(path)[0],404)

if __name__=='__main__':
 if '--serve-fixture' in sys.argv:
  server=app.ThreadingHTTPServer(('127.0.0.1',8011),app.Handler)
  print('Isolated QA fixture server on 8011; cloud I/O replaced',flush=True)
  server.serve_forever()
 else:unittest.main()
