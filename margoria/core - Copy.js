// ===== MARGORIA CORE SYSTEM =====
// Application logic and event handlers

document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) {
    lucide.createIcons();
  }
});

// ASSETS se carga desde assets.js como window.ASSETS

// Inyectar fuentes en el head del documento
function injectFonts(fonts) {
  const styleTag = document.createElement("style");
  let fontFaceRules = "";
  
  fonts.forEach(font => {
    fontFaceRules += `
      @font-face {
        font-family: "${font.family}";
        src: url("${font.file}") format("woff2");
      }
    `;
  });
  
  styleTag.textContent = fontFaceRules;
  document.head.appendChild(styleTag);
  console.log("✓ Fuentes inyectadas al documento");
}

let currentBgIndex = 0;
let nextZIndex = 20;

function renderBackground() {
  if (!window.ASSETS.backgrounds || window.ASSETS.backgrounds.length === 0) {
    console.error("[renderBackground] ASSETS.backgrounds está vacío");
    document.getElementById("bg-name").textContent = "No backgrounds loaded";
    return;
  }
  
  const bg = window.ASSETS.backgrounds[currentBgIndex];
  const canvas = document.getElementById("paper-viewport");
  const label = document.getElementById("bg-name");
  
  console.log("[renderBackground] Renderizando fondo:", bg.name);
  canvas.style.backgroundImage = `url('${bg.src}')`;
  label.textContent = bg.name;
}

function changeBackground(delta) {
  const total = window.ASSETS.backgrounds.length;
  currentBgIndex = (currentBgIndex + delta + total) % total;
  renderBackground();
}

function initPalettes() {
  console.log("[initPalettes] Inicializando paletas...");
  console.log("[initPalettes] ASSETS:", window.ASSETS);
  
  // Caps
  const capsGrid = document.getElementById("grid-caps");
  if (!capsGrid) {
    console.error("[initPalettes] No se encontró grid-caps");
  } else if (!window.ASSETS.caps || window.ASSETS.caps.length === 0) {
    console.warn("[initPalettes] ASSETS.caps está vacío");
  } else {
    console.log("[initPalettes] Renderizando", window.ASSETS.caps.length, "caps");
    window.ASSETS.caps.forEach((item) => {
      const div = document.createElement("div");
      div.className = "asset-item";
      div.innerHTML = `<img src="${item.src}" alt="${item.id}" />`;
      div.addEventListener("click", () => addToCanvas(item.src, "image"));
      capsGrid.appendChild(div);
    });
  }

  // Borders
  const bordersGrid = document.getElementById("grid-borders");
  if (!bordersGrid) {
    console.error("[initPalettes] No se encontró grid-borders");
  } else if (!window.ASSETS.borders || window.ASSETS.borders.length === 0) {
    console.warn("[initPalettes] ASSETS.borders está vacío");
  } else {
    console.log("[initPalettes] Renderizando", window.ASSETS.borders.length, "borders");
    window.ASSETS.borders.forEach((item) => {
      const div = document.createElement("div");
      div.className = "asset-item";
      div.innerHTML = `<img src="${item.src}" alt="${item.id}" />`;
      div.addEventListener("click", () => addToCanvas(item.src, "border"));
      bordersGrid.appendChild(div);
    });
  }

  // Marginalias
  const margGrid = document.getElementById("grid-marginalias");
  if (!margGrid) {
    console.error("[initPalettes] No se encontró grid-marginalias");
  } else if (!window.ASSETS.marginalias || window.ASSETS.marginalias.length === 0) {
    console.warn("[initPalettes] ASSETS.marginalias está vacío");
  } else {
    console.log("[initPalettes] Renderizando", window.ASSETS.marginalias.length, "marginalias");
    window.ASSETS.marginalias.forEach((item) => {
      const div = document.createElement("div");
      div.className = "asset-item";
      div.innerHTML = `<img src="${item.src}" alt="${item.id}" />`;
      div.addEventListener("click", () => addToCanvas(item.src, "image"));
      margGrid.appendChild(div);
    });
  }
}

let lastMousePos = { x: 0, y: 0 };

document.addEventListener("mousemove", (e) => {
  lastMousePos = { x: e.pageX, y: e.pageY };
});

