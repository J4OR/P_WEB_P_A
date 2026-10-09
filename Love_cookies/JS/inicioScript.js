const fechaElemento = document.getElementById("fecha");

const fecha = new Date();

const opciones = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
};

let fechaTexto = fecha.toLocaleDateString("es-ES", opciones);

// Primera letra en mayúscula
fechaTexto = fechaTexto.charAt(0).toUpperCase() + fechaTexto.slice(1);

fechaElemento.textContent = fechaTexto;