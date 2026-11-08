// Pasa las capturas PNG de img/ a WebP más ligeras (los PNG se guardan en herramientas/originales).
// Uso: node herramientas/optimizar.mjs
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const MAX = { movil: 640, m_: 640, def: 1680 };
for (const dir of ['img/flow', 'img/turnos']) {
  for (const f of fs.readdirSync(dir).filter((x) => /\.(png|jpe?g)$/i.test(x))) {
    const src = path.join(dir, f);
    const ancho = /movil|^m_/.test(f) ? MAX.movil : MAX.def;
    const dst = path.join(dir, f.replace(/\.(png|jpe?g)$/i, '.webp'));
    const info = await sharp(src).resize({ width: ancho, withoutEnlargement: true }).webp({ quality: 82 }).toFile(dst);
    const orig = path.join('herramientas/originales', dir.split('/')[1]);
    fs.mkdirSync(orig, { recursive: true });
    fs.renameSync(src, path.join(orig, f));
    console.log(`${dst}  ${info.width}×${info.height}  ${Math.round(info.size / 1024)} KB`);
  }
}
