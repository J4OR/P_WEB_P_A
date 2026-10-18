import { ProductoModel } from "../models/productoModel.js";
import { ProductoRepository } from "../repositories/productoRepository.js";
import { CategoriaRepository } from "../repositories/categoriaRepository.js";
import { ProductoView } from "../views/productoView.js";
import { validateProducto } from "../validators/productoValidator.js";
import { BaseController } from "./baseController.js";
import { initializeMenu } from "../utils/Menu.js";
import { initializeProfile } from "../utils/Profile.js";

initializeMenu();
initializeProfile();
const repository = new ProductoRepository();
const categoryRepository = new CategoriaRepository();
const form = document.querySelector(".formulario");
const view = new ProductoView(form, ProductoModel, repository, categoryRepository);
new BaseController({
  model: ProductoModel,
  repository,
  view,
  validate: validateProducto
});