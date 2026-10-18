import { UsuarioModel } from "../models/usuarioModel.js";
import { UsuarioRepository } from "../repositories/usuarioRepository.js";
import { UsuarioView } from "../views/usuarioView.js";
import { validateUsuario } from "../validators/usuarioValidator.js";
import { BaseController } from "./baseController.js";
import { initializeMenu } from "../utils/Menu.js";
import { initializeProfile } from "../utils/Profile.js";
import { hashPassword } from "../utils/Password.js";

initializeMenu();
initializeProfile();
const repository = new UsuarioRepository();
const view = new UsuarioView(document.querySelector(".formulario"), UsuarioModel, repository);
new BaseController({
  model: UsuarioModel,
  repository,
  view,
  validate: (form, repo, id) => validateUsuario(form, repo, id),
  saveRecord: async (data, id) => {
    const { contrasena, confirmarContrasena, ...userData } = data;
    if (contrasena) userData.passwordHash = await hashPassword(contrasena);
    return id ? repository.update(id, userData) : repository.add(userData);
  }
});