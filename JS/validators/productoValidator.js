import { validateCommon } from "./commonValidator.js";

export function validateProducto(form) {
  const errors = validateCommon(form);
  const price = form.querySelector('[name="precio"]');
  const stock = form.querySelector('[name="stock"]');

  if (price && Number(price.value) <= 0) {
    errors.push({ field: price, message: "El precio debe ser mayor que cero." });
  }
  if (stock && Number(stock.value) < 0) {
    errors.push({ field: stock, message: "El stock no puede ser negativo." });
  }

  return errors;
}