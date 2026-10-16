// Controla el menú lateral y su estado en todas las vistas.
(() => {
  const sidebar = document.querySelector('.sidebar');
  const botonMenuMovil = document.querySelector('.menu-btn');
  if (!sidebar) return;

  let botonColapsar = sidebar.querySelector('.sidebar-toggle');
  if (!botonColapsar) {
    botonColapsar = document.createElement('button');
    botonColapsar.className = 'sidebar-toggle';
    botonColapsar.type = 'button';
    const icono = document.createElement('span');
    icono.className = 'material-symbols-outlined';
    icono.setAttribute('aria-hidden', 'true');
    botonColapsar.append(icono);
    sidebar.prepend(botonColapsar);
  }

  function leerEstadoInicial() {
    try {
      const guardado = localStorage.getItem('sidebar-colapsada');
      return guardado === null || guardado === 'true';
    } catch {
      return true;
    }
  }

  function cambiarEstado(colapsada, guardar = true) {
    sidebar.classList.toggle('colapsada', colapsada);
    botonColapsar.setAttribute('aria-label', colapsada ? 'Expandir barra lateral' : 'Contraer barra lateral');
    botonColapsar.setAttribute('aria-expanded', String(!colapsada));
    botonColapsar.querySelector('.material-symbols-outlined').textContent = colapsada ? 'chevron_right' : 'chevron_left';
    if (guardar) {
      try { localStorage.setItem('sidebar-colapsada', String(colapsada)); } catch { /* El menú sigue funcionando sin almacenamiento. */ }
    }
  }

  cambiarEstado(leerEstadoInicial(), false);
  requestAnimationFrame(() => requestAnimationFrame(() => sidebar.classList.add('animacion-activa')));

  botonColapsar.addEventListener('click', () => {
    cambiarEstado(!sidebar.classList.contains('colapsada'));
  });

  botonMenuMovil?.setAttribute('aria-expanded', 'false');
  botonMenuMovil?.addEventListener('click', () => {
    const abierto = sidebar.classList.toggle('abierto');
    botonMenuMovil.setAttribute('aria-expanded', String(abierto));
    botonMenuMovil.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
  });

  function cerrarMenuMovil() {
    sidebar.classList.remove('abierto');
    botonMenuMovil?.setAttribute('aria-expanded', 'false');
    botonMenuMovil?.setAttribute('aria-label', 'Abrir menú');
  }

  document.addEventListener('click', evento => {
    if (!evento.target.closest('.sidebar') && !evento.target.closest('.menu-btn')) cerrarMenuMovil();
  });
  document.addEventListener('keydown', evento => {
    if (evento.key === 'Escape') cerrarMenuMovil();
  });
})();
