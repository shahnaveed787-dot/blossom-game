/* Blossom Word Finder — client-side solver for Merriam-Webster Blossom rules */
(function () {
  "use strict";

  var DICT_URL = "assets/blossom-dict.txt";
  var dict = null;
  var dictPromise = null;
  var sessionLetters = { petals: ["", "", "", "", "", ""], center: "" };
  var lastResults = [];

  var els = {};

  function $(id) { return document.getElementById(id); }

  function loadDictionary() {
    if (dict) return Promise.resolve(dict);
    if (dictPromise) return dictPromise;
    dictPromise = fetch(DICT_URL)
      .then(function (r) {
        if (!r.ok) throw new Error("Dictionary failed to load");
        return r.text();
      })
      .then(function (text) {
        dict = text.split("\n");
        return dict;
      });
    return dictPromise;
  }

  function getInputs() {
    var petals = [];
    for (var i = 0; i < 6; i++) {
      petals.push((els.petals[i].value || "").trim().toUpperCase());
    }
    var center = (els.center.value || "").trim().toUpperCase();
    return { petals: petals, center: center };
  }

  function saveSession() {
    var data = getInputs();
    sessionLetters.petals = data.petals.slice();
    sessionLetters.center = data.center;
  }

  function restoreSession() {
    for (var i = 0; i < 6; i++) {
      els.petals[i].value = sessionLetters.petals[i] || "";
    }
    els.center.value = sessionLetters.center || "";
  }

  function validateInputs(data) {
    if (!/^[A-Z]$/.test(data.center)) {
      return "Enter the center letter (1 character). Every word must include it.";
    }
    for (var i = 0; i < 6; i++) {
      if (!/^[A-Z]$/.test(data.petals[i])) {
        return "Enter all 6 petal letters (1 character each).";
      }
    }
    return "";
  }

  function buildAllowedSet(data) {
    var set = {};
    set[data.center.toLowerCase()] = true;
    for (var i = 0; i < 6; i++) {
      set[data.petals[i].toLowerCase()] = true;
    }
    return set;
  }

  function wordUsesOnlyAllowed(word, allowed) {
    for (var i = 0; i < word.length; i++) {
      if (!allowed[word[i]]) return false;
    }
    return true;
  }

  function uniqueLetters(data) {
    var seen = {};
    var list = [];
    var all = data.petals.concat([data.center]);
    for (var i = 0; i < all.length; i++) {
      var c = all[i].toLowerCase();
      if (!seen[c]) {
        seen[c] = true;
        list.push(c);
      }
    }
    return list;
  }

  function isPangram(word, unique) {
    for (var i = 0; i < unique.length; i++) {
      if (word.indexOf(unique[i]) === -1) return false;
    }
    return true;
  }

  function findWords(data, wordList) {
    var center = data.center.toLowerCase();
    var allowed = buildAllowedSet(data);
    var unique = uniqueLetters(data);
    var results = [];

    for (var i = 0; i < wordList.length; i++) {
      var w = wordList[i];
      if (w.indexOf(center) === -1) continue;
      if (!wordUsesOnlyAllowed(w, allowed)) continue;
      results.push({
        word: w,
        length: w.length,
        pangram: isPangram(w, unique)
      });
    }

    results.sort(function (a, b) {
      if (a.length !== b.length) return a.length - b.length;
      return a.word < b.word ? -1 : a.word > b.word ? 1 : 0;
    });

    return results;
  }

  function setLoading(on) {
    els.loading.hidden = !on;
    els.findBtn.disabled = on;
  }

  function setStatus(msg, isError) {
    els.status.textContent = msg || "";
    els.status.classList.toggle("finder-status--error", !!isError);
  }

  function hintModeOn() {
    return els.hintMode.checked;
  }

  function hintStyle() {
    return els.hintStyle.value;
  }

  function renderResults(results) {
    lastResults = results;
    els.results.innerHTML = "";

    if (!results.length) {
      els.results.innerHTML = "<p class=\"finder-empty\">No valid words found for these letters. Double-check the center letter and petal letters.</p>";
      els.copyBtn.hidden = true;
      return;
    }

    var pangrams = results.filter(function (r) { return r.pangram; });
    var summary = document.createElement("p");
    summary.className = "finder-summary";
    summary.textContent = results.length + " word" + (results.length === 1 ? "" : "s") + " found";
    if (pangrams.length) {
      summary.textContent += " · " + pangrams.length + " pangram" + (pangrams.length === 1 ? "" : "s");
    }
    els.results.appendChild(summary);

    if (hintModeOn()) {
      renderHints(results);
      els.copyBtn.hidden = true;
      return;
    }

    els.copyBtn.hidden = false;

    var byLen = {};
    results.forEach(function (r) {
      if (!byLen[r.length]) byLen[r.length] = [];
      byLen[r.length].push(r);
    });

    Object.keys(byLen).sort(function (a, b) { return Number(a) - Number(b); }).forEach(function (len) {
      var group = document.createElement("div");
      group.className = "finder-group";

      var heading = document.createElement("h3");
      heading.className = "finder-group__title";
      heading.textContent = len + " letters (" + byLen[len].length + ")";
      group.appendChild(heading);

      var list = document.createElement("ul");
      list.className = "finder-wordlist";

      byLen[len].forEach(function (r) {
        var li = document.createElement("li");
        if (r.pangram) {
          li.className = "finder-word--pangram";
          li.innerHTML = "<span class=\"finder-word__text\">" + r.word + "</span><span class=\"finder-badge\">Pangram ✿</span>";
        } else {
          li.textContent = r.word;
        }
        list.appendChild(li);
      });

      group.appendChild(list);
      els.results.appendChild(group);
    });
  }

  function renderHints(results) {
    var style = hintStyle();
    var wrap = document.createElement("div");
    wrap.className = "finder-hints";

    if (style === "count") {
      var p = document.createElement("p");
      p.className = "finder-hint-count";
      p.textContent = results.length + " valid words remain for these letters.";
      wrap.appendChild(p);
      els.results.appendChild(wrap);
      return;
    }

    var byLen = {};
    results.forEach(function (r) {
      if (!byLen[r.length]) byLen[r.length] = [];
      byLen[r.length].push(r);
    });

    Object.keys(byLen).sort(function (a, b) { return Number(a) - Number(b); }).forEach(function (len) {
      var group = document.createElement("div");
      group.className = "finder-group";

      var heading = document.createElement("h3");
      heading.className = "finder-group__title";
      heading.textContent = len + " letters (" + byLen[len].length + ")";
      group.appendChild(heading);

      var list = document.createElement("ul");
      list.className = "finder-wordlist finder-wordlist--hints";

      byLen[len].forEach(function (r) {
        var li = document.createElement("li");
        if (style === "first") {
          li.textContent = r.word.charAt(0).toUpperCase() + "…";
        } else if (style === "length") {
          li.textContent = len + " letters";
        }
        if (r.pangram) li.className = "finder-word--pangram";
        list.appendChild(li);
      });

      group.appendChild(list);
      wrap.appendChild(group);
    });

    els.results.appendChild(wrap);
  }

  function runSearch() {
    saveSession();
    var data = getInputs();
    var err = validateInputs(data);
    if (err) {
      setStatus(err, true);
      els.results.innerHTML = "";
      els.copyBtn.hidden = true;
      return;
    }

    setStatus("");
    setLoading(true);
    els.results.innerHTML = "";

    loadDictionary().then(function (wordList) {
      requestAnimationFrame(function () {
        setTimeout(function () {
          var results = findWords(data, wordList);
          setLoading(false);
          renderResults(results);
          if (results.length) {
            setStatus("Letters can repeat in words — each character must be one of your 7 puzzle letters.");
          }
        }, 40);
      });
    }).catch(function () {
      setLoading(false);
      setStatus("Could not load the word dictionary. Please refresh and try again.", true);
    });
  }

  function clearAll() {
    for (var i = 0; i < 6; i++) els.petals[i].value = "";
    els.center.value = "";
    sessionLetters = { petals: ["", "", "", "", "", ""], center: "" };
    els.results.innerHTML = "";
    els.copyBtn.hidden = true;
    setStatus("");
    lastResults = [];
    els.petals[0].focus();
  }

  function copyResults() {
    if (!lastResults.length || hintModeOn()) return;
    var text = lastResults.map(function (r) { return r.word; }).join("\n");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        setStatus("Copied " + lastResults.length + " words to clipboard.");
      }).catch(function () {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      setStatus("Copied " + lastResults.length + " words to clipboard.");
    } catch (e) {
      setStatus("Copy failed — select words manually.", true);
    }
    document.body.removeChild(ta);
  }

  function sanitizeLetter(value) {
    return value.replace(/[^a-zA-Z]/g, "").slice(-1).toUpperCase();
  }

  function bindLetterInput(input, nextInput, prevInput) {
    input.addEventListener("input", function () {
      input.value = sanitizeLetter(input.value);
      saveSession();
      if (input.value.length === 1 && nextInput) nextInput.focus();
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Backspace" && !input.value && prevInput) {
        prevInput.focus();
      }
    });
    input.addEventListener("paste", function (e) {
      e.preventDefault();
      var text = (e.clipboardData || window.clipboardData).getData("text").replace(/[^a-zA-Z]/g, "").toUpperCase();
      if (!text) return;
      var inputs = els.petals.concat([els.center]);
      var start = inputs.indexOf(input);
      for (var i = 0; i < text.length && start + i < inputs.length; i++) {
        inputs[start + i].value = text.charAt(i);
      }
      saveSession();
      var focusIdx = Math.min(start + text.length, inputs.length - 1);
      inputs[focusIdx].focus();
    });
  }

  function syncHintStyle() {
    els.hintStyle.disabled = !els.hintMode.checked;
    if (lastResults.length) renderResults(lastResults);
  }

  function init() {
    var root = $("blossomFinder");
    if (!root) return;

    els.petals = [];
    for (var i = 0; i < 6; i++) {
      els.petals.push($("finderPetal" + i));
    }
    els.center = $("finderCenter");
    els.findBtn = $("finderFind");
    els.clearBtn = $("finderClear");
    els.copyBtn = $("finderCopy");
    els.hintMode = $("finderHintMode");
    els.hintStyle = $("finderHintStyle");
    els.results = $("finderResults");
    els.status = $("finderStatus");
    els.loading = $("finderLoading");

    restoreSession();

    for (var p = 0; p < 6; p++) {
      bindLetterInput(
        els.petals[p],
        p < 5 ? els.petals[p + 1] : els.center,
        p > 0 ? els.petals[p - 1] : null
      );
    }
    bindLetterInput(els.center, null, els.petals[5]);

    els.findBtn.addEventListener("click", runSearch);
    els.clearBtn.addEventListener("click", clearAll);
    els.copyBtn.addEventListener("click", copyResults);
    els.hintMode.addEventListener("change", syncHintStyle);
    els.hintStyle.addEventListener("change", syncHintStyle);

    root.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && (e.target.classList.contains("finder-letter") || e.target === els.findBtn)) {
        e.preventDefault();
        runSearch();
      }
    });

    loadDictionary();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
