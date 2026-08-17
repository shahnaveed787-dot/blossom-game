const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const htmlPath = path.join(root, "index.html");
let html = fs.readFileSync(htmlPath, "utf8");

const schema = fs.readFileSync(path.join(__dirname, "schema-0.json"), "utf8").trim();
fs.writeFileSync(path.join(root, "schema.json"), schema);

// Move hero demo into <template> so mobile first paint skips that DOM subtree.
const demoRe =
  /(\s*)<!-- Interactive mini demo -->\s*<div class="hero-visual">([\s\S]*?)<\/div>(\s*)<\/div>\s*<\/section>/;
const m = html.match(demoRe);
if (!m) {
  console.log("hero-visual block not found or already templated");
} else {
  const indent = m[1];
  const inner = m[2];
  const replaced =
    indent +
    "<!-- Demo stamped on desktop only (keeps mobile Speed Index / first paint light). -->\n" +
    indent +
    '<div class="hero-visual" id="heroDemoMount"></div>\n' +
    indent +
    '<template id="heroDemoTpl">' +
    inner +
    "</template>\n" +
    indent +
    "<script>\n" +
    indent +
    "  (function () {\n" +
    indent +
    "    try {\n" +
    indent +
    "      if (!window.matchMedia || !window.matchMedia('(min-width: 701px)').matches) return;\n" +
    indent +
    "      var mount = document.getElementById('heroDemoMount');\n" +
    indent +
    "      var tpl = document.getElementById('heroDemoTpl');\n" +
    indent +
    "      if (mount && tpl && !mount.firstChild) mount.appendChild(tpl.content.cloneNode(true));\n" +
    indent +
    "    } catch (e) {}\n" +
    indent +
    "  })();\n" +
    indent +
    "</script>\n" +
    m[3] +
    "</div>\n" +
    "    </section>";
  html = html.replace(demoRe, replaced);
  console.log("templated hero demo");
}

// Restore schema if missing
if (!html.includes("application/ld+json")) {
  html = html.replace(
    /\s*<\/body>\s*<\/html>\s*$/,
    "\n\n  <script type=\"application/ld+json\">\n" +
      schema +
      "\n  </script>\n</body>\n</html>\n"
  );
  console.log("restored schema");
} else {
  console.log("schema already present");
}

fs.writeFileSync(htmlPath, html);
console.log("html", html.length);
