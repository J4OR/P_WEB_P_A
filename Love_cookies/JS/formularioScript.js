// formularioScript.js · Formulario de agregar / editar + guardado genérico en localStorage
const vistaLista = document.getElementById('vista-lista');
const vistaFormulario = document.getElementById('vista-formulario');
const formulario = document.querySelector('.formulario');
const textoGuardar = formulario.querySelector('.texto-guardar');
const textoNuevo = textoGuardar.textContent;
const tbody = document.querySelector('.tabla tbody');
const filaVaciaHTML = tbody ? tbody.innerHTML : '';   // la fila "Aún no hay..."

/* =====================================================
   PERSONALIZACIÓN POR PÁGINA (lo único que cambia entre páginas)
   ===================================================== */
   // Cada página define su configuración en window.configPagina (ver su HTML)
  const config = window.configPagina || {};
  const columnasCalculadas = config.columnasCalculadas || {};
  const contadoresResumen = config.contadoresResumen || {};

/* =====================================================
   localStorage genérico
   La clave sale de data-clave en el <form> o del nombre de la página
   (productos.html → "productos")
   ===================================================== */
const CLAVE = formulario.dataset.clave || location.pathname.split('/').pop().replace('.html', '');
let editandoId = null;

function leer() {
  try { return JSON.parse(localStorage.getItem(CLAVE)) || []; }
  catch { return []; }
}

function guardarLista(lista) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(lista));
    return true;
  } catch {
    alert('No se pudo guardar: el almacenamiento del navegador está lleno.');
    return false;
  }
}

// Convierte el formulario en un objeto { name: valor }
function recogerDatos(form) {
  const datos = {};
  form.querySelectorAll('[name]').forEach(c => {
    if (c.type === 'file') return;                       // las fotos no se guardan aquí
    if (c.type === 'radio') { if (c.checked) datos[c.name] = c.value; return; }
    if (c.type === 'checkbox') { datos[c.name] = c.checked; return; }
    const valor = c.value.trim();
    datos[c.name] = (c.dataset.entero !== undefined && valor !== '') ? Number(valor) : valor;
  });
  config.prepararDatos?.(form, datos);
  return datos;
}

// Pone un registro guardado dentro del formulario (para editar)
function rellenarFormulario(form, registro) {
  form.querySelectorAll('[name]').forEach(c => {
    if (c.type === 'file') return;
    const v = registro[c.name];
    if (c.type === 'radio') c.checked = String(v) === c.value;
    else if (c.type === 'checkbox') c.checked = !!v;
    else if (c.tagName === 'SELECT' && ![...c.options].some(opcion => opcion.value === String(v ?? ''))) {
      c.value = [...c.options].find(opcion => opcion.textContent.trim() === String(v ?? ''))?.value ?? '';
    }
    else c.value = v ?? '';
  });
}

// Crea un registro nuevo o actualiza el que se está editando
function guardarRegistro(form, fotos) {
  const lista = leer();
  const datos = recogerDatos(form);
  if (fotos !== undefined) datos.fotos = fotos;
  const indice = editandoId ? lista.findIndex(r => r.id === editandoId) : -1;
  const pedidoAnterior = indice === -1 ? null : lista[indice];
  const revertirRelacionado = config.antesDeGuardar?.(datos, pedidoAnterior);
  if (revertirRelacionado === false) return false;

  if (editandoId) {
    if (indice !== -1) lista[indice] = { ...lista[indice], ...datos };
  } else {
    const valoresIniciales = config.valoresIniciales?.(datos) || {};
    lista.push({ id: Date.now().toString(), ...valoresIniciales, ...datos });
  }
  if (guardarLista(lista)) return true;
  revertirRelacionado?.();
  return false;
}

function eliminarRegistro(id) {
  const lista = leer();
  const registro = lista.find(r => r.id === id);
  const revertirRelacionado = config.antesDeEliminar?.(registro);
  if (revertirRelacionado === false) return;
  if (!guardarLista(lista.filter(r => r.id !== id))) {
    revertirRelacionado?.();
    return;
  }
  dibujarTabla();
}

function actualizarPieTabla() {
  const filasVisibles = [...tbody.querySelectorAll('tr:not(.fila-vacia)')]
    .filter(fila => !fila.hidden);
  config.actualizarPieTabla?.(leer(), filasVisibles.length, filasVisibles.map(fila => fila.dataset.id));
}
window.actualizarPieTabla = actualizarPieTabla;

/* ----- Dibujar la tabla leyendo el localStorage ----- */
function esc(texto) {
  const d = document.createElement('div');
  d.textContent = texto ?? '';
  return d.innerHTML;
}

