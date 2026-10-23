export function initializeOrderForm(repo) {
  const form = document.querySelector(".formulario"),
    lines = document.getElementById("lineas"),
    template = document.getElementById("plantilla");
  if (!form || !lines || !template) return;
  const clients = repo.getAll("clientes"),
    products = repo.getAll("productos"),
    client = form.querySelector('[name="cliente"]'),
    productTemplate = template.content.querySelector('[name="producto"]');
  const option = (select, id, label, data) => {
    const o = document.createElement("option");
    o.value = id;
    o.textContent = label;
    Object.entries(data || {}).forEach(([k, v]) => (o.dataset[k] = v));
    select.append(o);
  };
  clients.forEach((c) => option(client, c.id, c.nombre, { nombre: c.nombre }));
  products.forEach((p) =>
    option(productTemplate, p.id, p.nombre, { precio: p.precio }),
  );
  if (!clients.length && client?.options[0])
    client.options[0].textContent = "No hay clientes registrados";
  if (!products.length && productTemplate?.options[0])
    productTemplate.options[0].textContent = "No hay productos registrados";
  const add = (item) => {
    lines.append(template.content.cloneNode(true));
    const row = lines.lastElementChild;
    if (item) {
      row.querySelector('[name="producto"]').value = item.productoId;
      row.querySelector('[name="cantidad"]').value = item.cantidad;
    }
  };
  const total = () => {
    let amount = 0,
      units = 0;
    lines.querySelectorAll(".linea").forEach((row) => {
      const s = row.querySelector('[name="producto"]'),
        q = Number(row.querySelector('[name="cantidad"]').value || 0),
        price = Number(s.selectedOptions[0]?.dataset.precio || 0);
      amount += q * price;
      if (price) units += q;
    });
    if (form.querySelector('[name="entrega"]:checked')?.value === "Domicilio")
      amount += 4000;
    const field = document.getElementById("total"),
      hint = document.getElementById("ayuda-total");
    if (field) field.value = "$" + amount.toLocaleString("es-CO");
    if (hint)
      hint.textContent = units
        ? units + " unidades en el pedido."
        : "Agrega productos para completar el pedido.";
  };
  document.getElementById("agregar-linea")?.addEventListener("click", () => {
    add();
    total();
  });
  lines.addEventListener("input", total);
  lines.addEventListener("change", total);
  lines.addEventListener("click", (e) => {
    if (e.target.closest("[data-quitar]") && lines.children.length > 1) {
      e.target.closest(".linea").remove();
      total();
    }
  });
  form
    .querySelectorAll('[name="entrega"]')
    .forEach((r) => r.addEventListener("change", total));
  document.addEventListener("formulario-abierto", (e) => {
    lines.replaceChildren();
    const items = e.detail.registro?.productosPedido || [];
    if (e.detail.editando && items.length) items.forEach(add);
    else add();
    total();
  });
  add();
  total();
}
