const qs=s=>document.querySelector(s),qsa=s=>document.querySelectorAll(s)
const state={user:null,plan:{},token:null,online:false}
const els={
  btnLogin:qs('#btn-login'),
  btnRegister:qs('#btn-register'),
  btnUser:qs('#btn-user'),
  btnLogout:qs('#btn-logout'),
  btnMenu:qs('#btn-menu'),
  clockTime:qs('#clock-time'),
  navLinks:qs('.nav-links'),
  navOverlay:qs('#nav-overlay'),
  authModal:qs('#auth-modal'),
  authOverlay:qs('#auth-overlay'),
  authClose:qs('#auth-close'),
  tabBtns:qsa('.tab-btn'),
  tabLogin:qs('#tab-login'),
  tabRegister:qs('#tab-register'),
  formLogin:qs('#form-login'),
  formRegister:qs('#form-register'),
  loginError:qs('#login-error'),
  forgotPassword:qs('#forgot-password'),
  lockLogin:qs('#lock-login'),
  lockRegister:qs('#lock-register'),
  alunoLocked:qs('#aluno-locked'),
  alunoArea:qs('#aluno-area'),
  alunoUserName:qs('#aluno-user-name'),
  alunoUserMail:qs('#aluno-user-mail'),
  selectDay:qs('#select-day'),
  planBody:qs('#plan-body'),
  btnAddRow:qs('#btn-add-row'),
  btnSave:qs('#btn-save'),
  btnClear:qs('#btn-clear'),
  btnExport:qs('#btn-export'),
  ctaStart:qs('#cta-start'),
  ctaSee:qs('#cta-see'),
  daySummaryCard:qs('#day-summary-card'),
  dayEmoji:qs('#day-emoji'),
  dayName:qs('#day-name'),
  daySubtitle:qs('#day-subtitle'),
  dayExercisesSummary:qs('#day-exercises-summary'),
  remindersBanner:qs('#reminders-banner'),
  remindersContent:qs('#reminders-content'),
  closeReminders:qs('#close-reminders')
}
function openModal(){els.authModal.classList.remove('hidden');els.authModal.setAttribute('aria-hidden','false')}
function closeModal(){els.authModal.classList.add('hidden');els.authModal.setAttribute('aria-hidden','true')}
function switchTab(tab){els.tabBtns.forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));els.tabLogin.classList.toggle('hidden',tab!=='login');els.tabRegister.classList.toggle('hidden',tab!=='register');hideLoginError()}
function showLoginError(){els.loginError.classList.remove('hidden')}
function hideLoginError(){els.loginError.classList.add('hidden')}
function saveUser(u){localStorage.setItem('gymUser',JSON.stringify(u))}
function loadUser(){try{return JSON.parse(localStorage.getItem('gymUser'))||null}catch{return null}}
function saveToken(t){localStorage.setItem('gymToken',t||'')}
function loadToken(){return localStorage.getItem('gymToken')||''}
function setUser(u){state.user=u;updateUserUI()}
function updateUserUI(){
  const logged=!!state.user
  els.btnLogin.classList.toggle('hidden',logged)
  els.btnRegister.classList.toggle('hidden',logged)
  els.btnUser.classList.toggle('hidden',!logged)
  els.btnLogout.classList.toggle('hidden',!logged)
  els.alunoLocked.classList.toggle('hidden',logged)
  els.alunoArea.classList.toggle('hidden',!logged)
  if(logged){els.btnUser.textContent=state.user.name.split(' ')[0];els.alunoUserName.textContent=state.user.name;els.alunoUserMail.textContent=state.user.email;loadPlan();renderDay()}
}
function updateClock(){
  const now=new Date()
  const h=String(now.getHours()).padStart(2,'0')
  const m=String(now.getMinutes()).padStart(2,'0')
  const s=String(now.getSeconds()).padStart(2,'0')
  els.clockTime.textContent=`${h}:${m}:${s}`
}
function loadPlan(){
  const key=`plan:${state.user.email}`
  if(state.online&&state.token){apiGetPlan().then(p=>{state.plan=p||defaultPlan();renderDay()})}
  else{try{state.plan=JSON.parse(localStorage.getItem(key))||defaultPlan()}catch{state.plan=defaultPlan()}}
}
function savePlan(){const key=`plan:${state.user.email}`;localStorage.setItem(key,JSON.stringify(state.plan));if(state.online&&state.token){apiSavePlan()}}
function defaultPlan(){return{Segunda:[],Terça:[],Quarta:[],Quinta:[],Sexta:[],Sábado:[],Domingo:[]}}
function renderDay(){
  const day=els.selectDay.value
  const rows=state.plan[day]||[]
  els.planBody.innerHTML=''
  rows.forEach((r,i)=>addRow(r,i))
  const countEl=qs('#exercise-count')
  if(countEl){countEl.textContent=`${rows.length} exercício${rows.length!==1?'s':''}`}
  renderDaySummary()
}
function getDayEmoji(day){
  const emojis={Segunda:'🌙',Terça:'💪',Quarta:'⚡',Quinta:'🔥',Sexta:'💯',Sábado:'🚀',Domingo:'☀️'}
  return emojis[day]||'📅'
}
function renderDaySummary(){
  const day=els.selectDay.value
  const rows=state.plan[day]||[]
  
  if(rows.length===0){
    els.daySummaryCard.style.display='none'
    return
  }
  
  els.daySummaryCard.style.display='block'
  els.dayEmoji.textContent=getDayEmoji(day)
  els.dayName.textContent=day
  els.daySubtitle.textContent=`${rows.length} exercício${rows.length!==1?'s':''} para executar`
  
  els.dayExercisesSummary.innerHTML=rows.map((r,i)=>`
    <div style="background:#0f0f0f;border:1px solid #1d1d1d;border-radius:8px;padding:10px;display:flex;justify-content:space-between;align-items:center;font-size:12px">
      <div>
        <strong style="color:var(--primary)">${i+1}. ${r.ex||'—'}</strong><br>
        <span style="color:var(--muted)">${r.series}×${r.reps} | ${r.weight} | ${r.rest}</span>
      </div>
      <span style="font-size:20px">🏋️</span>
    </div>
  `).join('')
}
function renderReminders(){
  try{
    const appointmentsStr=localStorage.getItem('medical-appointments')
    if(!appointmentsStr){
      els.remindersBanner.style.display='none'
      return
    }
    
    const allAppointments=JSON.parse(appointmentsStr)
    if(!Array.isArray(allAppointments)||allAppointments.length===0){
      els.remindersBanner.style.display='none'
      return
    }
    
    const today=new Date().toISOString().split('T')[0]
    const upcomingAppointments=allAppointments.filter(a=>a.date>=today).sort((a,b)=>new Date(a.date)-new Date(b.date))
    
    if(upcomingAppointments.length===0){
      els.remindersBanner.style.display='none'
      return
    }
    
    const nextAppointment=upcomingAppointments[0]
    const dateObj=new Date(nextAppointment.date+'T'+nextAppointment.time)
    const formatter=new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})
    const formattedDate=formatter.format(dateObj)
    
    els.remindersContent.innerHTML=`
      <div style="display:flex;align-items:center;gap:12px">
        <span style="font-size:18px">📅</span>
        <div>
          <strong style="color:var(--primary);display:block">Próxima avaliação médica</strong>
          <span style="color:var(--muted);font-size:13px">${formattedDate} com Dr(a). ${nextAppointment.doctor}</span>
        </div>
      </div>
    `
    els.remindersBanner.style.display='block'
  }catch(err){
    console.error('Erro ao carregar lembretes:',err)
    els.remindersBanner.style.display='none'
  }
}
function addRow(data={},idx=null){
  const card=document.createElement('div')
  card.style.cssText=`background:#0f0f0f;border:1px solid #1d1d1d;border-radius:10px;padding:12px;display:grid;gap:8px;animation:slideIn 0.3s ease-out;font-size:12px`
  card.innerHTML=`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <div><label style="color:var(--muted);font-size:10px">💪 Exercício</label><input placeholder="Ex: Supino" value="${data.ex||''}" style="width:100%;background:#141414;border:1px solid #222;color:var(--text);padding:6px;border-radius:6px;font-weight:600;font-size:12px"></div>
      <div><label style="color:var(--muted);font-size:10px">🔄 Séries×Reps</label><div style="display:flex;gap:4px"><input placeholder="3" value="${data.series||''}" inputmode="numeric" style="flex:1;background:#141414;border:1px solid #222;color:var(--text);padding:6px;border-radius:6px;text-align:center;font-size:12px"><span style="color:var(--muted);align-self:center">×</span><input placeholder="10" value="${data.reps||''}" inputmode="numeric" style="flex:1;background:#141414;border:1px solid #222;color:var(--text);padding:6px;border-radius:6px;text-align:center;font-size:12px"></div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <div><label style="color:var(--muted);font-size:10px">⚖️ Carga</label><input placeholder="40 kg" value="${data.weight||''}" style="width:100%;background:#141414;border:1px solid #222;color:var(--text);padding:6px;border-radius:6px;text-align:center;font-size:12px"></div>
      <div><label style="color:var(--muted);font-size:10px">⏱️ Descanso</label><input placeholder="60s" value="${data.rest||''}" style="width:100%;background:#141414;border:1px solid #222;color:var(--text);padding:6px;border-radius:6px;text-align:center;font-size:12px"></div>
    </div>
    <div><label style="color:var(--muted);font-size:10px">📝 Observações</label><textarea placeholder="Observações" style="width:100%;background:#141414;border:1px solid #222;color:var(--text);padding:6px;border-radius:6px;font-size:12px;resize:vertical;min-height:30px">${data.obs||''}</textarea></div>
    <div style="display:flex;gap:6px;justify-content:flex-end">
      <button class="btn btn-save-ex" title="Salvar exercício" style="background:rgba(255,204,0,.2);color:var(--primary);border:1px solid transparent;padding:6px 10px;border-radius:6px;cursor:pointer;font-size:12px;transition:all .2s;font-weight:600">💾</button>
      <button class="btn btn-del" title="Remover exercício" style="background:rgba(255,59,48,.2);color:#ff3b30;border:1px solid transparent;padding:6px 10px;border-radius:6px;cursor:pointer;font-size:12px;transition:all .2s;font-weight:600">🗑️</button>
    </div>
  `
  const btnSave=card.querySelector('.btn-save-ex')
  const btnDel=card.querySelector('.btn-del')
  
  btnSave.addEventListener('click',()=>{
    const inputs=[...card.querySelectorAll('input')]
    const [ex,series,reps,weight,rest]=[inputs[0],inputs[1],inputs[2],inputs[3],inputs[4]].map(i=>i.value.trim())
    const obs=card.querySelector('textarea').value.trim()
    if(ex){
      const row={ex,series,reps,weight,rest,obs}
      const i=[...els.planBody.children].indexOf(card)
      state.plan[els.selectDay.value][i]=row
      savePlan()
      renderDaySummary()
      btnSave.textContent='✅'
      setTimeout(()=>{btnSave.textContent='💾'},1500)
    }else{alert('❌ Preencha o nome do exercício!')}
  })
  
  btnDel.addEventListener('click',()=>{
    card.style.animation='slideOut 0.3s ease-out'
    setTimeout(()=>{
      const i=[...els.planBody.children].indexOf(card)
      state.plan[els.selectDay.value].splice(i,1)
      card.remove()
      savePlan()
      renderDaySummary()
      const countEl=qs('#exercise-count')
      if(countEl){const count=state.plan[els.selectDay.value].length;countEl.textContent=`${count} exercício${count!==1?'s':''}`}
    },300)
  })
  
  els.planBody.appendChild(card)
}
function collectRows(){
  const rows=[...els.planBody.querySelectorAll('div[style*="background:#0f0f0f"]')].map(card=>{
    const inputs=[...card.querySelectorAll('input')]
    const [ex,series,reps,weight,rest]=[inputs[0],inputs[1],inputs[2],inputs[3],inputs[4]].map(i=>i.value.trim())
    const obs=card.querySelector('textarea').value.trim()
    return{ex,series,reps,weight,rest,obs}
  })
  state.plan[els.selectDay.value]=rows
}
function exportJSON(){
  collectRows()
  const blob=new Blob([JSON.stringify(state.plan,null,2)],{type:'application/json'})
  const url=URL.createObjectURL(blob)
  const a=document.createElement('a')
  a.href=url;a.download='ficha_treino.json';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url)
}
function clearPlan(){state.plan=defaultPlan();renderDay();savePlan()}
function scrollReveal(){
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})
  },{threshold:.15})
  qsa('.reveal').forEach(el=>io.observe(el))
}
function openMenu(){els.navLinks.classList.add('open');els.navOverlay.classList.remove('hidden');els.btnMenu.setAttribute('aria-expanded','true')}
function closeMenu(){els.navLinks.classList.remove('open');els.navOverlay.classList.add('hidden');els.btnMenu.setAttribute('aria-expanded','false')}
function toggleMenu(){if(els.navLinks.classList.contains('open')){closeMenu()}else{openMenu()}}
const API='http://localhost:8081/api'
async function api(path,method,body){try{const r=await fetch(`${API}${path}`,{method,headers:{'Content-Type':'application/json','X-Auth-Token':state.token||''},body:body?JSON.stringify(body):undefined});if(!r.ok)return null;return await r.json()}catch{return null}}
async function ping(){const r=await api('/ping','GET');state.online=!!r}
async function apiRegister(name,email,password){const r=await api('/register','POST',{name,email,password});return r}
async function apiLogin(email,password){const r=await api('/login','POST',{email,password});return r}
async function apiGetPlan(){const r=await api('/plan','GET');return r?r.plan:null}
async function apiSavePlan(){const r=await api('/plan','PUT',{plan:state.plan});return !!r}
function init(){
  els.btnLogin.addEventListener('click',()=>{switchTab('login');openModal()})
  els.btnRegister.addEventListener('click',()=>{switchTab('register');openModal()})
  els.lockLogin.addEventListener('click',()=>{switchTab('login');openModal()})
  els.lockRegister.addEventListener('click',()=>{switchTab('register');openModal()})
  els.authClose.addEventListener('click',closeModal)
  els.authOverlay.addEventListener('click',closeModal)
  els.tabBtns.forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.tab)))
  els.formRegister.addEventListener('submit',e=>{
    e.preventDefault()
    const name=qs('#register-name').value.trim()
    const email=qs('#register-email').value.trim().toLowerCase()
    const password=qs('#register-password').value
    if(name&&email&&password.length>=6){if(state.online){apiRegister(name,email,password).then(r=>{if(r){state.token=r.token;saveToken(state.token);const u={name,email};saveUser({...u,password});setUser({...u,password});closeModal()}else{const u={name,email,password};saveUser(u);setUser(u);closeModal()}})}else{const u={name,email,password};saveUser(u);setUser(u);closeModal()}}
  })
  els.formLogin.addEventListener('submit',e=>{
    e.preventDefault()
    const email=qs('#login-email').value.trim().toLowerCase()
    const password=qs('#login-password').value
    hideLoginError()
    if(state.online){apiLogin(email,password).then(r=>{if(r){state.token=r.token;saveToken(state.token);const u={name:r.user.name,email};saveUser({...u,password});setUser({...u,password});closeModal()}else{const u=loadUser();if(u&&u.email===email&&u.password===password){setUser(u);closeModal()}else{showLoginError()}}})}
    else{const u=loadUser();if(u&&u.email===email&&u.password===password){setUser(u);closeModal()}else{showLoginError()}}
  })
  els.btnLogout.addEventListener('click',()=>{setUser(null)})
  els.btnAddRow.addEventListener('click',()=>addRow({}))
  els.selectDay.addEventListener('change',renderDay)
  els.btnSave.addEventListener('click',()=>{collectRows();savePlan()})
  els.btnClear.addEventListener('click',clearPlan)
  els.btnMenu.addEventListener('click',toggleMenu)
  els.navOverlay.addEventListener('click',closeMenu)
  qsa('.nav-link').forEach(l=>l.addEventListener('click',closeMenu))
  els.ctaStart.addEventListener('click',()=>{location.href='conhecer.html'})
  els.ctaSee.addEventListener('click',()=>{location.hash='#plans'})
  qsa('.plan-signup').forEach(btn=>btn.addEventListener('click',()=>{switchTab('register');openModal()}))
  els.forgotPassword.addEventListener('click',e=>{e.preventDefault();alert('📧 Um link de recuperação será enviado para seu email em breve. Verifique sua caixa de entrada (e spam).')})
   els.closeReminders.addEventListener('click',()=>{els.remindersBanner.style.display='none'})
  updateClock()
  setInterval(updateClock,1000)
  state.token=loadToken()
  ping().then(()=>{const u=loadUser();if(u){setUser(u)}else{updateUserUI()}})
   renderReminders()
  scrollReveal()
}
document.addEventListener('DOMContentLoaded',init)