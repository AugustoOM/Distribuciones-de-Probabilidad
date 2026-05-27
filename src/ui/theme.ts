export function initTheme(button: HTMLButtonElement): void {
  const stored = localStorage.getItem("probabilitylab-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = stored ? stored === "dark" : prefersDark;
  document.documentElement.classList.toggle("dark", dark);
  updateLabel(button);

  button.addEventListener("click", () => {
    const nextDark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", nextDark);
    localStorage.setItem("probabilitylab-theme", nextDark ? "dark" : "light");
    updateLabel(button);
  });
}

function updateLabel(button: HTMLButtonElement): void {
  const dark = document.documentElement.classList.contains("dark");
  button.querySelector("span:last-child")!.textContent = dark ? "Tema claro" : "Tema oscuro";
}
