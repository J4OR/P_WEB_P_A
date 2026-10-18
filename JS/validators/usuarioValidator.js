import { validateCommon } from "./commonValidator.js";

export function validateUsuario(form, repository, editingId = null) {
  const errors = validateCommon(form);
  const email = form.querySelector('[name="correo"]');
  const password = form.querySelector('[name="contrasena"]');
  const confirmation = form.querySelector('[name="confirmarContrasena"]');

  if (email?.value.trim()) {
    const duplicate = repository.getAll().some((user) =>
      user.id !== editingId && user.correo?.toLowerCase() === email.value.trim().toLowerCase()
    );
    if (duplicate) errors.push({ field: email, message: "Ya existe un usuario con este correo." });
  }

  const passwordValue = password?.value || "";
  const confirmationValue = confirmation?.value || "";
  if (!editingId && password && !passwordValue) {
    errors.push({ field: password, message: "La contraseña es obligatoria." });
  }
  if (passwordValue && passwordValue.length < 8) {
    errors.push({ field: password, message: "La contraseña debe tener al menos 8 caracteres." });
  }
  if ((passwordValue || confirmationValue) && !passwordValue) {
    errors.push({ field: password, message: "Escribe la contraseña para confirmarla." });
  }
  if ((passwordValue || confirmationValue) && !confirmationValue) {
    errors.push({ field: confirmation, message: "Confirma la contraseña." });
  }
  if (passwordValue && confirmationValue && passwordValue !== confirmationValue) {
    errors.push({ field: confirmation, message: "Las contraseñas no coinciden." });
  }

  return errors;
}