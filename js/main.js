/* =========================================================
   Narayanaswamy C — Portfolio engine
   Choreography adapted from lukebaffait.fr:
   preloader → pinned hero → scrub-driven reveal →
   word-blur about → 3D projects → orbit gallery →
   skills accordion → achievements → contact blob →
   ASCII footer + scroll HUD.
   ========================================================= */
(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  /* ---------------- environment ---------------- */
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
    navigator.maxTouchPoints > 1;
  var isMobileViewport = function () { return window.innerWidth <= 900; };

  function isMobileViewportFn() { return isMobileViewport(); }

  /* ---------------- data ---------------- */
  var PROJECTS = {
    'india-web-usage': {
      desc: 'Full-stack platform for website usage analysis and risk-level classification with interactive dashboards. Responsive React dashboards use Recharts for usage trends and website statistics; REST APIs are implemented with Spring Boot and Java 17 for analytics and reporting.',
      category: 'Full-Stack Web App', year: '2025', tags: ['React', 'Spring Boot', 'Tailwind CSS', 'Recharts'],
      link: 'https://github.com/nasa777-debug/fuzzy-garbanzo'
    },
    'stock-analyzer': {
      desc: 'Stock market learning platform with portfolio simulation and dummy trading. Flask backend handles stock data processing and investment analysis; responsive interfaces present market insights and investment strategies.',
      category: 'Web App', year: '2025', tags: ['Python Flask', 'HTML', 'CSS', 'MySQL'],
      link: 'https://github.com/nasa777-debug/stock-analyzer'
    },
    'bootup': {
      desc: 'Lightweight open-source mobile OS simulation environment built on postmarketOS, Phosh and QEMU/KVM. Enables kernel-level mobile OS booting and testing on x86 systems without physical device flashing — a low-resource, de-Googled Linux mobile environment for development and testing.',
      category: 'Systems / DevOps', year: '2026', tags: ['postmarketOS', 'Phosh', 'QEMU/KVM', 'Linux'],
      link: 'https://github.com/nasa777-debug/Bootup'
    },
    'leetcode-arena': {
      desc: 'An ongoing grind: 300+ LeetCode problems solved to strengthen data structures, algorithms and problem-solving — arrays to graphs, sliding windows to dynamic programming.',
      category: 'DSA Practice', year: '2024 — ongoing', tags: ['Java', 'Python', 'DSA'],
      link: 'https://github.com/nasa777-debug/LEETCODE'
    },
    'vision-obb': {
      desc: 'Computer-vision internship at Lesoko Technologies: training and optimizing YOLO-OBB models to 80% mAP@50 and 75% mAP@50-95 on custom datasets — hyperparameter tuning, annotation validation, PR-curve analysis, GPU-accelerated training.',
      category: 'Computer Vision', year: '2026', tags: ['YOLO-OBB', 'OpenCV', 'Colab', 'NumPy']
    },
    'calm-canvas': {
      desc: 'Hackathon project: an interactive digital sanctuary for students with reflection, journaling, focus sessions, relaxation rooms and progress tracking. Immersive UI with animations, ambient soundscapes and interactive components, deployed on Vercel.',
      category: 'Hackathon Project', year: '2025', tags: ['HTML', 'CSS', 'JavaScript', 'Vercel'],
      link: 'https://github.com/nasa777-debug/CalmCanvas'
    }
  };

  var ITEMS = gsap.utils.toArray('.proj-item');

  /* Screenshot galleries: real app shots per project. Projects without
     screenshots keep 4 procedural cover variations (kind, +6, +12, +18). */
  var SHOTS = 'assets/screenshots/';
  var PROJECT_SHOTS = {
    'stock-analyzer': ['stock-signin.jpg', 'stock-overview.jpg', 'stock-market.jpg', 'stock-learn.jpg', 'stock-agent.jpg', 'stock-trades.jpg'],
    'india-web-usage': ['webusage-dashboard.jpg', 'webusage-auth.jpg'],
    'bootup': ['bootup-placeholder.jpg'],
    'vision-obb': ['yolo-placeholder.jpg'],
    'leetcode-arena': ['dsa-placeholder.jpg'],
    'calm-canvas': ['calmcanvas-home.jpg', 'calmcanvas-pause.jpg', 'calmcanvas-rooms.jpg', 'calmcanvas-focus.jpg', 'calmcanvas-journal.jpg', 'calmcanvas-wins.jpg', 'calmcanvas-companion.jpg']
  };

  /* one representative image per project, indexed by data-paint (01–06).
   Projects without real imagery keep their procedural cover (null). */
  var SHOT_BY_PAINT = ['webusage-dashboard.jpg', 'stock-overview.jpg', 'bootup-placeholder.jpg', 'calmcanvas-home.jpg', 'yolo-placeholder.jpg', 'dsa-placeholder.jpg'];

  /* ---------------- element handles ---------------- */
  var introBg = document.getElementById('intro-bg');
  var pContent = document.getElementById('preloader-content');
  var pLogo = document.getElementById('preloader-logo');
  var pFirst = document.getElementById('preloader-luke');
  var pLast = document.getElementById('preloader-baffait');
  var pDot = document.getElementById('preloader-dot');
  var tPanelRed = document.getElementById('t-panel-red');
  var tPanelDark = document.getElementById('t-panel-dark');
  var hero = document.getElementById('hero');
  var nameLayer = document.getElementById('name-layer');

  /* ---------------- char splitting (preloader) ---------------- */
  function splitIntoChars(el) {
    var raw = el.textContent;
    el.innerHTML = '';
    var inners = [];
    raw.split('').forEach(function (ch) {
      var outer = document.createElement('span');
      outer.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;padding:0.15em 0.3em;margin:-0.15em -0.3em;';
      var inner = document.createElement('span');
      inner.className = 'char';
      inner.style.display = 'inline-block';
      inner.textContent = ch === ' ' ? '\u00A0' : ch;
      outer.appendChild(inner);
      el.appendChild(outer);
      inners.push(inner);
    });
    return inners;
  }

  var logoChars = splitIntoChars(pLogo);
  var firstChars = splitIntoChars(pFirst);
  var lastChars = splitIntoChars(pLast);
  var allChars = firstChars.concat(lastChars);
  var allRevealEls = logoChars.concat(firstChars, lastChars);

  /* ---------------- name layout (two fonts, one baseline) ---------------- */
  function getCharGap() { return parseFloat(getComputedStyle(pLast).fontSize) * 0.55; }

  function layoutNames() {
    var fs = parseFloat(getComputedStyle(pLast).fontSize);
    if (!fs) return;
    var firstLeft = pFirst.offsetLeft;
    var firstWidth = pFirst.offsetWidth;
    var gapPx = fs * 0.55;
    var lastLeftPx = firstLeft + firstWidth + gapPx;
    pLast.style.left = (lastLeftPx / fs) + 'em';
    var dotLeftPx = lastLeftPx + pLast.offsetWidth;
    pDot.style.left = (dotLeftPx / fs) + 'em';
  }
  layoutNames();

  function getTotalWidth() {
    return pLogo.offsetWidth + pFirst.offsetWidth + getCharGap() + pLast.offsetWidth + pDot.offsetWidth;
  }

  function getViewportSize() {
    return { width: document.documentElement.clientWidth || window.innerWidth, height: window.innerHeight };
  }

  var _introSettledXvw = 0;
  function placeIntroNameAtBottom() {
    layoutNames();
    var totalW = getTotalWidth();
    var offsetX = -(totalW / 2 - pLogo.offsetWidth / 2);
    var offsetX_vw = (offsetX / getViewportSize().width) * 100;
    _introSettledXvw = offsetX_vw;
    var newH = pContent.offsetHeight;
    var vh = getViewportSize().height;
    var bottomPad = isMobileViewport() ? Math.max(vh * 0.12, 80) : 80;
    var targetBottom = vh - bottomPad;
    var offsetY = targetBottom - newH / 2 - vh / 2;
    gsap.set(pContent, { x: offsetX_vw + 'vw', y: offsetY, transformOrigin: '50% 50%' });
  }

  var keepIntroNameAnchored = false;
  var nameAnchorRaf = 0;
  function refreshIntroNameAnchor() {
    if (!keepIntroNameAnchored) return;
    if (nameAnchorRaf) cancelAnimationFrame(nameAnchorRaf);
    nameAnchorRaf = requestAnimationFrame(function () { nameAnchorRaf = 0; placeIntroNameAtBottom(); });
  }
  function stopIntroNameAnchor() {
    keepIntroNameAnchored = false;
    if (nameAnchorRaf) { cancelAnimationFrame(nameAnchorRaf); nameAnchorRaf = 0; }
    window.removeEventListener('resize', refreshIntroNameAnchor);
  }
  window.addEventListener('resize', refreshIntroNameAnchor);

  /* ---------------- scroll lock during intro ---------------- */
  var _isForcingScroll = false;
  function _forceScrollTop() {
    if (_isForcingScroll) return;
    _isForcingScroll = true;
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    _isForcingScroll = false;
  }
  function _preventTouchScroll(e) { e.preventDefault(); }
  var _scrollLockListener = null;
  function lockScroll() {
    _forceScrollTop();
    _scrollLockListener = _forceScrollTop;
    window.addEventListener('scroll', _scrollLockListener);
    if (isMobile) document.addEventListener('touchmove', _preventTouchScroll, { passive: false });
    else document.documentElement.style.overflow = 'hidden';
  }
  function unlockScroll() {
    if (_scrollLockListener) { window.removeEventListener('scroll', _scrollLockListener); _scrollLockListener = null; }
    if (isMobile) document.removeEventListener('touchmove', _preventTouchScroll);
    else document.documentElement.style.overflow = '';
    _forceScrollTop();
  }

  /* ---------------- procedural hero art ---------------- */
  var heroArt = null;
  function startHeroArt() {
    if (heroArt) return;
    var container = document.getElementById('hero-canvas');
    if (!container) return;
    heroArt = window.Art.initHeroCanvas(container);
    if (heroArt && window.__themeAccent) heroArt.setAccent(window.__themeAccent);
    if (heroArt) {
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) heroArt.pause(); else heroArt.resume();
      });
    }
  }

  /* ---------------- chr-hover char roll ---------------- */
  var chrHoverTl = gsap.timeline({ paused: true });
  function buildChrHovers() {
    document.querySelectorAll('.chr-hover[data-chr]').forEach(function (el) {
      var text = el.dataset.chr;
      el.textContent = '';
      Array.from(text).forEach(function (ch, i) {
        if (ch === ' ') { el.insertAdjacentHTML('beforeend', '<span style="width:0.35em;display:inline-block">&nbsp;</span>'); return; }
        var wrap = document.createElement('span');
        wrap.className = 'ch-wrap';
        wrap.style.setProperty('--i', i);
        var acc = ch === '↗' || ch === '↓' ? ' acc' : '';
        wrap.innerHTML = '<span class="ch-top">' + ch + '</span><span class="ch-bot' + acc + '">' + ch + '</span>';
        el.appendChild(wrap);
      });
    });
    document.querySelectorAll('.chr-hover').forEach(function (el, elIdx) {
      el.querySelectorAll('.ch-top').forEach(function (ch, i) {
        var pos = elIdx * 0.08 + i * 0.03;
        chrHoverTl.fromTo(ch,
          { clipPath: 'inset(100% 0 0 0)', immediateRender: false },
          { clipPath: 'inset(0 0 0 0)', duration: 0.7, ease: 'power3.out' }, pos);
      });
    });
  }
  buildChrHovers();

  /* detail overlay buttons */
  (function buildOverlayChars() {
    [['back', 'Back'], ['visit', 'See project ↗']].forEach(function (pair) {
      var el = document.querySelector('[data-chr-' + pair[0] + ']');
      if (!el) return;
      el.textContent = '';
      Array.from(pair[1]).forEach(function (ch) {
        if (ch === ' ') { el.insertAdjacentHTML('beforeend', '<span style="width:0.35em;display:inline-block">&nbsp;</span>'); return; }
        el.insertAdjacentHTML('beforeend', '<span>' + ch + '</span>');
      });
    });
  })();

  /* ---------------- artwork: covers, poster, frames, ascii ----------------
     All of it is painted with the active accent. Art.setTheme() retints
     the painters, then retintArtwork() clears caches and repaints
     every runtime-generated image live (see THEME section below). */
  var COVER_W = 1200, COVER_H = 900;
  var coverCache = {};
  function getCover(kind) {
    if (!coverCache[kind]) coverCache[kind] = window.Art.paintCover(kind, COVER_W, COVER_H, 1000 + kind * 37);
    return coverCache[kind];
  }
  function retintCoverDataURL(kind) { return getCover(kind).toDataURL('image/jpeg', 0.82); }

  var posterCanvas = null;
  (function paintStaticArt() {
    var poster = document.getElementById('about-photo');
    if (poster) {
      posterCanvas = window.Art.paintPoster(900, 1125);
      poster.src = posterCanvas.toDataURL('image/jpeg', 0.85);
    }

    var f1 = document.getElementById('contact-frame-img');
    var f2 = document.getElementById('contact-frame-img-2');
    if (f1) f1.src = SHOTS + 'calmcanvas-home.jpg';
    if (f2) f2.src = SHOTS + 'webusage-dashboard.jpg';
  })();

  (function paintAscii() {
    var leftPre = document.getElementById('ascii-left');
    var rightPre = document.getElementById('ascii-right');
    if (!leftPre || !rightPre) return;

    /* The "Creation of Adam" hands — traced from the dense classic
       ascii rendition (fingertips almost touching, left hand sweeping in
       from the left edge, right hand reaching up from the right), rastered
       to a brightness-mapped glyph grid (tiered pools, seeded LCG-42) and
       split down the middle: the left half rides the left wrapper, the
       right half the right one, so the hands literally reach for each
       other as the footer scrolls in. Painted in the site accent; idle
       shimmer wave + cursor dissolve on top. */
    var LEFT_ROWS = [
      "¤≥™‡§†¬©©‡†°«`                              ",
      "+++<=}≥√∑=≥†°¶≤≤                            ",
      "+==;»}≥∏∞≠≠≈<{§¤©†);;:                      ",
      "∫]=;){±≥»±∑≠)!+::¤¤†®§‡©©×                  ",
      "¬(∏≈{√[>;[;(::!?:?≈§§¶©∞¤¶¶                 ",
      "¤™§¶¬†¶(>+<!»=>:?+)/:>=©§‡§§                ",
      "®‡‡¬†®©}+<+</;!?-><<>>>(<=∑¶=               ",
      "§©†°¬¬™±?+::;<!!^=!;;/`:?/[†™‡\\<            ",
      "™¶¬©¶®¬¶>=:+??<)+}≤∞≥|!{+:+÷≤™¬©¤-          ",
      "§¶§§√°¬©|!<-:`!«(√¬≤¶°÷÷≤?>-!?∞†™°¬.        ",
      "¶¬¬¶§¬™§(|∫];!:+[|‡‡¶™™‡¶:][::\\±∞‡§‡        ",
      "¬¤¤‡®°[·™≠/+>=<!+=™™¤°©©™¬‡™‡≥{+>]®‡∑       ",
      "®©¤¬.   ·∑(≤×†<;:!!§¶©®‡™®††°§°¬°((‡©,      ",
      "‡§»      !≠≤†¤±:~(÷÷‡‡∞¬¶¶™¤¬‡°©†¤[[¶†      ",
      "™:        \\°‡§™≈\\[/(∫¶‡®™©®§®¶°®¶°¶»\\™¤     ",
      "~           ^+?°†§(<>\\®†°¤¶™°†¶×®†¤‡±√¤     ",
      "                ,:¬°«≤∏≈™†¤∑¶¬§®°©°™©×¬≤    ",
      "                   ?÷×=÷∫‡™« ¤¤‡¬®‡`°®∏¬=   ",
      "                    .≤∏[‡¶°§ ¤°®®¶†∑=™©§±   ",
      "                     )‡∞¬×∏≈<;©‡∑®°≠        ",
      "                      ¬¤™∏≥¤< ∞†°§®-        ",
      "                      ¬¬††®†- §°†¤¶¤        ",
      "                      ©°÷`¤+  |‡¤°‡¤        ",
      "                               )}-{/        ",
      "                                            ",
      "                                            ",
      "                                            ",
      "                                            ",
      "                                            ",
      "                                            ",
      "                                            ",
      "                                            ",
      "                                            ",
      "                                            ",
    ];

    var RIGHT_ROWS = [
      "                                            ",
      "                                            ",
      "                                            ",
      "                                            ",
      "                                            ",
      "                                            ",
      "                                            ",
      "                                            ",
      "                                            ",
      "                                           :",
      "                                  .  ·®§†©§§",
      "                             (≤≥≠™™°≤¶≈+>:;:",
      "                          ,√≠÷‡≈~~-:<?}=><;]",
      "            ,√∏∏≥≈±|,±∫√≥°×!<;;^=;^::;\\>±×≤√",
      "        ,‡√≠¤§∏¬§°‡©°¶∑©÷!~!+?+!>?!»\\/!™≤§¶°",
      "      :≠≈∏)!:+»°:`->!;`!-<>!|-:!?;!>±©°¤\\∞∑≠",
      "      ]{)×‡°√®†¤‡™¤∑!`[!¶®¤™»-;!<;<»¤†©™¬®§¬",
      "       ¶§§¤¤¤®¤™¤™©§¤!≈/¬¶¶<-=+=!<>≥¶§‡†¶×«¶",
      "        ·.·,     ·;†¶©≈©††[>>«‡;<=)≥°¬§®¶°°™",
      "                    ;¤§™¬±-?{§¤÷[∞§¶¬†¬‡†¬¤°",
      "                    °¶™°:;=‡¤¤™¬¶¬¶®†‡¤§¤¤¬§",
      "                  ;≤‡\\+>]†¶¤‡¤‡†°§¬®¶§™¶†°†¤",
      "                 ≈‡®|{≤¤‡¤‡®¤‡°©™¬¶§©†¶¶®;  ",
      "                :©};!≈≈®¤‡™``§®¤†®¤¶‡©§»    ",
      "                :≠∞±∏∑†®∫™‡™+=™®=®¶°©©.     ",
      "                 ?®¬¬¶†>∫¤©§¤°\\©¤≈§‡\\^      ",
      "                  ×(†‡±¶©¤°÷≠¶¤†§™^         ",
      "                 .∏\\©‡}©¶√∑®¬§÷             ",
      "                  ≤¬®‡∫≥‡.™‡¤¤              ",
      "                 .)¤†≈°†≈,¤™¶∞              ",
      "                  |]‡×¬¬ ·∞+¶¬              ",
      "                  \\\\©±≤®  »>°×              ",
      "                  ∑‡¬¶™∞  ≈†§               ",
      "                  ·· ··                     ",
    ];

    function makeResult(rows) {
      var lines = [], poolGrid = [];
      for (var y = 0; y < rows.length; y++) {
        var line = rows[y], poolRow = [];
        for (var x = 0; x < line.length; x++) poolRow.push(line.charAt(x) === ' ' ? 0 : 3);
        lines.push(line);
        poolGrid.push(poolRow);
      }
      return { text: lines.join('\n'), lines: lines, poolGrid: poolGrid };
    }

    function renderPre(pre, rows) {
      var result = makeResult(rows);
      pre.textContent = result.text;
      attachDissolve(pre, result, rows[0].length);
    }
    renderPre(leftPre, LEFT_ROWS);
    renderPre(rightPre, RIGHT_ROWS);

    /* Idle "electric charge" between the hands: a slow shimmer wave sweeps
       through the glyphs (dim → base → bright + accent glow), pausing while
       the cursor dissolve owns the element. Runs only while the footer is
       on screen (setupFooter toggles footer.style.visibility). */
    var footerEl = document.getElementById('footer');
    function esc(ch) {
      if (ch === '<') return '&lt;';
      if (ch === '>') return '&gt;';
      if (ch === '&') return '&amp;';
      return ch;
    }
    var shimmerEls = [];
    function startShimmer(pre, rows, phase) {
      var grid = rows.map(function (l) { return l.split(''); });
      shimmerEls.push({ pre: pre, grid: grid, rows: grid.length, cols: grid[0].length, phase: phase });
    }
    startShimmer(leftPre, LEFT_ROWS, 0);
    startShimmer(rightPre, RIGHT_ROWS, 2.1);

    function shimmerTick(now) {
      requestAnimationFrame(shimmerTick);
      if (!footerEl || footerEl.style.visibility !== 'visible') return;
      var t = now * 0.001;
      for (var s = 0; s < shimmerEls.length; s++) {
        var el = shimmerEls[s];
        if (el.pre.__dissolveBusy) continue;
        var html = '';
        for (var y = 0; y < el.rows; y++) {
          for (var x = 0; x < el.cols; x++) {
            var ch = el.grid[y][x];
            if (ch === ' ') { html += ' '; continue; }
            var v = (Math.sin(0.55 * x - t * 2.2 + el.phase + 1.4 * Math.sin(0.18 * y + t * 0.5)) + 1) / 2;
            if (v > 0.86) html += '<span style="color:rgba(var(--acc-rgb),1);text-shadow:0 0 8px rgba(var(--acc-rgb),0.75)">' + esc(ch) + '</span>';
            else if (v < 0.18) html += '<span style="color:rgba(var(--acc-rgb),0.3)">' + esc(ch) + '</span>';
            else html += esc(ch);
          }
          html += '\n';
        }
        el.pre.innerHTML = html;
      }
    }
    requestAnimationFrame(shimmerTick);

    /* Mouse-dissolve hover — chars near the cursor churn through the
       INVERTED glyph pool, highlighted, then settle back (reference
       behaviour, rAF-throttled instead of repainting on every mousemove). */
    function attachDissolve(preEl, result, cols) {
      var POOLS = window.Art.ASCII_POOLS;
      var rows = result.poolGrid.length;
      var origLines = result.lines;
      var origGrid = result.lines.map(function (l) { return l.split(''); });
      var noise = [], hitTime = [], cellDuration = [];
      var radius = 2.5;
      var mxC = -1000, myC = -1000;
      var animating = false;

      for (var ny = 0; ny < rows; ny++) {
        var nr = [], ht = [], cd = [];
        for (var nx = 0; nx < cols; nx++) {
          var h = (Math.sin(nx * 12.9898 + ny * 78.233) * 43758.5453 % 1 + 1) % 1;
          nr.push(h * 5 - 2.5);
          ht.push(0); cd.push(h > 0.5 ? 200 : 100);
        }
        noise.push(nr); hitTime.push(ht); cellDuration.push(cd);
      }

      /* re-render (theme switch) replaces the previous system */
      if (preEl.__dissolveMove) preEl.removeEventListener('mousemove', preEl.__dissolveMove);
      if (preEl.__dissolveLeave) preEl.removeEventListener('mouseleave', preEl.__dissolveLeave);
      var gen = (preEl.__dissolveGen || 0) + 1;
      preEl.__dissolveGen = gen;

      preEl.__dissolveMove = function (e) {
        var rect = preEl.getBoundingClientRect();
        var charW = rect.width / cols;
        var charH = rect.height / rows;
        mxC = (e.clientX - rect.left) / charW;
        myC = (e.clientY - rect.top) / charH;
        var now = performance.now();
        var maxR = radius + 3;
        var yMin = Math.max(0, Math.floor(myC - maxR));
        var yMax = Math.min(rows - 1, Math.ceil(myC + maxR));
        var xMin = Math.max(0, Math.floor(mxC - maxR));
        var xMax = Math.min(cols - 1, Math.ceil(mxC + maxR));
        for (var y = yMin; y <= yMax; y++) {
          for (var x = xMin; x <= xMax; x++) {
            var dx = x - mxC, dy = y - myC;
            if (dx * dx + dy * dy < (radius + noise[y][x]) * (radius + noise[y][x])) {
              hitTime[y][x] = now;
            }
          }
        }
        if (!animating) { animating = true; requestAnimationFrame(tick); }
      };

      preEl.__dissolveLeave = function () { mxC = -1000; myC = -1000; };
      preEl.addEventListener('mousemove', preEl.__dissolveMove);
      preEl.addEventListener('mouseleave', preEl.__dissolveLeave);

      function esc(ch) {
        if (ch === '<') return '&lt;';
        if (ch === '>') return '&gt;';
        if (ch === '&') return '&amp;';
        return ch;
      }

      function tick() {
        if (preEl.__dissolveGen !== gen) return; /* superseded */
        var now = performance.now();
        var anyActive = false;
        var html = '';
        for (var y = 0; y < rows; y++) {
          for (var x = 0; x < cols; x++) {
            var pi = result.poolGrid[y][x];
            if (pi < 0) { html += ' '; continue; }
            if (pi === 0) { html += ' '; continue; }
            var elapsed = now - hitTime[y][x];
            if (hitTime[y][x] > 0 && elapsed < cellDuration[y][x]) {
              anyActive = true;
              var idx = (POOLS.length - 1) - pi;
              var pool = POOLS[idx];
              var ch = pool[Math.floor(Math.random() * pool.length)];
              html += '<span style="color:#0a0a0a;background:var(--acc)">' + esc(ch) + '</span>';
            } else {
              html += esc(origGrid[y][x]);
            }
          }
          html += '\n';
        }
        preEl.innerHTML = html;
        preEl.__dissolveBusy = anyActive;
        if (anyActive) {
          requestAnimationFrame(tick);
        } else {
          animating = false;
          preEl.textContent = origLines.join('\n');
        }
      }
    }

  })();

  /* =========================================================
     ACCENT — one fixed red-orange, shared by CSS, the canvas
     painters and the WebGL hero shader.
     ========================================================= */
  var ACCENT = [255, 77, 0];
  window.Art.setTheme(ACCENT);
  window.__themeAccent = ACCENT.slice();

  /* =========================================================
     MASTER INTRO TIMELINE
     ========================================================= */
  gsap.set(pLogo, { opacity: 1 });
  gsap.set(pFirst, { opacity: 1 });
  gsap.set(pLast, { opacity: 1 });
  gsap.set(allRevealEls, { yPercent: 110 });
  gsap.set(pDot, { opacity: 0 });
  gsap.set([pContent, tPanelRed, tPanelDark], { willChange: 'transform' });

  var master = gsap.timeline({ delay: 0.2 });

  master
    .add(function () {
      layoutNames();
      gsap.set(pContent, { x: -(getTotalWidth() / 2 - pLogo.offsetWidth / 2) });
      gsap.set(pFirst, { x: 0 });
    })
    .to(allRevealEls, {
      yPercent: 0, duration: 0.4, ease: 'power3.out',
      stagger: { each: 0.025, from: 'center' }
    })
    .add(function () { layoutNames(); })
    .to(pDot, { opacity: 1, duration: 0.25, ease: 'power2.out' })
    .add(function () {
      startHeroArt();
      ['hero-tagline', 'hero-status', 'hero-bar', 'hero-line'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.style.willChange = 'opacity, clip-path, transform';
      });
    })
    .to({}, { duration: 0.3 })
    .add(function () {
      var mobile = isMobileViewport();
      var pad = mobile ? 20 : 48;
      var currentW = getTotalWidth();
      var viewportSize = getViewportSize();
      var targetW = viewportSize.width - pad * 2;
      var scale = targetW / currentW;

      var visualCenterX = getTotalWidth() / 2;
      var visualCenterY = pContent.offsetHeight / 2;
      gsap.set(pContent, { transformOrigin: visualCenterX + 'px ' + visualCenterY + 'px' });

      var vh = viewportSize.height;
      var bottomPad = mobile ? Math.max(vh * 0.18, 110) : 80;
      var targetBottom = vh - bottomPad;
      var contentRect = pContent.getBoundingClientRect();
      var curVisualCenterY = contentRect.top + visualCenterY;
      var targetVisualCenterY = targetBottom - (pContent.offsetHeight * scale / 2);
      var deltaY = targetVisualCenterY - curVisualCenterY;
      var baseFontSize = parseFloat(getComputedStyle(pLogo).fontSize);
      var newFontSize = baseFontSize * scale;

      var applyFinalState = function () {
        pContent.style.visibility = 'hidden';
        gsap.set(pContent, { scale: 1, x: 0, y: 0 });
        gsap.set(nameLayer, { mixBlendMode: 'difference' });
        var vwSize = (newFontSize / viewportSize.width) * 100;
        [pLogo, pFirst, pLast, pDot].forEach(function (el) { el.style.fontSize = vwSize + 'vw'; });
        void pContent.offsetWidth;
        placeIntroNameAtBottom();
        keepIntroNameAnchored = true;
        pContent.style.visibility = 'visible';
      };

      if (prefersReducedMotion) { applyFinalState(); return; }

      gsap.to(pContent, {
        scale: scale, y: '+=' + deltaY, duration: 0.75, ease: 'power3.inOut',
        onComplete: function () { requestAnimationFrame(applyFinalState); }
      });
    })
    .to(tPanelDark, { y: '0%', duration: 0.45, ease: 'power3.inOut' }, '<+=0.05')
    .to(tPanelRed, { y: '0%', duration: 0.45, ease: 'power3.inOut' }, '-=0.3')
    .set(introBg, { display: 'none' })
    .set(hero, { opacity: 1 })
    .to(tPanelRed, { y: '-100%', duration: 0.55, ease: 'power3.inOut' }, '+=0.05')
    .to(tPanelDark, { y: '-100%', duration: 0.55, ease: 'power3.inOut' }, '-=0.4')
    .to('#hero-tagline', { opacity: 1, clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'power3.inOut' }, '-=0.2')
    .to('#hero-status', { opacity: 1, clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'power3.inOut' }, '<+=0.1')
    .to('#hero-bar', { opacity: 1, clipPath: 'inset(0 0 0% 0)', duration: 1.0, ease: 'power3.inOut' }, '-=0.8')
    .fromTo('#hero-line', { opacity: 1, scaleX: 0 }, { scaleX: 1, duration: 1.0, ease: 'power3.inOut' }, '<')
    .add(function () {
      document.querySelectorAll('.ch-top').forEach(function (el) { el.style.willChange = 'clip-path'; });
      chrHoverTl.play();
    }, '-=0.8')
    .add(function () { document.body.classList.add('intro-done'); });

  /* ---------------- Lenis smooth scroll ---------------- */
  var lenis = new Lenis({ lerp: 0.06 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
  lenis.scrollTo(0, { immediate: true });
  window.__lenis = lenis; /* exposed for debugging/testing */

  var revealSetupStarted = false;

  master.add(function () {
    unlockScroll();
    lenis.start();
    lenis.scrollTo(0, { immediate: true });

    allRevealEls.forEach(function (ch) { ch.style.willChange = 'auto'; });
    gsap.set([pContent, tPanelRed, tPanelDark], { willChange: 'auto' });

    var tPanel = document.getElementById('transition-panel');
    if (tPanel) tPanel.remove();
    var iBg = document.getElementById('intro-bg');
    if (iBg) iBg.remove();

    requestAnimationFrame(function () {
      if (revealSetupStarted) return;
      revealSetupStarted = true;
      setupScrollReveal();
    });
  });

  if (prefersReducedMotion) {
    master.progress(1);
    master.pause();
    lenis.scrollTo(0, { immediate: true });
    _forceScrollTop();
    requestAnimationFrame(function () { _forceScrollTop(); ScrollTrigger.refresh(); });
  }

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && master.progress() < 1) master.progress(1);
  });

  /* =========================================================
     SCROLL-DRIVEN HERO REVEAL
     ========================================================= */
  function setupScrollReveal() {
    if (nameAnchorRaf) { cancelAnimationFrame(nameAnchorRaf); nameAnchorRaf = 0; }
    [pContent, pLogo, pFirst, pLast, pDot].forEach(function (el) { gsap.killTweensOf(el); });

    var revealWrap = document.getElementById('reveal-image-wrap');
    var revealSeq = document.querySelectorAll('.reveal-seq');
    var canvas = document.getElementById('reveal-canvas');
    var ctx = canvas.getContext('2d');

    /* phrase chars */
    var phraseEl = document.getElementById('reveal-phrase');
    var phraseHTML = phraseEl.innerHTML;
    phraseEl.innerHTML = '';
    // rebuild keeping the .acc span: split into per-char spans
    (function buildPhrase() {
      var tmp = document.createElement('div');
      tmp.innerHTML = phraseHTML;
      var frag = document.createDocumentFragment();
      function addChars(text, acc) {
        Array.from(text).forEach(function (ch) {
          var s = document.createElement('span');
          s.className = 'rp-char' + (acc ? ' acc' : '');
          s.style.display = 'inline-block';
          s.textContent = ch === ' ' ? '\u00A0' : ch;
          frag.appendChild(s);
        });
      }
      tmp.childNodes.forEach(function (node) {
        if (node.nodeType === 3) addChars(node.textContent, false);
        else if (node.nodeType === 1) addChars(node.textContent, true);
      });
      phraseEl.appendChild(frag);
    })();
    var phraseChars = phraseEl.querySelectorAll('.rp-char');
    gsap.set(phraseChars, isMobile ? { opacity: 0 } : { opacity: 0, filter: 'blur(10px)' });

    /* frame sequence = REAL project screenshots played as a filmstrip
       (Web Usage → Stock → BootUp → Calm Canvas, looping). Procedural
       covers remain only as instant fallback while JPEGs decode. */
    var REEL = ['webusage-dashboard.jpg', 'stock-signin.jpg', 'bootup-placeholder.jpg', 'calmcanvas-home.jpg'];
    var TOTAL_FRAMES = 24;
    var frameKinds = [];
    var frameSrcs = [];
    for (var f = 0; f < TOTAL_FRAMES; f++) {
      frameKinds.push(f % 6);
      frameSrcs.push(SHOTS + REEL[f % REEL.length]);
    }
    var drawnIdx = -1;
    var reelImgs = new Array(TOTAL_FRAMES);
    frameSrcs.forEach(function (src, i) {
      var im = new Image();
      im.onload = function () {
        reelImgs[i] = im;
        if (drawnIdx === i) { var d = drawnIdx; drawnIdx = -1; drawFrame(d); }
      };
      im.src = src;
    });

    canvas.style.willChange = 'transform';

    function resizeCanvas() {
      var dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      if (drawnIdx >= 0) { var i = drawnIdx; drawnIdx = -1; drawFrame(i); }
    }
    function drawFrame(i) {
      if (i === drawnIdx) return;
      if (i < 0 || i >= frameSrcs.length) return;
      var img = reelImgs[i] || getCover(frameKinds[i]);
      var cw = canvas.width, ch = canvas.height;
      var iw = img.width, ih = img.height;
      var s = Math.max(cw / iw, ch / ih);
      var dw = iw * s, dh = ih * s;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - dw) * 0.5, (ch - dh) * 0.5, dw, dh);
      drawnIdx = i;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    drawFrame(0);      var introSettledY = Number(gsap.getProperty(pContent, 'y')) || 0;
    var introXvw = _introSettledXvw + 'vw';

    var scrollTl = gsap.timeline({ paused: true });

    scrollTl.fromTo(pContent, { x: introXvw, y: introSettledY }, { x: introXvw, y: 0, duration: 0.3, ease: 'none' }, 0);
    scrollTl.fromTo('#hero-tagline', { opacity: 1 }, { opacity: 0, duration: 0.15, ease: 'none' }, 0);
    scrollTl.fromTo('#hero-status', { opacity: 1 }, { opacity: 0, duration: 0.15, ease: 'none' }, 0);
    scrollTl.fromTo('#hero-bar', { opacity: 1 }, { opacity: 0, duration: 0.15, ease: 'none' }, 0);
    scrollTl.fromTo('#hero-line', { opacity: 1 }, { opacity: 0, duration: 0.15, ease: 'none' }, 0);

    scrollTl.fromTo(revealWrap, { opacity: 0 }, { opacity: 1, duration: 0.01 }, 0.3);
    scrollTl.fromTo(revealSeq, { scale: 0 }, { scale: 1, duration: 0.7, ease: 'none' }, 0.3);

    var mobile = isMobileViewport();
    var exitLeft = mobile ? '-35vw' : '-55vw';
    var exitRight = mobile ? '35vw' : '55vw';
    scrollTl.fromTo(pLogo, { x: '0vw', opacity: 1 }, { x: exitLeft, opacity: 0, duration: 0.7, ease: 'none' }, 0.3);
    scrollTl.fromTo(pFirst, { x: '0vw', opacity: 1 }, { x: exitLeft, opacity: 0, duration: 0.7, ease: 'none' }, 0.3);
    scrollTl.fromTo(pLast, { x: '0vw', opacity: 1 }, { x: exitRight, opacity: 0, duration: 0.7, ease: 'none' }, 0.3);
    scrollTl.fromTo(pDot, { x: '0vw', opacity: 1 }, { x: exitRight, opacity: 0, duration: 0.7, ease: 'none' }, 0.3);

    scrollTl.set(nameLayer, { autoAlpha: 0 }, 0.98);

    scrollTl.to(phraseChars, {
      opacity: 1,
      filter: 'blur(0px)',
      duration: 0.06, ease: 'none',
      stagger: { each: 0.007, from: 'start' }
    }, 0.62);

    var REVEAL_PHASE_START = 0.3;
    var REVEAL_PHASE_DURATION = 0.7;
    var FRAME_PROGRESS_AT_EXIT_START = 0.82;

    function drawFrameAtProgress(progress) {
      var clamped = Math.min(1, Math.max(0, progress));
      drawFrame(Math.round(clamped * (frameKinds.length - 1)));
    }

    ScrollTrigger.create({
      trigger: '#scroll-wrap',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      animation: scrollTl,
      onUpdate: function (self) {
        var p = self.progress;
        if (keepIntroNameAnchored && p > 0.001) stopIntroNameAnchor();
        if (p < REVEAL_PHASE_START) { drawFrameAtProgress(0); return; }
        var phase2 = Math.min(1, Math.max(0, (p - REVEAL_PHASE_START) / REVEAL_PHASE_DURATION));
        drawFrameAtProgress(phase2 * FRAME_PROGRESS_AT_EXIT_START);
      }
    });

    var revealOverlay = document.getElementById('reveal-overlay');
    var exitTl = gsap.timeline({ paused: true });
    exitTl.to(revealWrap, { y: '-50vh', ease: 'none', duration: 1 }, 0);
    exitTl.to(revealOverlay, { opacity: 0.7, ease: 'none', duration: 0.66 }, 0);
    if (!isMobile && (CSS.supports('backdrop-filter', 'blur(1px)') || CSS.supports('-webkit-backdrop-filter', 'blur(1px)'))) {
      gsap.set(revealOverlay, { backdropFilter: 'blur(0px)' });
      exitTl.to(revealOverlay, { backdropFilter: 'blur(16px)', ease: 'none', duration: 1 }, 0);
    }

    var phraseExitTl = gsap.timeline({ paused: true });
    phraseExitTl.to(phraseChars, {
      opacity: 0, duration: 0.2, ease: 'none', immediateRender: false,
      stagger: { each: 0.01, from: 'end' }
    });
    ScrollTrigger.create({
      trigger: '#section-after', start: 'top bottom', end: 'top top',
      scrub: true, animation: phraseExitTl
    });
    ScrollTrigger.create({
      trigger: '#section-after', start: 'top bottom', end: 'top top',
      scrub: true, animation: exitTl,
      onUpdate: function (self) {
        var exitFrameProgress = FRAME_PROGRESS_AT_EXIT_START + (self.progress * (1 - FRAME_PROGRESS_AT_EXIT_START));
        drawFrameAtProgress(exitFrameProgress);
      },
      onLeave: function () { drawFrameAtProgress(1); },
      onLeaveBack: function () { drawFrameAtProgress(FRAME_PROGRESS_AT_EXIT_START); }
    });

    setupAboutSection();
  }

  /* =========================================================
     ABOUT — word-by-word blur reveal + photo parallax
     ========================================================= */
  function wrapWords(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(function (node) {
      var words = node.textContent.split(/(\s+)/);
      var frag = document.createDocumentFragment();
      words.forEach(function (w) {
        if (/^\s+$/.test(w)) frag.appendChild(document.createTextNode(w));
        else if (w) {
          var span = document.createElement('span');
          span.className = 'word';
          span.textContent = w;
          frag.appendChild(span);
        }
      });
      node.parentNode.replaceChild(frag, node);
    });
  }

  function setupAboutSection() {
    var aboutText = document.getElementById('about-text');
    var aboutSub = document.getElementById('about-sub');
    var aboutVersion = document.querySelector('.about-version');
    var photoWrap = document.getElementById('about-photo-wrap');
    var photo = document.getElementById('about-photo');

    var versionSvg = aboutVersion.querySelector('svg');
    if (versionSvg) versionSvg.classList.add('word');

    wrapWords(aboutText);
    wrapWords(aboutVersion);

    var words = [].slice.call(aboutText.querySelectorAll('.word'))
      .concat([].slice.call(aboutVersion.querySelectorAll('.word')));

    if (isMobile) words.forEach(function (w) { w.style.filter = 'none'; });

    words.forEach(function (word) {
      gsap.to(word, {
        opacity: 1,
        filter: 'blur(0px)',
        ease: 'none',
        scrollTrigger: { trigger: word, start: 'top 78%', end: 'top 58%', scrub: true }
      });
    });

    gsap.set(aboutSub, isMobile ? { opacity: 0 } : { opacity: 0, filter: 'blur(12px)' });
    gsap.to(aboutSub, {
      opacity: 1, filter: 'blur(0px)', ease: 'none',
      scrollTrigger: { trigger: aboutSub, start: 'top 80%', end: 'top 60%', scrub: true }
    });

    function initPhotoScroll() {
      var tl = gsap.timeline({
        scrollTrigger: { trigger: photoWrap, start: 'top bottom', end: 'bottom top', scrub: true }
      });
      tl.fromTo(photo, { y: '-42%' }, { y: '42%', ease: 'none' }, 0);
      tl.fromTo(photo, { opacity: 0, filter: 'blur(20px)' }, { opacity: 1, filter: 'blur(0px)', ease: 'none', duration: 0.3 }, 0);
    }
    if (photo.decode) photo.decode().then(initPhotoScroll).catch(initPhotoScroll);
    else { photo.onload = initPhotoScroll; if (photo.complete) initPhotoScroll(); }

    setupProjectsSection();
  }

  /* =========================================================
     PROJECTS — sticky list, 3D preview, detail overlay
     ========================================================= */
  function setupProjectsSection() {
    var card = document.getElementById('proj-card');
    var cover = document.getElementById('proj-cover');
    var dateEl = document.getElementById('proj-date');
    var labelEl = document.getElementById('proj-label');
    var preview = document.getElementById('proj-preview');
    var currentIdx = -1;

    /* build preview card */
    card = document.createElement('div');
    card.className = 'proj-card';
    card.id = 'proj-card';
    card.innerHTML =
      '<div class="proj-meta"><span class="proj-label" id="proj-label"></span><span class="proj-date" id="proj-date"></span></div>' +
      '<img class="proj-cover" id="proj-cover" alt="" decoding="async">';
    preview.appendChild(card);
    cover = card.querySelector('#proj-cover');
    dateEl = card.querySelector('#proj-date');
    labelEl = card.querySelector('#proj-label');

    /* preload covers + project screenshot previews */
    ITEMS.forEach(function (item) {
      var img = new Image();
      img.src = retintCoverDataURL(Number(item.dataset.paint));
      var shots = PROJECT_SHOTS[item.dataset.id];
      if (shots && shots.length) new Image().src = SHOTS + shots[0];
    });

    /* preview cards + galleries use real app screenshots when available,
       falling back to the procedural cover artwork */
    function getPreviewSource(item) {
      var shots = PROJECT_SHOTS[item.dataset.id];
      return shots && shots.length ? SHOTS + shots[0] : retintCoverDataURL(Number(item.dataset.paint));
    }

    var projectsEl = document.getElementById('projects');
    var projectsVisible = false;
    ScrollTrigger.create({
      trigger: projectsEl, start: 'top 80%', end: 'bottom 20%',
      onEnter: function () { preview.classList.add('visible'); projectsVisible = true; },
      onLeave: function () { preview.classList.remove('visible'); projectsVisible = false; },
      onEnterBack: function () { preview.classList.add('visible'); projectsVisible = true; },
      onLeaveBack: function () { preview.classList.remove('visible'); projectsVisible = false; }
    });

    var itemQuickX = ITEMS.map(function (item) {
      return gsap.quickTo(item, 'x', { duration: 0.6, ease: 'power2.out' });
    });

    ITEMS.forEach(function (item, i) {
      item.addEventListener('click', function () {
        if (item.classList.contains('active')) { if (openProjectFn) openProjectFn(item.dataset.id, item); }
        else {
          activateProject(i);
          var docTop = 0, el = item;
          while (el) { docTop += el.offsetTop; el = el.offsetParent; }
          lenis.scrollTo(docTop - window.innerHeight / 2 + item.offsetHeight / 2, { duration: 1.2 });
        }
      });
    });
    cover.addEventListener('click', function () {
      if (currentIdx >= 0 && openProjectFn) openProjectFn(ITEMS[currentIdx].dataset.id, ITEMS[currentIdx]);
    });

    function onProjectsScroll() {
      if (!projectsVisible) { if (currentIdx >= 0) deactivateAll(); return; }
      var cy = window.innerHeight / 2;
      var halfH = window.innerHeight / 2;
      var closestIdx = -1, closestDist = Infinity;
      ITEMS.forEach(function (item, i) {
        var rect = item.getBoundingClientRect();
        var itemCy = rect.top + rect.height / 2;
        var dist = Math.abs(itemCy - cy);
        itemQuickX[i](Math.min(dist / halfH, 1) * 80);
        if (dist < closestDist) { closestDist = dist; closestIdx = i; }
      });
      if (closestIdx >= 0 && closestDist < window.innerHeight * 0.45) activateProject(closestIdx);
      else deactivateAll();
    }
    lenis.on('scroll', onProjectsScroll);
    onProjectsScroll();

    function deactivateAll() {
      if (currentIdx >= 0) ITEMS[currentIdx].classList.remove('active');
      currentIdx = -1;
      gsap.to(card, { opacity: 0, duration: 0.25, ease: 'power2.in' });
    }

    function activateProject(i) {
      if (i === currentIdx) return;
      if (currentIdx >= 0) ITEMS[currentIdx].classList.remove('active');
      ITEMS[i].classList.add('active');
      var item = ITEMS[i];
      if (currentIdx === -1) {
        cover.src = getPreviewSource(item);
        dateEl.textContent = item.dataset.date;
        labelEl.textContent = PROJECTS[item.dataset.id].category;
        gsap.to(card, { opacity: 1, duration: 0.4, ease: 'power2.out' });
      } else {
        gsap.to(card, {
          opacity: 0, duration: 0.18, ease: 'power2.in',
          onComplete: function () {
            cover.src = getPreviewSource(item);
            dateEl.textContent = item.dataset.date;
            labelEl.textContent = PROJECTS[item.dataset.id].category;
            gsap.to(card, { opacity: 1, duration: 0.3, ease: 'power2.out' });
          }
        });
      }
      currentIdx = i;
    }

    /* cursor + tilt */
    var projCursor = document.getElementById('proj-cursor');
    var qCursorX = gsap.quickTo(projCursor, 'left', { duration: 0.35, ease: 'power3.out' });
    var qCursorY = gsap.quickTo(projCursor, 'top', { duration: 0.35, ease: 'power3.out' });
    var _tiltTargetRY = 0, _tiltTargetRX = 0, _tiltRY = 0, _tiltRX = 0;
    var _detTiltTargetRY = 0, _detTiltTargetRX = 0, _detTiltRY = 0, _detTiltRX = 0;

    cover.addEventListener('mouseenter', function () { projCursor.classList.add('active'); });
    cover.addEventListener('mouseleave', function () { projCursor.classList.remove('active'); });

    var _cachedSelImg = null;

    document.addEventListener('mousemove', function (e) {
      if (projectsVisible) {
        qCursorX(e.clientX);
        qCursorY(e.clientY);
        var rect = card.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var ry = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width / 2)));
        var rx = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height / 2)));
        _tiltTargetRY = ry * 6;
        _tiltTargetRX = -rx * 5;
      }
      if (projectOpen && _cachedSelImg) {
        var sr = _cachedSelImg.getBoundingClientRect();
        var scx = sr.left + sr.width / 2;
        var scy = sr.top + sr.height / 2;
        var dry = Math.max(-1, Math.min(1, (e.clientX - scx) / (sr.width / 2)));
        var drx = Math.max(-1, Math.min(1, (e.clientY - scy) / (sr.height / 2)));
        _detTiltTargetRY = dry * 8;
        _detTiltTargetRX = -drx * 6;
      }
    });

    gsap.ticker.add(function () {
      if (projectsVisible) {
        _tiltRY += (_tiltTargetRY - _tiltRY) * 0.12;
        _tiltRX += (_tiltTargetRX - _tiltRX) * 0.12;
        card.style.transform = 'rotateY(' + _tiltRY.toFixed(2) + 'deg) rotateX(' + _tiltRX.toFixed(2) + 'deg)';
      }
      if (projectOpen && _cachedSelImg) {
        _detTiltRY += (_detTiltTargetRY - _detTiltRY) * 0.1;
        _detTiltRX += (_detTiltTargetRX - _detTiltRX) * 0.1;
        _cachedSelImg.style.transform = 'rotateY(' + _detTiltRY.toFixed(2) + 'deg) rotateX(' + _detTiltRX.toFixed(2) + 'deg)';
      }
    });

    /* slow lerp inside projects */
    ITEMS.forEach(function (item) {
      ScrollTrigger.create({
        trigger: item, start: 'top 52%', end: 'bottom 48%',
        onEnter: function () { lenis.options.lerp = 0.04; },
        onLeave: function () { lenis.options.lerp = 0.06; },
        onEnterBack: function () { lenis.options.lerp = 0.04; },
        onLeaveBack: function () { lenis.options.lerp = 0.06; }
      });
    });

    /* fluid line */
    var linePath = document.getElementById('fluid-line');
    var lineLen = linePath.getTotalLength();
    gsap.set(linePath, { strokeDasharray: lineLen, strokeDashoffset: lineLen });
    gsap.to(linePath, {
      strokeDashoffset: 0, ease: 'none',
      scrollTrigger: { trigger: '#projects', start: 'top 70%', end: 'bottom 20%', scrub: 1 }
    });

    setupCircleGallery();
    setupScrollTimeline();
    setupSkills();
    setupContact();
    setupFooter();
    setupProjectDetail();
    setupAwards();
  }

  /* =========================================================
     CIRCLE GALLERY — orbiting covers
     ========================================================= */
  function setupCircleGallery() {
    if (isMobileViewport()) return;

    /* build slices for the cylindrical bend */
    (function buildSlices() {
      var SLICES = 10;
      var vw = window.innerWidth;
      var imgW = Math.min(Math.max(140, vw * 0.15), 230);
      var imgH = imgW * 9 / 16; /* match .cg-img 16:9 frames (real screenshots are wide) */
      var orbitR = (vw * 0.34 + 500) / 2;
      var bendRad = imgW / orbitR;
      var cylR = orbitR;
      var sliceW = imgW / SLICES;
      var totalBendDeg = bendRad * 180 / Math.PI;
      var stepDeg = totalBendDeg / SLICES;

      document.querySelectorAll('.cg-img').forEach(function (div) {
        var paint = Number(div.dataset.paint);
        var shotFile = SHOT_BY_PAINT[paint];
        var src = shotFile ? SHOTS + shotFile : retintCoverDataURL(paint);
        var wrapper = document.createElement('div');
        wrapper.className = 'cg-img';
        for (var s = 0; s < SLICES; s++) {
          var sl = document.createElement('div');
          sl.className = 'cg-slice';
          var displayW = sliceW + 1.5;
          sl.style.width = displayW.toFixed(1) + 'px';
          sl.style.left = '50%';
          sl.style.marginLeft = (-displayW / 2).toFixed(1) + 'px';
          sl.style.backgroundImage = 'url(' + src + ')';
          sl.style.backgroundSize = imgW.toFixed(1) + 'px ' + imgH.toFixed(1) + 'px';
          sl.style.backgroundPosition = (-s * sliceW).toFixed(1) + 'px 0';
          sl.style.transformOrigin = '50% 50% ' + (-cylR).toFixed(1) + 'px';
          var angle = (s - (SLICES - 1) / 2) * stepDeg;
          sl.style.transform = 'rotateY(' + angle.toFixed(2) + 'deg)';
          wrapper.appendChild(sl);
        }
        div.parentNode.replaceChild(wrapper, div);
      });
    })();

    var cgImgs = gsap.utils.toArray('.cg-img');
    var cgPhrase = document.getElementById('cg-phrase');
    var count = cgImgs.length;

    (function wrapPhraseWords(el) {
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      var textNodes = [];
      while (walker.nextNode()) textNodes.push(walker.currentNode);
      textNodes.forEach(function (node) {
        var words = node.textContent.split(/(\s+)/);
        var frag = document.createDocumentFragment();
        words.forEach(function (w) {
          if (/^\s+$/.test(w)) frag.appendChild(document.createTextNode(w));
          else if (w) {
            var span = document.createElement('span');
            span.className = 'word';
            span.textContent = w;
            frag.appendChild(span);
          }
        });
        node.parentNode.replaceChild(frag, node);
      });
    })(cgPhrase);
    var cgPhraseWords = gsap.utils.toArray('#cg-phrase .word');

    var vw = window.innerWidth;
    var rx = vw * 0.34;
    var rz = 500;
    var tiltY = 180;
    var entryAngle = Math.PI / 2;
    var offX = vw * 0.85;

    function getPos(t) {
      if (t <= 0.12) {
        var p0 = t / 0.12;
        return { x: -offX * (1 - p0), y: tiltY, z: rz * p0, rotY: 0 };
      }
      if (t <= 0.88) {
        var p = (t - 0.12) / 0.76;
        var angle = entryAngle - p * Math.PI * 2;
        var x = Math.cos(angle) * rx;
        var z = Math.sin(angle) * rz;
        return { x: x, y: (z / rz) * tiltY, z: z, rotY: p * Math.PI * 2 };
      }
      var p2 = (t - 0.88) / 0.12;
      return { x: offX * p2, y: tiltY, z: rz * (1 - p2), rotY: Math.PI * 2 };
    }

    var stagger = 0.09;
    var totalRange = 1 + stagger * (count - 1);
    cgImgs.forEach(function (img) { img.style.opacity = '0'; });

    ScrollTrigger.create({
      trigger: '#circle-gallery',
      start: 'top top',
      end: 'bottom bottom',
      pin: '#circle-gallery-pin',
      onUpdate: function (self) {
        var progress = self.progress;
        cgImgs.forEach(function (img, i) {
          var imgT = progress * totalRange - i * stagger;
          if (imgT <= 0 || imgT >= 1) { img.style.opacity = '0'; return; }
          var alpha = 1;
          if (imgT < 0.06) alpha = imgT / 0.06;
          else if (imgT > 0.94) alpha = (1 - imgT) / 0.06;
          var pos = getPos(imgT);
          var rotDeg = (pos.rotY * 180 / Math.PI).toFixed(1);
          img.style.transform =
            'translate3d(' + pos.x.toFixed(1) + 'px,' + pos.y.toFixed(1) + 'px,' + pos.z.toFixed(1) + 'px)' +
            ' rotateY(' + rotDeg + 'deg)';
          img.style.opacity = alpha;
          img.style.zIndex = Math.round(pos.z + 600);
        });

        var phraseStart = 0.25, phraseEnd = 0.75, travelY = 200;
        if (progress < phraseStart || progress > phraseEnd) {
          cgPhrase.style.opacity = '0';
        } else {
          var globalP = (progress - phraseStart) / (phraseEnd - phraseStart);
          var yOffset = travelY * (0.5 - globalP);
          cgPhrase.style.transform = 'translateY(' + yOffset.toFixed(1) + 'px)';
          var revealEnd = 0.4;
          cgPhraseWords.forEach(function (w, wi) {
            if (globalP < revealEnd) {
              var revealP = globalP / revealEnd;
              var wordT = revealP * (cgPhraseWords.length + 4) - wi;
              var wP = Math.max(0, Math.min(1, wordT / 3));
              w.style.opacity = wP;
              w.style.filter = 'blur(' + (8 * (1 - wP)).toFixed(1) + 'px)';
            } else {
              w.style.opacity = '1';
              w.style.filter = 'blur(0px)';
            }
          });
          var alpha = 1;
          if (globalP < 0.1) alpha = globalP / 0.1;
          else if (globalP > 0.75) alpha = (1 - globalP) / 0.25;
          cgPhrase.style.opacity = alpha;
        }
      }
    });
  }

  /* =========================================================
     SCROLL TIMELINE HUD
     ========================================================= */
  function setupScrollTimeline() {
    var timeline = document.getElementById('scroll-timeline');
    var bar = document.getElementById('st-bar');
    var label = document.getElementById('st-label');
    var pctEl = document.getElementById('scroll-pct');

    var sections = [
      { id: 'about', name: 'About' },
      { id: 'projects', name: 'Projects' },
      { id: 'circle-gallery', name: 'Gallery' },
      { id: 'skills', name: 'Skills' },
      { id: 'awards', name: 'Awards' },
      { id: 'contact', name: 'Contact' }
    ].filter(function (sec) {
      if (sec.id === 'circle-gallery' && isMobileViewport()) return false;
      return !!document.getElementById(sec.id);
    });

    var scrollY0 = window.scrollY || window.pageYOffset;
    var zoneTop = document.getElementById(sections[0].id).getBoundingClientRect().top + scrollY0;
    var lastEl = document.getElementById(sections[sections.length - 1].id);
    var zoneBottom = lastEl.getBoundingClientRect().top + lastEl.offsetHeight + scrollY0;
    var zoneH = zoneBottom - zoneTop;

    var segEls = [];
    sections.forEach(function (sec) {
      var el = document.getElementById(sec.id);
      var elTop = el.getBoundingClientRect().top + scrollY0;
      sec.top = elTop;
      sec.bottom = elTop + el.offsetHeight;
      sec.ratio = el.offsetHeight / zoneH;

      var seg = document.createElement('div');
      seg.className = 'st-seg';
      seg.style.flex = sec.ratio.toFixed(4);
      seg.title = sec.name;
      var fill = document.createElement('div');
      fill.className = 'st-seg-fill';
      seg.appendChild(fill);
      bar.appendChild(seg);
      seg.addEventListener('click', (function (targetId) {
        return function () {
          var target = document.getElementById(targetId);
          if (!target) return;
          lenis.scrollTo(target, { offset: 0, duration: 1.2 });
        };
      })(sec.id));
      segEls.push({ seg: seg, fill: fill });
    });

    ScrollTrigger.create({
      trigger: '#' + sections[0].id,
      start: 'top bottom',
      endTrigger: '#' + sections[sections.length - 1].id,
      end: 'bottom bottom',
      onUpdate: function (self) {
        var progress = self.progress;
        var docH = document.documentElement.scrollHeight - window.innerHeight;
        var pageP = docH > 0 ? Math.round((window.scrollY / docH) * 100) : 0;
        pctEl.textContent = '(' + pageP + ')';

        if (progress <= 0 || progress >= 0.90) {
          timeline.classList.remove('visible');
          pctEl.classList.remove('visible');
          return;
        }
        timeline.classList.add('visible');
        pctEl.classList.add('visible');

        var activeIdx = 0;
        var cumul = 0;
        for (var i = 0; i < sections.length; i++) {
          var segStart = cumul;
          var segEnd = cumul + sections[i].ratio;
          if (progress < segEnd) {
            var inner = (progress - segStart) / sections[i].ratio;
            segEls[i].fill.style.height = (Math.min(1, Math.max(0, inner)) * 100).toFixed(1) + '%';
            activeIdx = i;
            for (var j = i + 1; j < sections.length; j++) segEls[j].fill.style.height = '0%';
            break;
          } else {
            segEls[i].fill.style.height = '100%';
          }
          cumul = segEnd;
        }
        label.textContent = sections[activeIdx].name;
        label.style.top = (progress * 100).toFixed(1) + '%';
      }
    });
  }

  /* =========================================================
     SKILLS — accordion + traveling arrow
     ========================================================= */
  function setupSkills() {
    var groups = document.querySelectorAll('.skill-group');

    var firstBody = groups[0].querySelector('.skill-body');
    firstBody.style.height = firstBody.scrollHeight + 'px';

    groups.forEach(function (group) {
      group.querySelector('.skill-header').addEventListener('click', function () {
        if (group.classList.contains('open')) return;
        groups.forEach(function (g) {
          if (g.classList.contains('open')) {
            g.classList.remove('open');
            var body = g.querySelector('.skill-body');
            gsap.to(body, { height: 0, duration: 0.45, ease: 'power3.inOut' });
          }
        });
        group.classList.add('open');
        var body2 = group.querySelector('.skill-body');
        gsap.to(body2, {
          height: body2.scrollHeight, duration: 0.45, ease: 'power3.inOut',
          onComplete: function () { ScrollTrigger.refresh(); }
        });
      });
    });

    /* skills-text words reveal */
    var skillsText = document.getElementById('skills-text');
    if (skillsText) {
      wrapWords(skillsText);
      gsap.utils.toArray('#skills-text .word').forEach(function (word) {
        gsap.to(word, {
          opacity: 1, filter: 'blur(0px)', ease: 'none',
          scrollTrigger: { trigger: word, start: 'top 82%', end: 'top 62%', scrub: true }
        });
      });
      gsap.set('#skills-text .word', { opacity: 0, filter: 'blur(8px)' });
    }

    /* arrow travels right across the skills+contact zone */
    var arrow = document.getElementById('skills-arrow');
    if (arrow) {
      gsap.fromTo(arrow, { xPercent: 0 }, {
        xPercent: 100,
        x: function () {
          var left = arrow.parentElement;
          var pad = parseFloat(getComputedStyle(left).paddingLeft) + parseFloat(getComputedStyle(left).paddingRight);
          return left.clientWidth - pad - arrow.offsetWidth;
        },
        ease: 'none',
        scrollTrigger: {
          trigger: '#skills', start: 'top top',
          endTrigger: '#contact', end: 'top center', scrub: 0.5
        }
      });
    }
  }

  /* =========================================================
     CONTACT — blob + flying frames
     ========================================================= */
  function setupContact() {
    var blobWrap = document.getElementById('contact-blob-wrap');
    var blob = document.getElementById('contact-blob');
    var title = document.getElementById('contact-title');
    var socials = document.getElementById('contact-socials');
    var mailEl = document.getElementById('contact-mail');
    var frame = document.getElementById('contact-frame');
    var frameImg = document.getElementById('contact-frame-img');
    var dispo = document.getElementById('contact-dispo');
    var frame2 = document.getElementById('contact-frame-2');
    var frameImg2 = document.getElementById('contact-frame-img-2');
    var dispo2 = document.getElementById('contact-dispo-2');
    var stTimeline = document.getElementById('scroll-timeline');
    var pctEl = document.getElementById('scroll-pct');
    if (!blob) return;

    var contactBg = document.getElementById('contact-bg');

    ScrollTrigger.create({
      trigger: '#contact',
      start: 'top bottom',
      endTrigger: '#footer-transition',
      end: 'bottom bottom',
      onEnter: function () { blobWrap.style.visibility = 'visible'; contactBg.style.display = 'block'; },
      onLeave: function () { blobWrap.style.visibility = 'hidden'; contactBg.style.display = 'none'; },
      onLeaveBack: function () { blobWrap.style.visibility = 'hidden'; contactBg.style.display = 'none'; },
      onEnterBack: function () { blobWrap.style.visibility = 'visible'; contactBg.style.display = 'block'; }
    });
    blobWrap.style.visibility = 'hidden';

    var tl = gsap.timeline({
      scrollTrigger: { trigger: '#contact', start: 'top bottom', end: 'bottom bottom', scrub: true }
    });

    tl.fromTo(blob, { scale: 0 }, { scale: 1, duration: 0.6, ease: 'none' }, 0);
    tl.to([stTimeline, pctEl], { opacity: 0, duration: 0.08 }, 0.1);

    gsap.set(title, { yPercent: 0, x: function () { return window.innerWidth * 1.1; } });
    tl.to(title, { x: 0, duration: 0.3, ease: 'power3.out' }, 0.18);

    tl.fromTo(socials, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.2, ease: 'none' }, 0.28);
    tl.fromTo(mailEl, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.2, ease: 'none' }, 0.36);

    var pairStart = 0.22;
    var frameDur = 0.65;
    var frameY = function () { return window.innerHeight * 1.1; };
    var frameYEnd = function () { return -window.innerHeight * 1.4; };

    gsap.set(frame, { yPercent: -50, y: frameY() });
    gsap.set(frameImg, { yPercent: -30 });
    tl.to(frame, { y: frameYEnd(), duration: frameDur, ease: 'none' }, pairStart);
    tl.to(frameImg, { yPercent: 30, duration: frameDur, ease: 'none' }, pairStart);
    gsap.set(dispo, { yPercent: -50, y: frameY(), opacity: 1, clipPath: 'inset(0% 0 0% 0)' });
    tl.to(dispo, { y: frameYEnd(), duration: frameDur, ease: 'none' }, pairStart);
    tl.to(dispo, { opacity: 0, clipPath: 'inset(100% 0 0% 0)', duration: 0.15, ease: 'power2.in' }, pairStart + 0.45);

    gsap.set(frame2, { yPercent: -50, y: window.innerHeight * 1.3 });
    gsap.set(frameImg2, { yPercent: -30 });
    tl.to(frame2, { y: frameYEnd(), duration: frameDur, ease: 'none' }, pairStart + 0.07);
    tl.to(frameImg2, { yPercent: 30, duration: frameDur, ease: 'none' }, pairStart + 0.07);
    gsap.set(dispo2, { yPercent: -50, y: frameY(), opacity: 1, clipPath: 'inset(0% 0 0% 0)' });
    tl.to(dispo2, { y: frameYEnd(), duration: frameDur, ease: 'none' }, pairStart);
    tl.to(dispo2, { opacity: 0, clipPath: 'inset(100% 0 0% 0)', duration: 0.15, ease: 'power2.in' }, pairStart + 0.45);
  }

  /* =========================================================
     FOOTER — ascii parallax + char roll-up name
     ========================================================= */
  function setupFooter() {
    var asciiLeftWrap = document.querySelector('.footer-ascii.left');
    var asciiRightWrap = document.querySelector('.footer-ascii.right');
    if (asciiLeftWrap && asciiRightWrap) {
      gsap.fromTo(asciiLeftWrap, { xPercent: -100 }, {
        xPercent: 0, ease: 'none',
        scrollTrigger: { trigger: '#footer-transition', start: 'top bottom+=500', end: 'bottom bottom', scrub: true }
      });
      gsap.fromTo(asciiRightWrap, { xPercent: 100 }, {
        xPercent: 0, ease: 'none',
        scrollTrigger: { trigger: '#footer-transition', start: 'top bottom+=500', end: 'bottom bottom', scrub: true }
      });
    }

    var asciiLeftPre = document.getElementById('ascii-left');
    var asciiRightPre = document.getElementById('ascii-right');
    var mx = 0, my = 0, sx = 0, sy = 0;
    var footerVisible = false;
    document.addEventListener('mousemove', function (e) {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    function parallaxLoop() {
      if (!footerVisible) return;
      sx += (mx - sx) * 0.05;
      sy += (my - sy) * 0.05;
      var lx = Math.min(0, sx * -15 - 15);
      var rx = Math.max(0, sx * 15 + 15);
      var py = sy * -10;
      if (asciiLeftPre) asciiLeftPre.style.transform = 'translate(' + lx + 'px,' + py + 'px)';
      if (asciiRightPre) asciiRightPre.style.transform = 'translate(' + rx + 'px,' + py + 'px)';
      requestAnimationFrame(parallaxLoop);
    }

    /* footer name char roll-up */
    (function () {
      function rebuildChars(el) {
        var text = el.textContent;
        el.textContent = '';
        var inners = [];
        for (var i = 0; i < text.length; i++) {
          var outer = document.createElement('span');
          outer.style.display = 'inline-block';
          outer.style.overflow = 'hidden';
          outer.style.verticalAlign = 'top';
          outer.style.padding = '0.1em 0.3em';
          outer.style.margin = '-0.1em -0.3em';
          var inner = document.createElement('span');
          inner.style.display = 'inline-block';
          inner.style.willChange = 'transform';
          inner.textContent = text[i];
          outer.appendChild(inner);
          el.appendChild(outer);
          inners.push(inner);
        }
        return inners;
      }
      var firstEl = document.getElementById('footer-name-first');
      var lastEl = document.getElementById('footer-name-last');
      var dotEl = document.getElementById('footer-name-dot');
      if (!firstEl || !lastEl) return;

      var firstCharsF = rebuildChars(firstEl);
      var dotChars = dotEl ? rebuildChars(dotEl) : [];
      /* last element contains the dot span; rebuild only its text node part */
      var lastText = 'arayanaswamyC';
      lastEl.textContent = '';
      var lastCharsF = [];
      for (var i = 0; i < lastText.length; i++) {
        var outer = document.createElement('span');
        outer.style.display = 'inline-block';
        outer.style.overflow = 'hidden';
        outer.style.verticalAlign = 'top';
        outer.style.padding = '0.1em 0.3em';
        outer.style.margin = '-0.1em -0.3em';
        var inner = document.createElement('span');
        inner.style.display = 'inline-block';
        inner.style.willChange = 'transform';
        inner.textContent = lastText[i];
        outer.appendChild(inner);
        lastEl.appendChild(outer);
        lastCharsF.push(inner);
      }
      if (dotEl) lastEl.appendChild(dotEl);

      var ordered = [];
      var firstRev = firstCharsF.slice().reverse();
      var rightSide = lastCharsF.concat(dotChars);
      var maxLen = Math.max(firstRev.length, rightSide.length);
      for (var k = 0; k < maxLen; k++) {
        if (rightSide[k]) ordered.push(rightSide[k]);
        if (firstRev[k]) ordered.push(firstRev[k]);
      }

      gsap.set(ordered, { yPercent: 110 });
      gsap.to(ordered, {
        yPercent: 0, ease: 'power3.out',
        stagger: { each: 0.04, from: 'start' },
        scrollTrigger: { trigger: '#footer-transition', start: 'center bottom+=200', end: 'bottom bottom', scrub: true }
      });
    })();

    var footerEl = document.getElementById('footer');
    ScrollTrigger.create({
      trigger: '#footer-transition',
      start: 'top bottom+=200',
      end: 'bottom bottom',
      onEnter: function () { footerEl.style.visibility = 'visible'; footerVisible = true; parallaxLoop(); },
      onEnterBack: function () { footerVisible = true; parallaxLoop(); },
      onLeaveBack: function () { footerEl.style.visibility = 'hidden'; footerVisible = false; }
    });

    var contactPin = document.getElementById('contact-pin');
    var contactBgEl = document.getElementById('contact-bg');
    var contactSection = document.getElementById('contact');
    var ctTitle = document.getElementById('contact-title');
    var ctSocials = document.getElementById('contact-socials');
    var ctMail = document.getElementById('contact-mail');

    var blobWrap = document.getElementById('contact-blob-wrap');

    var ftl = gsap.timeline({
      scrollTrigger: {
        trigger: '#footer-transition',
        start: 'top bottom+=250',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: function (self) {
          var p = self.progress;
          if (p > 0.2) {
            contactBgEl.style.display = 'none';
            contactSection.style.pointerEvents = 'none';
          } else {
            contactBgEl.style.display = 'block';
            contactSection.style.pointerEvents = '';
          }
        }
      }
    });

    ftl.set(blobWrap, { height: '112vh', overflow: 'hidden' }, 0);
    ftl.to(blobWrap, { borderRadius: '0 0 50px 50px', duration: 0.15, ease: 'power2.out' }, 0);
    ftl.to(blobWrap, { y: function () { return -(window.innerHeight * 1.7 + 400); }, immediateRender: false, duration: 0.85, ease: 'power2.in' }, 0);
    ftl.to(blobWrap, { opacity: 0, duration: 0.12, ease: 'none' }, 0.5);

    ftl.set(contactPin, { y: '-40vh', pointerEvents: 'none', immediateRender: false, duration: 1.0, ease: 'none' }, 0);
    ftl.fromTo([ctSocials, ctMail], { clipPath: 'inset(0 0 0% 0)' }, { clipPath: 'inset(0 0 100% 0)', duration: 0.1, ease: 'none' }, 0);
    ftl.fromTo(ctTitle, { clipPath: 'inset(0 0 0% 0)' }, { clipPath: 'inset(0 0 100% 0)', duration: 0.25, ease: 'power2.in' }, 0);
  }

  /* =========================================================
     PROJECT DETAIL OVERLAY
     ========================================================= */
  var projectOpen = false;
  var openProjectFn = null;

  function setupProjectDetail() {
    var detailEl = document.getElementById('project-detail');
    var detailTitle = document.getElementById('detail-title');
    var detailTitleWrap = document.getElementById('detail-title-wrap');
    var detailYear = document.getElementById('detail-year');
    var detailDesc = document.getElementById('detail-desc');
    var detailTags = document.getElementById('detail-tags');
    var detailVisit = document.getElementById('detail-visit');
    var detailThumbs = document.getElementById('detail-thumbs');
    var detailThumbsInner = document.getElementById('detail-thumbs-inner');
    var detailSelected = document.getElementById('detail-selected');
    var detailGalleryWrap = document.getElementById('detail-gallery-wrap');
    var flyingTitle = document.getElementById('flying-title');
    var pageFade = document.getElementById('page-fade');
    var detailBack = document.getElementById('detail-back');

    var _flyingSourceItem = null;
    var _galleryRAF = null;
    var _galleryY = 0, _galleryMaxScroll = 0, _qGalleryY = null;
    var _activeThumbIdx = -1;
    var _thumbImgs = [];
    var _cachedSelImg = null;

    function updateActiveThumb() {
      if (!projectOpen) return;
      if (!_thumbImgs.length) { _galleryRAF = requestAnimationFrame(updateActiveThumb); return; }
      var thumbsRect = detailThumbs.getBoundingClientRect();
      var cy = thumbsRect.top + thumbsRect.height / 2;
      var closestIdx = 0, closestDist = Infinity;
      for (var i = 0; i < _thumbImgs.length; i++) {
        var rect = _thumbImgs[i].getBoundingClientRect();
        var imgCy = rect.top + rect.height / 2;
        var dist = Math.abs(imgCy - cy);
        if (dist < closestDist) { closestDist = dist; closestIdx = i; }
        var distNorm = dist / (thumbsRect.height * 0.45);
        var t = Math.max(0, 1 - distNorm);
        t = t * t * t;
        _thumbImgs[i].style.width = (100 + t * 40) + '%';
      }
      if (closestIdx !== _activeThumbIdx) {
        if (_activeThumbIdx >= 0 && _thumbImgs[_activeThumbIdx]) _thumbImgs[_activeThumbIdx].classList.remove('active');
        _thumbImgs[closestIdx].classList.add('active');
        _activeThumbIdx = closestIdx;
        if (_cachedSelImg) _cachedSelImg.style.backgroundImage = 'url(' + _thumbImgs[closestIdx].dataset.src + ')';
      }
      _galleryRAF = requestAnimationFrame(updateActiveThumb);
    }

    openProjectFn = function openProject(id, clickedItem) {
      var proj = PROJECTS[id];
      if (!proj || projectOpen) return;
      projectOpen = true;
      _flyingSourceItem = clickedItem;

      try { history.pushState({ project: id }, '', '#' + id); } catch (err) { /* file:// or sandboxed */ }
      lenis.stop();

      var stTimeline = document.getElementById('scroll-timeline');
      var pctEl = document.getElementById('scroll-pct');
      if (stTimeline) stTimeline.style.setProperty('display', 'none', 'important');
      if (pctEl) pctEl.style.setProperty('display', 'none', 'important');

      var clone = clickedItem.cloneNode(true);
      var idxEl = clone.querySelector('.proj-idx');
      if (idxEl) idxEl.remove();
      var cleanTitle = clone.textContent.replace(/\s+/g, ' ').trim();

      var rect = clickedItem.getBoundingClientRect();
      var cs = getComputedStyle(clickedItem);
      var startFontSize = parseFloat(cs.fontSize);
      flyingTitle.textContent = cleanTitle;
      flyingTitle.style.fontSize = startFontSize + 'px';
      flyingTitle.style.lineHeight = cs.lineHeight;
      flyingTitle.style.letterSpacing = cs.letterSpacing;
      flyingTitle.style.paddingTop = cs.paddingTop;
      flyingTitle.style.paddingBottom = cs.paddingBottom;
      gsap.set(flyingTitle, { left: rect.left, top: rect.top, opacity: 1, scale: 1, x: 0, y: 0, transformOrigin: 'left top' });
      clickedItem.style.visibility = 'hidden';

      detailTitle.textContent = cleanTitle;
      detailYear.textContent = proj.year + ' — ' + proj.category;
      detailDesc.textContent = proj.desc;
      detailTags.innerHTML = proj.tags.map(function (t) { return '<span class="detail-tag">' + t + '</span>'; }).join('');
      if (proj.link) { detailVisit.href = proj.link; detailVisit.classList.add('has-link'); }
      else { detailVisit.removeAttribute('href'); detailVisit.classList.remove('has-link'); }

      /* gallery: real app screenshots when available, otherwise four
         procedural variations of the project cover */
      var shots = PROJECT_SHOTS[id];
      var allSrcs;
      if (shots && shots.length) {
        allSrcs = shots.map(function (f) { return SHOTS + f; });
      } else {
        var kind = Number(clickedItem.dataset.paint);
        allSrcs = [kind, kind + 6, kind + 12, kind + 18].map(function (k) { return retintCoverDataURL(k % 24); });
      }

      detailThumbsInner.classList.toggle('shots', !!(shots && shots.length));
      detailThumbsInner.innerHTML = allSrcs.map(function (src) {
        return '<div class="dt" data-src="' + src + '" style="background-image:url(' + src + ')" role="button" aria-label="View"></div>';
      }).join('');
      detailSelected.innerHTML = '<div class="ds' + (shots && shots.length ? ' shots' : '') + '" style="background-image:url(' + allSrcs[0] + ')"></div>';
      detailThumbsInner.querySelectorAll('.dt').forEach(function (el, i) {
        el.addEventListener('click', function () {
          if (_activeThumbIdx >= 0 && _thumbImgs[_activeThumbIdx]) _thumbImgs[_activeThumbIdx].classList.remove('active');
          el.classList.add('active');
          _activeThumbIdx = i;
          if (_cachedSelImg) _cachedSelImg.style.backgroundImage = 'url(' + el.dataset.src + ')';
        });
      });
      _activeThumbIdx = 0;
      _thumbImgs = [].slice.call(detailThumbsInner.querySelectorAll('.dt'));
      _thumbImgs[0].classList.add('active');
      _cachedSelImg = detailSelected.querySelector('.ds');
      _galleryY = 0;
      gsap.set(detailThumbsInner, { y: 0 });

      var remPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
      var targetTop = window.innerHeight * 0.22;
      var targetLeft = remPx * 4;
      var targetFontSize = Math.min(Math.max(window.innerWidth * 0.05, remPx * 3), remPx * 5);

      var tl = gsap.timeline();
      tl.to(pageFade, { opacity: 1, duration: 0.8, ease: 'power2.inOut' }, 0);
      tl.to(flyingTitle, { top: targetTop, left: targetLeft, fontSize: targetFontSize, paddingTop: 0, paddingBottom: 0, duration: 1, ease: 'power3.inOut' }, 0.3);
      tl.to(detailEl, { opacity: 1, duration: 0.4, ease: 'power2.out', onStart: function () { detailEl.classList.add('active'); } }, 1.0);
      tl.set(flyingTitle, { opacity: 0 }, 1.1);
      tl.set(detailTitleWrap, { opacity: 1 }, 1.1);
      tl.to(detailDesc, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 1.2);
      tl.to(detailTags, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 1.3);
      tl.to(detailVisit, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 1.4);
      tl.to(detailBack, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 1.3);
      tl.fromTo(detailGalleryWrap, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power3.out' }, 1.2);
      tl.add(function () {
        _galleryMaxScroll = Math.max(0, detailThumbsInner.scrollHeight - detailThumbs.clientHeight);
        _qGalleryY = gsap.quickTo(detailThumbsInner, 'y', { duration: 0.8, ease: 'power2.out' });
        _galleryRAF = requestAnimationFrame(updateActiveThumb);
      });
    };

    function closeProject() {
      if (!projectOpen) return;
      projectOpen = false;
      if (_galleryRAF) { cancelAnimationFrame(_galleryRAF); _galleryRAF = null; }
      _qGalleryY = null;
      try { history.pushState(null, '', window.location.pathname); } catch (err) { /* file:// or sandboxed */ }

      var stTimeline = document.getElementById('scroll-timeline');
      var pctEl = document.getElementById('scroll-pct');
      if (stTimeline) stTimeline.style.removeProperty('display');
      if (pctEl) pctEl.style.removeProperty('display');

      var tl = gsap.timeline();
      tl.to([detailDesc, detailTags, detailVisit, detailBack], { opacity: 0, duration: 0.3, ease: 'power2.in' }, 0);
      tl.to(detailGalleryWrap, { opacity: 0, duration: 0.4, ease: 'power2.in' }, 0);

      var dtRect = detailTitle.getBoundingClientRect();
      var dtCs = getComputedStyle(detailTitle);
      flyingTitle.textContent = detailTitle.textContent;
      flyingTitle.style.fontSize = dtCs.fontSize;
      flyingTitle.style.lineHeight = dtCs.lineHeight;
      flyingTitle.style.letterSpacing = dtCs.letterSpacing;
      flyingTitle.style.paddingTop = '0';
      flyingTitle.style.paddingBottom = '0';
      gsap.set(flyingTitle, { left: dtRect.left, top: dtRect.top, opacity: 1, x: 0, y: 0 });
      gsap.set(detailTitleWrap, { opacity: 0 });

      tl.to(detailEl, { opacity: 0, duration: 0.4, ease: 'power2.in' }, 0.2);

      if (_flyingSourceItem) {
        var itemRect = _flyingSourceItem.getBoundingClientRect();
        var itemCs = getComputedStyle(_flyingSourceItem);
        tl.to(flyingTitle, {
          left: itemRect.left, top: itemRect.top,
          fontSize: parseFloat(itemCs.fontSize),
          paddingTop: itemCs.paddingTop, paddingBottom: itemCs.paddingBottom,
          duration: 0.9, ease: 'power3.inOut'
        }, 0.3);
      }

      tl.to(pageFade, { opacity: 0, duration: 0.6, ease: 'power2.out' }, 0.5);
      tl.add(function () {
        detailEl.classList.remove('active');
        gsap.set([detailTitleWrap, detailDesc, detailTags, detailVisit, detailBack, detailGalleryWrap], { opacity: 0 });
        gsap.set(flyingTitle, { opacity: 0 });
        _activeThumbIdx = -1;
        _thumbImgs = [];
        _cachedSelImg = null;
        if (_flyingSourceItem) { _flyingSourceItem.style.visibility = ''; _flyingSourceItem = null; }
        lenis.start();
        ScrollTrigger.refresh();
      });
    }

    detailEl.addEventListener('wheel', function (e) {
      if (!projectOpen) return;
      e.preventDefault();
      var delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      _galleryY = Math.max(-_galleryMaxScroll, Math.min(0, _galleryY - delta));
      if (_qGalleryY) _qGalleryY(_galleryY);
    }, { passive: false });

    var _detailTouchStartY = 0;
    detailEl.addEventListener('touchstart', function (e) {
      if (!projectOpen) return;
      _detailTouchStartY = e.touches[0].clientY;
    }, { passive: true });
    detailEl.addEventListener('touchmove', function (e) {
      if (!projectOpen) return;
      e.preventDefault();
      var y = e.touches[0].clientY;
      var delta = _detailTouchStartY - y;
      _detailTouchStartY = y;
      _galleryY = Math.max(-_galleryMaxScroll, Math.min(0, _galleryY - delta));
      if (_qGalleryY) _qGalleryY(_galleryY);
    }, { passive: false });

    detailBack.addEventListener('click', closeProject);
    window.addEventListener('popstate', function () { if (projectOpen) closeProject(); });
  }

  /* =========================================================
     ACHIEVEMENTS — active highlight + cover cursor
     ========================================================= */
  function setupAwards() {
    var awardItems = gsap.utils.toArray('.award-item');
    if (!awardItems.length) return;

    awardItems.forEach(function (item) {
      ScrollTrigger.create({
        trigger: item,
        start: 'top center+=15%',
        end: 'bottom center-=15%',
        toggleClass: { targets: item, className: 'active-award' }
      });
    });

    var awardCursor = document.createElement('img');
    awardCursor.className = 'award-cursor';
    awardCursor.alt = '';
    document.body.appendChild(awardCursor);
    gsap.set(awardCursor, { xPercent: -50, yPercent: -50, scale: 0.8, opacity: 0 });

    var isAwardHovered = false;
    window.addEventListener('mousemove', function (e) {
      if (isAwardHovered) gsap.set(awardCursor, { x: e.clientX, y: e.clientY });
    });

    awardItems.forEach(function (item) {
      item.addEventListener('mouseenter', function (e) {
        isAwardHovered = true;
        awardCursor.src = retintCoverDataURL(Number(item.dataset.paint) % 24);
        gsap.set(awardCursor, { x: e.clientX, y: e.clientY });
        gsap.to(awardCursor, { opacity: 1, scale: 1, duration: 0.3, overwrite: 'auto' });
      });
      item.addEventListener('mouseleave', function () {
        isAwardHovered = false;
        gsap.to(awardCursor, { opacity: 0, scale: 0.8, duration: 0.3, overwrite: 'auto' });
      });
    });
  }

  /* =========================================================
     NAV SCROLL LINKS (hero bar)
     ========================================================= */
  document.querySelectorAll('[data-scroll-to]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var target = document.getElementById(link.dataset.scrollTo);
      if (!target) return;
      if (projectOpen) return;
      lenis.scrollTo(target, { offset: 0, duration: 1.6 });
    });
  });

  /* keyboard escape closes project */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && projectOpen) {
      document.getElementById('detail-back').click();
    }
  });

  ScrollTrigger.refresh();
})();
