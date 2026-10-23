import { ProductoRepository } from "../repositories/productoRepository.js";
import { CategoriaRepository } from "../repositories/categoriaRepository.js";
import { ProductoView } from "../views/productoView.js";
import { validateProducto } from "../validators/productoValidator.js";
import { BaseController } from "./baseController.js";

export class ProductoController extends BaseController {
  constructor() {
    const repository = new ProductoRepository();
    const categoryRepository = new CategoriaRepository();
    const view = new ProductoView(
      document.querySelector(".formulario"),
      repository.ModelClass,
      repository,
      categoryRepository
    );
    super({
      model: repository.ModelClass,
      repository,
      view,
      validate: validateProducto
    });
  }
}

new ProductoController();