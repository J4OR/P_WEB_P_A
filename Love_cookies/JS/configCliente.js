window.configPagina = {
  columnasCalculadas: {
    'Fecha de registro': r => {
      if (r.fechaRegistro) return r.fechaRegistro;
      const timestamp = Number(r.id);
      return /^\d{13}$/.test(String(r.id)) && Number.isFinite(timestamp)
        ? new Intl.DateTimeFormat('es-CO').format(new Date(timestamp))
        : '';
    },
    Pedidos: r => {
      let pedidos = [];
      try {
        pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
      } catch {
        pedidos = [];
      }
      return pedidos.filter(pedido =>
        pedido.clienteId
          ? pedido.clienteId === r.id
          : pedido.cliente === r.nombre
      ).length;
    }
  },
  validarFormulario: (form, editandoId) => {
    const identificacion = form.querySelector('[name="identificacion"]');
    const valor = identificacion.value.trim();
    let clientes = [];
    try {
      clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
    } catch {
      clientes = [];
    }

    const duplicada = clientes.some(cliente =>
      cliente.id !== editandoId && cliente.identificacion === valor
    );
    const error = identificacion.closest('.campo').querySelector('.error');
    if (duplicada) {
      error.textContent = 'Ya existe un cliente con esta identificación.';
      identificacion.classList.add('invalido');
      return false;
    }
    return true;
  },
  valoresIniciales: () => ({
    fechaRegistro: new Intl.DateTimeFormat('es-CO').format(new Date()),
    pedidos: 0
  }),
  contadoresResumen: {
    'Clientes': lista => lista.length,
    'Activos': lista => lista.filter(r => r.estado === 'Activo').length,
    'Inactivos': lista => lista.filter(r => r.estado === 'Inactivo').length
  }
};