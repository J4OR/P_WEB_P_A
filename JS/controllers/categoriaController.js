import { CategoriaRepository } from "../repositories/categoriaRepository.js";
import { ProductoRepository } from "../repositories/productoRepository.js";
import { CategoriaView } from "../views/categoriaView.js";
import { validateCategoria } from "../validators/categoriaValidator.js";
import { BaseController } from "./baseController.js";

export class CategoriaController extends BaseController {
  constructor() {
    const repository = new CategoriaRepository();
    const productRepository = new ProductoRepository();
    const view = new CategoriaView(
      document.querySelector(".formulario"),
      repository.ModelClass,
      repository
    );
    super({ model: repository.ModelClass, repository, view });
    this.productRepository = productRepository;
  }

  validateForm(form, repository, id) {
    return validateCategoria(form, repository, id);
  }

  saveThroughRepository(data, id) {
    const previous = id ? this.repository.getById(id) : null;
    if (!previous || previous.nombre === data.nombre) {
      return super.saveThroughRepository(data, id);
    }

    const products = this.productRepository.getAll();
    const previousName = previous.nombre.trim().toLocaleLowerCase();
    const updatedProducts = products.map((product) => {
      if (String(product.categoria || "").trim().toLocaleLowerCase() !== previousName) return product;
      return new this.productRepository.ModelClass({
        ...product,
        categoria: data.nombre
      });
    });
    const productsChanged = updatedProducts.some((product, index) => product !== products[index]);
    if (productsChanged && !this.productRepository.save(updatedProducts)) return null;

    const updatedCategory = this.repository.update(id, data);
    if (!updatedCategory && productsChanged && !this.productRepository.save(products)) {
      console.error("No se pudieron restaurar las categorías anteriores de los productos.");
    }
    return updatedCategory;
  }

  deleteFromRepository(id) {
    const category = this.repository.getById(id);
    const normalizedName = String(category?.nombre || "").trim().toLocaleLowerCase();
    const isUsed = this.productRepository.getAll().some((product) =>
      String(product.categoria || "").trim().toLocaleLowerCase() === normalizedName
    );
    const message = document.querySelector(".mensaje-lista");
    if (isUsed) {
      if (message) message.textContent = "No se puede eliminar esta categoría porque está asignada a productos.";
      return false;
    }
    if (message) message.textContent = "";
    return super.deleteFromRepository(id);
  }
}

new CategoriaController();
