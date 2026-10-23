import { ClienteRepository } from "../repositories/clienteRepository.js";
import { PedidoRepository } from "../repositories/pedidoRepository.js";
import { ClienteView } from "../views/clienteView.js";
import { validateCliente } from "../validators/clienteValidator.js";
import { BaseController } from "./baseController.js";

export class ClienteController extends BaseController {
  constructor() {
    const repository = new ClienteRepository();
    repository.orderRepository = new PedidoRepository();
    const view = new ClienteView(
      document.querySelector(".formulario"),
      repository.ModelClass,
      repository
    );
    super({ model: repository.ModelClass, repository, view });
  }

  validateForm(form, repository, id) {
    return validateCliente(form, repository, id);
  }
}

new ClienteController();