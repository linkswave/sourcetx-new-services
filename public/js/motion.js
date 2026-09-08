(function () {
  'use strict';

  var home = document.querySelector('.hero');
  if (!home) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;
  document.body.classList.add('js3d');

  var canHover = window.matchMedia ? window.matchMedia('(hover: hover)').matches : false;
  var finePointer = window.matchMedia ? window.matchMedia('(pointer: fine)').matches : false;
  var desktopPointer = canHover && finePointer;

  var grid = document.querySelector('.home-capabilities');
  var maxTilt = 7;

  function setVars(el, px, py) {
    el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
    el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
  }

  function tilt(card, px, py) {
    var rx = (0.5 - py) * maxTilt;
    var ry = (px - 0.5) * maxTilt;
    card.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-4px)';
  }

  if (grid && desktopPointer) {
    var active = null;

    function reset(card) {
      if (!card) return;
      card.classList.remove('is-hover');
      card.style.transform = '';
      card.style.removeProperty('--mx');
      card.style.removeProperty('--my');
    }

    grid.addEventListener('pointermove', function (e) {
      var card = e.target.closest('.home-capability');
      if (!card) {
        reset(active);
        active = null;
        return;
      }
      if (!card.classList.contains('in-view')) return;
      if (active && active !== card) reset(active);
      active = card;
      card.classList.add('is-hover');
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      tilt(card, Math.max(0, Math.min(1, px)), Math.max(0, Math.min(1, py)));
      setVars(card, px, py);
    });
    grid.addEventListener('pointerleave', function () {
      reset(active);
      active = null;
    });
  }

  var stage = document.querySelector('.h3d-stage');
  var hero3d = document.querySelector('.hero-3d');
  if (stage && hero3d && desktopPointer) {
    var raf = null;
    var cur = { x: 0, y: 0 };
    var target = { x: 0, y: 0 };

    function apply() {
      cur.x += (target.x - cur.x) * 0.09;
      cur.y += (target.y - cur.y) * 0.09;
      if (Math.abs(target.x - cur.x) < 0.001 && Math.abs(target.y - cur.y) < 0.001) {
        cur.x = target.x; cur.y = target.y;
        raf = null;
      } else {
        raf = requestAnimationFrame(apply);
      }
      stage.style.transform = 'rotateX(' + cur.y.toFixed(3) + 'deg) rotateY(' + cur.x.toFixed(3) + 'deg)';
    }

    home.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      var r = home.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5;
      var ny = (e.clientY - r.top) / r.height - 0.5;
      target.x = nx * 6;
      target.y = -ny * 5;
      if (!raf) raf = requestAnimationFrame(apply);
    });
    home.addEventListener('pointerleave', function () {
      target.x = 0; target.y = 0;
      if (!raf) raf = requestAnimationFrame(apply);
    });
  }
})();
