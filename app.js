import { EditorView, basicSetup } from 'https://esm.sh/codemirror';
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

// ===== Default diagram =====
const defaultCode = `graph TD
    A[开始] --> B{判断条件}
    B -->|是| C[执行操作 A]
    B -->|否| D[执行操作 B]
    C --> E[结束]
    D --> E`;

// ===== State =====
let editor;
let renderTimer;
let renderCounter = 0;

// ===== Preview Zoom & Pan State =====
let previewScale = 1;
let previewPanX = 0;
let previewPanY = 0;
let isPanning = false;
let panStartX, panStartY;
let panStartPanX, panStartPanY;

// ===== PNG Size Settings =====
function getPngSizeMode() {
  return localStorage.getItem('pngSizeMode') || 'auto';
}

function getPngSizeValue() {
  return parseInt(localStorage.getItem('pngSizeValue'), 10) || 1080;
}

function setPngSizeMode(mode) {
  localStorage.setItem('pngSizeMode', mode);
}

function setPngSizeValue(value) {
  localStorage.setItem('pngSizeValue', String(value));
}

// ===== Dark theme for CodeMirror =====
const darkTheme = EditorView.theme({
  "&": { backgroundColor: "#1e1e1e", color: "#d4d4d4" },
  ".cm-content": { caretColor: "#d4d4d4" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#d4d4d4" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
    backgroundColor: "#264f78",
  },
  ".cm-activeLine": { backgroundColor: "#2a2d2e" },
  ".cm-gutters": { backgroundColor: "#1e1e1e", color: "#858585", border: "none" },
  ".cm-activeLineGutter": { backgroundColor: "#2a2d2e" },
  ".cm-selectionMatch": { backgroundColor: "#3a3d41" },
  ".cm-matchingBracket": { backgroundColor: "#3a3d41", outline: "1px solid #888" },
  ".cm-foldPlaceholder": { backgroundColor: "transparent", border: "none", color: "#858585" },
  ".cm-tooltip": { border: "1px solid #3a3a3a", backgroundColor: "#252525", color: "#d4d4d4" },
}, { dark: true });

// ===== Theme =====
function getTheme() {
  return localStorage.getItem('theme') || 'light';
}

function getMermaidTheme() {
  return localStorage.getItem('mermaidTheme') || 'default';
}

function setMermaidTheme(theme) {
  localStorage.setItem('mermaidTheme', theme);
  document.getElementById('select-mermaid-theme').value = theme;
  initMermaid();
  renderMermaid(editor.state.doc.toString());
}

// ===== Mermaid Look =====
function getMermaidLook() {
  return localStorage.getItem('mermaidLook') || 'classic';
}

function setMermaidLook(look) {
  localStorage.setItem('mermaidLook', look);
  document.getElementById('select-mermaid-look').value = look;
  initMermaid();
  renderMermaid(editor.state.doc.toString());
}

function setTheme(theme) {
  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('icon-sun').style.display = theme === 'dark' ? 'none' : '';
  document.getElementById('icon-moon').style.display = theme === 'dark' ? '' : 'none';
  recreateEditor(theme);
  renderMermaid(editor.state.doc.toString());
}

function initMermaid() {
  const look = getMermaidLook();
  const config = {
    startOnLoad: false,
    theme: getMermaidTheme(),
    look,
    securityLevel: 'loose',
  };
  if (look === 'handDrawn') {
    config.themeVariables = { fontFamily: 'Comic Sans MS, cursive' };
  } else {
    config.flowchart = { htmlLabels: false };
  }
  mermaid.initialize(config);
}

