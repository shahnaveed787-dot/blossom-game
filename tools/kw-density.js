const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const file = process.argv[2] || "index.html";
let html = fs.readFileSync(path.join(root, file), "utf8");

// Strip head, scripts, styles, JSON-LD
html = html.replace(/<head[\s\S]*?<\/head>/i, "");
html = html.replace(/<script[\s\S]*?<\/script>/gi, "");
html = html.replace(/<style[\s\S]*?<\/style>/gi, "");
// Strip tags -> text
let text = html.replace(/<[^>]+>/g, " ");
// Decode a few entities
text = text.replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&[a-z]+;/gi, " ");
text = text.toLowerCase();

const words = text.match(/[a-z0-9']+/g) || [];
const totalWords = words.length;

function countPhrase(phrase) {
  const p = phrase.toLowerCase();
  const re = new RegExp("\\b" + p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "g");
  const m = text.match(re);
  return m ? m.length : 0;
}

const phrases = [
  "blossom game",
  "blossom word game",
  "blossom the game",
  "word game blossom",
  "wordle blossom game",
  "daily blossom word game",
  "blossom word game today online",
  "blossom word game today free unlimited",
];

console.log("FILE:", file);
console.log("Total words:", totalWords);
console.log("");
for (const ph of phrases) {
  const c = countPhrase(ph);
  const per1000 = (c / totalWords) * 1000;
  console.log(
    ph.padEnd(42),
    "count=" + String(c).padStart(3),
    "per1000=" + per1000.toFixed(2)
  );
}
