/* ES5 — không qua bundle Next. iOS 16 / in-app browser hay parse hỏng
   `main-app.js` → React không hydrate → `--morph-pin-p-shrink` kẹt 0.
   File này đọc token CSS trên [data-morph-pin] và ghi lại biến theo scroll.
   Brand-break: snap LogoComponent → rest + hiện content khi không có React. */
(function () {
  function readNum(el, name, fallback) {
    var raw = window.getComputedStyle(el).getPropertyValue(name);
    var value = parseFloat(raw);
    return isFinite(value) ? value : fallback;
  }

  function positive(value, fallback) {
    return value > 0 ? value : fallback;
  }

  function clamp01(value) {
    return Math.min(1, Math.max(0, value));
  }

  function setVar(el, name, value) {
    if (el.style.getPropertyValue(name) === value) return;
    el.style.setProperty(name, value);
  }

  /** Đáy ảnh đã paint (object-contain), không phải đáy khung sticky. */
  function visualImageBottom(wrapper) {
    var fallback = wrapper.getBoundingClientRect().bottom;
    var img = wrapper.querySelector("img");
    if (!img || !img.naturalWidth || !img.naturalHeight) return fallback;

    var rect = img.getBoundingClientRect();
    var style = window.getComputedStyle(img);
    var scaleY = img.offsetHeight > 0 ? rect.height / img.offsetHeight : 1;
    var padT = (parseFloat(style.paddingTop) || 0) * scaleY;
    var padB = (parseFloat(style.paddingBottom) || 0) * scaleY;
    var contentTop = rect.top + padT;
    var contentH = Math.max(0, rect.height - padT - padB);
    if (contentH < 1) return fallback;

    var fit = Math.min(
      Math.max(0, rect.width) / img.naturalWidth,
      contentH / img.naturalHeight,
    );
    var renderedH = img.naturalHeight * fit;
    return contentTop + (contentH - renderedH) * 0.5 + renderedH;
  }

  function measureContentShift(root, titleGap, appliedShift) {
    var image = root.querySelector("[data-morph-pin-image]");
    var title = root.querySelector(
      "[data-morph-pin-content] [data-section-title]",
    );
    if (!image || !title) return null;
    var naturalTop = title.getBoundingClientRect().top - appliedShift;
    return visualImageBottom(image) + titleGap - naturalTop;
  }

  function panelIsCurrent(root) {
    var panel = root.closest
      ? root.closest("[data-fps-panel]")
      : null;
    if (!panel) return true;
    var slide = panel.getAttribute("data-fps-slide");
    var motion = panel.getAttribute("data-fps-motion");
    if (slide === "current" || motion === "active" || motion === "entering") {
      return true;
    }
    /* Chưa gắn fps attr — coi như hiện */
    return !slide && !motion;
  }

  function snapBrandBreakLogoRest(root) {
    if (!root.hasAttribute("data-brand-break")) return;
    if (root.getAttribute("data-morph-pin-bound") === "react") return;
    if (root.getAttribute("data-brand-break-logo") === "rest") return;
    if (!panelIsCurrent(root)) return;

    var ids = ["top", "mid", "bot"];
    for (var i = 0; i < ids.length; i++) {
      var el = root.querySelector('[data-logo-block="' + ids[i] + '"]');
      if (el) el.style.transform = "translate3d(0,0,0)";
    }
    root.setAttribute("data-brand-break-logo", "rest");
    root.setAttribute("data-brand-break-animate", "in");

    var partner = root.querySelector("[data-content-partner]");
    if (partner) {
      partner.setAttribute("data-content-partner-animate", "in");
    }
  }

  function bindRoot(root) {
    if (root.getAttribute("data-morph-pin-bound")) return;
    var scroller = root.closest
      ? root.closest("[data-fps-inner-scroll]")
      : null;
    if (!scroller) return;
    root.setAttribute("data-morph-pin-bound", "native");

    var lastShift = 0;
    var frozenShift = null;

    function sync() {
      if (root.getAttribute("data-morph-pin-bound") === "react") return;
      var vvh = scroller.clientHeight;
      if (vvh <= 0) return;

      var letterRatio = Math.max(
        0,
        readNum(root, "--morph-pin-letter-ratio", 0),
      );
      var imageRatio = positive(readNum(root, "--morph-pin-image-ratio", 1), 1);
      var shrinkSpeed = positive(
        readNum(root, "--morph-pin-shrink-speed", 1.2),
        1.2,
      );
      var topSpeed = positive(readNum(root, "--morph-pin-top-speed", 0.8), 0.8);
      var alignSpeed = positive(
        readNum(root, "--morph-pin-align-speed", 1.2),
        1.2,
      );
      var letterDist = vvh * letterRatio;
      var imageDist = vvh * imageRatio;
      var alignUnstick =
        letterDist + (alignSpeed > 0 ? imageDist / alignSpeed : imageDist);
      var scrollTop = scroller.scrollTop;
      var pLetter = letterDist > 0 ? clamp01(scrollTop / letterDist) : 1;
      var lettersOut = pLetter >= 1;
      /* Chưa rest: khóa letter như CSS — tránh face bay trước logo enter */
      if (
        root.hasAttribute("data-brand-break") &&
        root.getAttribute("data-brand-break-logo") !== "rest"
      ) {
        pLetter = 0;
        lettersOut = false;
      }
      var pImage =
        lettersOut && imageDist > 0
          ? clamp01((scrollTop - letterDist) / imageDist)
          : 0;
      var pShrink = lettersOut ? clamp01(pImage * shrinkSpeed) : 0;
      var pTop = lettersOut ? clamp01(pImage * topSpeed) : 0;
      var pAlign = lettersOut ? clamp01(pImage * alignSpeed) : 0;
      var shrinkDone = lettersOut && pShrink >= 1;
      var titleArrived = lettersOut && pAlign >= 1;
      var phase = "letter";
      if (titleArrived) phase = "flow";
      else if (shrinkDone) phase = "pin";
      else if (lettersOut) phase = "image";

      var pin = root.querySelector("[data-morph-pin-pin]");
      if (pin && pin.style.marginTop) pin.style.removeProperty("margin-top");

      var titleGap = readNum(root, "--morph-pin-title-gap", 0);
      var contentShift = 0;
      if (lettersOut) {
        var targetShift = measureContentShift(root, titleGap, lastShift);
        if (targetShift !== null) {
          if (titleArrived) {
            if (frozenShift === null) frozenShift = targetShift;
            contentShift = frozenShift;
          } else {
            frozenShift = null;
            contentShift = pAlign * targetShift;
          }
        }
      } else {
        frozenShift = null;
      }
      lastShift = contentShift;

      root.setAttribute("data-morph-pin-phase", phase);
      setVar(root, "--morph-pin-vvh", vvh + "px");
      setVar(root, "--morph-pin-collapse", alignUnstick + "px");
      setVar(root, "--morph-pin-p-letter", String(pLetter));
      setVar(root, "--morph-pin-p-image", String(pImage));
      setVar(root, "--morph-pin-p-shrink", String(pShrink));
      setVar(root, "--morph-pin-p-top", String(pTop));
      setVar(root, "--morph-pin-content-shift", contentShift + "px");

      snapBrandBreakLogoRest(root);
    }

    var frame = 0;
    function onScroll() {
      if (frame) return;
      frame = window.requestAnimationFrame(function () {
        frame = 0;
        sync();
      });
    }

    scroller.addEventListener("scroll", onScroll, { passive: true });
    sync();
    /* Panel slide xong muộn — thử lại snap logo */
    window.setTimeout(function () {
      snapBrandBreakLogoRest(root);
      sync();
    }, 800);
    window.setTimeout(function () {
      snapBrandBreakLogoRest(root);
      sync();
    }, 1600);
  }

  function scan() {
    var nodes = document.querySelectorAll("[data-morph-pin]");
    for (var i = 0; i < nodes.length; i++) bindRoot(nodes[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scan);
  } else {
    scan();
  }

  if (window.MutationObserver) {
    new MutationObserver(scan).observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }
})();
