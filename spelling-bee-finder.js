/* Spelling Bee solver - NYT hive rules, unofficial helper */
(function () {
  "use strict";

  var DICT_URL = "assets/spelling-bee-dict.txt";
  var dict = null;
  var dictPromise = null;
  var sessionLetters = { petals: ["", "", "", "", "", ""], center: "" };
  var lastResults = [];

  var RANKS = [
    { name: "Beginner", pct: 0 },
    { name: "Good Start", pct: 2 },
    { name: "Moving Up", pct: 5 },
    { name: "Good", pct: 8 },
    { name: "Solid", pct: 15 },
    { name: "Nice", pct: 25 },
    { name: "Great", pct: 40 },
    { name: "Amazing", pct: 50 },
    { name: "Genius", pct: 70 },
    { name: "Queen Bee", pct: 100 }
  ];

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
        return "Enter all 6 outer hive letters (1 character each).";
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

  function wordPoints(r) {
    var pts = r.length === 4 ? 1 : r.length;
    if (r.pangram) pts += 7;
    return pts;
  }

  function estimatedRank(score, max) {
    if (!max) return "Beginner";
    var pct = (score / max) * 100;
    var name = "Beginner";
    for (var i = 0; i < RANKS.length; i++) {
      if (pct + 0.0001 >= RANKS[i].pct) name = RANKS[i].name;
    }
    return name;
  }

  function isBingo(results, unique) {
    var starts = {};
    results.forEach(function (r) {
      starts[r.word.charAt(0)] = true;
    });
    for (var i = 0; i < unique.length; i++) {
      if (!starts[unique[i]]) return false;
    }
    return unique.length === 7;
  }

  function findWords(data, wordList) {
    var center = data.center.toLowerCase();
    var allowed = buildAllowedSet(data);
    var unique = uniqueLetters(data);
    var results = [];

    for (var i = 0; i < wordList.length; i++) {
      var w = wordList[i];
      if (!w || w.indexOf(center) === -1) continue;
      if (!wordUsesOnlyAllowed(w, allowed)) continue;
      var pangram = isPangram(w, unique);
      results.push({
        word: w,
        length: w.length,
        pangram: pangram,
        perfect: pangram && w.length === unique.length
      });
    }

    results.forEach(function (r) {
      r.points = wordPoints(r);
    });

    results.sort(function (a, b) {
      if (a.length !== b.length) return a.length - b.length;
      return a.word < b.word ? -1 : a.word > b.word ? 1 : 0;
    });

    return { results: results, unique: unique };
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

  function totalPoints(results) {
    var n = 0;
    for (var i = 0; i < results.length; i++) n += results[i].points;
    return n;
  }

  function renderStats(results, unique) {
    var pangrams = results.filter(function (r) { return r.pangram; });
    var perfect = results.filter(function (r) { return r.perfect; });
    var max = totalPoints(results);
    var stats = document.createElement("div");
    stats.className = "finder-stats";
    var bits = [
      results.length + " words",
      max + " pts",
      pangrams.length + " pangram" + (pangrams.length === 1 ? "" : "s")
    ];
    if (perfect.length) bits.push(perfect.length + " perfect");
    bits.push(isBingo(results, unique) ? "bingo" : "no bingo");
    bits.push("est. Genius ~" + Math.round(max * 0.7) + " pts");
    bits.forEach(function (t) {
      var s = document.createElement("span");
      s.textContent = t;
      stats.appendChild(s);
    });
    els.results.appendChild(stats);
  }

  function renderGrid(results, unique) {
    var lengths = {};
    results.forEach(function (r) { lengths[r.length] = true; });
    var cols = Object.keys(lengths).map(Number).sort(function (a, b) { return a - b; });
    var pangramStarts = {};
    results.forEach(function (r) {
      if (r.pangram) pangramStarts[r.word.charAt(0)] = true;
    });

    var wrap = document.createElement("div");
    wrap.className = "bee-grid-wrap";
    var table = document.createElement("table");
    table.className = "bee-grid";
    table.setAttribute("aria-label", "Hint grid by starting letter and word length");

    var thead = document.createElement("thead");
    var hr = document.createElement("tr");
    hr.appendChild(th(""));
    cols.forEach(function (c) { hr.appendChild(th(String(c))); });
    hr.appendChild(th("tot"));
    thead.appendChild(hr);
    table.appendChild(thead);

    var tbody = document.createElement("tbody");
    var colTot = {};
    cols.forEach(function (c) { colTot[c] = 0; });
    var grand = 0;

    unique.slice().sort().forEach(function (letter) {
      var tr = document.createElement("tr");
      if (pangramStarts[letter]) tr.className = "bee-grid--pangram";
      tr.appendChild(td(letter.toUpperCase()));
      var rowTot = 0;
      cols.forEach(function (len) {
        var n = 0;
        results.forEach(function (r) {
          if (r.word.charAt(0) === letter && r.length === len) n++;
        });
        rowTot += n;
        colTot[len] += n;
        tr.appendChild(td(n ? String(n) : "-"));
      });
      grand += rowTot;
      tr.appendChild(td(String(rowTot)));
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    var tfoot = document.createElement("tfoot");
    var fr = document.createElement("tr");
    fr.appendChild(td("tot"));
    cols.forEach(function (len) { fr.appendChild(td(String(colTot[len]))); });
    fr.appendChild(td(String(grand)));
    tfoot.appendChild(fr);
    table.appendChild(tfoot);

    wrap.appendChild(table);
    els.results.appendChild(wrap);
  }

  function th(text) {
    var el = document.createElement("th");
    el.textContent = text;
    return el;
  }

  function td(text) {
    var el = document.createElement("td");
    el.textContent = text;
    return el;
  }

  function renderResults(pack) {
    var results = pack.results;
    var unique = pack.unique;
    lastResults = results;
    els.results.innerHTML = "";

    if (!results.length) {
      els.results.innerHTML = "<p class=\"finder-empty\">No valid words found for these letters. Double-check the center letter and the six outer letters.</p>";
      els.copyBtn.hidden = true;
      return;
    }

    renderStats(results, unique);

    if (hintModeOn()) {
      renderHints(results, unique);
      els.copyBtn.hidden = true;
      return;
    }

    els.copyBtn.hidden = false;
    renderGrid(results, unique);

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
        var pts = "<span class=\"finder-word__pts\">" + r.points + " pts</span>";
        if (r.pangram) {
          li.className = "finder-word--pangram";
          li.innerHTML = "<span class=\"finder-word__text\">" + r.word + "</span>" + pts +
            "<span class=\"finder-badge\">" + (r.perfect ? "Perfect pangram" : "Pangram") + "</span>";
        } else {
          li.innerHTML = "<span class=\"finder-word__text\">" + r.word + "</span>" + pts;
        }
        list.appendChild(li);
      });

      group.appendChild(list);
      els.results.appendChild(group);
    });
  }

  function renderHints(results, unique) {
    var style = hintStyle();

    if (style === "grid") {
      renderGrid(results, unique);
      var note = document.createElement("p");
      note.className = "finder-summary";
      note.textContent = "Highlighted starting letters have at least one pangram. This grid is a hint, not the official NYT answer key.";
      els.results.appendChild(note);
      return;
    }

    var wrap = document.createElement("div");
    wrap.className = "finder-hints";

    if (style === "count") {
      var p = document.createElement("p");
      p.className = "finder-hint-count";
      p.textContent = results.length + " valid words remain for these letters (" + totalPoints(results) + " pts in this dictionary).";
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
          li.textContent = r.word.charAt(0).toUpperCase() + "...";
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
          var pack = findWords(data, wordList);
          setLoading(false);
          renderResults(pack);
          if (pack.results.length) {
            var max = totalPoints(pack.results);
            setStatus("Unofficial list. NYT uses an editor-curated hive. Letters can repeat. Estimated Genius is about " + Math.round(max * 0.7) + " of " + max + " pts in this dictionary.");
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
      setStatus("Copy failed. Select words manually.", true);
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
    if (lastResults.length) {
      var unique = [];
      var seen = {};
      lastResults.forEach(function (r) {
        for (var i = 0; i < r.word.length; i++) {
          var c = r.word.charAt(i);
          if (!seen[c]) { seen[c] = true; unique.push(c); }
        }
      });
      unique.sort();
      renderResults({ results: lastResults, unique: unique });
    }
  }

  function init() {
    var root = $("beeFinder");
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
    els.hintStyle.disabled = !els.hintMode.checked;

    root.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && (e.target.classList.contains("finder-letter") || e.target === els.findBtn)) {
        e.preventDefault();
        runSearch();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
