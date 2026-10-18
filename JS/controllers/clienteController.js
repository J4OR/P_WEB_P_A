import { ClienteModel } from "../models/clienteModel.js";
import { ClienteRepository } from "../repositories/clienteRepository.js";
import { PedidoRepository } from "../repositories/pedidoRepository.js";
import { ClienteView } from "../views/clienteView.js";
import { validateCliente } from "../validators/clienteValidator.js";
import { BaseController } from "./baseController.js";
import { initializeMenu } from "../utils/Menu.js";
import { initializeProfile } from "../utils/Profile.js";

initializeMenu();
initializeProfile();
const repository = new ClienteRepository();
repository.orderRepository = new PedidoRepository();
const view = new ClienteView(document.querySelector(".formulario"), ClienteModel, repository);
new BaseController({
  model: ClienteModel,
  repository,
  view,
  validate: (form, repo, id) => validateCliente(form, repo, id)
});