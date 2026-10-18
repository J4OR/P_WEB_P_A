import { PedidoModel } from "../models/pedidoModel.js";
import { PedidoRepository } from "../repositories/pedidoRepository.js";
import { ProductoRepository } from "../repositories/productoRepository.js";
import { ClienteRepository } from "../repositories/clienteRepository.js";
import { PedidoView } from "../views/pedidoView.js";
import { validatePedido } from "../validators/pedidoValidator.js";
import { BaseController } from "./baseController.js";
import { initializeMenu } from "../utils/Menu.js";
import { initializeProfile } from "../utils/Profile.js";

initializeMenu();
initializeProfile();

const repository = new PedidoRepository();
repository.productRepository = new ProductoRepository();
repository.clientRepository = new ClienteRepository();
const view = new PedidoView(document.querySelector(".formulario"), PedidoModel, repository);

function saveOrder(data, editingId) {
  const oldOrder = editingId ? repository.getById(editingId) : null;
  const products = repository.productRepository.getAll();
  const previousSnapshot = JSON.stringify(products);
  const changes = new Map();

  if (oldOrder?.inventarioDescontado) {
    oldOrder.productosPedido?.forEach((item) => {
      changes.set(item.productoId, (changes.get(item.productoId) || 0) + Number(item.cantidad));
    });
  }
  data.productosPedido.forEach((item) => {
    changes.set(item.productoId, (changes.get(item.productoId) || 0) - Number(item.cantidad));
  });

  products.forEach((product) => {
    if (changes.has(product.id)) product.stock = Number(product.stock) + changes.get(product.id);
  });
  if (products.some((product) => Number(product.stock) < 0)) return null;

  const updatedProducts = products.every((product) =>
    repository.productRepository.update(product.id, product)
  );
  if (!updatedProducts) {
    repository.productRepository.storage.setItem("productos", previousSnapshot);
    return null;
  }

  data.inventarioDescontado = true;
  const saved = editingId ? repository.update(editingId, data) : repository.add(data);
  if (!saved) {
    repository.productRepository.storage.setItem("productos", previousSnapshot);
    return null;
  }
  return saved;
}

function deleteOrder(id) {
  const order = repository.getById(id);
  if (!order) return false;

  if (order.inventarioDescontado && order.estado !== "Entregado") {
    const products = repository.productRepository.getAll();
    const snapshot = JSON.stringify(products);
    order.productosPedido?.forEach((item) => {
      const product = products.find((entry) => entry.id === item.productoId);
      if (product) product.stock = Number(product.stock) + Number(item.cantidad);
    });
    for (const product of products) {
      if (!repository.productRepository.update(product.id, product)) {
        repository.productRepository.storage.setItem("productos", snapshot);
        return false;
      }
    }
    if (!repository.delete(id)) {
      repository.productRepository.storage.setItem("productos", snapshot);
      return false;
    }
    return true;
  }

  return repository.delete(id);
}

new BaseController({
  model: PedidoModel,
  repository,
  view,
  validate: (form, _repo, id) =>
    validatePedido(form, repository.productRepository, id, repository),
  saveRecord: saveOrder,
  deleteRecord: deleteOrder
});