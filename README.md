# Web de Ihar Labs (iharlabs.com)

Página estática: `index.html`, `estilos.css`, `web.js`, `legal/`, `img/`, `video/` y `fuentes/`.
Sin cookies ni analítica, sin llamadas a terceros (la fuente Inter va incluida).

## Verla en su ordenador

```bash
npm run dev
```

Abre http://localhost:5190.

## Qué hay en cada sitio

- **Textos:** `index.html`. Legal: `legal/aviso-legal.html` y `legal/privacidad.html` (los datos de la
  sociedad son los de `src/model/marca.ts` de Flow: Farmaconsultores Gestión y Formación, S.L.).
- **Formulario:** en `index.html`, `<form id="form-contacto" data-endpoint="" data-clave="">`.
  Sin `data-endpoint`, abre el correo del visitante con el mensaje escrito para hola@iharlabs.com.
  Con un servicio de formularios (p. ej. Web3Forms: `data-endpoint="https://api.web3forms.com/submit"`
  y su clave pública en `data-clave`), se envía sin salir de la página.
- **Capturas de Flow:** con datos inventados («Vértice Comercial, S.L.»). Para rehacerlas, con Flow
  sin claves en marcha (API 8791 y Vite 5181):

```bash
npx tsx herramientas/flow-semilla.ts
```

```bash
npm run capturas
```

```bash
npm run optimizar
```

- **Gestor de turnos:** capturas y vídeo sacados de `Desktop\Gestor de turnos - Marketing`
  (datos de ejemplo, hechos para promoción).
- `herramientas/ver.mjs` y `herramientas/pagina-entera.mjs`: fotos de la web para revisarla.

## Pendiente

- Elegir dónde se publica y conectar `iharlabs.com` (ahora enseña la página de Hostinger).
- Conectar el formulario a un servicio de envío.
