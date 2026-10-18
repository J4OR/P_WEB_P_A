export const ClienteModel = {
  collection: "clientes",
  searchableFields: ["nombre", "identificacion", "celular"],
  columns: {
    "Fecha de registro": (cliente) => cliente.fechaRegistro || "",
    Pedidos: (cliente, repository) => repository.orderRepository.getAll()
      .filter((order) => order.clienteId
        ? order.clienteId === cliente.id
        : order.cliente === cliente.nombre).length
  },
  counters: {
    Clientes: (items) => items.length,
    "Pedidos hechos": (items, repository) => repository.orderRepository.getAll().length
  },
  initialValues: () => ({
    fechaRegistro: new Intl.DateTimeFormat("es-CO").format(new Date())
  })
};