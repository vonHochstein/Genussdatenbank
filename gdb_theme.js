// GDB Theme Toggle (light/dark)
// - uses body.dark
// - persists to localStorage key: "theme" ("light" | "dark")

function syncThemeToIframes(theme){
  document.querySelectorAll("iframe").forEach((ifr) => {
    try{
      const doc = ifr.contentDocument || ifr.contentWindow?.document;
      if(!doc) return;

      doc.documentElement.classList.toggle("dark", theme === "dark");
      if(doc.body){
        doc.body.classList.toggle("dark", theme === "dark");
      }
    }catch(e){
      // iframe nicht zugreifbar -> ignorieren
    }
  });
}

function applyTheme(theme) {
  // Parent
  document.body.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);

  // Icon
  const icon = document.getElementById("themeIcon");
  if (icon) {
    icon.src = theme === "dark"
      ? "icons/theme-light.png"
      : "icons/theme-dark.png";
  }

  // iFrames (Whisky-Karten!)
  syncThemeToIframes(theme);
}

function initTheme() {
  const saved = localStorage.getItem("theme"); // "dark" | "light" | null
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved ?? (prefersDark ? "dark" : "light"));
}

document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "themeToggle") {
    const isDark = document.body.classList.contains("dark");
    applyTheme(isDark ? "light" : "dark");
  }
});

// WICHTIG: falls der Whisky-iFrame erst NACHHER geladen wird
document.addEventListener("load", (e) => {
  if (e.target && e.target.tagName === "IFRAME") {
    const theme = document.body.classList.contains("dark") ? "dark" : "light";
    syncThemeToIframes(theme);
  }
}, true);
