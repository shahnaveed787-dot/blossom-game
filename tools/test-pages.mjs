import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(__dirname, "shots");
fs.mkdirSync(SHOTS, { recursive: true });

const BASE = process.env.BASE || "http://localhost:5177/";
const PAGES = ["about-us", "contact-us", "terms-and-conditions", "privacy-policy", "dmca"];
const results = [];
const log = (ok, msg) => { results.push({ ok, msg }); console.log((ok ? "PASS " : "FAIL ") + msg); };

let browser;
for (const channel of ["chrome", "msedge"]) {
  try { browser = await chromium.launch({ channel }); console.log("Using channel:", channel); break; }
  catch (e) { console.log("channel " + channel + " unavailable"); }
}
if (!browser) browser = await chromium.launch();

async function checkPage(page, name, width, isMobile) {
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  await page.goto(BASE + name, { waitUntil: "networkidle" });

  const h1 = await page.locator("h1").count();
  log(h1 === 1, `${name} @${width}: exactly one <h1> (${h1})`);

  const hs = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  log(!hs, `${name} @${width}: no horizontal scrolling`);

  // header + footer present
  log(await page.locator("header .brand").isVisible(), `${name} @${width}: header present`);
  log((await page.locator(".footer-legal a").count()) === 5, `${name} @${width}: footer legal links present`);

  await page.screenshot({ path: path.join(SHOTS, `${name.replace(".html","")}-${width}.png`), fullPage: false });
  log(errors.length === 0, `${name} @${width}: no console errors ${errors.length ? JSON.stringify(errors.slice(0,2)) : ""}`);
  return errors;
}

for (const width of [1440, 390]) {
  const isMobile = width < 768;
  const ctx = await browser.newContext({ viewport: { width, height: isMobile ? 844 : 900 }, isMobile, hasTouch: isMobile, deviceScaleFactor: isMobile ? 2 : 1 });
  const page = await ctx.newPage();
  for (const p of PAGES) await checkPage(page, p, width, isMobile);
  await ctx.close();
}

// Contact form: invalid submit shows errors; valid submit shows success
{
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "contact-us", { waitUntil: "networkidle" });

  await page.locator("#contactForm button[type=submit]").click();
  await page.waitForTimeout(200);
  const invalidCount = await page.locator(".field.invalid").count();
  log(invalidCount >= 2, `contact: empty submit flags required fields (${invalidCount})`);

  await page.fill("#cf-name", "Alex Parent");
  await page.fill("#cf-email", "not-an-email");
  await page.fill("#cf-message", "short");
  await page.locator("#contactForm button[type=submit]").click();
  await page.waitForTimeout(200);
  const emailInvalid = await page.locator("#cf-email").evaluate((el) => el.closest(".field").classList.contains("invalid"));
  log(emailInvalid, "contact: invalid email is flagged");

  // Valid: block navigation to mailto so the test can observe success state
  await page.route("**", (route) => {
    if (route.request().url().startsWith("mailto:")) return route.abort();
    return route.continue();
  });
  await page.fill("#cf-email", "alex@example.com");
  await page.fill("#cf-message", "I love this game, my class uses it every day!");
  await page.locator("#contactForm button[type=submit]").click();
  await page.waitForTimeout(300);
  const success = await page.locator("#formStatus").evaluate((el) => el.classList.contains("show"));
  log(success, "contact: valid submit shows success status");
  await page.screenshot({ path: path.join(SHOTS, "contact-success.png") });
  await ctx.close();
}

// Clean-URL behaviour
{
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  const page = await ctx.newPage();

  // Extensionless URL serves the page
  const r1 = await page.goto(BASE + "about-us", { waitUntil: "domcontentloaded" });
  log(r1.status() === 200 && (await page.locator("h1").innerText()).includes("About"), "clean URL /about-us serves About page");

  // .html redirects (301) to the clean URL
  const r2 = await page.goto(BASE + "about-us.html", { waitUntil: "domcontentloaded" });
  log(page.url().endsWith("/about-us"), `/.html redirects to clean URL (final: ${page.url()})`);

  // Homepage nav "About Us" points to the clean URL
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  const href = await page.locator('.nav-links a', { hasText: "About Us" }).getAttribute("href");
  log(href === "/about-us", `nav About Us -> ${href}`);

  await ctx.close();
}

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n==== ${results.length - failed.length}/${results.length} checks passed ====`);
if (failed.length) { console.log("FAILURES:"); failed.forEach((f) => console.log(" - " + f.msg)); process.exit(1); }
