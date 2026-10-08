(function(){
'use strict';

const a=SanadAuth;
const tabs=document.querySelectorAll('.auth-tab');

function open(n){
  tabs.forEach(b=>b.classList.toggle('active',b.dataset.tab===n));
  document.querySelectorAll('.auth-panel').forEach(p=>p.classList.toggle('active',p.id==='panel-'+n));
}

tabs.forEach(b=>b.addEventListener('click',()=>open(b.dataset.tab)));

document.querySelectorAll('[data-toggle-password]').forEach(b=>{
  b.addEventListener('click',()=>{
    const i=document.getElementById(b.dataset.togglePassword);
    const visible=i.type==='password';
    i.type=visible?'text':'password';
    b.setAttribute('aria-label',visible?'إخفاء كلمة المرور':'إظهار كلمة المرور');
    b.title=visible?'إخفاء كلمة المرور':'إظهار كلمة المرور';
    const icon=b.querySelector('.eye-icon');
    if(icon) icon.textContent=visible?'◎':'◉';
  });
});

function msg(id,t,type='error'){
  const e=document.getElementById(id);
  e.textContent=t;
  e.className='form-message '+type;
}

function passwordScore(value){
  const p=String(value||'');
  const rules={
    length:p.length>=8,
    lower:/[a-z]/.test(p),
    upper:/[A-Z]/.test(p),
    number:/\d/.test(p),
    special:/[^A-Za-z0-9\s]/.test(p)
  };
  const score=Object.values(rules).filter(Boolean).length;
  return {rules,score};
}

function updateStrength(input,box){
  if(!input||!box)return;
  const {rules,score}=passwordScore(input.value);
  const label=box.querySelector('.strength-label');
  const bars=[...box.querySelectorAll('.strength-bars i')];
  const levels=input.value ? (score<=2?1:score===3?2:score===4?3:4) : 0;
  const names=['أدخل كلمة مرور','ضعيفة','متوسطة','قوية','قوية جداً'];
  label.textContent=names[levels];
  box.dataset.level=levels;
  bars.forEach((bar,i)=>bar.classList.toggle('filled',i<levels));
  box.querySelectorAll('[data-rule]').forEach(item=>{
    const key=item.dataset.rule;
    item.classList.toggle('valid',!!rules[key]);
  });
  return {score,rules};
}

function updateConfirm(){
  const p=document.getElementById('register-password');
  const c=document.getElementById('register-confirm');
  const status=document.getElementById('register-confirm-status');
  if(!p||!c||!status)return true;
  if(!c.value){
    status.textContent='';
    c.classList.remove('input-valid','input-invalid');
    return true;
  }
  const ok=p.value===c.value;
  status.textContent=ok?'✓ كلمتا المرور متطابقتان':'✕ كلمتا المرور غير متطابقتين';
  status.className='confirm-status '+(ok?'valid':'invalid');
  c.classList.toggle('input-valid',ok);
  c.classList.toggle('input-invalid',!ok);
  return ok;
}

const loginEmail=document.getElementById('login-email');
const loginPassword=document.getElementById('login-password');
const rememberMe=document.getElementById('remember-me');
const registerName=document.getElementById('register-name');
const registerEmail=document.getElementById('register-email');
const registerPassword=document.getElementById('register-password');
const registerConfirm=document.getElementById('register-confirm');
const forgotEmail=document.getElementById('forgot-email');
const forgotPassword=document.getElementById('forgot-password');

registerPassword?.addEventListener('input',()=>{
  updateStrength(registerPassword,document.getElementById('register-strength'));
  updateConfirm();
});
registerConfirm?.addEventListener('input',updateConfirm);
forgotPassword?.addEventListener('input',()=>{
  updateStrength(forgotPassword,document.getElementById('forgot-strength'));
});

document.getElementById('login-form').onsubmit=e=>{
  e.preventDefault();
  const r=a.login(loginEmail.value,loginPassword.value,rememberMe.checked);
  if(!r.success)return msg('login-message',r.error);
  location.href=r.session.role==='admin'?'./admin.html':'./index.html';
};

document.getElementById('register-form').onsubmit=e=>{
  e.preventDefault();
  const strength=updateStrength(registerPassword,document.getElementById('register-strength'));
  if(!updateConfirm())return msg('register-message','تأكد أن كلمتي المرور متطابقتان.');
  if(strength.score<4)return msg('register-message','اجعل كلمة المرور قوية: 8 أحرف على الأقل، مع حرف كبير وصغير ورقم ورمز خاص.');
  const r=a.register({
    name:registerName.value,
    email:registerEmail.value,
    password:registerPassword.value
  });
  if(!r.success)return msg('register-message',r.error);
  location.href='./index.html';
};

document.getElementById('forgot-form').onsubmit=e=>{
  e.preventDefault();
  const strength=updateStrength(forgotPassword,document.getElementById('forgot-strength'));
  if(strength.score<4)return msg('forgot-message','كلمة المرور الجديدة يجب أن تكون قوية وتحتوي على حرف كبير وصغير ورقم ورمز خاص.');
  const r=a.resetPassword(forgotEmail.value,forgotPassword.value);
  if(!r.success)return msg('forgot-message',r.error);
  msg('forgot-message','تم تغيير كلمة المرور بنجاح.','success');
  setTimeout(()=>open('login'),500);
};

})();
