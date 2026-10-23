import { BaseEntityView } from "./BaseEntityView.js";

export class ClienteView extends BaseEntityView {
  getValue(record, title, field) {
    if (title === "Pedidos") {
      return this.repository.orderRepository.getAll().filter((order) =>
        order.clienteId ? order.clienteId === record.id : order.cliente === record.nombre
      ).length;
    }
    return super.getValue(record, title, field);
  }
}