function addToCanvas(src, type) {
  const canvas = document.getElementById("paper-viewport");
  const canvasRect = canvas.getBoundingClientRect();
  
  const el = document.createElement("div");
  el.className = "draggable-element";
  el.style.zIndex = String(nextZIndex++);
  el.setAttribute("data-type", type);

  if (type === "text") {
    el.innerHTML = `<div contenteditable="true" class="text-block pfeffermediaeval" spellcheck="false" style="outline: 2px dashed var(--accent-color); padding: 8px; white-space: pre-wrap; word-wrap: break-word; min-height: 20px;" data-placeholder="Type here...">Type here...</div>`;
    el.style.width = "200px";
    el.style.height = "auto";
    el.style.touchAction = "none";
    el.style.userSelect = "none";
    
    // Agregar listeners para contenteditable que permitan drag sin editar
    const textBlock = el.querySelector(".text-block");
    
    // Placeholder logic
    textBlock.addEventListener("focus", () => {
      if (textBlock.textContent === "Type here...") {
        textBlock.textContent = "";
      }
      textBlock.style.pointerEvents = "auto";
    });
    
    textBlock.addEventListener("blur", () => {
      if (textBlock.textContent.trim() === "") {
        textBlock.textContent = "Type here...";
      }
      textBlock.style.pointerEvents = "auto";
    });
    
    textBlock.addEventListener("mousedown", (e) => {
      e.stopPropagation();
    });
  } else if (type === "border") {
    el.innerHTML = `<img src="${src}" style="width:100%; height:auto; display: block;" draggable="false" onerror="this.style.border='2px solid red'"/>`;
    el.style.width = "260px";
  } else {
    el.innerHTML = `<img src="${src}" style="width:100%; height:auto; display: block;" draggable="false" onerror="this.style.border='2px solid red'"/>`;
  }

  el.addEventListener("mousedown", (ev) => {
    ev.stopPropagation();
    selectElement(el);
  });
  
  // Calcular posición relativa al canvas basada en la posición del mouse
  let x, y;
  
  // Verificar si el mouse está dentro del canvas
  if (lastMousePos.x > canvasRect.left && lastMousePos.x < canvasRect.right &&
      lastMousePos.y > canvasRect.top && lastMousePos.y < canvasRect.bottom) {
    // Mouse está dentro del canvas, calcular posición relativa
    x = lastMousePos.x - canvasRect.left - 70;
    y = lastMousePos.y - canvasRect.top - 70;
  } else {
    // Mouse está fuera, centrar el elemento en el canvas
    x = (750 / 2) - 70;
    y = (900 / 2) - 70;
  }
  
  // Asegurar que está dentro de los márgenes (40px en cada lado)
  const MARGINS = 40;
  const MAX_WIDTH = 750 - (MARGINS * 2);
  const MAX_HEIGHT = 900 - (MARGINS * 2);
  x = Math.max(MARGINS, Math.min(x, MARGINS + MAX_WIDTH - 140));
  y = Math.max(MARGINS, Math.min(y, MARGINS + MAX_HEIGHT - 140));
  
  // NO usar left/top, solo transform
  el.style.left = "0px";
  el.style.top = "0px";
  el.setAttribute("data-x", x);
  el.setAttribute("data-y", y);
  el.style.transform = `translate(${x}px, ${y}px)`;
  
  canvas.appendChild(el);
  selectElement(el);
}

function selectElement(el) {
  // visual selection state
  document.querySelectorAll(".draggable-element").forEach((item) => item.classList.remove("selected"));
  el.classList.add("selected");
  el.style.zIndex = String(++nextZIndex);
  currentSelectedElement = el;
  showContextToolbar(el);

  // register with transform manager and update selection
  if (window.TRANSFORM_MANAGER) {
    const mgr = window.TRANSFORM_MANAGER;
    let tf = mgr.items.find(i => i.el === el);
    if (!tf) tf = mgr.register(el);
    // clear previous and select this transformer
    mgr.clearSelection();
    mgr.toggleSelection(tf);
  }
}

// --- Flip helpers ---
function updateFlipOnElement(el) {
  if (!el) return;
  const img = el.querySelector('img');
  if (!img) return;
  const fx = el.dataset.flipX === 'true';
  const fy = el.dataset.flipY === 'true';
  img.style.transform = `scale(${fx ? -1 : 1}, ${fy ? -1 : 1})`;
  img.style.transformOrigin = '50% 50%';
}

function flipSelectedHorizontal() {
  if (!currentSelectedElement) return;
  const cur = currentSelectedElement.dataset.flipX === 'true';
  currentSelectedElement.dataset.flipX = (!cur).toString();
  updateFlipOnElement(currentSelectedElement);
}

function flipSelectedVertical() {
  if (!currentSelectedElement) return;
  const cur = currentSelectedElement.dataset.flipY === 'true';
  currentSelectedElement.dataset.flipY = (!cur).toString();
  updateFlipOnElement(currentSelectedElement);
}

