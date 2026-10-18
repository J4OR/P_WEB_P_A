import { ProductoRepository } from "../repositories/ProductoRepository.js";
import { PedidoRepository } from "../repositories/PedidoRepository.js";
import { ClienteRepository } from "../repositories/ClienteRepository.js";

export class InicioView {
  constructor() {
    this.orders = new PedidoRepository();
    this.products = new ProductoRepository();
    this.clients = new ClienteRepository();
  }

  initialize() {
    const date = document.getElementById("fecha");
    if (date) {
      let text = new Date().toLocaleDateString("es-CO", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
      });
      date.textContent = text.charAt(0).toUpperCase() + text.slice(1);
    }
    this.render();
    window.addEventListener("storage", () => this.render());
    document.getElementById("nuevo-pedido")?.addEventListener("click", () => {
      location.href = "pedidos.html#nuevo";
    });
    document.getElementById("nuevo-producto")?.addEventListener("click", () => {
      location.href = "productos.html#nuevo";
    });
  }

  render() {
    const orders = this.orders.getAll();
    const products = this.products.getAll();
    const clients = this.clients.getAll();
    const total = orders.reduce((sum, order) => sum + (Number(String(order.total || 0).replace(/[^\d-]/g, "")) || 0), 0);
    this.setText("ventas-totales", "$" + total.toLocaleString("es-CO"));
    this.setText("pedidos-pendientes", orders.filter((order) => order.estado === "Pendiente").length);
    this.setText("total-productos", products.length);
    this.setText("total-clientes", clients.length);
    this.renderRecentOrders(orders);
    this.renderLowStock(products);
  }

  setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  renderRecentOrders(orders) {
    const panel = document.querySelector(".panel.pedidos");
    if (!panel) return;
    panel.querySelectorAll(".pedido, .mensaje-vacio").forEach((item) => item.remove());
    const recent = orders.slice(-5).reverse();
    if (!recent.length) {
      const empty = document.createElement("p");
      empty.className = "mensaje-vacio";
      empty.textContent = "Aún no hay pedidos para mostrar.";
      panel.append(empty);
      return;
    }
    recent.forEach((order) => {
      const row = document.createElement("div");
      const details = document.createElement("div");
      const client = document.createElement("h3");
      const summary = document.createElement("p");
      const status = document.createElement("span");
      const total = document.createElement("strong");
      row.className = "pedido";
      client.textContent = order.cliente || "Cliente sin nombre";
      summary.textContent = order.detalle || order.entrega || "";
      status.className = "estado " + (order.estado === "Entregado" ? "entregado" : "pendiente");
      status.textContent = order.estado || "Sin estado";
      total.textContent = "$" + (Number(String(order.total || 0).replace(/[^\d-]/g, "")) || 0).toLocaleString("es-CO");
      details.append(client, summary);
      row.append(details, status, total);
      panel.append(row);
    });
  }

  renderLowStock(products) {
    const panel = document.querySelector(".panel.stock");
    if (!panel) return;
    panel.querySelectorAll(".producto-stock, .mensaje-vacio").forEach((item) => item.remove());
    const lowStock = products.filter((product) => Number(product.stock) <= 5)
      .sort((a, b) => Number(a.stock) - Number(b.stock));
    if (!lowStock.length) {
      const empty = document.createElement("p");
      empty.className = "mensaje-vacio";
      empty.textContent = "Aún no hay productos para mostrar.";
      panel.append(empty);
      return;
    }
    lowStock.forEach((product) => {
      const row = document.createElement("div");
      const name = document.createElement("span");
      const stock = document.createElement("strong");
      row.className = "producto-stock";
      name.textContent = product.nombre;
      stock.textContent = product.stock + " unidades";
      row.append(name, stock);
      panel.append(row);
    });
  }
}