// pedidosScript.js · Solo para pedidos.html
// Líneas de producto del formulario y cálculo del total
const lineas = document.getElementById('lineas');
const plantilla = document.getElementById('plantilla');
const campoDireccion = document.getElementById('campo-direccion-entrega');
const direccionEntrega = document.getElementById('direccion-entrega');
const pesos = n => '$' + n.toLocaleString('es-CO');

function agregarLinea() { lineas.append(plantilla.content.cloneNode(true)); }

function actualizarEntrega() {
  const domicilio = document.querySelector('input[name="entrega"]:checked')?.value === 'Domicilio';
  campoDireccion.hidden = !domicilio;
  direccionEntrega.required = domicilio;
  document.getElementById('valor-domicilio').hidden = !domicilio;
  calcularTotal();
}

function calcularTotal() {
  let total = 0, unidades = 0;
  lineas.querySelectorAll('.linea').forEach(l => {
    const precio = +(l.querySelector('select').selectedOptions[0].dataset.precio || 0);
    const cantidad = parseInt(l.querySelector('input').value) || 0;
    total += precio * cantidad;
    if (precio) unidades += cantidad;
  });
  const domicilio = document.querySelector('input[name="entrega"]:checked')?.value === 'Domicilio';
  const valorDomicilio = domicilio ? 4000 : 0;
  total += valorDomicilio;
  document.getElementById('total').value = pesos(total);
  document.getElementById('ayuda-total').textContent = unidades ? unidades + ' unidades en el pedido.' : 'Agrega productos para completar el pedido.';
}

document.getElementById('agregar-linea').addEventListener('click', agregarLinea);
lineas.addEventListener('input', calcularTotal);
lineas.addEventListener('change', calcularTotal);
document.querySelectorAll('input[name="entrega"]').forEach(opcion => {
  opcion.addEventListener('change', actualizarEntrega);
});
lineas.addEventListener('click', e => {
  if (e.target.closest('[data-quitar]') && lineas.children.length > 1) {
    e.target.closest('.linea').remove();
    calcularTotal();
  }
});

// Cada vez que se abre el formulario, se reinician las líneas
document.addEventListener('formulario-abierto', e => {
  lineas.innerHTML = '';
  if (e.detail.editando && e.detail.registro?.productosPedido?.length) {
    e.detail.registro.productosPedido.forEach(item => {
      agregarLinea();
      const linea = lineas.lastElementChild;
      linea.querySelector('select[name="producto"]').value = item.productoId;
      linea.querySelector('input[name="cantidad"]').value = item.cantidad;
    });
    calcularTotal();
  } else {
    agregarLinea();
    if (!e.detail.editando) calcularTotal();
  }
  actualizarEntrega();
});

// Llena los select de cliente y producto con lo guardado
(function () {

  function leerLista(clave) {
    try { return JSON.parse(localStorage.getItem(clave)) || []; }
    catch { return []; }
  }

  /* ----- Clientes ----- */
  const selectCliente = document.querySelector('select[name="cliente"]');
  const clientes = leerLista('clientes');

  clientes.forEach(c => {
    const opcion = document.createElement('option');
    opcion.value = c.id;
    opcion.textContent = c.nombre;
    opcion.dataset.nombre = c.nombre;
    selectCliente.appendChild(opcion);
  });

  if (clientes.length === 0) {
    selectCliente.options[0].textContent = 'No hay clientes registrados';
  }

  /* ----- Productos (dentro de la plantilla de cada línea) ----- */
  const plantilla = document.getElementById('plantilla');
  const selectProducto = plantilla.content.querySelector('select[name="producto"]');
  const productos = leerLista('productos');

  productos.forEach(p => {
    const opcion = document.createElement('option');
    opcion.value = p.id;
    opcion.textContent = p.nombre;
    opcion.dataset.precio = p.precio;     // el total se calcula con este precio
    selectProducto.appendChild(opcion);
  });

  if (productos.length === 0) {
    selectProducto.options[0].textContent = 'No hay productos registrados';
  }

})();
agregarLinea();
actualizarEntrega();
