/* ═══════════════════════════════════════════════════════════
   THE REGULARS · the signal
   Same language as before, far quieter: a faint grid of the
   brand's rounded square, and one horizon line of dots that
   listens to the page. Scroll position sets what the line is
   doing, scroll speed sets how loud. One neon dot rides it.
   ═══════════════════════════════════════════════════════════ */
(() => {
  const cvs=document.getElementById('signal');
  if(!cvs) return;
  const ctx=cvs.getContext('2d');
  const root=document.documentElement;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NEON=[213,250,51];

  let w=0,h=0,dpr=1,step=0,cols=0,rows=0,ox=0,oy=0,dotPx=0;
  let sprite=null,spriteNeon=null;
  let col=[246,251,253],colTo=[246,251,253],baseA=.05;
  let t=0,last=0,raf=0,running=true,energy=0,prevY=0,progress=0;

  const clamp=(v,a,b)=>v<a?a:v>b?b:v;
  const smooth=x=>x*x*(3-2*x);

  function readGround(){
    const cs=getComputedStyle(root);
    const trip=cs.getPropertyValue('--dots').trim().split(/[\s,]+/).map(Number);
    if(trip.length===3&&trip.every(n=>!isNaN(n))) colTo=trip;
    const a=parseFloat(cs.getPropertyValue('--dot-a'));
    if(!isNaN(a)) baseA=a;
  }

  function makeSprites(){
    dotPx=Math.max(2,Math.round(step*.16));
    const mk=(rgb)=>{
      const c=document.createElement('canvas');
      c.width=c.height=dotPx*3;
      const x=c.getContext('2d');
      x.fillStyle=`rgb(${rgb[0]|0},${rgb[1]|0},${rgb[2]|0})`;
      x.beginPath();
      const r=Math.max(1,dotPx*.32);
      if(x.roundRect) x.roundRect(dotPx,dotPx,dotPx,dotPx,r); else x.rect(dotPx,dotPx,dotPx,dotPx);
      x.fill();
      return c;
    };
    sprite=mk(col); spriteNeon=mk(NEON);
  }

  function resize(){
    w=innerWidth; h=innerHeight;
    dpr=Math.min(devicePixelRatio||1,2);
    cvs.width=Math.round(w*dpr); cvs.height=Math.round(h*dpr);
    cvs.style.width=w+'px'; cvs.style.height=h+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    step = w<700 ? 34 : w<1200 ? 40 : 46;
    cols=Math.ceil(w/step)+1; rows=Math.ceil(h/step)+1;
    ox=(w-(cols-1)*step)/2; oy=(h-(rows-1)*step)/2;
    makeSprites();
  }

  /* ── what the line is doing ───────────────── */
  /* each returns the half-height of the band, in rows */
  const SCENES=[
    /* 0 · resting: a line that breathes */
    (u)=>.55+.35*Math.sin(u*2.2-t*.5),
    /* 1 · speaking: harmonics, loud when you scroll */
    (u)=>{
      const env=Math.exp(-u*u*1.1);
      const amp=(1.1+energy*5.2)*env;
      return Math.abs(Math.sin(u*5.5-t*1.7)+.45*Math.sin(u*11+t*2.4)+.25*Math.sin(u*19-t*1.2))*amp+.35;
    },
    /* 2 · cohorts: tall at acquisition, decaying to the right,
           with the few who keep coming back holding a step up */
    (u)=>{
      const age=(u+1)/2;
      const keep=.35+.3*Math.sin(Math.floor(age*9)*2.4+t*.25);
      return Math.max(.3, 3.4*Math.exp(-age*2.6)+(age>.55?keep:0));
    },
    /* 3 · the return: out to the edges and back again */
    (u)=>{
      const ph=(t*.28)%2, back=ph>1, r=(back?2-ph:ph);
      const k=Math.abs(u)-r;
      return .3+3.2*Math.exp(-(k*k)/.05);
    }
  ];

  function frame(now){
    raf=requestAnimationFrame(frame);
    if(!running) return;
    const dt=Math.min(.05,(now-last)/1000||.016); last=now; t+=dt;

    for(let c=0;c<3;c++) col[c]+=(colTo[c]-col[c])*Math.min(1,dt*8);
    if(Math.abs(col[0]-colTo[0])+Math.abs(col[1]-colTo[1])+Math.abs(col[2]-colTo[2])>1.5) makeSprites();

    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    progress=clamp(scrollY/max,0,1);
    const dv=Math.abs(scrollY-prevY); prevY=scrollY;
    const want=clamp(dv/44,0,1);
    energy+=(want-energy)*(want>energy?.3:.04);

    const fixed=root.dataset.scene;
    let i0,i1,bl;
    if(fixed&&fixed!=='auto'){ i0=i1=clamp(+fixed,0,SCENES.length-1); bl=0; }
    else{
      const sp=progress*(SCENES.length-1);
      i0=Math.min(SCENES.length-1,Math.floor(sp));
      i1=Math.min(SCENES.length-1,i0+1);
      bl=smooth(sp-i0);
    }

    ctx.clearRect(0,0,w,h);
    const sz=dotPx*3, half=dotPx*1.5;
    const bandRow=(rows-1)*.72;
    const neonCol=Math.floor(((t*.085)%1)*cols);
    const lit=baseA+.52;

    for(let gx=0;gx<cols;gx++){
      const u=cols>1?(gx/(cols-1))*2-1:0;
      const a=SCENES[i0](u), b=bl>0?SCENES[i1](u):a;
      const H=a+(b-a)*bl;
      let topRow=99;
      for(let gy=0;gy<rows;gy++){
        const d=Math.abs(gy-bandRow);
        const v=clamp(1-(d-H)/1.35,0,1);
        if(v>.35&&gy<topRow) topRow=gy;
        const alpha=baseA+v*(lit-baseA);
        if(alpha<.012) continue;
        ctx.globalAlpha=alpha;
        ctx.drawImage(sprite,ox+gx*step-half,oy+gy*step-half,sz,sz);
      }
      if(gx===neonCol&&topRow<99){
        ctx.globalAlpha=.9;
        ctx.drawImage(spriteNeon,ox+gx*step-half,oy+topRow*step-half,sz,sz);
      }
    }
    ctx.globalAlpha=1;
  }

  function still(){
    ctx.clearRect(0,0,w,h);
    const sz=dotPx*3, half=dotPx*1.5, bandRow=(rows-1)*.72;
    for(let gx=0;gx<cols;gx++){
      for(let gy=0;gy<rows;gy++){
        const v=clamp(1-(Math.abs(gy-bandRow)-.6)/1.5,0,1);
        ctx.globalAlpha=baseA+v*(baseA+.4-baseA);
        ctx.drawImage(sprite,ox+gx*step-half,oy+gy*step-half,sz,sz);
      }
    }
    ctx.globalAlpha=1;
  }

  let rt;
  addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{resize();if(reduced)still();},150)},{passive:true});
  document.addEventListener('visibilitychange',()=>{running=!document.hidden;last=performance.now()});
  addEventListener('reg:ground',()=>{readGround();if(reduced){makeSprites();still();}});

  readGround(); col=colTo.slice(); resize();
  if(reduced){ makeSprites(); still(); }
  else { last=performance.now(); prevY=scrollY; raf=requestAnimationFrame(frame); }
})();
