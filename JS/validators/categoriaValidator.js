import { validateCommon } from "./commonValidator.js";

export function validateCategoria(form, repository, editingId = null) {
  const errors = validateCommon(form);
  const nameField = form.querySelector('[name="nombre"]');
  const name = nameField?.value.trim() || "";

  if (nameField && name.length > 40) {
    errors.push({ field: nameField, message: "La categoría no puede superar los 40 caracteres." });
  }

  if (nameField && repository.getAll().some((category) =>
    category.id !== editingId &&
    String(category.nombre || "").trim().toLocaleLowerCase() === name.toLocaleLowerCase()
  )) {
    errors.push({ field: nameField, message: "Ya existe una categoría con ese nombre." });
  }

  return errors;
}
