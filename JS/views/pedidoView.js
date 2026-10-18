import { BaseEntityView } from "./BaseEntityView.js";

export class PedidoView extends BaseEntityView {
  constructor(form, model, repository) {
    super(form, model, repository);
    this.lines = form.querySelector("#lineas");
    this.template = document.getElementById("plantilla");
    this.populateSelects();
    this.bindOrderForm();
  }

  populateSelects() {
    const clients = this.repository.clientRepository?.getAll() || [];
    const products = this.repository.productRepository?.getAll() || [];
    const clientSelect = this.form.querySelector('[name="cliente"]');
    const productSelect = this.template?.content.querySelector('[name="producto"]');

    clients.forEach((client) => {
      const option = new Option(client.nombre, client.id);
      option.dataset.nombre = client.nombre;
      clientSelect?.append(option);
    });
    products.forEach((product) => {
      const option = new Option(product.nombre, product.id);
      option.dataset.precio = product.precio;
      productSelect?.append(option);
    });
    if (!clients.length && clientSelect?.options[0]) clientSelect.options[0].textContent = "No hay clientes registrados";
    if (!products.length && productSelect?.options[0]) productSelect.options[0].textContent = "No hay productos registrados";
  }

  addLine(item = null) {
    this.lines.append(this.template.content.cloneNode(true));
    const line = this.lines.lastElementChild;
    if (item) {
      line.querySelector('[name="producto"]').value = item.productoId;
      line.querySelector('[name="cantidad"]').value = item.cantidad;
    }
    this.updateUnitPrice(line);
  }

  bindOrderForm() {
    document.getElementById("agregar-linea")?.addEventListener("click", () => {
      this.addLine();
      this.updateTotal();
    });
    this.lines?.addEventListener("input", () => this.updateTotal());
    this.lines?.addEventListener("change", () => this.updateTotal());
    this.lines?.addEventListener("click", (event) => {
      if (event.target.closest("[data-quitar]") && this.lines.children.length > 1) {
        event.target.closest(".linea").remove();
        this.updateTotal();
      }
    });
    this.form.querySelectorAll('[name="entrega"]').forEach((radio) => {
      radio.addEventListener("change", () => this.updateDelivery());
    });
    this.lines?.addEventListener("change", (event) => {
      if (event.target.matches('[name="producto"]')) this.updateTotal();
    });
    document.addEventListener("formulario-abierto", (event) => {
      if (!this.lines) return;
      this.lines.replaceChildren();
      const items = event.detail.registro?.productosPedido || [];
      if (event.detail.editando && items.length) items.forEach((item) => this.addLine(item));
      else this.addLine();
      this.updateDelivery();
      this.updateTotal();
    });
    this.addLine();
    this.updateDelivery();
  }

  renderFooter(records = this.repository.getAll()) {
    super.renderFooter(records);
    const labels = document.querySelector(".pie-tabla")?.querySelectorAll("span");
    if (!labels || labels.length < 2) return;
    const visibleIds = new Set([...this.tbody.querySelectorAll("tr:not(.fila-vacia)")]
      .filter((row) => !row.hidden).map((row) => row.dataset.id));
    const visible = records.filter((order) => visibleIds.has(order.id));
    const total = visible.reduce((sum, order) =>
      sum + (Number(String(order.total || 0).replace(/[^\d-]/g, "")) || 0), 0);
    labels[1].textContent = "Total de pedidos: $" + total.toLocaleString("es-CO") + " COP";
  }

  updateDelivery() {
    const home = this.form.querySelector('[name="entrega"]:checked')?.value === "Domicilio";
    const address = document.getElementById("direccion-entrega");
    const addressField = document.getElementById("campo-direccion-entrega");
    const fee = document.getElementById("valor-domicilio");
    if (addressField) addressField.hidden = !home;
    if (address) address.required = home;
    if (fee) fee.hidden = !home;
    this.updateTotal();
  }

  updateTotal() {
    let total = 0;
    let units = 0;
    this.lines?.querySelectorAll(".linea").forEach((line) => {
      const select = line.querySelector('[name="producto"]');
      const price = Number(select?.selectedOptions[0]?.dataset.precio || 0);
      const quantity = Number(line.querySelector('[name="cantidad"]')?.value || 0);
      this.updateUnitPrice(line);
      total += price * quantity;
      if (price) units += quantity;
    });
    if (this.form.querySelector('[name="entrega"]:checked')?.value === "Domicilio") total += 4000;
    const totalField = document.getElementById("total");
    const hint = document.getElementById("ayuda-total");
    if (totalField) totalField.value = "$" + total.toLocaleString("es-CO");
    if (hint) hint.textContent = units ? units + " unidades en el pedido." : "Agrega productos para completar el pedido.";
  }

  updateUnitPrice(line) {
    const select = line.querySelector('[name="producto"]');
    const output = line.querySelector(".precio-unitario");
    if (!output) return;

    const option = select?.selectedOptions[0];
    output.textContent = option?.value
      ? "$" + Number(option.dataset.precio || 0).toLocaleString("es-CO") + " COP"
      : "—";
  }
}