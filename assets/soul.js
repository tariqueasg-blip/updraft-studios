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

    /* safety: nothing may stay hidden (covers missed observers / reduced motion) */
    setTimeout(function () {
      document.querySelectorAll('.uw, .section-head h2').forEach(function (e) { e.classList.add('in'); });
      document.querySelectorAll('.reveal').forEach(function (e) {
        if (parseFloat(getComputedStyle(e).opacity) < 0.2) e.style.opacity = '1';
      });
    }, 2400);
  }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
