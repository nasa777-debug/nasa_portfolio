/* =========================================================
   art.js — procedural artwork generator
   Every image on this site is drawn at runtime on <canvas>.
   ========================================================= */
(function () {
  'use strict';

  var INK = '#f0f0f0';
  var PAPER = '#0a0a0a';

  /* ---------- accent (single fixed red-orange) ----------
     Art.setTheme([r,g,b]) can still retint every painter + the shader. */
  var ACC = [255, 77, 0];
  function accStr(a) { return 'rgba(' + ACC.join(',') + ',' + (a == null ? 1 : a) + ')'; }
  var RED = accStr(); /* solid accent fill — refreshed by Art.setTheme */

  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function mkCanvas(w, h) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }

  /* ---------- shared helpers ---------- */

  function grain(ctx, w, h, amount, rnd) {
    var img = ctx.getImageData(0, 0, w, h);
    var d = img.data;
    for (var i = 0; i < d.length; i += 4) {
      var n = (rnd() - 0.5) * amount;
      d[i] = Math.max(0, Math.min(255, d[i] + n));
      d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
      d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
    }
    ctx.putImageData(img, 0, 0);
  }

  function fitText(ctx, text, maxW, startPx, font) {
    var size = startPx;
    for (var i = 0; i < 60; i++) {
      ctx.font = '300 ' + size + 'px ' + font;
      if (ctx.measureText(text).width <= maxW || size <= 12) break;
      size *= 0.96;
    }
    return size;
  }

  function vhs(ctx, w, h, rnd) {
    ctx.globalAlpha = 0.10;
    for (var i = 0; i < 9; i++) {
      var y = rnd() * h;
      var hh = 1 + rnd() * 2.2;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, y, w, hh);
      ctx.fillStyle = 'rgba(240,240,240,0.35)';
      ctx.fillRect(0, y + hh, w, 0.8);
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- cover painters ---------- */

  // 01 — India Web Usage Platform: dashboard scatter = "usage trends + risk"
  function paintUsage(ctx, w, h, r) {
    ctx.fillStyle = '#101010'; ctx.fillRect(0, 0, w, h);
    var cy = h * 0.62;
    // risk bands
    ctx.fillStyle = accStr(0.10); ctx.fillRect(0, h * 0.70, w, h * 0.30);
    ctx.strokeStyle = 'rgba(240,240,240,0.14)'; ctx.lineWidth = 1;
    for (var g = 1; g < 6; g++) {
      ctx.beginPath(); ctx.moveTo(0, h * g / 6); ctx.lineTo(w, h * g / 6); ctx.stroke();
    }
    // dots
    for (var i = 0; i < 120; i++) {
      var x = 0.03 * w + r() * 0.94 * w;
      var base = cy - Math.pow(r(), 1.7) * h * 0.45;
      var y = base + (r() - 0.5) * h * 0.16;
      var risk = y / h;
      var size = 1.5 + r() * (w * 0.011);
      ctx.globalAlpha = 0.25 + r() * 0.75;
      ctx.fillStyle = risk > 0.7 ? RED : INK;
      ctx.beginPath(); ctx.arc(x, y, size, 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // trend line
    ctx.strokeStyle = RED; ctx.lineWidth = Math.max(2, w * 0.004);
    ctx.beginPath();
    for (var t = 0; t <= 60; t++) {
      var px = (t / 60) * w;
      var py = cy - Math.sin(t * 0.22 + r() * 0.02) * h * 0.13 - r() * h * 0.05;
      t === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
    vhs(ctx, w, h, r);
  }

  // 02 — Stock Analyzer: candlestick grid
  function paintStock(ctx, w, h, r) {
    ctx.fillStyle = '#0c0c0c'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(240,240,240,0.10)'; ctx.lineWidth = 1;
    for (var g = 1; g < 7; g++) {
      var y = h * g / 7;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    var n = 26;
    var bw = w / (n + 1);
    var px = 0.5 * h;
    for (var i = 0; i < n; i++) {
      var drift = (r() - 0.48) * h * 0.09;
      var open = px; px = Math.max(h * 0.14, Math.min(h * 0.86, px + drift));
      var close = px;
      var hi = Math.min(open, close) - r() * h * 0.07;
      var lo = Math.max(open, close) + r() * h * 0.07;
      var x = bw * (i + 0.5) + bw * 0.18;
      var up = close < open; // y inverted: lower value = green-ish? keep monochrome logic
      var col = up ? 'rgba(240,240,240,0.9)' : RED;
      ctx.strokeStyle = col; ctx.lineWidth = Math.max(1.2, w * 0.002);
      ctx.beginPath(); ctx.moveTo(x, hi); ctx.lineTo(x, lo); ctx.stroke();
      ctx.fillStyle = col;
      ctx.fillRect(x - bw * 0.26, Math.min(open, close), bw * 0.52, Math.max(2, Math.abs(close - open)));
    }
    vhs(ctx, w, h, r);
  }

  // 03 — Image Comparison Tool: diff grid
  function paintDiff(ctx, w, h, r) {
    ctx.fillStyle = '#0b0b0b'; ctx.fillRect(0, 0, w, h);
    var cols = 22, rows = Math.round(cols * h / w);
    var cw = w / cols, chh = h / rows;
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        var v = r();
        if (v < 0.055) {
          ctx.fillStyle = RED;
          ctx.fillRect(x * cw + 1, y * chh + 1, cw - 2, chh - 2);
        } else if (v < 0.30) {
          ctx.globalAlpha = 0.06 + v;
          ctx.fillStyle = INK;
          ctx.fillRect(x * cw + 1, y * chh + 1, cw - 2, chh - 2);
          ctx.globalAlpha = 1;
        }
      }
    }
    // scan line
    var sy = h * (0.3 + r() * 0.4);
    var grad = ctx.createLinearGradient(0, sy - h * 0.05, 0, sy + h * 0.05);
    grad.addColorStop(0, accStr(0));
    grad.addColorStop(0.5, accStr(0.5));
    grad.addColorStop(1, accStr(0));
    ctx.fillStyle = grad; ctx.fillRect(0, sy - h * 0.05, w, h * 0.1);
    vhs(ctx, w, h, r);
  }

  // 04 — LeetCode arena: radial strikes
  function paintArena(ctx, w, h, r) {
    ctx.fillStyle = '#0d0d0d'; ctx.fillRect(0, 0, w, h);
    var cx = w / 2, cy = h / 2;
    ctx.strokeStyle = 'rgba(240,240,240,0.16)'; ctx.lineWidth = 1;
    for (var k = 1; k <= 5; k++) {
      ctx.beginPath(); ctx.arc(cx, cy, k * w * 0.085, 0, 6.2832); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - w * 0.46, cy); ctx.lineTo(cx + w * 0.46, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - h * 0.46); ctx.lineTo(cx, cy + h * 0.46); ctx.stroke();
    }
    ctx.lineCap = 'round';
    for (var i = 0; i < 34; i++) {
      var a = r() * 6.2832;
      var r1 = w * 0.05 + r() * w * 0.07;
      var r2 = r1 + w * 0.12 + r() * w * 0.32;
      ctx.strokeStyle = r() < 0.22 ? RED : 'rgba(240,240,240,' + (0.25 + r() * 0.7) + ')';
      ctx.lineWidth = 1 + r() * 3;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
      ctx.stroke();
    }
    ctx.lineCap = 'butt';
    vhs(ctx, w, h, r);
  }

  // 05 — Vision / YOLO: detection boxes + OBB rectangles
  function paintVision(ctx, w, h, r) {
    ctx.fillStyle = '#0f0f0f'; ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.35;
    for (var i = 0; i < 12; i++) {
      ctx.fillStyle = i % 3 ? 'rgba(240,240,240,0.12)' : accStr(0.16);
      var bx = r() * w, by = r() * h, bw2 = w * (0.06 + r() * 0.2), bh2 = bw2 * (0.6 + r() * 0.9);
      ctx.fillRect(bx, by, bw2, bh2);
    }
    ctx.globalAlpha = 1;
    for (var j = 0; j < 6; j++) {
      var x = w * (0.06 + r() * 0.62);
      var y = h * (0.08 + r() * 0.6);
      var bw = w * (0.16 + r() * 0.24);
      var bh = h * (0.16 + r() * 0.3);
      var ang = (r() - 0.5) * 0.7;
      ctx.save();
      ctx.translate(x + bw / 2, y + bh / 2);
      ctx.rotate(ang);
      ctx.strokeStyle = j % 3 === 0 ? RED : INK;
      ctx.globalAlpha = 0.9;
      ctx.lineWidth = Math.max(1.5, w * 0.0035);
      ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);
      ctx.fillStyle = ctx.strokeStyle;
      ctx.font = '600 ' + Math.max(9, w * 0.022) + 'px monospace';
      ctx.fillText('obj ' + (0.72 + r() * 0.27).toFixed(2), -bw / 2 + 4, -bh / 2 - 6);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    vhs(ctx, w, h, r);
  }

  // 06 — Flask / Spring Boot: flow network
  function paintFlow(ctx, w, h, r) {
    ctx.fillStyle = '#0e0e0e'; ctx.fillRect(0, 0, w, h);
    var nodes = [];
    for (var i = 0; i < 9; i++) nodes.push({ x: w * (0.08 + r() * 0.84), y: h * (0.1 + r() * 0.8) });
    ctx.strokeStyle = 'rgba(240,240,240,0.30)'; ctx.lineWidth = 1;
    for (var a = 0; a < nodes.length; a++) {
      for (var b = a + 1; b < nodes.length; b++) {
        if (r() < 0.45) {
          ctx.beginPath();
          ctx.moveTo(nodes[a].x, nodes[a].y);
          var mx2 = (nodes[a].x + nodes[b].x) / 2 + (r() - 0.5) * w * 0.14;
          var my2 = (nodes[a].y + nodes[b].y) / 2 + (r() - 0.5) * h * 0.14;
          ctx.quadraticCurveTo(mx2, my2, nodes[b].x, nodes[b].y);
          ctx.stroke();
        }
      }
    }
    nodes.forEach(function (n) {
      ctx.fillStyle = r() < 0.3 ? RED : INK;
      ctx.beginPath(); ctx.arc(n.x, n.y, w * (0.006 + r() * 0.008), 0, 6.2832); ctx.fill();
    });
    vhs(ctx, w, h, r);
  }

  /* ---------- cover registry ---------- */
  var PAINTERS = [paintUsage, paintStock, paintDiff, paintArena, paintVision, paintFlow];

  function paintCover(kind, w, h, seed) {
    var c = mkCanvas(w, h);
    var ctx = c.getContext('2d');
    PAINTERS[kind % PAINTERS.length](ctx, w, h, rng(seed));
    // frame corners like the reference covers
    var m = w * 0.045, L = w * 0.05;
    ctx.strokeStyle = 'rgba(240,240,240,0.85)'; ctx.lineWidth = Math.max(1.5, w * 0.003);
    [[m, m, 1, 1], [w - m, m, -1, 1], [m, h - m, 1, -1], [w - m, h - m, -1, -1]].forEach(function (cr) {
      ctx.beginPath();
      ctx.moveTo(cr[0] + cr[2] * L, cr[1]);
      ctx.lineTo(cr[0], cr[1]);
      ctx.lineTo(cr[0], cr[1] + cr[3] * L);
      ctx.stroke();
    });
    // index chip
    ctx.fillStyle = RED;
    var chipW = w * 0.13, chipH = h * 0.085;
    ctx.fillRect(m, m + L + 10, chipW, chipH);
    ctx.fillStyle = PAPER;
    ctx.font = '700 ' + Math.round(chipH * 0.62) + 'px monospace';
    ctx.textBaseline = 'middle';
    ctx.fillText(String((kind % 99) + 1).padStart(2, '0'), m + chipW * 0.3, m + L + 10 + chipH / 2);
    grain(ctx, w, h, 16, rng(seed + 7));
    return c;
  }

  /* ---------- about portrait poster ---------- */
  // Purely typographic "portrait" — a terminal profile card.
  function paintPoster(w, h) {
    var c = mkCanvas(w, h);
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#101010'; ctx.fillRect(0, 0, w, h);

    // terminal window
    var pad = w * 0.055;
    var bar = h * 0.05;
    ctx.fillStyle = '#181818'; ctx.fillRect(pad, pad, w - pad * 2, bar);
    ['#ff5f56', '#ffbd2e', '#27c93f'].forEach(function (col, i) {
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(pad + w * 0.02 + i * w * 0.025, pad + bar / 2, bar * 0.16, 0, 6.2832); ctx.fill();
    });
    ctx.strokeStyle = 'rgba(240,240,240,0.18)'; ctx.lineWidth = 2;
    ctx.strokeRect(pad, pad, w - pad * 2, h - pad * 2);

    var lines = [
      '$ whoami', 'narayanaswamy', '', '$ cat profile.txt',
      'B.E. CS @ LICET', 'CGPA 8.7 / 10', 'Grad 2028', '',
      '$ leetcode --stats', '[############] 300+ solved', '',
      '$ yolo-train --obb', 'mAP@50  0.80', 'mAP@50-95 0.75', '',
      '$ stack --print', 'python · java · c', 'react · flask', 'spring boot · sql', 'opencv · yolo-obb', '',
      '$ uptime', 'training models since', 'jun 2026 — present', '',
      '$ contact --now', 'deva02072007@gmail.com', ''
    ];
    var fs = Math.max(10, Math.round(w * 0.024));
    ctx.font = '500 ' + fs + 'px monospace';
    ctx.textBaseline = 'alphabetic';
    var y = pad + bar + fs * 2.1;
    var x = pad + w * 0.045;
    lines.forEach(function (ln, i) {
      var isCmd = ln.indexOf('$') === 0;
      ctx.fillStyle = isCmd ? RED : (ln ? 'rgba(240,240,240,0.9)' : '#000');
      // typewriter cursor on last line
      if (ln === '') return;
      if (i === lines.length - 2) ln += ' █';
      ctx.fillText(ln, x, y);
      y += fs * 1.7;
    });

    // red corner blocks for that poster feel
    ctx.fillStyle = RED;
    ctx.fillRect(w - pad - w * 0.06, h - pad - w * 0.06, w * 0.06, w * 0.06);
    ctx.fillRect(pad, h - pad - w * 0.02, w * 0.02, w * 0.02);
    grain(ctx, w, h, 12, rng(99));
    return c;
  }

  /* =========================================================
     Footer ascii — shared glyph pools. The classic Veilleux "two hands
     reaching" footer art lives in main.js as verbatim text rows; these
     pools drive its cursor-dissolve hover.
     ========================================================= */
  var ASCII_POOLS = [
    ' ',
    '·.,',
    ':;`-~^',
    '=+<>?!:;',
    '|/\\()[]{}«»',
    '÷×±≈≠≤≥∞∑∏√∫',
    '¤†‡§¶©®™°¬',
    '%&#$@¥€£¢'
  ];

  /* =========================================================
     WebGL hero — animated red/ink gradient mesh (shader)
     ========================================================= */
  function initHeroCanvas(container) {
    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    container.appendChild(canvas);
    var gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) { canvas.parentNode.removeChild(canvas); return null; }

    var VERT = 'attribute vec2 aPos;void main(){gl_Position=vec4(aPos,0.,1.);}';
    var FRAG = [
      'precision mediump float;',
      'uniform vec2 uRes;uniform float uT;uniform vec2 uMouse;uniform vec3 uAcc;',
      'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
      'float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.-2.*f);',
      '  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}',
      'float fbm(vec2 p){float v=0.;float a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}',
      'void main(){',
      '  vec2 uv=gl_FragCoord.xy/uRes.xy;',
      '  vec2 p=(uv-.5)*vec2(uRes.x/uRes.y,1.)*2.1;',
      '  vec2 m=(uMouse-.5)*vec2(1.4,1.0);',
      '  float t=uT*.012;',      // slow, calm drift like the reference
      '  // hanging-curtain axis: mostly vertical, slight tilt',
      '  float across=p.x-.14*p.y+.85;',
      '  // large-scale wobble of the axis so the drape width is organic',
      '  float sway=fbm(vec2(p.y*.35+t*.5, 7.3))-.5;',
      '  across+=sway*1.15+m.x*.3;',
      '  // curtain folds: vertical, stretched, drifting downward slowly',
      '  float folds=fbm(vec2(across*.95, p.y*.22 - t + m.y*.15));',
      '  float fine=fbm(vec2(across*3.0, p.y*.8 + t*.6))*.16;',
      '  // envelope: bright core on the axis, wide ambient, wider at the top',
      '  float wid=1.55+.55*smoothstep(-.8,1.4,p.y);',
      '  float core=smoothstep(wid,.06,abs(across));',
      '  float amb=smoothstep(2.8,.2,abs(across));',
      '  float v=amb*.34 + core*(.12+.85*folds) + core*fine;',
      '  // darkest top-left corner, like the reference',
      '  v*=mix(1.,.4,smoothstep(.9,2.2,dot(p,normalize(vec2(-1.,1.)))));',
      '  // dark floor band along the bottom',
      '  v*=mix(.3,1.,smoothstep(-1.45,-.7,p.y));',
      '  v=smoothstep(.04,1.1,v);',
      '  // 4-stop grading: near-black to dark maroon to deep red to accent',
      '  vec3 c0=vec3(.023,.008,.005);',
      '  vec3 c1=vec3(.16,.045,.018);',
      '  vec3 c2=vec3(.55,.13,.04);',
      '  vec3 col=mix(c0,c1,smoothstep(.0,.34,v));',
      '  col=mix(col,c2,smoothstep(.30,.68,v));',
      '  col=mix(col,uAcc,smoothstep(.62,1.0,v));',
      '  col+=uAcc*smoothstep(.88,1.2,v)*.22;',   // ridge cores glow past the accent, capped
      '  // subtle scanlines',
      '  col*= .96+.04*sin(gl_FragCoord.y*1.4);',
      '  gl_FragColor=vec4(col,1.);',
      '}'
    ].join('\n');

    function sh(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    var vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { canvas.parentNode.removeChild(canvas); return null; }
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.parentNode.removeChild(canvas); return null; }
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var uRes = gl.getUniformLocation(prog, 'uRes');
    var uT = gl.getUniformLocation(prog, 'uT');
    var uMouse = gl.getUniformLocation(prog, 'uMouse');
    var uAcc = gl.getUniformLocation(prog, 'uAcc');
    gl.uniform3f(uAcc, ACC[0] / 255, ACC[1] / 255, ACC[2] / 255);

    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var mx = 0.5, my = 0.5, tmx = 0.5, tmy = 0.5;
    window.addEventListener('mousemove', function (e) {
      tmx = e.clientX / window.innerWidth;
      tmy = 1 - e.clientY / window.innerHeight;
    }, { passive: true });

    var paused = false;
    var raf = 0;
    var t0 = performance.now();

    function resize() {
      var w = Math.max(1, Math.round(container.clientWidth * dpr));
      var h = Math.max(1, Math.round(container.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    }
    window.addEventListener('resize', resize);
    resize();

    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (paused) return;
      mx += (tmx - mx) * 0.04;
      my += (tmy - my) * 0.04;
      gl.uniform1f(uT, (now - t0) / 1000);
      gl.uniform2f(uMouse, mx, my);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    raf = requestAnimationFrame(frame);
    return {
      pause: function () { paused = true; },
      resume: function () { paused = false; t0 = performance.now(); },
      setAccent: function (rgb) { if (rgb && rgb.length === 3) gl.uniform3f(uAcc, rgb[0] / 255, rgb[1] / 255, rgb[2] / 255); }
    };
  }



  /* =========================================================
     Theme API — retints every future painting; live canvases
     (hero shader) are updated separately via their setAccent().
     ========================================================= */
  function setTheme(accentRGB) {
    if (Array.isArray(accentRGB) && accentRGB.length === 3) {
      ACC = accentRGB.slice();
      RED = accStr();
    }
    return ACC.slice();
  }

  window.Art = {
    paintCover: paintCover,
    paintPoster: paintPoster,
    initHeroCanvas: initHeroCanvas,
    ASCII_POOLS: ASCII_POOLS,
    setTheme: setTheme,
    getAccent: function () { return ACC.slice(); }
  };
})();
