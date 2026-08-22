/* ═══════════════════════════════════════════════════════════
   THE REGULARS · the dot matrix
   The brand's atom is a rounded square, and the mark is an R
   built from twelve of them. This is that grid, scaled to the
   whole screen and given something to say: it holds the R,
   speaks in a waveform, plays back cohorts decaying and
   holding, and pulses out and back. Scroll picks the state;
   scroll speed is how loud it talks.
   ═══════════════════════════════════════════════════════════ */
(() => {
  const cvs = document.getElementById('matrix');
  if (!cvs) return;
  const ctx = cvs.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  /* the twelve dots of the mark, in mark units (pitch 14, dot 11.2) */
  const R_DOTS = [[0,0],[14,0],[28,0],[0,14],[42,14],[0,28],[14,28],[28,28],[0,42],[28,42],[0,56],[42,56]];
  const R_W = 53.2, R_H = 67.2, ACCENT = 11;

  let w=0,h=0,dpr=1,cols=0,rows=0,step=0,ox=0,oy=0;
  let cur=null, tgt=null;                    /* intensity + accent flags */
  let sprite=null, spriteNeon=null, dotPx=0;
  let t=0,last=0,raf=0,running=true;
  let energy=0, prevY=0, progress=0;
  let col=[246,251,253], colTo=[246,251,253], baseA=.13;
  const NEON=[213,250,51];

  const ACC_MAX=14;                          /* neon stays rare, by design */
  const clamp=(v,a,b)=>v<a?a:v>b?b:v;
  const smooth=x=>x*x*(3-2*x);

  /* ── palette ─────────────────────────────── */
  function readGround(){
    const cs=getComputedStyle(root);
    const trip=cs.getPropertyValue('--dots').trim().split(/[\s,]+/).map(Number);
    if(trip.length===3 && trip.every(n=>!isNaN(n))) colTo=trip;
    const a=parseFloat(cs.getPropertyValue('--dot-a'));
    if(!isNaN(a)) baseA=a;
  }
  function makeSprites(){
    dotPx=Math.max(2,Math.round(step*.34));
    const mk=(rgb)=>{
      const c=document.createElement('canvas');
      const s=dotPx*3; c.width=c.height=s;
      const x=c.getContext('2d');
      x.fillStyle=`rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
      const r=Math.max(1,dotPx*.3);
      x.beginPath();
      if(x.roundRect) x.roundRect(dotPx,dotPx,dotPx,dotPx,r);
      else x.rect(dotPx,dotPx,dotPx,dotPx);
      x.fill();
      return c;
    };
    sprite=mk(col.map(Math.round));
    spriteNeon=mk(NEON);
  }

  /* ── layout ──────────────────────────────── */
  function resize(){
    w=innerWidth; h=innerHeight;
    dpr=Math.min(devicePixelRatio||1,2);
    cvs.width=Math.round(w*dpr); cvs.height=Math.round(h*dpr);
    cvs.style.width=w+'px'; cvs.style.height=h+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    step = w<680 ? 22 : w<1200 ? 25 : 28;
    cols=Math.ceil(w/step)+1; rows=Math.ceil(h/step)+1;
    ox=(w-(cols-1)*step)/2; oy=(h-(rows-1)*step)/2;
    cur=new Float32Array(cols*rows);
    tgt=new Float32Array(cols*rows);
    makeSprites();
  }

  /* ── scenes ──────────────────────────────── */
  /* each writes normalised intensity into tgt, and returns a
     function(i) telling whether cell i should read as accent  */

  function sceneMark(){
    /* the mark, drawn on the grid itself: every logo dot becomes a
       block of cells, so the R lands crisp instead of resampled     */
    const wide=w>1040;
    const P=wide?4:3, B=wide?3:2;            /* pitch and block, in cells */
    const mW=3*P+B, mH=4*P+B;
    const gx0=Math.round((wide?cols*.82:cols*.5)-mW/2);
    const gy0=Math.round((wide?rows*.55:rows*.52)-mH/2);
    const chase=Math.floor((t/0.216)%12);
    tgt.fill(0); accBuf.fill(0);
    for(let d=0;d<12;d++){
      const bx=gx0+(R_DOTS[d][0]/14)*P, by=gy0+(R_DOTS[d][1]/14)*P;
      const acc=(d===ACCENT||d===chase)?1:0;
      for(let y=by;y<by+B;y++){
        if(y<0||y>=rows) continue;
        for(let x=bx;x<bx+B;x++){
          if(x<0||x>=cols) continue;
          const i=y*cols+x;
          tgt[i]=1; accBuf[i]=acc;
        }
      }
    }
  }

  function sceneVoice(){
    /* an equalizer band: the machine talking */
    const cy=(rows-1)/2;
    const amp=.10+energy*.5+.10*(.5+.5*Math.sin(t*.85));
    for(let gx=0;gx<cols;gx++){
      const u=cols>1?(gx/(cols-1))*2-1:0;
      const env=Math.exp(-u*u*1.15);
      const wave=Math.sin(u*6.5-t*2.1)+.5*Math.sin(u*13+t*3.05)+.3*Math.sin(u*23-t*1.6);
      const band=Math.abs(wave)*amp*env*rows*.9;
      const crest=Math.abs(wave)>2.35;
      for(let gy=0;gy<rows;gy++){
        const i=gy*cols+gx;
        const d=Math.abs(gy-cy);
        const v=clamp(1-(d-band)/1.6,0,1);
        tgt[i]=v;
        accBuf[i]=(crest && v>.5 && d>band-1.2)?1:0;
      }
    }
  }

  function sceneCohorts(){
    /* every row is a cohort: bright at acquisition, decaying to
       the right, with the few who keep coming back holding on  */
    const drift=t*.55;
    for(let gy=0;gy<rows;gy++){
      const seed=Math.sin((gy+Math.floor(drift))*12.9898)*43758.5453;
      const r=seed-Math.floor(seed);
      const life=.22+r*.5;
      for(let gx=0;gx<cols;gx++){
        const i=gy*cols+gx;
        const age=cols>1?gx/(cols-1):0;
        let v=Math.exp(-age/life);
        const keeper=((gx*7+gy*13)%11===0)&&age>.45;
        if(keeper) v=Math.max(v,.85);
        tgt[i]=clamp(v*1.15-.12,0,1);
        accBuf[i]=(keeper&&((gx*13+gy*7)%53===0)&&age>.8)?1:0;
      }
    }
  }

  function scenePulse(){
    /* out to the edge and back again */
    const cx=(cols-1)/2, cy=(rows-1)/2;
    const maxD=Math.max(cx,cy);
    const ph=(t*.42)%2;
    const back=ph>1;
    const rad=(back?2-ph:ph)*maxD;
    for(let gy=0;gy<rows;gy++){
      for(let gx=0;gx<cols;gx++){
        const i=gy*cols+gx;
        const d=Math.max(Math.abs(gx-cx),Math.abs(gy-cy));
        const k=d-rad;
        const v=Math.exp(-(k*k)/7);
        tgt[i]=v;
        accBuf[i]=(back&&v>.72)?1:0;
      }
    }
  }

  const SCENES=[sceneMark,sceneVoice,sceneCohorts,scenePulse,sceneMark];
  const GAIN=[.80,.46,.30,.42,.80];
  let accBuf=new Uint8Array(0), accA=new Uint8Array(0), accB=new Uint8Array(0);
  let bufA=new Float32Array(0), bufB=new Float32Array(0);

  function ensureBufs(){
    const n=cols*rows;
    if(bufA.length!==n){
      bufA=new Float32Array(n); bufB=new Float32Array(n);
      accA=new Uint8Array(n); accB=new Uint8Array(n); accBuf=new Uint8Array(n);
    }
  }

  /* ── frame ───────────────────────────────── */
  function frame(now){
    raf=requestAnimationFrame(frame);
    if(!running) return;
    const dt=Math.min(.05,(now-last)/1000||.016); last=now; t+=dt;

    /* ground colour eases with the section change */
    for(let c=0;c<3;c++) col[c]+=(colTo[c]-col[c])*Math.min(1,dt*8);
    if(Math.abs(col[0]-colTo[0])+Math.abs(col[1]-colTo[1])+Math.abs(col[2]-colTo[2])>1.5) makeSprites();

    const maxScroll=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    progress=clamp(scrollY/maxScroll,0,1);
    const dv=Math.abs(scrollY-prevY); prevY=scrollY;
    const target=clamp(dv/40,0,1);
    energy+=(target-energy)*(target>energy?.4:.05);

    ensureBufs();

    /* which state, and how much of the next one */
    const fixed=root.dataset.scene;
    let i0,i1,bl;
    if(fixed&&fixed!=='auto'){
      i0=i1=clamp(+fixed,0,SCENES.length-1); bl=0;
    }else{
      const sp=progress*(SCENES.length-1);
      i0=Math.min(SCENES.length-1,Math.floor(sp));
      i1=Math.min(SCENES.length-1,i0+1);
      bl=smooth(sp-i0);
    }

    SCENES[i0](); bufA.set(tgt); accA.set(accBuf);
    if(bl>0){ SCENES[i1](); bufB.set(tgt); accB.set(accBuf); }
    let gain=bl>0?GAIN[i0]+(GAIN[i1]-GAIN[i0])*bl:GAIN[i0];
    if(w<=1040&&(i0===0||i0===4||i1===0||i1===4)) gain*=.55;

    ctx.clearRect(0,0,w,h);
    const n=cols*rows;
    const k=Math.min(1,dt*7);
    const half=dotPx, sz=dotPx*3;
    let accents=0;

    for(let i=0;i<n;i++){
      const want=bl>0?bufA[i]+(bufB[i]-bufA[i])*bl:bufA[i];
      cur[i]+=(want-cur[i])*k;
      const v=cur[i];
      if(v<.02 && baseA<.02) continue;
      const gx=i%cols, gy=(i/cols)|0;
      const x=ox+gx*step-half*1.5, y=oy+gy*step-half*1.5;
      const isAcc = (bl>.5?accB[i]:accA[i]) && v>.4 && accents<ACC_MAX;
      if(isAcc) accents++;
      ctx.globalAlpha=clamp(baseA+v*(gain-baseA),0,1);
      ctx.drawImage(isAcc?spriteNeon:sprite,x,y,sz,sz);
    }
    ctx.globalAlpha=1;
  }

  function still(){
    ensureBufs();
    sceneMark();
    ctx.clearRect(0,0,w,h);
    const sz=dotPx*3, half=dotPx;
    for(let i=0;i<cols*rows;i++){
      const gx=i%cols, gy=(i/cols)|0;
      ctx.globalAlpha=baseA+tgt[i]*(.9-baseA);
      ctx.drawImage(accBuf[i]&&tgt[i]>.5?spriteNeon:sprite,ox+gx*step-half*1.5,oy+gy*step-half*1.5,sz,sz);
    }
    ctx.globalAlpha=1;
  }

  /* ── wiring ──────────────────────────────── */
  let rt;
  addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{resize();if(reduced)still();},150)},{passive:true});
  document.addEventListener('visibilitychange',()=>{running=!document.hidden;last=performance.now()});
  addEventListener('reg:ground',()=>{readGround();if(reduced){makeSprites();still();}});

  window.REGMatrix={ground:()=>readGround()};

  readGround(); col=colTo.slice(); resize();
  if(reduced){ makeSprites(); still(); }
  else { last=performance.now(); prevY=scrollY; raf=requestAnimationFrame(frame); }
})();
