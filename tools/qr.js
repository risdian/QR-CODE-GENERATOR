/* ─── QR Tool ────────────────────────────────────────────── */
(function () {
    let currentCanvas = null;
    let currentTab = "url";
    let lastText = "";
    let logoDataUrl = null;
    const MAX_LENGTH = 300;
  
    /* Tab switching */
    document.querySelectorAll(".tab-bar .tab").forEach(btn => {
      btn.addEventListener("click", () => {
        const raw = btn.dataset.tab.toLowerCase();
        const tab = raw === "location" ? "map" : raw === "vcard" ? "vcard" : raw === "url" ? "url" : raw;
        currentTab = tab;
        document.querySelectorAll(".tab-bar .tab").forEach(t => t.classList.remove("active"));
        btn.classList.add("active");
        document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
        document.getElementById("panel-" + tab).classList.add("active");
        clearError();
      });
    });
  
    /* Logo upload */
    document.getElementById("logoFile").addEventListener("change", e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        logoDataUrl = ev.target.result;
        document.getElementById("logoImg").src = logoDataUrl;
        document.getElementById("logoZoneInner").style.display = "none";
        document.getElementById("logoPreview").style.display = "flex";
      };
      reader.readAsDataURL(file);
    });
  
    window.removeLogo = function () {
      logoDataUrl = null;
      document.getElementById("logoFile").value = "";
      document.getElementById("logoImg").src = "";
      document.getElementById("logoZoneInner").style.display = "flex";
      document.getElementById("logoPreview").style.display = "none";
      if (lastText) renderQR();
    };
  
    /* vCard builder */
    function buildVCard() {
      const name    = document.getElementById("vcName").value.trim();
      const org     = document.getElementById("vcOrg").value.trim();
      const phone   = document.getElementById("vcPhone").value.trim();
      const email   = document.getElementById("vcEmail").value.trim();
      const url     = document.getElementById("vcUrl").value.trim();
      const address = document.getElementById("vcAddress").value.trim();
      if (!name && !phone && !email) return null;
      const lines = ["BEGIN:VCARD", "VERSION:3.0"];
      if (name)    lines.push("FN:" + name);
      if (org)     lines.push("ORG:" + org);
      if (phone)   lines.push("TEL:" + phone);
      if (email)   lines.push("EMAIL:" + email);
      if (url)     lines.push("URL:" + url);
      if (address) lines.push("ADR:;;" + address);
      lines.push("END:VCARD");
      return lines.join("\n");
    }
  
    function getContent() {
      if (currentTab === "url") {
        const val = document.getElementById("urlInput").value.trim();
        if (!val) return { error: "Please enter a URL." };
        return { text: val };
      }
      if (currentTab === "map") {
        const val = document.getElementById("mapInput").value.trim();
        if (!val) return { error: "Please enter a location." };
        return { text: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(val)}` };
      }
      if (currentTab === "text") {
        const val = document.getElementById("textInput").value.trim();
        if (!val) return { error: "Please enter some text." };
        return { text: val };
      }
      if (currentTab === "vcard") {
        const vc = buildVCard();
        if (!vc) return { error: "Please fill in at least a name, phone, or email." };
        return { text: vc };
      }
      return { error: "Unknown tab." };
    }
  
    window.generateQR = function () {
      clearError();
      const result = getContent();
      if (result.error) return showError(result.error);
      if (result.text.length > MAX_LENGTH) return showError(`Content too long. Max ${MAX_LENGTH} characters.`);
      lastText = result.text;
      renderQR();
    };
  
    function renderQR() {
      if (!lastText) return;
  
      if (window.applyTheme) {
        const theme = document.getElementById("qrTheme").value;
        const presets = {
          classic:  ["#000000", "#000000", "#ffffff"],
          navy:     ["#0d2d6b", "#1a4ba0", "#eef2fa"],
          charcoal: ["#2c2c2c", "#4a4a4a", "#f5f5f3"],
          forest:   ["#1a3d2b", "#2d6a4f", "#f0f7f4"],
          rose:     ["#7b2d3e", "#c0516a", "#fff5f7"],
        };
        if (presets[theme]) setColors(...presets[theme]);
        window.applyTheme = false;
      }
  
      const finderColor = document.getElementById("finderColor").value;
      const darkColor   = document.getElementById("moduleColor").value;
      const lightColor  = document.getElementById("bgColor").value;
      const style       = document.getElementById("qrStyle").value;
      const exportSize  = parseInt(document.getElementById("qrSize").value, 10);
  
      const qr          = QRCode.create(lastText, { errorCorrectionLevel: "H" });
      const moduleCount = qr.modules.size;
      const modulesData = qr.modules.data;
  
      const quietZone  = Math.round(exportSize * 0.06);
      const scale      = (exportSize - quietZone * 2) / moduleCount;
      const canvasSize = exportSize;
  
      const canvas = document.createElement("canvas");
      canvas.width  = canvasSize;
      canvas.height = canvasSize;
      const ctx = canvas.getContext("2d");
  
      ctx.fillStyle = lightColor;
      ctx.fillRect(0, 0, canvasSize, canvasSize);
  
      function isInFinderZone(col, row) {
        return (col < 7 && row < 7) ||
               (col >= moduleCount - 7 && row < 7) ||
               (col < 7 && row >= moduleCount - 7);
      }
  
      for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
          if (isInFinderZone(col, row)) continue;
          if (!modulesData[row * moduleCount + col]) continue;
          ctx.fillStyle = darkColor;
          const px = col * scale + quietZone;
          const py = row * scale + quietZone;
          if (style === "square") {
            ctx.fillRect(px, py, scale, scale);
          } else if (style === "dots") {
            ctx.beginPath();
            ctx.arc(px + scale / 2, py + scale / 2, scale / 2.2, 0, Math.PI * 2);
            ctx.fill();
          } else if (style === "rounded") {
            const r = scale * 0.28;
            ctx.beginPath();
            ctx.moveTo(px + r, py);
            ctx.lineTo(px + scale - r, py);
            ctx.quadraticCurveTo(px + scale, py, px + scale, py + r);
            ctx.lineTo(px + scale, py + scale - r);
            ctx.quadraticCurveTo(px + scale, py + scale, px + scale - r, py + scale);
            ctx.lineTo(px + r, py + scale);
            ctx.quadraticCurveTo(px, py + scale, px, py + scale - r);
            ctx.lineTo(px, py + r);
            ctx.quadraticCurveTo(px, py, px + r, py);
            ctx.fill();
          }
        }
      }
  
      function drawFinder(col, row) {
        const ox = col * scale + quietZone;
        const oy = row * scale + quietZone;
        ctx.fillStyle = finderColor;
        ctx.fillRect(ox, oy, 7 * scale, 7 * scale);
        ctx.fillStyle = lightColor;
        ctx.fillRect(ox + scale, oy + scale, 5 * scale, 5 * scale);
        ctx.fillStyle = finderColor;
        ctx.fillRect(ox + 2 * scale, oy + 2 * scale, 3 * scale, 3 * scale);
      }
  
      drawFinder(0, 0);
      drawFinder(moduleCount - 7, 0);
      drawFinder(0, moduleCount - 7);
  
      function finishAndShow() {
        const container = document.getElementById("qrcode");
        container.innerHTML = "";
        canvas.style.width  = "260px";
        canvas.style.height = "260px";
        container.appendChild(canvas);
        document.getElementById("previewPlaceholder").style.display = "none";
        document.getElementById("qrcode").style.display = "block";
        document.getElementById("actionRow").style.display = "grid";
        currentCanvas = canvas;
      }
  
      if (logoDataUrl) {
        const img = new Image();
        img.onload = () => {
          const logoSize = canvasSize * 0.22;
          const logoX    = (canvasSize - logoSize) / 2;
          const logoY    = (canvasSize - logoSize) / 2;
          const pad      = logoSize * 0.12;
          ctx.fillStyle  = lightColor;
          roundRect(ctx, logoX - pad, logoY - pad, logoSize + pad * 2, logoSize + pad * 2, pad * 0.8);
          ctx.fill();
          ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
          finishAndShow();
        };
        img.src = logoDataUrl;
      } else {
        finishAndShow();
      }
    }
  
    function roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }
  
    function syncColor(colorId, hexId) {
      const colorEl = document.getElementById(colorId);
      const hexEl   = document.getElementById(hexId);
      colorEl.addEventListener("input", () => { hexEl.value = colorEl.value; renderQR(); });
      hexEl.addEventListener("input", () => {
        let v = hexEl.value;
        if (!v.startsWith("#")) v = "#" + v;
        if (/^#[0-9A-Fa-f]{6}$/.test(v)) { colorEl.value = v; hexEl.value = v; renderQR(); }
      });
    }
  
    syncColor("finderColor", "finderHex");
    syncColor("moduleColor", "moduleHex");
    syncColor("bgColor",     "bgHex");
  
    function setColors(finder, mod, bg) {
      document.getElementById("finderColor").value = finder;
      document.getElementById("finderHex").value   = finder;
      document.getElementById("moduleColor").value = mod;
      document.getElementById("moduleHex").value   = mod;
      document.getElementById("bgColor").value     = bg;
      document.getElementById("bgHex").value       = bg;
    }
  
    document.getElementById("qrStyle").addEventListener("change", renderQR);
    document.getElementById("qrSize").addEventListener("change", renderQR);
    document.getElementById("qrTheme").addEventListener("change", () => { window.applyTheme = true; renderQR(); });
  
    ["urlInput", "mapInput"].forEach(id => {
      document.getElementById(id).addEventListener("keydown", e => { if (e.key === "Enter") generateQR(); });
    });
  
    function attachCharCounter(inputId, counterId) {
      const input   = document.getElementById(inputId);
      const counter = document.getElementById(counterId);
      if (!input || !counter) return;
      input.addEventListener("input", () => {
        const len = input.value.length;
        counter.textContent = `${len} / ${MAX_LENGTH}`;
        counter.classList.toggle("limit", len > MAX_LENGTH);
      });
    }
  
    attachCharCounter("urlInput",  "urlCount");
    attachCharCounter("mapInput",  "mapCount");
    attachCharCounter("textInput", "textCount");
  
    window.downloadQR = function () {
      if (!currentCanvas) return;
      const size = document.getElementById("qrSize").value;
      const link = document.createElement("a");
      link.download = `qrcode-${size}px.png`;
      link.href = currentCanvas.toDataURL("image/png");
      link.click();
    };
  
    window.copyQR = function () {
      if (!currentCanvas) return;
      currentCanvas.toBlob(blob => {
        try {
          navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
            .then(showToast).catch(downloadQR);
        } catch { downloadQR(); }
      }, "image/png");
    };
  
    function showToast() {
      const toast = document.getElementById("copyToast");
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 2200);
    }
  
    function showError(msg) {
      const el = document.getElementById("errorMsg");
      el.textContent = msg;
      el.style.display = "block";
    }
  
    function clearError() {
      const el = document.getElementById("errorMsg");
      el.textContent = "";
      el.style.display = "none";
    }
  })();