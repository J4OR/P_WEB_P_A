import { CategoriaModel } from "../models/categoriaModel.js";
import { CategoriaRepository } from "../repositories/categoriaRepository.js";
import { ProductoRepository } from "../repositories/productoRepository.js";
import { CategoriaView } from "../views/categoriaView.js";
import { validateCategoria } from "../validators/categoriaValidator.js";
import { BaseController } from "./baseController.js";
import { initializeProfile } from "../utils/Profile.js";

window.initializeMenu();
initializeProfile();
const repository = new CategoriaRepository();
const productRepository = new ProductoRepository();
const form = document.querySelector(".formulario");
const view = new CategoriaView(form, CategoriaModel, repository);
const baseSave = (data, id) => id ? repository.update(id, data) : repository.add(data);
const baseDelete = (id) => {
  const category = repository.getById(id);
  const normalizedName = String(category?.nombre || "").trim().toLocaleLowerCase();
  const isUsed = productRepository.getAll().some((product) =>
    String(product.categoria || "").trim().toLocaleLowerCase() === normalizedName
  );
  const message = document.querySelector(".mensaje-lista");
  if (isUsed) {
    if (message) message.textContent = "No se puede eliminar esta categoría porque está asignada a productos.";
    return false;
  }
  if (message) message.textContent = "";
  return repository.delete(id);
};
new BaseController({
  model: CategoriaModel,
  repository,
  view,
  validate: (currentForm, repo, id) => validateCategoria(currentForm, repo, id),
  saveRecord: (data, id) => {
    const previous = id ? repository.getById(id) : null;
    if (previous && previous.nombre !== data.nombre) {
      const products = productRepository.getAll();
      const previousName = String(previous.nombre || "").trim().toLocaleLowerCase();
      const updatedProducts = products.map((product) =>
        String(product.categoria || "").trim().toLocaleLowerCase() === previousName
          ? { ...product, categoria: data.nombre }
          : product
      );
      const productsChanged = updatedProducts.some((product, index) => product !== products[index]);
      if (productsChanged && !productRepository.save(updatedProducts)) return null;
      const updatedCategory = repository.update(id, data);
      if (!updatedCategory && productsChanged && !productRepository.save(products)) {
        console.error("No se pudieron restaurar las categorías anteriores de los productos.");
      }
      return updatedCategory;
    }
    return baseSave(data, id);
  },
  deleteRecord: baseDelete
});