function dibujarTabla() {
  if (!tbody) return;
  const lista = leer();

  // Contadores del resumen
  document.querySelectorAll('.resumen-card').forEach(card => {
    const calcular = contadoresResumen[card.querySelector('p').textContent.trim()];
    if (calcular) card.querySelector('h2').textContent = calcular(lista);
  });

  if (!lista.length) {
    tbody.innerHTML = filaVaciaHTML;
    actualizarPieTabla();
    return;
  }

  const ths = [...document.querySelectorAll('.tabla thead th')];
  const campos = [...formulario.querySelectorAll('[data-col]')];
  const columnasEstado = new Set(config.columnasEstado || []);

  tbody.innerHTML = lista.map(r => {
    const celdas = ths.map((th, i) => {
      const titulo = th.textContent.trim();
      if (!titulo || titulo.toLowerCase() === 'acciones') {
        return `<td class="acciones">
          <button class="icono-boton" type="button" data-editar aria-label="Editar"><span class="material-symbols-outlined" aria-hidden="true">edit</span></button>
          <button class="icono-boton" type="button" data-eliminar aria-label="Eliminar"><span class="material-symbols-outlined" aria-hidden="true">delete</span></button>
        </td>`;
      }
      if (columnasCalculadas[titulo]) {
        const texto = columnasCalculadas[titulo](r);
        if (!columnasEstado.has(titulo)) return `<td>${esc(texto)}</td>`;
        const clasesEstado = {
          pendiente: 'pendiente',
          entregado: 'entregado',
          cancelado: 'cancelado',
          disponible: 'disponible',
          agotada: 'agotado',
          activo: 'usuario-activo',
          inactivo: 'usuario-inactivo'
        };
        const clase = clasesEstado[String(texto).toLowerCase()] || '';
        return `<td><span class="estado ${clase}">${esc(texto)}</span></td>`;
      }

      const campo = campos.find(c => c.dataset.col == i);
      let valor = campo ? r[campo.name] : '';
      if (campo && campo.dataset.moneda !== undefined && valor !== '') valor = '$' + Number(valor).toLocaleString('es-CO');
      return `<td>${esc(valor)}</td>`;
    }).join('');
    return `<tr data-id="${r.id}">${celdas}</tr>`;
  }).join('');
  actualizarPieTabla();
}

/* =====================================================
   Formulario
   ===================================================== */
function mostrarFormulario(fila) {
  const editando = !!fila;
  editandoId = editando ? fila.dataset.id : null;
  formulario.reset();
  fotosSeleccionadas = [];
  actualizarFotos();
  limpiarErrores(formulario);
  formulario.querySelector('.mensaje-exito').textContent = '';
  document.querySelector('.modo').textContent = editando ? 'Editar' : 'Agregar';
  textoGuardar.textContent = editando ? 'Guardar cambios' : textoNuevo;

  if (editando) {
    const registro = leer().find(r => r.id === editandoId);
    if (registro) {
      rellenarFormulario(formulario, registro);
      fotosSeleccionadas = (registro.fotos || []).map(foto => ({
        name: foto.name,
        dataUrl: foto.dataUrl
      }));
      actualizarFotos();
    }
  }
  // Datos automáticos (fecha de registro y pedidos del cliente)
  formulario.querySelectorAll('[data-fill]').forEach(x => {
    x.textContent = editando ? fila.cells[x.dataset.fill].textContent.trim() : x.dataset.def;
  });

  vistaLista.hidden = true;
  vistaFormulario.hidden = false;
  window.scrollTo(0, 0);
  const registro = editando ? leer().find(r => r.id === editandoId) : null;
  document.dispatchEvent(new CustomEvent('formulario-abierto', { detail: { editando, registro } }));
}

function mostrarLista() {
  vistaFormulario.hidden = true;
  vistaLista.hidden = false;
  if (location.hash) history.replaceState(null, '', location.pathname);
  window.scrollTo(0, 0);
  dibujarTabla();
}

document.addEventListener('click', e => {
  if (e.target.closest('[data-nuevo]')) mostrarFormulario(null);
  const editar = e.target.closest('[data-editar]');
  if (editar) mostrarFormulario(editar.closest('tr'));
  if (e.target.closest('[data-cancelar]')) mostrarLista();
});

