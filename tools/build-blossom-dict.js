const fs = require("fs");
const path = require("path");

const words = require("an-array-of-english-words");
const out = path.join(__dirname, "..", "assets", "blossom-dict.txt");

const filtered = words.filter(function (w) {
  return w.length >= 4 && w.length <= 7 && /^[a-z]+$/.test(w);
});

filtered.sort();
fs.writeFileSync(out, filtered.join("\n"));
console.log("blossom-dict.txt", filtered.length, "words", fs.statSync(out).size, "bytes");
