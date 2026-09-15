/* Download page: menu, year, PWA install prompt */
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
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
  }

  if ("serviceWorker" in navigator) {
    var registerSw = function () {
      navigator.serviceWorker.register("/sw.js").catch(function () {});
    };
    if (window.matchMedia && window.matchMedia("(max-width: 700px)").matches) {
      window.addEventListener("load", function () {
        if ("requestIdleCallback" in window) requestIdleCallback(registerSw, { timeout: 4000 });
        else setTimeout(registerSw, 1);
      }, { once: true });
    } else {
      window.addEventListener("load", registerSw, { once: true });
    }
  }

  var installBtn = document.getElementById("gameInstall");
  var installHelp = document.getElementById("gameInstallHelp");
  var deferredInstall = null;
  var isStandalone = (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || window.navigator.standalone === true;

  if (isStandalone && installBtn) {
    installBtn.textContent = "Already on your home screen";
    installBtn.disabled = true;
  }

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredInstall = e;
    if (installBtn) {
      installBtn.disabled = false;
      installBtn.textContent = "Download game on your phone";
    }
  });

  if (installBtn) {
    installBtn.addEventListener("click", function () {
      if (deferredInstall) {
        deferredInstall.prompt();
        deferredInstall.userChoice.finally(function () {
          deferredInstall = null;
        });
        return;
      }
      if (installHelp) installHelp.hidden = false;
    });
  }

  window.addEventListener("appinstalled", function () {
    if (installBtn) {
      installBtn.textContent = "Added to your home screen";
      installBtn.disabled = true;
    }
    if (installHelp) installHelp.hidden = true;
  });
})();
