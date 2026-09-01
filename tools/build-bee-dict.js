const fs = require("fs");
const path = require("path");

const words = require("an-array-of-english-words");
const out = path.join(__dirname, "..", "assets", "spelling-bee-dict.txt");

const filtered = words.filter(function (w) {
  return w.length >= 4 && w.length <= 15 && /^[a-z]+$/.test(w);
});

filtered.sort();
fs.writeFileSync(out, filtered.join("\n"));
console.log("spelling-bee-dict.txt", filtered.length, "words", fs.statSync(out).size, "bytes");
