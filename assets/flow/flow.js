/* Flow theme scripts · erfan-taatizadeh.github.io */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  function isLight() { return root.getAttribute('data-theme') === 'light'; }
  function cssv(n) { return getComputedStyle(root).getPropertyValue(n).trim(); }

  /* Theme toggle */
  var tb = document.getElementById('theme');
  if (tb) {
    tb.addEventListener('click', function () {
      var next = isLight() ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('et-theme', next); } catch (e) {}
      window.dispatchEvent(new Event('et-theme'));
    });
  }

  /* Navigation: mobile menu, scrolled state, progress bar */
  var nav = document.getElementById('nav'), prog = document.getElementById('progress');
  var menu = document.getElementById('menu'), links = document.getElementById('links');
  if (menu && links) {
    menu.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      menu.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) { links.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }
    });
  }
  var ticking = false;
  function onScroll() {
    var y = window.scrollY || 0;
    if (nav) nav.classList.toggle('scrolled', y > 10);
    if (prog) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* Scroll reveal */
  var rv = [].slice.call(document.querySelectorAll('.reveal'));
  function settle(el) { setTimeout(function () { el.classList.remove('reveal', 'in'); el.style.transitionDelay = ''; }, 1200); }
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); settle(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    rv.forEach(function (el) {
      var sibs = el.parentElement ? [].filter.call(el.parentElement.children, function (c) { return c.classList.contains('reveal'); }) : [];
      el.style.transitionDelay = (Math.max(0, Math.min(sibs.indexOf(el), 5)) * 80) + 'ms';
      io.observe(el);
    });
  } else {
    rv.forEach(function (el) { el.classList.remove('reveal'); });
  }

  /* Count-up numbers */
  function countUp(el) {
    var end = +el.getAttribute('data-count'), suf = el.getAttribute('data-suffix') || '', t0 = null;
    if (reduce || !end) { el.textContent = end + suf; return; }
    el.textContent = '0' + suf;
    function tick(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / 1400), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * e) + suf;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var counters = [].slice.call(document.querySelectorAll('[data-count]'));
  if (counters.length && 'IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* Card spotlight follows the pointer */
  document.addEventListener('pointermove', function (e) {
    var c = e.target && e.target.closest ? e.target.closest('.card') : null;
    if (!c) return;
    var r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  /* Publication filters */
  var chips = [].slice.call(document.querySelectorAll('[data-filter]'));
  if (chips.length) {
    var cards = [].slice.call(document.querySelectorAll('.pub-card'));
    var groups = [].slice.call(document.querySelectorAll('.year-group'));
    var match = function (c, f) { return f === 'all' || (f === 'first' ? c.getAttribute('data-first') === 'true' : c.getAttribute('data-cat') === f); };
    chips.forEach(function (ch) {
      var f = ch.getAttribute('data-filter'), n = ch.querySelector('.n');
      if (n) n.textContent = cards.filter(function (c) { return match(c, f); }).length;
      ch.addEventListener('click', function () {
        chips.forEach(function (o) { var on = o === ch; o.classList.toggle('on', on); o.setAttribute('aria-pressed', on ? 'true' : 'false'); });
        cards.forEach(function (c) { c.classList.toggle('hidden', !match(c, f)); });
        groups.forEach(function (g) { g.classList.toggle('hidden', !g.querySelector('.pub-card:not(.hidden)')); });
      });
    });
  }

  /* Copy citation and print */
  [].forEach.call(document.querySelectorAll('[data-copy]'), function (b) {
    b.addEventListener('click', function () {
      var el = document.querySelector(b.getAttribute('data-copy'));
      if (!el) return;
      var txt = el.innerText.trim(), lab = b.querySelector('span');
      var ok = function () { if (lab) { var o = lab.textContent; lab.textContent = 'Copied'; setTimeout(function () { lab.textContent = o; }, 1600); } };
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(txt).then(ok, function () {}); }
      else { var ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); ok(); } catch (e) {} document.body.removeChild(ta); }
    });
  });
  [].forEach.call(document.querySelectorAll('[data-print]'), function (b) { b.addEventListener('click', function () { window.print(); }); });

  /* ---------- Generative research art ---------- */
  function rng(seed) { var a = (seed | 0) || 1; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function nrm(a, b) { var l = Math.hypot(a, b) || 1; return [a / l, b / l]; }
  function mix(a, b, t) { return [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t)]; }
  function ramp(s, t) { t = Math.max(0, Math.min(1, t)); var n = s.length - 1, i = Math.min(n - 1, Math.floor(t * n)); return mix(s[i], s[i + 1], t * n - i); }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function palette() {
    var L = isLight();
    return { L: L, bg: cssv('--bg-3') || (L ? '#e5ebf3' : '#0e1727'), grid: L ? 'rgba(11,18,32,.07)' : 'rgba(255,255,255,.045)',
      ink: L ? [11, 18, 32] : [231, 237, 246], teal: L ? [13, 148, 136] : [45, 212, 191], sky: L ? [2, 132, 199] : [56, 189, 248],
      violet: L ? [124, 58, 237] : [139, 92, 246], crimson: L ? [225, 29, 72] : [244, 63, 94], amber: L ? [217, 119, 6] : [251, 191, 36] };
  }
  function prep(cv) {
    var r = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return null;
    cv.width = Math.round(w * r); cv.height = Math.round(h * r);
    var x = cv.getContext('2d'); x.setTransform(r, 0, 0, r, 0, 0);
    return { x: x, W: w, H: h };
  }
  function base(c, P, grid) {
    var x = c.x; x.clearRect(0, 0, c.W, c.H); x.fillStyle = P.bg; x.fillRect(0, 0, c.W, c.H);
    if (grid) { x.strokeStyle = P.grid; x.lineWidth = 1; x.beginPath(); for (var gx = 24; gx < c.W; gx += 24) { x.moveTo(gx + .5, 0); x.lineTo(gx + .5, c.H); } for (var gy = 24; gy < c.H; gy += 24) { x.moveTo(0, gy + .5); x.lineTo(c.W, gy + .5); } x.stroke(); }
  }
  function label(c, P, t) { var x = c.x; x.font = '500 11px JetBrains Mono, ui-monospace, monospace'; x.fillStyle = rgba(P.ink, .5); x.fillText(t, 14, c.H - 14); }
  function rr(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
  var ART = {};

  ART.streamlines = function (c, R, P) {
    var x = c.x, W = c.W, H = c.H; base(c, P, true);
    var ph = R() * 6.283, amp = H * (.05 + R() * .05), y0 = H * (.42 + R() * .14), xs = W * (.44 + R() * .12), r = H * .15, s;
    function tr(t) { return [-12 + t * (xs + 12), y0 + Math.sin(t * 3 + ph) * amp]; }
    var e = tr(1), q = tr(.985), T = nrm(e[0] - q[0], e[1] - q[1]), N = [-T[1], T[0]];
    function mk(sg) { var p0 = [e[0] + N[0] * sg * r / 2, e[1] + N[1] * sg * r / 2], L = W - xs + 40; return { a: p0, b: [p0[0] + T[0] * L * .45, p0[1] + T[1] * L * .45], c: [W + 40, e[1] + sg * H * (.24 + R() * .1)], w0: r / 2, w1: r * (.6 + R() * .12) }; }
    var B = [mk(-1), mk(1)];
    function bz(b, u) { var v = 1 - u; return [v * v * b.a[0] + 2 * v * u * b.b[0] + u * u * b.c[0], v * v * b.a[1] + 2 * v * u * b.b[1] + u * u * b.c[1]]; }
    function bt(b, u) { var v = 1 - u; return nrm(2 * v * (b.b[0] - b.a[0]) + 2 * u * (b.c[0] - b.b[0]), 2 * v * (b.b[1] - b.a[1]) + 2 * u * (b.c[1] - b.b[1])); }
    var ks = [], n = 24, i; for (i = 0; i <= n; i++) ks.push(-1 + 2 * i / n); ks.push(-1e-4);
    var st = P.L ? [[160, 214, 207], [13, 148, 136], [4, 78, 72]] : [[20, 86, 82], [45, 212, 191], [214, 252, 245]];
    var paths = []; x.lineCap = 'round'; x.lineJoin = 'round';
    ks.forEach(function (k) {
      var pts = [];
      for (s = 0; s <= 50; s++) { var t = s / 50, p = tr(t), p2 = tr(Math.min(1, t + .01)), p1 = tr(Math.max(0, t - .01)), tt = nrm(p2[0] - p1[0], p2[1] - p1[1]); pts.push([p[0] - tt[1] * k * r, p[1] + tt[0] * k * r]); }
      var b = k < 0 ? B[0] : B[1], kb = k < 0 ? (k + .5) * 2 : (k - .5) * 2;
      for (s = 1; s <= 60; s++) { var u = s / 60, cc = bz(b, u), tb2 = bt(b, u), w = b.w0 + (b.w1 - b.w0) * u; pts.push([cc[0] - tb2[1] * kb * w, cc[1] + tb2[0] * kb * w]); }
      var wall = Math.abs(Math.abs(k) - 1) < 1e-6 || Math.abs(k) < 1e-3;
      x.strokeStyle = wall ? rgba(P.ink, P.L ? .35 : .3) : rgba(ramp(st, 1 - k * k), .8);
      x.lineWidth = wall ? 1.8 : 1.15;
      x.beginPath(); pts.forEach(function (p, j) { if (j) x.lineTo(p[0], p[1]); else x.moveTo(p[0], p[1]); }); x.stroke();
      if (!wall) paths.push(pts);
    });
    x.shadowColor = rgba(P.crimson, .9); x.shadowBlur = 10; x.fillStyle = rgba(P.crimson, .95);
    for (i = 0; i < 30; i++) { var pp = paths[(R() * paths.length) | 0], pt = pp[(R() * pp.length) | 0]; x.beginPath(); x.arc(pt[0], pt[1], 1.6 + R() * 1.6, 0, 6.283); x.fill(); }
    x.shadowBlur = 0; label(c, P, 'u(x,t)  ·  PINN flow field');
  };

  ART.operator = function (c, R, P) {
    var x = c.x, W = c.W, H = c.H; base(c, P, false);
    var nx = 24, ny = 15, p1 = R() * 6.283, p2 = R() * 6.283, A = .05 + R() * .04, i, j, st = [P.sky, P.teal, P.violet, P.crimson];
    function mp(a, b) { var u = a / (nx - 1), v = b / (ny - 1); return [(.06 + u * .88 + Math.sin(v * 5 + p1) * A + Math.sin((u + v) * 4 + p2) * A * .6) * W, (.1 + v * .78 + Math.cos(u * 4.5 + p2) * A * 1.2) * H]; }
    function fv(a, b) { var u = a / (nx - 1), v = b / (ny - 1); return .5 + .5 * Math.sin(u * 3.2 + p1) * Math.cos(v * 2.6 + p2 * .5); }
    x.lineWidth = 1; x.strokeStyle = rgba(P.ink, P.L ? .1 : .09);
    for (j = 0; j < ny; j++) { x.beginPath(); for (i = 0; i < nx; i++) { var a1 = mp(i, j); if (i) x.lineTo(a1[0], a1[1]); else x.moveTo(a1[0], a1[1]); } x.stroke(); }
    for (i = 0; i < nx; i++) { x.beginPath(); for (j = 0; j < ny; j++) { var b1 = mp(i, j); if (j) x.lineTo(b1[0], b1[1]); else x.moveTo(b1[0], b1[1]); } x.stroke(); }
    for (i = 0; i < nx; i++) for (j = 0; j < ny; j++) { var p = mp(i, j), f = fv(i, j); x.fillStyle = rgba(ramp(st, f), .92); x.beginPath(); x.arc(p[0], p[1], 1.4 + f * 2.4, 0, 6.283); x.fill(); }
    x.strokeStyle = rgba(P.teal, .95); x.lineWidth = 1.5;
    for (var qn = 0; qn < 5; qn++) { var g = mp(1 + ((R() * (nx - 2)) | 0), 1 + ((R() * (ny - 2)) | 0)); x.beginPath(); x.arc(g[0], g[1], 9, 0, 6.283); x.stroke(); }
    label(c, P, 'G(a)(y)  ·  neural operator');
  };

  ART.dose = function (c, R, P) {
    var x = c.x, W = c.W, H = c.H; base(c, P, true);
    var gw = 200, gh = Math.max(80, Math.round(gw * H / W)), off = document.createElement('canvas'); off.width = gw; off.height = gh;
    var o = off.getContext('2d'), im = o.createImageData(gw, gh), d = im.data, bl = [], k, ph = R() * 6.283;
    for (k = 0; k < 5; k++) bl.push([.34 + R() * .4, .32 + R() * .36, .05 + R() * .08, .35 + R() * .65]);
    var st = P.L ? [[247, 249, 252], [254, 215, 170], [251, 146, 60], [225, 29, 72], [112, 26, 117]] : [[14, 23, 39], [76, 29, 149], [190, 24, 93], [244, 63, 94], [251, 191, 36], [254, 243, 199]];
    for (var j = 0; j < gh; j++) for (var i = 0; i < gw; i++) {
      var u = i / gw, v = j / gh, cx = u - .52, cy = (v - .5) * 1.3, an = Math.atan2(cy, cx), rad = .37 + .06 * Math.sin(an * 2 + ph) + .035 * Math.sin(an * 3 - ph * .7), id = (j * gw + i) * 4;
      if (Math.hypot(cx, cy) > rad) { d[id + 3] = 0; continue; }
      var f = .06; for (k = 0; k < bl.length; k++) { var Bb = bl[k], dx = u - Bb[0], dy = v - Bb[1]; f += Bb[3] * Math.exp(-(dx * dx + dy * dy) / (2 * Bb[2] * Bb[2])); }
      f = Math.min(1, f); var col = ramp(st, .05 + Math.floor(f * 10) / 10 * .93);
      d[id] = col[0]; d[id + 1] = col[1]; d[id + 2] = col[2]; d[id + 3] = 240;
    }
    o.putImageData(im, 0, 0); x.imageSmoothingEnabled = true; x.drawImage(off, 0, 0, W, H);
    var bh = H - 44, bx = W - 26; for (k = 0; k < 50; k++) { x.fillStyle = rgba(ramp(st, k / 50), 1); x.fillRect(bx, H - 22 - (k + 1) * bh / 50, 10, bh / 50 + 1); }
    label(c, P, 'absorbed dose  ·  Gy');
  };

  ART.tree = function (c, R, P) {
    var x = c.x, W = c.W, H = c.H; base(c, P, true); x.lineCap = 'round'; var nodes = [];
    function br(px, py, a, len, w, dp) {
      var ex = px + Math.cos(a) * len, ey = py + Math.sin(a) * len, bend = (R() - .5) * len * .3, mx = (px + ex) / 2 - Math.sin(a) * bend, my = (py + ey) / 2 + Math.cos(a) * bend;
      x.strokeStyle = rgba(mix(P.crimson, P.teal, Math.min(1, dp / 5)), .9); x.lineWidth = w; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(mx, my, ex, ey); x.stroke();
      if (dp < 6 && w > .9) { var sp = .32 + R() * .28; nodes.push([ex, ey, w]); br(ex, ey, a - sp, len * (.66 + R() * .12), w * .72, dp + 1); br(ex, ey, a + sp * (.8 + R() * .4), len * (.62 + R() * .14), w * .68, dp + 1); }
    }
    br(-8, H * (.5 + (R() - .5) * .14), (R() - .5) * .18, W * .23, Math.max(5, H * .045), 0);
    x.shadowColor = rgba(P.teal, .9); x.shadowBlur = 9; x.fillStyle = rgba(P.L ? P.teal : [204, 251, 241], .95);
    nodes.forEach(function (nd, ix) { if (ix % 2) return; x.beginPath(); x.arc(nd[0], nd[1], Math.max(1.5, nd[2] * .38), 0, 6.283); x.fill(); });
    x.shadowBlur = 0;
    var pw = Math.min(170, W * .36), ph = 58, px = W - pw - 14, py = 14;
    x.fillStyle = P.L ? 'rgba(255,255,255,.9)' : 'rgba(10,17,31,.84)'; rr(x, px, py, pw, ph, 12); x.fill(); x.strokeStyle = rgba(P.ink, .14); x.lineWidth = 1; x.stroke();
    x.font = '500 10.5px JetBrains Mono, ui-monospace, monospace'; x.fillStyle = rgba(P.ink, .6); x.fillText('inlet velocity', px + 12, py + 22);
    x.fillStyle = rgba(P.ink, .12); rr(x, px + 12, py + 34, pw - 24, 5, 2.5); x.fill();
    x.fillStyle = rgba(P.teal, 1); rr(x, px + 12, py + 34, (pw - 24) * .58, 5, 2.5); x.fill();
    x.beginPath(); x.arc(px + 12 + (pw - 24) * .58, py + 36.5, 6, 0, 6.283); x.fill();
    label(c, P, 'digital twin  ·  vessel tree');
  };

  ART.network = function (c, R, P) {
    var x = c.x, W = c.W, H = c.H; base(c, P, false);
    var nets = [{ y0: .14, y1: .44, s: [3 + ((R() * 2) | 0), 6, 6] }, { y0: .56, y1: .86, s: [2 + ((R() * 2) | 0), 6, 6] }], pos = [], i, k;
    nets.forEach(function (nt) { var L = []; nt.s.forEach(function (sz, li) { var col = []; for (k = 0; k < sz; k++) col.push([W * (.1 + li * .2), H * (nt.y0 + (nt.y1 - nt.y0) * (sz === 1 ? .5 : k / (sz - 1)))]); L.push(col); }); pos.push(L); });
    var M = [W * .76, H * .5], O = [W * .9, H * .5]; x.lineWidth = 1;
    pos.forEach(function (L) {
      for (i = 0; i < L.length - 1; i++) L[i].forEach(function (a) { L[i + 1].forEach(function (b) { var wv = R(); x.strokeStyle = rgba(wv > .5 ? P.teal : P.violet, .08 + wv * .28); x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke(); }); });
      L[L.length - 1].forEach(function (a) { x.strokeStyle = rgba(P.sky, .35); x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(M[0], M[1]); x.stroke(); });
    });
    x.strokeStyle = rgba(P.crimson, .7); x.lineWidth = 2; x.beginPath(); x.moveTo(M[0], M[1]); x.lineTo(O[0], O[1]); x.stroke();
    x.shadowBlur = 8; x.shadowColor = rgba(P.teal, .8);
    pos.forEach(function (L) { L.forEach(function (col, li) { col.forEach(function (p) { x.fillStyle = li === 0 ? rgba(P.sky, 1) : rgba(P.teal, 1); x.beginPath(); x.arc(p[0], p[1], 4, 0, 6.283); x.fill(); }); }); });
    x.shadowColor = rgba(P.crimson, .9); x.fillStyle = rgba(P.crimson, 1); x.beginPath(); x.arc(M[0], M[1], 10, 0, 6.283); x.fill(); x.beginPath(); x.arc(O[0], O[1], 6, 0, 6.283); x.fill(); x.shadowBlur = 0;
    x.fillStyle = P.L ? '#ffffff' : '#0e1727'; x.font = '700 12px JetBrains Mono, ui-monospace, monospace'; x.textAlign = 'center'; x.fillText('×', M[0], M[1] + 4); x.textAlign = 'left';
    x.font = '500 10.5px JetBrains Mono, ui-monospace, monospace'; x.fillStyle = rgba(P.ink, .55); x.fillText('branch net', W * .1 - 6, H * .08); x.fillText('trunk net', W * .1 - 6, H * .96); x.fillText('u(y)', O[0] - 12, O[1] - 16);
  };

  ART.waves = function (c, R, P) {
    var x = c.x, W = c.W, H = c.H; base(c, P, true);
    var n = 9, ph = R() * 6.283, burg = R() < .55, st = [P.teal, P.sky, P.violet, P.crimson];
    function bu(u, t) { var v = Math.sin(6.283 * u + ph); for (var it = 0; it < 30; it++) v = .5 * v + .5 * Math.sin(6.283 * (u - .14 * t * v) + ph); return v; }
    for (var k = 0; k < n; k++) {
      var t = k / (n - 1), y0 = H * (.2 + .6 * t), amp = H * .11 * (burg ? 1 : Math.exp(-t * 1.4));
      x.strokeStyle = rgba(ramp(st, t), .9); x.lineWidth = 1.7; x.beginPath();
      for (var i = 0; i <= 180; i++) { var u = i / 180, val = burg ? bu(u, t) : Math.sin(6.283 * u + ph) * Math.exp(-t * 1.2) + .25 * Math.sin(12.566 * u + ph * 1.3) * Math.exp(-t * 3.5), X = W * .05 + u * W * .9, Y = y0 - val * amp; if (i) x.lineTo(X, Y); else x.moveTo(X, Y); }
      x.stroke();
    }
    label(c, P, burg ? 'u(x,t)  ·  Burgers equation' : 'T(x,t)  ·  heat equation');
  };

  ART.wake = function (c, R, P) {
    var x = c.x, W = c.W, H = c.H; base(c, P, true);
    var Rc = H * .12, cx = W * .24, cy = H * .5, vs = [], k;
    for (k = 0; k < 6; k++) vs.push([cx + Rc * 2.3 + k * Rc * 2.2, cy + (k % 2 ? 1 : -1) * Rc * .6, (k % 2 ? 1 : -1) * Rc * 1.15 * (1 - k * .08)]);
    function vel(px, py) {
      var zx = px - cx, zy = py - cy; if (zx * zx + zy * zy < Rc * Rc * 1.02) return null;
      var z2r = zx * zx - zy * zy, z2i = 2 * zx * zy, dd = z2r * z2r + z2i * z2i, ir = z2r / dd, ii = -z2i / dd, u = 1 - Rc * Rc * ir, v = Rc * Rc * ii;
      for (var m = 0; m < vs.length; m++) { var V = vs[m], dx = px - V[0], dy = py - V[1], q = dx * dx + dy * dy + Rc * Rc * .12; u += -V[2] * dy / q; v += V[2] * dx / q; }
      return [u, v];
    }
    var st = P.L ? [[150, 200, 215], [2, 132, 199], [124, 58, 237]] : [[30, 80, 110], [56, 189, 248], [196, 181, 253]], lines = 34;
    for (var l = 0; l < lines; l++) {
      var px = 2, py = H * (l + .5) / lines, pts = [[px, py]], sp = [];
      for (var s = 0; s < 700; s++) {
        var a = vel(px, py); if (!a) break; var ma = Math.hypot(a[0], a[1]) || 1;
        var b = vel(px + a[0] / ma * 1.1, py + a[1] / ma * 1.1); if (!b) break; var mb = Math.hypot(b[0], b[1]) || 1;
        px += b[0] / mb * 2.2; py += b[1] / mb * 2.2; if (px > W + 2 || px < -2 || py < -2 || py > H + 2) break; pts.push([px, py]); sp.push(mb);
      }
      for (var s2 = 1; s2 < pts.length; s2 += 6) { var e2 = Math.min(pts.length - 1, s2 + 6), m2 = sp[Math.min(sp.length - 1, s2)] || 1; x.strokeStyle = rgba(ramp(st, Math.min(1, m2 / 1.8)), .85); x.lineWidth = 1.2; x.beginPath(); x.moveTo(pts[s2 - 1][0], pts[s2 - 1][1]); for (var z = s2; z <= e2; z++) x.lineTo(pts[z][0], pts[z][1]); x.stroke(); }
    }
    x.fillStyle = P.L ? '#ffffff' : '#0a111f'; x.strokeStyle = rgba(P.ink, .35); x.lineWidth = 1.5; x.beginPath(); x.arc(cx, cy, Rc, 0, 6.283); x.fill(); x.stroke();
    label(c, P, 'cylinder wake  ·  inverse PINN');
  };

  ART.acoustic = function (c, R, P) {
    var x = c.x, W = c.W, H = c.H; base(c, P, false);
    var n = 4 + ((R() * 3) | 0), ct = H * .3, cb = H * .7, cl = W * .2, cw = W * .6, i, k;
    for (i = 0; i < cw; i += 2) { var pr = Math.abs(Math.cos(Math.PI * n * i / cw)); x.fillStyle = rgba(P.violet, .04 + .2 * pr); x.fillRect(cl + i, ct, 2, cb - ct); }
    x.strokeStyle = rgba(P.ink, .3); x.lineWidth = 1.4; x.beginPath(); x.moveTo(cl, ct); x.lineTo(cl + cw, ct); x.moveTo(cl, cb); x.lineTo(cl + cw, cb); x.stroke();
    function idt(x0, x1) { x.strokeStyle = rgba(P.amber, .85); x.lineWidth = 2; x.beginPath(); x.moveTo(x0, H * .18); x.lineTo(x1, H * .18); x.moveTo(x0, H * .82); x.lineTo(x1, H * .82); for (var f = x0 + 3, t = 0; f < x1; f += 5, t++) { if (t % 2) { x.moveTo(f, H * .18); x.lineTo(f, H * .7); } else { x.moveTo(f, H * .82); x.lineTo(f, H * .3); } } x.stroke(); }
    idt(W * .04, W * .16); idt(W * .84, W * .96);
    x.shadowBlur = 6; x.shadowColor = rgba(P.crimson, .8); x.fillStyle = rgba(P.crimson, .95);
    for (k = 0; k < 70; k++) { var m = (R() * n) | 0, nu = (m + .5) / n; x.beginPath(); x.arc(cl + (nu + (R() - .5) * .018) * cw, ct + 8 + R() * (cb - ct - 16), 2.2 + R() * 1.6, 0, 6.283); x.fill(); }
    x.shadowBlur = 0; x.fillStyle = rgba(P.teal, .8);
    for (k = 0; k < 150; k++) { x.beginPath(); x.arc(cl + R() * cw, ct + 6 + R() * (cb - ct - 12), 1 + R() * .6, 0, 6.283); x.fill(); }
    label(c, P, 'standing SAW  ·  particle separation');
  };

  ART.rays = function (c, R, P) {
    var x = c.x, W = c.W, H = c.H; base(c, P, true);
    var fx = W * .2, fy = H * .5, f = H * .16, ymin = fy - H * .4, ymax = fy + H * .4, tx0 = W * .56, tx1 = W * .92, ty0 = H * .26, ty1 = H * .74, k;
    x.fillStyle = rgba(P.sky, P.L ? .1 : .08); rr(x, tx0, ty0, tx1 - tx0, ty1 - ty0, (ty1 - ty0) / 2); x.fill(); x.strokeStyle = rgba(P.sky, .45); x.lineWidth = 1.2; x.stroke();
    var rays = 22;
    for (k = 0; k < rays; k++) {
      var yy = ymin + (k + .5) * (ymax - ymin) / rays, px2 = fx - f + (yy - fy) * (yy - fy) / (4 * f), col = ramp([P.violet, P.sky], k / rays);
      x.strokeStyle = rgba(col, .55); x.lineWidth = 1; x.beginPath(); x.moveTo(fx, fy); x.lineTo(px2, yy); x.lineTo(tx0, yy); x.stroke();
      if (yy > ty0 + 6 && yy < ty1 - 6) { var g = x.createLinearGradient(tx0, 0, tx1, 0); g.addColorStop(0, rgba(col, .75)); g.addColorStop(1, rgba(col, .05)); x.strokeStyle = g; x.lineWidth = 1.4; x.beginPath(); x.moveTo(tx0, yy); x.lineTo(tx1, yy); x.stroke(); }
      else { x.strokeStyle = rgba(col, .22); x.beginPath(); x.moveTo(tx0, yy); x.lineTo(W, yy); x.stroke(); }
    }
    x.strokeStyle = rgba(P.ink, .55); x.lineWidth = 2.4; x.beginPath();
    for (k = 0; k <= 100; k++) { var y = ymin + (ymax - ymin) * k / 100, px = fx - f + (y - fy) * (y - fy) / (4 * f); if (k) x.lineTo(px, y); else x.moveTo(px, y); }
    x.stroke();
    var gl = x.createRadialGradient(fx, fy, 0, fx, fy, 26); gl.addColorStop(0, rgba(P.L ? P.violet : [237, 233, 254], 1)); gl.addColorStop(1, rgba(P.violet, 0)); x.fillStyle = gl; x.beginPath(); x.arc(fx, fy, 26, 0, 6.283); x.fill();
    label(c, P, 'UV-C ray tracing  ·  irradiance');
  };

  ART.actuator = function (c, R, P) {
    var x = c.x, W = c.W, H = c.H; base(c, P, true);
    var bx = W * .16, by = H * .5, L = W * .6, n = 7, st = [P.sky, P.teal, P.violet, P.crimson];
    x.fillStyle = rgba(P.ink, .16); rr(x, bx - 30, by - 34, 30, 68, 8); x.fill();
    for (var k = 0; k < n; k++) {
      var th = (k / (n - 1) - .5) * 1.8 * (.8 + R() * .2), cvt = th / L, edge = k === 0 || k === n - 1, col = ramp(st, k / (n - 1));
      [-3.2, 0, 3.2].forEach(function (off, li) {
        x.strokeStyle = li === 1 ? rgba(P.ink, edge ? .35 : .12) : rgba(col, edge ? .95 : .32); x.lineWidth = li === 1 ? 1.6 : 2.3; x.beginPath();
        for (var s = 0; s <= 80; s++) { var sl = s / 80 * L, a = cvt * sl, px, py; if (Math.abs(cvt) < 1e-9) { px = bx + sl; py = by; } else { px = bx + Math.sin(a) / cvt; py = by + (1 - Math.cos(a)) / cvt; } px += -Math.sin(a) * off; py += Math.cos(a) * off; if (s) x.lineTo(px, py); else x.moveTo(px, py); }
        x.stroke();
      });
    }
    label(c, P, 'tri-layer actuator  ·  bending');
  };

  var arts = [].slice.call(document.querySelectorAll('canvas.art'));
  function drawArt(cv) {
    var fn = ART[cv.getAttribute('data-art')]; if (!fn) return;
    var c = prep(cv); if (!c) return;
    try { fn(c, rng(+cv.getAttribute('data-seed') || 1), palette()); } catch (err) {}
    cv.setAttribute('data-done', '1');
  }
  function redrawArts() { arts.forEach(function (a) { if (a.getAttribute('data-done')) drawArt(a); }); }
  if (arts.length) {
    if ('IntersectionObserver' in window) {
      var ao = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { drawArt(e.target); ao.unobserve(e.target); } }); }, { rootMargin: '300px 0px' });
      arts.forEach(function (a) { ao.observe(a); });
    } else { arts.forEach(drawArt); }
    var artTimer, lastW = window.innerWidth;
    window.addEventListener('resize', function () { if (Math.abs(window.innerWidth - lastW) < 2) return; lastW = window.innerWidth; clearTimeout(artTimer); artTimer = setTimeout(redrawArts, 200); });
    window.addEventListener('et-theme', redrawArts);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(redrawArts);
  }

  /* ---------- Hero flow field ---------- */
  (function () {
    var cv = document.getElementById('flowfield'); if (!cv) return;
    var x = cv.getContext('2d'), W = 0, H = 0, r = Math.min(2, window.devicePixelRatio || 1), ps = [], t = 0, raf = 0, vis = true, M = { x: 0, y: 0, on: false }, bg = '#070b14', styles = [];
    function hexA(h, a) { h = (h || '#000000').replace('#', ''); if (h.length === 3) h = h.replace(/(.)/g, '$1$1'); var n = parseInt(h, 16); return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; }
    function theme() {
      var L = isLight(); bg = cssv('--bg') || (L ? '#f6f8fb' : '#070b14');
      var cols = L ? [[13, 148, 136], [225, 29, 72], [2, 132, 199]] : [[45, 212, 191], [244, 63, 94], [56, 189, 248]];
      styles = [];
      for (var c = 0; c < 3; c++) { styles.push([]); for (var b = 0; b < 5; b++) styles[c].push(rgba(cols[c], ((c === 0 ? .66 : .5) * (.14 + b * .215) * (L ? .85 : 1)).toFixed(3))); }
    }
    function spawn(any) { var h = Math.random(); return { x: any ? Math.random() * W : -4 - Math.random() * 30, y: Math.random() * H, c: h < .7 ? 0 : (h < .88 ? 1 : 2) }; }
    function size() {
      W = cv.clientWidth; H = cv.clientHeight; if (!W || !H) return;
      cv.width = Math.round(W * r); cv.height = Math.round(H * r); x.setTransform(r, 0, 0, r, 0, 0);
      x.fillStyle = bg; x.fillRect(0, 0, W, H);
      var n = Math.min(1200, Math.max(260, Math.floor(W * H / 1400))); ps = []; for (var i = 0; i < n; i++) ps.push(spawn(true));
    }
    function vel(px, py) {
      var nx = px / W, ny = py / H, a = Math.sin(ny * 6.2 + t * .35) * .9 + Math.cos(nx * 4.4 - t * .25) * .6 + Math.sin((nx + ny) * 3.1 + t * .2) * .45;
      var vx = 1 + Math.cos(a) * .75, vy = Math.sin(a) * .75;
      if (M.on) { var dx = px - M.x, dy = py - M.y, d2 = dx * dx + dy * dy, RR = 180; if (d2 < RR * RR) { var d = Math.sqrt(d2) + 1, f = (1 - d / RR) * 2.8; vx += -dy / d * f; vy += dx / d * f; } }
      return [vx, vy];
    }
    function step() {
      t += .016; var L = isLight(); x.fillStyle = hexA(bg, L ? .11 : .085); x.fillRect(0, 0, W, H); x.lineWidth = L ? 1.2 : 1;
      var wide = W > 860, paths = [[], [], []];
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i], v = vel(p.x, p.y), nx = p.x + v[0] * 1.3, ny = p.y + v[1] * 1.3;
        var s = wide ? Math.min(1, Math.max(0, (p.x / W - .06) * 1.45)) : .5, b = Math.min(4, Math.floor(s * 4.99));
        (paths[p.c][b] || (paths[p.c][b] = [])).push(p.x, p.y, nx, ny); p.x = nx; p.y = ny;
        if (p.x > W + 4 || p.y < -4 || p.y > H + 4 || Math.random() < .0022) ps[i] = spawn(Math.random() < .4);
      }
      for (var c = 0; c < 3; c++) for (var b2 = 0; b2 < 5; b2++) { var arr = paths[c][b2]; if (!arr || !arr.length) continue; x.strokeStyle = styles[c][b2]; x.beginPath(); for (var k = 0; k < arr.length; k += 4) { x.moveTo(arr[k], arr[k + 1]); x.lineTo(arr[k + 2], arr[k + 3]); } x.stroke(); }
    }
    function loop() { step(); raf = requestAnimationFrame(loop); }
    function start() { if (!raf && vis && !document.hidden && !reduce) raf = requestAnimationFrame(loop); }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
    function still() { for (var k = 0; k < 280; k++) step(); }
    theme(); size(); if (reduce) still(); else start();
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) start(); else stop(); }).observe(cv);
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (cv.clientWidth !== W || Math.abs(cv.clientHeight - H) > 120) { size(); if (reduce) still(); } }, 150); });
    window.addEventListener('pointermove', function (e) { var b = cv.getBoundingClientRect(); M.x = e.clientX - b.left; M.y = e.clientY - b.top; M.on = M.x >= 0 && M.y >= 0 && M.x <= b.width && M.y <= b.height; }, { passive: true });
    document.addEventListener('mouseleave', function () { M.on = false; });
    window.addEventListener('et-theme', function () { theme(); x.fillStyle = bg; x.fillRect(0, 0, W, H); if (reduce) still(); });
  })();
})();
