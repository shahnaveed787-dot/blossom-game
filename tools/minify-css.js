const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const min = css
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\s+/g, " ")
  .replace(/\s*([{}:;,>~+])\s*/g, "$1")
  .replace(/;}/g, "}")
  .trim();
fs.writeFileSync(path.join(root, "styles.min.css"), min);
console.log("styles.min.css", min.length);
