(function () {
    const input  = document.getElementById("tcInput");
    const output = document.getElementById("tcOutput");
    let activeCase = null;
  
    const converters = {
      upper:    t => t.toUpperCase(),
      lower:    t => t.toLowerCase(),
      title:    t => t.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()),
      sentence: t => t.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase()),
      camel:    t => t.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()),
      pascal:   t => {
        const c = t.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
        return c.charAt(0).toUpperCase() + c.slice(1);
      },
      snake:    t => t.toLowerCase().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, ""),
      kebab:    t => t.toLowerCase().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, ""),
    };
  
    function convert() {
      const text = input.value;
      updateStats(text);
      if (!activeCase || !text) { output.value = ""; return; }
      output.value = converters[activeCase](text);
    }
  
    function updateStats(text) {
      document.getElementById("statChars").textContent = text.length;
      document.getElementById("statWords").textContent = text.trim() ? text.trim().split(/\s+/).length : 0;
      document.getElementById("statLines").textContent = text ? text.split(/\n/).length : 0;
      document.getElementById("tcCount").textContent = `${text.length} characters`;
    }
  
    document.querySelectorAll(".case-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".case-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeCase = btn.dataset.case;
        convert();
      });
    });
  
    input.addEventListener("input", convert);
  
    window.tcCopy = function () {
      if (!output.value) return;
      navigator.clipboard.writeText(output.value).then(() => {
        const toast = document.getElementById("tcToast");
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 2000);
      });
    };
  
    window.tcClear = function () {
      input.value  = "";
      output.value = "";
      activeCase   = null;
      document.querySelectorAll(".case-btn").forEach(b => b.classList.remove("active"));
      updateStats("");
    };
  })();