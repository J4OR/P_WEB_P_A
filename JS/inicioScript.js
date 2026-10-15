const fechaElemento = document.getElementById("fecha");

const fecha = new Date();

const opciones = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
};

let fechaTexto = fecha.toLocaleDateString("es-ES", opciones);

// Primera letra en mayúscula
fechaTexto = fechaTexto.charAt(0).toUpperCase() + fechaTexto.slice(1);

fechaElemento.textContent = fechaTexto;

function leerLista(clave) {
    try {
        const datos = JSON.parse(localStorage.getItem(clave) || '[]');
        return Array.isArray(datos) ? datos : [];
    } catch {
        return [];
    }
}

function obtenerTotal(pedido) {
    return Number(String(pedido.total ?? 0).replace(/[^\d-]/g, '')) || 0;
}

function formatoPesos(valor) {
    return `$${valor.toLocaleString('es-CO')}`;
}

function mostrarMensaje(panel, texto) {
    const mensaje = document.createElement('p');
    mensaje.className = 'mensaje-vacio';
    mensaje.textContent = texto;
    panel.appendChild(mensaje);
}

function actualizarResumen() {
    const pedidos = leerLista('pedidos');
    const productos = leerLista('productos');
    const clientes = leerLista('clientes');

    document.getElementById('ventas-totales').textContent =
        formatoPesos(pedidos.reduce((suma, pedido) => suma + obtenerTotal(pedido), 0));
    document.getElementById('pedidos-pendientes').textContent =
        pedidos.filter(pedido => pedido.estado === 'Pendiente').length;
    document.getElementById('total-productos').textContent = productos.length;
    document.getElementById('total-clientes').textContent = clientes.length;

    const panelPedidos = document.querySelector('.panel.pedidos');
    panelPedidos.querySelectorAll('.pedido, .mensaje-vacio').forEach(elemento => elemento.remove());
    const pedidosRecientes = pedidos.slice(-5).reverse();

    if (!pedidosRecientes.length) {
        mostrarMensaje(panelPedidos, 'Aún no hay pedidos para mostrar.');
    } else {
        pedidosRecientes.forEach(pedido => {
            const fila = document.createElement('div');
            fila.className = 'pedido';
            const detalle = document.createElement('div');
            const cliente = document.createElement('h3');
            cliente.textContent = pedido.cliente || 'Cliente sin nombre';
            const productosPedido = document.createElement('p');
            productosPedido.textContent = pedido.detalle || pedido.entrega || '';
            const estado = document.createElement('span');
            estado.className = `estado ${pedido.estado === 'Entregado' ? 'entregado' : 'pendiente'}`;
            estado.textContent = pedido.estado || 'Sin estado';
            const total = document.createElement('strong');
            total.textContent = formatoPesos(obtenerTotal(pedido));

            detalle.append(cliente, productosPedido);
            fila.append(detalle, estado, total);
            panelPedidos.appendChild(fila);
        });
    }

    const panelStock = document.querySelector('.panel.stock');
    panelStock.querySelectorAll('.producto-stock, .mensaje-vacio').forEach(elemento => elemento.remove());
    const productosStockBajo = productos
        .filter(producto => Number(producto.stock) <= 5)
        .sort((a, b) => Number(a.stock) - Number(b.stock));

    if (!productosStockBajo.length) {
        mostrarMensaje(panelStock, 'No hay productos con 5 o menos unidades.');
    } else {
        productosStockBajo.forEach(producto => {
            const fila = document.createElement('div');
            fila.className = 'producto-stock';
            const nombre = document.createElement('span');
            nombre.textContent = producto.nombre || 'Producto sin nombre';
            const cantidad = document.createElement('strong');
            cantidad.textContent = `${producto.stock} unidades`;
            fila.append(nombre, cantidad);
            panelStock.appendChild(fila);
        });
    }
}

actualizarResumen();
window.addEventListener('storage', actualizarResumen);

// Accesos rápidos de la tarjeta de bienvenida
document.getElementById("nuevo-pedido").addEventListener("click", () => {
    location.href = "pedidos.html#nuevo";
});
document.getElementById("nuevo-producto").addEventListener("click", () => {
    location.href = "productos.html#nuevo";
});
