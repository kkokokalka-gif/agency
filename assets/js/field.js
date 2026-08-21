/* ═══════════════════════════════════════════════════════════
   THE REGULARS — “the field”
   A scroll-driven particle system that behaves like a machine
   thinking out loud: it idles as a sphere, speaks in a
   waveform, orbits, locks into a lattice, then spirals home.
   Scroll position picks the state. Scroll speed is its voice.
   ═══════════════════════════════════════════════════════════ */
(() => {
  const cvs = document.getElementById('field');
  if (!cvs) return;
  const ctx = cvs.getContext('2d', { alpha: true });
  const TAU = Math.PI * 2;
  const GOLD_ANGLE = 2.39996323;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  let w = 0, h = 0, dpr = 1, S = 0, cx = 0, cy = 0;
  let parts = [], N = 0, sprites = [], light = false;
  let t = 0, raf = 0, last = 0, running = true;

  /* scroll state */
  let scrollY = window.scrollY, prevScroll = scrollY;
  let progress = 0, progTarget = 0;
  let energy = 0, energyTarget = 0;
  let ripples = [];
  let mx = 0, my = 0, mtx = 0, mty = 0;

  /* ── palette ──────────────────────────────── */
  const hex2rgb = (s) => {
    s = (s || '').trim();
    if (s.startsWith('#')) {
      if (s.length === 4) s = '#' + [...s.slice(1)].map(c => c + c).join('');
      return [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
    }
    const m = s.match(/[\d.]+/g);
    return m ? m.slice(0, 3).map(Number) : [255, 106, 61];
  };
  let COLORS = [];
  function readPalette() {
    const cs = getComputedStyle(document.documentElement);
    light = document.documentElement.dataset.theme === 'light';
    COLORS = [
      hex2rgb(cs.getPropertyValue('--ember')),
      hex2rgb(cs.getPropertyValue('--gold')),
      hex2rgb(cs.getPropertyValue('--lilac'))
    ];
    buildSprites();
  }

  /* pre-rendered glow sprites — far cheaper than per-dot gradients */
  function buildSprites() {
    const R = 32;
    sprites = COLORS.map(([r, g, b]) => {
      const c = document.createElement('canvas');
      c.width = c.height = R * 2;
      const x = c.getContext('2d');
      const grd = x.createRadialGradient(R, R, 0, R, R, R);
      if (light) {
        grd.addColorStop(0, `rgba(${r},${g},${b},1)`);
        grd.addColorStop(.42, `rgba(${r},${g},${b},.55)`);
        grd.addColorStop(.8, `rgba(${r},${g},${b},.10)`);
        grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
      } else {
        grd.addColorStop(0, `rgba(255,255,255,.95)`);
        grd.addColorStop(.18, `rgba(${r},${g},${b},.85)`);
        grd.addColorStop(.55, `rgba(${r},${g},${b},.22)`);
        grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
      }
      x.fillStyle = grd;
      x.fillRect(0, 0, R * 2, R * 2);
      return c;
    });
  }

  /* ── sizing ───────────────────────────────── */
  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cvs.width = Math.round(w * dpr);
    cvs.height = Math.round(h * dpr);
    cvs.style.width = w + 'px';
    cvs.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    S = Math.min(w, h);
    cx = w * 0.5;
    cy = h * 0.5;
    const target = Math.round((w * h) / (w < 760 ? 5200 : 2500));
    N = Math.max(180, Math.min(w < 760 ? 380 : 900, target));
    build();
  }

  function build() {
    parts = new Array(N);
    for (let i = 0; i < N; i++) {
      const r = Math.random();
      parts[i] = {
        x: cx + (Math.random() - .5) * w,
        y: cy + (Math.random() - .5) * h,
        z: 0, tx: cx, ty: cy, tz: 0,
        s: 0.55 + Math.random() * 0.75,
        seed: Math.random() * TAU,
        c: r < .70 ? 0 : r < .92 ? 1 : 2
      };
    }
  }

  /* ── scenes ───────────────────────────────── */
  /* every scene writes into p.tx / p.ty / p.tz (canvas px + depth −1..1) */

  function sceneOrb(p, i, out) {
    const k = (i + .5) / N;
    const phi = Math.acos(1 - 2 * k);
    const th = GOLD_ANGLE * i;
    let X = Math.sin(phi) * Math.cos(th);
    let Y = Math.cos(phi);
    let Z = Math.sin(phi) * Math.sin(th);
    const a = t * .16, ca = Math.cos(a), sa = Math.sin(a);
    let x2 = X * ca + Z * sa, z2 = -X * sa + Z * ca;
    const b = Math.sin(t * .21) * .38, cb = Math.cos(b), sb = Math.sin(b);
    let y2 = Y * cb - z2 * sb; z2 = Y * sb + z2 * cb;
    const R = S * (.31 + .014 * Math.sin(t * 1.4 + phi * 4) + energy * .05);
    const ox = w > 1040 ? cx + w * .17 : cx;   /* keep the sphere clear of the headline */
    out.x = ox + x2 * R;
    out.y = cy + y2 * R;
    out.z = z2;
  }

  function sceneWave(p, i, out) {
    const band = i % 3;
    const u = ((i / 3 | 0) / (N / 3)) * 2 - 1;
    const env = Math.exp(-u * u * 1.5);
    const amp = S * (.055 + energy * .085) * env;
    out.x = cx + u * w * .44;
    out.y = cy
      + amp * (Math.sin(u * 6.5 - t * 2.0 + band * 1.6) + .45 * Math.sin(u * 15 + t * 3.3 + p.seed * .2))
      + (band - 1) * S * .05 * env;
    out.z = .55 * Math.sin(u * 3 + t * .8 + band);
  }

  function sceneLattice(p, i, out) {
    const cols = Math.max(4, Math.round(Math.sqrt(N * (w / h))));
    const rows = Math.ceil(N / cols);
    const gx = i % cols, gy = (i / cols) | 0;
    const fx = cols > 1 ? gx / (cols - 1) - .5 : 0;
    const fy = rows > 1 ? gy / (rows - 1) - .5 : 0;
    const br = 1 + energy * .06;
    out.x = cx + fx * w * .80 * br + Math.sin(t * .7 + gy * .8) * S * .012;
    out.y = cy + fy * h * .62 * br + Math.cos(t * .6 + gx * .7) * S * .012;
    out.z = .8 * Math.sin(gx * .55 + gy * .45 + t * .6);
  }

  function sceneRing(p, i, out) {
    const k = i % 3;
    const dir = k === 1 ? -1 : 1;
    const ang = (i / N) * TAU * 5 + t * (.28 + k * .13) * dir + p.seed * .04;
    const rad = S * (.17 + .085 * k) * (1 + energy * .06);
    const X = Math.cos(ang) * rad;
    const Zc = Math.sin(ang) * rad;
    out.x = cx + X;
    out.y = cy + Zc * .40 + Math.sin(t * .9 + k * 2) * S * .012;
    out.z = Math.sin(ang);
  }

  function sceneSpiral(p, i, out) {
    const u = ((i / N) + t * .045) % 1;
    const ang = i * GOLD_ANGLE + u * 6.2 + t * .35;
    const rad = S * .44 * (1 - u) * (.55 + .45 * Math.sin(p.seed + i));
    out.x = cx + Math.cos(ang) * rad;
    out.y = cy + Math.sin(ang) * rad * .72;
    out.z = 1 - 2 * u;
  }

  const SCENES = [sceneOrb, sceneWave, sceneLattice, sceneRing, sceneSpiral];
  const smooth = (x) => x * x * (3 - 2 * x);
  const A = { x: 0, y: 0, z: 0 }, B = { x: 0, y: 0, z: 0 };

  /* ── loop ─────────────────────────────────── */
  function step(now) {
    raf = requestAnimationFrame(step);
    if (!running) return;
    const dt = Math.min(.05, (now - last) / 1000 || .016);
    last = now;
    t += dt;

    /* scroll → progress + “voice” energy */
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progTarget = Math.min(1, Math.max(0, window.scrollY / max));
    progress += (progTarget - progress) * Math.min(1, dt * 6);
    const dv = Math.abs(window.scrollY - prevScroll);
    prevScroll = window.scrollY;
    energyTarget = Math.min(1, dv / 46);
    energy += (energyTarget - energy) * (energyTarget > energy ? .35 : .045);

    if (energy > .55 && ripples.length < 5 && Math.random() < .1) ripples.push({ r: S * .1, a: .5 });

    mx += (mtx - mx) * .06;
    my += (mty - my) * .06;

    /* scene blend */
    const sp = progress * (SCENES.length - 1);
    const i0 = Math.min(SCENES.length - 1, Math.floor(sp));
    const i1 = Math.min(SCENES.length - 1, i0 + 1);
    const bl = smooth(sp - i0);
    const f0 = SCENES[i0], f1 = SCENES[i1];
    const latticeWeight = (i0 === 2 ? 1 - bl : 0) + (i1 === 2 ? bl : 0);

    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = light ? 'source-over' : 'lighter';

    /* ambient nebula */
    drawAura();

    const px = mx * (light ? 14 : 22), py = my * (light ? 14 : 22);
    const baseAlpha = light ? .72 : .85;

    for (let i = 0; i < N; i++) {
      const p = parts[i];
      f0(p, i, A);
      if (bl > 0) { f1(p, i, B); } else { B.x = A.x; B.y = A.y; B.z = A.z; }
      p.tx = A.x + (B.x - A.x) * bl;
      p.ty = A.y + (B.y - A.y) * bl;
      p.tz = A.z + (B.z - A.z) * bl;

      const k = Math.min(1, dt * (2.6 + p.s));
      p.x += (p.tx - p.x) * k;
      p.y += (p.ty - p.y) * k;
      p.z += (p.tz - p.z) * k;

      const depth = (p.z + 1) * .5;                 /* 0 back → 1 front */
      const size = (1.9 + depth * 3.8) * p.s * (1 + energy * .28);
      const alpha = baseAlpha * (.30 + depth * .70);
      const X = p.x + px * (.4 + depth), Y = p.y + py * (.4 + depth);

      ctx.globalAlpha = alpha;
      const sp2 = sprites[p.c];
      ctx.drawImage(sp2, X - size, Y - size, size * 2, size * 2);
    }

    if (latticeWeight > .25) drawLinks(latticeWeight, px, py);
    drawRipples(dt);
    drawVoice(i0, i1, bl);

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  /* soft drifting light behind everything */
  function drawAura() {
    const blobs = [
      { x: cx + Math.sin(t * .11) * w * .22, y: cy + Math.cos(t * .09) * h * .18, r: S * .55, c: COLORS[0] },
      { x: cx - Math.cos(t * .07) * w * .26, y: cy - Math.sin(t * .12) * h * .2, r: S * .45, c: COLORS[1] }
    ];
    for (const b of blobs) {
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      const a = (light ? .10 : .11) + energy * .05;
      g.addColorStop(0, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},${a})`);
      g.addColorStop(1, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0)`);
      ctx.globalAlpha = 1;
      ctx.fillStyle = g;
      ctx.fillRect(b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
    }
  }

  /* lattice wiring — the “one system” state */
  function drawLinks(weight, px, py) {
    const cols = Math.max(4, Math.round(Math.sqrt(N * (w / h))));
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(${COLORS[0][0]},${COLORS[0][1]},${COLORS[0][2]},${(light ? .16 : .3) * weight})`;
    ctx.beginPath();
    for (let i = 0; i < N - 1; i += 2) {
      if ((i + 1) % cols === 0) continue;
      const a = parts[i], b = parts[i + 1];
      const dx = b.x - a.x, dy = b.y - a.y;
      if (dx * dx + dy * dy > S * S * .02) continue;
      ctx.moveTo(a.x + px, a.y + py);
      ctx.lineTo(b.x + px, b.y + py);
    }
    ctx.stroke();
  }

  function drawRipples(dt) {
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.r += S * .45 * dt;
      r.a -= dt * .55;
      if (r.a <= 0) { ripples.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(cx, cy, r.r, 0, TAU);
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = `rgba(${COLORS[1][0]},${COLORS[1][1]},${COLORS[1][2]},${r.a * (light ? .3 : .5)})`;
      ctx.stroke();
    }
  }

  /* the voice line: a thin stroked waveform that only shows up
     while the field is in / near its “speaking” state          */
  function drawVoice(i0, i1, bl) {
    const near = (i0 === 1 ? 1 - bl : 0) + (i1 === 1 ? bl : 0);
    if (near < .04) return;
    const steps = Math.max(40, Math.round(w / 8));
    ctx.beginPath();
    for (let s = 0; s <= steps; s++) {
      const u = (s / steps) * 2 - 1;
      const env = Math.exp(-u * u * 1.5);
      const amp = S * (.03 + energy * .1) * env * near;
      const x = cx + u * w * .44;
      const y = cy + amp * (Math.sin(u * 9 - t * 2.4) + .5 * Math.sin(u * 21 + t * 3.9));
      s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = `rgba(${COLORS[0][0]},${COLORS[0][1]},${COLORS[0][2]},${(light ? .35 : .55) * near})`;
    ctx.stroke();
  }

  /* ── static fallback for reduced motion ───── */
  function drawStatic() {
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = light ? 'source-over' : 'lighter';
    for (let i = 0; i < N; i++) {
      const p = parts[i];
      sceneOrb(p, i, A);
      const depth = (A.z + 1) * .5;
      const size = (1.6 + depth * 3.2) * p.s;
      ctx.globalAlpha = (light ? .7 : .8) * (.3 + depth * .7);
      ctx.drawImage(sprites[p.c], A.x - size, A.y - size, size * 2, size * 2);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ── wiring ───────────────────────────────── */
  let rt;
  function onResize() {
    clearTimeout(rt);
    rt = setTimeout(() => { resize(); if (reduced.matches) drawStatic(); }, 140);
  }

  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('orientationchange', onResize, { passive: true });
  window.addEventListener('pointermove', (e) => {
    mtx = (e.clientX / w) * 2 - 1;
    mty = (e.clientY / h) * 2 - 1;
  }, { passive: true });
  document.addEventListener('visibilitychange', () => { running = !document.hidden; last = performance.now(); });

  window.REGField = {
    refresh() { readPalette(); if (reduced.matches) drawStatic(); },
    get energy() { return energy; }
  };

  readPalette();
  resize();
  if (reduced.matches) {
    drawStatic();
  } else {
    last = performance.now();
    raf = requestAnimationFrame(step);
  }
})();
