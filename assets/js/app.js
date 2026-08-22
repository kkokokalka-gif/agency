/* ═══════════════════════════════════════════════
   THE REGULARS · interface
   ═══════════════════════════════════════════════ */
(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const root=document.documentElement;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* twelve months of a business that is slowly turning into a base */
  const M=['J','F','M','A','M','J','J','A','S','O','N','D'];
  const TOTAL=[62,66,70,74,78,84,88,90,92,95,98,104];
  const SHARE=[.06,.09,.12,.16,.19,.23,.27,.30,.33,.36,.39,.41];
  const RET=TOTAL.map((v,i)=>v*SHARE[i]);
  const NEW=TOTAL.map((v,i)=>v-RET[i]);

  /* ── ground: the page takes the colour of the section you are in ── */
  const grounds=$$('[data-ground]');
  let ground='';
  function pickGround(){
    const probe=innerHeight*.34;
    let found=grounds[0];
    for(const el of grounds){
      if(el.closest('.route')?.hidden) continue;
      const r=el.getBoundingClientRect();
      if(r.top<=probe && r.bottom>probe) found=el;
    }
    const g=found?.dataset.ground||'surface';
    if(g!==ground){
      ground=g;
      root.dataset.ground=g;
      $('meta[name=theme-color]')?.setAttribute('content',
        g==='ink'?'#12131C':g==='blue'?'#1924E6':'#F6FBFD');
      dispatchEvent(new Event('reg:ground'));
    }
  }

  /* ── nav ─────────────────────────────────── */
  const nav=$('#nav'), burger=$('#burger');
  burger.addEventListener('click',()=>{
    const open=nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded',String(open));
  });
  let ticking=false;
  addEventListener('scroll',()=>{
    if(ticking) return; ticking=true;
    requestAnimationFrame(()=>{ nav.classList.toggle('is-stuck',scrollY>10); pickGround(); ticking=false; });
  },{passive:true});

  /* ── reveal ──────────────────────────────── */
  const revObs=new IntersectionObserver((es,o)=>{
    es.forEach(e=>{
      if(!e.isIntersecting) return;
      const sibs=[...(e.target.parentElement?.children||[])].filter(n=>n.classList.contains('rv'));
      e.target.style.transitionDelay=Math.min(Math.max(0,sibs.indexOf(e.target))*70,350)+'ms';
      e.target.classList.add('in');
      if(e.target.querySelector?.('[data-count]')||e.target.hasAttribute?.('data-count')) countUp(e.target);
      if(e.target.id==='caseChart'||e.target.querySelector?.('#caseChart')) drawCase();
      o.unobserve(e.target);
    });
  },{rootMargin:'0px 0px -8% 0px',threshold:.12});
  function observeReveals(scope){ $$('.rv',scope).forEach(el=>{ el.classList.remove('in'); revObs.observe(el); }); }

  /* ── counters ────────────────────────────── */
  function countUp(scope){
    const nodes=scope.hasAttribute?.('data-count')?[scope]:$$('[data-count]',scope);
    nodes.forEach(n=>{
      const to=parseFloat(n.dataset.count);
      const suffix=n.dataset.suffix||'';
      const dec=(n.dataset.count.split('.')[1]||'').length;
      if(reduced){ n.innerHTML=to.toFixed(dec)+suffix; return; }
      const t0=performance.now(), d=900;
      (function run(now){
        const k=Math.min(1,(now-t0)/d), e=1-Math.pow(1-k,3);
        n.innerHTML=(to*e).toFixed(dec)+suffix;
        if(k<1) requestAnimationFrame(run);
      })(t0);
    });
  }

  /* ── the boring truth ────────────────────── */
  const usual=$('#chartUsual'), ours=$('#chartOurs'), axis=$('#truthAxis');
  if(usual&&ours){
    /* the flattering one: cumulative revenue, which only ever goes up */
    let cum=0; const pts=TOTAL.map((v,i)=>{ cum+=v; return [i/(TOTAL.length-1)*620, 260-(cum/1001)*236-8]; });
    const line=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
    usual.querySelector('.line').setAttribute('d',line);
    usual.querySelector('.area').setAttribute('d',line+' L620 260 L0 260 Z');

    /* the useful one: what came back, next to what we had to buy */
    ours.innerHTML=TOTAL.map((v,i)=>{
      const last=i===TOTAL.length-1;
      return `<div class="b${last?' last':''}"><i class="new" style="height:0"></i><i style="height:0"></i></div>`;
    }).join('');
    axis.innerHTML=M.map(m=>`<span>${m}</span>`).join('');

    const maxT=Math.max(...TOTAL);
    const paintBars=()=>$$('.b',ours).forEach((b,i)=>{
      b.children[0].style.height=(NEW[i]/maxT*100)+'%';
      b.children[1].style.height=(RET[i]/maxT*100)+'%';
    });

    let mode='usual';
    const setMode=(m)=>{
      mode=m;
      usual.classList.toggle('is-off',m!=='usual');
      ours.classList.toggle('is-off',m!=='ours');
      $('#readUsual').hidden=m!=='usual';
      $('#readOurs').hidden=m!=='ours';
      $$('.truth__switch button').forEach(b=>b.classList.toggle('is-on',b.dataset.mode===m));
      if(m==='ours') requestAnimationFrame(paintBars);
    };
    ours.classList.add('is-off');
    $$('.truth__switch button').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));

    /* flip it once, unprompted, so the point lands even if nobody clicks */
    const once=new IntersectionObserver((es,o)=>{
      if(!es[0].isIntersecting||reduced) return;
      o.disconnect();
      setTimeout(()=>{ if(mode==='usual') setMode('ours'); },2200);
    },{threshold:.5});
    once.observe($('#truthPanel'));
  }

  /* ── case study chart ────────────────────── */
  let caseDrawn=false;
  function drawCase(){
    const el=$('#caseChart'); if(!el||caseDrawn) return; caseDrawn=true;
    const max=Math.max(...RET);
    el.innerHTML=RET.map((v,i)=>{
      const last=i===RET.length-1;
      return `<div class="cb${last?' last':''}"><i></i><span>${M[i]}</span></div>`;
    }).join('');
    requestAnimationFrame(()=>$$('.cb i',el).forEach((n,i)=>{
      n.style.transitionDelay=(i*45)+'ms';
      n.style.height=(RET[i]/max*100)+'%';
    }));
  }

  /* ── router ──────────────────────────────── */
  const routes=$$('.route');
  const SCENE={'':'auto',work:'2',case:'2',services:'1',about:'0',contact:'3'};
  function show(name){
    const target=routes.find(r=>r.dataset.route===name)||routes[0];
    routes.forEach(r=>{ r.hidden=r!==target; });
    root.dataset.scene=SCENE[target.dataset.route]??'auto';
    $$('.nav__links a').forEach(a=>a.classList.toggle('is-on',a.getAttribute('href')==='#/'+target.dataset.route));
    nav.classList.remove('is-open'); burger.setAttribute('aria-expanded','false');
    scrollTo({top:0,behavior:'instant'});
    caseDrawn=false;
    observeReveals(target);
    ground=''; pickGround();
    const lock=$('.nav .lockup');
    lock.classList.add('is-busy'); setTimeout(()=>lock.classList.remove('is-busy'),1400);
    document.title=({'':'The Regulars · We measure who comes back',
      work:'Work · The Regulars', case:'Yum Tales Supply · The Regulars',
      services:'Services · The Regulars', about:'About · The Regulars',
      contact:'Contact · The Regulars'})[target.dataset.route];
  }
  function fromHash(){
    const h=location.hash.replace(/^#\/?/,'').replace(/\/$/,'');
    show(routes.some(r=>r.dataset.route===h)?h:'');
  }
  addEventListener('hashchange',fromHash);

  /* ── form ────────────────────────────────── */
  $('#form')?.addEventListener('submit',e=>{
    e.preventDefault();
    const name=$('#fName'), mail=$('#fMail'), out=$('#formMsg');
    let bad=false;
    [[name,v=>v.trim().length>1],[mail,v=>/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(v.trim())]]
      .forEach(([f,ok])=>{ const good=ok(f.value); f.parentElement.classList.toggle('is-bad',!good); if(!good) bad=true; });
    if(bad){ out.style.color='#c3261a'; out.textContent='We need a name and an email to reply.'; return; }
    out.style.color=''; out.textContent='Opening your email client. One of us answers within a working day.';
    const body=[`Name: ${name.value}`,`Email: ${mail.value}`,`Website: ${$('#fSite').value||'-'}`,'',$('#fMsg').value||'-'].join('\n');
    location.href=`mailto:hello@theregulars.gr?subject=${encodeURIComponent('New project · '+name.value)}&body=${encodeURIComponent(body)}`;
  });

  /* ── go ──────────────────────────────────── */
  fromHash();
  pickGround();
})();
