export const UsuarioModel = {
  collection: "usuarios",
  searchableFields: ["nombre", "correo", "rol"],
  columns: {
    "Usuario activo": (user) => user.activo ? "Activo" : "Inactivo"
  },
  statusColumns: ["Usuario activo"],
  counters: {
    Usuarios: (items) => items.length,
    Activos: (items) => items.filter((item) => item.activo).length,
    Admin: (items) => items.filter((item) => item.rol === "Admin").length
  }
};