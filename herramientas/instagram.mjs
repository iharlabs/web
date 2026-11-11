// Saca las 3 publicaciones de Instagram (15 imágenes de 1080 × 1350) de herramientas/instagram.html
// a redes/instagram/. Uso: node herramientas/instagram.mjs
import { chromium } from 'playwright-core';
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const NOMBRES = { p1: '1 - Que hacemos', p2: '2 - Ya lo hemos hecho', p3: '3 - Como funciona' };
const out = path.join('redes', 'instagram');
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await b.newPage({ viewport: { width: 1200, height: 1500 }, deviceScaleFactor: 1 });
await p.goto(pathToFileURL(path.resolve('herramientas/instagram.html')).href, { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(500);
for (const pub of Object.keys(NOMBRES)) for (let i = 1; i <= 5; i++) {
  const el = p.locator(`#${pub}-${i}`);
  // aviso si algo se sale de la imagen
  const desborda = await el.evaluate((s) => [...s.children].filter((c) => !c.classList.contains('pie')).some((c) => c.getBoundingClientRect().bottom > s.getBoundingClientRect().bottom - 150 || c.getBoundingClientRect().right > s.getBoundingClientRect().right - 40));
  const nombre = `${NOMBRES[pub]} - ${i} de 5.png`;
  await el.screenshot({ path: path.join(out, nombre) });
  console.log(nombre, desborda ? '  ← REVISAR: algo se acerca al borde' : '');
}
await b.close();