function showContextToolbar(el) {
  const toolbar = document.getElementById("context-toolbar");
  const textToolbar = document.getElementById("text-toolbar");
  const canvas = document.getElementById("paper-viewport");
  const rect = el.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  
  // Detectar el tipo de elemento
  const isText = el.querySelector(".text-block") !== null;
  const isBorder = el.getAttribute("data-type") === "border";
  
  // Mostrar/ocultar secciones específicas
  document.getElementById("border-repeat-section").style.display = isBorder ? "flex" : "none";
  
  if (isText) {
    // Mostrar text toolbar responsivamente
    toolbar.classList.remove("visible");
    textToolbar.classList.add("visible");
    
    // Posicionar debajo del elemento, centrado horizontalmente y dentro de la pantalla
    let toolbarTop = rect.bottom + 10;
    let toolbarLeft = rect.left;
    
    // Ajustar si se sale de la pantalla (lado derecho)
    const maxRight = window.innerWidth - 20;
    if (toolbarLeft + 600 > maxRight) { // Aproximadamente 600px de ancho el toolbar
      toolbarLeft = maxRight - 600;
    }
    
    // Ajustar si se sale de la pantalla (lado izquierdo)
    if (toolbarLeft < 10) {
      toolbarLeft = 10;
    }
    
    textToolbar.style.position = "fixed";
    textToolbar.style.top = Math.max(10, toolbarTop) + "px";
    textToolbar.style.left = Math.max(10, toolbarLeft) + "px";
    textToolbar.style.bottom = "auto";
    textToolbar.style.right = "auto";
    
    updateTextToolbar(el);
  } else {
    // Mostrar context toolbar
    textToolbar.classList.remove("visible");
    toolbar.classList.add("visible");
    let top = rect.top - canvasRect.top - 50;
    let left = rect.left - canvasRect.left + rect.width / 2 - 90;
    toolbar.style.top = Math.max(0, top) + "px";
    toolbar.style.left = Math.max(0, left) + "px";
  }
  
  // Guardar referencia al elemento actual
  currentSelectedElement = el;
  
  // Re-inicializar Lucide para los iconos
  if (window.lucide) {
    lucide.createIcons();
  }
}

function updateTextToolbar(el) {
  const textBlock = el.querySelector(".text-block");
  if (!textBlock) return;
  
  // Actualizar font
  const fontClass = Array.from(textBlock.classList).find(c => ["capo1880", "pfeffermediaeval", "codexmanesse", "cissanthemos", "hicopus", "icigist", "indiebusillis", "litteraeignotae", "malatemporacurrunt", "pfeffersimpelgotisch", "quariteregnumdei", "sprangalongobarda", "vulnus", "zifferaveneta", "andiamoabruciarglilacasa", "capoecclesia", "capolinea"].includes(c)) || "pfeffermediaeval";
  document.getElementById("text-font").value = fontClass;
  
  // Actualizar color
  const color = textBlock.className.includes("text-red") ? "#850d00" : textBlock.className.includes("text-gold") ? "#8a731d" : "#1a1a1a";
  document.getElementById("text-color-picker").value = color;
  
  // Actualizar tamaño
  const fontSize = parseInt(window.getComputedStyle(textBlock).fontSize) || 26;
  document.getElementById("text-size-slider").value = fontSize;
  document.getElementById("text-size-value").textContent = fontSize + "px";
}

function hideContextToolbar() {
  const toolbar = document.getElementById("context-toolbar");
  const textToolbar = document.getElementById("text-toolbar");
  toolbar.classList.remove("visible");
  textToolbar.classList.remove("visible");
  currentSelectedElement = null;
}

let currentSelectedElement = null;

function clearCanvas() {
  const canvas = document.getElementById("paper-viewport");
  canvas.querySelectorAll(".draggable-element").forEach((el) => el.remove());
}

function cycleTextColor() {
  const target = document.querySelector(".draggable-element.selected .text-block");
  if (!target) return;
  const classes = ["black", "text-red", "text-gold"];
  const current = target.dataset.color || "black";
  const idx = classes.indexOf(current);
  const next = classes[(idx + 1) % classes.length];

  target.classList.remove("text-red", "text-gold");
  if (next === "text-red") target.classList.add("text-red");
  if (next === "text-gold") target.classList.add("text-gold");
  target.dataset.color = next;
}

function duplicateSelectedElement() {
    if (!currentSelectedElement) return;

    const clone = currentSelectedElement.cloneNode(true);
    
    // FIX: Add the mousedown listener for selection that is lost during cloning
    clone.addEventListener("mousedown", (ev) => {
        ev.stopPropagation();
        selectElement(clone);
    });

    const x = parseFloat(currentSelectedElement.getAttribute("data-x")) || 0;
    const y = parseFloat(currentSelectedElement.getAttribute("data-y")) || 0;
    
    let newX = x + 30;
    let newY = y + 30;
    
    const MARGINS = 40;
    const MAX_WIDTH = 750 - (MARGINS * 2);
    const MAX_HEIGHT = 900 - (MARGINS * 2);
    newX = Math.max(MARGINS, Math.min(newX, MARGINS + MAX_WIDTH - 140));
    newY = Math.max(MARGINS, Math.min(newY, MARGINS + MAX_HEIGHT - 140));
    
    clone.setAttribute("data-x", newX);
    clone.setAttribute("data-y", newY);
    clone.style.transform = `translate(${newX}px, ${newY}px)`;
    
    const canvas = document.getElementById("paper-viewport");
    canvas.appendChild(clone);
    selectElement(clone);
}

// === GESTIÓN DE TEMAS ===
function toggleTheme() {
  const body = document.body;
  if (body.classList.contains("theme-earth")) {
    body.classList.replace("theme-earth", "theme-green");
  } else {
    body.classList.replace("theme-green", "theme-earth");
  }
}

// Variables para pan
let isPanning = false;
let panStartX = 0;
let panStartY = 0;
let panStartScrollX = 0;
let panStartScrollY = 0;

