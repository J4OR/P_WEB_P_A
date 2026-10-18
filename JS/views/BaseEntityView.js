import { renderCounters, renderVisibleCount } from "../utils/Counters.js";

const badgeClasses = {
  pendiente: "pendiente",
  entregado: "entregado",
  cancelado: "cancelado",
  disponible: "disponible",
  agotada: "agotado",
  activo: "usuario-activo",
  inactivo: "usuario-inactivo"
};

export class BaseEntityView {
  constructor(form, model, repository) {
    this.form = form;
    this.model = model;
    this.repository = repository;
    this.tbody = document.querySelector(".tabla tbody");
    this.emptyMarkup = this.tbody?.innerHTML || "";
  }

  render(records = this.repository.getAll()) {
    if (!this.tbody) return;
    renderCounters(this.model, records, this.repository);

    if (!records.length) {
      this.tbody.innerHTML = this.emptyMarkup;
      this.renderFooter(records);
      return;
    }

    const headings = [...document.querySelectorAll(".tabla thead th")];
    const fields = [...this.form.querySelectorAll("[data-col]")];
    const rows = records.map((record) => {
      const row = document.createElement("tr");
      row.dataset.id = record.id;

      headings.forEach((heading, index) => {
        const title = heading.textContent.trim();
        const cell = document.createElement("td");

        if (!title || title.toLowerCase() === "acciones") {
          cell.className = "acciones";
          cell.innerHTML = '<button class="icono-boton" type="button" data-editar aria-label="Editar"><span class="material-symbols-outlined" aria-hidden="true">edit</span></button><button class="icono-boton" type="button" data-eliminar aria-label="Eliminar"><span class="material-symbols-outlined" aria-hidden="true">delete</span></button>';
        } else {
          const field = fields.find((item) => Number(item.dataset.col) === index);
          const value = this.model.columns?.[title]
            ? this.model.columns[title](record, this.repository)
            : field ? record[field.name] ?? "" : "";

          if (this.model.statusColumns?.includes(title)) {
            const badge = document.createElement("span");
            badge.className = "estado " + (badgeClasses[String(value).toLowerCase()] || "");
            badge.textContent = value;
            cell.append(badge);
          } else if (field?.dataset.moneda !== undefined && value !== "") {
            cell.textContent = "$" + Number(value).toLocaleString("es-CO");
          } else {
            cell.textContent = value;
          }
        }

        row.append(cell);
      });
      return row;
    });

    this.tbody.replaceChildren(...rows);
    this.renderFooter(records);
  }

  renderFooter(records = this.repository.getAll()) {
    const visibleIds = new Set(
      [...this.tbody.querySelectorAll("tr:not(.fila-vacia)")]
        .filter((row) => !row.hidden)
        .map((row) => row.dataset.id)
    );
    renderVisibleCount(records, visibleIds, this.model.collection);
  }

  showList(listSection, formSection) {
    formSection.hidden = true;
    listSection.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  showForm(listSection, formSection) {
    listSection.hidden = true;
    formSection.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}