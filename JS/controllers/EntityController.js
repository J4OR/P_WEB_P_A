import { EntityService } from "../services/EntityService.js";
import { EntityView } from "../views/EntityView.js";
import { validateCommon, clearErrors } from "../validators/Validators.js";

export class EntityController {
  constructor(model, repo, validate = () => true) {
    this.model = model;
    this.repo = repo;
    this.form = document.querySelector(".formulario");
    this.list = document.getElementById("vista-lista");
    this.panel = document.getElementById("vista-formulario");

    if (!this.form || !this.list || !this.panel) return;

    this.service = new EntityService(model, repo);
    this.view = new EntityView(this.form, model, this.service);
    this.id = null;
    this.view.render();

    // Global document listeners for UI navigation actions
    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-nuevo]")) this.open();
      if (e.target.closest("[data-cancelar]")) this.close();
      if (e.target.closest("[data-editar]")) this.open(e.target.closest("tr"));
    });

    // Form submission handler (creation & updating)
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      clearErrors(this.form);

      const data = {};
      this.form.querySelectorAll("[name]").forEach((f) => {
        if (f.type === "file") return;
        if (f.type === "checkbox") {
          data[f.name] = f.checked;
        } else if (f.type === "radio") {
          if (f.checked) data[f.name] = f.value;
        } else {
          data[f.name] = f.dataset.entero !== undefined ? Number(f.value) : f.value.trim();
        }
      });

      // Optional model-specific data preparation hook
      this.model.prepareData?.(this.form, data);

      if (!validateCommon(this.form) || !validate(this.form, this.id, repo)) return;

      if (this.service.save(data, this.id)) {
        this.view.render();
        this.close();
      }
    });

    // Form internal click listeners (e.g., delete triggers)
    this.form.addEventListener("click", (e) => {
      if (e.target.closest("[data-eliminar]")) {
        const tr = e.target.closest("tr");
        if (confirm("¿Eliminar este registro?")) {
          this.service.remove(tr.dataset.id);
          this.view.render();
        }
      }
    });
  }

  open(row) {
    this.id = row?.dataset.id || null;
    const record = this.service.all().find((x) => x.id === this.id);
    this.form.reset();
    clearErrors(this.form);

    if (record) {
      this.form.querySelectorAll("[name]").forEach((f) => {
        if (f.type === "radio") {
          f.checked = record[f.name] === f.value;
        } else if (f.type === "checkbox") {
          f.checked = !!record[f.name];
        } else if (f.type !== "file") {
          f.value = record[f.name] ?? "";
        }
      });
    }

    this.list.hidden = true;
    this.panel.hidden = false;
    
    document.dispatchEvent(
      new CustomEvent("formulario-abierto", {
        detail: { editando: !!row, registro: record },
      })
    );
  }

  close() {
    this.panel.hidden = true;
    this.list.hidden = false;
    this.view.render();
  }
}