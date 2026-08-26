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
      o.unobserve(e.target);
    });
  },{rootMargin:'0px 0px -8% 0px',threshold:.12});
  function observeReveals(scope){ $$('.rv, .step',scope).forEach(el=>{ el.classList.remove('in'); revObs.observe(el); }); }

  /* ── the loop ─────────────────────────────── */
  const LOOP=[
    {el:'Αγορά μέσων',en:'Media buying',
     pel:'Κατανομή budget ανά κοινό και προϊόν, με κριτήριο την αναμενόμενη αξία του πελάτη και όχι μόνο το κόστος του κλικ.',
     pen:'Budget allocation by audience and product, planned against expected customer value rather than click cost alone.'},
    {el:'Προσγείωση',en:'Landing',
     pel:'Η σελίδα που δέχεται την επισκεψιμότητα: ταχύτητα, σαφήνεια προσφοράς, διαδρομή προς το checkout.',
     pen:'The page that receives the traffic: speed, clarity of offer, and the path to checkout.'},
    {el:'Πρώτη αγορά',en:'First purchase',
     pel:'Καταγράφεται με το κόστος απόκτησης και το περιθώριο της, όχι μόνο ως τζίρος.',
     pen:'Recorded with its acquisition cost and its margin, not as revenue alone.'},
    {el:'Δεδομένα',en:'Data',
     pel:'Προϊόν, ημερομηνία, περιθώριο, επιστροφές. Το cohort του πελάτη ανοίγει εδώ.',
     pen:'Product, date, margin, returns. The customer cohort opens here.'},
    {el:'Επανενεργοποίηση',en:'Reactivation',
     pel:'Email, retargeting και περιεχόμενο με βάση τον χρόνο επαναπαραγγελίας της κατηγορίας.',
     pen:'Email, retargeting and content, timed to the category reorder interval.'},
    {el:'Επαναλαμβανόμενη αγορά',en:'Repeat purchase',
     pel:'Τζίρος χωρίς δεύτερο κόστος απόκτησης. Είναι ο δείκτης που κρίνει όλα τα προηγούμενα στάδια.',
     pen:'Revenue without a second acquisition cost. It is the indicator that judges every stage before it.'}
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
  const TITLES={
    '':['The Regulars · Performance, websites και social','The Regulars · Performance, websites and social'],
    system:['Το σύστημα · The Regulars','The system · The Regulars'],
    services:['Υπηρεσίες · The Regulars','Services · The Regulars'],
    engagements:['Συνεργασία · The Regulars','Engagements · The Regulars'],
    process:['Διαδικασία · The Regulars','Process · The Regulars'],
    company:['Εταιρεία · The Regulars','Company · The Regulars'],
    contact:['Επικοινωνία · The Regulars','Contact · The Regulars']
  };
  let current='';
  function setTitle(){ document.title=T(...TITLES[current]||TITLES['']); }

  function show(name){
    const target=routes.find(r=>r.dataset.route===name)||routes[0];
    current=target.dataset.route;
    routes.forEach(r=>{ r.hidden=r!==target; });
    $$('.nav__links a').forEach(a=>a.classList.toggle('is-on',a.getAttribute('href')==='#/'+current));
    nav.classList.remove('is-open'); burger.setAttribute('aria-expanded','false');
    scrollTo({top:0,behavior:'instant'});
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
      out.textContent=T('Συμπληρώστε ονοματεπώνυμο και email για να μπορέσουμε να απαντήσουμε.','Please add a name and an email so we can reply.');
      return;
    }
    out.style.color='';
    out.textContent=T('Ανοίγει το πρόγραμμα email σας. Απαντάμε εντός μίας εργάσιμης ημέρας.','Opening your email client. We reply within one working day.');
    const body=[
      `${T('Ονοματεπώνυμο','Name')}: ${name.value}`,
      `${T('Εταιρεία','Company')}: ${$('#fCompany').value||'-'}`,
      `Email: ${mail.value}`,
      `Website: ${$('#fSite').value||'-'}`,
      `${T('Δαπάνη','Budget')}: ${$('#fBud').value}`,
      `${T('Τύπος','Engagement')}: ${$('#fType').value}`,
      '', $('#fMsg').value||'-'
    ].join('\n');
    location.href=`mailto:hello@theregulars.gr?subject=${encodeURIComponent(T('Αίτημα συνεργασίας · ','New enquiry · ')+($('#fCompany').value||name.value))}&body=${encodeURIComponent(body)}`;
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
