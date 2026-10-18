export const PedidoModel = {
  collection: "pedidos",
  searchableFields: ["cliente", "detalle", "estado", "entrega"],
  columns: {
    "Total (COP)": (order) => "$" + Number(order.total || 0).toLocaleString("es-CO"),
    "Detalle (galletas y cantidades)": (order) => order.detalle || "",
    Estado: (order) => order.estado || ""
  },
  statusColumns: ["Estado"],
  counters: {
    "Pedidos totales": (items) => items.length,
    Pendientes: (items) => items.filter((item) => item.estado === "Pendiente").length,
    Entregados: (items) => items.filter((item) => item.estado === "Entregado").length
  },
  prepare(form, data) {
    const client = form.querySelector('[name="cliente"]')?.selectedOptions[0];
    data.clienteId = client?.value || "";
    data.cliente = client?.dataset.nombre || client?.textContent.trim() || "";
    data.direccion = data.entrega === "Domicilio" ? data.direccion : "";
    data.productosPedido = [...form.querySelectorAll("#lineas .linea")].map((line) => {
      const select = line.querySelector('[name="producto"]');
      const option = select?.selectedOptions[0];
      const quantity = Number(line.querySelector('[name="cantidad"]')?.value || 0);
      return select?.value ? {
        productoId: select.value,
        nombre: option?.textContent.trim() || "",
        cantidad: quantity,
        precio: Number(option?.dataset.precio) || 0
      } : null;
    }).filter(Boolean);
    data.producto = data.productosPedido.map((item) => item.nombre).join(", ");
    data.cantidad = data.productosPedido.reduce((sum, item) => sum + item.cantidad, 0);
    data.detalle = data.productosPedido
      .map((item) => item.nombre + " × " + item.cantidad).join(", ");
    data.total = data.productosPedido.reduce((sum, item) =>
      sum + item.precio * item.cantidad, data.entrega === "Domicilio" ? 4000 : 0);
  }
};