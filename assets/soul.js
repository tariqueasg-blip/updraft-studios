/* Updraft Studios — shared motion layer.
   Wraps headings so words rise in on scroll, draws a hairline under
   section headings, and guarantees nothing stays hidden if a page's
   own reveal script doesn't fire. Respects reduced-motion. */
(function () {
  function init() {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var io = ('IntersectionObserver' in window)
      ? new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); e.target.classList.add('is-visible'); io.unobserve(e.target); } });
        }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' })
      : null;

    /* wrap heading words into spans */
    document.querySelectorAll('h1, h2').forEach(function (h) {
      if (h.dataset.uw || h.querySelector('.hl-word') || h.closest('[data-no-uw]')) return;
      h.dataset.uw = '1';
      var i = 0;
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment();
            n.nodeValue.split(/(\s+)/).forEach(function (w) {
              if (!w.trim()) { frag.appendChild(document.createTextNode(w)); return; }
              var s = document.createElement('span');
              s.className = 'uw'; s.textContent = w;
              s.style.transitionDelay = (Math.min(i++, 16) * 0.04) + 's';
              frag.appendChild(s);
            });
            node.replaceChild(frag, n);
          } else if (n.nodeType === 1 && !/^(BR|IMG|SVG|WBR)$/i.test(n.tagName)) {
            walk(n);
          }
        });
      })(h);
    });

    var words = document.querySelectorAll('.uw');
    if (io && !reduce) { words.forEach(function (w) { io.observe(w); }); }
    else { words.forEach(function (w) { w.classList.add('in'); }); }

    document.querySelectorAll('.section-head h2').forEach(function (h2) {
      if (io && !reduce) io.observe(h2); else h2.classList.add('in');
    });

    /* section blocks / cards reveal on scroll, with a light stagger among siblings */
    document.querySelectorAll('.reveal').forEach(function (el) {
      var sibs = (el.parentNode && el.parentNode.querySelectorAll) ? el.parentNode.querySelectorAll(':scope > .reveal') : null;
      var idx = sibs ? Array.prototype.indexOf.call(sibs, el) : 0;
      if (idx > 0) el.style.transitionDelay = (Math.min(idx, 5) * 0.08) + 's';
      if (io && !reduce) io.observe(el); else el.classList.add('in', 'is-visible');
    });

    fitRotator();

    /* safety: nothing may stay hidden (covers missed observers / reduced motion) */
    setTimeout(function () {
      document.querySelectorAll('.uw, .section-head h2').forEach(function (e) { e.classList.add('in'); });
      document.querySelectorAll('.reveal').forEach(function (e) {
        if (parseFloat(getComputedStyle(e).opacity) < 0.2) e.style.opacity = '1';
      });
    }, 2400);
  }
  /* keep the "Get ___" rotator the SAME WIDTH every frame, so it always sits
     centered over the word strip no matter how long the word is */
  function fitRotator() {
    var track = document.querySelector('.rotator .r-track');
    var roll = document.querySelector('.rotator .r-roll');
    if (!track || !roll || track.children.length < 2) return;
    var rows = Array.prototype.slice.call(track.children);
    var cs = getComputedStyle(roll);
    var base = parseFloat(cs.fontSize) || 82;
    var gapPx = base * 0.24;
    var cv = document.createElement('canvas').getContext('2d');
    var meas = function (t) { cv.font = cs.fontWeight + ' ' + base + 'px ' + cs.fontFamily; return cv.measureText(t).width; };
    var nat = rows.map(function (r) {
      var g = r.querySelector('i');
      var gt = g ? g.textContent : '';
      return meas(gt) + gapPx + meas(r.textContent.slice(gt.length).trim());
    });
    var caps = document.querySelector('.caps');
    var target = 0;
    if (caps && caps.children.length) { var f = caps.children[0].getBoundingClientRect(), l = caps.children[caps.children.length - 1].getBoundingClientRect(); target = l.right - f.left; }
    if (!target) target = Math.max.apply(null, nat);
    var H = Math.round(base * 1.22);
    rows.forEach(function (r, i) {
      var scale = Math.max(0.9, Math.min(1.12, target / nat[i]));
      r.style.fontSize = (base * scale).toFixed(1) + 'px';
      r.style.gap = gapPx.toFixed(1) + 'px';
      r.style.height = H + 'px';
      r.style.lineHeight = H + 'px';
    });
    roll.style.height = H + 'px';
  }
  var _fitT;
  function refit() {
    clearTimeout(_fitT);
    _fitT = setTimeout(function () {
      Array.prototype.slice.call(document.querySelectorAll('.rotator .r-track > span')).forEach(function (r) { r.style.fontSize = ''; r.style.gap = ''; r.style.height = ''; r.style.lineHeight = ''; });
      var roll = document.querySelector('.rotator .r-roll'); if (roll) roll.style.height = '';
      fitRotator();
    }, 200);
  }
  window.addEventListener('resize', refit);

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
