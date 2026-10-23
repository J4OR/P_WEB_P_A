import { UsuarioRepository } from "../repositories/usuarioRepository.js";
import { UsuarioView } from "../views/usuarioView.js";
import { validateUsuario } from "../validators/usuarioValidator.js";
import { BaseController } from "./baseController.js";
import { hashPassword } from "../utils/Password.js";

export class UsuarioController extends BaseController {
  constructor() {
    const repository = new UsuarioRepository();
    const view = new UsuarioView(
      document.querySelector(".formulario"),
      repository.ModelClass,
      repository
    );
    super({ model: repository.ModelClass, repository, view });
  }

  validateForm(form, repository, id) {
    return validateUsuario(form, repository, id);
  }

  async saveThroughRepository(data, id) {
    const { contrasena, confirmarContrasena, ...userData } = data;
    if (contrasena) userData.passwordHash = await hashPassword(contrasena);
    return id
      ? this.repository.update(id, userData)
      : this.repository.add(userData);
  }
}

new UsuarioController();