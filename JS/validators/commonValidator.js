export function validateCommon(form) {
  const errors = [];
  const fields = form.querySelectorAll("input[name], select[name], textarea[name]");

  fields.forEach((field) => {
    if (["radio", "checkbox", "file"].includes(field.type)) return;
    const value = field.value.trim();
    const min = Number(field.dataset.min || 0);
    let message = "";

    if (field.required && !value) {
      message = "Este campo es obligatorio.";
    } else if (value && field.type === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      message = "Escribe un correo válido.";
    } else if (value && field.name === "celular" && !/^3\d{9}$/.test(value)) {
      message = "El celular debe tener 10 dígitos y empezar por 3.";
    } else if (value && field.name === "identificacion" && !/^\d{6,12}$/.test(value)) {
      message = "La identificación debe tener entre 6 y 12 dígitos.";
    } else if (value && field.dataset.entero !== undefined &&
      (!/^\d+$/.test(value) || Number(value) < min)) {
      message = "Escribe un número entero desde " + min + ".";
    }

    if (message) errors.push({ field, message });
  });

  return errors;
}

export function showErrors(form, errors) {
  form.querySelectorAll(".error").forEach((node) => { node.textContent = ""; });
  form.querySelectorAll(".invalido").forEach((node) => node.classList.remove("invalido"));

  errors.forEach(({ field, message }) => {
    const output = field.closest(".campo")?.querySelector(".error");
    if (output) output.textContent = message;
    field.classList.add("invalido");
  });
}

export function clearErrors(form) {
  form.querySelectorAll(".error").forEach((node) => { node.textContent = ""; });
  form.querySelectorAll(".invalido").forEach((node) => node.classList.remove("invalido"));
}