export function renderCounters(model, records, repository) {
  document.querySelectorAll(".resumen-card").forEach((card) => {
    const label = card.querySelector("p")?.textContent.trim();
    const calculate = model.counters?.[label];
    const number = card.querySelector("h2");
    if (calculate && number) number.textContent = calculate(records, repository);
  });
}

export function renderVisibleCount(records, visibleIds, label) {
  const footer = document.querySelector(".pie-tabla");
  const count = footer?.querySelector("span");
  if (count) count.textContent = "Mostrando " + visibleIds.size + " de " + records.length + " " + label;
}