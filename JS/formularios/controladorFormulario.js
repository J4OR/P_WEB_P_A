// Coordina la vista de listado, edición y formulario para cada entidad.
(() => {
  const app = window.LoveCookies = window.LoveCookies || {};
  const vistaLista = document.getElementById("vista-lista");
  const vistaFormulario = document.getElementById("vista-formulario");
  const formulario = document.querySelector(".formulario");

  // La página de Inicio no contiene formulario; no hay nada que inicializar allí.
  if (!formulario || !vistaLista || !vistaFormulario) return;

  const config = window.configPagina || {};
  const clave = formulario.dataset.clave ||
    location.pathname.split("/").pop().replace(".html", "");
  const servicio = app.crearServicioRegistros(clave, config);
  const tabla = app.crearTablaRegistros(formulario, servicio, config);
  const fotos = app.crearGestorFotos(formulario);
  const textoGuardar = formulario.querySelector(".texto-guardar");
  const textoNuevo = textoGuardar ? textoGuardar.textContent : "Guardar";
  let editandoId = null;

  app.servicioActual = servicio;
  app.tablaActual = tabla;
  app.eliminarRegistro = id => {
    const eliminado = servicio.eliminar(id);
    if (eliminado) tabla.dibujarTabla();
    return eliminado;
  };

  function recogerDatos(form) {
    const datos = {};

    form.querySelectorAll("[name]").forEach(campo => {
      if (campo.type === "file") return;
      if (campo.type === "radio") {
        if (campo.checked) datos[campo.name] = campo.value;
        return;
      }
      if (campo.type === "checkbox") {
        datos[campo.name] = campo.checked;
        return;
      }

      const valor = campo.value.trim();
      datos[campo.name] =
        campo.dataset.entero !== undefined && valor !== "" ? Number(valor) : valor;
    });

    config.prepararDatos?.(form, datos);
    return datos;
  }

  function rellenarFormulario(registro) {
    formulario.querySelectorAll("[name]").forEach(campo => {
      if (campo.type === "file") return;

      const valor = registro[campo.name];
      if (campo.type === "radio") {
        campo.checked = String(valor) === campo.value;
      } else if (campo.type === "checkbox") {
        campo.checked = !!valor;
      } else if (
        campo.tagName === "SELECT" &&
        ![...campo.options].some(opcion => opcion.value === String(valor ?? ""))
      ) {
        campo.value = [...campo.options]
          .find(opcion => opcion.textContent.trim() === String(valor ?? ""))?.value ?? "";
      } else {
        campo.value = valor ?? "";
      }
    });
  }

  function mostrarFormulario(fila) {
    const editando = !!fila;
    editandoId = editando ? fila.dataset.id : null;
    formulario.reset();
    fotos.reiniciar();
    window.limpiarErrores?.(formulario);

    const mensaje = formulario.querySelector(".mensaje-exito");
    if (mensaje) mensaje.textContent = "";

    const modo = document.querySelector(".modo");
    if (modo) modo.textContent = editando ? "Editar" : "Agregar";
    if (textoGuardar) textoGuardar.textContent = editando ? "Guardar cambios" : textoNuevo;

    const registro = editando
      ? servicio.leer().find(item => item.id === editandoId)
      : null;

    if (registro) {
      rellenarFormulario(registro);
      fotos.cargar(registro.fotos);
    }

    formulario.querySelectorAll("[data-fill]").forEach(elemento => {
      elemento.textContent = editando
        ? fila.cells[elemento.dataset.fill].textContent.trim()
        : elemento.dataset.def;
    });

    vistaLista.hidden = true;
    vistaFormulario.hidden = false;
    window.scrollTo(0, 0);

    document.dispatchEvent(new CustomEvent("formulario-abierto", {
      detail: { editando, registro }
    }));
  }

  function mostrarLista() {
    vistaFormulario.hidden = true;
    vistaLista.hidden = false;
    if (location.hash) history.replaceState(null, "", location.pathname);
    window.scrollTo(0, 0);
    tabla.dibujarTabla();
  }

  document.addEventListener("click", evento => {
    if (evento.target.closest("[data-nuevo]")) mostrarFormulario(null);

    const botonEditar = evento.target.closest("[data-editar]");
    if (botonEditar) mostrarFormulario(botonEditar.closest("tr"));

    if (evento.target.closest("[data-cancelar]")) mostrarLista();
  });

  formulario.addEventListener("submit", async evento => {
    evento.preventDefault();

    const mensaje = formulario.querySelector(".mensaje-exito");
    if (mensaje) mensaje.textContent = "";

    if (window.validar && !window.validar(formulario)) {
      formulario.querySelector(".invalido")?.focus();
      return;
    }

    if (config.validarFormulario && !config.validarFormulario(formulario, editandoId)) {
      formulario.querySelector(".invalido")?.focus();
      return;
    }

    const botonGuardar = formulario.querySelector('[type="submit"]');
    if (botonGuardar) botonGuardar.disabled = true;

    try {
      const fotosGuardadas = await fotos.prepararParaGuardar();
      const guardado = servicio.guardar(recogerDatos(formulario), fotosGuardadas, editandoId);

      if (!guardado) return;
      if (mensaje) mensaje.textContent = "Guardado correctamente.";
      setTimeout(mostrarLista, 1000);
    } catch (error) {
      console.error("No se pudieron preparar las fotos para guardar.", error);
      if (mensaje) mensaje.textContent = "No se pudieron guardar las fotos. Inténtalo de nuevo.";
    } finally {
      if (botonGuardar) botonGuardar.disabled = false;
    }
  });

  formulario.addEventListener("input", evento => {
    if (evento.target.classList.contains("invalido")) window.validar?.(formulario);
  });

  tabla.dibujarTabla();
  if (location.hash === "#nuevo") mostrarFormulario(null);
})();
