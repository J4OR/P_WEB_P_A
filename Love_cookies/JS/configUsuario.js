window.configPagina = {
  columnasCalculadas: {
    'Usuario activo': r => r.activo ? 'Activo' : 'Inactivo'
  },
  columnasEstado: ['Usuario activo'],
  actualizarPieTabla: (lista, cantidadVisible, idsVisibles) => {
    const pie = document.querySelector('.pie-tabla');
    if (!pie) return;

    const [conteo, estados] = pie.querySelectorAll('span');
    const idsVisiblesSet = new Set(idsVisibles);
    const usuariosVisibles = lista.filter(usuario => idsVisiblesSet.has(usuario.id));
    const activos = usuariosVisibles.filter(usuario => usuario.activo).length;
    const inactivos = usuariosVisibles.length - activos;

    conteo.textContent = `Mostrando ${cantidadVisible} de ${lista.length} usuarios`;
    estados.textContent = `${activos} activos · ${inactivos} inactivos`;
  },
  contadoresResumen: {
    'Usuarios': lista => lista.length,
    'Activos': lista => lista.filter(r => r.activo).length,
    'Admin': lista => lista.filter(r => r.rol === 'Admin').length
  }
};