// ===== Toast =====
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// ===== Mermaid Rendering =====
async function renderMermaid(code) {
  const preview = document.getElementById('preview');
  const trimmed = code.trim();

  if (!trimmed) {
    preview.innerHTML = '<div style="color:var(--text-secondary)">输入 Mermaid 代码开始预览</div>';
    return;
  }

  try {
    renderCounter++;
    const id = `mermaid-svg-${renderCounter}`;
    const { svg } = await mermaid.render(id, trimmed);
    preview.innerHTML = svg;
    // Reset zoom/pan on re-render
    previewScale = 1;
    previewPanX = 0;
    previewPanY = 0;
    applyPreviewTransform();
  } catch (err) {
    // Mermaid render may create dangling elements on error
    const errEl = document.getElementById(`dmermaid-svg-${renderCounter}`);
    if (errEl) errEl.remove();

    preview.innerHTML = `<div class="error-message">${escapeHtml(err.message || String(err))}</div>`;
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function debouncedRender(code) {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(() => renderMermaid(code), 300);
}

// ===== Editor Setup =====
function buildExtensions(theme) {
  const exts = [
    basicSetup,
    EditorView.lineWrapping,
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        debouncedRender(update.state.doc.toString());
      }
    }),
  ];

  if (theme === 'dark') {
    exts.push(darkTheme);
  }

  return exts;
}

function createEditor(theme) {
  return new EditorView({
    doc: defaultCode,
    extensions: buildExtensions(theme),
    parent: document.getElementById('editor'),
  });
}

function recreateEditor(theme) {
  const currentDoc = editor ? editor.state.doc.toString() : defaultCode;
  if (editor) editor.destroy();

  editor = new EditorView({
    doc: currentDoc,
    extensions: buildExtensions(theme),
    parent: document.getElementById('editor'),
  });
}

// ===== Preview Zoom & Pan =====
function applyPreviewTransform() {
  const svg = document.querySelector('#preview svg');
  if (!svg) return;
  svg.style.transform = `translate(${previewPanX}px, ${previewPanY}px) scale(${previewScale})`;
  svg.style.transformOrigin = '0 0';
}

function initPreviewZoomPan() {
  const preview = document.getElementById('preview');

  // Wheel zoom (centered on mouse position)
  preview.addEventListener('wheel', (e) => {
    e.preventDefault();
    const svg = document.querySelector('#preview svg');
    if (!svg) return;

    const rect = preview.getBoundingClientRect();
    // Mouse position relative to preview container
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Mouse position in content coordinates (before zoom)
    const contentX = (mouseX - previewPanX) / previewScale;
    const contentY = (mouseY - previewPanY) / previewScale;

    const factor = 1.1;
    if (e.deltaY < 0) {
      previewScale = Math.min(previewScale * factor, 10);
    } else {
      previewScale = Math.max(previewScale / factor, 0.1);
    }

    // Adjust pan so that the mouse position stays at the same content point
    previewPanX = mouseX - contentX * previewScale;
    previewPanY = mouseY - contentY * previewScale;

    applyPreviewTransform();
  }, { passive: false });

  // Mouse drag
  preview.addEventListener('mousedown', (e) => {
    // Only left button
    if (e.button !== 0) return;
    // Don't pan if clicking on error message
    if (e.target.closest('.error-message')) return;
    e.preventDefault();
    isPanning = true;
    panStartX = e.clientX;
    panStartY = e.clientY;
    panStartPanX = previewPanX;
    panStartPanY = previewPanY;
    preview.classList.add('panning');
  });

  document.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    previewPanX = panStartPanX + (e.clientX - panStartX);
    previewPanY = panStartPanY + (e.clientY - panStartY);
    applyPreviewTransform();
  });

  document.addEventListener('mouseup', () => {
    if (!isPanning) return;
    isPanning = false;
    preview.classList.remove('panning');
  });

  // Double-click reset
  preview.addEventListener('dblclick', () => {
    previewScale = 1;
    previewPanX = 0;
    previewPanY = 0;
    applyPreviewTransform();
  });

  // Touch support: single-finger drag
  preview.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    if (e.target.closest('.error-message')) return;
    isPanning = true;
    panStartX = e.touches[0].clientX;
    panStartY = e.touches[0].clientY;
    panStartPanX = previewPanX;
    panStartPanY = previewPanY;
    preview.classList.add('panning');
  }, { passive: true });

  preview.addEventListener('touchmove', (e) => {
    if (!isPanning || e.touches.length !== 1) return;
    e.preventDefault();
    previewPanX = panStartPanX + (e.touches[0].clientX - panStartX);
    previewPanY = panStartPanY + (e.touches[0].clientY - panStartY);
    applyPreviewTransform();
  }, { passive: false });

  preview.addEventListener('touchend', () => {
    isPanning = false;
    preview.classList.remove('panning');
  });

  // Touch support: pinch zoom
  let pinchStartDist = 0;
  let pinchStartScale = 1;

  preview.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      isPanning = false;
      preview.classList.remove('panning');
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStartDist = Math.hypot(dx, dy);
      pinchStartScale = previewScale;
    }
  }, { passive: true });

  preview.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / pinchStartDist;
      previewScale = Math.min(Math.max(pinchStartScale * ratio, 0.1), 10);
      applyPreviewTransform();
    }
  }, { passive: false });
}

