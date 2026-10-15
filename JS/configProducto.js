window.configPagina = {
  columnasEstado: ['Estado'],
  columnasCalculadas: {
    Estado: r => (Number(r.stock) > 0 ? 'Disponible' : 'Agotada')
  },
  contadoresResumen: {
    'Productos': lista => lista.length,
    'Disponibles': lista => lista.filter(r => r.stock > 0).length,
    'Agotadas': lista => lista.filter(r => r.stock === 0).length
  }
};