window.addEventListener("load", () => {
  console.log("🔄 Iniciando Margoria...");
  
  // Usar ASSETS desde window (cargado por assets.js)
  window.ASSETS = window.ASSETS || {};
  console.log("✓ Assets disponibles:", window.ASSETS);
  
  // Inyectar fuentes
  if (window.ASSETS.fonts && window.ASSETS.fonts.length > 0) {
    injectFonts(window.ASSETS.fonts);
  }
  
  console.log("🔄 Inicializando paletas...");
  initPalettes();
  
  console.log("🔄 Renderizando fondo...");
  renderBackground();
  
  console.log("✓ Margoria cargado");

  // Deseleccionar al hacer clic en fondo (solo clic izquierdo)
  document.getElementById("paper-viewport").addEventListener("mousedown", (e) => {
    // Solo deseleccionar si es clic izquierdo en el fondo (no en el toolbar)
    if (e.button === 0 && !e.target.closest(".text-toolbar")) {
      document.querySelectorAll(".draggable-element").forEach((el) => el.classList.remove("selected"));
    }
  });

  // Botones generales
  document.getElementById("btn-clear").addEventListener("click", clearCanvas);
  
  // Botón de tema
  document.getElementById("btn-toggle-theme").addEventListener("click", toggleTheme);

  // Fondos y texto
  document.getElementById("bg-prev-btn").addEventListener("click", () => changeBackground(-1));
  document.getElementById("bg-next-btn").addEventListener("click", () => changeBackground(1));
  document.getElementById("tool-add-text").addEventListener("click", () => addToCanvas(null, "text"));
  document.getElementById("dock-add-text-btn").addEventListener("click", () => addToCanvas(null, "text"));
  document.getElementById("tool-cycle-text-color").addEventListener("click", cycleTextColor);

 
  // === CONTEXT TOOLBAR HANDLERS ===
  // Duplicate
  document.getElementById("btn-duplicate").addEventListener("click", duplicateSelectedElement);

  // Delete
  document.getElementById("btn-delete").addEventListener("click", () => {
    if (!currentSelectedElement) return;
    currentSelectedElement.remove();
    hideContextToolbar();
  });

  // Border Repeat Horizontal
  document.getElementById("btn-repeat-h").addEventListener("click", () => {
    if (!currentSelectedElement) return;
    repeatBorder(currentSelectedElement, "horizontal");
  });

  // Border Repeat Vertical
  document.getElementById("btn-repeat-v").addEventListener("click", () => {
    if (!currentSelectedElement) return;
    repeatBorder(currentSelectedElement, "vertical");
  });

  // Flip Horizontal / Vertical (restored from legacy UI)
  const flipHBtn = document.getElementById("btn-flip-h");
  const flipVBtn = document.getElementById("btn-flip-v");
  if (flipHBtn) flipHBtn.addEventListener("click", flipSelectedHorizontal);
  if (flipVBtn) flipVBtn.addEventListener("click", flipSelectedVertical);

  // Hide toolbar solo cuando se deselecciona (NO si está visible el text toolbar)
  document.getElementById("paper-viewport").addEventListener("mousedown", (e) => {
    // Ignorar clics en elementos interactivos
    if (e.target.closest(".draggable-element") || e.target.closest(".text-toolbar") || e.target.closest(".context-toolbar")) {
      return;
    }
    
    // Si hay texto seleccionado, mantener toolbar visible
    if (currentSelectedElement && currentSelectedElement.querySelector(".text-block")) {
      return;
    }
    
    // Solo ocultar si se hace clic en el fondo
    if (e.target === document.getElementById("paper-viewport") || e.target.closest(".grid-overlay")) {
      hideContextToolbar();
    }
  });


  // === PANNING CON CLIC DERECHO ===
  document.getElementById("paper-viewport").addEventListener("mousedown", (e) => {
    if (e.button === 2) { // Clic derecho
      e.preventDefault();
      isPanning = true;
      panStartX = e.clientX;
      panStartY = e.clientY;
      panStartScrollX = document.querySelector(".canvas-area").scrollLeft;
      panStartScrollY = document.querySelector(".canvas-area").scrollTop;
      document.getElementById("paper-viewport").classList.add("panning");
    }
  });

  document.addEventListener("mousemove", (e) => {
    if (isPanning) {
      const dx = e.clientX - panStartX;
      const dy = e.clientY - panStartY;
      const canvasArea = document.querySelector(".canvas-area");
      canvasArea.scrollLeft = panStartScrollX - dx;
      canvasArea.scrollTop = panStartScrollY - dy;
    }
  });

  document.addEventListener("mouseup", (e) => {
    if (isPanning) {
      isPanning = false;
      document.getElementById("paper-viewport").classList.remove("panning");
    }
  });

  // Prevenir context menu durante panning
  document.getElementById("paper-viewport").addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });

  // === TEXT TOOLBAR HANDLERS ===
  // Prevent deselection cuando se interactúa con la text toolbar
  document.getElementById("text-toolbar").addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // Font selector
  document.getElementById("text-font").addEventListener("change", (e) => {
    if (!currentSelectedElement) return;
    const textBlock = currentSelectedElement.querySelector(".text-block");
    if (!textBlock) return;
    textBlock.classList.remove("capo1880", "pfeffermediaeval", "codexmanesse", "cissanthemos", "hicopus", "icigist", "indiebusillis", "litteraeignotae", "malatemporacurrunt", "pfeffersimpelgotisch", "quariteregnumdei", "sprangalongobarda", "vulnus", "zifferaveneta", "andiamoabruciarglilacasa", "capoecclesia", "capolinea");
    if (e.target.value) {
      textBlock.classList.add(e.target.value);
    }
  });

  // Text Bold
  document.getElementById("btn-text-bold").addEventListener("click", (e) => {
    if (!currentSelectedElement) return;
    const textBlock = currentSelectedElement.querySelector(".text-block");
    if (!textBlock) return;
    textBlock.style.fontWeight = textBlock.style.fontWeight === "bold" ? "normal" : "bold";
    e.target.style.borderColor = textBlock.style.fontWeight === "bold" ? "var(--accent-bright)" : "transparent";
  });

  // Text Italic
  document.getElementById("btn-text-italic").addEventListener("click", (e) => {
    if (!currentSelectedElement) return;
    const textBlock = currentSelectedElement.querySelector(".text-block");
    if (!textBlock) return;
    textBlock.style.fontStyle = textBlock.style.fontStyle === "italic" ? "normal" : "italic";
    e.target.style.borderColor = textBlock.style.fontStyle === "italic" ? "var(--accent-bright)" : "transparent";
  });

  // Text Underline
  document.getElementById("btn-text-underline").addEventListener("click", (e) => {
    if (!currentSelectedElement) return;
    const textBlock = currentSelectedElement.querySelector(".text-block");
    if (!textBlock) return;
    textBlock.style.textDecoration = textBlock.style.textDecoration === "underline" ? "none" : "underline";
    e.target.style.borderColor = textBlock.style.textDecoration === "underline" ? "var(--accent-bright)" : "transparent";
  });

  // Text Align Left
  document.getElementById("btn-text-align-left").addEventListener("click", (e) => {
    if (!currentSelectedElement) return;
    const textBlock = currentSelectedElement.querySelector(".text-block");
    if (!textBlock) return;
    textBlock.style.textAlign = "left";
  });

  // Text Align Center
  document.getElementById("btn-text-align-center").addEventListener("click", (e) => {
    if (!currentSelectedElement) return;
    const textBlock = currentSelectedElement.querySelector(".text-block");
    if (!textBlock) return;
    textBlock.style.textAlign = "center";
  });

  // Text Align Right
  document.getElementById("btn-text-align-right").addEventListener("click", (e) => {
    if (!currentSelectedElement) return;
    const textBlock = currentSelectedElement.querySelector(".text-block");
    if (!textBlock) return;
    textBlock.style.textAlign = "right";
  });

  // Text Color Picker
  document.getElementById("text-color-picker").addEventListener("input", (e) => {
    if (!currentSelectedElement) return;
    const textBlock = currentSelectedElement.querySelector(".text-block");
    if (!textBlock) return;
    textBlock.style.color = e.target.value;
  });

  // Text Size Slider
  document.getElementById("text-size-slider").addEventListener("input", (e) => {
    if (!currentSelectedElement) return;
    const textBlock = currentSelectedElement.querySelector(".text-block");
    if (!textBlock) return;
    const size = parseFloat(e.target.value);
    textBlock.style.fontSize = size + "px";
    document.getElementById("text-size-value").textContent = size + "px";
  });

  // Text Duplicate
  document.getElementById("btn-text-duplicate").addEventListener("click", duplicateSelectedElement);

  // Text Delete
  document.getElementById("btn-text-delete").addEventListener("click", () => {
    if (!currentSelectedElement) return;
    currentSelectedElement.remove();
    hideContextToolbar();
  });

  // Clear Text Formatting
  document.getElementById("tool-clear-text-formatting").addEventListener("click", () => {
    document.querySelectorAll(".draggable-element .text-block").forEach((textBlock) => {
      textBlock.style.fontWeight = "normal";
      textBlock.style.fontStyle = "normal";
      textBlock.style.textDecoration = "none";
      textBlock.style.textAlign = "left";
      textBlock.style.color = "#1a1a1a";
      textBlock.classList.remove("text-red", "text-gold");
      textBlock.style.fontSize = "26px";
    });
  });
});

