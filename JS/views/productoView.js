import { BaseEntityView } from "./BaseEntityView.js";

export class ProductoView extends BaseEntityView {
  constructor(form, model, repository, categoryRepository) {
    super(form, model, repository);
    this.categoryRepository = categoryRepository;
    this.categorySelect = form.querySelector('[name="categoria"]');
    this.categoryHelp = this.categorySelect?.closest(".campo")?.querySelector(".ayuda");
    this.categoryFilters = document.querySelector(".filtros");
    this.fileInput = form.querySelector('input[type="file"]');
    this.preview = form.querySelector(".miniaturas");
    this.photos = [];
    this.refreshCategories();
    this.fileInput?.addEventListener("change", () => {
      const files = [...(this.fileInput.files || [])].filter((file) => file.type.startsWith("image/"));
      this.photos = files.map((file) => ({ name: file.name, file }));
      this.renderPhotos();
    });
    this.preview?.addEventListener("click", (event) => {
      const remove = event.target.closest("[data-photo-index]");
      if (!remove) return;
      this.photos.splice(Number(remove.dataset.photoIndex), 1);
      this.renderPhotos();
    });
  }

  render(records = this.repository.getAll()) {
    super.render(records);
    this.tbody?.querySelectorAll("tr:not(.fila-vacia)").forEach((row) => {
      const product = records.find((item) => item.id === row.dataset.id);
      row.dataset.categoria = product?.categoria || "";
    });
    this.renderCategoryFilters();
  }

  reset() {
    this.resetPhotos();
    this.refreshCategories();
  }

  prepareForm(record) {
    this.refreshCategories(record?.categoria || "");
  }

  refreshCategories(currentCategory = "") {
    if (!this.categorySelect) return;
    const categories = this.categoryRepository.getAll();
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = categories.length
      ? "Elegir..."
      : "Primero crea una categoría...";
    this.categorySelect.replaceChildren(placeholder);

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.nombre;
      option.textContent = category.nombre;
      this.categorySelect.append(option);
    });
    if (this.categoryHelp) {
      this.categoryHelp.textContent = categories.length
        ? "Las categorías se administran desde el menú Categorías."
        : "Primero crea una categoría desde el menú Categorías.";
    }

    if (currentCategory && ![...this.categorySelect.options].some((option) => option.value === currentCategory)) {
      const legacyOption = document.createElement("option");
      legacyOption.value = currentCategory;
      legacyOption.textContent = currentCategory;
      this.categorySelect.append(legacyOption);
    }
    this.categorySelect.value = currentCategory;
  }

  renderCategoryFilters() {
    if (!this.categoryFilters) return;
    const selectedFilter = this.categoryFilters.querySelector(".filtro.seleccionado")?.dataset.filtro || "";
    const allButton = document.createElement("button");
    allButton.type = "button";
    allButton.className = "filtro seleccionado";
    allButton.dataset.filtro = "";
    allButton.textContent = "Todas";
    this.categoryFilters.replaceChildren(allButton);

    this.categoryRepository.getAll().forEach((category) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "filtro";
      button.dataset.filtro = category.nombre;
      button.textContent = category.nombre;
      this.categoryFilters.append(button);
    });

    const activeButton = [...this.categoryFilters.querySelectorAll(".filtro")]
      .find((button) => button.dataset.filtro === selectedFilter);
    if (activeButton) {
      this.categoryFilters.querySelector(".filtro.seleccionado")?.classList.remove("seleccionado");
      activeButton.classList.add("seleccionado");
    }
  }

  resetPhotos() {
    this.photos = [];
    if (this.fileInput) this.fileInput.value = "";
    this.renderPhotos();
  }

  loadPhotos(photos = []) {
    this.photos = photos.map((photo) => ({ name: photo.name, dataUrl: photo.dataUrl }));
    this.renderPhotos();
  }

  renderPhotos() {
    if (!this.preview) return;
    this.preview.replaceChildren();
    this.photos.forEach((photo, index) => {
      const card = document.createElement("div");
      const image = document.createElement("img");
      const remove = document.createElement("button");
      card.className = "miniatura";
      image.alt = photo.name;
      image.src = photo.dataUrl || URL.createObjectURL(photo.file);
      remove.type = "button";
      remove.dataset.photoIndex = String(index);
      remove.className = "miniatura-quitar";
      remove.setAttribute("aria-label", "Quitar " + photo.name);
      remove.textContent = "×";
      card.append(image, remove);
      this.preview.append(card);
    });
  }

  async getPhotoData() {
    return Promise.all(this.photos.map((photo) => {
      if (photo.dataUrl) return { name: photo.name, dataUrl: photo.dataUrl };
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ name: photo.name, dataUrl: reader.result });
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(photo.file);
      });
    }));
  }
}