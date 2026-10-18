import { validateCommon } from "./commonValidator.js";

export function validatePedido(form, productRepository, editingId = null, orderRepository) {
  const errors = validateCommon(form);
  const lines = [...form.querySelectorAll("#lineas .linea")];
  const oldOrder = orderRepository?.getById(editingId);
  const oldStock = new Map();

  if (oldOrder?.inventarioDescontado) {
    oldOrder.productosPedido?.forEach((item) => {
      oldStock.set(item.productoId, (oldStock.get(item.productoId) || 0) + Number(item.cantidad));
    });
  }

  const requested = new Map();
  lines.forEach((line) => {
    const productId = line.querySelector('[name="producto"]')?.value;
    const quantity = Number(line.querySelector('[name="cantidad"]')?.value || 0);
    if (productId) requested.set(productId, (requested.get(productId) || 0) + quantity);
  });

  if (!lines.some((line) => line.querySelector('[name="producto"]')?.value)) {
    const select = lines[0]?.querySelector('[name="producto"]');
    if (select) errors.push({ field: select, message: "Agrega al menos un producto." });
  }

  lines.forEach((line) => {
    const select = line.querySelector('[name="producto"]');
    const quantity = line.querySelector('[name="cantidad"]');
    if (!select?.value) return;

    const product = productRepository.getById(select.value);
    const available = Number(product?.stock || 0) + (oldStock.get(select.value) || 0);

    if (!product || requested.get(select.value) > available) {
      errors.push({
        field: quantity,
        message: product
          ? "Stock insuficiente. Disponible: " + available + " unidades."
          : "El producto seleccionado ya no existe."
      });
    }
  });

  return errors;
}