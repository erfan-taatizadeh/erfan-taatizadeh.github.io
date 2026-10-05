/* Atelier theme scripts · erfan-taatizadeh.github.io */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  function $$(s, c) { return [].slice.call((c || document).querySelectorAll(s)); }
  function isBlue() { return root.getAttribute('data-theme') === 'blue'; }

  /* ---------- Colour theme (rose or blue), chosen by the visitor ---------- */
  var swatches = $$('[data-set-theme]');
  function applyTheme(t, save) {
    if (t === 'blue') root.setAttribute('data-theme', 'blue'); else root.removeAttribute('data-theme');
    swatches.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-set-theme') === t ? 'true' : 'false'); });
    var mc = document.querySelector('meta[name="theme-color"]');
    if (mc) mc.setAttribute('content', t === 'blue' ? '#F4F7FA' : '#FEF9ED');
    if (save) { try { localStorage.setItem('et-palette', t); } catch (e) {} repaintAll(); }
  }
  swatches.forEach(function (b) { b.addEventListener('click', function () { applyTheme(b.getAttribute('data-set-theme'), true); }); });
  applyTheme(isBlue() ? 'blue' : 'rose', false);

  /* ---------- Navigation ---------- */
  var menu = document.getElementById('menu'), links = document.getElementById('links');
  function setMenu(open) {
    if (!menu || !links) return;
    links.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', open ? 'true' : 'false');
    var l = menu.querySelector('.ml'); if (l) l.textContent = open ? 'Close' : 'Menu';
  }
  if (menu && links) {
    menu.addEventListener('click', function (e) { e.stopPropagation(); setMenu(!links.classList.contains('open')); });
    links.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    document.addEventListener('click', function (e) { if (!e.target.closest('#nav')) setMenu(false); });
  }

  /* ---------- Reveal on scroll ---------- */
  var rv = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add('in'); }); }

  /* ---------- Count up ---------- */
  function countUp(el) {
    var end = +el.getAttribute('data-count'), suf = el.getAttribute('data-suffix') || '', t0 = null;
    if (reduce) { el.textContent = end + suf; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * e) + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* ---------- Values: sticky, scroll-driven list ---------- */
  var vs = document.querySelector('[data-values]');
  var vItems = vs ? $$('.v-list li', vs) : [], vTexts = vs ? $$('.v-text', vs) : [];
  var vLoop = vs ? vs.querySelector('.v-loop') : null, vNum = vs ? vs.querySelector('.v-count b') : null, vCur = -1;
  function placeLoop() {
    if (!vLoop || vCur < 0) return;
    var s = vItems[vCur].querySelector('span'), box = vLoop.parentElement.getBoundingClientRect(), r = s.getBoundingClientRect();
    var px = Math.max(18, r.width * 0.07), py = r.height * 0.16;
    vLoop.style.left = (r.left - box.left - px) + 'px';
    vLoop.style.top = (r.top - box.top - py) + 'px';
    vLoop.style.width = (r.width + px * 2) + 'px';
    vLoop.style.height = (r.height + py * 2) + 'px';
  }
  function redrawLoop() { if (!vLoop) return; placeLoop(); vLoop.classList.remove('draw'); void vLoop.getBoundingClientRect(); vLoop.classList.add('draw'); }
  function setV(i) {
    if (i === vCur || !vItems.length) return;
    vCur = i;
    vItems.forEach(function (li, k) { li.classList.toggle('on', k === i); });
    vTexts.forEach(function (t, k) { t.classList.toggle('on', k === i); t.setAttribute('aria-hidden', k === i ? 'false' : 'true'); });
    if (vNum) vNum.textContent = ('0' + (i + 1)).slice(-2);
    redrawLoop();
  }
  function onValues() {
    if (!vs) return;
    var r = vs.getBoundingClientRect(), total = vs.offsetHeight - window.innerHeight;
    var p = total > 0 ? Math.min(0.9999, Math.max(0, -r.top / total)) : 0;
    setV(Math.floor(p * vItems.length));
  }
  if (vs) {
    vItems.forEach(function (li, k) {
      var b = li.querySelector('button');
      if (b) b.addEventListener('click', function () {
        var top = vs.getBoundingClientRect().top + window.scrollY + ((k + 0.5) / vItems.length) * (vs.offsetHeight - window.innerHeight);
        window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
      });
    });
    var vt = false;
    window.addEventListener('scroll', function () { if (!vt) { vt = true; requestAnimationFrame(function () { onValues(); vt = false; }); } }, { passive: true });
    onValues();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeLoop);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) redrawLoop(); });
      }, { threshold: 0.35 }).observe(vs.querySelector('.values-sticky'));
    }
  }

  /* ---------- Carousels ---------- */
  $$('[data-carousel]').forEach(function (c) {
    var t = c.querySelector('.car-track'), prev = c.querySelector('[data-prev]'), next = c.querySelector('[data-next]');
    if (!t) return;
    function step() { var card = t.querySelector('.ccard'); return card ? card.getBoundingClientRect().width + 14 : t.clientWidth * 0.8; }
    function upd() {
      if (prev) prev.disabled = t.scrollLeft < 4;
      if (next) next.disabled = t.scrollLeft + t.clientWidth >= t.scrollWidth - 4;
    }
    if (prev) prev.addEventListener('click', function () { t.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); });
    if (next) next.addEventListener('click', function () { t.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); });
    var ct = false;
    t.addEventListener('scroll', function () { if (!ct) { ct = true; requestAnimationFrame(function () { upd(); ct = false; }); } }, { passive: true });
    window.addEventListener('resize', upd);
    upd();
  });

  /* ---------- Publication filters ---------- */
  var chips = $$('[data-filter]');
  if (chips.length) {
    var cards = $$('.pub-card'), groups = $$('.year-group');
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

  /* ---------- Copy citation and print ---------- */
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var el = document.querySelector(b.getAttribute('data-copy'));
      if (!el) return;
      var txt = el.innerText.trim(), lab = b.querySelector('span:not(.ar)');
      var ok = function () { if (lab) { var o = lab.textContent; lab.textContent = 'Copied'; setTimeout(function () { lab.textContent = o; }, 1600); } };
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(txt).then(ok, function () {}); }
      else { var ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); ok(); } catch (e) {} document.body.removeChild(ta); }
    });
  });
  $$('[data-print]').forEach(function (b) { b.addEventListener('click', function () { window.print(); }); });

  /* =====================================================================
     Painterly generative art with schematic detail
     Each scene returns marks in normalized coordinates:
       b blob, s brush stroke, d sphere, l ink line, a arrow, e ellipse, t label.
     A soft base pass is painted at low resolution and scaled up (wash),
     then a detail pass adds bristles, ink lines, arrows, spheres and labels,
     and a film grain finishes the surface.
     ===================================================================== */
  function rng(seed) { var a = (seed | 0) || 1; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hx(h) { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function shade(c, t) { return t < 0 ? [c[0] * (1 + t) | 0, c[1] * (1 + t) | 0, c[2] * (1 + t) | 0] : [c[0] + (255 - c[0]) * t | 0, c[1] + (255 - c[1]) * t | 0, c[2] + (255 - c[2]) * t | 0]; }
  function lum(c) { return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255; }
  function pick(r, a) { return a[(r() * a.length) | 0]; }
  function P_(bg, c, hi, lo) { return { bg: hx(bg), c: c.map(hx), hi: hi.map(hx), lo: lo.map(hx) }; }
  var PAL_W = {
    rose: P_('#C47A6A', ['#BF6E60', '#CC8676', '#D69888', '#B5665A', '#C97F6F', '#DBA392'], ['#E8B9A6', '#EFC9B8', '#E2AE9B'], ['#A2574C', '#974F45']),
    clay: P_('#B8705C', ['#B0644F', '#C07A65', '#CB8B76', '#A85E4A', '#D49A85'], ['#E3B29C', '#EBC3AE', '#F0CDB9'], ['#8F4E3E', '#85483A']),
    slate: P_('#7F92AA', ['#73879F', '#8698AF', '#93A5BB', '#6B7F98', '#9DAEC2'], ['#BFCCDA', '#CFD9E4', '#E6BCAA'], ['#5D7089', '#53657D']),
    moss: P_('#8C987F', ['#828F75', '#95A188', '#A0AB93', '#7A876D', '#AAB29A'], ['#C3CBB6', '#D8D0BC', '#E8C4AE'], ['#6B7860', '#606C56']),
    plum: P_('#918199', ['#87778F', '#9A8AA2', '#A595AC', '#7E6E86', '#B39AA6'], ['#CFC3D6', '#E2CCCB', '#D9CDE0'], ['#6E5F77', '#64566C']),
    blue: P_('#A3B5C9', ['#93A7BE', '#A9BBCF', '#B5C5D6', '#8A9FB8', '#9DB0C5'], ['#D2DCE6', '#E1E8EF', '#F0C9B8'], ['#6E86A2', '#617996']),
    peach: P_('#EDB69E', ['#E9A68C', '#F0BBA3', '#E49A7F', '#F4C8B2', '#DD9076'], ['#F9DDCD', '#FBE7DA', '#FCEFE4'], ['#C9765E', '#B96A55']),
    sand: P_('#EBD8BC', ['#E4CDAB', '#EFDFC5', '#DCC29E', '#F3E6D0', '#E8C9AE'], ['#FAF1E2', '#F6E9D6', '#FDF6EA'], ['#B99772', '#A87F62']),
    sage: P_('#B3BDA6', ['#A7B29A', '#BCC6AF', '#9CA88F', '#C6CEBA', '#B0B79E'], ['#DCE2D3', '#E9E0CF', '#F0D3C2'], ['#7E8B73', '#738068']),
    dusk: P_('#AFA3BC', ['#A397B2', '#B8ADC6', '#9A8DAA', '#C2B8CE', '#C4A4AC'], ['#DDD6E6', '#EBDCDA', '#F1E2E6'], ['#7D7192', '#716585'])
  };
  /* Blue colour map: same palette names, re-tinted into blues */
  var PAL_B = {
    rose: P_('#5F82AB', ['#55779F', '#6A8CB4', '#7898BE', '#4D6E96', '#6385AD', '#86A4C7'], ['#B3C8DF', '#C6D6E8', '#A7BFDB'], ['#3F5F87', '#38577D']),
    clay: P_('#4A6890', ['#425F86', '#53729A', '#5F7EA5', '#3B5880', '#6B88AD'], ['#A9BFD9', '#BCCDE2', '#C9D8EA'], ['#2F4A6E', '#2A4365']),
    slate: P_('#5A7090', ['#516786', '#637A99', '#7086A3', '#4A607E', '#7B90AB'], ['#B5C3D5', '#C7D2E0', '#D2DCE8'], ['#3E5270', '#384A66']),
    moss: P_('#4F7D8A', ['#477482', '#588794', '#65929E', '#406A77', '#6F9AA5'], ['#B2CCD3', '#C4D8DD', '#D3E3E7'], ['#355F6B', '#2F5560']),
    plum: P_('#64709E', ['#5B6794', '#6D79A6', '#7A85B0', '#545F8B', '#8590B8'], ['#C0C6DE', '#CFD4E7', '#DCE0EE'], ['#475283', '#404A77']),
    blue: P_('#A3B5C9', ['#93A7BE', '#A9BBCF', '#B5C5D6', '#8A9FB8', '#9DB0C5'], ['#D2DCE6', '#E1E8EF', '#E8F0F8'], ['#6E86A2', '#617996']),
    peach: P_('#A9C4E0', ['#9DBADA', '#B3CCE5', '#90B0D3', '#BFD4EA', '#86A7CC'], ['#DCE8F4', '#E7EFF8', '#F1F6FB'], ['#5F86B2', '#5479A6']),
    sand: P_('#D6E1EC', ['#CCD9E6', '#DCE5EF', '#C2D1E0', '#E3EAF2', '#BACBDD'], ['#EEF3F8', '#F4F7FB', '#F8FAFC'], ['#8199B4', '#7189A6']),
    sage: P_('#A8C3CF', ['#9CB9C6', '#B2CCD7', '#91AFBD', '#BDD3DD', '#A3BFCB'], ['#DCE8ED', '#E6EFF3', '#EEF4F7'], ['#6C8D9C', '#628290']),
    dusk: P_('#A3AFD0', ['#97A4C8', '#ADB8D6', '#8D9AC0', '#B8C2DC', '#A0ACCD'], ['#DCE1EF', '#E6EAF4', '#EEF0F8'], ['#6E7BA6', '#64709A'])
  };
  var ACC_W = ['#EE9C83', '#F4B59E', '#E0846A', '#F7C6B2', '#E99076'].map(hx);
  var ACC_B = ['#F2F7FC', '#BCD8F1', '#2F64A0', '#7FB0DF', '#E3EEF8'].map(hx);
  var HOT_W = ['#FBE5CF', '#F4BA9C', '#E8957A', '#D2735C', '#B95C4C'].map(hx);
  var HOT_B = ['#F4F9FF', '#C7E0F6', '#8DBBE5', '#4A7FBA', '#2C5A92'].map(hx);
  var INK_W = hx('#4A3F38'), INK_B = hx('#1F2A37'), CREAM = hx('#FEF9ED'), BONE = hx('#F6EAD6');
  var ACC = ACC_W, HOT = HOT_W, INK = INK_W;
  var DEF = { hero: ['rose'], panel: ['blue'], streamlines: ['rose', 'peach'], operator: ['blue', 'sage'], dose: ['dusk', 'blue'], tree: ['peach', 'sand'],
    waves: ['blue', 'peach'], wake: ['sage', 'blue'], network: ['sand', 'sage'], actuator: ['peach', 'sand'], acoustic: ['blue', 'sage'], rays: ['dusk', 'blue'], icon: ['rose'] };

  function bez(p0, p1, p2, n) { var o = []; for (var i = 0; i <= n; i++) { var t = i / n, u = 1 - t; o.push([u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]]); } return o; }
  function wave(x0, x1, y0, amp, fq, ph, tilt, r, jit) { var o = [], st = (x1 - x0) / 28; for (var x = x0; x <= x1 + 1e-9; x += st) o.push([x, y0 + tilt * (x - 0.5) + amp * Math.sin(x * fq * 6.2832 + ph) + (r() - 0.5) * (jit || 0)]); return o; }
  /* perpendicular offset; d is in units of the shorter canvas side */
  function offset(pts, d, asp) {
    var S = Math.min(asp, 1), o = [];
    for (var i = 0; i < pts.length; i++) {
      var a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      var dx = (b[0] - a[0]) * asp, dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
      o.push([pts[i][0] + (-dy / l) * d * S / asp, pts[i][1] + (dx / l) * d * S]);
    }
    return o;
  }
  function polar(cx, cy, ang, dist, asp) { var S = Math.min(asp, 1); return [cx + Math.cos(ang) * dist * S / asp, cy + Math.sin(ang) * dist * S]; }
  function angAt(pts, i, asp) { var a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)]; return Math.atan2(b[1] - a[1], (b[0] - a[0]) * asp); }
  function blobs(m, r, P, n, rmin, rr) { for (var i = 0; i < n; i++) m.push({ t: 'b', x: r(), y: r(), r: rmin + r() * rr, c: pick(r, P.c), a: 0.5 + r() * 0.4 }); }
  function inkFor(P) { return lum(P.bg) > 0.62 ? INK : CREAM; }
  function label(m, P, s, x, y, tx, ty, al) { m.push({ t: 't', s: s, x: x, y: y, tx: tx, ty: ty, al: al, c: inkFor(P), h: P.bg, a: 0.9 }); }
  function line(m, P, pts, w, a, extra) { var o = { t: 'l', p: pts, w: w, c: inkFor(P), a: a, wob: 0.7 }; if (extra) for (var k in extra) o[k] = extra[k]; m.push(o); }
  function arrow(m, P, pts, w, a, hs) { m.push({ t: 'a', p: pts, w: w || 1.1, c: inkFor(P), a: a || 0.7, hs: hs || 1, wob: 0.5 }); }
  function collocation(m, r, P, n, x0, y0, x1, y1) { for (var i = 0; i < n; i++) m.push({ t: 'd', x: x0 + r() * (x1 - x0), y: y0 + r() * (y1 - y0), r: 0.0035, c: inkFor(P), a: 0.55, flat: 1 }); }
  /* marching squares: line segments of the level set F = L on a regular grid */
  function contour(F, G, xs, ys, L) {
    var segs = [];
    for (var j = 0; j < G - 1; j++) for (var i = 0; i < G - 1; i++) {
      var v = [F[j][i], F[j][i + 1], F[j + 1][i + 1], F[j + 1][i]], p = [[xs[i], ys[j]], [xs[i + 1], ys[j]], [xs[i + 1], ys[j + 1]], [xs[i], ys[j + 1]]], q = [];
      for (var e = 0; e < 4; e++) { var a = v[e], b = v[(e + 1) % 4]; if ((a < L) !== (b < L)) { var t = (L - a) / (b - a), pa = p[e], pb = p[(e + 1) % 4]; q.push([pa[0] + (pb[0] - pa[0]) * t, pa[1] + (pb[1] - pa[1]) * t]); } }
      if (q.length === 2) segs.push([q[0], q[1]]); else if (q.length === 4) { segs.push([q[0], q[1]]); segs.push([q[2], q[3]]); }
    }
    return segs;
  }
  function flecks(m, r, P, n) { for (var i = 0; i < n; i++) m.push({ t: 'd', x: r(), y: r(), r: 0.0012 + r() * 0.0028, c: pick(r, P.hi), a: 0.45 + r() * 0.3, flat: 1 }); }

  var SC = {
    hero: function (r, P) {
      var m = [], i; blobs(m, r, P, 8, 0.5, 0.7);
      var tilt = -0.18 - r() * 0.14, fq = 0.55 + r() * 0.5, ph = r() * 6.28;
      for (i = 0; i < 36; i++) {
        var y0 = -0.2 + r() * 1.4;
        m.push({ t: 's', p: wave(-0.15, 1.15, y0, 0.03 + r() * 0.09, fq, ph + y0 * 2.4 + (r() - 0.5) * 0.5, tilt, r, 0.01), w: 0.04 + r() * 0.16, c: pick(r, i % 5 === 0 ? P.lo : P.c), a: 0.2 + r() * 0.42, b: 0.9 });
      }
      for (i = 0; i < 12; i++) {
        var y1 = -0.1 + r() * 1.2;
        m.push({ t: 's', p: wave(-0.1, 1.1, y1, 0.03 + r() * 0.06, fq, ph + y1 * 2.4, tilt, r, 0.006), w: 0.012 + r() * 0.035, c: pick(r, P.hi), a: 0.2 + r() * 0.28, b: 1.2 });
      }
      for (i = 0; i < 9; i++) {
        var y2 = -0.1 + r() * 1.2;
        m.push({ t: 'l', p: wave(-0.1, 1.1, y2, 0.03 + r() * 0.05, fq, ph + y2 * 2.4, tilt, r, 0), w: 0.6, c: pick(r, P.hi), a: 0.22 + r() * 0.12, wob: 0.4 });
      }
      flecks(m, r, P, 70);
      return { bg: P.bg, m: m, soft: 0.15, grain: 0.13 };
    },
    panel: function (r, P, asp) {
      var m = [], i, port = asp < 1;
      function M(u, v) { return port ? [v, u] : [u, v]; }
      function cen(u) { return 0.5 + 0.15 * Math.sin(u * 3.4 + 0.6) + 0.04 * Math.sin(u * 7.1); }
      function lane(off) { var o = []; for (var u = -0.1; u <= 1.1; u += 0.04) o.push(M(u, cen(u) + off)); return o; }
      blobs(m, r, P, 9, 0.45, 0.6);
      for (i = 0; i < 3; i++) m.push({ t: 'b', x: r(), y: r(), r: 0.25 + r() * 0.3, c: pick(r, ACC), a: 0.22 + r() * 0.18 });
      for (i = 0; i < 10; i++) m.push({ t: 's', p: lane((r() - 0.5) * 1.1), w: 0.05 + r() * 0.12, c: pick(r, P.c), a: 0.25 + r() * 0.3, b: 0.7 });
      /* side branch leaving the main artery */
      var b0 = M(0.58, cen(0.58) - 0.17), b1 = M(0.7, cen(0.58) - 0.4), b2 = M(0.86, -0.08), br = bez(b0, b1, b2, 16);
      m.push({ t: 's', p: br, w: 0.2, c: P.lo[0], a: 0.3, b: 0 });
      m.push({ t: 's', p: br, w: 0.13, c: P.hi[0], a: 0.6, b: 0.5 });
      m.push({ t: 's', p: lane(0), w: 0.6, c: P.lo[0], a: 0.32, b: 0 });
      m.push({ t: 's', p: lane(0), w: 0.42, c: P.hi[0], a: 0.6, b: 0.5 });
      for (i = 0; i < 16; i++) m.push({ t: 's', p: lane((r() - 0.5) * 0.3), w: 0.012 + r() * 0.035, c: pick(r, i % 3 ? P.hi : ACC), a: 0.25 + r() * 0.35, b: 1 });
      /* ink schematic: vessel walls, centreline, branch walls */
      function uvOf(p) { return port ? [p[1], p[0]] : p; }
      function beyond(p) { var q = uvOf(p); return q[1] < cen(q[0]) - 0.215; }
      function fromWall(w) { var s0 = 0; while (s0 < w.length - 1 && !beyond(w[s0])) s0++; return w.slice(Math.max(0, s0 - 1)); }
      var bw1 = fromWall(offset(br, -0.07, asp)), bw2 = fromWall(offset(br, 0.07, asp));
      var ua = uvOf(bw1[0])[0], ub = uvOf(bw2[0])[0]; if (ua > ub) { var tu = ua; ua = ub; ub = tu; }
      var upA = [], upB = [];
      for (var uw = -0.1; uw <= 1.1; uw += 0.04) { if (uw < ua) upA.push(M(uw, cen(uw) - 0.215)); else if (uw > ub) upB.push(M(uw, cen(uw) - 0.215)); }
      upA.push(M(ua, cen(ua) - 0.215)); upB.unshift(M(ub, cen(ub) - 0.215));
      line(m, P, upA, 1.2, 0.5); line(m, P, upB, 1.2, 0.5); line(m, P, lane(0.215), 1.2, 0.5);
      line(m, P, lane(0), 0.8, 0.3, { dash: [3, 7] });
      line(m, P, bw1, 1, 0.45); line(m, P, bw2, 1, 0.45);
      /* inlet velocity profile */
      for (var k = -3; k <= 3; k++) { var v = cen(0.05) + k * 0.05, L = 0.075 * (1 - Math.pow(k / 3.6, 2)); arrow(m, P, [M(0.02, v), M(0.02 + L / 2, v), M(0.02 + L, v)], 1, 0.6, 0.8); }
      /* cross-section ring */
      var cs = M(0.33, cen(0.33));
      m.push({ t: 'e', x: cs[0], y: cs[1], rx: port ? 0.21 : 0.035, ry: port ? 0.035 : 0.21, rot: 0, w: 1, c: inkFor(P), a: 0.45, dash: [4, 4] });
      for (i = 0; i < 150; i++) {
        var u = r() * 1.04 - 0.02, off = (r() + r() - 1) * 0.17, p = M(u, cen(u) + off), c = pick(r, ACC), rad = 0.005 + r() * 0.011;
        if (r() < 0.4) { var tr = []; for (var q = 4; q >= 0; q--) { var uu = u - 0.014 * q; tr.push(M(uu, cen(uu) + off)); } m.push({ t: 's', p: tr, w: rad * 1.6, c: c, a: 0.3, b: 0 }); }
        m.push({ t: 'd', x: p[0], y: p[1], r: rad, c: c, a: 0.96 });
      }
      for (i = 2; i < 14; i++) { var bp = offset([br[i - 1], br[i], br[i + 1]], (r() - 0.5) * 0.09, asp)[1]; m.push({ t: 'd', x: bp[0], y: bp[1], r: 0.005 + r() * 0.007, c: pick(r, ACC), a: 0.95 }); }
      var L1 = M(0.04, 0.16), T1 = M(0.06, cen(0.06) - 0.12);
      label(m, P, 'inlet', L1[0], L1[1], T1[0], T1[1]);
      var L2 = M(0.27, 0.2), T2 = M(0.33, cen(0.33) - 0.21);
      label(m, P, 'cross-section', L2[0], L2[1], T2[0], T2[1]);
      var L3 = M(0.74, 0.86), T3 = M(0.7, cen(0.7) + 0.08);
      label(m, P, 'microspheres', L3[0], L3[1], T3[0], T3[1]);
      var L4 = M(0.5, 0.1), T4 = br[8];
      label(m, P, 'side branch', L4[0], L4[1], T4[0], T4[1]);
      return { bg: P.bg, m: m, soft: 0.2, grain: 0.12 };
    },
    streamlines: function (r, P, asp) {
      /* Bifurcating artery in isotropic world units (x in [0, asp], y in [0, 1]) */
      var m = [], i, k, S = Math.min(asp, 1);
      function N(p) { return [p[0] / asp, p[1]]; }
      function NP(a) { return a.map(N); }
      blobs(m, r, P, 7, 0.4, 0.5);
      var cx = asp * 0.5 + (r() - 0.5) * 0.04 * S, by = 0.53 + (r() - 0.5) * 0.05;
      var r0 = 0.105 * S, r1 = r0 * 0.8, spread = 0.42 * S + (asp - S) * 0.12, top = -0.14;
      var trunk = bez([cx + 0.02 * S, 1.12], [cx - 0.015 * S, 0.82], [cx, by], 16);
      var D1 = bez([cx, by], [cx - 0.05 * S, by - 0.2], [cx - spread, top], 18);
      var D2 = bez([cx, by], [cx + 0.06 * S, by - 0.2], [cx + spread * 0.95, top + 0.02], 18);
      function rad(j) { return j >= 4 ? r1 : r0 + (r1 - r0) * j / 4; }
      /* + offsets to the right of the direction of travel */
      function offW(pts, d) {
        var o = [];
        for (var j = 0; j < pts.length; j++) {
          var a = pts[Math.max(0, j - 1)], b = pts[Math.min(pts.length - 1, j + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, dd = typeof d === 'function' ? d(j) : d;
          o.push([pts[j][0] - dy / l * dd, pts[j][1] + dx / l * dd]);
        }
        return o;
      }
      /* lumen */
      m.push({ t: 's', p: NP(trunk), w: 2.5 * r0 / S, c: pick(r, P.lo), a: 0.4, b: 0 });
      [D1, D2].forEach(function (D) { m.push({ t: 's', p: NP(D), w: 2.5 * r1 / S, c: pick(r, P.lo), a: 0.4, b: 0 }); });
      m.push({ t: 's', p: NP(trunk), w: 2 * r0 / S, c: P.hi[0], a: 0.75, b: 0.4 });
      [D1, D2].forEach(function (D) { m.push({ t: 's', p: NP(D), w: 2 * r1 / S, c: P.hi[0], a: 0.75, b: 0.4 }); });
      /* walls: outer walls run continuously, inner walls meet at the carina */
      var negRad = function (j) { return -rad(j); };
      line(m, P, NP(offW(trunk, -r0).slice(0, -1).concat(offW(D1, negRad).slice(1))), 1.2, 0.6);
      line(m, P, NP(offW(trunk, r0).slice(0, -1).concat(offW(D2, rad).slice(1))), 1.2, 0.6);
      var D1in = offW(D1, rad), D2in = offW(D2, negRad), kc = 1;
      for (k = 1; k < D1.length; k++) { if (Math.hypot(D1[k][0] - D2[k][0], D1[k][1] - D2[k][1]) > 2 * rad(k) + 0.015 * S) { kc = k; break; } }
      var ca = D1in[kc], cb = D2in[kc], gap = Math.hypot(ca[0] - cb[0], ca[1] - cb[1]);
      var ctrl = [(ca[0] + cb[0]) / 2, Math.max(ca[1], cb[1]) + Math.max(0.03 * S, gap * 0.9)];
      var cap = bez(ca, ctrl, cb, 10), apex = cap[5];
      line(m, P, NP(D1in.slice(kc)), 1.2, 0.6); line(m, P, NP(D2in.slice(kc)), 1.2, 0.6); line(m, P, NP(cap), 1.2, 0.6);
      /* streamlines: left half of the inflow goes to branch 1, right half to branch 2 */
      var lines = [], nT = trunk.length;
      [-0.8, -0.6, -0.4, -0.2, 0.2, 0.4, 0.6, 0.8].forEach(function (f, n) {
        var left = f < 0, idx = left ? n : n - 4, d = (-0.72 + 0.48 * idx) * r1;
        var path = offW(trunk, f * r0).slice(0, nT - 3).concat(offW(left ? D1 : D2, d).slice(3, -1));
        lines.push(path);
        m.push({ t: 's', p: NP(path), w: 0.009 + r() * 0.008, c: pick(r, n % 2 ? P.c : ACC), a: 0.5 + r() * 0.25, b: 1 });
        if (n === 1 || n === 6) arrow(m, P, NP(path.slice(-6, -3)), 1, 0.6, 0.8);
      });
      /* dividing streamline ends at the stagnation point on the carina */
      line(m, P, NP(trunk.slice(0, nT - 2).concat([apex])), 1.1, 0.6, { dash: [3, 4] });
      for (i = 0; i < 26; i++) { var L = pick(r, lines), q = L[2 + ((r() * (L.length - 4)) | 0)]; m.push({ t: 'd', x: q[0] / asp, y: q[1], r: 0.008 + r() * 0.01, c: pick(r, ACC), a: 0.96 }); }
      /* parabolic inlet velocity profile */
      var ti = 1; for (k = 1; k < nT; k++) { if (Math.abs(trunk[k][1] - 0.965) < Math.abs(trunk[ti][1] - 0.965)) ti = k; }
      var y0 = 0.975, tx0 = trunk[ti][0], tips = [];
      for (k = -4; k <= 4; k++) { var xk = tx0 + k / 4.6 * r0, Lk = 0.1 * (1 - Math.pow(k / 4.6, 2)); tips.push([xk, y0 - Lk]); arrow(m, P, NP([[xk, y0], [xk, y0 - Lk / 2], [xk, y0 - Lk]]), 0.9, 0.55, 0.7); }
      line(m, P, NP(tips), 0.9, 0.5);
      /* cross-section of the parent artery */
      var cj = 10, tj = trunk[cj], ang = Math.atan2(trunk[cj + 1][1] - trunk[cj - 1][1], trunk[cj + 1][0] - trunk[cj - 1][0]);
      m.push({ t: 'e', x: tj[0] / asp, y: tj[1], rx: 0.28 * r0 / S, ry: r0 / S, rot: ang, w: 1, c: inkFor(P), a: 0.55, dash: [4, 4] });
      var e1 = D1[D1.length - 1], e2 = D2[D2.length - 1];
      label(m, P, 'inlet', (tx0 + r0 + 0.06 * S) / asp, 0.885, tips[6][0] / asp, tips[6][1], 'left');
      label(m, P, 'cross-section', (tj[0] - r0 - 0.06 * S) / asp, tj[1] - 0.05, (tj[0] - r0) / asp, tj[1], 'right');
      label(m, P, 'flow split', (apex[0] + 0.16 * S) / asp, apex[1] + 0.11, apex[0] / asp, apex[1], 'left');
      var o1 = D1[14], o2 = D2[11];
      label(m, P, 'outlet 1', (o1[0] + r1 + 0.025 * S) / asp, o1[1], null, null, 'left');
      label(m, P, 'outlet 2', (o2[0] - r1 - 0.025 * S) / asp, o2[1], null, null, 'right');
      return { bg: P.bg, m: m, soft: 0.22, grain: 0.11 };
    },
    operator: function (r, P, asp) {
      /* Each row: input surface mesh -> neural operator -> predicted flow field */
      var m = [], i, j, S = Math.min(asp, 1);
      function N(p) { return [p[0] / asp, p[1]]; }
      function NP(a) { return a.map(N); }
      blobs(m, r, P, 6, 0.4, 0.5);
      var rows = asp < 0.85 ? 4 : 3, rh = 0.84 / rows, y0 = 0.12, tw = asp * 0.36, lx = asp * 0.04, rx = asp * 0.6;
      function vessel(ox, oy, seedv) {
        var rr = rng(seedv), a = oy + rh * (0.3 + rr() * 0.4), b = oy + rh * (0.3 + rr() * 0.4), c = oy + rh * (0.15 + rr() * 0.7);
        return bez([ox + tw * 0.04, a], [ox + tw * 0.5, c], [ox + tw * 0.96, b], 14);
      }
      function offW(pts, d) { var o = []; for (var k = 0; k < pts.length; k++) { var p0 = pts[Math.max(0, k - 1)], p1 = pts[Math.min(pts.length - 1, k + 1)], dx = p1[0] - p0[0], dy = p1[1] - p0[1], l = Math.hypot(dx, dy) || 1; o.push([pts[k][0] - dy / l * d, pts[k][1] + dx / l * d]); } return o; }
      var vr = Math.min(rh * 0.16, 0.05 * S);
      for (j = 0; j < rows; j++) {
        var oy = y0 + j * rh, sd = (r() * 1e6) | 0, inp = vessel(lx, oy, sd), out = vessel(rx, oy, sd);
        /* input: surface mesh only, sampled nodes on the walls */
        var w1 = offW(inp, vr), w2 = offW(inp, -vr);
        line(m, P, NP(w1), 1, 0.6); line(m, P, NP(w2), 1, 0.6);
        for (i = 0; i < inp.length; i += 2) { [w1[i], w2[i]].forEach(function (q) { m.push({ t: 'd', x: q[0] / asp, y: q[1], r: 0.005, c: inkFor(P), a: 0.75, flat: 1 }); }); }
        /* output: velocity field, slow near the walls and fast at the centreline */
        var core = out.slice(1, -1);
        m.push({ t: 's', p: NP(core), w: 2.2 * vr / S, c: pick(r, P.c), a: 0.85, b: 0.3 });
        m.push({ t: 's', p: NP(core), w: 1.4 * vr / S, c: ACC[1], a: 0.85, b: 0.5 });
        m.push({ t: 's', p: NP(core), w: 0.6 * vr / S, c: ACC[2], a: 0.9, b: 0.8 });
        var ow1 = offW(out, vr), ow2 = offW(out, -vr);
        line(m, P, NP(ow1), 1, 0.6); line(m, P, NP(ow2), 1, 0.6);
        line(m, P, NP([ow1[0], [(ow1[0][0] + ow2[0][0]) / 2, (ow1[0][1] + ow2[0][1]) / 2], ow2[0]]), 0.8, 0.45, { dash: [2, 3] });
        line(m, P, NP([ow1[ow1.length - 1], [(ow1[ow1.length - 1][0] + ow2[ow2.length - 1][0]) / 2, (ow1[ow1.length - 1][1] + ow2[ow2.length - 1][1]) / 2], ow2[ow2.length - 1]]), 0.8, 0.45, { dash: [2, 3] });
        arrow(m, P, NP(out.slice(-5, -2)), 0.9, 0.6, 0.7);
        var ay = oy + rh * 0.5;
        arrow(m, P, NP([[lx + tw + 0.03 * asp, ay], [asp * 0.5, ay], [rx - 0.03 * asp, ay]]), 1.1, 0.65);
      }
      label(m, P, 'surface mesh', (lx + tw * 0.5) / asp, 0.06, null, null, 'center');
      label(m, P, 'neural operator', 0.5, y0 + rh * 0.5 - 0.045, null, null, 'center');
      label(m, P, 'predicted flow', (rx + tw * 0.5) / asp, 0.06, null, null, 'center');
      return { bg: P.bg, m: m, soft: 0.24, grain: 0.11 };
    },
    dose: function (r, P, asp, cv) {
      /* Y-90 radioembolization (or, with data-variant="drug", drug delivery): feeding artery, microspheres lodged at arteriole tips, isodose contours from the sphere distribution */
      var m = [], i, k, S = Math.min(asp, 1), drug = !!(cv && cv.getAttribute('data-variant') === 'drug');
      function N(p) { return [p[0] / asp, p[1]]; }
      function NP(a) { return a.map(N); }
      blobs(m, r, P, 7, 0.4, 0.5);
      for (i = 0; i < 14; i++) m.push({ t: 's', p: wave(-0.1, 1.1, r() * 1.1 - 0.05, 0.02 + r() * 0.05, 0.8 + r(), r() * 6, (r() - 0.5) * 0.4, r, 0.01), w: 0.05 + r() * 0.1, c: pick(r, P.c), a: 0.2 + r() * 0.25, b: 0.6 });
      var C = [asp * (0.58 + (r() - 0.5) * 0.06), 0.45 + (r() - 0.5) * 0.06], Rt = 0.21 * S, ph1 = r() * 6.28, ph2 = r() * 6.28;
      function trad(th) { return Rt * (1 + 0.14 * Math.sin(3 * th + ph1) + 0.06 * Math.sin(5 * th + ph2)); }
      var outline = [];
      for (i = 0; i <= 72; i++) { var th = i / 72 * 6.2832; outline.push([C[0] + Math.cos(th) * trad(th), C[1] + Math.sin(th) * trad(th)]); }
      m.push({ t: 'g', p: NP(outline), c: HOT[1], a: 0.35 });
      /* feeding artery entering from the lower left and branching inside the tumor */
      var E = [-0.02, 0.9], J = [C[0] - Rt * 0.95, C[1] + Rt * 0.45];
      var main = bez(E, [asp * 0.2, 0.92], J, 18), vr = 0.022 * S;
      m.push({ t: 's', p: NP(main), w: 2.4 * vr / S, c: P.lo[0], a: 0.55, b: 0.5 });
      m.push({ t: 's', p: NP(main), w: 1.4 * vr / S, c: P.hi[0], a: 0.7, b: 0 });
      line(m, P, NP(offset(main.map(N), vr / S, asp).map(function (q) { return [q[0] * asp, q[1]]; })), 1.1, 0.6);
      line(m, P, NP(offset(main.map(N), -vr / S, asp).map(function (q) { return [q[0] * asp, q[1]]; })), 1.1, 0.6);
      var tips = [], normalTip = null, base = Math.atan2(C[1] - J[1], C[0] - J[0]);
      [-0.55, 0, 0.55].forEach(function (da) {
        var a1 = base + da + (r() - 0.5) * 0.2, L1 = Rt * (0.55 + r() * 0.25), M1 = [J[0] + Math.cos(a1) * L1, J[1] + Math.sin(a1) * L1];
        var c1 = [(J[0] + M1[0]) / 2 - Math.sin(a1) * L1 * 0.18 * (r() < 0.5 ? -1 : 1), (J[1] + M1[1]) / 2 + Math.cos(a1) * L1 * 0.18], seg1 = bez(J, c1, M1, 10);
        m.push({ t: 's', p: NP(seg1), w: 1.3 * vr / S, c: P.lo[0], a: 0.45, b: 0.5 });
        line(m, P, NP(seg1), 1.1, 0.65);
        [-0.45, 0.45].forEach(function (db) {
          var a2 = a1 + db + (r() - 0.5) * 0.2, L2 = Rt * (0.35 + r() * 0.3), T = [M1[0] + Math.cos(a2) * L2, M1[1] + Math.sin(a2) * L2];
          var c2 = [(M1[0] + T[0]) / 2 - Math.sin(a2) * L2 * 0.2 * (db < 0 ? 1 : -1), (M1[1] + T[1]) / 2 + Math.cos(a2) * L2 * 0.2 * (db < 0 ? 1 : -1)];
          line(m, P, NP(bez(M1, c2, T, 8)), 0.8, 0.55);
          tips.push(T);
        });
      });
      /* one branch continues to normal liver: a few non-target spheres */
      var nb = base + 1.5, NT = [J[0] + Math.cos(nb) * Rt * 0.9, J[1] + Math.sin(nb) * Rt * 0.9];
      line(m, P, NP([J, [(J[0] + NT[0]) / 2, (J[1] + NT[1]) / 2], NT]), 0.8, 0.5);
      normalTip = NT;
      var spheres = [];
      tips.forEach(function (T) { var n = 7 + ((r() * 5) | 0); for (var q = 0; q < n; q++) { var a = r() * 6.28, d = Math.sqrt(r()) * 0.025 * S; spheres.push([T[0] + Math.cos(a) * d, T[1] + Math.sin(a) * d]); } });
      for (i = 0; i < 3; i++) { var a3 = r() * 6.28, d3 = Math.sqrt(r()) * 0.02 * S; spheres.push([normalTip[0] + Math.cos(a3) * d3, normalTip[1] + Math.sin(a3) * d3]); }
      /* dose field: sum of short-range kernels around each sphere */
      var G = 56, xs = [], ys = [], F = [], fmax = 0, lam = 0.03 * S;
      for (i = 0; i < G; i++) { xs.push(i / (G - 1) * asp); ys.push(i / (G - 1)); }
      for (var gy = 0; gy < G; gy++) { var row = []; for (var gx = 0; gx < G; gx++) { var s = 0; for (k = 0; k < spheres.length; k++) { var dd = Math.hypot(xs[gx] - spheres[k][0], ys[gy] - spheres[k][1]); s += Math.exp(-dd / lam); } row.push(s); if (s > fmax) fmax = s; } F.push(row); }
      tips.forEach(function (T) { m.push({ t: 'b', x: T[0] / asp, y: T[1], r: 0.1, c: HOT[1], a: 0.35 }); m.push({ t: 'b', x: T[0] / asp, y: T[1], r: 0.05, c: HOT[0], a: 0.55 }); });
      var mid = null;
      [[0.12, 0.35], [0.3, 0.5], [0.6, 0.65]].forEach(function (lv) {
        var segs = contour(F, G, xs, ys, lv[0] * fmax);
        m.push({ t: 'k', s: segs.map(function (sg) { return [N(sg[0]), N(sg[1])]; }), w: 1, c: inkFor(P), a: lv[1] });
        if (lv[0] === 0.12 && segs.length) { mid = segs[0][0]; segs.forEach(function (sg) { if (sg[0][0] > mid[0]) mid = sg[0]; }); }
      });
      line(m, P, NP(outline), 1.4, 0.75);
      if (!drug) spheres.forEach(function (q) { m.push({ t: 'd', x: q[0] / asp, y: q[1], r: 0.006 + r() * 0.004, c: pick(r, [HOT[3], HOT[4]]), a: 0.95 }); });
      else tips.concat([normalTip]).forEach(function (T) { m.push({ t: 'e', x: T[0] / asp, y: T[1], rx: 0.012, ry: 0.012, rot: 0, w: 1, c: inkFor(P), a: 0.7, dash: [2, 2] }); });
      var to = [C[0] + Math.cos(-0.9) * trad(-0.9), C[1] + Math.sin(-0.9) * trad(-0.9)];
      label(m, P, 'tumor', 0.95, 0.07, to[0] / asp, to[1], 'right');
      label(m, P, 'feeding artery', 0.04, 0.8, main[6][0] / asp, main[6][1], 'left');
      label(m, P, drug ? 'leaky vessels' : 'microspheres', 0.04, 0.08, tips[0][0] / asp, tips[0][1], 'left');
      if (mid) label(m, P, drug ? 'concentration contours' : 'isodose lines', 0.95, Math.min(0.94, mid[1] + 0.25), mid[0] / asp, mid[1], 'right');
      return { bg: P.bg, m: m, soft: 0.22, grain: 0.11 };
    },
    tree: function (r, P, asp) {
      var m = [], segs = [], leaves = []; blobs(m, r, P, 6, 0.4, 0.5);
      function br(x, y, ang, len, w, d) {
        var e = polar(x, y, ang, len, asp), mid = polar((x + e[0]) / 2, (y + e[1]) / 2, r() * 6.28, len * 0.12, asp), p = bez([x, y], mid, e, 8);
        m.push({ t: 's', p: p, w: w, c: pick(r, d < 2 ? P.lo : P.c.concat(P.lo)), a: 0.78, b: 1 });
        if (d < 3) segs.push({ p: p, w: w });
        if (d >= 6 || len < 0.035) {
          m.push({ t: 'b', x: e[0], y: e[1], r: 0.06 + r() * 0.05, c: pick(r, ACC), a: 0.42 });
          if (r() < 0.6) { m.push({ t: 'd', x: e[0], y: e[1], r: 0.007 + r() * 0.008, c: pick(r, ACC), a: 0.95 }); leaves.push(e); }
          return;
        }
        var s = 0.3 + r() * 0.26;
        br(e[0], e[1], ang - s, len * (0.68 + r() * 0.12), w * 0.72, d + 1);
        br(e[0], e[1], ang + s * (0.8 + r() * 0.4), len * (0.68 + r() * 0.12), w * 0.72, d + 1);
      }
      br(0.5, 1.06, -Math.PI / 2 + (r() - 0.5) * 0.15, 0.34, 0.07, 0);
      segs.forEach(function (sg) {
        line(m, P, offset(sg.p, sg.w * 0.62, asp), 0.7, 0.35); line(m, P, offset(sg.p, -sg.w * 0.62, asp), 0.7, 0.35);
        var side = offset(sg.p, sg.w * 1.05 + 0.016, asp); arrow(m, P, side.slice(2, 6), 1, 0.6, 0.8);
      });
      label(m, P, 'arterial tree', 0.62, 0.9, segs[0].p[4][0] + 0.03, segs[0].p[4][1]);
      var mid = leaves.filter(function (q) { return q[0] > 0.25 && q[0] < 0.75 && q[1] > 0.12; });
      if (mid.length) { var lf = mid[0]; label(m, P, 'microspheres', lf[0] < 0.5 ? 0.05 : 0.95, 0.05, lf[0], lf[1], lf[0] < 0.5 ? 'left' : 'right'); }
      return { bg: P.bg, m: m, soft: 0.22, grain: 0.11 };
    },
    waves: function (r, P, asp) {
      /* PINN for the 1D viscous-free Burgers equation, u0 = -sin(pi x), x in [-1, 1], t in [0, 1]:
         space-time domain, initial and boundary points, interior collocation points,
         characteristics converging into a shock at x = 0 */
      var m = [], i, k;
      blobs(m, r, P, 6, 0.4, 0.5);
      var X0 = 0.15, X1 = 0.91, YB = 0.8, YT = 0.14;
      function px2(x, t) { return [X0 + (x + 1) / 2 * (X1 - X0), YB - t * (YB - YT)]; }
      function mixc(a, b, t) { return [a[0] + (b[0] - a[0]) * t | 0, a[1] + (b[1] - a[1]) * t | 0, a[2] + (b[2] - a[2]) * t | 0]; }
      function uAt(x, t) {
        /* entropy solution through characteristics x = xi - sin(pi xi) t; shock stays at x = 0 */
        if (Math.abs(x) < 1e-6) return 0;
        var sgn = x < 0 ? -1 : 1, prev = null, steps = 160;
        for (var s = 0; s <= steps; s++) {
          var xi = sgn * (1 - s / steps), g = xi - Math.sin(Math.PI * xi) * t - x;
          if (prev !== null && (g === 0 || (g > 0) !== (prev > 0))) return -Math.sin(Math.PI * xi);
          prev = g;
        }
        return 0;
      }
      var cZero = P.c[0], cPos = ACC[2], cNeg = P.hi[0], NX = 22, NT = 14;
      for (var a = 0; a < NX; a++) for (var b = 0; b < NT; b++) {
        var x = -1 + (a + 0.5) / NX * 2, t = (b + 0.5) / NT, u = uAt(x, t), q = px2(x, t);
        m.push({ t: 'b', x: q[0], y: q[1], r: 0.075, c: u >= 0 ? mixc(cZero, cPos, Math.min(1, u)) : mixc(cZero, cNeg, Math.min(1, -u)), a: 0.55 });
      }
      /* characteristics */
      for (k = -6; k <= 6; k++) {
        var xi = k / 6.6, pts = [], tEnd = 1;
        if (k !== 0) { var th = xi / Math.sin(Math.PI * xi); if (th < 1) tEnd = th; }
        for (i = 0; i <= 12; i++) { var tt = tEnd * i / 12; pts.push(px2(xi - Math.sin(Math.PI * xi) * tt, tt)); }
        if (k !== 0) line(m, P, pts, 0.8, 0.35);
      }
      var tShock = 1 / Math.PI;
      line(m, P, [px2(0, tShock), px2(0, (tShock + 1) / 2), px2(0, 1)], 1.8, 0.75);
      /* domain, axes */
      line(m, P, [[X0, YB], [X0, YT], [X1, YT], [X1, YB], [X0, YB]], 1.1, 0.7, { wob: 0.3, poly: 1 });
      arrow(m, P, [[X0, 0.88], [(X0 + X1) / 2, 0.88], [X1 + 0.03, 0.88]], 1, 0.6, 0.8);
      arrow(m, P, [[0.08, YB], [0.08, (YB + YT) / 2], [0.08, YT - 0.04]], 1, 0.6, 0.8);
      label(m, P, 'x', X1 + 0.05, 0.88, null, null, 'left');
      label(m, P, 't', 0.08, YT - 0.075, null, null, 'center');
      /* training points: initial condition (rings), boundary (filled), collocation (small) */
      for (i = 0; i < 13; i++) { var qi = px2(-1 + i / 12 * 2, 0); m.push({ t: 'e', x: qi[0], y: qi[1], rx: 0.01, ry: 0.01, rot: 0, w: 1.1, c: inkFor(P), a: 0.8 }); }
      for (i = 1; i < 8; i++) { [-1, 1].forEach(function (xb) { var qb = px2(xb, i / 7); m.push({ t: 'd', x: qb[0], y: qb[1], r: 0.008, c: inkFor(P), a: 0.85, flat: 1 }); }); }
      collocation(m, r, P, 60, X0 + 0.02, YT + 0.02, X1 - 0.02, YB - 0.02);
      var ic = px2(0.5, 0), bc = px2(1, 0.71), sh = px2(0, 0.62), cp = px2(-0.55, 0.78);
      label(m, P, 'initial condition', 0.5, 0.95, ic[0], ic[1], 'center');
      label(m, P, 'boundary', 0.97, 0.06, bc[0], bc[1], 'right');
      label(m, P, 'shock', sh[0] + 0.1, sh[1] + 0.05, sh[0], sh[1], 'left');
      label(m, P, 'collocation points', 0.18, 0.06, cp[0], cp[1], 'left');
      return { bg: P.bg, m: m, soft: 0.22, grain: 0.11 };
    },
    wake: function (r, P, asp) {
      var m = [], i; blobs(m, r, P, 6, 0.4, 0.5);
      for (i = 0; i < 14; i++) m.push({ t: 's', p: wave(-0.1, 1.1, r(), 0.01 + r() * 0.02, 0.8, r() * 6, 0, r, 0.004), w: 0.03 + r() * 0.05, c: pick(r, P.c), a: 0.25 + r() * 0.25, b: 0.6 });
      var cy = 0.5, S = Math.min(asp, 1);
      m.push({ t: 'b', x: 0.15, y: cy, r: 0.18, c: P.lo[0], a: 0.45 });
      m.push({ t: 'd', x: 0.15, y: cy, r: 0.075, c: P.lo[1], a: 1 });
      m.push({ t: 'e', x: 0.15, y: cy, rx: 0.085, ry: 0.085, rot: 0, w: 1.2, c: inkFor(P), a: 0.6 });
      /* upstream streamlines bending around the cylinder */
      [-5, -4, -2, -1, 1, 2, 4, 5].forEach(function (k) {
        var pts = [], far = Math.abs(k) >= 4, xEnd = far ? 1.04 : 0.24;
        for (var x = -0.02; x <= xEnd + 1e-9; x += 0.02) { var g = Math.exp(-Math.pow((x - 0.15) / 0.08, 2)); pts.push([x, cy + k * 0.055 + (k > 0 ? 1 : -1) * 0.09 * g / Math.abs(k) * S]); }
        if (far) line(m, P, pts, 0.9, 0.4); else arrow(m, P, pts, 0.9, 0.45, 0.6);
      });
      arrow(m, P, [[0.02, 0.12], [0.06, 0.12], [0.11, 0.12]], 1.1, 0.7);
      for (i = 0; i < 6; i++) {
        var vx = 0.3 + i * 0.135, vy = cy + (i % 2 ? 0.1 : -0.1) * (1 + i * 0.05), dir = i % 2 ? -1 : 1, sp = [], col = pick(r, i % 2 ? ACC : P.hi);
        for (var t = 0; t <= 1.0001; t += 0.04) sp.push(polar(vx, vy, dir * t * 9.5, (0.01 + t * 0.055) * (1 + i * 0.06), asp));
        m.push({ t: 'b', x: vx, y: vy, r: 0.13, c: col, a: 0.25 });
        m.push({ t: 's', p: sp, w: 0.022, c: col, a: 0.7, b: 1 });
        if (i < 4) { var tip = sp.slice(-4); arrow(m, P, tip, 0.9, 0.5, 0.7); }
      }
      label(m, P, 'cylinder', 0.05, 0.86, 0.15, cy + 0.06);
      label(m, P, 'vortex street', 0.95, 0.1, 0.57, cy - 0.12, 'right');
      label(m, P, 'flow', 0.13, 0.12);
      return { bg: P.bg, m: m, soft: 0.22, grain: 0.11 };
    },
    network: function (r, P, asp) {
      var m = [], i, j; blobs(m, r, P, 7, 0.4, 0.5);
      for (i = 0; i < 6; i++) m.push({ t: 's', p: wave(-0.1, 1.1, r(), 0.04, 0.6, r() * 6, -0.3, r, 0.01), w: 0.06 + r() * 0.08, c: pick(r, P.c), a: 0.3, b: 0.7 });
      var L = asp > 1.1 ? 5 : 4, layers = [];
      for (i = 0; i < L; i++) { var n = (i === 0 || i === L - 1) ? 2 + ((r() * 2) | 0) : 3 + ((r() * 3) | 0), col = []; for (j = 0; j < n; j++) col.push([0.13 + i * (0.74 / (L - 1)), 0.48 + (j - (n - 1) / 2) * (0.66 / Math.max(n, 3))]); layers.push(col); }
      for (i = 0; i < L - 1; i++) layers[i].forEach(function (a) { layers[i + 1].forEach(function (b) { m.push({ t: 'l', p: bez(a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + (r() - 0.5) * 0.04], b, 8), w: 1, c: P.lo[0], a: 0.2 + r() * 0.2 }); }); });
      layers.forEach(function (col) { col.forEach(function (p) { var c = pick(r, ACC.concat(P.lo)); m.push({ t: 'b', x: p[0], y: p[1], r: 0.12, c: c, a: 0.32 }); m.push({ t: 'd', x: p[0], y: p[1], r: 0.026, c: c, a: 1 }); m.push({ t: 'e', x: p[0], y: p[1], rx: 0.038, ry: 0.038, rot: 0, w: 0.9, c: inkFor(P), a: 0.45 }); }); });
      /* layer brackets and labels */
      layers.forEach(function (col, k) {
        var x = col[0][0], top = col[0][1] - 0.07, bot = col[col.length - 1][1] + 0.07;
        line(m, P, [[x - 0.04, top], [x - 0.05, (top + bot) / 2], [x - 0.04, bot]], 0.8, 0.3, { dash: [2, 4] });
        if (k === 0) label(m, P, 'input', x, 0.93, null, null, 'center');
        else if (k === L - 1) label(m, P, 'output', x, 0.93, null, null, 'center');
        else if (k === 1) label(m, P, 'hidden layers', (x + layers[L - 2][0][0]) / 2, 0.93, null, null, 'center');
      });
      arrow(m, P, [[0.36, 0.09], [0.5, 0.09], [0.64, 0.09]], 1, 0.55);
      label(m, P, 'forward pass', 0.5, 0.045, null, null, 'center');
      return { bg: P.bg, m: m, soft: 0.22, grain: 0.1 };
    },
    actuator: function (r, P, asp) {
      var m = [], i; blobs(m, r, P, 6, 0.4, 0.5);
      for (i = 0; i < 8; i++) m.push({ t: 's', p: wave(-0.1, 1.1, r(), 0.03, 0.7, r() * 6, 0.2, r, 0.01), w: 0.05 + r() * 0.07, c: pick(r, P.c), a: 0.28, b: 0.6 });
      var ghost = bez([0.12, 0.55], [0.5, 0.6], [0.9, 0.8], 18), main = bez([0.12, 0.55], [0.5, 0.52], [0.88, 0.24], 18);
      [[ghost, 0.22, 0], [main, 0.88, 1]].forEach(function (g) {
        m.push({ t: 's', p: offset(g[0], -0.045, asp), w: 0.042, c: P.lo[0], a: g[1], b: g[2] });
        m.push({ t: 's', p: g[0], w: 0.05, c: BONE, a: g[1], b: g[2] * 0.6 });
        m.push({ t: 's', p: offset(g[0], 0.045, asp), w: 0.042, c: P.lo[1], a: g[1], b: g[2] });
      });
      line(m, P, offset(main, -0.07, asp), 0.9, 0.5); line(m, P, offset(main, 0.07, asp), 0.9, 0.5);
      line(m, P, offset(ghost, -0.07, asp), 0.8, 0.28, { dash: [3, 5] }); line(m, P, offset(ghost, 0.07, asp), 0.8, 0.28, { dash: [3, 5] });
      m.push({ t: 's', p: [[0.09, 0.42], [0.095, 0.55], [0.1, 0.68]], w: 0.08, c: P.lo[1], a: 0.7, b: 0.8 });
      /* electrode leads */
      line(m, P, [[0.095, 0.44], [0.05, 0.36], [0.02, 0.3]], 1.1, 0.6); line(m, P, [[0.1, 0.66], [0.05, 0.74], [0.02, 0.8]], 1.1, 0.6);
      label(m, P, '+', 0.035, 0.26); label(m, P, '−', 0.035, 0.85);
      /* bending motion */
      arrow(m, P, bez([0.93, 0.74], [1.0, 0.5], [0.93, 0.3], 14), 1.1, 0.65);
      for (i = 0; i < 40; i++) { var j = 1 + ((r() * (main.length - 2)) | 0), q = offset([main[j - 1], main[j], main[j + 1]], (r() - 0.5) * 0.11, asp)[1]; m.push({ t: 'd', x: q[0], y: q[1], r: 0.005 + r() * 0.006, c: pick(r, ACC), a: 0.92 }); }
      label(m, P, 'voltage', 0.07, 0.94);
      label(m, P, 'bending', 0.9, 0.1, 0.96, 0.4, 'right');
      label(m, P, 'ions', 0.36, 0.2, main[7][0], main[7][1] - 0.03);
      return { bg: P.bg, m: m, soft: 0.22, grain: 0.11 };
    },
    acoustic: function (r, P, asp) {
      /* Standing surface acoustic wave separation, top view:
         two opposing interdigital transducers (IDTs) launch waves across a microchannel;
         the standing wave has pressure nodes parallel to the flow, and particles migrate to them,
         larger particles faster than smaller ones */
      var m = [], i, k;
      blobs(m, r, P, 6, 0.4, 0.5);
      var CT = 0.37, CB = 0.63, nodes = [0.44, 0.56];
      /* pressure field across the channel, light at the nodes */
      for (i = 0; i < 9; i++) { var yy = CT + (CB - CT) * i / 8, near = Math.min(Math.abs(yy - nodes[0]), Math.abs(yy - nodes[1])); m.push({ t: 's', p: [[-0.05, yy], [0.5, yy], [1.05, yy]], w: 0.05, c: near < 0.03 ? P.hi[0] : pick(r, P.c), a: 0.45, b: 0.5 }); }
      /* channel walls */
      line(m, P, [[0.02, CT], [0.5, CT], [0.98, CT]], 1.3, 0.7); line(m, P, [[0.02, CB], [0.5, CB], [0.98, CB]], 1.3, 0.7);
      /* IDTs: two bus bars with interleaved fingers parallel to the channel */
      [[0.07, 0.27], [0.73, 0.93]].forEach(function (yr) {
        var y0 = yr[0], y1 = yr[1], xl = 0.22, xr = 0.78, n = 9;
        line(m, P, [[xl, y0], [xl, (y0 + y1) / 2], [xl, y1]], 1.4, 0.7); line(m, P, [[xr, y0], [xr, (y0 + y1) / 2], [xr, y1]], 1.4, 0.7);
        for (k = 0; k < n; k++) { var fy = y0 + 0.01 + (y1 - y0 - 0.02) * k / (n - 1); if (k % 2) line(m, P, [[xr, fy], [(xl + xr) / 2, fy], [xl + 0.05, fy]], 1, 0.6); else line(m, P, [[xl, fy], [(xl + xr) / 2, fy], [xr - 0.05, fy]], 1, 0.6); }
      });
      /* pressure node lines */
      nodes.forEach(function (ny) { line(m, P, [[0.3, ny], [0.64, ny], [0.98, ny]], 0.9, 0.5, { dash: [3, 5] }); });
      /* particle paths: random entry, then migration to the nearest node; large particles focus faster */
      for (i = 0; i < 16; i++) {
        var big = i % 2 === 0, yin = CT + 0.02 + r() * (CB - CT - 0.04), nd = Math.abs(yin - nodes[0]) < Math.abs(yin - nodes[1]) ? nodes[0] : nodes[1], kk = big ? 9 : 2.6, path = [];
        for (var x = 0.02; x <= 0.98; x += 0.04) { var y = x < 0.3 ? yin : nd + (yin - nd) * Math.exp(-kk * (x - 0.3)); path.push([x, y]); }
        if (i < 6) line(m, P, path, 0.6, 0.25);
        for (k = 0; k < 3; k++) { var q = path[(r() * path.length) | 0]; m.push({ t: 'd', x: q[0], y: q[1], r: big ? 0.011 : 0.0055, c: big ? ACC[2] : ACC[0], a: 0.95 }); }
      }
      arrow(m, P, [[0.04, 0.5], [0.09, 0.5], [0.15, 0.5]], 1.2, 0.75);
      label(m, P, 'flow', 0.04, 0.47, null, null, 'left');
      label(m, P, 'IDT', 0.96, 0.17, 0.78, 0.17, 'right');
      label(m, P, 'pressure node', 0.96, 0.69, 0.92, nodes[1], 'right');
      label(m, P, 'larger particles reach the nodes first', 0.04, 0.975, null, null, 'left');
      return { bg: P.bg, m: m, soft: 0.22, grain: 0.11 };
    },
    rays: function (r, P) {
      var m = [], i; blobs(m, r, P, 6, 0.4, 0.5);
      var sx = 0.14, sy = 0.18;
      m.push({ t: 'b', x: sx, y: sy, r: 0.55, c: hx('#F4E3EE'), a: 0.5 });
      m.push({ t: 'b', x: sx, y: sy, r: 0.2, c: hx('#FFF6EE'), a: 0.85 });
      for (i = 0; i < 26; i++) { var a = -0.15 + r() * 1.5, ex = sx + Math.cos(a) * 1.4, ey = sy + Math.sin(a) * 1.4; m.push({ t: 's', p: [[sx, sy], [(sx + ex) / 2, (sy + ey) / 2], [ex, ey]], w: 0.004 + r() * 0.018, c: pick(r, P.hi), a: 0.25 + r() * 0.4, b: 1.2 }); }
      m.push({ t: 's', p: [[0.86, -0.1], [0.87, 0.5], [0.86, 1.1]], w: 0.06, c: P.lo[0], a: 0.45, b: 0.8 });
      /* lamp housing, traced rays with arrowheads, target hatching */
      m.push({ t: 'e', x: sx, y: sy, rx: 0.05, ry: 0.05, rot: 0, w: 1.2, c: inkFor(P), a: 0.65 });
      for (i = 0; i < 6; i++) { var aa = 0.05 + i * 0.22, L = 0.42 + r() * 0.2, p0 = [sx + Math.cos(aa) * 0.07, sy + Math.sin(aa) * 0.07], p1 = [sx + Math.cos(aa) * L, sy + Math.sin(aa) * L]; arrow(m, P, [p0, [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2], p1], 0.9, 0.55, 0.8); }
      for (i = 0; i < 16; i++) { var y = 0.06 + i * 0.058; line(m, P, [[0.835, y + 0.03], [0.86, y + 0.015], [0.885, y]], 0.8, 0.4); }
      label(m, P, 'UV-C lamp', 0.24, 0.07, sx + 0.04, sy - 0.03);
      label(m, P, 'irradiated water', 0.8, 0.94, 0.86, 0.8, 'right');
      return { bg: P.bg, m: m, soft: 0.22, grain: 0.11 };
    },
    icon: function (r, P, asp, cv) {
      var m = [], i, mo = cv.getAttribute('data-motif') || 'stream';
      for (i = 0; i < 4; i++) m.push({ t: 'b', x: 0.5 + (r() - 0.5) * 0.28, y: 0.5 + (r() - 0.5) * 0.28, r: 0.3 + r() * 0.16, c: pick(r, P.c.concat(P.hi)), a: 0.8 });
      if (mo === 'stream') { for (i = 0; i < 3; i++) m.push({ t: 'l', p: wave(0.2, 0.8, 0.36 + i * 0.14, 0.05, 1, i * 0.6, 0, r, 0), w: 1.4, c: INK, a: 0.85 }); }
      else if (mo === 'grid') { for (i = 0; i < 3; i++) for (var j = 0; j < 3; j++) m.push({ t: 'd', x: 0.31 + i * 0.19, y: 0.31 + j * 0.19, r: 0.04, c: INK, a: 0.9 }); }
      else if (mo === 'dose') { [0.13, 0.22, 0.31].forEach(function (q) { m.push({ t: 'e', x: 0.5, y: 0.5, rx: q, ry: q, rot: 0, w: 1.3, c: INK, a: 0.8 }); }); m.push({ t: 'd', x: 0.5, y: 0.5, r: 0.045, c: INK, a: 1 }); }
      else if (mo === 'tree') { [[[0.5, 0.82], [0.5, 0.56]], [[0.5, 0.56], [0.33, 0.3]], [[0.5, 0.56], [0.67, 0.3]], [[0.41, 0.43], [0.27, 0.42]], [[0.59, 0.43], [0.73, 0.42]]].forEach(function (s) { m.push({ t: 'l', p: [s[0], [(s[0][0] + s[1][0]) / 2, (s[0][1] + s[1][1]) / 2], s[1]], w: 1.4, c: INK, a: 0.85 }); }); }
      return { bg: null, m: m, soft: 0.5, grain: 0 };
    }
  };

  function trace(c, P) {
    c.beginPath(); c.moveTo(P[0][0], P[0][1]);
    for (var i = 1; i < P.length - 1; i++) c.quadraticCurveTo(P[i][0], P[i][1], (P[i][0] + P[i + 1][0]) / 2, (P[i][1] + P[i + 1][1]) / 2);
    var L = P[P.length - 1]; c.lineTo(L[0], L[1]);
  }
  function px(pts, W, H) { return pts.map(function (p) { return [p[0] * W, p[1] * H]; }); }
  function wobble(P, amt, r) { if (!amt) return P; return P.map(function (p) { return [p[0] + (r() - 0.5) * amt, p[1] + (r() - 0.5) * amt]; }); }
  function blob(c, x, y, R, col, a) { if (R <= 0) return; var g = c.createRadialGradient(x, y, 0, x, y, R); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0)); c.fillStyle = g; c.fillRect(x - R, y - R, 2 * R, 2 * R); }
  function basePass(c, m, W, H) {
    var S = Math.min(W, H);
    if (m.t === 'b') blob(c, m.x * W, m.y * H, m.r * S, m.c, m.a);
    else if (m.t === 's') { c.globalAlpha = m.a; c.strokeStyle = rgba(m.c, 1); c.lineWidth = Math.max(1, m.w * S); c.lineCap = 'round'; c.lineJoin = 'round'; trace(c, px(m.p, W, H)); c.stroke(); c.globalAlpha = 1; }
    else if (m.t === 'd' && !m.flat) blob(c, m.x * W, m.y * H, m.r * S * 2.6, m.c, m.a * 0.35);
    else if (m.t === 'g') { c.globalAlpha = m.a; c.fillStyle = rgba(m.c, 1); trace(c, px(m.p, W, H)); c.closePath(); c.fill(); c.globalAlpha = 1; }
  }
  function detailPass(c, m, W, H, d, r, small) {
    var S = Math.min(W, H), asp = W / H, i;
    c.setLineDash([]);
    if (m.t === 's' && m.b) {
      var n = Math.max(3, Math.min(14, Math.round(m.w * S / (3 * d))));
      for (i = 0; i < n; i++) {
        var pts = offset(m.p, (r() - 0.5) * m.w * 0.95, asp), len = pts.length, s0 = (r() * len * 0.22) | 0, e0 = len - ((r() * len * 0.22) | 0);
        pts = pts.slice(s0, Math.max(s0 + 3, e0)); if (pts.length < 3) continue;
        c.globalAlpha = Math.min(1, m.a * m.b * (0.18 + r() * 0.4));
        c.strokeStyle = rgba(shade(m.c, (r() - 0.5) * 0.36), 1);
        c.lineWidth = (0.6 + r() * 1.8) * d; c.lineCap = 'round'; c.lineJoin = 'round';
        trace(c, px(pts, W, H)); c.stroke();
      }
      c.globalAlpha = 1;
    } else if (m.t === 'd') {
      var x = m.x * W, y = m.y * H, R = Math.max(1.2 * d, m.r * S);
      if (m.flat) { c.globalAlpha = m.a; c.fillStyle = rgba(m.c, 1); c.beginPath(); c.arc(x, y, R, 0, 6.2832); c.fill(); c.globalAlpha = 1; return; }
      var g = c.createRadialGradient(x - R * 0.35, y - R * 0.4, R * 0.08, x, y, R);
      g.addColorStop(0, rgba(shade(m.c, 0.55), m.a)); g.addColorStop(0.55, rgba(m.c, m.a)); g.addColorStop(1, rgba(shade(m.c, -0.22), m.a));
      c.fillStyle = g; c.beginPath(); c.arc(x, y, R, 0, 6.2832); c.fill();
    } else if (m.t === 'l' || m.t === 'a') {
      if (m.p.length < 2) return;
      var P = wobble(px(m.p.length === 2 ? [m.p[0], [(m.p[0][0] + m.p[1][0]) / 2, (m.p[0][1] + m.p[1][1]) / 2], m.p[1]] : m.p, W, H), (m.wob || 0) * d, r);
      c.globalAlpha = m.a; c.strokeStyle = rgba(m.c, 1); c.lineWidth = m.w * d; c.lineCap = 'round'; c.lineJoin = 'round';
      if (m.dash) c.setLineDash(m.dash.map(function (v) { return v * d; }));
      if (m.poly) { c.beginPath(); c.moveTo(P[0][0], P[0][1]); for (i = 1; i < P.length; i++) c.lineTo(P[i][0], P[i][1]); } else trace(c, P);
      c.stroke(); c.setLineDash([]);
      if (m.t === 'a') {
        var e = P[P.length - 1], b = P[P.length - 2], ang = Math.atan2(e[1] - b[1], e[0] - b[0]), hl = 7 * d * (m.hs || 1);
        c.beginPath(); c.moveTo(e[0] - Math.cos(ang - 0.45) * hl, e[1] - Math.sin(ang - 0.45) * hl); c.lineTo(e[0], e[1]); c.lineTo(e[0] - Math.cos(ang + 0.45) * hl, e[1] - Math.sin(ang + 0.45) * hl); c.stroke();
      }
      c.globalAlpha = 1;
    } else if (m.t === 'k') {
      c.globalAlpha = m.a; c.strokeStyle = rgba(m.c, 1); c.lineWidth = m.w * d; c.lineCap = 'round'; c.beginPath();
      m.s.forEach(function (sg) { c.moveTo(sg[0][0] * W, sg[0][1] * H); c.lineTo(sg[1][0] * W, sg[1][1] * H); });
      c.stroke(); c.globalAlpha = 1;
    } else if (m.t === 'e') {
      c.globalAlpha = m.a; c.strokeStyle = rgba(m.c, 1); c.lineWidth = m.w * d;
      if (m.dash) c.setLineDash(m.dash.map(function (v) { return v * d; }));
      c.beginPath(); c.ellipse(m.x * W, m.y * H, Math.max(1, m.rx * S), Math.max(1, m.ry * S), m.rot || 0, 0, 6.2832); c.stroke();
      c.setLineDash([]); c.globalAlpha = 1;
    } else if (m.t === 't') {
      if (small) return;
      var fs = 11 * d, lx = Math.max(0.03, Math.min(0.97, m.x)) * W, ly = Math.max(0.04, Math.min(0.96, m.y)) * H;
      var al = m.al || (m.x > 0.62 ? 'right' : 'left');
      c.font = '500 ' + fs + 'px "JetBrains Mono", ui-monospace, Menlo, monospace';
      c.textAlign = al; c.textBaseline = 'middle';
      var tw = c.measureText(m.s).width;
      if (al === 'left' && lx + tw > W - 8 * d) lx = W - 8 * d - tw;
      if (al === 'right' && lx - tw < 8 * d) lx = 8 * d + tw;
      if (al === 'center') lx = Math.max(8 * d + tw / 2, Math.min(W - 8 * d - tw / 2, lx));
      c.globalAlpha = m.a; c.fillStyle = rgba(m.c, 1); c.strokeStyle = rgba(m.c, 1); c.lineWidth = 0.9 * d;
      if (m.tx != null) {
        var tx = m.tx * W, ty = m.ty * H;
        var ex = al === 'right' ? lx + 6 * d : al === 'center' ? lx : lx - 6 * d, ey = al === 'center' ? ly - fs : ly;
        if (al === 'left' && tx > lx + tw) ex = lx + tw + 6 * d;
        if (al === 'right' && tx < lx - tw) ex = lx - tw - 6 * d;
        c.beginPath(); c.moveTo(ex, ey); c.lineTo(tx, ty); c.stroke();
        c.beginPath(); c.arc(tx, ty, 2.2 * d, 0, 6.2832); c.fill();
      }
      if (m.h) { c.save(); c.globalAlpha = 0.75; c.lineWidth = 3.2 * d; c.lineJoin = 'round'; c.strokeStyle = rgba(m.h, 1); c.strokeText(m.s, lx, ly); c.restore(); c.globalAlpha = m.a; }
      c.fillText(m.s, lx, ly);
      c.globalAlpha = 1;
    }
  }
  var NOISE = null;
  function noise() {
    if (NOISE) return NOISE;
    var n = document.createElement('canvas'); n.width = n.height = 180;
    var x = n.getContext('2d'), im = x.createImageData(180, 180), r = rng(7);
    for (var i = 0; i < im.data.length; i += 4) { var v = (r() * 255) | 0; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    x.putImageData(im, 0, 0); NOISE = n; return n;
  }
  var fontsReady = !document.fonts;
  function paint(cv) {
    var W = cv.clientWidth, H = cv.clientHeight;
    if (!W || !H) return;
    var d = Math.min(window.devicePixelRatio || 1, 2), blue = isBlue();
    ACC = blue ? ACC_B : ACC_W; HOT = blue ? HOT_B : HOT_W; INK = blue ? INK_B : INK_W;
    var PAL = blue ? PAL_B : PAL_W;
    var kind = cv.getAttribute('data-art') || 'hero'; if (!SC[kind]) kind = 'streamlines';
    var seed = parseInt(cv.getAttribute('data-seed'), 10) || 1;
    var opts = DEF[kind] || ['rose'], P = PAL[cv.getAttribute('data-pal')] || PAL[opts[seed % opts.length]];
    var asp = W / H, spec = SC[kind](rng(seed * 7919 + kind.length * 131), P, asp, cv);
    var CW = Math.round(W * d), CH = Math.round(H * d), small = Math.min(W, H) < 240;
    var k = spec.soft || 0.2, bw = Math.max(16, Math.round(W * k)), bh = Math.max(16, Math.round(H * k));
    var off = document.createElement('canvas'); off.width = bw; off.height = bh;
    var o = off.getContext('2d');
    if (spec.bg) { o.fillStyle = rgba(spec.bg, 1); o.fillRect(0, 0, bw, bh); }
    spec.m.forEach(function (m) { basePass(o, m, bw, bh); });
    cv.width = CW; cv.height = CH;
    var c = cv.getContext('2d');
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    c.drawImage(off, 0, 0, CW, CH);
    var r2 = rng(seed * 31 + 5);
    spec.m.forEach(function (m) { detailPass(c, m, CW, CH, d, r2, small); });
    if (spec.grain) {
      c.save(); c.globalAlpha = spec.grain; c.globalCompositeOperation = 'overlay';
      c.fillStyle = c.createPattern(noise(), 'repeat'); c.fillRect(0, 0, CW, CH); c.restore();
    }
    cv._lab = !fontsReady && !small && spec.m.some(function (m) { return m.t === 't'; });
    cv.classList.add('painted');
  }

  var arts = $$('canvas[data-art]'), hasIO = 'IntersectionObserver' in window;
  function host(cv) { return cv.closest('.car-track') || cv; }
  function draw(cv, force) {
    var w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h || (!force && cv._w === w && cv._h === h)) return;
    cv._w = w; cv._h = h;
    try { paint(cv); } catch (e) { if (window.console) console.warn('art', e); }
  }
  function repaintAll() { arts.forEach(function (cv) { if (host(cv)._seen || !hasIO) draw(cv, true); }); }
  if (hasIO) {
    var targets = [];
    arts.forEach(function (cv) { var t = host(cv); if (!t._arts) { t._arts = []; targets.push(t); } t._arts.push(cv); });
    var aio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target._seen = true; e.target._arts.forEach(function (cv) { draw(cv); }); } });
    }, { rootMargin: '400px 0px' });
    targets.forEach(function (t) { aio.observe(t); });
  } else { arts.forEach(function (cv) { draw(cv); }); }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { fontsReady = true; arts.forEach(function (cv) { if (cv._lab) draw(cv, true); }); });
  }
  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      arts.forEach(function (cv) { if (host(cv)._seen || !hasIO) draw(cv); });
      placeLoop();
    }, 200);
  });
})();
