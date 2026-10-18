export const ProductoModel = {
  collection: "productos",
  searchableFields: ["nombre", "categoria", "descripcion"],
  columns: {
    Estado: (producto) => Number(producto.stock) > 0 ? "Disponible" : "Agotada"
  },
  statusColumns: ["Estado"],
  counters: {
    Productos: (items) => items.length,
    Disponibles: (items) => items.filter((item) => Number(item.stock) > 0).length,
    Agotadas: (items) => items.filter((item) => Number(item.stock) === 0).length
  },
  initialValues: () => ({ fotos: [] })
};