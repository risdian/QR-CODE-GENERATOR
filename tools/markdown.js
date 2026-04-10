(function () {
    // Load marked.js from CDN dynamically
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
    script.onload = init;
    document.head.appendChild(script);
  
    // Inject preview styles
    const style = document.createElement("style");
    style.textContent = `
      .md-preview {
        min-height: 360px;
        padding: 4px 2px;
        font-family: var(--font-sans);
        font-size: 14px;
        line-height: 1.75;
        color: var(--text);
        overflow-y: auto;
      }
      .md-preview h1, .md-preview h2, .md-preview h3 {
        font-family: 'Playfair Display', Georgia, serif;
        font-weight: 700;
        margin: 1.2em 0 0.4em;
        color: var(--text);
        line-height: 1.2;
      }
      .md-preview h1 { font-size: 22px; }
      .md-preview h2 { font-size: 18px; }
      .md-preview h3 { font-size: 15px; }
      .md-preview p  { margin: 0.6em 0; }
      .md-preview ul, .md-preview ol { padding-left: 20px; margin: 0.6em 0; }
      .md-preview li { margin: 0.2em 0; }
      .md-preview code {
        font-family: var(--font-mono);
        font-size: 12px;
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 4px;
        padding: 1px 5px;
      }
      .md-preview pre {
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        padding: 14px;
        overflow-x: auto;
        margin: 0.8em 0;
      }
      .md-preview pre code {
        background: none;
        border: none;
        padding: 0;
        font-size: 12.5px;
      }
      .md-preview blockquote {
        border-left: 3px solid var(--border-mid);
        margin: 0.8em 0;
        padding: 4px 0 4px 16px;
        color: var(--text-2);
        font-style: italic;
      }
      .md-preview a { color: var(--text); text-decoration: underline; }
      .md-preview hr { border: none; border-top: 1px solid var(--border); margin: 1em 0; }
      .md-preview table { border-collapse: collapse; width: 100%; margin: 0.8em 0; font-size: 13px; }
      .md-preview th, .md-preview td { border: 1px solid var(--border); padding: 6px 10px; text-align: left; }
      .md-preview th { background: var(--bg); font-weight: 500; }
      .md-preview img { max-width: 100%; border-radius: var(--radius-sm); }
    `;
    document.head.appendChild(style);
  
    function init() {
      const input   = document.getElementById("mdInput");
      const preview = document.getElementById("mdPreview");
      const counter = document.getElementById("mdCount");
  
      marked.setOptions({ breaks: true, gfm: true });
  
      function render() {
        const text = input.value;
        counter.textContent = `${text.length} characters`;
        preview.innerHTML = text ? marked.parse(text) : '<p style="color:var(--text-3);font-size:13px;">Preview will appear here...</p>';
      }
  
      input.addEventListener("input", render);
      render(); // initial render with placeholder
    }
  })();