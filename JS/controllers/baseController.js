import { clearErrors, showErrors, validateCommon } from "../validators/commonValidator.js";
import { initializeProfile } from "../utils/Profile.js";

export class BaseController {
  constructor({ model, repository, view, validate, saveRecord, deleteRecord }) {
    this.model = model;
    this.repository = repository;
    this.view = view;
    this.validate = validate || this.validateForm.bind(this);
    this.saveRecord = saveRecord || this.saveThroughRepository.bind(this);
    this.deleteRecord = deleteRecord || this.deleteFromRepository.bind(this);
    window.initializeMenu?.();
    initializeProfile();
    this.form = document.querySelector(".formulario");
    this.listSection = document.getElementById("vista-lista");
    this.formSection = document.getElementById("vista-formulario");
    this.dialog = document.getElementById("dialogo");
    this.recordToDelete = null;

    if (!this.form || !this.listSection || !this.formSection) return;
    this.bindEvents();
    this.refresh();
    if (location.hash === "#nuevo") this.openForm();
  }

  validateForm(form) {
    return validateCommon(form);
  }

  bindEvents() {
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-nuevo]")) this.openForm();
      if (event.target.closest("[data-editar]")) this.openForm(event.target.closest("tr"));
      if (event.target.closest("[data-cancelar]")) this.closeForm();
      if (event.target.closest("[data-eliminar]")) this.confirmDelete(event.target.closest("tr"));
    });

    this.form.addEventListener("submit", (event) => this.submit(event));
    this.form.addEventListener("input", (event) => {
      if (event.target.classList.contains("invalido")) clearErrors(this.form);
    });
    this.dialog?.addEventListener("close", () => {
      if (this.dialog.returnValue === "si" && this.recordToDelete) {
        if (this.deleteRecord(this.recordToDelete)) this.refresh();
      }
      this.recordToDelete = null;
      this.dialog.returnValue = "";
    });

    const search = document.querySelector(".buscador");
    search?.addEventListener("input", () => this.applyFilters());

    document.querySelector(".filtros")?.addEventListener("click", (event) => {
      const filter = event.target.closest(".filtro");
      if (!filter) return;
      document.querySelectorAll(".filtro").forEach((item) => item.classList.remove("seleccionado"));
      filter.classList.add("seleccionado");
      this.applyFilters();
    });
  }

  saveThroughRepository(data, id) {
    return id ? this.repository.update(id, data) : this.repository.add(data);
  }

  deleteFromRepository(id) {
    return this.repository.delete(id);
  }

  openForm(row = null) {
    this.editingId = row?.dataset.id || null;
    const record = this.editingId ? this.repository.getById(this.editingId) : null;
    this.form.reset();
    clearErrors(this.form);
    this.view.reset?.();
    this.view.prepareForm?.(record);

    if (record) {
      this.fillForm(record);
      this.view.loadPhotos?.(record.fotos || []);
    }

    const mode = document.querySelector(".modo");
    if (mode) mode.textContent = record ? "Editar" : "Agregar";
    const saveText = this.form.querySelector(".texto-guardar");
    if (saveText) saveText.textContent = record ? "Guardar cambios" : (saveText.dataset.default || "Guardar");

    this.form.querySelectorAll("[data-fill]").forEach((element) => {
      element.textContent = record
        ? row.cells[element.dataset.fill]?.textContent.trim() || ""
        : element.dataset.def || "";
    });

    this.listSection.hidden = true;
    this.formSection.hidden = false;
    document.dispatchEvent(new CustomEvent("formulario-abierto", {
      detail: { editando: Boolean(record), registro: record }
    }));
    this.view.updateDelivery?.();
  }

  fillForm(record) {
    this.form.querySelectorAll("[name]").forEach((field) => {
      if (field.type === "file") return;
      const value = record[field.name];

      if (field.type === "radio") {
        field.checked = String(value) === field.value;
      } else if (field.type === "checkbox") {
        field.checked = Boolean(value);
      } else if (field.tagName === "SELECT" &&
        ![...field.options].some((option) => option.value === String(value ?? ""))) {
        field.value = [...field.options]
          .find((option) => option.textContent.trim() === String(value ?? ""))?.value || "";
      } else {
        field.value = value ?? "";
      }
    });
  }

  collectFormData() {
    const data = {};
    this.form.querySelectorAll("[name]").forEach((field) => {
      if (field.type === "file") return;
      if (field.type === "radio") {
        if (field.checked) data[field.name] = field.value;
        return;
      }
      if (field.type === "checkbox") {
        data[field.name] = field.checked;
        return;
      }
      const value = field.type === "password" ? field.value : field.value.trim();
      data[field.name] = field.dataset.entero !== undefined && value !== "" ? Number(value) : value;
    });
    return data;
  }

  async submit(event) {
    event.preventDefault();
    clearErrors(this.form);

    const data = new this.model({
      ...(this.model.initialValues?.() || {}),
      ...this.collectFormData()
    });
    this.view.prepareData?.(data);
    const errors = this.validate(this.form, this.repository, this.editingId);
    if (errors.length) {
      showErrors(this.form, errors);
      errors[0].field.focus();
      return;
    }

    const button = this.form.querySelector('[type="submit"]');
    if (button) button.disabled = true;

    try {
      const photos = await this.view.getPhotoData?.();
      if (photos !== undefined) data.fotos = photos;
      const saved = await this.saveRecord(data, this.editingId);
      if (!saved) {
        this.showMessage("No se pudo guardar. Revisa el almacenamiento e inténtalo de nuevo.");
        return;
      }
      this.showMessage("Guardado correctamente.");
      this.refresh();
      window.setTimeout(() => this.closeForm(), 500);
    } catch (error) {
      console.error("No se pudo guardar el registro.", error);
      this.showMessage("No se pudo guardar el registro. Revisa los datos e inténtalo de nuevo.");
    } finally {
      if (button) button.disabled = false;
    }
  }

  showMessage(text) {
    const message = this.form.querySelector(".mensaje-exito");
    if (message) message.textContent = text;
  }

  confirmDelete(row) {
    if (!this.dialog) return;
    this.recordToDelete = row?.dataset.id || null;
    this.dialog.showModal();
  }

  closeForm() {
    this.formSection.hidden = true;
    this.listSection.hidden = false;
    if (location.hash) history.replaceState(null, "", location.pathname);
    this.refresh();
  }

  refresh(records = this.repository.getAll()) {
    this.view.render(records);
    this.applyFilters();
  }

  applyFilters() {
    if (!this.view.tbody) return;
    const query = document.querySelector(".buscador")?.value.trim().toLocaleLowerCase() || "";
    const filter = document.querySelector(".filtro.seleccionado")?.dataset.filtro || "";
    this.view.tbody.querySelectorAll("tr:not(.fila-vacia)").forEach((row) => {
      const matchesFilter = !filter || (row.dataset.categoria !== undefined
        ? row.dataset.categoria === filter
        : row.textContent.includes(filter));
      row.hidden = !row.textContent.toLocaleLowerCase().includes(query) ||
        !matchesFilter;
    });
    this.view.renderFooter(this.repository.getAll());
  }
}