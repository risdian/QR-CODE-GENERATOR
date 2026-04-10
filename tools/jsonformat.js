(function () {
    const style = document.createElement("style");
    style.textContent = `
      .json-status {
        font-size: 11px;
        font-weight: 500;
        padding: 3px 10px;
        border-radius: 20px;
        font-family: var(--font-mono);
      }
      .json-status.valid   { background: #eafaf1; color: #1e7e45; border: 1px solid #a8e6c2; }
      .json-status.invalid { background: #fef0ee; color: var(--danger); border: 1px solid #f5c6c2; }
      .output-area { font-family: var(--font-mono); font-size: 12.5px; }
    `;
    document.head.appendChild(style);
  
    function setStatus(valid, msg) {
      const el = document.getElementById("jsonStatus");
      el.textContent = msg;
      el.className = "json-status " + (valid ? "valid" : "invalid");
    }
  
    window.jsonFormat = function () {
      const raw = document.getElementById("jsonInput").value.trim();
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        document.getElementById("jsonOutput").value = JSON.stringify(parsed, null, 2);
        setStatus(true, "Valid JSON");
      } catch (e) {
        document.getElementById("jsonOutput").value = "";
        setStatus(false, e.message);
      }
    };
  
    window.jsonMinify = function () {
      const raw = document.getElementById("jsonInput").value.trim();
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        document.getElementById("jsonOutput").value = JSON.stringify(parsed);
        setStatus(true, "Valid JSON");
      } catch (e) {
        document.getElementById("jsonOutput").value = "";
        setStatus(false, e.message);
      }
    };
  
    window.jsonClear = function () {
      document.getElementById("jsonInput").value  = "";
      document.getElementById("jsonOutput").value = "";
      document.getElementById("jsonStatus").textContent = "";
      document.getElementById("jsonStatus").className = "json-status";
    };
  
    window.jsonCopy = function () {
      const val = document.getElementById("jsonOutput").value;
      if (!val) return;
      navigator.clipboard.writeText(val).then(() => {
        const toast = document.getElementById("jsonToast");
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 2000);
      });
    };
  
    // Live validate on input
    document.getElementById("jsonInput").addEventListener("input", () => {
      const raw = document.getElementById("jsonInput").value.trim();
      if (!raw) { document.getElementById("jsonStatus").textContent = ""; return; }
      try { JSON.parse(raw); setStatus(true, "Valid JSON"); }
      catch (e) { setStatus(false, "Invalid JSON"); }
    });
  })();