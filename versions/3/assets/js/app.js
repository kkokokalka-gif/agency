/* ═══════════════════════════════════════════════
   THE REGULARS · v3 interface
   ═══════════════════════════════════════════════ */
(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const root=document.documentElement;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store={
    get(k){try{return localStorage.getItem(k)}catch{return null}},
    set(k,v){try{localStorage.setItem(k,v)}catch{}}
  };

  /* ── language ─────────────────────────────── */
  let lang=store.get('reg-lang')||'el';
  const T=(el,en)=>lang==='en'?en:el;

  function applyLang(){
    $$('[data-en]').forEach(el=>{
      if(!el.dataset.el) el.dataset.el=el.textContent;
      el.textContent=lang==='en'?el.dataset.en:el.dataset.el;
    });
    root.lang=lang;
    $('#lang span').textContent=lang==='en'?'ΕΛ':'EN';
    store.set('reg-lang',lang);
    renderLoops();
    setTitle();
  }
  $('#lang').addEventListener('click',()=>{ lang=lang==='en'?'el':'en'; applyLang(); });

  /* ── theme ────────────────────────────────── */
  const savedTheme=store.get('reg-theme');
  root.dataset.theme=savedTheme||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');
  $('#theme').addEventListener('click',()=>{
    const next=root.dataset.theme==='light'?'dark':'light';
    root.dataset.theme=next;
    store.set('reg-theme',next);
    ground=''; pickGround();
  });

  /* ── ground follows the section ───────────── */
  let ground='';
  function pickGround(){
    const probe=innerHeight*.34;
    let found=null;
    $$('[data-ground]').forEach(el=>{
      if(el===root||el.closest('.route')?.hidden) return;
      const r=el.getBoundingClientRect();
      if(r.top<=probe&&r.bottom>probe) found=el;
    });
    const g=found?.dataset.ground||'base';
    if(g!==ground){
      ground=g;
      root.dataset.ground=g;
      const theme=root.dataset.theme;
      $('meta[name=theme-color]')?.setAttribute('content',
        g==='blue'?'#1924E6':theme==='light'?'#F6FBFD':'#12131C');
      dispatchEvent(new Event('reg:ground'));
    }
  }

  /* ── nav ──────────────────────────────────── */
  const nav=$('#nav'), burger=$('#burger'), bar=$('#progress');
  burger.addEventListener('click',()=>{
    const open=nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded',String(open));
  });
  let ticking=false;
  addEventListener('scroll',()=>{
    if(ticking) return; ticking=true;
    requestAnimationFrame(()=>{
      const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
      bar.style.width=(scrollY/max*100).toFixed(2)+'%';
      nav.classList.toggle('is-stuck',scrollY>10);
      pickGround(); ticking=false;
    });
  },{passive:true});

  /* ── reveal + counters ────────────────────── */
  const revObs=new IntersectionObserver((es,o)=>{
    es.forEach(e=>{
      if(!e.isIntersecting) return;
      const sibs=[...(e.target.parentElement?.children||[])].filter(n=>n.classList.contains('rv'));
      e.target.style.transitionDelay=Math.min(Math.max(0,sibs.indexOf(e.target))*70,320)+'ms';
      e.target.classList.add('in');
      if($$('[data-count]',e.target).length) countUp(e.target);
      if($('#caseChart',e.target)||e.target.id==='caseChart') drawCase();
      o.unobserve(e.target);
    });
  },{rootMargin:'0px 0px -8% 0px',threshold:.12});
  function observeReveals(scope){ $$('.rv, .step',scope).forEach(el=>{ el.classList.remove('in'); revObs.observe(el); }); }

  function countUp(scope){
    $$('[data-count]',scope).forEach(n=>{
      const to=parseFloat(n.dataset.count), suffix=n.dataset.suffix||'';
      const dec=(n.dataset.count.split('.')[1]||'').length;
      if(reduced){ n.innerHTML=to.toFixed(dec)+suffix; return; }
      const t0=performance.now(), d=850;
      (function run(now){
        const k=Math.min(1,(now-t0)/d), e=1-Math.pow(1-k,3);
        n.innerHTML=(to*e).toFixed(dec)+suffix;
        if(k<1) requestAnimationFrame(run);
      })(t0);
    });
  }

  /* ── the loop ─────────────────────────────── */
  const LOOP=[
    {el:'Η διαφήμιση',en:'The ad',
     pel:'Ένα ad που δείχνει σε ποιον αξίζει να δείξει, όχι σε όλους όσους μπορεί.',
     pen:'An ad shown to the people worth showing it to, not to everyone it could reach.'},
    {el:'Το site',en:'The site',
     pel:'Εκεί προσγειώνεται το κλικ. Αν αργεί ή μπερδεύει, το budget των ads πληρώνει το λάθος.',
     pen:'Where the click lands. If it is slow or confusing, the ad budget pays for that mistake.'},
    {el:'Η πρώτη αγορά',en:'First purchase',
     pel:'Το πιο ακριβό ευρώ τζίρου που θα βγάλετε ποτέ. Συχνά είναι ζημιά, και είναι εντάξει.',
     pen:'The most expensive revenue you will ever book. It often loses money, and that is fine.'},
    {el:'Τα δεδομένα',en:'The data',
     pel:'Τι αγόρασε, πότε, με τι περιθώριο, τι επέστρεψε. Εδώ σταματούν οι εικασίες.',
     pen:'What they bought, when, at what margin, what came back. This is where guessing stops.'},
    {el:'Η επιστροφή',en:'The return',
     pel:'Email, retargeting, περιεχόμενο. Όχι για να τους κυνηγήσουμε, για να τους θυμίσουμε.',
     pen:'Email, retargeting, content. Not to chase them, to remind them.'},
    {el:'Ο θαμώνας',en:'The regular',
     pel:'Αγοράζει ξανά χωρίς να πληρώσετε δεύτερη φορά για να τον βρείτε. Εδώ είναι το κέρδος.',
     pen:'Buys again without you paying a second time to find them. This is where the profit is.'}
  ];
  let loopActive=0;

  function renderLoops(){
    $$('.loop').forEach(loop=>{
      const list=$('.loop__list',loop), nodes=$('.loop__nodes',loop);
      if(!list||!nodes) return;
      list.innerHTML=LOOP.map((n,i)=>`
        <li data-i="${i}" class="${i===loopActive?'is-on':''}">
          <b>0${i+1}</b><h3>${T(n.el,n.en)}</h3><p>${T(n.pel,n.pen)}</p>
        </li>`).join('');
      nodes.innerHTML=LOOP.map((n,i)=>{
        const a=-Math.PI/2+(i/LOOP.length)*Math.PI*2;
        const x=210+Math.cos(a)*150, y=210+Math.sin(a)*150;
        const lx=210+Math.cos(a)*182, ly=210+Math.sin(a)*182;
        const anchor=Math.abs(Math.cos(a))<.3?'middle':(Math.cos(a)>0?'start':'end');
        return `<g class="loop__node ${i===loopActive?'is-on':''}" data-i="${i}">
          <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8"></circle>
          <text x="${lx.toFixed(1)}" y="${(ly+4).toFixed(1)}" text-anchor="${anchor}">${T(n.el,n.en)}</text>
        </g>`;
      }).join('');
    });
  }
  function setLoop(i){
    loopActive=i;
    $$('.loop__list li').forEach(li=>li.classList.toggle('is-on',+li.dataset.i===i));
    $$('.loop__node').forEach(g=>g.classList.toggle('is-on',+g.dataset.i===i));
  }
  document.addEventListener('click',e=>{
    const hit=e.target.closest('.loop__list li, .loop__node');
    if(hit) setLoop(+hit.dataset.i);
  });

  /* ── services accordion ───────────────────── */
  document.addEventListener('click',e=>{
    const head=e.target.closest('.acc__head');
    if(!head) return;
    const item=head.parentElement, open=item.classList.contains('is-open');
    $$('.acc__item').forEach(x=>{ x.classList.remove('is-open'); $('.acc__head',x).setAttribute('aria-expanded','false'); });
    if(!open){ item.classList.add('is-open'); head.setAttribute('aria-expanded','true'); }
  });

  /* ── case chart ───────────────────────────── */
  const M=['J','F','M','A','M','J','J','A','S','O','N','D'];
  const TOTAL=[62,66,70,74,78,84,88,90,92,95,98,104];
  const SHARE=[.06,.09,.12,.16,.19,.23,.27,.30,.33,.36,.39,.41];
  const RET=TOTAL.map((v,i)=>v*SHARE[i]);
  let caseDrawn=false;
  function drawCase(){
    const el=$('#caseChart'); if(!el||caseDrawn) return; caseDrawn=true;
    const max=Math.max(...RET);
    el.innerHTML=RET.map((v,i)=>`<div class="cb${i===RET.length-1?' last':''}"><i></i><span>${M[i]}</span></div>`).join('');
    requestAnimationFrame(()=>$$('.cb i',el).forEach((n,i)=>{
      n.style.transitionDelay=(i*45)+'ms';
      n.style.height=(RET[i]/max*100)+'%';
    }));
  }

  /* ── hero video ───────────────────────────── */
  const vid=$('#heroVideo');
  if(vid){
    /* no file yet, or none of the sources play: drop it and keep the quiet grid */
    const drop=()=>{ if(vid.isConnected&&!vid.videoWidth) vid.remove(); };
    vid.addEventListener('error',()=>{ if(vid.networkState===3) drop(); });
    setTimeout(drop,4000);
    if(reduced){ vid.removeAttribute('autoplay'); vid.pause?.(); }
    else vid.play?.().catch(()=>{});
  }

  /* ── router ───────────────────────────────── */
  const routes=$$('.route');
  const SCENE={'':'auto',system:'0',services:'1',work:'2',process:'1',about:'0',contact:'3'};
  const TITLES={
    '':['The Regulars · Μετράμε ποιος επιστρέφει','The Regulars · We measure who comes back'],
    system:['Το σύστημα · The Regulars','The system · The Regulars'],
    services:['Τι κάνουμε · The Regulars','What we do · The Regulars'],
    work:['Η δουλειά · The Regulars','Work · The Regulars'],
    process:['Πώς δουλεύουμε · The Regulars','How we work · The Regulars'],
    about:['Εμείς · The Regulars','Us · The Regulars'],
    contact:['Επικοινωνία · The Regulars','Contact · The Regulars']
  };
  let current='';
  function setTitle(){ document.title=T(...TITLES[current]||TITLES['']); }

  function show(name){
    const target=routes.find(r=>r.dataset.route===name)||routes[0];
    current=target.dataset.route;
    routes.forEach(r=>{ r.hidden=r!==target; });
    root.dataset.scene=SCENE[current]??'auto';
    $$('.nav__links a').forEach(a=>a.classList.toggle('is-on',a.getAttribute('href')==='#/'+current));
    nav.classList.remove('is-open'); burger.setAttribute('aria-expanded','false');
    scrollTo({top:0,behavior:'instant'});
    caseDrawn=false;
    observeReveals(target);
    ground=''; pickGround();
    setTitle();
    const lock=$('.nav .lockup');
    lock.classList.add('is-busy'); setTimeout(()=>lock.classList.remove('is-busy'),1300);
  }
  function fromHash(){
    const h=location.hash.replace(/^#\/?/,'').replace(/\/$/,'');
    show(routes.some(r=>r.dataset.route===h)?h:'');
  }
  addEventListener('hashchange',fromHash);

  /* ── form ─────────────────────────────────── */
  $('#form')?.addEventListener('submit',e=>{
    e.preventDefault();
    const name=$('#fName'), mail=$('#fMail'), out=$('#formMsg');
    let bad=false;
    [[name,v=>v.trim().length>1],[mail,v=>/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(v.trim())]]
      .forEach(([f,ok])=>{ const good=ok(f.value); f.classList.toggle('is-bad',!good); if(!good) bad=true; });
    if(bad){
      out.style.color='#C3261A';
      out.textContent=T('Χρειαζόμαστε όνομα και email για να απαντήσουμε.','We need a name and an email to reply.');
      return;
    }
    out.style.color='';
    out.textContent=T('Ανοίγει το email σας. Απαντάμε εντός μίας εργάσιμης.','Opening your email client. We reply within one working day.');
    const body=[`${T('Όνομα','Name')}: ${name.value}`,`Email: ${mail.value}`,
      `Website: ${$('#fSite').value||'-'}`,`Budget: ${$('#fBud').value}`,'',$('#fMsg').value||'-'].join('\n');
    location.href=`mailto:hello@theregulars.gr?subject=${encodeURIComponent(T('Νέο project · ','New project · ')+name.value)}&body=${encodeURIComponent(body)}`;
  });

  /* ── go ───────────────────────────────────── */
  applyLang();
  fromHash();
  setLoop(0);
  pickGround();
  if(!reduced){
    const auto=setInterval(()=>setLoop((loopActive+1)%LOOP.length),4600);
    document.addEventListener('pointerdown',e=>{ if(e.target.closest('.loop')) clearInterval(auto); },{once:false});
  }
})();
