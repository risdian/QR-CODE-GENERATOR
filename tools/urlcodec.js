(function () {
    const style = document.createElement("style");
    style.textContent = `
      .url-badge {
        font-size: 11px;
        font-weight: 500;
        padding: 3px 10px;
        border-radius: 20px;
        font-family: var(--font-mono);
      }
      .url-badge.encoded { background: #eef2fa; color: #1a4ba0; border: 1px solid #b5d0f0; }
      .url-badge.decoded { background: #eafaf1; color: #1e7e45; border: 1px solid #a8e6c2; }
      .output-area { font-family: var(--font-mono); font-size: 12.5px; word-break: break-all; }
    `;
    document.head.appendChild(style);
  
    function setBadge(type) {
      const el = document.getElementById("urlBadge");
      el.textContent = type === "encoded" ? "Encoded" : "Decoded";
      el.className = "url-badge " + type;
    }
  
    window.urlEncode = function () {
      const val = document.getElementById("urlInput2").value;
      if (!val) return;
      document.getElementById("urlOutput2").value = encodeURIComponent(val);
      setBadge("encoded");
    };
  
    window.urlDecode = function () {
      const val = document.getElementById("urlInput2").value;
      if (!val) return;
      try {
        document.getElementById("urlOutput2").value = decodeURIComponent(val);
        setBadge("decoded");
      } catch {
        document.getElementById("urlOutput2").value = "Invalid encoded string.";
        document.getElementById("urlBadge").textContent = "";
      }
    };
  
    window.urlClear = function () {
      document.getElementById("urlInput2").value  = "";
      document.getElementById("urlOutput2").value = "";
      document.getElementById("urlBadge").textContent = "";
      document.getElementById("urlBadge").className = "url-badge";
    };
  
    window.urlCopy = function () {
      const val = document.getElementById("urlOutput2").value;
      if (!val) return;
      navigator.clipboard.writeText(val).then(() => {
        const toast = document.getElementById("urlToast");
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 2000);
      });
    };
  
    window.urlSwap = function () {
      const out = document.getElementById("urlOutput2").value;
      if (!out) return;
      document.getElementById("urlInput2").value  = out;
      document.getElementById("urlOutput2").value = "";
      document.getElementById("urlBadge").textContent = "";
    };
  })();