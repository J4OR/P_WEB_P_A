// baseScript.js · Compartido por todas las páginas
// Menú lateral deslizable (tableta y celular) y nombre del perfil
const sidebar = document.querySelector('.sidebar');
const botonMenu = document.querySelector('.menu-btn');

botonMenu.addEventListener('click', () => sidebar.classList.toggle('abierto'));

// Al tocar fuera del menú, se cierra
document.addEventListener('click', e => {
  if (!e.target.closest('.sidebar') && !e.target.closest('.menu-btn')) sidebar.classList.remove('abierto');
});

document.getElementById('nombre-perfil').textContent = 'Admin';
