// Saca las imágenes de redes (perfil y portadas) de herramientas/redes.html a la carpeta redes/.
// Uso: node herramientas/redes.mjs
import { chromium } from 'playwright-core';
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const PIEZAS = {
  'perfil-azul': 'Logo de perfil (azul) 1080x1080.png',
  'perfil-oscuro': 'Logo de perfil (oscuro) 1080x1080.png',
  'portada-linkedin': 'Portada LinkedIn 1584x396.png',
  'portada-ancha': 'Portada X - Facebook - YouTube 1500x500.png',
  'post-presentacion': 'Primera publicacion Instagram 1080x1080.png',
};
fs.mkdirSync('redes', { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await b.newPage({ viewport: { width: 1700, height: 1200 }, deviceScaleFactor: 1 });
await p.goto(pathToFileURL(path.resolve('herramientas/redes.html')).href);
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(400);
for (const [id, nombre] of Object.entries(PIEZAS)) { await p.locator(`#${id}`).screenshot({ path: path.join('redes', nombre) }); console.log(nombre); }
await b.close();
