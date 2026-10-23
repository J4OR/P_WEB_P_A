import { PedidoRepository } from "../repositories/pedidoRepository.js";
import { ProductoRepository } from "../repositories/productoRepository.js";
import { ClienteRepository } from "../repositories/clienteRepository.js";
import { PedidoView } from "../views/pedidoView.js";
import { validatePedido } from "../validators/pedidoValidator.js";
import { BaseController } from "./baseController.js";

export class PedidoController extends BaseController {
  constructor() {
    const repository = new PedidoRepository();
    repository.productRepository = new ProductoRepository();
    repository.clientRepository = new ClienteRepository();
    const view = new PedidoView(
      document.querySelector(".formulario"),
      repository.ModelClass,
      repository
    );
    super({ model: repository.ModelClass, repository, view });
  }

  validateForm(form, _repository, id) {
    return validatePedido(form, this.repository.productRepository, id, this.repository);
  }

  saveThroughRepository(data, editingId) {
    const oldOrder = editingId ? this.repository.getById(editingId) : null;
    const productRepository = this.repository.productRepository;
    const products = productRepository.getAll();
    const previousSnapshot = productRepository.storage.getItem(productRepository.collection);
    const changes = new Map();

    if (oldOrder?.inventarioDescontado) {
      oldOrder.productosPedido.forEach((item) => {
        changes.set(item.productoId, (changes.get(item.productoId) || 0) + Number(item.cantidad));
      });
    }
    data.productosPedido.forEach((item) => {
      changes.set(item.productoId, (changes.get(item.productoId) || 0) - Number(item.cantidad));
    });

    products.forEach((product) => {
      if (changes.has(product.id)) product.stock += changes.get(product.id);
    });
    if (products.some((product) => product.stock < 0)) return null;

    if (!productRepository.save(products)) return null;
    data.inventarioDescontado = true;
    const saved = editingId
      ? this.repository.update(editingId, data)
      : this.repository.add(data);
    if (!saved) {
      this.restoreProducts(previousSnapshot);
      return null;
    }
    return saved;
  }

  deleteFromRepository(id) {
    const order = this.repository.getById(id);
    if (!order) return false;
    if (!order.inventarioDescontado || order.estado === "Entregado") {
      return super.deleteFromRepository(id);
    }

    const productRepository = this.repository.productRepository;
    const products = productRepository.getAll();
    const previousSnapshot = productRepository.storage.getItem(productRepository.collection);
    order.productosPedido.forEach((item) => {
      const product = products.find((entry) => entry.id === item.productoId);
      if (product) product.stock += Number(item.cantidad);
    });

    if (!productRepository.save(products)) return false;
    if (!this.repository.delete(id)) {
      this.restoreProducts(previousSnapshot);
      return false;
    }
    return true;
  }

  restoreProducts(snapshot) {
    try {
      if (snapshot === null) {
        this.repository.productRepository.storage.removeItem(
          this.repository.productRepository.collection
        );
      } else {
        this.repository.productRepository.storage.setItem(
          this.repository.productRepository.collection,
          snapshot
        );
      }
    } catch (error) {
      console.error("No se pudo restaurar el inventario anterior.", error);
    }
  }
}

new PedidoController();