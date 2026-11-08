// Ihar Labs · web. Todo lo que se mueve lo mueve el visitante. Sin cookies ni rastreo.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // año del pie
  $$('[data-anyo]').forEach((e) => { e.textContent = String(new Date().getFullYear()); });

  // las tarjetas aparecen una vez al llegar a ellas (sin movimiento si el visitante lo pide así)
  const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revelar = $$('[data-revelar]');
  if (sinMovimiento || !('IntersectionObserver' in window)) revelar.forEach((e) => e.classList.add('visto'));
  else { const obs = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('visto'); obs.unobserve(x.target); } }), { rootMargin: '0px 0px -6% 0px' }); revelar.forEach((e) => obs.observe(e)); }

  // el antes y el después: el tirador sigue al control de rango (accesible con teclado)
  $$('[data-comparar]').forEach((fig) => {
    const marco = $('.comparar-marco', fig);
    const rango = $('[data-comparar-rango]', fig);
    const poner = () => marco.style.setProperty('--pos', `${rango.value}%`);
    rango.addEventListener('input', poner);
    // arrastrar o tocar en cualquier punto del marco también mueve el tirador
    let arrastrando = false;
    const desde = (x) => { const r = marco.getBoundingClientRect(); rango.value = String(Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100))); poner(); };
    marco.addEventListener('pointerdown', (e) => { if (e.target === rango) return; arrastrando = true; marco.setPointerCapture(e.pointerId); desde(e.clientX); });
    marco.addEventListener('pointermove', (e) => { if (arrastrando) desde(e.clientX); });
    marco.addEventListener('pointerup', () => { arrastrando = false; });
    marco.addEventListener('pointercancel', () => { arrastrando = false; });
    poner();
  });

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

  // calculadora de suscripciones
  // punto de miles siempre (es-ES no lo pone en 4 cifras) y coma decimal
  const eur = (n) => { const [e, d] = n.toFixed(2).split('.'); return `${e.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${d} €`; };
  const calc = $('.calc');
  if (calc) {
    const v = (k) => Number($(`[data-i="${k}"]`, calc).value);
    const o = (k) => $(`[data-o="${k}"]`, calc);
    const pintar = () => {
      const anual = v('personas') * v('herr') * v('precio') * 12;
      o('personas').textContent = String(v('personas'));
      o('herr').textContent = String(v('herr'));
      o('precio').textContent = `${v('precio')} €`;
      o('anual').textContent = eur(anual);
      o('cinco').textContent = eur(anual * 5);
    };
    calc.addEventListener('input', pintar); pintar();
  }

  // los enlaces con data-interes dejan elegido el tema en el formulario
  const form = $('#form-contacto');
  $$('[data-interes]').forEach((a) => a.addEventListener('click', () => {
    const sel = form?.elements.interes; if (!sel) return;
    const op = [...sel.options].find((x) => x.text === a.dataset.interes); if (op) sel.value = op.value;
  }));

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
      if (!f.mensaje.value.trim()) errores.push([f.mensaje, 'Cuéntenos en una o dos frases qué le gustaría mejorar.']);
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
        form.reset(); decir('Recibido. Le respondemos en un día laborable.', 'ok');
      } catch {
        decir('No se ha podido enviar. Escríbanos a hola@iharlabs.com y le respondemos igual.', 'error');
      } finally { boton.disabled = false; }
    });
  }
})();