// === BORDER REPEAT FUNCTION ===
function repeatBorder(el, direction) {
  const img = el.querySelector("img");
  if (!img) return;

  const canvas = document.getElementById("paper-viewport");
  const x = parseFloat(el.getAttribute("data-x")) || 0;
  const y = parseFloat(el.getAttribute("data-y")) || 0;
  const rect = img.getBoundingClientRect();
  
  // Determinar tamaño del borde
  const width = rect.width;
  const height = rect.height;
  
  // Número de repeticiones
  const times = 2;
  const MARGINS = 40;
  const MAX_WIDTH = 750 - (MARGINS * 2);
  const MAX_HEIGHT = 900 - (MARGINS * 2);

  for (let i = 1; i < times; i++) {
    const clone = el.cloneNode(true);
    clone.style.zIndex = String(++nextZIndex);
    
    let newX = x;
    let newY = y;
    
    if (direction === "horizontal") {
      newX = x + (width * i);
    } else if (direction === "vertical") {
      newY = y + (height * i);
    }
    
    // Asegurar que el clone está dentro del canvas
    newX = Math.max(MARGINS, Math.min(newX, MARGINS + MAX_WIDTH - width));
    newY = Math.max(MARGINS, Math.min(newY, MARGINS + MAX_HEIGHT - height));
    
    clone.setAttribute("data-x", newX);
    clone.setAttribute("data-y", newY);
    clone.style.transform = `translate(${newX}px, ${newY}px)`;
    
    canvas.appendChild(clone);
  }
}

