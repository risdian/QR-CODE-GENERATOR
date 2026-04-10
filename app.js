/* ─── Router ─────────────────────────────────────────────── */
const container = document.getElementById("tool-container");
let currentScript = null;

async function loadTool(name) {
  // Fetch HTML fragment
  const res = await fetch(`tools/${name}.html`);
  const html = await res.text();
  container.innerHTML = html;

  // Remove previous tool script
  if (currentScript) currentScript.remove();

  // Load tool JS
  const script = document.createElement("script");
  script.src = `tools/${name}.js?v=${Date.now()}`;
  script.defer = false;
  document.body.appendChild(script);
  currentScript = script;
}

// Nav clicks
document.querySelectorAll(".toolnav-item").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".toolnav-item").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    loadTool(btn.dataset.tool);
  });
});

// Load default tool on startup
loadTool("qr");