// ===== Export Helpers =====
function getSvgString() {
  const svgEl = document.querySelector('#preview svg');
  if (!svgEl) {
    showToast('没有可导出的图表');
    return null;
  }
  // Clone SVG to export without preview transform
  const clone = svgEl.cloneNode(true);
  clone.style.transform = '';
  clone.style.transformOrigin = '';
  const serializer = new XMLSerializer();
  return serializer.serializeToString(clone);
}

function svgToCanvas(svgString, options = {}) {
  // Backward compatibility: if options is a number, treat as scale
  if (typeof options === 'number') {
    options = { mode: 'auto', scale: options };
  }
  const { mode = 'auto', scale = 3, targetWidth, targetHeight } = options;

  return new Promise((resolve, reject) => {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
    const svgEl = svgDoc.documentElement;

    // Always prefer viewBox for actual content dimensions
    let width, height;
    const viewBox = svgEl.getAttribute('viewBox');
    if (viewBox) {
      const vb = viewBox.split(/[\s,]+/).map(Number);
      width = vb[2];
      height = vb[3];
    }
    if (!width || !height) {
      width = parseFloat(svgEl.getAttribute('width')) || 800;
      height = parseFloat(svgEl.getAttribute('height')) || 600;
    }

    // Force SVG size to match viewBox content, remove container styles
    svgEl.setAttribute('width', width);
    svgEl.setAttribute('height', height);
    svgEl.removeAttribute('style');

    const serializer = new XMLSerializer();
    const fixedSvg = serializer.serializeToString(svgEl);

    // Use base64 data URL (more reliable than blob URL for canvas)
    const base64 = btoa(unescape(encodeURIComponent(fixedSvg)));
    const dataUrl = `data:image/svg+xml;base64,${base64}`;

    const img = new Image();

    img.onload = () => {
      let canvasWidth, canvasHeight;
      const aspectRatio = width / height;

      if (mode === 'fixed-width' && targetWidth) {
        canvasWidth = targetWidth;
        canvasHeight = Math.round(targetWidth / aspectRatio);
      } else if (mode === 'fixed-height' && targetHeight) {
        canvasHeight = targetHeight;
        canvasWidth = Math.round(targetHeight * aspectRatio);
      } else {
        // auto mode
        canvasWidth = width * scale;
        canvasHeight = height * scale;
      }

      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = getTheme() === 'dark' ? '#1e1e1e' : '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas);
    };

    img.onerror = () => {
      reject(new Error('SVG 转换图片失败'));
    };

    img.src = dataUrl;
  });
}

function buildPngOptions() {
  const mode = getPngSizeMode();
  const value = getPngSizeValue();
  if (mode === 'fixed-width') {
    return { mode, targetWidth: value };
  } else if (mode === 'fixed-height') {
    return { mode, targetHeight: value };
  }
  return { mode: 'auto', scale: 3 };
}

// ===== Export Actions =====
async function copySvg() {
  const svg = getSvgString();
  if (!svg) return;
  try {
    await navigator.clipboard.writeText(svg);
    showToast('SVG 代码已复制');
  } catch {
    showToast('复制失败，请检查浏览器权限');
  }
}

function downloadSvg() {
  const svg = getSvgString();
  if (!svg) return;
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  downloadBlob(blob, 'mermaid-diagram.svg');
  showToast('SVG 文件已下载');
}

async function copyPng() {
  const svg = getSvgString();
  if (!svg) return;
  try {
    const canvas = await svgToCanvas(svg, buildPngOptions());
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ]);
    showToast('图片已复制到剪贴板');
  } catch {
    showToast('复制失败，请检查浏览器权限');
  }
}

