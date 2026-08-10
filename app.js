/* Blossom Game — lightweight interactions (no dependencies) */
(function () {
  "use strict";

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Embedded game loading ----------
     Desktop keeps its current behaviour: the game loads right away.
     On mobile we show a lightweight poster + Play button and only load the
     third-party game (and its ad/analytics scripts) when the user taps it.
     This keeps those heavy scripts out of the initial mobile load — a large
     mobile performance win — without changing the desktop experience. */
  var gameEmbed = document.querySelector(".game-embed");
  var gameShell = document.querySelector(".game-shell");
  var gameFrame = gameEmbed && gameEmbed.querySelector("iframe[data-src]");
  if (gameFrame) {
    var loadGame = function () {
      if (gameFrame.getAttribute("src")) return;
      // Connect to game host only when the player actually needs the game
      if (!document.querySelector('link[data-game-preconnect]')) {
        var pc = document.createElement("link");
        pc.rel = "preconnect";
        pc.href = "https://blossomwordgame.io";
        pc.crossOrigin = "";
        pc.setAttribute("data-game-preconnect", "1");
        document.head.appendChild(pc);
      }
      gameFrame.src = gameFrame.getAttribute("data-src");
      gameEmbed.classList.add("loaded");
    };
    var poster = gameEmbed.querySelector(".game-poster");
    var isDesktop = window.matchMedia && window.matchMedia("(min-width: 701px)").matches;
    if (isDesktop || !poster) {
      loadGame();
    } else {
      poster.addEventListener("click", loadGame);
    }
  }

  /* Fullscreen for the game shell — native API only, no extra assets */
  var fsBtn = document.getElementById("gameFullscreen");
  if (fsBtn && gameShell) {
    var isFs = function () {
      return document.fullscreenElement === gameShell || document.webkitFullscreenElement === gameShell;
    };
    var syncFsLabel = function () {
      fsBtn.setAttribute("aria-label", isFs() ? "Exit full screen" : "Enter full screen");
      var label = fsBtn.querySelector("span");
      if (label) label.textContent = isFs() ? "Exit" : "Full screen";
    };
    fsBtn.addEventListener("click", function () {
      if (isFs()) {
        (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      } else {
        (gameShell.requestFullscreen || gameShell.webkitRequestFullscreen).call(gameShell);
      }
    });
    document.addEventListener("fullscreenchange", syncFsLabel);
    document.addEventListener("webkitfullscreenchange", syncFsLabel);
  }

  /* ---------- Mobile menu ---------- */
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

  /* ---------- Audience tabs (accessible) ---------- */
  var tablist = document.querySelector(".tablist");
  if (tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
    var selectTab = function (tab) {
      tabs.forEach(function (t) {
        var selected = t === tab;
        t.setAttribute("aria-selected", String(selected));
        t.tabIndex = selected ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) {
          panel.classList.toggle("active", selected);
          if (selected) panel.removeAttribute("hidden");
          else panel.setAttribute("hidden", "");
        }
      });
    };
    tablist.addEventListener("click", function (e) {
      var tab = e.target.closest('[role="tab"]');
      if (tab) selectTab(tab);
    });
    tablist.addEventListener("keydown", function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var n = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") n = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") n = tabs[0];
      else if (e.key === "End") n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); n.focus(); selectTab(n); }
    });
  }

  /* ---------- Interactive flower demo ----------
     On mobile, wait for idle so first paint / Speed Index stay fast. */
  var flower = document.getElementById("flower");
  if (flower) {
    var initDemo = function () {
      var LETTERS = ["G", "A", "R", "D", "E", "N"];
      var VALID = {
        GARDEN: 1, DANGER: 1, GANDER: 1, RANGED: 1,
        GRADE: 1, RANGE: 1, ANGER: 1, GRAND: 1, DENAR: 1,
        DARN: 1, DEAR: 1, READ: 1, DARE: 1, RAGE: 1, GEAR: 1,
        GRAD: 1, RAND: 1, DEAN: 1, DEN: 1, EAR: 1, RAN: 1,
        RAG: 1, AGE: 1, END: 1, RED: 1, AND: 1, ARE: 1,
        EARN: 1, NEAR: 1, NERD: 1, REND: 1
      };
      var picked = [];

      var wordEl = document.getElementById("demoWord");
      var msgEl = document.getElementById("demoMsg");

      var render = function () {
        if (picked.length === 0) {
          wordEl.innerHTML = '<span class="placeholder">Tap petals to build a word…</span>';
        } else {
          wordEl.textContent = picked.map(function (p) { return p.letter; }).join("");
        }
      };
      var setMsg = function (text, win) {
        msgEl.textContent = text;
        msgEl.classList.toggle("win", !!win);
      };

      LETTERS.forEach(function (letter, i) {
        var angle = (360 / LETTERS.length) * i;
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "petal-btn";
        btn.style.setProperty("--a", angle + "deg");
        btn.textContent = letter;
        btn.setAttribute("aria-label", "Letter " + letter);
        btn.addEventListener("click", function () {
          if (btn.classList.contains("used")) return;
          btn.classList.add("used");
          picked.push({ letter: letter, btn: btn });
          render();
          setMsg("Keep going — then press Check.", false);
        });
        flower.appendChild(btn);
      });

      var reset = function () {
        picked.forEach(function (p) { p.btn.classList.remove("used"); });
        picked = [];
        render();
      };

      var clearBtn = document.getElementById("demoClear");
      if (clearBtn) clearBtn.addEventListener("click", function () {
        reset();
        setMsg("Cleared. Build a new word!", false);
      });

      var checkBtn = document.getElementById("demoCheck");
      if (checkBtn) checkBtn.addEventListener("click", function () {
        var word = picked.map(function (p) { return p.letter; }).join("");
        if (word.length < 3) { setMsg("Try a word with at least 3 letters.", false); return; }
        if (VALID[word] === 1) {
          setMsg("🎉 “" + word + "” is a great word! Well done.", true);
          if (wordEl.animate) {
            wordEl.animate(
              [{ transform: "scale(1)" }, { transform: "scale(1.08)" }, { transform: "scale(1)" }],
              { duration: 320, easing: "ease-out" }
            );
          }
        } else {
          setMsg("Hmm, not one we know. Try another combination!", false);
        }
      });

      render();
    };

    /* Init immediately so petal buttons occupy reserved flower space (avoids CLS) */
    initDemo();
  }

  /* ---------- Contact form (client-side validation + mailto) ---------- */
  var contactForm = document.getElementById("contactForm");
  if (contactForm) {
    var statusBox = document.getElementById("formStatus");
    var setField = function (input, valid) {
      var field = input.closest(".field");
      if (field) field.classList.toggle("invalid", !valid);
      return valid;
    };
    var isEmail = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); };

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = contactForm.elements["name"];
      var email = contactForm.elements["email"];
      var message = contactForm.elements["message"];
      var subject = contactForm.elements["subject"];

      var ok = true;
      ok = setField(name, name.value.trim().length > 0) && ok;
      ok = setField(email, isEmail(email.value.trim())) && ok;
      ok = setField(message, message.value.trim().length >= 10) && ok;

      if (!ok) {
        var firstInvalid = contactForm.querySelector(".field.invalid input, .field.invalid textarea");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var subj = "Blossom Game contact: " + (subject ? subject.value : "General question");
      var body =
        "Name: " + name.value.trim() + "\n" +
        "Email: " + email.value.trim() + "\n\n" +
        message.value.trim();
      var mailto = "mailto:support@blossomgamez.com?subject=" +
        encodeURIComponent(subj) + "&body=" + encodeURIComponent(body);

      if (statusBox) statusBox.classList.add("show");
      window.location.href = mailto;
      contactForm.reset();
    });

    // Clear error state as the user corrects a field
    contactForm.addEventListener("input", function (e) {
      var field = e.target.closest(".field");
      if (field) field.classList.remove("invalid");
    });
  }

  /* ---------- Reveal on scroll ----------
     IntersectionObserver only — no getBoundingClientRect (avoids forced reflow / TBT). */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var narrowView = window.matchMedia && window.matchMedia("(max-width: 700px)").matches;

  if (prefersReduced || narrowView || !revealEls.length || !("IntersectionObserver" in window)) {
    // Mobile: show immediately (helps Speed Index; no layout thrash)
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "80px 0px", threshold: 0 });
    revealEls.forEach(function (el) { io.observe(el); });
  }
})();
