export class CategoriaModel {
  static collection = "categorias";
  static get searchableFields() { return ["nombre", "descripcion"]; }
  static get counters() {
    return { Categorías: (items) => items.length };
  }

  constructor(options = {}) {
    this.id = "";
    this.nombre = "";
    this.descripcion = "";
    Object.assign(this, options);
    this.id = String(this.id ?? "");
  }
}
