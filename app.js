import { EditorView, basicSetup } from 'https://esm.sh/codemirror';
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

// ===== Default diagram =====
const defaultCode = `graph TD
    A[开始] --> B{判断条件}
    B -->|是| C[执行操作 A]
    B -->|否| D[执行操作 B]
    C --> E[结束]
    D --> E`;

// ===== Sample Diagrams =====
const sampleDiagrams = [
  {
    id: 'flowchart',
    label: '流程图 (Flowchart)',
    code: `flowchart TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[fa:fa-car Car]`,
  },
  {
    id: 'class',
    label: '类图 (Class)',
    code: `classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal <|-- Zebra
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Animal: +mate()
    class Duck{
      +String beakColor
      +swim()
      +quack()
    }
    class Fish{
      -int sizeInFeet
      -canEat()
    }
    class Zebra{
      +bool is_wild
      +run()
    }`,
  },
  {
    id: 'sequence',
    label: '时序图 (Sequence)',
    code: `sequenceDiagram
    Alice->>+John: Hello John, how are you?
    Alice->>+John: John, can you hear me?
    John-->>-Alice: Hi Alice, I can hear you!
    John-->>-Alice: I feel great!`,
  },
  {
    id: 'er',
    label: '实体关系 (Entity Relationship)',
    code: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : includes
    CUSTOMER {
        string id
        string name
        string email
    }
    ORDER {
        string id
        date orderDate
        string status
    }
    PRODUCT {
        string id
        string name
        float price
    }
    ORDER_ITEM {
        int quantity
        float price
    }`,
  },
  {
    id: 'state',
    label: '状态图 (State)',
    code: `stateDiagram-v2
    [*] --> Still
    Still --> [*]
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]`,
  },
  {
    id: 'mindmap',
    label: '思维导图 (Mindmap)',
    code: `mindmap
  root((mindmap))
    Origins
      Long history
      ::icon(fa fa-book)
      Popularisation
        British popular psychology author Tony Buzan
    Research
      On effectiveness<br/>and features
      On Automatic creation
        Uses
            Creative techniques
            Strategic planning
            Argument mapping
    Tools
      Pen and paper
      Mermaid`,
  },
  {
    id: 'architecture',
    label: '架构图 (Architecture)',
    code: `architecture-beta
    group api(cloud)[API]

    service db(database)[Database] in api
    service disk1(disk)[Storage] in api
    service disk2(disk)[Storage] in api
    service server(server)[Server] in api

    db:L -- R:server
    disk1:T -- B:server
    disk2:T -- B:db`,
  },
  {
    id: 'block',
    label: '框图 (Block)',
    code: `block-beta
columns 1
  db(("DB"))
  blockArrowId6<["&nbsp;&nbsp;&nbsp;"]>(down)
  block:ID
    A
    B["A wide one in the middle"]
    C
  end
  space
  D
  ID --> D
  C --> D
  style B fill:#969,stroke:#333,stroke-width:4px`,
  },
  {
    id: 'c4',
    label: 'C4 图 (C4)',
    code: `C4Context
    title System Context diagram for Internet Banking System
    Enterprise_Boundary(b0, "BankBoundary0") {
        Person(customerA, "Banking Customer A", "A customer of the bank, with personal bank accounts.")
        Person(customerB, "Banking Customer B")
        Person_Ext(customerC, "Banking Customer C", "desc")

        Person(customerD, "Banking Customer D", "A customer of the bank, <br/> with personal bank accounts.")

        System(SystemAA, "Internet Banking System", "Allows customers to view information about their bank accounts, and make payments.")

        Enterprise_Boundary(b1, "BankBoundary") {
            SystemDb_Ext(SystemE, "Mainframe Banking System", "Stores all of the core banking information about customers, accounts, transactions, etc.")

            System_Boundary(b2, "BankBoundary2") {
                System(SystemA, "Banking System A")
                System(SystemB, "Banking System B", "A system of the bank, with personal bank accounts. next line.")
            }

            System_Ext(SystemC, "E-mail system", "The internal Microsoft Exchange e-mail system.")
            SystemDb(SystemD, "Banking System D Database", "A system of the bank, with personal bank accounts.")

            Boundary(b3, "BankBoundary3", "boundary") {
                SystemQueue(SystemF, "Banking System F Queue", "A system of the bank.")
                SystemQueue_Ext(SystemG, "Banking System G Queue", "A system of the bank, with personal bank accounts.")
            }
        }
    }

    BiRel(customerA, SystemAA, "Uses")
    BiRel(SystemAA, SystemE, "Uses")
    Rel(SystemAA, SystemC, "Sends e-mails", "SMTP")
    Rel(SystemC, customerA, "Sends e-mails to")`,
  },
  {
    id: 'gantt',
    label: '甘特图 (Gantt)',
    code: `gantt
    title A Gantt Diagram
    dateFormat  YYYY-MM-DD
    section Section
    A task           :a1, 2014-01-01, 30d
    Another task     :after a1  , 20d
    section Another
    Task in sec      :2014-01-12  , 12d
    another task      : 24d`,
  },
  {
    id: 'git',
    label: 'Git 图 (Git)',
    code: `gitGraph
    commit
    branch develop
    checkout develop
    commit
    commit
    checkout main
    merge develop
    commit
    branch feature
    checkout feature
    commit
    commit
    checkout main
    merge feature`,
  },
  {
    id: 'kanban',
    label: '看板 (Kanban)',
    code: `---
config:
  kanban:
    ticketBaseUrl: 'https://github.com/mermaid-js/mermaid/issues/#TICKET#'
---
kanban
  Todo
    [Create Documentation]
    docs[Create Blog about the new diagram]
  [In progress]
    id6[Create renderer so that it works in all cases. We also add some extra text here for testing purposes. And some more just for the extra flare.]
  id9[Ready for deploy]
    id8[Design grammar]@{ assigned: 'knsv' }
  id10[Ready for test]
    id4[Create parsing tests]@{ ticket: 2038, assigned: 'K.Sveidqvist', priority: 'High' }
    id66[last item]@{ priority: 'Very Low', assigned: 'knsv' }
  id11[Done]
    id5[define getData]
    id2[Title of diagram is more than 100 chars when user duplicates diagram with 100 char]@{ ticket: 2036, priority: 'Very High'}
    id3[Update DB function]@{ ticket: 2037, assigned: knsv, priority: 'High' }

  id12[Can't reproduce]
    id3[Weird flickering in Firefox]`,
  },
  {
    id: 'packet',
    label: '数据包 (Packet)',
    code: `---
title: "TCP Packet"
---
packet
0-15: "Source Port"
16-31: "Destination Port"
32-63: "Sequence Number"
64-95: "Acknowledgment Number"
96-99: "Data Offset"
100-105: "Reserved"
106: "URG"
107: "ACK"
108: "PSH"
109: "RST"
110: "SYN"
111: "FIN"
112-127: "Window"
128-143: "Checksum"
144-159: "Urgent Pointer"
160-191: "(Options and Padding)"
192-255: "Data (variable length)"`,
  },
  {
    id: 'pie',
    label: '饼图 (Pie)',
    code: `pie title Pets adopted by volunteers
    "Dogs" : 386
    "Cats" : 85
    "Rats" : 15`,
  },
  {
    id: 'quadrant',
    label: '四象限 (Quadrant)',
    code: `quadrantChart
    title Reach and engagement of campaigns
    x-axis Low Reach --> High Reach
    y-axis Low Engagement --> High Engagement
    quadrant-1 We should expand
    quadrant-2 Need to promote
    quadrant-3 Re-evaluate
    quadrant-4 May be improved
    Campaign A: [0.3, 0.6]
    Campaign B: [0.45, 0.23]
    Campaign C: [0.57, 0.69]
    Campaign D: [0.78, 0.34]
    Campaign E: [0.40, 0.34]
    Campaign F: [0.35, 0.78]`,
  },
  {
    id: 'radar',
    label: '雷达图 (Radar)',
    code: `---
title: "Grades"
---
radar-beta
  axis m["Math"], s["Science"], e["English"]
  axis h["History"], g["Geography"], a["Art"]
  curve a["Alice"]{85, 90, 80, 70, 75, 90}
  curve b["Bob"]{70, 75, 85, 80, 90, 85}

  max 100
  min 0`,
  },
  {
    id: 'requirement',
    label: '需求图 (Requirement)',
    code: `requirementDiagram

    requirement test_req {
    id: 1
    text: the test text.
    risk: high
    verifymethod: test
    }

    element test_entity {
    type: simulation
    }

    test_entity - satisfies -> test_req`,
  },
  {
    id: 'sankey',
    label: '桑基图 (Sankey)',
    code: `---
config:
  sankey:
    showValues: false
---
sankey-beta

Agricultural 'waste',Bio-conversion,124.729
Bio-conversion,Liquid,0.597
Bio-conversion,Losses,26.862
Bio-conversion,Solid,280.322
Bio-conversion,Gas,81.144
Biofuel imports,Liquid,35
Biomass imports,Solid,35
Coal imports,Coal,11.606
Coal reserves,Coal,63.965
Coal,Solid,75.571
District heating,Industry,10.639
District heating,Heating and cooling - commercial,22.505
District heating,Heating and cooling - homes,46.184
Electricity grid,Over generation / exports,104.453
Electricity grid,Heating and cooling - homes,113.726
Electricity grid,H2 conversion,27.14
Electricity grid,Industry,342.165
Electricity grid,Road transport,37.797
Electricity grid,Agriculture,4.412
Electricity grid,Heating and cooling - commercial,40.858
Electricity grid,Losses,56.691
Electricity grid,Rail transport,7.863
Electricity grid,Lighting & appliances - commercial,90.008
Electricity grid,Lighting & appliances - homes,93.494
Gas imports,NGas,40.719
Gas reserves,NGas,82.233
Gas,Heating and cooling - commercial,0.129
Gas,Losses,1.401
Gas,Thermal generation,151.891
Gas,Agriculture,2.096
Gas,Industry,48.58
Geothermal,Electricity grid,7.013
H2 conversion,H2,20.897
H2 conversion,Losses,6.242
H2,Road transport,20.897
Hydro,Electricity grid,6.995
Liquid,Industry,121.066
Liquid,International shipping,128.69
Liquid,Road transport,135.835
Liquid,Domestic aviation,14.458
Liquid,International aviation,206.267
Liquid,Agriculture,3.64
Liquid,National navigation,33.218
Liquid,Rail transport,4.413
Marine algae,Bio-conversion,4.375
NGas,Gas,122.952
Nuclear,Thermal generation,839.978
Oil imports,Oil,504.287
Oil reserves,Oil,107.703
Oil,Liquid,611.99
Other waste,Solid,56.587
Other waste,Bio-conversion,77.81
Pumped heat,Heating and cooling - homes,193.026
Pumped heat,Heating and cooling - commercial,70.672
Solar PV,Electricity grid,59.901
Solar Thermal,Heating and cooling - homes,19.263
Solar,Solar Thermal,19.263
Solar,Solar PV,59.901
Solid,Agriculture,0.882
Solid,Thermal generation,400.12
Solid,Industry,46.477
Thermal generation,Electricity grid,525.531
Thermal generation,Losses,787.129
Thermal generation,District heating,79.329
Tidal,Electricity grid,9.452
UK land based bioenergy,Bio-conversion,182.01
Wave,Electricity grid,19.013
Wind,Electricity grid,289.366`,
  },
  {
    id: 'timeline',
    label: '时间线 (Timeline)',
    code: `timeline
    title History of Social Media Platform
    2002 : LinkedIn
    2004 : Facebook
         : Google
    2005 : YouTube
    2006 : Twitter`,
  },
  {
    id: 'treemap',
    label: '树图 (Treemap)',
    code: `treemap-beta
"Section 1"
    "Leaf 1.1": 12
    "Section 1.2"
      "Leaf 1.2.1": 12
"Section 2"
    "Leaf 2.1": 20
    "Leaf 2.2": 25`,
  },
  {
    id: 'user-journey',
    label: '用户旅程 (User Journey)',
    code: `journey
    title My working day
    section Go to work
      Make tea: 5: Me
      Go upstairs: 3: Me
      Do work: 1: Me, Cat
    section Go home
      Go downstairs: 5: Me
      Sit down: 5: Me`,
  },
  {
    id: 'xy',
    label: 'XY 图 (XY)',
    code: `xychart-beta
    title "Sales Revenue"
    x-axis [jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec]
    y-axis "Revenue (in $)" 4000 --> 11000
    bar [5000, 6000, 7500, 8200, 9500, 10500, 11000, 10200, 9200, 8500, 7000, 6000]
    line [5000, 6000, 7500, 8200, 9500, 10500, 11000, 10200, 9200, 8500, 7000, 6000]`,
  },
];

