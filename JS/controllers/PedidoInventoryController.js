export function enableOrderInventory(model) {
  model.beforeSave = (data, previous, repo) => {
    if (previous && !previous.inventarioDescontado) return () => {};
    const products = repo.getAll("productos"),
      raw = repo.storage.getItem("productos"),
      changes = new Map();
    previous?.productosPedido?.forEach((x) =>
      changes.set(
        x.productoId,
        (changes.get(x.productoId) || 0) + Number(x.cantidad),
      ),
    );
    data.productosPedido?.forEach((x) =>
      changes.set(
        x.productoId,
        (changes.get(x.productoId) || 0) - Number(x.cantidad),
      ),
    );
    products.forEach((p) => {
      if (changes.has(p.id)) p.stock = Number(p.stock) + changes.get(p.id);
    });
    if (!repo.saveAll("productos", products)) return false;
    data.inventarioDescontado = true;
    return () => repo.storage.setItem("productos", raw || "[]");
  };
  
  model.beforeDelete = (order, repo) => {
    if (!order.inventarioDescontado || order.estado === "Entregado")
      return () => {};
    const products = repo.getAll("productos"),
      raw = repo.storage.getItem("productos");
    order.productosPedido?.forEach((x) => {
      const p = products.find((y) => y.id === x.productoId);
      if (p) p.stock = Number(p.stock) + Number(x.cantidad);
    });
    if (!repo.saveAll("productos", products)) return false;
    return () => repo.storage.setItem("productos", raw || "[]");
  };
}
