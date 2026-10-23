export class ClienteModel {
  static collection = "clientes";
  static get counters() {
    return {
      Clientes: (items) => items.length,
      "Pedidos hechos": (_items, repository) => repository.orderRepository.getAll().length
    };
  }

  constructor(options = {}) {
    this.id = "";
    this.nombre = "";
    this.identificacion = "";
    this.celular = "";
    this.fechaRegistro = new Intl.DateTimeFormat("es-CO").format(new Date());
    Object.assign(this, options);
    this.id = String(this.id ?? "");
  }

  static initialValues() {
    return {
      fechaRegistro: new Intl.DateTimeFormat("es-CO").format(new Date())
    };
  }
}