// Empresa de ejemplo para las capturas de la web (datos inventados: «Vértice Comercial, S.L.»).
// Sale de la del vídeo del Cash Flow (video-anuncio/fuentes/seed.ts), adaptada a Flow.
// Uso, con la API de Flow sin claves en el puerto 8791: npx tsx herramientas/flow-semilla.ts
import { newProject, newBank } from '../../Cash Flow Empresas/src/model/defaults';
import { C, newId } from '../../Cash Flow Empresas/src/model/concepts';
import { compute } from '../../Cash Flow Empresas/src/model/engine';
import { allPeriods } from '../../Cash Flow Empresas/src/model/periods';
import { anadirPrevision } from '../../Cash Flow Empresas/src/model/previsiones';
import type { Bank, Line, Project } from '../../Cash Flow Empresas/src/model/types';

const F = Number(process.env.F || 1.4);
const API = 'http://127.0.0.1:8791/api';
let s = 7;
const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
const r2 = (n: number) => Math.round(n * 100) / 100;
const vary = (base: number, pct = 0.18) => r2(base * (1 + (rnd() * 2 - 1) * pct));

const L = (conceptId: string, label: string): Line => ({ id: newId('ln'), conceptId, label });

function build(): Project {
  const p = newProject('Vértice Comercial, S.L.', '1042', [2025, 2026]);

  const santander = newBank('Santander', false, 2025);
  const bbva = newBank('BBVA', false, 2025);
  const caixa = newBank('CaixaBank', false, 2025);
  santander.saldoInicial = 86420.35; bbva.saldoInicial = 41250.8; caixa.saldoInicial = 15380.1;
  p.banks = [santander, bbva, caixa];

  const prov = ['Distribuciones Atlántico', 'Envases del Sur', 'Logística Ibérica', 'Papelera Central', 'Suministros Delta', 'TecnoRed Soluciones', 'Transportes Garrido', 'Materias Primas Norte'];
  const sL = {
    transf: L(C.TRANSF, 'Cobros de clientes'), tpv: L(C.TPV, 'Cobros con tarjeta'), bizum: L(C.BIZUM, 'Bizum'), efectivo: L(C.EFECTIVO, 'Ingresos en efectivo'),
    plataformas: L(C.SOE, 'Cobros tienda online'), intereses: L(C.INTERESES, 'Intereses cuenta'),
    otrasE: L(C.RE_AJENAS, 'Otras entradas (no relacionadas con la empresa)'),
    prov: prov.map((n) => L(C.PROV, n)), distrib: L(C.MAYORISTA, 'Mayorista Mediterráneo'),
    prestamo: { ...L(C.PRESTAMOS, 'Préstamo ICO'), vencimiento: '2029-06', interes: 3.9 } as Line, intPoliza: L(C.INT_PAGADOS, 'Intereses póliza'),
    comis: L(C.COMISIONES, 'Comisiones bancarias'), comisTpv: L(C.COMISION_TPV, 'Comisiones TPV'),
    nominas: L(C.NOMINAS, 'Nóminas'), ss: L(C.SS, 'Seguros sociales'), autonomos: L(C.AUTONOMOS, 'Autónomos'),
    m111: L(C.M111, 'Modelo 111. Retenciones'), m115: L(C.M115, 'Modelo 115. Alquileres'), m303: L(C.M303, 'Modelo 303. IVA'), m200: L(C.OTROS_IMP, 'Otros impuestos (IBI, IAE…)'),
    alquiler: L(C.ALQUILER, 'Alquiler local'), asesoria: L(C.ASES_CONT, 'Asesoría contable y fiscal'), laboral: L(C.ASES_LAB, 'Asesoría laboral'),
    luz: L(C.ELECTRICIDAD, 'Electricidad'), agua: L(C.AGUA, 'Agua'), tel: L(C.TELEFONO, 'Telefonía e internet'), seguros: L(C.SEGUROS, 'Seguros'),
    software: L(C.PROGRAMA, 'Software de gestión'), marketing: L(C.MARKETING, 'Marketing y publicidad'), limpieza: L(C.LIMPIEZA, 'Limpieza'),
    oficina: L(C.OFICINA, 'Material de oficina'), mensajeria: L(C.RECURRENTES, 'Mensajería'), mant: L(C.ROBOT, 'Mantenimiento maquinaria'),
    socios: L(C.TITULAR, 'Retribución socios'), otrasS: L(C.RS_AJENAS, 'Otras salidas (no relacionadas con la empresa)'),
  };
  santander.lines = [sL.transf, sL.bizum, sL.efectivo, sL.plataformas, sL.intereses, sL.otrasE, ...sL.prov, sL.distrib, sL.prestamo, sL.intPoliza, sL.comis,
    sL.nominas, sL.ss, sL.autonomos, sL.m111, sL.m115, sL.m303, sL.m200, sL.alquiler, sL.asesoria, sL.laboral, sL.luz, sL.agua, sL.tel, sL.seguros, sL.software,
    sL.marketing, sL.limpieza, sL.oficina, sL.mensajeria, sL.mant, sL.socios, sL.otrasS];
  const bL = {
    transf: L(C.TRANSF, 'Cobros de clientes'), prov1: L(C.PROV, 'Embalajes Costa'), prov2: L(C.PROV, 'Química Levante'),
    hipoteca: { ...L(C.PRESTAMOS, 'Préstamo nave'), vencimiento: '2034-12', interes: 2.75 } as Line, comis: L(C.COMISIONES, 'Comisiones bancarias'), seguros: L(C.SEGUROS, 'Seguro nave'),
    renting: L(C.RECURRENTES, 'Renting vehículos'),
  };
  bbva.lines = Object.values(bL);
  const cL = { tpv: L(C.TPV, 'Cobros con tarjeta'), comisTpv: L(C.COMISION_TPV, 'Comisiones TPV'), comis: L(C.COMISIONES, 'Comisiones bancarias') };
  caixa.lines = Object.values(cL);

  const set = (b: Bank, l: Line, k: string, v: number) => { if (!v) return; (b.values[l.id] ||= {})[k] = r2(v); };
  const last = '2026-30'; // 1-10 de noviembre de 2026: en curso (hoy, 6/11)
  for (const per of allPeriods(p.years)) {
    const k = per.key; if (k > last) break;
    const enCurso = k === last ? 0.55 : 1;
    const mes = per.month; const d = per.idx % 3; const y = per.year;
    const temporada = [0.82, 0.86, 0.98, 1.0, 1.04, 1.1, 1.18, 1.06, 1.0, 1.04, 1.08, 1.32][mes] * (y === 2026 ? 1.09 : 1);
    const f = (v: number, pct?: number) => vary(v * temporada, pct) * enCurso;
    // Santander: cuenta principal
    set(santander, sL.transf, k, f(24800));
    set(santander, sL.bizum, k, f(1450, 0.3));
    set(santander, sL.efectivo, k, f(3900, 0.25));
    set(santander, sL.plataformas, k, f(6200, 0.25));
    if (d === 2) set(santander, sL.intereses, k, vary(38, 0.4));
    if (rnd() < 0.08) set(santander, sL.otrasE, k, vary(1200, 0.5));
    sL.prov.forEach((l, i) => { if ((i + per.idx) % 3 === d % 3 || rnd() < 0.25) set(santander, l, k, f([7400, 3100, 2800, 1300, 4300, 950, 2100, 5600][i] * F, 0.3)); });
    if (d !== 1) set(santander, sL.distrib, k, f(8600 * F, 0.2));
    if (d === 0 && k !== last) { set(santander, sL.prestamo, k, 2140.55); set(santander, sL.comis, k, vary(46, 0.3)); }
    if (d === 2 && mes % 3 === 2) set(santander, sL.intPoliza, k, vary(310, 0.2));
    if (d === 2) { set(santander, sL.nominas, k, vary(31800 * (y === 2026 ? 1.04 : 1), 0.04) * (mes === 6 || mes === 11 ? 1.85 : 1)); set(santander, sL.autonomos, k, 530.98); set(santander, sL.socios, k, 3500); }
    if (d === 0 && k !== last) set(santander, sL.ss, k, vary(10450, 0.04));
    if (d === 1 && [0, 3, 6, 9].includes(mes)) { set(santander, sL.m111, k, vary(6200, 0.1)); set(santander, sL.m115, k, 1824); set(santander, sL.m303, k, vary(14800, 0.25)); }
    if (d === 1 && mes === 3) set(santander, sL.m200, k, vary(2380, 0.1));
    if (d === 0 && k !== last) { set(santander, sL.alquiler, k, 3200 * 1.21); set(santander, sL.asesoria, k, 450 * 1.21); set(santander, sL.laboral, k, 280 * 1.21); set(santander, sL.software, k, 189); }
    if (d === 1) { set(santander, sL.luz, k, vary(1150, 0.25) * temporada); set(santander, sL.tel, k, 214.6); set(santander, sL.limpieza, k, 640); }
    if (d === 1 && mes % 2 === 0) set(santander, sL.agua, k, vary(160, 0.2));
    if (d === 0 && mes % 3 === 0 && k !== last) set(santander, sL.seguros, k, 1290.4);
    if (rnd() < 0.45) set(santander, sL.marketing, k, f(1100, 0.5));
    if (rnd() < 0.35) set(santander, sL.oficina, k, vary(180, 0.5));
    if (rnd() < 0.5) set(santander, sL.mensajeria, k, vary(260, 0.4));
    if (rnd() < 0.15) set(santander, sL.mant, k, vary(900, 0.4));
    if (rnd() < 0.06) set(santander, sL.otrasS, k, vary(800, 0.5));
    // BBVA: cobros de algunos clientes, préstamo de la nave y algún proveedor
    set(bbva, bL.transf, k, f(9200, 0.3));
    if (d === 1) { set(bbva, bL.prov1, k, f(4100 * 1.6, 0.3)); set(bbva, bL.prov2, k, f(3600 * 1.6, 0.3)); }
    if (d === 0 && k !== last) { set(bbva, bL.hipoteca, k, 1875.2); set(bbva, bL.renting, k, 1240.3); set(bbva, bL.comis, k, vary(28, 0.3)); }
    if (d === 2 && mes === 0) set(bbva, bL.seguros, k, 2140);
    // CaixaBank: el TPV; lo cobrado pasa a la principal
    const tpv = f(19800, 0.2);
    set(caixa, cL.tpv, k, tpv);
    set(caixa, cL.comisTpv, k, tpv * 0.0045);
    if (d === 2) set(caixa, cL.comis, k, 12.5);
    const tr = Math.round((tpv * 0.93) / 100) * 100;
    if (k !== last) (caixa.transfersOut[santander.id] ||= {})[k] = tr;
    // BBVA → Santander una vez al trimestre
    if (d === 2 && mes % 3 === 1) (bbva.transfersOut[santander.id] ||= {})[k] = 15000;
  }

  // lo que falta de la decena en curso y de las siguientes: estimado (en ámbar)
  const ahora = '2026-11-06T09:00:00.000Z';
  const prev = (b: Bank, l: Line, k: string, v: number, t: string) => { const x = anadirPrevision(b, l.id, k, v, t, null); x.creada = ahora; };
  prev(santander, sL.transf, '2026-30', 11800, 'Facturas pendientes de cobro');
  prev(santander, sL.ss, '2026-30', 11200, 'Seguros sociales octubre');
  prev(santander, sL.alquiler, '2026-30', 3872, 'Alquiler noviembre');
  prev(santander, sL.prestamo, '2026-30', 2140.55, 'Cuota préstamo');
  prev(santander, sL.transf, '2026-31', 26500, 'Cobros previstos');
  prev(santander, sL.prov[0], '2026-31', 8200, 'Vencimiento factura');
  prev(santander, sL.distrib, '2026-31', 9400, 'Pedido noviembre');
  prev(santander, sL.transf, '2026-32', 27400, 'Cobros previstos');
  prev(santander, sL.nominas, '2026-32', 33100, 'Nóminas noviembre');
  prev(santander, sL.socios, '2026-32', 3500, 'Retribución socios');
  prev(caixa, cL.tpv, '2026-31', 22500, 'Ventas con tarjeta');
  prev(caixa, cL.tpv, '2026-32', 24800, 'Ventas con tarjeta');
  prev(bbva, bL.transf, '2026-31', 9800, 'Cobros clientes');
  prev(bbva, bL.hipoteca, '2026-30', 1875.2, 'Cuota préstamo nave');

  // saldos del banco: todo cuadra salvo la última decena de octubre del BBVA (falta un cargo por apuntar)
  const calc = compute(p);
  for (const b of p.banks) for (const [k, pc] of Object.entries(calc.banks[b.id].periods)) {
    if (k > '2026-29') continue;
    b.saldoBanco[k] = r2(pc.saldoFinalReal - (b === bbva && k === '2026-29' ? 152.4 : 0));
    if (k <= '2026-26') b.locked[k] = true;
  }
  santander.notes[`${sL.marketing.id}|2026-28`] = 'Campaña de otoño';
  p.settings.author = 'Dirección financiera';

  // Santander: la decena en curso se llena en el vídeo importando el extracto
  for (const l of santander.lines) if (santander.values[l.id]) delete santander.values[l.id]['2026-30'];
  { const c = compute(p); for (const b of p.banks) { const v = Object.values(c.banks[b.id].periods).filter((x) => x.key <= '2026-29' && x.key >= '2025-00').map((x) => x.saldoFinalReal); console.error(b.name, 'min', Math.min(...v).toFixed(0), 'fin', v[v.length - 1].toFixed(0)); } console.error('CF', c.years[2025]?.cfAcum, c.years[2026]?.cfAcum, c.years[2026]?.posFinal); if (process.env.SOLO) process.exit(0); }
  const saldo3110 = compute(p).banks[santander.id].periods['2026-29'].saldoFinalReal;
  const movs: [string, string, number, Line | null][] = [
    ['02/11/2026', 'TRANSFERENCIA DE HOTELES COSTA AZUL SL', 8420.5, sL.transf],
    ['02/11/2026', 'RECIBO DISTRIBUCIONES ATLANTICO FRA 2026-1184', -7865.3, sL.prov[0]],
    ['02/11/2026', 'BIZUM RECIBIDO VENTAS', 386.4, sL.bizum],
    ['02/11/2026', 'RECIBO TGSS SEGUROS SOCIALES 10/2026', -11184.62, sL.ss],
    ['03/11/2026', 'TRANSFERENCIA DE GRUPO LEVANTE RETAIL SA', 5932.0, sL.transf],
    ['03/11/2026', 'ADEUDO ALQUILER LOCAL NOVIEMBRE', -3872.0, sL.alquiler],
    ['03/11/2026', 'INGRESO EFECTIVO OFICINA', 1840.0, sL.efectivo],
    ['03/11/2026', 'LIQUIDACION TIENDA ONLINE MARKETPLACE', 3655.18, sL.plataformas],
    ['04/11/2026', 'RECIBO MAYORISTA MEDITERRANEO', -9312.4, sL.distrib],
    ['04/11/2026', 'CUOTA PRESTAMO ICO 0049-1182', -2140.55, sL.prestamo],
    ['04/11/2026', 'RECIBO ASESORIA CONTABLE Y FISCAL', -544.5, sL.asesoria],
    ['04/11/2026', 'RECIBO ASESORIA LABORAL', -338.8, sL.laboral],
    ['05/11/2026', 'TRANSFERENCIA DE CONSTRUCCIONES OLMO SL', 4210.75, sL.transf],
    ['05/11/2026', 'RECIBO SUMINISTROS DELTA', -3988.2, sL.prov[4]],
    ['05/11/2026', 'BIZUM RECIBIDO VENTAS', 512.9, sL.bizum],
    ['05/11/2026', 'SOFTWARE DE GESTION SUSCRIPCION', -189.0, sL.software],
    ['05/11/2026', 'COMISION MANTENIMIENTO CUENTA', -45.0, sL.comis],
    ['06/11/2026', 'RECIBO ENVASES DEL SUR', -2716.85, sL.prov[1]],
    ['06/11/2026', 'TRANSFERENCIA DE NORTE EVENTOS SL', 3120.0, sL.transf],
    ['06/11/2026', 'COMPRA TARJETA PUBLICIDAD ONLINE', -412.3, sL.marketing],
  ];
  let saldo = saldo3110;
  const filas = ['Fecha;Concepto;Importe;Saldo'];
  const es = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).replace(/ /g, '');
  for (const [f, c, imp] of movs) { saldo = r2(saldo + imp); filas.push(`${f};${c};${es(imp)};${es(saldo)}`); }
  extracto = filas.join('\r\n') + '\r\n';
  // reglas aprendidas: así el extracto se clasifica solo (en la empresa real las aprende al corregir)
  const words = (s: string) => s;
  p.rules = movs.filter((m) => m[3]).map(([, c, imp, l], i) => ({
    id: newId('rl'), pattern: words(c.replace(/ FRA .*| 10\/2026| 0049-1182| NOVIEMBRE/g, '').split(' ').slice(0, 3).join(' ')), match: 'contains' as const,
    target: { kind: 'line' as const, lineId: l!.id }, sign: imp > 0 ? 'in' as const : 'out' as const, bankId: null, createdAt: ahora, hits: 3 + i,
  }));
  return p;
}
let extracto = '';

