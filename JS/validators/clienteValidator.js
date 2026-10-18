import { validateCommon } from "./commonValidator.js";

export function validateCliente(form, repository, editingId = null) {
  const errors = validateCommon(form);
  const identification = form.querySelector('[name="identificacion"]');

  if (identification?.value.trim()) {
    const duplicate = repository.getAll().some((client) =>
      client.id !== editingId && client.identificacion === identification.value.trim()
    );
    if (duplicate) {
      errors.push({
        field: identification,
        message: "Ya existe un cliente con esta identificación."
      });
    }
  }

  return errors;
}