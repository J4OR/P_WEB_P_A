window.configPagina = {
  columnasCalculadas: {
    'Detalle (galletas y cantidades)': r => r.detalle || '',
    Estado: r => r.estado
  },
  columnasEstado: ['Estado'],
  prepararDatos: (form, datos) => {
    datos.direccion = datos.entrega === 'Domicilio' ? datos.direccion : '';
    const clienteSeleccionado = form.querySelector('select[name="cliente"]').selectedOptions[0];
    datos.clienteId = clienteSeleccionado.value;
    datos.cliente = clienteSeleccionado.dataset.nombre || clienteSeleccionado.textContent.trim();
    datos.productosPedido = [...form.querySelectorAll('#lineas .linea')]
      .map(linea => {
        const select = linea.querySelector('select[name="producto"]');
        const opcion = select.selectedOptions[0];
        const cantidad = Number(linea.querySelector('input[name="cantidad"]').value);
        if (!select.value) return null;
        return {
          productoId: select.value,
          nombre: opcion.textContent.trim(),
          cantidad,
          precio: Number(opcion.dataset.precio) || 0
        };
      })
      .filter(Boolean);
    datos.producto = datos.productosPedido.map(item => item.nombre).join(', ');
    datos.cantidad = datos.productosPedido.reduce((total, item) => total + item.cantidad, 0);
    datos.detalle = datos.productosPedido
      .map(item => `${item.nombre} × ${item.cantidad}`)
      .join(', ');
  },
  validarFormulario: (form, editandoId) => {
    let productos = [];
    let pedidos = [];
    try {
      productos = JSON.parse(localStorage.getItem('productos') || '[]');
      pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
    } catch {
      form.querySelector('.mensaje-exito').textContent = 'No se pudo leer el inventario. Recarga la página e inténtalo de nuevo.';
      return false;
    }

    const pedidoAnterior = pedidos.find(pedido => pedido.id === editandoId);
    const stockAnterior = new Map();
    if (pedidoAnterior?.inventarioDescontado) {
      pedidoAnterior.productosPedido?.forEach(item => {
        stockAnterior.set(item.productoId, (stockAnterior.get(item.productoId) || 0) + Number(item.cantidad));
      });
    }

    let valido = true;
    form.querySelectorAll('#lineas .linea').forEach(linea => {
      const select = linea.querySelector('select[name="producto"]');
      const cantidad = linea.querySelector('input[name="cantidad"]');
      const error = cantidad.closest('.campo').querySelector('.error');
      error.textContent = '';
      cantidad.classList.remove('invalido');
      if (!select.value) return;

      const producto = productos.find(item => item.id === select.value);
      const demanda = [...form.querySelectorAll('#lineas .linea')]
        .filter(otraLinea => otraLinea.querySelector('select[name="producto"]').value === select.value)
        .reduce((total, otraLinea) => total + Number(otraLinea.querySelector('input[name="cantidad"]').value || 0), 0);
      const disponible = Number(producto?.stock || 0) + (stockAnterior.get(select.value) || 0);
      if (!producto || demanda > disponible) {
        error.textContent = producto
          ? `Stock insuficiente. Disponible: ${disponible} unidades.`
          : 'El producto ya no existe en el inventario.';
        cantidad.classList.add('invalido');
        valido = false;
      }
    });
    return valido;
  },
  antesDeGuardar: (datos, pedidoAnterior) => {
    if (pedidoAnterior && !pedidoAnterior.inventarioDescontado) return () => {};

    let productos;
    try {
      productos = JSON.parse(localStorage.getItem('productos') || '[]');
    } catch {
      alert('No se pudo leer el inventario; el pedido no se guardó.');
      return false;
    }

    const anterior = localStorage.getItem('productos');
    const cantidades = new Map();
    pedidoAnterior?.productosPedido?.forEach(item => {
      cantidades.set(item.productoId, (cantidades.get(item.productoId) || 0) + Number(item.cantidad));
    });
    datos.productosPedido.forEach(item => {
      cantidades.set(item.productoId, (cantidades.get(item.productoId) || 0) - item.cantidad);
    });

    productos.forEach(producto => {
      if (cantidades.has(producto.id)) {
        producto.stock = Number(producto.stock) + cantidades.get(producto.id);
      }
    });

    try {
      localStorage.setItem('productos', JSON.stringify(productos));
      datos.inventarioDescontado = true;
      return () => localStorage.setItem('productos', anterior || '[]');
    } catch {
      alert('No se pudo actualizar el inventario; el pedido no se guardó.');
      return false;
    }
  },
  antesDeEliminar: pedido => {
    if (!pedido.inventarioDescontado || pedido.estado === 'Entregado' || !pedido.productosPedido?.length) return () => {};

    let productos;
    try {
      productos = JSON.parse(localStorage.getItem('productos') || '[]');
    } catch {
      alert('No se pudo leer el inventario; el pedido no se eliminó.');
      return false;
    }

    const anterior = localStorage.getItem('productos');
    pedido.productosPedido.forEach(item => {
      const producto = productos.find(actual => actual.id === item.productoId);
      if (producto) producto.stock = Number(producto.stock) + Number(item.cantidad);
    });

    try {
      localStorage.setItem('productos', JSON.stringify(productos));
      return () => localStorage.setItem('productos', anterior || '[]');
    } catch {
      alert('No se pudo restaurar el inventario; el pedido no se eliminó.');
      return false;
    }
  },
  actualizarPieTabla: (lista, cantidadVisible, idsVisibles) => {
    const pie = document.querySelector('.pie-tabla');
    if (!pie) return;

    const [conteo, total] = pie.querySelectorAll('span');
    const idsVisiblesSet = new Set(idsVisibles);
    const pedidosVisibles = lista.filter(pedido => idsVisiblesSet.has(pedido.id));
    const sumaTotal = pedidosVisibles.reduce((suma, pedido) => {
      const valor = Number(String(pedido.total ?? 0).replace(/[^\d-]/g, '')) || 0;
      return suma + valor;
    }, 0);

    conteo.textContent = `Mostrando ${cantidadVisible} de ${lista.length} pedidos`;
    total.innerHTML = `Total de pedidos: <b>$${sumaTotal.toLocaleString('es-CO')} COP</b>`;
  },
  contadoresResumen: {
    'Pedidos totales': lista => lista.length,
    'Pendientes': lista => lista.filter(r => r.estado === 'Pendiente').length,
    'Entregados': lista => lista.filter(r => r.estado === 'Entregado').length
  }
};