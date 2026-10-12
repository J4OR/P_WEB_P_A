// formularioScript.js · Formulario de agregar / editar dentro de la misma página
// Abre y cierra el formulario, rellena los datos al editar, valida y muestra mensajes
const vistaLista = document.getElementById('vista-lista');
const vistaFormulario = document.getElementById('vista-formulario');
const formulario = document.querySelector('.formulario');
const textoGuardar = formulario.querySelector('.texto-guardar');
const textoNuevo = textoGuardar.textContent;   // "Guardar producto", "Guardar pedido"...

/* ----- Abrir el formulario: vacío (nuevo) o con los datos de una fila (editar) ----- */
function mostrarFormulario(fila) {
  const editando = !!fila;
  formulario.reset();
  limpiarErrores(formulario);
  formulario.querySelector('.mensaje-exito').textContent = '';
  document.querySelector('.modo').textContent = editando ? 'Editar' : 'Agregar';
  textoGuardar.textContent = editando ? 'Guardar cambios' : textoNuevo;

  if (editando) {
    formulario.querySelectorAll('[data-col]').forEach(campo => {
      let valor = fila.cells[campo.dataset.col].textContent.trim();
      if (campo.dataset.entero !== undefined) valor = valor.replace(/\D/g, '');
      if (campo.type === 'radio') campo.checked = valor.includes(campo.value);
      else if (campo.type === 'checkbox') campo.checked = valor === 'Activo';
      else campo.value = valor;
    });
  }
  // Datos automáticos (fecha de registro y pedidos del cliente)
  formulario.querySelectorAll('[data-fill]').forEach(x => {
    x.textContent = editando ? fila.cells[x.dataset.fill].textContent.trim() : x.dataset.def;
  });

  vistaLista.hidden = true;
  vistaFormulario.hidden = false;
  window.scrollTo(0, 0);
  document.dispatchEvent(new CustomEvent('formulario-abierto', { detail: { editando } }));
}

/* ----- Volver al listado ----- */
function mostrarLista() {
  vistaFormulario.hidden = true;
  vistaLista.hidden = false;
  if (location.hash) history.replaceState(null, '', location.pathname);
  window.scrollTo(0, 0);
}

/* ----- Botones: nuevo, editar y cancelar / volver ----- */
document.addEventListener('click', e => {
  if (e.target.closest('[data-nuevo]')) mostrarFormulario(null);
  const editar = e.target.closest('[data-editar]');
  if (editar) mostrarFormulario(editar.closest('tr'));
  if (e.target.closest('[data-cancelar]')) mostrarLista();
});

/* ----- Guardar: valida y muestra el mensaje en la página ----- */
formulario.addEventListener('submit', e => {
  e.preventDefault();
  const mensaje = formulario.querySelector('.mensaje-exito');
  mensaje.textContent = '';
  if (!validar(formulario)) { formulario.querySelector('.invalido')?.focus(); return; }
  mensaje.textContent = 'Listo: los datos se guardarán cuando conectemos el almacenamiento.';
  setTimeout(mostrarLista, 1400);
});

// Si corrige un campo con error, se vuelve a validar al escribir
formulario.addEventListener('input', e => {
  if (e.target.classList.contains('invalido')) validar(formulario);
});

// Texto de la zona de subida de fotos
document.querySelectorAll('.subida input').forEach(input => input.addEventListener('change', () => {
  input.parentElement.querySelector('.subida-texto').textContent =
    input.files.length ? input.files.length + ' foto(s) seleccionada(s)' : 'Toca para subir fotos o arrástralas aquí';
}));

// Si llegan desde el dashboard (pagina.html#nuevo), se abre el formulario vacío
if (location.hash === '#nuevo') mostrarFormulario(null);
