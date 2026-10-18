  // ========== FULLSCREEN TOGGLE ==========
  (function () {
    var fsBtn = document.getElementById('fsBtn');
    if (!fsBtn) return;

    var docEl = document.documentElement;

    function isFullscreen() {
      return !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
    }

    function requestFullscreen(el) {
      var fn = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
      if (!fn) return;
      try {
        var p = fn.call(el);
        if (p && typeof p.catch === 'function') p.catch(function () {});
      } catch (e) {}
    }

    function exitFullscreen() {
      var fn = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
      if (!fn) return;
      try {
        var p = fn.call(document);
        if (p && typeof p.catch === 'function') p.catch(function () {});
      } catch (e) {}
    }

    function toggleFullscreen() {
      if (!isFullscreen()) requestFullscreen(docEl);
      else exitFullscreen();
    }

    function syncState() {
      var fs = isFullscreen();
      fsBtn.classList.toggle('is-fullscreen', fs);
      fsBtn.setAttribute('aria-pressed', fs ? 'true' : 'false');
      fsBtn.setAttribute('aria-label', fs ? 'Exit fullscreen' : 'Enter fullscreen');
      fsBtn.setAttribute('title', fs ? 'Thoát toàn màn hình (F)' : 'Toàn màn hình (F)');
    }

    fsBtn.addEventListener('click', function (e) {
      e.preventDefault();
      toggleFullscreen();
    });

    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(function (evt) {
      document.addEventListener(evt, syncState);
    });

    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var key = (e.key || '').toLowerCase();
      if (key !== 'f') return;
      var t = e.target;
      var tag = (t && t.tagName ? t.tagName : '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || (t && t.isContentEditable)) return;
      toggleFullscreen();
    });

    syncState();
  })();
