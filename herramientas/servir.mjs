// Servidor mínimo para ver la web en su ordenador: node herramientas/servir.mjs [puerto]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve('.');
const PUERTO = Number(process.argv[2] || process.env.PORT || 5190);
const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml' };

http.createServer((req, res) => {
  let ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (ruta.endsWith('/')) ruta += 'index.html';
  const archivo = path.join(RAIZ, ruta);
  if (!archivo.startsWith(RAIZ) || /node_modules|herramientas|\.git/.test(archivo)) { res.writeHead(403).end(); return; }
  fs.stat(archivo, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('No encontrado'); return; }
    const tipo = TIPOS[path.extname(archivo).toLowerCase()] || 'application/octet-stream';
    const rango = req.headers.range && /bytes=(\d*)-(\d*)/.exec(req.headers.range);
    if (rango) { // el vídeo se pide por trozos
      const ini = Number(rango[1] || 0); const fin = rango[2] ? Number(rango[2]) : st.size - 1;
      res.writeHead(206, { 'Content-Type': tipo, 'Content-Range': `bytes ${ini}-${fin}/${st.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': fin - ini + 1 });
      fs.createReadStream(archivo, { start: ini, end: fin }).pipe(res); return;
    }
    res.writeHead(200, { 'Content-Type': tipo, 'Content-Length': st.size, 'Accept-Ranges': 'bytes' });
    fs.createReadStream(archivo).pipe(res);
  });
}).listen(PUERTO, () => console.log(`Web en http://localhost:${PUERTO}`));