async function downloadPng() {
  const svg = getSvgString();
  if (!svg) return;
  try {
    const canvas = await svgToCanvas(svg, buildPngOptions());
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    downloadBlob(blob, 'mermaid-diagram.png');
    showToast('PNG 文件已下载');
  } catch {
    showToast('PNG 导出失败');
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ===== Divider Drag =====
function initDivider() {
  const divider = document.getElementById('divider');
  const editorPane = document.getElementById('editor-pane');
  const previewPane = document.getElementById('preview-pane');
  const splitPane = document.querySelector('.split-pane');
  let isDragging = false;

  const isMobile = () => window.innerWidth <= 768;

  divider.addEventListener('mousedown', startDrag);
  divider.addEventListener('touchstart', startDrag, { passive: false });

  function startDrag(e) {
    e.preventDefault();
    isDragging = true;
    divider.classList.add('active');
    document.body.style.cursor = isMobile() ? 'row-resize' : 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);
  }

  function onDrag(e) {
    if (!isDragging) return;
    e.preventDefault();

    const rect = splitPane.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    if (isMobile()) {
      const offset = clientY - rect.top;
      const total = rect.height;
      const pct = Math.min(Math.max((offset / total) * 100, 15), 85);
      editorPane.style.flex = `0 0 ${pct}%`;
      previewPane.style.flex = `0 0 ${100 - pct}%`;
    } else {
      const offset = clientX - rect.left;
      const total = rect.width;
      const pct = Math.min(Math.max((offset / total) * 100, 15), 85);
      editorPane.style.flex = `0 0 ${pct}%`;
      previewPane.style.flex = `0 0 ${100 - pct}%`;
    }
  }

  function stopDrag() {
    isDragging = false;
    divider.classList.remove('active');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchend', stopDrag);
  }
}

// ===== Init =====
function init() {
  const theme = getTheme();
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('icon-sun').style.display = theme === 'dark' ? 'none' : '';
  document.getElementById('icon-moon').style.display = theme === 'dark' ? '' : 'none';

  // Restore mermaid theme selection
  const mermaidTheme = getMermaidTheme();
  document.getElementById('select-mermaid-theme').value = mermaidTheme;

  // Restore mermaid look selection
  document.getElementById('select-mermaid-look').value = getMermaidLook();

  initMermaid();
  editor = createEditor(theme);
  initDivider();
  initPreviewZoomPan();

  // Initial render
  renderMermaid(defaultCode);

  // Bind toolbar buttons
  document.getElementById('btn-copy-svg').addEventListener('click', copySvg);
  document.getElementById('btn-download-svg').addEventListener('click', downloadSvg);
  document.getElementById('btn-copy-png').addEventListener('click', copyPng);
  document.getElementById('btn-download-png').addEventListener('click', downloadPng);
  document.getElementById('btn-theme').addEventListener('click', () => {
    const next = getTheme() === 'light' ? 'dark' : 'light';
    setTheme(next);
  });

  // Bind mermaid theme selector
  document.getElementById('select-mermaid-theme').addEventListener('change', (e) => {
    setMermaidTheme(e.target.value);
  });

  // Bind mermaid look selector
  document.getElementById('select-mermaid-look').addEventListener('change', (e) => {
    setMermaidLook(e.target.value);
  });

  // ===== PNG Size Inline Controls =====
  const toggleBtns = document.querySelectorAll('.png-size-toggle .toggle-btn');
  const sizeValueInput = document.getElementById('png-size-value');

  // Restore saved settings
  const savedMode = getPngSizeMode();
  const savedValue = getPngSizeValue();
  sizeValueInput.value = savedValue;

  toggleBtns.forEach((btn) => {
    if (btn.dataset.mode === savedMode) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  sizeValueInput.hidden = (savedMode === 'auto');

  // Toggle button clicks
  toggleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      toggleBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.dataset.mode;
      setPngSizeMode(mode);
      sizeValueInput.hidden = (mode === 'auto');
    });
  });

  // Number input change
  sizeValueInput.addEventListener('change', () => {
    const val = parseInt(sizeValueInput.value, 10);
    if (val >= 100 && val <= 10000) {
      setPngSizeValue(val);
    }
  });
}

init();
