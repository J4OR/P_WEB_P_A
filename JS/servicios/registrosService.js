// Reglas genéricas para crear, editar y eliminar registros.
(() => {
  const app = window.LoveCookies = window.LoveCookies || {};

  app.crearServicioRegistros = function (clave, config) {
    const repositorio = app.repositorioLocal;

    function leer() {
      return repositorio.leerLista(clave);
    }

    function guardar(datos, fotos, editandoId) {
      if (fotos !== undefined) datos.fotos = fotos;
      const lista = leer();
      const indice = editandoId ? lista.findIndex(registro => registro.id === editandoId) : -1;
      const registroAnterior = indice === -1 ? null : lista[indice];
      const revertirRelacionado = config.antesDeGuardar?.(datos, registroAnterior);

      if (revertirRelacionado === false) return false;

      if (editandoId) {
        if (indice !== -1) lista[indice] = { ...lista[indice], ...datos };
      } else {
        const valoresIniciales = config.valoresIniciales?.(datos) || {};
        lista.push({ id: Date.now().toString(), ...valoresIniciales, ...datos });
      }

      if (repositorio.guardarLista(clave, lista)) return true;

      revertirRelacionado?.();
      alert("No se pudo guardar: el almacenamiento del navegador está lleno.");
      return false;
    }

    function eliminar(id) {
      const lista = leer();
      const registro = lista.find(item => item.id === id);
      const revertirRelacionado = config.antesDeEliminar?.(registro);

      if (revertirRelacionado === false) return false;

      const guardado = repositorio.guardarLista(
        clave,
        lista.filter(item => item.id !== id)
      );

      if (guardado) return true;

      revertirRelacionado?.();
      alert("No se pudo eliminar: no fue posible guardar el cambio.");
      return false;
    }

    return { leer, guardar, eliminar };
  };
})();
