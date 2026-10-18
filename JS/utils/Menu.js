export function initializeMenu() {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) return;

  let collapseButton = sidebar.querySelector(".sidebar-toggle");
  if (!collapseButton) {
    collapseButton = document.createElement("button");
    collapseButton.className = "sidebar-toggle";
    collapseButton.type = "button";
    const icon = document.createElement("span");
    icon.className = "material-symbols-outlined";
    icon.setAttribute("aria-hidden", "true");
    collapseButton.append(icon);
    sidebar.prepend(collapseButton);
  }

  let collapseIcon = collapseButton.querySelector(".material-symbols-outlined");
  if (!collapseIcon) {
    collapseIcon = document.createElement("span");
    collapseIcon.className = "material-symbols-outlined";
    collapseIcon.setAttribute("aria-hidden", "true");
    collapseButton.append(collapseIcon);
  }

  collapseIcon.textContent = "";

  function setCollapsed(collapsed, persist = true) {
    sidebar.classList.toggle("colapsada", collapsed);
    document.documentElement.classList.toggle("sidebar-colapsada", collapsed);
    collapseButton.setAttribute("aria-label", collapsed ? "Expandir barra lateral" : "Contraer barra lateral");
    collapseButton.setAttribute("aria-expanded", String(!collapsed));
    if (persist) {
      try { localStorage.setItem("sidebar-colapsada", String(collapsed)); } catch { /* El menú funciona sin almacenamiento. */ }
    }
  }

  function readInitialState() {
    try {
      const saved = localStorage.getItem("sidebar-colapsada");
      return saved === null || saved === "true";
    } catch {
      return true;
    }
  }

  setCollapsed(readInitialState(), false);
  requestAnimationFrame(() => requestAnimationFrame(() => sidebar.classList.add("animacion-activa")));

  collapseButton.addEventListener("click", () => {
    setCollapsed(!sidebar.classList.contains("colapsada"));
  });
}