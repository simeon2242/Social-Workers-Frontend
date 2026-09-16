(() => {
  const storageKey = "swf-theme";
  const root = document.documentElement;
  const savedTheme = localStorage.getItem(storageKey);
  if (savedTheme === "dark") root.dataset.theme = "dark";

  function addToggle() {
    const existing = document.querySelector("[data-theme-toggle]");
    if (existing) return;
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.themeToggle = "true";
    button.className = "theme-toggle";
    button.setAttribute("aria-label", "Activer le mode sombre");
    button.innerHTML = '<span aria-hidden="true">◐</span><span class="theme-toggle-label">Mode sombre</span>';
    const target = document.querySelector(".site-header, .page-header, .dashboard-header");
    (target || document.body).append(button);
    updateToggle(button);
    button.addEventListener("click", () => {
      const isDark = root.dataset.theme === "dark";
      if (isDark) delete root.dataset.theme;
      else root.dataset.theme = "dark";
      localStorage.setItem(storageKey, isDark ? "light" : "dark");
      updateToggle(button);
    });
  }

  function updateToggle(button) {
    const isDark = root.dataset.theme === "dark";
    button.setAttribute("aria-label", isDark ? "Activer le mode clair" : "Activer le mode sombre");
    button.querySelector(".theme-toggle-label").textContent = isDark ? "Mode clair" : "Mode sombre";
    button.querySelector("span").textContent = isDark ? "☀" : "◐";
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addToggle);
  else addToggle();
})();
