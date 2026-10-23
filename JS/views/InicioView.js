export class InicioView {
  renderDate() {
    const date = document.getElementById("fecha");
    if (date) {
      const text = new Date().toLocaleDateString("es-CO", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
      });
      date.textContent = text.charAt(0).toUpperCase() + text.slice(1);
    }
  }

  render({ orders, products, clients, totalSales, pendingOrders }) {
    this.setText("ventas-totales", "$" + totalSales.toLocaleString("es-CO"));
    this.setText("pedidos-pendientes", pendingOrders);
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
      total.textContent = order.totalFormateado;
      details.append(client, summary);
      row.append(details, status, total);
      panel.append(row);
    });
  }

  renderLowStock(products) {
    const panel = document.querySelector(".panel.stock");
    if (!panel) return;
    panel.querySelectorAll(".producto-stock, .mensaje-vacio").forEach((item) => item.remove());
    const lowStock = products.filter((product) => product.stockBajo)
      .sort((a, b) => a.stock - b.stock);
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