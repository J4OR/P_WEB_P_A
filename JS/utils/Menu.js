(function () {
  function readInitialState() {
    try {
      const saved = localStorage.getItem("sidebar-colapsada");
      return saved === null || saved === "true";
    } catch {
      return true;
    }
  }

  document.documentElement.classList.toggle("sidebar-colapsada", readInitialState());

  window.initializeMenu = function initializeMenu() {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;

    const mobileBreakpoint = window.matchMedia("(max-width: 900px)");
    const topbarLeft = document.querySelector(".topbar-izq");
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

    let mobileToggle = topbarLeft?.querySelector(".menu-movil-toggle");
    if (topbarLeft && !mobileToggle) {
      mobileToggle = document.createElement("button");
      mobileToggle.className = "menu-movil-toggle";
      mobileToggle.type = "button";
      mobileToggle.setAttribute("aria-label", "Abrir menú de navegación");
      mobileToggle.setAttribute("aria-expanded", "false");
      const icon = document.createElement("span");
      icon.className = "material-symbols-outlined";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "menu";
      mobileToggle.append(icon);
      topbarLeft.prepend(mobileToggle);
    }

    const dashboard = sidebar.closest(".dashboard");
    let backdrop = dashboard?.querySelector(".sidebar-backdrop");
    if (dashboard && !backdrop) {
      backdrop = document.createElement("button");
      backdrop.className = "sidebar-backdrop";
      backdrop.type = "button";
      backdrop.setAttribute("aria-label", "Cerrar menú de navegación");
      dashboard.append(backdrop);
    }

    function setCollapsed(collapsed, persist = true) {
      sidebar.classList.toggle("colapsada", collapsed);
      document.documentElement.classList.toggle("sidebar-colapsada", collapsed);
      collapseButton.setAttribute("aria-label", collapsed ? "Expandir barra lateral" : "Contraer barra lateral");
      collapseButton.setAttribute("aria-expanded", String(!collapsed));
      if (persist) {
        try { localStorage.setItem("sidebar-colapsada", String(collapsed)); } catch { /* El menú funciona sin almacenamiento. */ }
      }
    }

    function setMobileOpen(open, restoreFocus = false) {
      document.documentElement.classList.toggle("menu-movil-abierto", open);
      if (mobileBreakpoint.matches) {
        collapseButton.setAttribute("aria-label", open ? "Cerrar menú de navegación" : "Abrir menú de navegación");
        collapseButton.setAttribute("aria-expanded", String(open));
      }
      if (mobileToggle) {
        mobileToggle.setAttribute("aria-label", open ? "Cerrar menú de navegación" : "Abrir menú de navegación");
        mobileToggle.setAttribute("aria-expanded", String(open));
        mobileToggle.querySelector(".material-symbols-outlined").textContent = open ? "close" : "menu";
      }
      if (open) collapseButton.focus();
      if (!open && restoreFocus) mobileToggle?.focus();
    }

    const initiallyCollapsed = document.documentElement.classList.contains("sidebar-colapsada");
    setCollapsed(initiallyCollapsed, false);
    setMobileOpen(false);
    requestAnimationFrame(() => requestAnimationFrame(() => sidebar.classList.add("animacion-activa")));

    collapseButton.addEventListener("click", () => {
      if (mobileBreakpoint.matches) {
        setMobileOpen(!document.documentElement.classList.contains("menu-movil-abierto"), true);
      } else {
        setCollapsed(!sidebar.classList.contains("colapsada"));
      }
    });
    mobileToggle?.addEventListener("click", () => {
      setMobileOpen(!document.documentElement.classList.contains("menu-movil-abierto"));
    });
    backdrop?.addEventListener("click", () => setMobileOpen(false, true));
    sidebar.querySelector(".menu")?.addEventListener("click", (event) => {
      if (event.target.closest("a") && mobileBreakpoint.matches) setMobileOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && document.documentElement.classList.contains("menu-movil-abierto")) {
        setMobileOpen(false, true);
      }
    });
    mobileBreakpoint.addEventListener("change", () => {
      setMobileOpen(false);
      if (!mobileBreakpoint.matches) {
        setCollapsed(sidebar.classList.contains("colapsada"), false);
      }
    });
  };
})();
