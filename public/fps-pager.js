/* ES5 — không qua bundle Next.
   About/Services/Projects là virtual pager: màn brand-break nằm overlay
   (translateY 100%), chỉ hiện khi goNext(). iOS 16 / in-app parse hỏng
   main-app.js → React không hydrate → kẹt màn hero.
   Script này: đáy inner-scroll + vuốt lên → slide sang màn kế. */
(function () {
  var EDGE_PX = 32;
  var SWIPE_MIN = 28;
  var AXIS_LOCK = 8;
  var TRANSITION_MS = 750;
  var START_DELAY_MS = 1200;

  var index = 0;
  var busy = false;
  var started = false;
  var origin = null;
  var axis = null;
  var startTop = 0;
  var startAtBottom = false;
  var startAtTop = false;

  function reactAlive() {
    return !!(
      window.__siteFpsReact ||
      window.__siteHydrated ||
      document.querySelector("[data-fps-js]")
    );
  }

  function rootEl() {
    return (
      document.querySelector("[data-full-page-scroll-active]") ||
      document.querySelector("[data-full-page-scroll][data-fps-released]")
    );
  }

  function panelList() {
    var root = rootEl();
    if (!root) return [];
    return root.querySelectorAll("[data-fps-panel]");
  }

  function isReleased() {
    var root = document.querySelector(
      "[data-full-page-scroll][data-fps-released]",
    );
    return !!root;
  }

  function releaseFooter() {
    var root = document.querySelector("[data-full-page-scroll-active]");
    if (!root || busy) return;
    var brand = document.querySelector("[data-brand-break]");
    if (
      brand &&
      brand.getAttribute("data-brand-break-logo") &&
      brand.getAttribute("data-brand-break-logo") !== "rest"
    ) {
      return;
    }
    busy = true;
    root.removeAttribute("data-full-page-scroll-active");
    root.setAttribute("data-fps-released", "");
    root.setAttribute("data-fps-footer", "open");
    window.setTimeout(function () {
      busy = false;
    }, TRANSITION_MS);
  }

  function closeFooterNative() {
    var root = document.querySelector(
      "[data-full-page-scroll][data-fps-released]",
    );
    if (!root || busy) return;
    busy = true;
    root.removeAttribute("data-fps-released");
    root.setAttribute("data-full-page-scroll-active", "");
    root.setAttribute("data-fps-footer", "closed");
    window.setTimeout(function () {
      busy = false;
    }, TRANSITION_MS);
  }

  function innerOf(panel) {
    if (!panel) return null;
    return panel.querySelector("[data-fps-inner-scroll]");
  }

  function maxScroll(el) {
    return el.scrollHeight - el.clientHeight;
  }

  function isAtBottom(el) {
    if (!el) return true;
    var max = maxScroll(el);
    if (max <= EDGE_PX) return true;
    return el.scrollTop >= max - EDGE_PX;
  }

  function isAtTop(el) {
    if (!el) return true;
    return el.scrollTop <= EDGE_PX;
  }

  function apply(next) {
    var list = panelList();
    var n = list.length;
    if (!n) return;
    if (next < 0) next = 0;
    if (next > n - 1) next = n - 1;
    index = next;
    var root = rootEl();
    if (root) root.setAttribute("data-fps-slide-ready", "");
    var p;
    for (p = 0; p < n; p++) {
      var lane = p === next ? "current" : p < next ? "before" : "after";
      var motion = p === next ? "active" : "inactive";
      list[p].setAttribute("data-fps-slide", lane);
      list[p].setAttribute("data-fps-motion", motion);
      if (p === next) {
        list[p].removeAttribute("aria-hidden");
        list[p].style.pointerEvents = "auto";
      } else {
        list[p].setAttribute("aria-hidden", "true");
        list[p].style.pointerEvents = "none";
      }
    }
  }

  function go(next) {
    if (reactAlive() || busy) return;
    var n = panelList().length;
    if (next < 0) return;
    /* Màn cuối + vuốt tiếp → hiện footer (không có React openFooter) */
    if (next >= n) {
      releaseFooter();
      return;
    }
    if (next === index) return;
    busy = true;
    apply(next);
    window.setTimeout(function () {
      busy = false;
    }, TRANSITION_MS);
  }

  function currentInner() {
    var list = panelList();
    return innerOf(list[index] || null);
  }

  function isChrome(target) {
    if (!target || !target.closest) return false;
    return !!(
      target.closest(".site-header") ||
      target.closest("#site-mobile-menu") ||
      target.closest("[data-site-loading]")
    );
  }

  function resetTouch() {
    origin = null;
    axis = null;
  }

  function onTouchStart(event) {
    if (reactAlive() || !started) return;
    if (isChrome(event.target)) {
      resetTouch();
      return;
    }
    var touch = event.touches[0];
    if (!touch) return;
    origin = { x: touch.clientX, y: touch.clientY };
    axis = null;
    var inner = currentInner();
    startTop = inner ? inner.scrollTop : 0;
    startAtBottom = isAtBottom(inner);
    startAtTop = isAtTop(inner);
  }

  function onTouchMove(event) {
    if (!origin || !event.touches[0]) return;
    var touch = event.touches[0];
    var dx = touch.clientX - origin.x;
    var dy = touch.clientY - origin.y;
    var absX = Math.abs(dx);
    var absY = Math.abs(dy);
    if (!axis && (absX >= AXIS_LOCK || absY >= AXIS_LOCK)) {
      axis = absX >= absY ? "h" : "v";
    }
    if (startAtBottom && dy < 0 && absY >= AXIS_LOCK) {
      if (event.cancelable) event.preventDefault();
    }
  }

  function onTouchEnd(event) {
    if (!origin) return;
    var touch = event.changedTouches[0];
    var ox = origin.x;
    var oy = origin.y;
    var locked = axis;
    resetTouch();
    if (reactAlive() || !started || busy) return;
    if (!touch) return;
    var dy = touch.clientY - oy;
    var absX = Math.abs(touch.clientX - ox);
    var absY = Math.abs(dy);
    var useAxis = locked || (absX >= absY ? "h" : "v");
    if (useAxis !== "v") return;
    if (absY < SWIPE_MIN) return;

    /* Footer đã hiện: vuốt bất kỳ hướng dọc → đóng */
    if (isReleased()) {
      closeFooterNative();
      return;
    }

    var inner = currentInner();
    var moved =
      inner && Math.abs((inner.scrollTop || 0) - startTop) > 2;
    var nowBottom = isAtBottom(inner);
    var nowTop = isAtTop(inner);

    if (dy < 0) {
      if (moved && !startAtBottom && !nowBottom) return;
      if (startAtBottom || nowBottom) go(index + 1);
      return;
    }

    if (moved && !startAtTop && !nowTop) return;
    if (startAtTop || nowTop) go(index - 1);
  }

  function bind() {
    document.addEventListener("touchstart", onTouchStart, true);
    document.addEventListener("touchmove", onTouchMove, {
      capture: true,
      passive: false,
    });
    document.addEventListener("touchend", onTouchEnd, true);
    document.addEventListener("touchcancel", resetTouch, true);
  }

  function start() {
    if (started || reactAlive()) return;
    if (!rootEl() || panelList().length < 2) return;
    started = true;
    apply(0);
    bind();
  }

  window.setTimeout(start, START_DELAY_MS);
})();