function facturae(n: number, emisor: string, nif: string, fecha: string, vence: string, base: number) {
  const iva = Math.round(base * 21) / 100; const total = Math.round((base + iva) * 100) / 100; const f = (x: number) => x.toFixed(2);
  return `<?xml version="1.0" encoding="UTF-8"?>
<fe:Facturae xmlns:fe="http://www.facturae.gob.es/formato/Versiones/Facturaev3_2_2.xml" xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
  <FileHeader><SchemaVersion>3.2.2</SchemaVersion><Modality>I</Modality><InvoiceIssuerType>EM</InvoiceIssuerType></FileHeader>
  <Parties>
    <SellerParty><TaxIdentification><PersonTypeCode>J</PersonTypeCode><ResidenceTypeCode>R</ResidenceTypeCode><TaxIdentificationNumber>${nif}</TaxIdentificationNumber></TaxIdentification><LegalEntity><CorporateName>${emisor}</CorporateName></LegalEntity></SellerParty>
    <BuyerParty><TaxIdentification><PersonTypeCode>J</PersonTypeCode><ResidenceTypeCode>R</ResidenceTypeCode><TaxIdentificationNumber>B00000000</TaxIdentificationNumber></TaxIdentification><LegalEntity><CorporateName>Vértice Comercial, S.L.</CorporateName></LegalEntity></BuyerParty>
  </Parties>
  <Invoices><Invoice>
    <InvoiceHeader><InvoiceNumber>${String(n).padStart(6, '0')}</InvoiceNumber><InvoiceSeriesCode>F26-</InvoiceSeriesCode><InvoiceDocumentType>FC</InvoiceDocumentType><InvoiceClass>OO</InvoiceClass></InvoiceHeader>
    <InvoiceIssueData><IssueDate>${fecha}</IssueDate><InvoiceCurrencyCode>EUR</InvoiceCurrencyCode><TaxCurrencyCode>EUR</TaxCurrencyCode><LanguageName>es</LanguageName></InvoiceIssueData>
    <TaxesOutputs><Tax><TaxTypeCode>01</TaxTypeCode><TaxRate>21.00</TaxRate><TaxableBase><TotalAmount>${f(base)}</TotalAmount></TaxableBase><TaxAmount><TotalAmount>${f(iva)}</TotalAmount></TaxAmount></Tax></TaxesOutputs>
    <InvoiceTotals><TotalGrossAmount>${f(base)}</TotalGrossAmount><TotalGrossAmountBeforeTaxes>${f(base)}</TotalGrossAmountBeforeTaxes><TotalTaxOutputs>${f(iva)}</TotalTaxOutputs><TotalTaxesWithheld>0.00</TotalTaxesWithheld><InvoiceTotal>${f(total)}</InvoiceTotal><TotalOutstandingAmount>${f(total)}</TotalOutstandingAmount><TotalExecutableAmount>${f(total)}</TotalExecutableAmount></InvoiceTotals>
    <Items><InvoiceLine><ItemDescription>Suministro noviembre</ItemDescription><Quantity>1</Quantity><UnitOfMeasure>01</UnitOfMeasure><UnitPriceWithoutTax>${f(base)}</UnitPriceWithoutTax><TotalCost>${f(base)}</TotalCost><GrossAmount>${f(base)}</GrossAmount><TaxesOutputs><Tax><TaxTypeCode>01</TaxTypeCode><TaxRate>21.00</TaxRate><TaxableBase><TotalAmount>${f(base)}</TotalAmount></TaxableBase><TaxAmount><TotalAmount>${f(iva)}</TotalAmount></TaxAmount></Tax></TaxesOutputs></InvoiceLine></Items>
    <PaymentDetails><Installment><InstallmentDueDate>${vence}</InstallmentDueDate><InstallmentAmount>${f(total)}</InstallmentAmount><PaymentMeans>02</PaymentMeans></Installment></PaymentDetails>
  </Invoice></Invoices>
</fe:Facturae>
`;
}

