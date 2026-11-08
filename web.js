// Ihar Labs · web: carrusel, pestañas, calculadora y formulario. Sin cookies ni rastreo.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // año del pie
  $$('[data-anyo]').forEach((e) => { e.textContent = String(new Date().getFullYear()); });

  // sombra de la cabecera al bajar
  const cab = $('.cab');
  const sombra = () => cab.classList.toggle('con-sombra', scrollY > 8);
  addEventListener('scroll', sombra, { passive: true }); sombra();

  // carrusel de la portada: cambia de pantalla cada 4 s
  const car = $('[data-carrusel]');
  if (car && !quieto) {
    const imgs = $$('img', car); let i = 0;
    setInterval(() => { imgs[i].classList.remove('on'); i = (i + 1) % imgs.length; imgs[i].classList.add('on'); }, 4000);
  }

  // pestañas de Flow
  $$('.pestanas').forEach((grupo) => {
    const pant = $('.pant', grupo.parentElement);
    grupo.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b || b.getAttribute('aria-selected') === 'true') return;
      $$('button', grupo).forEach((x) => x.setAttribute('aria-selected', String(x === b)));
      pant.classList.add('cambiando');
      const nueva = new Image(); nueva.src = b.dataset.img;
      nueva.onload = () => { pant.src = b.dataset.img; pant.classList.remove('cambiando'); };
    });
  });

  // calculadora de suscripciones
  const eur = (n) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: 'always' }) + ' €';
  const calc = $('.calc');
  if (calc) {
    const v = (k) => Number($(`[data-i="${k}"]`, calc).value);
    const o = (k) => $(`[data-o="${k}"]`, calc);
    const pintar = () => {
      const anual = v('personas') * v('herr') * v('precio') * 12;
      o('personas').textContent = v('personas');
      o('herr').textContent = v('herr');
      o('precio').textContent = `${v('precio')} €`;
      o('anual').textContent = eur(anual);
      o('cinco').textContent = `En cinco años: ${eur(anual * 5)}`;
    };
    calc.addEventListener('input', pintar); pintar();
  }

  // los botones «Pruébela», «Estudiar mi caso»… dejan elegido el interés en el formulario
  const form = $('#form-contacto');
  $$('[data-interes]').forEach((a) => a.addEventListener('click', () => {
    const sel = form?.elements.interes; if (!sel) return;
    const op = [...sel.options].find((x) => x.text === a.dataset.interes); if (op) sel.value = op.value;
  }));

  // formulario: si hay servicio de envío configurado (data-endpoint) se manda por ahí;
  // si no, se abre el correo del visitante con el mensaje ya escrito para hola@iharlabs.com
  if (form) {
    const estado = $('.form-estado', form);
    const decir = (t, clase = '') => { estado.textContent = t; estado.className = `form-estado ${clase}`; };
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = form.elements;
      $$('.mal', form).forEach((x) => x.classList.remove('mal'));
      const faltan = ['nombre', 'correo', 'mensaje'].filter((k) => !f[k].value.trim());
      if (f.correo.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.correo.value.trim())) faltan.push('correo');
      faltan.forEach((k) => f[k].classList.add('mal'));
      if (faltan.length) { decir('Revise los campos marcados en rojo.', 'error'); f[faltan[0]].focus(); return; }
      if (!f.privacidad.checked) { decir('Para enviarlo, acepte la política de privacidad.', 'error'); return; }
      if (f.botcheck.checked) return; // un robot

      const datos = { nombre: f.nombre.value.trim(), empresa: f.empresa.value.trim(), correo: f.correo.value.trim(), telefono: f.telefono.value.trim(), interes: f.interes.value, mensaje: f.mensaje.value.trim() };
      const endpoint = form.dataset.endpoint;
      if (!endpoint) {
        const cuerpo = `Nombre: ${datos.nombre}\nEmpresa: ${datos.empresa}\nCorreo: ${datos.correo}\nTeléfono: ${datos.telefono}\nLe interesa: ${datos.interes}\n\n${datos.mensaje}`;
        location.href = `mailto:hola@iharlabs.com?subject=${encodeURIComponent(`Web · ${datos.interes} · ${datos.empresa || datos.nombre}`)}&body=${encodeURIComponent(cuerpo)}`;
        decir('Se ha abierto su correo con el mensaje escrito. Solo falta pulsar «Enviar».', 'ok');
        return;
      }
      const boton = $('button[type=submit]', form);
      boton.disabled = true; decir('Enviando…');
      try {
        const r = await fetch(endpoint, {
          method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ access_key: form.dataset.clave || undefined, subject: `Web · ${datos.interes} · ${datos.empresa || datos.nombre}`, from_name: 'Web de Ihar Labs', replyto: datos.correo, ...datos }),
        });
        if (!r.ok) throw new Error(String(r.status));
        form.reset(); decir('¡Gracias! Le responderemos en un día laborable.', 'ok');
      } catch {
        decir('No se ha podido enviar. Escríbanos a hola@iharlabs.com y le respondemos igual.', 'error');
      } finally { boton.disabled = false; }
    });
  }

  // las secciones aparecen suavemente al llegar a ellas
  if (!quieto && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('visto'); obs.unobserve(x.target); } }), { rootMargin: '0px 0px -8% 0px' });
    $$('.secc-cab, .serv, .caso, .calc, .pasos li, .faq, .form').forEach((e) => { e.classList.add('aparece'); obs.observe(e); });
  }
})();
