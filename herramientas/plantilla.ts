// Saca de Flow la plantilla gratuita de tesorería por decenas (vacía, sin datos de nadie), con una hoja de
// instrucciones pensada para quien la usa en Excel (la del exportador habla de la aplicación).
// Uso: npx tsx herramientas/plantilla.ts  → descargas/plantilla-tesoreria-por-decenas.xlsx
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const FLOW = path.resolve('../Cash Flow Empresas/src');
// copia del exportador de Flow con otra hoja de instrucciones (Flow no se toca)
let src = fs.readFileSync(path.join(FLOW, 'exporters/excel.ts'), 'utf8');
src = src.replace(/from '\.\.\/([^']+)'/g, (_, p) => `from '${pathToFileURL(path.join(FLOW, p)).href}'`)
         .replace(/from '\.\/([^']+)'/g, (_, p) => `from '${pathToFileURL(path.join(FLOW, 'exporters', p)).href}'`);
const ini = src.indexOf('function instruccionesSheet(');
const fin = src.indexOf('/* ---------- libro completo ---------- */');
if (ini < 0 || fin < 0) throw new Error('El exportador de Flow ha cambiado: revise herramientas/plantilla.ts');
src = src.slice(0, ini) + `function instruccionesSheet(p: Project, banks: Bank[], nombres: Map<string, string>): XSheetW {
  const s = new XSheetW('Instrucciones');
  s.col(0, 0, 6); s.col(1, 1, 38); s.col(2, 2, 110);
  s.set(1, 0, 'Plantilla de tesorería por decenas', TITLE);
  s.set(1, 1, 'Gratis, de Ihar Labs (iharlabs.com). Las fórmulas están vivas: escriba los importes y se recalculan solos los totales, los saldos, el cuadre y la posición.', MUTED);
  ['Paso', 'Qué hacer', 'Cómo'].forEach((h, i) => s.set(i, 3, h, HDR));
  const pasos: [string, string][] = [
    ['Ponga sus bancos', 'Hay una hoja por banco. Cámbiele el nombre a la pestaña (Banco 1, Banco 2) por el de su banco: las demás hojas se actualizan solas. La plantilla trae dos bancos.'],
    ['Escriba el saldo inicial', 'En la hoja de cada banco, fila 4 «Saldo Inicial», primera decena: el saldo con el que empieza el año. A partir de ahí, el saldo inicial de cada decena es el final de la anterior.'],
    ['Cada diez días, lo que entra y lo que sale', 'El año va por decenas: del 1 al 10, del 11 al 20 y del 21 a fin de mes. Escriba cada cobro y cada pago en su línea y en su decena. Las líneas que empiezan por RE son entradas; las que empiezan por RS, salidas. Puede cambiar el texto de las líneas.'],
    ['Cuadre con el banco', 'Escriba en «Saldo Final según bancos» el saldo real del extracto al cerrar la decena. Si la diferencia con lo calculado es menor que la tolerancia (celda D4), se pinta de verde: la decena cuadra.'],
    ['Mire la posición', 'Posición Tesorería d suma todos los bancos por decenas y la m por meses. La Comparativa explica por qué un periodo fue mejor o peor que el anterior.'],
  ];
  pasos.forEach(([t, d], i) => { s.set(0, 4 + i, i + 1, { align: 'center', bold: true, border: true }); s.set(1, 4 + i, t, { bold: true, border: true, wrap: true }); s.set(2, 4 + i, d, { border: true, wrap: true }); });
  let r = 5 + pasos.length;
  s.set(1, r, '¿Se le queda pequeña?', { bold: true, color: '#14264f', size: 12 });
  s.set(2, r, 'Flow es esta misma plantilla convertida en aplicación: el extracto del banco se clasifica solo, las facturas entran con una foto, cada decena se cuadra sola y funciona en el móvil. Importa este archivo tal cual. Pruébela 30 días gratis en iharlabs.com/flow', { wrap: true });
  r += 2;
  s.set(1, r, 'Hojas de este libro', { bold: true });
  const hojas: [string, string][] = [
    ...banks.map((b): [string, string] => [nombres.get(b.id)!, 'hoja del banco por decenas (1-10, 11-20, 21-fin): saldo inicial, entradas, salidas por secciones, saldo según banco y cuadre']),
    ['Posición Tesorería d', 'todos los bancos juntos, por decenas (lee las hojas de los bancos)'],
    ['Posición Tesorería m', 'lo mismo por meses'],
    ['Comparativa', 'un periodo frente al anterior, concepto a concepto'],
  ];
  hojas.forEach(([n, d], i) => { s.set(1, r + 1 + i, n, { bold: true }); s.set(2, r + 1 + i, d); });
  return s;
}

` + src.slice(fin);
const tmp = path.resolve('herramientas/.excel-plantilla.ts');
fs.writeFileSync(tmp, src);
try {
  const { newProject, newBank } = await import(pathToFileURL(path.join(FLOW, 'model/defaults.ts')).href);
  const { compute } = await import(pathToFileURL(path.join(FLOW, 'model/engine.ts')).href);
  const { buildWorkbook } = await import(pathToFileURL(tmp).href);
  const hoy = new Date();
  const anyo = hoy.getMonth() >= 9 ? hoy.getFullYear() + 1 : hoy.getFullYear(); // desde octubre, la del año que viene
  const p = newProject('Mi empresa', '', [anyo]);
  p.banks = [newBank('Banco 1', true, anyo), newBank('Banco 2', true, anyo)];
  p.changes = [];
  const out: Uint8Array = buildWorkbook(p, compute(p));
  fs.mkdirSync('descargas', { recursive: true });
  const destino = 'descargas/plantilla-tesoreria-por-decenas.xlsx';
  fs.writeFileSync(destino, out);
  console.log(destino, anyo, `${Math.round(out.length / 1024)} KB`);
} finally { fs.rmSync(tmp, { force: true }); }
