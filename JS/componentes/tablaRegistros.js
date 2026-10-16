// Dibuja la tabla y los contadores del resumen para las páginas de registros.
(() => {
  const app = window.LoveCookies = window.LoveCookies || {};

  app.crearTablaRegistros = function (formulario, servicio, config) {
    const tbody = document.querySelector(".tabla tbody");
    const htmlFilaVacia = tbody ? tbody.innerHTML : "";
    const columnasCalculadas = config.columnasCalculadas || {};
    const contadoresResumen = config.contadoresResumen || {};

    function actualizarPieTabla() {
      if (!tbody) return;

      const filasVisibles = [...tbody.querySelectorAll("tr:not(.fila-vacia)")]
        .filter(fila => !fila.hidden);

      config.actualizarPieTabla?.(
        servicio.leer(),
        filasVisibles.length,
        filasVisibles.map(fila => fila.dataset.id)
      );
    }

    function escapar(texto) {
      const nodo = document.createElement("span");
      nodo.textContent = texto ?? "";
      return nodo.innerHTML;
    }

    function dibujarTabla() {
      if (!tbody) return;

      const lista = servicio.leer();

      document.querySelectorAll(".resumen-card").forEach(card => {
        const titulo = card.querySelector("p")?.textContent.trim();
        const calcular = contadoresResumen[titulo];
        if (calcular) {
          const numero = card.querySelector("h2");
          if (numero) numero.textContent = calcular(lista);
        }
      });

      if (!lista.length) {
        tbody.innerHTML = htmlFilaVacia;
        actualizarPieTabla();
        return;
      }

      const encabezados = [...document.querySelectorAll(".tabla thead th")];
      const campos = [...formulario.querySelectorAll("[data-col]")];
      const columnasEstado = new Set(config.columnasEstado || []);

      tbody.innerHTML = lista.map(registro => {
        const celdas = encabezados.map((th, indice) => {
          const titulo = th.textContent.trim();

          if (!titulo || titulo.toLowerCase() === "acciones") {
            return '<td class="acciones">' +
              '<button class="icono-boton" type="button" data-editar aria-label="Editar">' +
              '<span class="material-symbols-outlined" aria-hidden="true">edit</span></button>' +
              '<button class="icono-boton" type="button" data-eliminar aria-label="Eliminar">' +
              '<span class="material-symbols-outlined" aria-hidden="true">delete</span></button>' +
              "</td>";
          }

          if (columnasCalculadas[titulo]) {
            const texto = columnasCalculadas[titulo](registro);
            if (!columnasEstado.has(titulo)) {
              return "<td>" + escapar(texto) + "</td>";
            }

            const clasesEstado = {
              pendiente: "pendiente",
              entregado: "entregado",
              cancelado: "cancelado",
              disponible: "disponible",
              agotada: "agotado",
              activo: "usuario-activo",
              inactivo: "usuario-inactivo"
            };
            const clase = clasesEstado[String(texto).toLowerCase()] || "";
            return '<td><span class="estado ' + clase + '">' + escapar(texto) + "</span></td>";
          }

          const campo = campos.find(elemento => elemento.dataset.col == indice);
          let valor = campo ? registro[campo.name] : "";
          if (campo && campo.dataset.moneda !== undefined && valor !== "") {
            valor = "$" + Number(valor).toLocaleString("es-CO");
          }
          return "<td>" + escapar(valor) + "</td>";
        }).join("");

        return '<tr data-id="' + escapar(registro.id) + '">' + celdas + "</tr>";
      }).join("");

      actualizarPieTabla();
    }

    return { dibujarTabla, actualizarPieTabla };
  };
})();
