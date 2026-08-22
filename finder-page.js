/* Minimal interactions for Blossom Word Finder page (no app.js) */
(function () {
  "use strict";

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("mobileMenu");
  if (toggle && menu) {
    var setMenu = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.classList.toggle("open", open);
    };
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    }, { passive: true });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    }, { passive: true });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
  }

  var finderLoaded = false;
  function loadFinder() {
    if (finderLoaded) return;
    finderLoaded = true;
    var s = document.createElement("script");
    s.src = document.currentScript && document.currentScript.getAttribute("data-finder-src")
      ? document.currentScript.getAttribute("data-finder-src")
      : "blossom-finder.js?v=25";
    s.defer = true;
    document.body.appendChild(s);
  }

  var root = document.getElementById("blossomFinder");
  if (root) {
    root.addEventListener("focusin", loadFinder, { once: true, capture: true });
    root.addEventListener("pointerdown", loadFinder, { once: true, passive: true });
  }
})();
