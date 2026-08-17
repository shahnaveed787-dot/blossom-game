const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const VER = "22";
const pages = ["about-us.html", "contact-us.html", "privacy-policy.html", "terms-and-conditions.html", "dmca.html"];

const cssBlock =
  '  <link rel="preload" href="assets/fonts/fredoka-latin.woff2" as="font" type="font/woff2" crossorigin media="(min-width: 701px)" />\n' +
  '  <link rel="stylesheet" href="styles.min.css?v=' + VER + '" />\n';

for (const file of pages) {
  let html = fs.readFileSync(path.join(root, file), "utf8");
  html = html.replace(/^<<<<<<< HEAD[\s\S]*?=======[\s\S]*?>>>>>>>[^\n]*\n?/gm, "");
  html = html.replace(/^<<<<<<< HEAD\n?/gm, "");
  html = html.replace(/^=======[\s\S]*?>>>>>>>[^\n]*\n?/gm, "");
  html = html.replace(/<link rel="preload" href="assets\/fonts\/fredoka[^>]*>\s*\n?\s*<link rel="stylesheet" href="styles\.min\.css\?v=\d+"[^>]*>\s*/g, cssBlock);
  html = html.replace(/<link rel="stylesheet" href="styles\.min\.css\?v=\d+"[^>]*>\s*/g, cssBlock);
  html = html.replace(/app\.js\?v=\d+/g, "app.js?v=" + VER);
  html = html.replace(/styles\.min\.css\?v=\d+/g, "styles.min.css?v=" + VER);
  fs.writeFileSync(path.join(root, file), html);
  console.log("fixed", file);
}
