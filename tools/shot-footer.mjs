import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let browser;
for (const channel of ["chrome", "msedge"]) { try { browser = await chromium.launch({ channel }); break; } catch {} }
if (!browser) browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 } });
const page = await ctx.newPage();
await page.goto("http://localhost:5177/", { waitUntil: "networkidle" });
await page.locator(".site-footer").scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
await page.locator(".site-footer").screenshot({ path: path.join(__dirname, "shots", "footer.png") });
await browser.close();
console.log("footer shot done");
