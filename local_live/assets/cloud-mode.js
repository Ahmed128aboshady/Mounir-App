/* Local live gateway: no seeded objects, fallback database or false success. */
(()=>{
  'use strict';
  const nativeFetch=window.fetch.bind(window);
  window.liveRequest=async(path,options={})=>{
    const response=await nativeFetch(path,{credentials:'same-origin',...options});
    const data=await response.json();
    if(!response.ok)throw new Error(data.detail||data.message||'تعذّر تحميل البيانات');
    return data;
  };
  window.fetch=async(resource,options)=>{
    const response=await nativeFetch(resource,options);
    const url=typeof resource==='string'?resource:resource?.url||'';
    if(url.startsWith('/api/')&&!response.ok){
      const data=await response.clone().json().catch(()=>({}));
      const message=data.detail||data.message||'تعذّر تنفيذ الطلب';
      if(!url.startsWith('/api/auth/login'))window.dispatchEvent(new CustomEvent('mounir:error',{detail:message}));
      throw new Error(message);
    }
    return response;
  };
  if(!window.MonirDB)return;
  MonirDB.syncFromCloud=async()=>{};
  MonirDB.login=async(username,password,expectedRole)=>{
    try{return await liveRequest('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password,expected_role:expectedRole})});}
    catch(e){return {success:false,error:e.message};}
  };
  MonirDB.getStudentProfile=async(id)=>liveRequest('/api/student/'+encodeURIComponent(id));
  const get=MonirDB.getClient.bind(MonirDB);
  MonirDB.getClient=()=>{
    const client=get();
    if(client&&!client.__localLive){
      client.__localLive=true;
      // Realtime websocket is not proxied; existing periodic refresh remains active.
      client.channel=()=>{const c={on(){return c},subscribe(){return c},unsubscribe(){}};return c;};
    }
    return client;
  };
  MonirDB.getClient();
  window.liveLogout=async()=>{
    await liveRequest('/api/auth/logout',{method:'POST'});
    localStorage.removeItem('monir_current_user');localStorage.removeItem('monir_auth_token');
    location.href='/login.html';
  };
})();
