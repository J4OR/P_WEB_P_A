// listadoScript.js · Compartido por las páginas de listado
// Búsqueda, filtros y confirmar antes de eliminar

/* ----- Búsqueda y filtros ----- */
const buscador = document.querySelector('.buscador');
const filtros = [...document.querySelectorAll('.filtro')];

function filtrar() {
  const texto = (buscador?.value || '').toLowerCase();
  const filtro = document.querySelector('.filtro.seleccionado')?.dataset.filtro || '';
  document.querySelectorAll('.tabla tbody tr').forEach(fila => {
    fila.hidden = !(fila.textContent.toLowerCase().includes(texto) && (!filtro || fila.textContent.includes(filtro)));
  });
  window.LoveCookies?.tablaActual?.actualizarPieTabla?.();
}
buscador?.addEventListener('input', filtrar);
filtros.forEach(f => f.addEventListener('click', () => {
  filtros.forEach(x => x.classList.remove('seleccionado'));
  f.classList.add('seleccionado');
  filtrar();
}));

/* ----- Confirmar antes de eliminar ----- */
const dialogo = document.getElementById('dialogo');
let filaAEliminar = null;

document.addEventListener('click', e => {
  const eliminar = e.target.closest('[data-eliminar]');
  if (eliminar) {
    filaAEliminar = eliminar.closest('tr');
    dialogo.showModal();
  }
});
dialogo.addEventListener('close', () => {
  if (dialogo.returnValue === 'si' && filaAEliminar) window.LoveCookies?.eliminarRegistro?.(filaAEliminar.dataset.id);
  filaAEliminar = null;
  dialogo.returnValue = '';
});