async function main() {
  const otras = ['Panadería Ríos', 'Taller Moreno e Hijos', 'Clínica Dental Sonrisa', 'Hostal El Mirador', 'Óptica Centro', 'Estudio Lago Arquitectos', 'Frutas del Valle', 'Gimnasio Forma', 'Librería La Página', 'Bodegas Sierra Alta', 'Consultora Norte', 'Floristería Jazmín', 'Restaurante La Brasa', 'Academia Idiomas Plus'];
  const doc = build();
  const fs = await import('node:fs');
  fs.mkdirSync("herramientas/datos", { recursive: true });
  fs.writeFileSync("herramientas/datos/movimientos_santander_noviembre.csv", extracto, 'latin1');
  const facts: [string, string, string, string, number][] = [
    ['Distribuciones Atlántico, S.L.', 'B12345674', '2026-11-03', '2026-12-03', 6840],
    ['Suministros Delta, S.A.', 'A23456783', '2026-11-04', '2026-11-20', 3290.5],
    ['Envases del Sur, S.L.', 'B34567891', '2026-11-04', '2026-11-25', 2212.4],
    ['TecnoRed Soluciones, S.L.', 'B45678901', '2026-11-05', '2026-11-15', 785],
    ['Transportes Garrido, S.L.', 'B56789019', '2026-11-05', '2026-12-05', 1745.3],
  ];
  facts.forEach(([e, nif, f, v, b], i) => fs.writeFileSync(`herramientas/datos/factura_${i + 1}.xml`, facturae(812 + i * 37, e, nif, f, v, b)));
  const post = async (name: string, code: string, data: Project) => {
    const r = await fetch(`${API}/admin/pharmacies`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, code, email: `${code}@ejemplo.test`, password: 'demo-video-2026', data }) });
    if (!r.ok) throw new Error(`${name}: ${r.status} ${await r.text()}`);
    return (await r.json()) as { id: string };
  };
  const m = await post(doc.name, doc.code, doc);
  console.log('principal', m.id);
  let code = 1043;
  for (const n of otras) { const d = newProject(n, String(code), [2025, 2026]); await post(n, String(code++), d); }
  console.log('ok');
}
main().catch((e) => { console.error(e); process.exit(1); });
