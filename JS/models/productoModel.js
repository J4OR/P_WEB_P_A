export class ProductoModel {
  static collection = "productos";
  static get counters() {
    return {
      Productos: (items) => items.length,
      Disponibles: (items) => items.filter((item) => item.disponible).length,
      Agotadas: (items) => items.filter((item) => !item.disponible).length,
    };
  }

  constructor(options = {}) {
    this.id = "";
    this.nombre = "";
    this.categoria = "";
    this.precio = 0;
    this.stock = 0;
    this.peso = "";
    this.descripcion = "";
    this.fotos = [];
    Object.assign(this, options);
    this.id = String(this.id ?? "");
    this.precio = Number(this.precio) || 0;
    this.stock = Number(this.stock) || 0;
    this.fotos = Array.isArray(this.fotos) ? this.fotos : [];
  }

  get disponible() {
    return this.stock > 0;
  }

  get estado() {
    return this.disponible ? "Disponible" : "Agotada";
  }

  get stockBajo() {
    return this.stock <= 5;
  }

  static initialValues() {
    return { fotos: [] };
  }
}
