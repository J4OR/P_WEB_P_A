export class PedidoModel {
  static collection = "pedidos";
  static get counters() {
    return {
      "Pedidos totales": (items) => items.length,
      Pendientes: (items) => items.filter((item) => item.estado === "Pendiente").length,
      Entregados: (items) => items.filter((item) => item.estado === "Entregado").length
    };
  }

  constructor(options = {}) {
    this.id = "";
    this.clienteId = "";
    this.cliente = "";
    this.entrega = "Domicilio";
    this.direccion = "";
    this.estado = "Pendiente";
    this.productosPedido = [];
    this.detalle = "";
    this.inventarioDescontado = false;
    this._total = 0;
    const { total, ...attributes } = options;
    Object.assign(this, attributes);
    this.id = String(this.id ?? "");
    this.productosPedido = Array.isArray(this.productosPedido) ? this.productosPedido : [];
    const storedTotal = attributes._total ?? total ?? this._total;
    this._total = Number(storedTotal) || Number(String(storedTotal).replace(/[^\d-]/g, "")) || 0;
  }

  get total() {
    if (!this.productosPedido.length) return this._total;
    const productsTotal = this.productosPedido.reduce((sum, item) =>
      sum + Number(item.precio || 0) * Number(item.cantidad || 0), 0);
    return productsTotal + (this.entrega === "Domicilio" ? 4000 : 0);
  }

  get totalFormateado() {
    return "$" + this.total.toLocaleString("es-CO");
  }

  get cantidadTotal() {
    return this.productosPedido.reduce((sum, item) => sum + Number(item.cantidad || 0), 0);
  }

  actualizarDetalle() {
    this.detalle = this.productosPedido
      .map((item) => item.nombre + " × " + item.cantidad)
      .join(", ");
    this._total = this.total;
  }
}