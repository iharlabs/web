// Fotos de la web para revisarla: node herramientas/ver.mjs <carpeta de salida>
import { chromium } from 'playwright-core';
const out = process.argv[2] || '.';
const b = await chromium.launch({ channel: 'chrome', headless: true });
for (const [n, w, h, m] of [['escritorio', 1440, 900, false], ['movil', 390, 844, true]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: m, hasTouch: m, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  const errores = []; p.on('pageerror', (e) => errores.push(e.message)); p.on('console', (c) => { if (c.type() === 'error') errores.push(c.text()); });
  await p.goto('http://127.0.0.1:5190/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  const alto = await p.evaluate(() => document.documentElement.scrollHeight);
  const ancho = await p.evaluate(() => document.documentElement.scrollWidth);
  console.log(n, 'alto', alto, 'ancho', ancho, 'errores', JSON.stringify(errores));
  for (let y = 0, i = 0; y < alto; y += h, i++) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(250); await p.screenshot({ path: `${out}/${n}-${String(i).padStart(2, '0')}.png` }); }
  await ctx.close();
}
await b.close();
