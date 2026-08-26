/* ═══════════════════════════════════════════════════════════
   THE REGULARS · backdrop
   No texture, no field of dots. Two very soft washes of the
   brand blue, and a single hairline that runs the width of the
   screen. Scroll position moves the washes; scroll speed bends
   the line. One small accent marker travels along it.
   ═══════════════════════════════════════════════════════════ */
(() => {
  const cvs=document.getElementById('backdrop');
  if(!cvs) return;
  const ctx=cvs.getContext('2d');
  const root=document.documentElement;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NEON='213,250,51';

  let w=0,h=0,dpr=1,t=0,last=0,raf=0,running=true;
  let energy=0,prevY=0,progress=0;
  let wash=[25,36,230], washTo=[25,36,230], washA=.10;
  let gfx=[246,251,253], gfxTo=[246,251,253], gfxA=.3;

  const clamp=(v,a,b)=>v<a?a:v>b?b:v;
  const rgb=(c,a)=>`rgba(${c[0]|0},${c[1]|0},${c[2]|0},${a})`;

  function readGround(){
    const cs=getComputedStyle(root);
    const num=(name,fb)=>{const v=parseFloat(cs.getPropertyValue(name));return isNaN(v)?fb:v};
    const trip=(name,fb)=>{
      const p=cs.getPropertyValue(name).trim().split(/[\s,]+/).map(Number);
      return p.length===3&&p.every(n=>!isNaN(n))?p:fb;
    };
    washTo=trip('--wash',[25,36,230]);
    gfxTo=trip('--gfx',[246,251,253]);
    washA=num('--wash-a',.1);
    gfxA=num('--gfx-a',.3);
  }

  function resize(){
    w=innerWidth; h=innerHeight;
    dpr=Math.min(devicePixelRatio||1,2);
    cvs.width=Math.round(w*dpr); cvs.height=Math.round(h*dpr);
    cvs.style.width=w+'px'; cvs.style.height=h+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  function draw(){
    ctx.clearRect(0,0,w,h);

    /* the washes: large, slow, barely there */
    const p=progress;
    const blobs=[
      {x:w*(.18+.10*Math.sin(t*.09))+w*.16*p, y:h*(.24+.10*Math.cos(t*.07))+h*.30*p, r:Math.max(w,h)*.62, a:washA},
      {x:w*(.86-.12*Math.cos(t*.06)),         y:h*(.78-.34*p),                        r:Math.max(w,h)*.48, a:washA*.7}
    ];
    for(const b of blobs){
      const g=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r);
      g.addColorStop(0,rgb(wash,b.a));
      g.addColorStop(1,rgb(wash,0));
      ctx.fillStyle=g;
      ctx.fillRect(0,0,w,h);
    }

    /* the line: one stroke, low on the screen, bending with the scroll */
    const base=h*.80-h*.10*p;
    const amp=(5+energy*26)*(1+.4*Math.sin(t*.5));
    const steps=Math.max(24,Math.round(w/26));
    ctx.beginPath();
    let mx=0,my=base;
    for(let i=0;i<=steps;i++){
      const u=i/steps, x=u*w;
      const env=Math.sin(u*Math.PI);
      const y=base+env*amp*Math.sin(u*4.2-t*.9)+env*amp*.35*Math.sin(u*9.1+t*1.4);
      i?ctx.lineTo(x,y):ctx.moveTo(x,y);
      if(Math.abs(u-((t*.09)%1))<.5/steps){ mx=x; my=y; }
    }
    ctx.strokeStyle=rgb(gfx,gfxA);
    ctx.lineWidth=1.25;
    ctx.stroke();

    /* one accent marker, riding it */
    if(mx){
      ctx.fillStyle=`rgba(${NEON},.85)`;
      ctx.beginPath();
      if(ctx.roundRect) ctx.roundRect(mx-3.5,my-3.5,7,7,2.2); else ctx.rect(mx-3.5,my-3.5,7,7);
      ctx.fill();
    }
  }

  function frame(now){
    raf=requestAnimationFrame(frame);
    if(!running) return;
    const dt=Math.min(.05,(now-last)/1000||.016); last=now; t+=dt;

    for(let i=0;i<3;i++){
      wash[i]+=(washTo[i]-wash[i])*Math.min(1,dt*8);
      gfx[i]+=(gfxTo[i]-gfx[i])*Math.min(1,dt*8);
    }
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    progress=clamp(scrollY/max,0,1);
    const dv=Math.abs(scrollY-prevY); prevY=scrollY;
    const want=clamp(dv/50,0,1);
    energy+=(want-energy)*(want>energy?.25:.03);

    draw();
  }

  let rt;
  addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{resize();if(reduced)draw();},150)},{passive:true});
  document.addEventListener('visibilitychange',()=>{running=!document.hidden;last=performance.now()});
  addEventListener('reg:ground',()=>{readGround();if(reduced){wash=washTo.slice();gfx=gfxTo.slice();draw();}});

  readGround(); wash=washTo.slice(); gfx=gfxTo.slice(); resize();
  if(reduced) draw();
  else { last=performance.now(); prevY=scrollY; raf=requestAnimationFrame(frame); }
})();
