import { initializeProfile } from "../utils/Profile.js";
import { PedidoRepository } from "../repositories/pedidoRepository.js";
import { ProductoRepository } from "../repositories/productoRepository.js";
import { ClienteRepository } from "../repositories/clienteRepository.js";
import { InicioView } from "../views/InicioView.js";

export class InicioController {
  constructor(view, orders, products, clients) {
    this.view = view;
    this.orders = orders;
    this.products = products;
    this.clients = clients;
  }

  initialize() {
    window.initializeMenu();
    initializeProfile();
    this.view.renderDate();
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
    this.view.render({
      orders,
      products,
      clients,
      totalSales: orders.reduce((sum, order) => sum + order.total, 0),
      pendingOrders: orders.filter((order) => order.estado === "Pendiente").length
    });
  }
}

new InicioController(
  new InicioView(),
  new PedidoRepository(),
  new ProductoRepository(),
  new ClienteRepository()
).initialize();