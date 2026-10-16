// Único módulo genérico que lee y escribe listas en localStorage.
(() => {
  const app = window.LoveCookies = window.LoveCookies || {};

  function leerLista(clave) {
    try {
      const datos = JSON.parse(localStorage.getItem(clave) || "[]");
      return Array.isArray(datos) ? datos : [];
    } catch {
      return [];
    }
  }

  function guardarLista(clave, lista) {
    try {
      localStorage.setItem(clave, JSON.stringify(lista));
      return true;
    } catch {
      return false;
    }
  }

  app.repositorioLocal = { leerLista, guardarLista };
})();
