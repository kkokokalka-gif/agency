/* ═══════════════════════════════════════════════
   THE REGULARS — interface
   ═══════════════════════════════════════════════ */
(() => {
  'use strict';
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;

  /* storage can throw in embedded / private contexts — never let it break the page */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } }
  };

  /* ── language ─────────────────────────────── */
  let lang = store.get('reg-lang') || 'el';

  function applyLang() {
    $$('[data-en]').forEach(el => {
      if (!el.dataset.el) el.dataset.el = el.textContent;
      el.textContent = lang === 'en' ? el.dataset.en : el.dataset.el;
    });
    document.documentElement.lang = lang;
    $('#lang span').textContent = lang === 'en' ? 'ΕΛ' : 'EN';
    store.set('reg-lang', lang);
    document.title = lang === 'en'
      ? 'THE REGULARS — Performance & Websites, Athens'
      : 'THE REGULARS — Performance & Websites, Αθήνα';
    renderLoop();
    calc();
  }
  const T = (el, en) => (lang === 'en' ? en : el);

  $('#lang').addEventListener('click', () => {
    lang = lang === 'en' ? 'el' : 'en';
    applyLang();
  });

  /* ── theme ────────────────────────────────── */
  const savedTheme = store.get('reg-theme');
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;
  $('#theme').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    store.set('reg-theme', next);
    document.querySelector('meta[name=theme-color]')
      ?.setAttribute('content', next === 'light' ? '#F4EEE4' : '#0B0A09');
    window.REGField?.refresh();
  });

  /* ── nav ──────────────────────────────────── */
  const nav = $('#nav'), burger = $('#burger'), bar = $('#progress');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('.nav__links a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  }));

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      bar.style.width = (y / max * 100).toFixed(2) + '%';
      nav.classList.toggle('is-stuck', y > 12);
      ticking = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* active section */
  const links = new Map($$('.nav__links a').map(a => [a.getAttribute('href').slice(1), a]));
  const secObs = new IntersectionObserver(es => {
    es.forEach(e => {
      const a = links.get(e.target.id);
      if (a && e.isIntersecting) {
        links.forEach(l => l.classList.remove('is-active'));
        a.classList.add('is-active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach((_, id) => { const s = document.getElementById(id); if (s) secObs.observe(s); });

  /* ── reveal on scroll ─────────────────────── */
  const revObs = new IntersectionObserver((es, o) => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      const sibs = [...(e.target.parentElement?.children || [])].filter(n => n.classList.contains('reveal') || n.classList.contains('step'));
      const idx = Math.max(0, sibs.indexOf(e.target));
      e.target.style.transitionDelay = Math.min(idx * 90, 400) + 'ms';
      e.target.classList.add('in');
      o.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: .12 });
  $$('.reveal, .step').forEach(el => revObs.observe(el));

  /* ── cursor glow + magnetic buttons ───────── */
  if (fine && !reduced) {
    const glow = $('.cursor-glow');
    addEventListener('pointermove', e => {
      glow.style.opacity = '1';
      glow.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`;
    }, { passive: true });

    $$('.magnet').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${dx * .16}px, ${dy * .22}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  /* ── loop diagram ─────────────────────────── */
  const LOOP = [
    { el: 'Η διαφήμιση', en: 'The ad',
      pel: 'Ένα ad που δείχνει σε ποιον αξίζει να δείξει — και όχι σε όλους όσους μπορεί.',
      pen: 'An ad shown to the people worth showing it to — not to everyone it could reach.' },
    { el: 'Το site', en: 'The site',
      pel: 'Εκεί προσγειώνεται το κλικ. Αν αργεί ή μπερδεύει, το budget των ads πληρώνει το λάθος.',
      pen: 'Where the click lands. If it is slow or confusing, the ad budget pays for that mistake.' },
    { el: 'Η πρώτη αγορά', en: 'First purchase',
      pel: 'Το πιο ακριβό ευρώ τζίρου που θα βγάλετε ποτέ. Συχνά είναι ζημιά — και είναι εντάξει.',
      pen: 'The most expensive revenue you will ever book. It often loses money — and that is fine.' },
    { el: 'Τα δεδομένα', en: 'The data',
      pel: 'Τι αγόρασε, πότε, με τι περιθώριο, τι επέστρεψε. Εδώ σταματούν οι εικασίες.',
      pen: 'What they bought, when, at what margin, what came back. This is where guessing stops.' },
    { el: 'Η επιστροφή', en: 'The return',
      pel: 'Email, retargeting, περιεχόμενο. Όχι για να τους κυνηγήσουμε — για να τους θυμίσουμε.',
      pen: 'Email, retargeting, content. Not to chase them — to remind them.' },
    { el: 'Ο θαμώνας', en: 'The regular',
      pel: 'Αγοράζει ξανά χωρίς να πληρώσετε δεύτερη φορά για να τον βρείτε. Εδώ είναι το κέρδος.',
      pen: 'Buys again without you paying a second time to find them. This is where the profit is.' }
  ];
  const loopList = $('#loopList'), loopNodes = $('.loop__nodes');
  let loopActive = 0;

  function renderLoop() {
    if (!loopList) return;
    loopList.innerHTML = LOOP.map((n, i) => `
      <li data-i="${i}" class="${i === loopActive ? 'is-on' : ''}">
        <b>0${i + 1}</b><h3>${T(n.el, n.en)}</h3><p>${T(n.pel, n.pen)}</p>
      </li>`).join('');

    loopNodes.innerHTML = LOOP.map((n, i) => {
      const a = -Math.PI / 2 + (i / LOOP.length) * Math.PI * 2;
      const x = 210 + Math.cos(a) * 150, y = 210 + Math.sin(a) * 150;
      const lx = 210 + Math.cos(a) * 183, ly = 210 + Math.sin(a) * 183;
      const anchor = Math.abs(Math.cos(a)) < .3 ? 'middle' : (Math.cos(a) > 0 ? 'start' : 'end');
      return `<g class="loop__node ${i === loopActive ? 'is-on' : ''}" data-i="${i}">
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7"></circle>
        <text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="${anchor}">${T(n.el, n.en)}</text>
      </g>`;
    }).join('');
  }

  function setLoop(i) {
    loopActive = i;
    $$('#loopList li').forEach(li => li.classList.toggle('is-on', +li.dataset.i === i));
    $$('.loop__node').forEach(g => g.classList.toggle('is-on', +g.dataset.i === i));
  }
  document.addEventListener('click', e => {
    const hit = e.target.closest('#loopList li, .loop__node');
    if (hit) setLoop(+hit.dataset.i);
  });

  /* ── services accordion ───────────────────── */
  $$('.acc__head').forEach(head => {
    head.addEventListener('click', () => {
      const item = head.parentElement;
      const open = item.classList.contains('is-open');
      $$('.acc__item').forEach(x => {
        x.classList.remove('is-open');
        x.querySelector('.acc__head').setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        item.classList.add('is-open');
        head.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ── LTV calculator ───────────────────────── */
  const ids = ['aov', 'mar', 'cac', 'ord'];
  const el = Object.fromEntries(ids.map(i => [i, $('#' + i)]));
  const bars = $('#bars');
  const money = v => new Intl.NumberFormat(lang === 'en' ? 'en-IE' : 'el-GR',
    { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

  function tween(node, to, fmt) {
    const from = Number(node.dataset.v || 0);
    node.dataset.v = to;
    if (reduced) { node.textContent = fmt(to); return; }
    const t0 = performance.now(), d = 420;
    (function run(now) {
      const k = Math.min(1, (now - t0) / d);
      const e = 1 - Math.pow(1 - k, 3);
      node.textContent = fmt(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(run);
    })(t0);
  }

  function calc() {
    if (!el.aov) return;
    const aov = +el.aov.value, mar = +el.mar.value, cac = +el.cac.value, ord = +el.ord.value;
    ids.forEach(i => {
      const r = el[i];
      r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min) * 100) + '%');
    });
    $('#oAov').textContent = money(aov);
    $('#oMar').textContent = mar + '%';
    $('#oCac').textContent = money(cac);
    $('#oOrd').textContent = ord.toFixed(1);

    const unit = aov * mar / 100;
    const first = unit - cac;
    const year = unit * ord - cac;
    const be = Math.max(1, Math.ceil(cac / Math.max(unit, .01)));

    const vFirst = $('#vFirst'), vYear = $('#vYear'), vBreak = $('#vBreak');
    tween(vFirst, first, money);
    tween(vYear, year, money);
    vFirst.className = 'stat__val ' + (first < 0 ? 'is-neg' : 'is-pos');
    vYear.className = 'stat__val ' + (year < 0 ? 'is-neg' : 'is-pos');
    vBreak.textContent = be > 12
      ? T('12+', '12+')
      : T(`${be}η`, be + (be === 1 ? 'st' : be === 2 ? 'nd' : be === 3 ? 'rd' : 'th'));
    vBreak.className = 'stat__val ' + (be <= Math.round(ord) ? 'is-pos' : 'is-neg');

    /* cumulative profit per order */
    const n = 6;
    const vals = Array.from({ length: n }, (_, k) => unit * (k + 1) - cac);
    const max = Math.max(...vals, 1), min = Math.min(...vals, -1);
    const range = max - min || 1;
    const zero = (max / range) * 100;
    bars.style.setProperty('--zero', zero.toFixed(2) + '%');
    if (bars.children.length !== n) {
      bars.innerHTML = Array.from({ length: n }, (_, k) =>
        `<div class="bar"><span class="bar__fill"></span><span class="bar__n">${k + 1}</span></div>`).join('');
    }
    vals.forEach((v, k) => {
      const fill = bars.children[k].firstElementChild;
      const top = ((max - v) / range) * 100;
      const reach = (k + 1) <= Math.round(ord + .0001);
      if (v >= 0) { fill.style.top = top + '%'; fill.style.height = (zero - top) + '%'; }
      else { fill.style.top = zero + '%'; fill.style.height = (top - zero) + '%'; }
      fill.style.background = v < 0
        ? 'color-mix(in srgb, var(--ember) ' + (reach ? 85 : 30) + '%, transparent)'
        : 'color-mix(in srgb, var(--gold) ' + (reach ? 90 : 28) + '%, transparent)';
      bars.children[k].classList.toggle('bar--ghost', !reach);
      bars.children[k].style.opacity = reach ? '1' : '.7';
    });

    const note = $('#calcNote');
    if (first >= 0) {
      note.innerHTML = T(
        `Σπάνιο και καλό: βγαίνετε κερδοφόροι από την <b>πρώτη</b> παραγγελία. Κάθε επόμενη είναι σχεδόν καθαρό περιθώριο — εκεί δουλεύουμε.`,
        `Rare and good: you are profitable on the <b>first</b> order. Everything after it is close to pure margin — that is where we work.`);
    } else if (year < 0) {
      note.innerHTML = T(
        `Με ${ord.toFixed(1)} παραγγελίες τον χρόνο, ο πελάτης <b>δεν προλαβαίνει</b> να αποσβέσει τα ${money(cac)} που κόστισε. Χρειάζεστε ${be} παραγγελίες. Αυτή είναι η διαφορά ανάμεσα στο «καλό ROAS» και στο να βγάζετε λεφτά.`,
        `At ${ord.toFixed(1)} orders a year, the customer <b>never pays back</b> the ${money(cac)} they cost. You need ${be}. That gap is the difference between “good ROAS” and actually making money.`);
    } else {
      note.innerHTML = T(
        `Η πρώτη παραγγελία σάς αφήνει ${money(first)}. Στα ίσια βγαίνετε στην <b>${be}η</b>. Σε 12 μήνες: <b>${money(year)}</b> ανά πελάτη — και αυτό είναι το νούμερο που κυνηγάμε, όχι το πρώτο.`,
        `The first order leaves you ${money(first)}. You break even on order <b>${be}</b>. Over 12 months: <b>${money(year)}</b> per customer — that is the number we chase, not the first one.`);
    }
  }
  ids.forEach(i => el[i]?.addEventListener('input', calc));

  /* ── form ─────────────────────────────────── */
  const form = $('#form');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#fName'), mail = $('#fMail'), msg = $('#fMsg');
    let bad = false;
    [[name, v => v.trim().length > 1], [mail, v => /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(v.trim())]]
      .forEach(([f, ok]) => {
        const good = ok(f.value);
        f.parentElement.classList.toggle('is-bad', !good);
        if (!good) bad = true;
      });
    const out = $('#formMsg');
    if (bad) {
      out.style.color = 'var(--ember)';
      out.textContent = T('Λείπει το όνομα ή το email — τα χρειαζόμαστε για να απαντήσουμε.',
        'Name or email is missing — we need those to answer.');
      return;
    }
    const body = [
      `${T('Όνομα', 'Name')}: ${name.value}`,
      `Email: ${mail.value}`,
      `Website: ${$('#fSite').value || '—'}`,
      `Budget: ${$('#fBud').value}`,
      '',
      msg.value || '—'
    ].join('\n');
    out.style.color = 'var(--gold)';
    out.textContent = T('Ανοίγει το email σας. Απαντάμε εντός μίας εργάσιμης.',
      'Opening your email client. We reply within one working day.');
    window.location.href = `mailto:hello@theregulars.gr?subject=${encodeURIComponent(
      T('Νέο project — ', 'New project — ') + name.value)}&body=${encodeURIComponent(body)}`;
  });

  /* ── go ───────────────────────────────────── */
  applyLang();
  setLoop(0);

  /* rotate the loop gently until someone touches it */
  if (!reduced) {
    let auto = setInterval(() => setLoop((loopActive + 1) % LOOP.length), 4200);
    $('#system')?.addEventListener('pointerdown', () => clearInterval(auto), { once: true });
  }
})();
