// Selección, lectura y vista previa de fotos del formulario de productos.
(() => {
  const app = window.LoveCookies = window.LoveCookies || {};

  app.crearGestorFotos = function (formulario) {
    const entrada = formulario.querySelector('.subida input[type="file"]');
    const miniaturas = formulario.querySelector(".miniaturas");
    let seleccionadas = [];
    let urlsTemporales = [];

    function actualizarVista() {
      if (!entrada || !miniaturas) return;

      const transferencia = new DataTransfer();
      seleccionadas.forEach(foto => {
        if (foto.file) transferencia.items.add(foto.file);
      });
      entrada.files = transferencia.files;

      const texto = entrada.parentElement.querySelector(".subida-texto");
      if (texto) {
        texto.textContent = seleccionadas.length
          ? seleccionadas.length + " foto(s) seleccionada(s)"
          : "Toca para subir fotos o arrástralas aquí";
      }

      urlsTemporales.forEach(url => URL.revokeObjectURL(url));
      urlsTemporales = [];
      miniaturas.replaceChildren();

      seleccionadas.forEach((foto, indice) => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "miniatura";

        const imagen = document.createElement("img");
        imagen.src = foto.dataUrl || URL.createObjectURL(foto.file);
        imagen.alt = foto.name;
        if (!foto.dataUrl) urlsTemporales.push(imagen.src);

        const quitar = document.createElement("button");
        quitar.type = "button";
        quitar.className = "miniatura-quitar";
        quitar.textContent = "×";
        quitar.setAttribute("aria-label", "Quitar " + foto.name);
        quitar.dataset.indice = indice;

        tarjeta.append(imagen, quitar);
        miniaturas.append(tarjeta);
      });
    }

    function reiniciar() {
      seleccionadas = [];
      actualizarVista();
    }

    function cargar(fotos) {
      seleccionadas = (fotos || []).map(foto => ({
        name: foto.name,
        dataUrl: foto.dataUrl
      }));
      actualizarVista();
    }

    function agregar(archivos) {
      const firmas = new Set(seleccionadas.map(foto =>
        foto.file
          ? foto.name + "-" + foto.file.size + "-" + foto.file.lastModified + "-" + foto.file.type
          : foto.name
      ));

      [...archivos]
        .filter(archivo => archivo.type.startsWith("image/"))
        .forEach(archivo => {
          const firma = archivo.name + "-" + archivo.size + "-" + archivo.lastModified + "-" + archivo.type;
          if (!firmas.has(firma)) {
            seleccionadas.push({ name: archivo.name, file: archivo });
            firmas.add(firma);
          }
        });

      actualizarVista();
    }

    function leerFoto(foto) {
      return new Promise((resolve, reject) => {
        const lector = new FileReader();
        lector.addEventListener("load", () => resolve(lector.result));
        lector.addEventListener("error", () => reject(lector.error));
        lector.readAsDataURL(foto);
      });
    }

    async function prepararParaGuardar() {
      if (!entrada) return undefined;

      return Promise.all(seleccionadas.map(async foto => ({
        name: foto.name,
        dataUrl: foto.dataUrl || await leerFoto(foto.file)
      })));
    }

    if (entrada && miniaturas) {
      entrada.addEventListener("change", () => agregar(entrada.files));

      miniaturas.addEventListener("click", evento => {
        const boton = evento.target.closest(".miniatura-quitar");
        if (!boton) return;

        seleccionadas.splice(Number(boton.dataset.indice), 1);
        actualizarVista();
      });

      const zona = entrada.closest(".subida");
      if (zona) {
        zona.addEventListener("dragover", evento => {
          evento.preventDefault();
          zona.classList.add("arrastrando");
        });

        zona.addEventListener("dragleave", evento => {
          if (!zona.contains(evento.relatedTarget)) zona.classList.remove("arrastrando");
        });

        zona.addEventListener("drop", evento => {
          evento.preventDefault();
          zona.classList.remove("arrastrando");
          agregar(evento.dataTransfer.files);
        });
      }
    }

    return { reiniciar, cargar, prepararParaGuardar };
  };
})();
