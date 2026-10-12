// pedidosScript.js · Solo para pedidos.html
// Líneas de producto del formulario y cálculo del total
const lineas = document.getElementById('lineas');
const plantilla = document.getElementById('plantilla');
const pesos = n => '$' + n.toLocaleString('es-CO');

function agregarLinea() { lineas.append(plantilla.content.cloneNode(true)); }

function calcularTotal() {
  let total = 0, unidades = 0;
  lineas.querySelectorAll('.linea').forEach(l => {
    const precio = +(l.querySelector('select').selectedOptions[0].dataset.precio || 0);
    const cantidad = parseInt(l.querySelector('input').value) || 0;
    total += precio * cantidad;
    if (precio) unidades += cantidad;
  });
  document.getElementById('total').value = pesos(total);
  document.getElementById('ayuda-total').textContent = unidades ? unidades + ' unidades en el pedido.' : 'Agrega productos para completar el pedido.';
}

document.getElementById('agregar-linea').addEventListener('click', agregarLinea);
lineas.addEventListener('input', calcularTotal);
lineas.addEventListener('change', calcularTotal);
lineas.addEventListener('click', e => {
  if (e.target.closest('[data-quitar]') && lineas.children.length > 1) {
    e.target.closest('.linea').remove();
    calcularTotal();
  }
});

// Cada vez que se abre el formulario, se reinician las líneas
document.addEventListener('formulario-abierto', e => {
  lineas.innerHTML = '';
  agregarLinea();
  if (!e.detail.editando) calcularTotal();   // al editar se conserva el total de la fila
});
agregarLinea();
