export class UsuarioModel {
  static collection = "usuarios";
  static get counters() {
    return {
      Usuarios: (items) => items.length,
      Activos: (items) => items.filter((item) => item.activo).length,
      Admin: (items) => items.filter((item) => item.rol === "Admin").length
    };
  }

  constructor(options = {}) {
    this.id = "";
    this.nombre = "";
    this.correo = "";
    this.passwordHash = "";
    this.rol = "Usuario";
    this.activo = true;
    Object.assign(this, options);
    this.id = String(this.id ?? "");
    this.activo = this.activo !== false && this.activo !== "false" && Boolean(this.activo);
  }

  get estado() {
    return this.activo ? "Activo" : "Inactivo";
  }
}