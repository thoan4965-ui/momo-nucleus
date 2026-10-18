/* rotate-viewer.js — thay <model-viewer> bang sprite sheet 48 frame (0 WebGL).
   API tuong thich nguoc cho main.js: getCameraOrbit(), getFieldOfView(), su kien 'load'/'error'.
   Cau hinh qua data-attributes (pattern hoc tu scaleflex/cloudimage-360-view):
     data-sheet / data-sheet-2x : duong dan WebP (mobile / desktop)
     data-frames="48" data-cols="12"
     data-start-theta="-25"      : theta ban dau (deg, glTF Y-up) — khop bake
     data-rotate="10"            : auto-rotate deg/s (tuy chon)
     data-keys="1"               : bat phim mui ten trai/phai (tuy chon)
*/
(function () {
  'use strict';

  var PHI_DEG = 75;          // khop camera-orbit "... 75deg ..." cua model-viewer goc
  var RADIUS_M = 2.4;        // khop camera-orbit "... 2.4m"
  var FOV_DEG = 28;          // khop field-of-view="28deg" cua hero
  var DRAG_SIGN = -1;        // huong keo — verify A/B voi ban cu khi test
  var WIDTH_FACTOR = 1.25;   // keo ngang 1.25x be rong = xoay 1 vong 360
  var MOMENTUM_DECAY = 0.90;
  var MOMENTUM_STOP = 0.05;

  var viewers = [];

  function rad(deg) { return deg * Math.PI / 180; }

  function init(el) {
    var sheet = el.dataset.sheet;
    var sheet2x = el.dataset.sheet2x || sheet;
    var frames = parseInt(el.dataset.frames, 10) || 48;
    var cols = parseInt(el.dataset.cols, 10) || 12;
    var startTheta = parseFloat(el.dataset.startTheta);
    if (!isFinite(startTheta)) startTheta = -25;
    var rotSpeed = parseFloat(el.dataset.rotate); // deg/s
    var hasKeys = el.dataset.keys === '1';

    var use2x = window.innerWidth >= 768; // >=768px (tablet/desktop) dung sheet @2x; phone dung sheet nhe (256px/cell)
    var src = use2x ? sheet2x : sheet;

    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    el.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    var img = new Image();
    var frame = 0;
    var ready = false;
    var dragging = false;
    var lastX = 0, lastT = 0, vel = 0, mom = 0;
    var visible = true;

    var v = {
      el: el,
      frames: frames,
      getCameraOrbit: function () {
        return {
          theta: rad(startTheta + frame * (360 / frames)),
          phi: rad(PHI_DEG),
          radius: RADIUS_M
        };
      },
      getFieldOfView: function () { return FOV_DEG; },
      getFrame: function () { return frame; }
    };

    function sizeCanvas() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      draw();
    }

    function normFrame(f) {
      return ((f % frames) + frames) % frames;
    }

    function draw() {
      if (!ready || !canvas.width) return;
      var cell = img.naturalWidth / cols;
      var idx = normFrame(Math.round(frame));
      var sx = (idx % cols) * cell;
      var sy = Math.floor(idx / cols) * cell;
      var scale = canvas.height / cell;          // fit theo chieu cao (khop fov doc)
      var dw = cell * scale;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, sx, sy, cell, cell, (canvas.width - dw) / 2, 0, dw, canvas.height);
    }

    function step() {
      draw();
      if (Math.abs(mom) > MOMENTUM_STOP) {
        frame += mom;
        mom *= MOMENTUM_DECAY;
        requestAnimationFrame(step);
      }
    }

    /* ---- pointer drag ---- */
    el.addEventListener('pointerdown', function (e) {
      dragging = true;
      mom = 0;
      vel = 0;
      lastX = e.clientX;
      lastT = performance.now();
      if (el.setPointerCapture && e.pointerId !== undefined) {
        try { el.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
      }
    });
    el.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var now = performance.now();
      var dt = Math.max(now - lastT, 1);
      var dx = e.clientX - lastX;
      var pxPerFrame = (el.clientWidth * WIDTH_FACTOR) / frames;
      frame += DRAG_SIGN * dx / pxPerFrame;
      vel = 0.7 * vel + 0.3 * (dx / dt);   // px/ms smooth
      lastX = e.clientX;
      lastT = now;
      draw();
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      mom = DRAG_SIGN * (vel * 140) / ((el.clientWidth * WIDTH_FACTOR) / frames);
      if (Math.abs(mom) > MOMENTUM_STOP) requestAnimationFrame(step);
    }
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);

    /* ---- keyboard ---- */
    if (hasKeys) {
      el.setAttribute('tabindex', '0');
      el.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { frame -= 1; draw(); }
        else if (e.key === 'ArrowRight') { frame += 1; draw(); }
      });
    }

    /* ---- auto-rotate (chi khi trong viewport, ton trong reduced-motion) ---- */
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isFinite(rotSpeed) && rotSpeed > 0 && !reduceMotion) {
      var last = 0;
      var fpsPerSec = rotSpeed / (360 / frames);
      function tick(now) {
        var dt = last ? (now - last) / 1000 : 0;
        last = now;
        if (visible && !dragging && ready) {
          frame += fpsPerSec * dt;
          draw();
        }
        requestAnimationFrame(tick);
      }
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          visible = entries[0].isIntersecting;
        }, { rootMargin: '100px' }).observe(el);
      }
      requestAnimationFrame(tick);
    }

    /* ---- load / resize ---- */
    img.onload = function () {
      ready = true;
      sizeCanvas();
      el.dispatchEvent(new Event('load'));
    };
    img.onerror = function () {
      el.dispatchEvent(new Event('error'));
    };
    img.src = src;

    window.addEventListener('resize', sizeCanvas);

    viewers.push(v);
  }

  var els = Array.prototype.slice.call(document.querySelectorAll('.rotate-viewer'));
  els.forEach(init);

  window.RotateViewer = { all: viewers };
})();