// === ZOOM CONTROL ===
let currentZoom = 1;

// Zoom slider
document.getElementById("zoom-slider").addEventListener("input", (e) => {
  const zoomPercent = parseFloat(e.target.value);
  currentZoom = zoomPercent / 100;
  const canvas = document.getElementById("paper-viewport");
  canvas.style.transform = `scale(${currentZoom})`;
  document.getElementById("zoom-value").textContent = zoomPercent + "%";
});

// Zoom con mouse wheel - registrar en múltiples elementos para asegurar capture
const wheelZoomHandler = (e) => {
  e.preventDefault();
  const zoomSlider = document.getElementById("zoom-slider");
  const currentValue = parseInt(zoomSlider.value);
  const delta = e.deltaY > 0 ? -10 : 10;
  const newValue = Math.max(50, Math.min(300, currentValue + delta));
  zoomSlider.value = newValue;
  zoomSlider.dispatchEvent(new Event("input"));
};

document.getElementById("paper-viewport").addEventListener("wheel", wheelZoomHandler, { passive: false });
document.querySelector(".canvas-area").addEventListener("wheel", wheelZoomHandler, { passive: false });

// === TRANSFORM SYSTEM (from transformationcontrols2.html) ===
class TechnicalTransformer {
  constructor(el, manager) {
    this.el = el; // .draggable-element
    this.manager = manager;
    this.pivotEl = document.getElementById('pivot-point');

    // create handles if missing
    if (!this.el.querySelector('.transform-handle')) {
      const dirs = ['nw','n','ne','e','se','s','sw','w'];
      dirs.forEach(d => {
        const h = document.createElement('div');
        h.className = `transform-handle h-${d}`;
        h.setAttribute('data-dir', d);
        this.el.appendChild(h);
      });
      // rotation handle and line
      const rot = document.createElement('div');
      rot.className = 'transform-handle h-rot';
      rot.setAttribute('data-dir','rot');
      this.el.appendChild(rot);
      const rotLine = document.createElement('div');
      rotLine.className = 'h-rot-line';
      this.el.appendChild(rotLine);
    }

    // initial state from element attributes
    const startX = parseFloat(this.el.getAttribute('data-x')) || (50 + Math.random()*200);
    const startY = parseFloat(this.el.getAttribute('data-y')) || (50 + Math.random()*200);
    const w = parseFloat(this.el.style.width) || (this.el.querySelector('img') ? this.el.querySelector('img').naturalWidth || 140 : 200);
    const h = parseFloat(this.el.style.height) || (this.el.querySelector('img') ? this.el.querySelector('img').naturalHeight || 140 : 40);

    this.state = { x: startX, y: startY, w: w, h: h, angle: 0, pivotLocal: { x: 0.5, y: 0.5 } };

    this.init();
  }

  init() {
    this.el.querySelectorAll('.transform-handle').forEach(h => {
      h.addEventListener('mousedown', e => {
        if (!this.manager.selection.has(this)) return;
        if (e.altKey) {
          this.setPivotFromHandle(h.dataset.dir);
        } else {
          this.manager.onStart(e, h.dataset.dir);
        }
      });
    });

    const content = this.el.querySelector('.text-block') || this.el.querySelector('img') || this.el.querySelector('.content') || this.el;
    content.addEventListener('mousedown', e => {
      if (e.target.getAttribute && e.target.getAttribute('contenteditable') === 'true' && document.activeElement === e.target) return;

      if (e.ctrlKey || e.metaKey) {
        this.manager.toggleSelection(this);
      } else if (!this.manager.selection.has(this)) {
        this.manager.clearSelection();
        this.manager.toggleSelection(this);
      }
      this.manager.onStart(e, 'move');
    });

    this.render();
  }

  setPivotFromHandle(dir) {
    const map = { nw:[0,0], n:[0.5,0], ne:[1,0], e:[1,0.5], se:[1,1], s:[0.5,1], sw:[0,1], w:[0,0.5], rot:[0.5,0.5] };
    const [px,py] = map[dir] || [0.5,0.5];
    this.state.pivotLocal = { x:px, y:py };
    this.render();
  }

  getGlobalPoint(lx, ly) {
    const rad = this.state.angle * Math.PI / 180;
    const cos = Math.cos(rad), sin = Math.sin(rad);
    return {
      x: this.state.x + (lx * this.state.w * cos - ly * this.state.h * sin),
      y: this.state.y + (lx * this.state.w * sin + ly * this.state.h * cos)
    };
  }

