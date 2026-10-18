import { BaseEntityView } from "./BaseEntityView.js";

export class UsuarioView extends BaseEntityView {
  constructor(form, model, repository) {
    super(form, model, repository);
    this.passwordField = form.querySelector('[name="contrasena"]');
    this.confirmationField = form.querySelector('[name="confirmarContrasena"]');
    this.passwordLabel = form.querySelector('[for="contrasena"]');
    this.confirmationLabel = form.querySelector('[for="confirmar-contrasena"]');
    this.passwordHelp = form.querySelector("[data-password-help]");
  }

  prepareForm(record) {
    const required = !record;
    this.passwordField.required = required;
    this.confirmationField.required = required;
    this.passwordLabel.textContent = required ? "Contraseña *" : "Nueva contraseña";
    this.confirmationLabel.textContent = required ? "Confirmar contraseña *" : "Confirmar nueva contraseña";
    this.passwordHelp.textContent = required
      ? "Usa al menos 8 caracteres. La contraseña no se mostrará después de guardarla."
      : "Déjalos vacíos para conservar la contraseña actual. Si la cambias, confirma la nueva.";
  }

  render(records = this.repository.getAll()) {
    super.render(records);
    const footer = document.querySelector(".pie-tabla");
    const labels = footer?.querySelectorAll("span");
    if (!labels || labels.length < 2) return;

    const visibleIds = new Set(
      [...this.tbody.querySelectorAll("tr:not(.fila-vacia)")]
        .filter((row) => !row.hidden)
        .map((row) => row.dataset.id)
    );
    const visibleUsers = records.filter((user) => visibleIds.has(user.id));
    const active = visibleUsers.filter((user) => user.activo).length;
    labels[1].textContent = active + " activos · " + (visibleUsers.length - active) + " inactivos";
  }
}