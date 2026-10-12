// validacionScript.js · Validación de formularios
// Los errores se muestran en la página (nunca con alert)
function limpiarErrores(form) {
  form.querySelectorAll('.error').forEach(e => (e.textContent = ''));
  form.querySelectorAll('.invalido').forEach(i => i.classList.remove('invalido'));
}

function validar(form) {
  let valido = true;
  form.querySelectorAll('input[name],select[name],textarea[name]').forEach(campo => {
    if (['radio', 'checkbox', 'file'].includes(campo.type)) return;
    const valor = campo.value.trim();
    const minimo = +(campo.dataset.min || 0);
    let mensaje = '';
    if (campo.required && !valor) mensaje = 'Este campo es obligatorio.';
    else if (valor && campo.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) mensaje = 'Escribe un correo válido, por ejemplo nombre@lovecookies.co.';
    else if (valor && campo.name === 'celular' && !/^3\d{9}$/.test(valor)) mensaje = 'El celular debe tener 10 dígitos y empezar por 3.';
    else if (valor && campo.dataset.entero !== undefined && (!/^\d+$/.test(valor) || +valor < minimo)) mensaje = 'Escribe un número entero de ' + minimo + ' en adelante.';
    const error = campo.closest('.campo')?.querySelector('.error');
    if (error) error.textContent = mensaje;
    campo.classList.toggle('invalido', !!mensaje);
    if (mensaje) valido = false;
  });
  return valido;
}