  render() {
    const { x,y,w,h,angle } = this.state;
    this.el.style.width = `${w}px`;
    this.el.style.height = `${h}px`;
    this.el.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`;
    this.updateCursors();
  }

  updateCursors() {
    const a = ((this.state.angle % 360) + 360) % 360;
    const hList = ['n','ne','e','se','s','sw','w','nw'];
    const rCursors = ['ns-resize','nesw-resize','ew-resize','nwse-resize'];
    hList.forEach((h,i)=>{
      const el = this.el.querySelector(`[data-dir="${h}"]`);
      if (el) {
        const idx = Math.round((i*45 + a)/45) % 8;
        el.style.cursor = rCursors[idx % 4];
      }
    });
  }
}

class TransformManager {
  constructor() {
    this.items = [];
    this.selection = new Set();
    this.isDragging = false;
    this.keys = { shift:false, ctrl:false };
    this.pivotEl = document.getElementById('pivot-point');
    this.init();
  }

  init() {
    // register existing draggable elements
    document.querySelectorAll('.draggable-element').forEach(el => {
      const t = new TechnicalTransformer(el, this);
      this.items.push(t);
    });

    window.addEventListener('mousemove', e => this.onMove(e));
    window.addEventListener('mouseup', () => this.isDragging = false);
    window.addEventListener('keydown', e => { this.keys.shift = e.shiftKey; this.keys.ctrl = e.ctrlKey || e.metaKey; });
    window.addEventListener('keyup', e => { this.keys.shift = e.shiftKey; this.keys.ctrl = e.ctrlKey || e.metaKey; });

    this.pivotEl.addEventListener('dblclick', () => {
      this.selection.forEach(item => { item.state.pivotLocal = { x:0.5,y:0.5 }; item.render(); });
      this.updatePivotUI();
    });

    // clear selection on background click
    document.getElementById('paper-viewport').addEventListener('mousedown', e => {
      if (e.target.id === 'paper-viewport') this.clearSelection();
    });
  }

  // register a newly created element for transformation
  register(el) {
    const existing = this.items.find(i => i.el === el);
    if (existing) return existing;
    const t = new TechnicalTransformer(el, this);
    this.items.push(t);
    // Apply any flip state present on the element (so newly registered elements render flipped images)
    try { updateFlipOnElement(el); } catch (e) { /* ignore if helper missing */ }
    return t;
  }

  toggleSelection(item) {
    if (this.selection.has(item)) { this.selection.delete(item); item.el.classList.remove('active'); }
    else { this.selection.add(item); item.el.classList.add('active'); }
    this.updatePivotUI();

    // ensure context toolbar reflects the active selection when single
    if (this.selection.size === 1) {
      const single = this.selection.values().next().value;
      // update global selected element and show context toolbar
      try { currentSelectedElement = single.el; showContextToolbar(single.el); } catch (e) { /* ignore */ }
    } else if (this.selection.size === 0) {
      try { hideContextToolbar(); } catch (e) { /* ignore */ }
    }
  }

  clearSelection() {
    this.selection.forEach(item => item.el.classList.remove('active'));
    this.selection.clear();
    this.updatePivotUI();
  }

  updatePivotUI() {
    if (this.selection.size === 0) { this.pivotEl.classList.remove('visible'); return; }
    this.pivotEl.classList.add('visible');
    let gPivot;
    if (this.selection.size === 1) {
      const it = this.selection.values().next().value;
      gPivot = it.getGlobalPoint(it.state.pivotLocal.x, it.state.pivotLocal.y);
    } else {
      let tx=0, ty=0;
      this.selection.forEach(it => { const p = it.getGlobalPoint(it.state.pivotLocal.x, it.state.pivotLocal.y); tx+=p.x; ty+=p.y; });
      gPivot = { x: tx/this.selection.size, y: ty/this.selection.size };
    }
    // store last pivot in local canvas coordinates for interaction math
    // store pivot in local canvas coords
    this.lastPivotLocal = { x: gPivot.x, y: gPivot.y };
    // compensate for canvas padding (paper-viewport uses padding which shifts child coordinates)
    const canvas = document.getElementById('paper-viewport');
    const cs = window.getComputedStyle(canvas);
    const padLeft = parseFloat(cs.paddingLeft) || 0;
    const padTop = parseFloat(cs.paddingTop) || 0;
    this.pivotEl.style.left = (gPivot.x + padLeft) + 'px';
    this.pivotEl.style.top = (gPivot.y + padTop) + 'px';
  }

  onStart(e, handleType) {
    e.stopPropagation(); if (handleType !== 'move') e.preventDefault();
    this.isDragging = true;
    this.handle = handleType;
    this.dragType = handleType === 'rot' ? 'rotate' : (handleType === 'move' ? 'move' : 'resize');

    // Work in local canvas coordinates to account for CSS scale/zoom and page offsets
    const canvas = document.getElementById('paper-viewport');
    const canvasRect = canvas.getBoundingClientRect();
    const scale = (typeof currentZoom === 'number' && currentZoom > 0) ? currentZoom : 1;

    this.canvasRect = canvasRect;
    this.scale = scale;

    // anchor in local coordinates (pivot position inside canvas)
    const anchorLocal = this.lastPivotLocal || { x: 0, y: 0 };
    this.anchorLocal = anchorLocal;

    // mouse start in local coordinates
    this.mouseStartLocal = { x: (e.clientX - canvasRect.left) / scale, y: (e.clientY - canvasRect.top) / scale };

    this.snapStates = new Map();
    this.selection.forEach(it => { this.snapStates.set(it, { ...it.state }); });
    if (this.dragType === 'rotate') {
      this.initialMouseAngle = Math.atan2(this.mouseStartLocal.y - anchorLocal.y, this.mouseStartLocal.x - anchorLocal.x) * 180 / Math.PI;
    }
  }

  onMove(e) {
    if (!this.isDragging) return;

    // current mouse in local coords
    const canvasRect = this.canvasRect || document.getElementById('paper-viewport').getBoundingClientRect();
    const scale = this.scale || ((typeof currentZoom === 'number' && currentZoom > 0) ? currentZoom : 1);
    const mouseLocal = { x: (e.clientX - canvasRect.left) / scale, y: (e.clientY - canvasRect.top) / scale };

    this.selection.forEach(it => {
      const snap = this.snapStates.get(it);
      if (this.dragType === 'move') {
        it.state.x = snap.x + (mouseLocal.x - this.mouseStartLocal.x);
        it.state.y = snap.y + (mouseLocal.y - this.mouseStartLocal.y);
      } else if (this.dragType === 'rotate') {
        const currentMouseAngle = Math.atan2(mouseLocal.y - this.anchorLocal.y, mouseLocal.x - this.anchorLocal.x) * 180 / Math.PI;
        const deltaAngle = currentMouseAngle - this.initialMouseAngle;
        it.state.angle = snap.angle + deltaAngle;
        const rad = deltaAngle * Math.PI / 180; const cos = Math.cos(rad), sin = Math.sin(rad);
        const rx = snap.x - this.anchorLocal.x; const ry = snap.y - this.anchorLocal.y;
        it.state.x = this.anchorLocal.x + (rx * cos - ry * sin);
        it.state.y = this.anchorLocal.y + (rx * sin + ry * cos);
      } else if (this.dragType === 'resize') {
        // convert mouse local to page coords expected by applyResize (we'll adapt by passing local coords scaled)
        const pageX = canvasRect.left + mouseLocal.x * scale;
        const pageY = canvasRect.top + mouseLocal.y * scale;
        this.applyResize(it, snap, pageX, pageY);
      }
      it.render();
    });
    this.updatePivotUI();
  }

  applyResize(it, snap, mx, my) {
    // mx,my may be page coordinates; convert to local canvas coordinates
    const canvasRect = this.canvasRect || document.getElementById('paper-viewport').getBoundingClientRect();
    const scale = this.scale || ((typeof currentZoom === 'number' && currentZoom > 0) ? currentZoom : 1);
    const mxLocal = (mx - canvasRect.left) / scale;
    const myLocal = (my - canvasRect.top) / scale;
    const dx = mxLocal - this.mouseStartLocal.x; const dy = myLocal - this.mouseStartLocal.y;
    const rad = -snap.angle * Math.PI / 180;
    const lx = dx * Math.cos(rad) - dy * Math.sin(rad);
    const ly = dx * Math.sin(rad) + dy * Math.cos(rad);
    const h = this.handle;
    const sx = h.includes('e') ? 1 : (h.includes('w') ? -1 : 0);
    const sy = h.includes('s') ? 1 : (h.includes('n') ? -1 : 0);
    const distXP = h.includes('e') ? (1 - it.state.pivotLocal.x) : (h.includes('w') ? it.state.pivotLocal.x : 0);
    const distYP = h.includes('s') ? (1 - it.state.pivotLocal.y) : (h.includes('n') ? it.state.pivotLocal.y : 0);
    let dw = distXP > 0 ? (lx * sx / distXP) : 0;
    let dh = distYP > 0 ? (ly * sy / distYP) : 0;
    if (!this.keys.shift && h.length === 2) {
      const ratio = snap.w / snap.h;
      if (Math.abs(dw) > Math.abs(dh * ratio)) dh = dw / ratio; else dw = dh * ratio;
    }
    const nw = Math.max(10, snap.w + dw); const nh = Math.max(10, snap.h + dh);
    it.state.w = nw; it.state.h = nh;
    const nRad = it.state.angle * Math.PI / 180;
    const anchor = it.getGlobalPoint(it.state.pivotLocal.x, it.state.pivotLocal.y);
    it.state.x = anchor.x - (it.state.pivotLocal.x * nw * Math.cos(nRad) - it.state.pivotLocal.y * nh * Math.sin(nRad));
    it.state.y = anchor.y - (it.state.pivotLocal.x * nw * Math.sin(nRad) + it.state.pivotLocal.y * nh * Math.cos(nRad));
  }
}

// create a global manager instance and expose it
window.TRANSFORM_MANAGER = new TransformManager();
