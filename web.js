// Ihar Labs · web «De Excel a su propia aplicación». Sin cookies ni rastreo.
// La conversión de la portada y la cinta son CSS; aquí van las pestañas, la calculadora, el formulario y las apariciones.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // año del pie
  $$('[data-anyo]').forEach((e) => { e.textContent = String(new Date().getFullYear()); });

  // las piezas aparecen una vez al llegar a ellas (sin movimiento si el visitante lo pide así)
  const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revelar = $$('[data-revelar]');
  if (sinMovimiento || !('IntersectionObserver' in window)) revelar.forEach((e) => e.classList.add('visto'));
  else { const obs = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('visto'); obs.unobserve(x.target); } }), { rootMargin: '0px 0px -6% 0px' }); revelar.forEach((e) => obs.observe(e)); }

  // pestañas de pantallas: cambia la imagen al pulsar
  $$('.pestanas').forEach((grupo) => {
    const pant = $('.pant', grupo.parentElement);
    const botones = $$('button', grupo);
    const elegir = (b) => {
      botones.forEach((x) => { x.setAttribute('aria-selected', String(x === b)); x.tabIndex = x === b ? 0 : -1; });
      const nueva = new Image();
      nueva.onload = () => { pant.src = b.dataset.img; pant.alt = b.dataset.alt || ''; };
      nueva.src = b.dataset.img;
    };
    botones.forEach((b, i) => { b.tabIndex = i === 0 ? 0 : -1; });
    grupo.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b && b.getAttribute('aria-selected') !== 'true') elegir(b); });
    grupo.addEventListener('keydown', (e) => {
      const i = botones.indexOf(document.activeElement); if (i < 0) return;
      const j = e.key === 'ArrowRight' ? (i + 1) % botones.length : e.key === 'ArrowLeft' ? (i - 1 + botones.length) % botones.length : -1;
      if (j >= 0) { e.preventDefault(); botones[j].focus(); elegir(botones[j]); }
    });
  });

  // calculadora: lo que cuesta el Excel al año (personas × horas a la semana × coste por hora × 46 semanas)
  const SEMANAS = 46;
  // punto de miles siempre (es-ES no lo pone en 4 cifras) y coma decimal
  const miles = (s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const eur = (n) => { const [e, d] = n.toFixed(2).split('.'); return `${miles(e)},${d} €`; };
  const calc = $('.calc');
  if (calc) {
    const v = (k) => Number($(`[data-i="${k}"]`, calc).value);
    const o = (k) => $(`[data-o="${k}"]`, calc);
    const pintar = () => {
      const horas = v('personas') * v('horas') * SEMANAS;
      o('personas').textContent = String(v('personas'));
      o('horas').textContent = `${v('horas')} h`;
      o('coste').textContent = `${v('coste')} €`;
      o('horasAnyo').textContent = `${miles(String(horas))} h`;
      o('anual').textContent = eur(horas * v('coste'));
    };
    calc.addEventListener('input', pintar); pintar();
  }

  // los enlaces con data-interes dejan elegido el tema en el formulario
  const form = $('#form-contacto');
  $$('[data-interes]').forEach((a) => a.addEventListener('click', () => {
    const sel = form?.elements.interes; if (!sel) return;
    const op = [...sel.options].find((x) => x.text === a.dataset.interes); if (op) sel.value = op.value;
  }));
  // desde la página de Flow se llega con ?interes=flow: el formulario ya sale con «Flow» elegido
  if (form && new URLSearchParams(location.search).get('interes') === 'flow') {
    const op = [...form.elements.interes.options].find((x) => x.text.startsWith('Flow')); if (op) form.elements.interes.value = op.value;
  }

  // formulario: validación en texto, envío por Web3Forms; sin servicio, abre el correo del visitante
  if (form) {
    const estado = $('.form-estado', form);
    const decir = (t, clase = '') => { estado.textContent = t; estado.className = `form-estado ${clase}`.trim(); };
    const marcar = (campo, texto) => {
      campo.classList.add('mal'); campo.setAttribute('aria-invalid', 'true');
      let p = campo.parentElement.querySelector('.campo-error');
      if (!p) { p = document.createElement('p'); p.className = 'campo-error'; campo.parentElement.appendChild(p); }
      p.textContent = texto;
    };
    const limpiar = () => { $$('.mal', form).forEach((x) => { x.classList.remove('mal'); x.removeAttribute('aria-invalid'); }); $$('.campo-error', form).forEach((x) => x.remove()); };
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = form.elements;
      limpiar();
      const errores = [];
      if (!f.nombre.value.trim()) errores.push([f.nombre, 'Escriba su nombre.']);
      if (!f.correo.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.correo.value.trim())) errores.push([f.correo, 'Escriba un correo como nombre@empresa.com.']);
      if (!f.mensaje.value.trim()) errores.push([f.mensaje, 'Cuéntenos en una o dos frases qué hace su Excel.']);
      if (!f.privacidad.checked) errores.push([f.privacidad, 'Marque la casilla para que podamos responderle.']);
      if (errores.length) { errores.forEach(([c, t]) => marcar(c, t)); decir('Falta algo: revise lo marcado.', 'error'); errores[0][0].focus(); return; }
      if (f.botcheck.checked) return;

      const datos = { nombre: f.nombre.value.trim(), empresa: f.empresa.value.trim(), correo: f.correo.value.trim(), telefono: f.telefono.value.trim(), interes: f.interes.value, mensaje: f.mensaje.value.trim() };
      const asunto = `Web · ${datos.interes} · ${datos.empresa || datos.nombre}`;
      if (!form.dataset.endpoint || !form.dataset.clave) {
        const cuerpo = `Nombre: ${datos.nombre}\nEmpresa: ${datos.empresa}\nCorreo: ${datos.correo}\nTeléfono: ${datos.telefono}\nLe interesa: ${datos.interes}\n\n${datos.mensaje}`;
        location.href = `mailto:hola@iharlabs.com?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
        decir('Se ha abierto su correo con el mensaje escrito. Solo falta pulsar «Enviar».', 'ok');
        return;
      }
      const boton = $('button[type=submit]', form);
      boton.disabled = true; decir('Enviando…');
      try {
        const r = await fetch(form.dataset.endpoint, {
          method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ access_key: form.dataset.clave, subject: asunto, from_name: 'Web de Ihar Labs', replyto: datos.correo, ...datos }),
        });
        if (!r.ok) throw new Error(String(r.status));
        form.reset(); decir('Recibido. Le escribimos en un día laborable para quedar en una videollamada y que nos enseñe su Excel.', 'ok');
      } catch {
        decir('No se ha podido enviar. Escríbanos a hola@iharlabs.com y le respondemos igual.', 'error');
      } finally { boton.disabled = false; }
    });
  }
})();