// ===== State =====
let editor;
let renderTimer;
let renderCounter = 0;
let suppressDebouncedRender = false;

// ===== Preview Zoom & Pan State =====
let previewScale = 1;
let previewPanX = 0;
let previewPanY = 0;
let isPanning = false;
let panStartX, panStartY;
let panStartPanX, panStartPanY;
let lastHoveredGroup = null;

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

// ===== Editor Font Size =====
function getEditorFontSize() {
  return parseInt(localStorage.getItem('editorFontSize'), 10) || 14;
}

function applyEditorFontSize(size) {
  document.documentElement.style.setProperty('--editor-font-size', `${size}px`);
  if (editor && typeof editor.requestMeasure === 'function') {
    editor.requestMeasure();
  }
}

function setEditorFontSize(size) {
  localStorage.setItem('editorFontSize', String(size));
  applyEditorFontSize(size);
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

function updateMermaidLookUI(look) {
  const buttons = document.querySelectorAll('.look-toggle .toggle-btn');
  buttons.forEach((btn) => {
    if (btn.dataset.look === look) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function setMermaidLook(look) {
  localStorage.setItem('mermaidLook', look);
  updateMermaidLookUI(look);
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
    clearErrorHighlight();
    return;
  }

  try {
    renderCounter++;
    const id = `mermaid-svg-${renderCounter}`;
    const { svg } = await mermaid.render(id, trimmed);
    const hadSvg = !!preview.querySelector('svg');
    const savedScale = previewScale;
    const savedPanX = previewPanX;
    const savedPanY = previewPanY;
    preview.innerHTML = svg;
    clearErrorHighlight();
    if (hadSvg) {
      previewScale = savedScale;
      previewPanX = savedPanX;
      previewPanY = savedPanY;
      applyPreviewTransform();
    } else {
      previewScale = 1;
      previewPanX = 0;
      previewPanY = 0;
      applyPreviewTransform();
      scheduleFitPreview();
    }
  } catch (err) {
    // Mermaid render may create dangling elements on error
    const errEl = document.getElementById(`dmermaid-svg-${renderCounter}`);
    if (errEl) errEl.remove();

    preview.innerHTML = `<div class="error-message">${escapeHtml(err.message || String(err))}</div><button class="error-help-toggle" id="btn-error-help"><span class="arrow">&#9654;</span> 自查常见错误</button>`;
    highlightErrorLine(err.message || String(err));
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
        if (suppressDebouncedRender) return;
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

function setEditorContent(code) {
  if (!editor) return;
  clearTimeout(renderTimer);
  suppressDebouncedRender = true;
  editor.dispatch({
    changes: { from: 0, to: editor.state.doc.length, insert: code },
  });
  suppressDebouncedRender = false;
  renderMermaid(code);
  editor.focus();
}

// ===== Preview Zoom & Pan =====
function applyPreviewTransform() {
  const svg = document.querySelector('#preview svg');
  if (!svg) return;
  svg.style.transform = `translate(${previewPanX}px, ${previewPanY}px) scale(${previewScale})`;
  svg.style.transformOrigin = '0 0';
}

function readViewBox(svg) {
  if (svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width > 0 && svg.viewBox.baseVal.height > 0) {
    const vb = svg.viewBox.baseVal;
    return { x: vb.x, y: vb.y, width: vb.width, height: vb.height };
  }
  const viewBoxAttr = svg.getAttribute('viewBox');
  if (!viewBoxAttr) return null;
  const vb = viewBoxAttr.split(/[\s,]+/).map(Number);
  if (vb.length !== 4 || vb.some((v) => Number.isNaN(v))) return null;
  return { x: vb[0], y: vb[1], width: vb[2], height: vb[3] };
}

function getSvgContentBox(svg) {
  try {
    const raw = svg.getBBox();
    if (raw && Number.isFinite(raw.width) && raw.width > 0 && raw.height > 0) {
      return raw;
    }
  } catch {
    // getBBox can fail before render; ignore and fallback.
  }

  return readViewBox(svg);
}

function getSvgContentBoxPx(svg) {
  const box = getSvgContentBox(svg);
  if (!box) return null;

  const vb = readViewBox(svg);
  const rect = svg.getBoundingClientRect();
  let scaleX = 1;
  let scaleY = 1;
  let originX = 0;
  let originY = 0;

  if (vb && vb.width > 0 && vb.height > 0 && rect.width > 0 && rect.height > 0) {
    scaleX = rect.width / vb.width;
    scaleY = rect.height / vb.height;
    originX = vb.x;
    originY = vb.y;
  }

  return {
    x: (box.x - originX) * scaleX,
    y: (box.y - originY) * scaleY,
    width: box.width * scaleX,
    height: box.height * scaleY,
  };
}

function fitAndCenterPreview() {
  const preview = document.getElementById('preview');
  const svg = document.querySelector('#preview svg');
  if (!preview || !svg) return;
  // Measure without preview transform to avoid compounding scale/translate.
  svg.style.transform = '';
  svg.style.transformOrigin = '0 0';
  const box = getSvgContentBoxPx(svg);
  const style = getComputedStyle(preview);
  const padLeft = parseFloat(style.paddingLeft) || 0;
  const padRight = parseFloat(style.paddingRight) || 0;
  const padTop = parseFloat(style.paddingTop) || 0;
  const padBottom = parseFloat(style.paddingBottom) || 0;
  if (!box) {
    previewScale = 1;
    previewPanX = 0;
    previewPanY = 0;
    applyPreviewTransform();
    ensurePreviewVisible();
    return;
  }

  const rect = preview.getBoundingClientRect();
  const contentWidth = Math.max(rect.width - padLeft - padRight, 1);
  const contentHeight = Math.max(rect.height - padTop - padBottom, 1);
  const inset = 8;
  const width = Math.max(box.width + inset * 2, 1);
  const height = Math.max(box.height + inset * 2, 1);
  const availableWidth = Math.max(contentWidth, 1);
  const availableHeight = Math.max(contentHeight, 1);
  const fitWidth = width <= availableWidth * 0.8;
  const fitHeight = height <= availableHeight * 0.8;
  let scale = 1;
  if (!fitWidth || !fitHeight) {
    scale = Math.min((availableWidth * 0.8) / width, (availableHeight * 0.8) / height);
  }
  if (!Number.isFinite(scale) || scale <= 0) {
    previewScale = 1;
    previewPanX = 0;
    previewPanY = 0;
    applyPreviewTransform();
    ensurePreviewVisible();
    return;
  }
  scale = Math.max(scale, 0.1);
  previewScale = scale;
  const boxX = Number.isFinite(box.x) ? box.x : 0;
  const boxY = Number.isFinite(box.y) ? box.y : 0;
  previewPanX = (contentWidth - width * previewScale) / 2 - (boxX - inset) * previewScale;
  previewPanY = (contentHeight - height * previewScale) / 2 - (boxY - inset) * previewScale;
  if (!Number.isFinite(previewPanX)) previewPanX = 0;
  if (!Number.isFinite(previewPanY)) previewPanY = 0;
  applyPreviewTransform();
  ensurePreviewVisible();
}

function scheduleFitPreview() {
  requestAnimationFrame(() => {
    requestAnimationFrame(fitAndCenterPreview);
  });
  setTimeout(fitAndCenterPreview, 0);
  setTimeout(fitAndCenterPreview, 50);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      fitAndCenterPreview();
    });
  }
}

function ensurePreviewVisible() {
  const preview = document.getElementById('preview');
  const svg = document.querySelector('#preview svg');
  if (!preview || !svg) return;
  const rect = svg.getBoundingClientRect();
  const pRect = preview.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;
  const visible = rect.right > pRect.left && rect.left < pRect.right && rect.bottom > pRect.top && rect.top < pRect.bottom;
  if (!visible) {
    previewScale = 1;
    previewPanX = 0;
    previewPanY = 0;
    applyPreviewTransform();
  }
}


// ===== Double-click to source line =====

const meaningfulClasses = ['node', 'edgeLabel', 'actor', 'note', 'cluster',
  'label', 'edgePath', 'messageText', 'activation', 'statediagram-state',
  'er', 'pieCircle', 'slice', 'task', 'section',
  'architecture-service', 'architecture-junction', 'edge',
  'person-man'];

function findMermaidElement(target) {
  let el = target;
  // Pass 1: Walk up to find a meaningful <g> group
  while (el && el.tagName !== 'svg') {
    if (el.tagName === 'g') {
      const id = el.getAttribute('id') || '';
      const cls = el.getAttribute('class') || '';

      // Extract nodeId from common Mermaid ID patterns
      let nodeId = null;
      const flowMatch = id.match(/^flowchart-(.+?)-\d+$/);
      if (flowMatch) nodeId = flowMatch[1];
      const classMatch = !nodeId && id.match(/^classId-(.+?)-\d+$/);
      if (classMatch) nodeId = classMatch[1];
      // Some diagram types use plain IDs
      if (!nodeId && id && /^[A-Za-z]/.test(id) && !id.includes(' ')) {
        nodeId = id;
      }

      const hasMeaningfulClass = meaningfulClasses.some(c => cls.includes(c));

      // Fallback 1: check if any direct non-g child carries a meaningful class
      // Covers <g> wrappers that lack their own class but contain meaningful
      // elements (e.g. journey <rect class="task">, C4 <rect class="node-bkg">)
      let hasChildMatch = false;
      if (!nodeId && !hasMeaningfulClass) {
        for (const child of el.children) {
          if (child.tagName !== 'g') {
            const childCls = child.getAttribute('class') || '';
            if (meaningfulClasses.some(c => childCls.includes(c))) {
              hasChildMatch = true;
              break;
            }
          }
        }
        // Fallback 2: leaf group (no <g> children) with rect + text
        // Covers elements with no CSS classes at all (e.g. C4 boundaries)
        if (!hasChildMatch) {
          let hasGChild = false, hasRect = false, hasText = false;
          for (const child of el.children) {
            const tag = child.tagName;
            if (tag === 'g') { hasGChild = true; break; }
            if (tag === 'rect') hasRect = true;
            if (tag === 'text') hasText = true;
          }
          hasChildMatch = !hasGChild && hasRect && hasText;
        }
      }

      if (nodeId || hasMeaningfulClass || hasChildMatch) {
        // Extract text content from the element
        let text = '';
        const textEls = el.querySelectorAll('text, foreignObject span, foreignObject div, foreignObject p');
        for (const t of textEls) {
          const content = t.textContent.trim();
          // Skip C4/UML stereotype annotations like <<person>>, <<system>>
          if (content && !/^<<.+>>$/.test(content)) {
            text = content;
            break;
          }
        }
        return { nodeId, text, groupEl: el };
      }
    }
    el = el.parentElement;
  }

  // Pass 2: Check flat SVG elements (rect/text without wrapping <g>)
  // Safety net for diagram types that render shapes directly under <svg>
  el = target;
  while (el && el.tagName !== 'svg') {
    if (el.tagName === 'rect' || el.tagName === 'text') {
      const cls = el.getAttribute('class') || '';
      if (meaningfulClasses.some(c => cls.includes(c))) {
        let text = '';
        let groupEl = el;

        if (el.tagName === 'text') {
          text = el.textContent.trim();
          // Find preceding sibling rect with a shared class as hover target
          let sib = el.previousElementSibling;
          while (sib) {
            if (sib.tagName === 'rect') {
              const sibCls = sib.getAttribute('class') || '';
              const words = cls.split(/\s+/);
              if (words.some(w => w && sibCls.split(/\s+/).includes(w))) {
                groupEl = sib;
                break;
              }
            }
            sib = sib.previousElementSibling;
          }
        } else {
          // For rect, find next sibling text for content
          let sib = el.nextElementSibling;
          while (sib) {
            if (sib.tagName === 'text') {
              const content = sib.textContent.trim();
              if (content) { text = content; break; }
            }
            if (sib.tagName === 'rect') break;
            sib = sib.nextElementSibling;
          }
        }

        return { nodeId: null, text, groupEl };
      }
    }
    el = el.parentElement;
  }

  return null;
}

function findSourceLine(doc, nodeId, text) {
  const lines = doc.split('\n');

  // Priority 1: match by nodeId
  if (nodeId) {
    // Match patterns like: A[, A(, A{, A>, A--, A -->, A ---|, A -->|, A:::, A;
    const idPattern = new RegExp(
      '(?:^|\\s|;)' + escapeRegExp(nodeId) + '(?=[\\s\\[\\(\\{\\>\\-\\:\\;\\|/\\\\]|$)'
    );
    for (let i = 0; i < lines.length; i++) {
      if (idPattern.test(lines[i])) return i;
    }
  }

  // Priority 2: match by text content
  if (text && text.length > 1) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(text)) return i;
    }
  }

  return -1;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function scrollEditorToLine(line) {
  if (!editor) return;
  const doc = editor.state.doc;
  const lineObj = doc.line(line + 1); // CodeMirror lines are 1-based
  editor.dispatch({
    selection: { anchor: lineObj.from },
    scrollIntoView: true,
  });
  editor.focus();

  // Brief highlight flash on the target line
  const lineDOM = editor.domAtPos(lineObj.from);
  const lineEl = lineDOM.node.nodeType === 1
    ? lineDOM.node
    : lineDOM.node.parentElement;
  if (lineEl) {
    const cmLine = lineEl.closest('.cm-line');
    if (cmLine) {
      cmLine.classList.add('cm-highlight-line');
      setTimeout(() => cmLine.classList.remove('cm-highlight-line'), 1500);
    }
  }
}

