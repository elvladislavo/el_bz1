/* ═══════════════════════════════════════════════════════════════════════
   elvladislavo — reaction background
   ───────────────────────────────────────────────────────────────────────
   A Belousov–Zhabotinsky reaction (two-variable Oregonator, forward Euler
   on a periodic grid) painted onto one fixed canvas behind the whole page.

   The grid is rectangular and sized from the viewport, so a cell is always
   about the same number of CSS pixels — the spirals keep one scale on a
   phone and on a desktop instead of being stretched to the window.

   The canvas is deliberately coarse (one cell ≈ 4 px, upscaled by the
   browser) and the CSS layer above it dims and blurs the result: the waves
   stay readable as motion, but they never put sharp local contrast behind
   the type. The loop budgets its own work and backs off on a slow device
   rather than stealing frames from the scrolling.
   ═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var host = document.getElementById('bz');
  var cv   = document.getElementById('bzCanvas');
  if (!host || !cv || !cv.getContext) return;

  var ctx = cv.getContext('2d', { alpha: false });
  if (!ctx || !ctx.createImageData) return;

  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ══ Model ═══════════════════════════════════════════════════════════
     u — the autocatalyst (the live front), v — the slow inhibitor that
     leaves the refractory wake a front cannot cross.                     */
  // DX sets how wide a wave is in grid cells; at 0.9 a spiral arm spans
  // roughly 60 cells, which at a 4 px cell reads as ~240 px on screen.
  var DT = 0.008, DX = 0.95, Q = 0.002, EPS = 0.08, F = 0.90;
  var KU = 1.0 / (DX * DX), KV = 0.60 / (DX * DX), INV_EPS = 1 / EPS;

  var CELL     = 4;            // CSS pixels per grid cell (3 on phones,
                               // where the screen is small but dense)
  var MAXCELLS = 108000;       // work ceiling, independent of window size
  var BUDGET   = 2.6e6;        // cell updates per second the loop aims at

  var FPS     = 30;
  var STEP_MS = 1000 / FPS;
  var SUB     = 2;             // simulation steps per painted frame

  var NX = 0, NY = 0, N2 = 0;
  var U, V, U2, V2, xm, xp, yo, yu;
  var img, px;

  function allocate() {
    var w = Math.max(320, window.innerWidth  || 1024);
    var c = w < 700 ? CELL - 1 : CELL;
    var h = Math.max(320, window.innerHeight || 768);

    var nx = Math.max(64, Math.round(w / c));
    var ny = Math.max(64, Math.round(h / c));
    var fit = Math.sqrt(MAXCELLS / (nx * ny));
    if (fit < 1) {                                  // very large window
      nx = Math.max(64, Math.round(nx * fit));
      ny = Math.max(64, Math.round(ny * fit));
    }

    NX = nx; NY = ny; N2 = nx * ny;
    SUB = Math.max(1, Math.min(4, Math.round(BUDGET / (N2 * FPS))));

    U  = new Float32Array(N2); V  = new Float32Array(N2);
    U2 = new Float32Array(N2); V2 = new Float32Array(N2);

    xm = new Int32Array(NX); xp = new Int32Array(NX);
    for (var x = 0; x < NX; x++) { xm[x] = (x - 1 + NX) % NX; xp[x] = (x + 1) % NX; }
    yo = new Int32Array(NY); yu = new Int32Array(NY);
    for (var y = 0; y < NY; y++) { yo[y] = ((y - 1 + NY) % NY) * NX; yu[y] = ((y + 1) % NY) * NX; }

    cv.width = NX; cv.height = NY;
    img = ctx.createImageData(NX, NY);
    px  = new Uint32Array(img.data.buffer);
  }

  function step() {
    for (var y = 0; y < NY; y++) {
      var row = y * NX, up = yo[y], dn = yu[y];
      for (var x = 0; x < NX; x++) {
        var i = row + x, l = row + xm[x], r = row + xp[x];
        var uc = U[i], vc = V[i];
        var lu = U[up + x] + U[dn + x] + U[l] + U[r] - 4 * uc;
        var lv = V[up + x] + V[dn + x] + V[l] + V[r] - 4 * vc;
        var nu = uc + DT * (KU * lu + (uc * (1 - uc) - F * vc * (uc - Q) / (uc + Q)) * INV_EPS);
        var nv = vc + DT * (KV * lv + uc - vc);
        U2[i] = nu < 0 ? 0 : nu > 1 ? 1 : nu;
        V2[i] = nv < 0 ? 0 : nv > 1 ? 1 : nv;
      }
    }
    var t;
    t = U; U = U2; U2 = t;
    t = V; V = V2; V2 = t;
  }

  // A disc of excited medium set against its own refractory wake: the loose
  // end of the front cannot go straight, so it winds up into a spiral.
  function seed(cx, cy, R, th) {
    var ct = Math.cos(th), st = Math.sin(th), R2 = R * R;
    for (var dy = -R; dy <= R; dy++) {
      var row = ((((cy + dy) % NY) + NY) % NY) * NX;
      for (var dx = -R; dx <= R; dx++) {
        if (dx * dx + dy * dy > R2) continue;
        var i = row + ((((cx + dx) % NX) + NX) % NX);
        if (dx * ct - dy * st > 0) U[i] = 1.0;
        V[i] = (dx * st + dy * ct > 0) ? 0.5 : 0.0;
      }
    }
  }

  function fresh() {
    U.fill(0); V.fill(0);
    var n = Math.max(4, Math.min(26, Math.round(N2 / 4200)));
    var R = 12;
    for (var k = 0; k < n; k++) {
      seed((R + Math.random() * (NX - 2 * R)) | 0,
           (R + Math.random() * (NY - 2 * R)) | 0,
           R, Math.random() * Math.PI * 2);
    }
  }

  /* ══ Palette ═════════════════════════════════════════════════════════
     The site's own ramp: ink at rest, through to red in the spent wake,
     with bone marking the live front.                                    */
  var STOPS = [[0, [10, 10, 11]], [0.36, [58, 9, 7]], [0.7, [168, 23, 14]], [1, [255, 46, 31]]];
  var HI = [239, 234, 225];
  var lut = new Uint32Array(256 * 32);

  (function buildLut() {
    for (var vi = 0; vi < 256; vi++) {
      var t = vi / 255;
      var base = STOPS[STOPS.length - 1][1];
      for (var k = 0; k < STOPS.length - 1; k++) {
        var a = STOPS[k], b = STOPS[k + 1];
        if (t <= b[0] || k === STOPS.length - 2) {
          var m = Math.min(1, Math.max(0, (t - a[0]) / (b[0] - a[0] || 1)));
          base = [a[1][0] + (b[1][0] - a[1][0]) * m,
                  a[1][1] + (b[1][1] - a[1][1]) * m,
                  a[1][2] + (b[1][2] - a[1][2]) * m];
          break;
        }
      }
      for (var ui = 0; ui < 32; ui++) {
        var w = Math.pow(ui / 31, 0.85) * 0.97;
        var r = base[0] + (HI[0] - base[0]) * w | 0;
        var g = base[1] + (HI[1] - base[1]) * w | 0;
        var bl = base[2] + (HI[2] - base[2]) * w | 0;
        lut[(vi << 5) | ui] = (255 << 24) | (bl << 16) | (g << 8) | r;
      }
    }
  })();

  var VK = 255 / 0.37, UK = 31 / 0.45;

  function draw() {
    for (var i = 0; i < N2; i++) {
      var vi = V[i] * VK | 0; if (vi > 255) vi = 255;
      var ui = (U[i] - 0.32) * UK | 0; if (ui < 0) ui = 0; else if (ui > 31) ui = 31;
      px[i] = lut[(vi << 5) | ui];
    }
    ctx.putImageData(img, 0, 0);
  }

  function warm(n) { for (var i = 0; i < n; i++) step(); }

  /* ══ Loop ════════════════════════════════════════════════════════════
     Fresh seeds are discs, not spirals; the arms only wind up after a few
     thousand steps. Rather than pay for that before first paint, the loop
     runs fast for its first seconds (while the canvas is still fading in)
     and then settles to the slow drift it keeps for the rest of the visit.

     Each frame is timed. If the device cannot keep up, the loop gives
     itself less work, and finally holds a still frame — a background is
     never worth a dropped scroll frame.                                   */
  var raf = 0, last = 0, frames = 0, animating = false;
  var boost = 0;                 // extra steps per frame, decaying to none
  var cost = 0;                  // ms per frame, smoothed
  var slow = 0;

  function tick(now) {
    raf = requestAnimationFrame(tick);
    if (document.hidden) { last = now; return; }
    if (now - last < STEP_MS) return;
    last = now;

    var t0 = now;
    var n = SUB + (boost > 0 ? boost : 0);
    for (var s = 0; s < n; s++) step();
    draw();
    if (boost > 0) boost -= 1;

    cost = cost ? cost * 0.9 + (performance.now() - t0) * 0.1 : performance.now() - t0;

    if ((++frames & 31) === 0) {
      if (cost > 12 && boost <= 0) {              // fewer steps, then fewer
        if (SUB > 1) SUB--;                       // frames, and only then give
        else if (STEP_MS < 90) STEP_MS *= 1.6;    // up altogether
        else if (++slow > 2) { stop(); return; }
      }
      if ((frames & 127) === 0) {                 // restart if it dies out
        var peak = 0;
        for (var i = 0; i < N2; i += 37) if (U[i] > peak) peak = U[i];
        if (peak < 0.05) { fresh(); boost = 120; }
      }
    }
  }

  function start() {
    if (animating || mqReduce.matches) return;
    animating = true;
    last = 0;
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    animating = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function build() {
    allocate();
    fresh();
    warm(mqReduce.matches ? 2600 : 300);   // a still frame has to arrive developed
    draw();
    boost = 150;
    slow = 0; cost = 0;
    host.classList.add('is-on');
  }

  build();
  start();

  /* Keep a cell roughly the same size on screen, but ignore the small
     height changes a mobile browser chrome makes while scrolling.         */
  var tw = window.innerWidth, th = window.innerHeight, timer = 0;
  window.addEventListener('resize', function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      var w = window.innerWidth, h = window.innerHeight;
      if (Math.abs(w - tw) < tw * 0.12 && Math.abs(h - th) < th * 0.3) return;
      tw = w; th = h;
      stop(); build(); start();
    }, 240);
  }, { passive: true });

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) last = 0;
  });

  if (mqReduce.addEventListener) {
    mqReduce.addEventListener('change', function (e) {
      if (e.matches) stop(); else start();
    });
  }
})();
