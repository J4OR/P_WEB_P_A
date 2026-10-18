export const CategoriaModel = {
  collection: "categorias",
  searchableFields: ["nombre", "descripcion"],
  counters: {
    Categorías: (items) => items.length
  }
};
