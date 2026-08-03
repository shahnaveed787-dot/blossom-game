/* Minimal zero-dependency static file server for local testing. */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PORT = process.env.PORT || 5177;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

const send = (res, filePath, data) => {
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { "Content-Type": TYPES[ext] || "application/octet-stream" });
  res.end(data);
};

http
  .createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split("?")[0]);

    // Mirror .htaccess clean-URL behaviour for local testing:
    // redirect /index(.html) -> / and /page.html -> /page
    if (/^\/index(?:\.html)?$/.test(urlPath)) {
      res.writeHead(301, { Location: "/" });
      return res.end();
    }
    const htmlMatch = urlPath.match(/^\/(.+)\.html$/);
    if (htmlMatch) {
      res.writeHead(301, { Location: "/" + htmlMatch[1] });
      return res.end();
    }

    if (urlPath === "/") urlPath = "/index.html";

    let filePath = path.join(ROOT, urlPath);
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403);
      return res.end("Forbidden");
    }

    fs.readFile(filePath, (err, data) => {
      if (!err) return send(res, filePath, data);
      // Extensionless URL -> try the matching .html file
      if (!path.extname(filePath)) {
        const htmlPath = filePath.replace(/[\\/]?$/, "") + ".html";
        return fs.readFile(htmlPath, (e2, d2) => {
          if (!e2) return send(res, htmlPath, d2);
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("Not found: " + urlPath);
        });
      }
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found: " + urlPath);
    });
  })
  .listen(PORT, () => console.log("Blossom dev server on http://localhost:" + PORT));