formulario.addEventListener('submit', async e => {
  e.preventDefault();
  const mensaje = formulario.querySelector('.mensaje-exito');
  mensaje.textContent = '';
  if (!validar(formulario)) { formulario.querySelector('.invalido')?.focus(); return; }
  if (config.validarFormulario && !config.validarFormulario(formulario, editandoId)) {
    formulario.querySelector('.invalido')?.focus();
    return;
  }
  const botonGuardar = formulario.querySelector('[type="submit"]');
  botonGuardar.disabled = true;
  try {
    const fotos = entradaFotos
      ? await Promise.all(fotosSeleccionadas.map(async foto => ({
        name: foto.name,
        dataUrl: foto.dataUrl || await leerFotoComoDataURL(foto.file)
      })))
      : undefined;
    if (!guardarRegistro(formulario, fotos)) return;
    mensaje.textContent = 'Guardado correctamente.';
    setTimeout(mostrarLista, 1000);
  } catch (error) {
    console.error('No se pudieron preparar las fotos para guardar.', error);
    mensaje.textContent = 'No se pudieron guardar las fotos. Inténtalo de nuevo.';
  } finally {
    botonGuardar.disabled = false;
  }
});

formulario.addEventListener('input', e => {
  if (e.target.classList.contains('invalido')) validar(formulario);
});

const entradaFotos = formulario.querySelector('.subida input[type="file"]');
const miniaturas = formulario.querySelector('.miniaturas');
let fotosSeleccionadas = [];
let urlsMiniaturas = [];

function leerFotoComoDataURL(foto) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.addEventListener('load', () => resolve(lector.result));
    lector.addEventListener('error', () => reject(lector.error));
    lector.readAsDataURL(foto);
  });
}

function actualizarFotos() {
  if (!entradaFotos || !miniaturas) return;

  const transferencia = new DataTransfer();
  fotosSeleccionadas.forEach(foto => {
    if (foto.file) transferencia.items.add(foto.file);
  });
  entradaFotos.files = transferencia.files;

  const texto = entradaFotos.parentElement.querySelector('.subida-texto');
  texto.textContent = fotosSeleccionadas.length
    ? `${fotosSeleccionadas.length} foto(s) seleccionada(s)`
    : 'Toca para subir fotos o arrástralas aquí';

  urlsMiniaturas.forEach(url => URL.revokeObjectURL(url));
  urlsMiniaturas = [];
  miniaturas.replaceChildren();

  fotosSeleccionadas.forEach((foto, indice) => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'miniatura';

    const imagen = document.createElement('img');
    imagen.src = foto.dataUrl || URL.createObjectURL(foto.file);
    imagen.alt = foto.name;
    if (!foto.dataUrl) urlsMiniaturas.push(imagen.src);

    const quitar = document.createElement('button');
    quitar.type = 'button';
    quitar.className = 'miniatura-quitar';
    quitar.textContent = '×';
    quitar.setAttribute('aria-label', `Quitar ${foto.name}`);
    quitar.dataset.indice = indice;

    tarjeta.append(imagen, quitar);
    miniaturas.append(tarjeta);
  });
}

function agregarFotos(archivos) {
  const firmasExistentes = new Set(fotosSeleccionadas.map(foto =>
    foto.file
      ? `${foto.name}-${foto.file.size}-${foto.file.lastModified}-${foto.file.type}`
      : foto.name
  ));
  [...archivos].filter(foto => foto.type.startsWith('image/')).forEach(archivo => {
    const firma = `${archivo.name}-${archivo.size}-${archivo.lastModified}-${archivo.type}`;
    if (!firmasExistentes.has(firma)) {
      fotosSeleccionadas.push({ name: archivo.name, file: archivo });
      firmasExistentes.add(firma);
    }
  });
  actualizarFotos();
}

if (entradaFotos && miniaturas) {
  entradaFotos.addEventListener('change', () => agregarFotos(entradaFotos.files));
  miniaturas.addEventListener('click', e => {
    const quitar = e.target.closest('.miniatura-quitar');
    if (!quitar) return;
    fotosSeleccionadas.splice(Number(quitar.dataset.indice), 1);
    actualizarFotos();
  });

  const zonaSubida = entradaFotos.closest('.subida');
  zonaSubida.addEventListener('dragover', e => {
    e.preventDefault();
    zonaSubida.classList.add('arrastrando');
  });
  zonaSubida.addEventListener('dragleave', e => {
    if (!zonaSubida.contains(e.relatedTarget)) zonaSubida.classList.remove('arrastrando');
  });
  zonaSubida.addEventListener('drop', e => {
    e.preventDefault();
    zonaSubida.classList.remove('arrastrando');
    agregarFotos(e.dataTransfer.files);
  });
}

/* ----- Al cargar la página ----- */
dibujarTabla();
if (location.hash === '#nuevo') mostrarFormulario(null);