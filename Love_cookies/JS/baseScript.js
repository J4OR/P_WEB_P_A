// baseScript.js · Compartido por todas las páginas
// Menú lateral deslizable (tableta y celular) y nombre del perfil
const sidebar = document.querySelector('.sidebar');
const botonMenu = document.querySelector('.menu-btn');

if (sidebar) {
  const botonColapsar = document.createElement('button');
  botonColapsar.className = 'sidebar-toggle';
  botonColapsar.type = 'button';
  botonColapsar.setAttribute('aria-label', 'Ocultar barra lateral');
  botonColapsar.setAttribute('aria-expanded', 'true');
  botonColapsar.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">chevron_left</span>';
  sidebar.prepend(botonColapsar);

  if (localStorage.getItem('sidebar-colapsada') === 'true') {
    sidebar.classList.add('colapsada');
    botonColapsar.setAttribute('aria-label', 'Mostrar barra lateral completa');
    botonColapsar.setAttribute('aria-expanded', 'false');
    botonColapsar.firstElementChild.textContent = 'chevron_right';
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => sidebar.classList.add('animacion-activa'));
  });

  botonColapsar.addEventListener('click', () => {
    const colapsada = sidebar.classList.toggle('colapsada');
    localStorage.setItem('sidebar-colapsada', String(colapsada));
    botonColapsar.setAttribute('aria-label', colapsada ? 'Mostrar barra lateral completa' : 'Ocultar barra lateral');
    botonColapsar.setAttribute('aria-expanded', String(!colapsada));
    botonColapsar.firstElementChild.textContent = colapsada ? 'chevron_right' : 'chevron_left';
  });
}

botonMenu?.addEventListener('click', () => sidebar?.classList.toggle('abierto'));

// Al tocar fuera del menú, se cierra
document.addEventListener('click', e => {
  if (!e.target.closest('.sidebar') && !e.target.closest('.menu-btn')) sidebar?.classList.remove('abierto');
});

const nombrePerfil = document.getElementById('nombre-perfil');
if (nombrePerfil) nombrePerfil.textContent = 'Admin';
