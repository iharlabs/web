// Capturas de Flow para la web, con la empresa de ejemplo (herramientas/flow-semilla.ts).
// Requiere Flow sin claves en marcha: API en 8791 y Vite en 5181. Uso: npm run capturas
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const APP = 'http://localhost:5181';
const API = 'http://127.0.0.1:8791/api';
const OUT = 'img/flow';
fs.mkdirSync(OUT, { recursive: true });

// la empresa principal (Vértice) y aceptar las condiciones en su nombre (son datos inventados)
const lista = await (await fetch(`${API}/admin/pharmacies`)).json();
const emp = lista.find((m) => m.name.startsWith('Vértice'));
if (!emp) throw new Error('Falta la empresa de ejemplo: ejecute antes la semilla');
const me = await (await fetch(`${API}/me`, { headers: { 'x-dev-user': emp.id } })).json();
if (!me.condiciones?.aceptadas) await fetch(`${API}/pharmacies/${emp.id}/condiciones`, { method: 'POST', headers: { 'x-dev-user': emp.id, 'content-type': 'application/json' }, body: JSON.stringify({ version: me.condiciones.version }) });

// sin el marco ámbar de «local», sin avisos ni el selector de papel de desarrollo
const CSS = `
  .app.no-produccion { box-shadow: none !important; }
  .entorno, .dev-role, select.dev-role, .toast, .toasts { display: none !important; }
  .sidebar .foot select { display: none !important; }
`;
const INIT = (id) => `(() => {
  try { localStorage.setItem('cf:devUser', ${JSON.stringify(id)}); localStorage.setItem('cf:instalar', 'no'); localStorage.setItem('cf:avisoMovil', '1'); } catch {}
  const st = document.createElement('style'); st.textContent = ${JSON.stringify(CSS)};
  const put = () => { const h = document.head || document.documentElement; if (h && !st.isConnected) h.appendChild(st); };
  put(); document.addEventListener('DOMContentLoaded', put);
})();`;

async function abrir({ width, height, scale, movil = false }) {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width, height }, deviceScaleFactor: scale, locale: 'es-ES', timezoneId: 'Europe/Madrid', isMobile: movil, hasTouch: movil,
    userAgent: movil ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' : undefined,
  });
  await context.addInitScript(INIT(emp.id));
  const page = await context.newPage();
  page.on('pageerror', (e) => console.log('pageerror:', e.message));
  await page.goto(APP);
  await page.waitForTimeout(2500);
  return { browser, page };
}

const quieto = async (page) => { await page.mouse.move(5, 5); await page.waitForTimeout(1200); };

/* ---------- ordenador ---------- */
{
  const { browser, page } = await abrir({ width: 1440, height: 900, scale: 2 });
  const shot = async (n, espera = 1500) => { await quieto(page); await page.waitForTimeout(espera); await page.screenshot({ path: `${OUT}/${n}.png` }); console.log(n); };
  const ir = async (t) => { await page.locator('.sidebar nav .item', { hasText: t }).first().click(); };

  await ir('Inicio'); await shot('inicio', 2500);
  await ir('Santander'); await shot('banco');
  await ir('Posición de tesorería'); await shot('posicion');
  await ir('Gráficas'); await shot('graficas', 2500);
  await ir('Comparativa'); await shot('comparativa');

  // extracto del Santander: se clasifica solo con las reglas aprendidas
  await ir('Extractos bancarios'); await page.waitForTimeout(800);
  const sel = page.locator('select').filter({ hasText: 'Santander' }).first();
  if (await sel.count()) await sel.selectOption({ label: 'Santander' }).catch(() => undefined);
  await page.setInputFiles('input[type=file] >> nth=0', 'herramientas/datos/movimientos_santander_noviembre.csv');
  await page.waitForTimeout(3500);
  await shot('extracto');
  await browser.close();
}

/* ---------- móvil ---------- */
{
  const { browser, page } = await abrir({ width: 390, height: 844, scale: 3, movil: true });
  await quieto(page); await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/movil-inicio.png` }); console.log('movil-inicio');
  const tab = async (t) => { await page.locator('nav, footer').locator('button, a', { hasText: t }).first().click().catch(() => undefined); await page.waitForTimeout(1500); };
  await tab('Bancos'); await page.screenshot({ path: `${OUT}/movil-bancos.png` }); console.log('movil-bancos');
  await browser.close();
}
console.log('listo');
