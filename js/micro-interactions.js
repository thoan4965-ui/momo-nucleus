  (function () {
    function init() {
      var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) return;
      var hlLg = document.querySelector('.hl-lg');
      if (hlLg) {
        var text = hlLg.textContent;
        hlLg.textContent = '';
        var chars = [];
        for (var i = 0; i < text.length; i++) {
          var c = text[i];
          var s = document.createElement('span');
          s.className = 'char' + (c === ' ' ? ' space' : '');
          s.textContent = c;
          hlLg.appendChild(s); chars.push(s);
        }
        var running = false;
        function playWave() {
          if (running) return;
          running = true;
          gsap.to(chars, { y: -10, scale: 1.1, filter: 'drop-shadow(0 0 14px rgba(127,227,255,0.9))', duration: 0.4, ease: 'back.out(2.5)', stagger: { each: 0.035, from: 'start' }, overwrite: true,
            onComplete: function () {
              gsap.to(chars, { y: 0, scale: 1, filter: 'drop-shadow(0 0 0px rgba(127,227,255,0))', duration: 1.0, ease: 'elastic.out(1, 0.5)', stagger: { each: 0.03, from: 'start' }, overwrite: true, onComplete: function () { running = false; } });
            }
          });
        }
        hlLg.addEventListener('mouseenter', playWave);
        hlLg.addEventListener('click', function () {
          gsap.killTweensOf(chars);
          gsap.fromTo(chars, { y: 0, scale: 1 }, { y: -18, scale: 1.25, filter: 'drop-shadow(0 0 20px rgba(127,227,255,1))', duration: 0.28, ease: 'power2.out', stagger: { each: 0.03, from: 'center' }, yoyo: true, repeat: 1, overwrite: true });
        });
      }
      var hlSm = document.querySelector('.hl-sm');
      if (hlSm) hlSm.addEventListener('click', function () { gsap.fromTo(hlSm, { scale: 1 }, { scale: 1.15, duration: 0.22, yoyo: true, repeat: 1, ease: 'power2.inOut', overwrite: true }); });
      var headlineEl = document.querySelector('.headline');
      if (headlineEl) {
        headlineEl.addEventListener('mouseenter', function () { gsap.to(headlineEl, { scale: 1.015, duration: 0.5, ease: 'power2.out' }); });
        headlineEl.addEventListener('mouseleave', function () { gsap.to(headlineEl, { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.5)' }); });
      }
      function attachRipple(el) {
        el.addEventListener('click', function (e) {
          var r = el.getBoundingClientRect();
          var rip = document.createElement('span');
          rip.style.position='absolute'; rip.style.width='24px'; rip.style.height='24px'; rip.style.marginLeft='-12px'; rip.style.marginTop='-12px';
          rip.style.borderRadius='50%'; rip.style.background='radial-gradient(circle, rgba(255,255,255,.6), rgba(127,227,255,.1) 60%, transparent 70%)';
          rip.style.pointerEvents='none'; rip.style.zIndex='10';
          rip.style.left=(e.clientX-r.left)+'px'; rip.style.top=(e.clientY-r.top)+'px';
          el.appendChild(rip);
          gsap.fromTo(rip, { scale: 0, opacity: 0.85 }, { scale: 3.5, opacity: 0, duration: 0.75, ease: 'power2.out', onComplete: function () { rip.remove(); } });
        });
      }
      function attachSparkle(el) {
        var last = 0;
        el.addEventListener('pointermove', function (e) {
          var now = Date.now();
          if (now - last < 80) return;
          if (Math.random() > 0.55) return;
          last = now;
          var r = el.getBoundingClientRect();
          var s = document.createElement('span');
          s.style.position='absolute'; s.style.width='4px'; s.style.height='4px'; s.style.marginLeft='-2px'; s.style.marginTop='-2px';
          s.style.borderRadius='50%'; s.style.background='var(--accent)'; s.style.boxShadow='0 0 10px var(--accent)';
          s.style.pointerEvents='none'; s.style.zIndex='11';
          s.style.left=(e.clientX-r.left)+'px'; s.style.top=(e.clientY-r.top)+'px';
          el.appendChild(s);
          gsap.fromTo(s, { scale: 0, opacity: 1, x: 0, y: 0 }, { scale: 1.2, opacity: 0, x: (Math.random() - 0.5) * 40, y: -25 - Math.random() * 25, duration: 0.9, ease: 'power2.out', onComplete: function () { s.remove(); } });
        });
      }
      var coarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
      document.querySelectorAll('.mode-btn, .sw, .locus-item, .buy, .badge, .back-to-top, .fn-chip, .fs-btn, .ai-submit, .ai-prompt-chip').forEach(function (el) {
        attachRipple(el);
        if (!coarsePointer) attachSparkle(el);
      });
    }
    if (document.readyState === 'complete') init();
    else window.addEventListener('load', init);
  })();