// ===== Error Line Highlight =====
let errorLineStyleEl = null;

function clearErrorHighlight() {
  if (errorLineStyleEl) {
    errorLineStyleEl.textContent = '';
  }
}

function highlightErrorLine(msg) {
  if (!errorLineStyleEl) {
    errorLineStyleEl = document.createElement('style');
    document.head.appendChild(errorLineStyleEl);
  }
  const match = msg.match(/on line (\d+)/i);
  if (!match) {
    clearErrorHighlight();
    return;
  }
  const lineNum = parseInt(match[1], 10);
  errorLineStyleEl.textContent =
    `.cm-content > .cm-line:nth-child(${lineNum}) { background: rgba(220, 38, 38, 0.15) !important; box-shadow: inset 3px 0 0 var(--error-color); }`;
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

  // Hover detection for interactive elements
  preview.addEventListener('mousemove', (e) => {
    if (isPanning) return;
    const el = findMermaidElement(e.target);
    const newGroup = el ? el.groupEl : null;
    if (newGroup !== lastHoveredGroup) {
      if (lastHoveredGroup) lastHoveredGroup.classList.remove('mermaid-hoverable');
      if (newGroup) newGroup.classList.add('mermaid-hoverable');
      lastHoveredGroup = newGroup;
    }
  });

  preview.addEventListener('mouseleave', () => {
    if (lastHoveredGroup) {
      lastHoveredGroup.classList.remove('mermaid-hoverable');
      lastHoveredGroup = null;
    }
  });

  // Mouse drag
  preview.addEventListener('mousedown', (e) => {
    // Only left button
    if (e.button !== 0) return;
    // Don't pan if clicking on error message
    if (e.target.closest('.error-message')) return;
    e.preventDefault();
    isPanning = true;
    if (lastHoveredGroup) {
      lastHoveredGroup.classList.remove('mermaid-hoverable');
      lastHoveredGroup = null;
    }
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

  // Double-click: jump to source line or reset zoom
  preview.addEventListener('dblclick', (e) => {
    const el = findMermaidElement(e.target);
    if (el) {
      const doc = editor.state.doc.toString();
      const line = findSourceLine(doc, el.nodeId, el.text);
      if (line >= 0) {
        scrollEditorToLine(line);
        return;
      }
    }
    // Fallback: reset zoom
    previewScale = 1;
    previewPanX = 0;
    previewPanY = 0;
    applyPreviewTransform();
    fitAndCenterPreview();
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

function initSampleDiagrams() {
  const list = document.getElementById('sample-diagrams');
  if (!list) return;
  list.innerHTML = '';
  sampleDiagrams.forEach((sample) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sample-pill';
    btn.textContent = sample.label;
    btn.addEventListener('click', () => {
      setEditorContent(sample.code);
    });
    list.appendChild(btn);
  });
}

// ===== Init =====
function init() {
  const theme = getTheme();
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('icon-sun').style.display = theme === 'dark' ? 'none' : '';
  document.getElementById('icon-moon').style.display = theme === 'dark' ? '' : 'none';

  const fontSize = getEditorFontSize();
  applyEditorFontSize(fontSize);
  const fontSizeSelect = document.getElementById('select-editor-font-size');
  if (fontSizeSelect) {
    fontSizeSelect.value = String(fontSize);
    fontSizeSelect.addEventListener('change', (e) => {
      const nextSize = parseInt(e.target.value, 10);
      if (!Number.isNaN(nextSize)) {
        setEditorFontSize(nextSize);
      }
    });
  }

  // Restore mermaid theme selection
  const mermaidTheme = getMermaidTheme();
  document.getElementById('select-mermaid-theme').value = mermaidTheme;

  // Restore mermaid look selection
  const mermaidLook = getMermaidLook();
  updateMermaidLookUI(mermaidLook);

  initMermaid();
  editor = createEditor(theme);
  initDivider();
  initPreviewZoomPan();
  initSampleDiagrams();

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

  // Bind mermaid look toggle
  document.querySelectorAll('.look-toggle .toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      setMermaidLook(btn.dataset.look);
    });
  });

  // ===== PNG Size Inline Controls =====
  const toggleBtns = document.querySelectorAll('.png-size-toggle-group .toggle-btn');
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
  sizeValueInput.disabled = (savedMode === 'auto');

  // Toggle button clicks
  toggleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      toggleBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.dataset.mode;
      setPngSizeMode(mode);
      sizeValueInput.disabled = (mode === 'auto');
    });
  });

  // Number input change
  sizeValueInput.addEventListener('change', () => {
    const val = parseInt(sizeValueInput.value, 10);
    if (val >= 100 && val <= 10000) {
      setPngSizeValue(val);
    }
  });

  // ===== Error Help Toggle (event delegation) =====
  document.getElementById('preview').addEventListener('click', (e) => {
    const toggle = e.target.closest('#btn-error-help');
    if (!toggle) return;
    toggle.classList.toggle('open');
    const existing = document.querySelector('.error-help-list');
    if (existing) {
      existing.remove();
      return;
    }
    const list = document.createElement('ul');
    list.className = 'error-help-list';
    list.innerHTML =
      '<li><strong>1.</strong> 虚线箭头写法：<code>.-></code> <span class="fix-arrow">&rarr;</span> <code>-.-></code></li>' +
      '<li><strong>2.</strong> <code>subgraph</code> 必须有对应的 <code>end</code> 闭合</li>' +
      '<li><strong>3.</strong> 缺少图表方向声明时添加 <code>TD</code> 或 <code>LR</code></li>' +
      '<li><strong>4.</strong> 节点 ID 不能使用保留字 <code>end</code>：<code>end[结束]</code> <span class="fix-arrow">&rarr;</span> <code>endNode["结束"]</code></li>' +
      '<li><strong>5.</strong> 节点文本内的双引号需转义：<code>"</code> <span class="fix-arrow">&rarr;</span> <code>&amp;quot;</code> 或用单引号代替</li>' +
      '<li><strong>6.</strong> 含中文/特殊字符的节点文本需用双引号包裹：<code>A[文本]</code> <span class="fix-arrow">&rarr;</span> <code>A["文本"]</code></li>';
    toggle.after(list);
  });
}

init();
