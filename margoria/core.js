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

document.addEventListener("pointermove", (e) => {
  lastMousePos = { x: e.pageX, y: e.pageY };
});

function getCanvasMetrics() {
  const canvas = document.getElementById("paper-viewport");
  if (!canvas) return { width: 0, height: 0, padX: 0, padY: 0 };
  const styles = window.getComputedStyle(canvas);
  const padX = parseFloat(styles.paddingLeft) || 0;
  const padY = parseFloat(styles.paddingTop) || 0;
  return { width: canvas.clientWidth, height: canvas.clientHeight, padX, padY };
}

function addToCanvas(src, type) {
  const canvas = document.getElementById("paper-viewport");
  if (!canvas) return;
  
  const el = document.createElement("div");
  el.className = "draggable-element";
  el.style.zIndex = String(nextZIndex++);
  el.setAttribute("data-type", type);

  if (type === "text") {
    el.innerHTML = `<div contenteditable="true" class="text-block pfeffermediaeval" spellcheck="false" style="outline: 2px dashed var(--accent-color); padding: 8px; white-space: pre-wrap; word-wrap: break-word; min-height: 20px;" data-placeholder="Type here...">Type here...</div>`;
    el.style.width = "200px";
    el.style.height = "auto";
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
      // Hide text toolbar with a slight delay to allow toolbar button clicks
      setTimeout(() => {
        const textToolbar = document.getElementById("text-toolbar");
        const active = document.activeElement;
        if (textToolbar && !textToolbar.contains(active)) {
          textToolbar.classList.remove("visible");
        }
      }, 100);
    });
    
    textBlock.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
    });
  } else if (type === "border") {
    el.innerHTML = `<img src="${src}" style="width:100%; height:auto; display: block;" draggable="false" onerror="this.style.border='2px solid red'"/>`;
    el.style.width = "260px";
  } else {
    el.innerHTML = `<img src="${src}" style="width:100%; height:auto; display: block;" draggable="false" onerror="this.style.border='2px solid red'"/>`;
  }

  el.addEventListener("pointerdown", (ev) => {
    ev.stopPropagation();
    selectElement(el);
  });
  
  // Centrar elemento nuevo en el canvas
  const { width, height, padX, padY } = getCanvasMetrics();
  const ELEMENT_SIZE = 140;
  const elementWidth = parseFloat(el.style.width) || ELEMENT_SIZE;
  const elementHeight = parseFloat(el.style.height) || ELEMENT_SIZE;

  const maxWidth = Math.max(0, width - (padX * 2));
  const maxHeight = Math.max(0, height - (padY * 2));

  let x = (width / 2) - (elementWidth / 2);
  let y = (height / 2) - (elementHeight / 2);

  x = Math.max(padX, Math.min(x, padX + maxWidth - elementWidth));
  y = Math.max(padY, Math.min(y, padY + maxHeight - elementHeight));
  
  // NO usar left/top, solo transform
  el.style.left = "0px";
  el.style.top = "0px";
  el.setAttribute("data-x", x);
  el.setAttribute("data-y", y);
  el.style.transform = `translate(${x}px, ${y}px)`;
  
  canvas.appendChild(el);
  selectElement(el);

  // If this is a text element, focus its contenteditable and place caret at end
  if (type === 'text') {
    const tb = el.querySelector('.text-block');
    if (tb) {
      // small timeout to ensure element is in document
      setTimeout(() => {
        tb.focus();
        // place caret at end
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(tb);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }, 30);
    }
  }
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
    if (!tf) {
      tf = mgr.register(el);
    }
    if (tf) {
      // clear previous and select this transformer
      mgr.clearSelection();
      mgr.toggleSelection(tf);
    }
  }

  // If selected element contains a text-block, focus it and place caret at end
  try {
    const tb = el.querySelector && el.querySelector('.text-block');
    if (tb) {
      setTimeout(() => {
        tb.focus();
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(tb);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }, 10);
    }
  } catch (err) { /* ignore if not focusable */ }
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

function clearSelectionState() {
  document.querySelectorAll(".draggable-element").forEach((el) => el.classList.remove("selected"));
  if (window.TRANSFORM_MANAGER) {
    window.TRANSFORM_MANAGER.clearSelection();
  }
  hideContextToolbar();
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
    
    // Limpiar handles primero
    clone.querySelectorAll('.transform-handle, .h-rot-line').forEach(h => h.remove());
    
    // Re-agregar el listener de mousedown que se pierde al clonar
    clone.addEventListener("pointerdown", (ev) => {
        ev.stopPropagation();
        selectElement(clone);
    });

    const origX = parseFloat(currentSelectedElement.getAttribute("data-x")) || 0;
    const origY = parseFloat(currentSelectedElement.getAttribute("data-y")) || 0;
    const origW = parseFloat(currentSelectedElement.style.width) || 140;
    const origH = parseFloat(currentSelectedElement.style.height) || 140;
    
    const metrics = getCanvasMetrics();
    const MARGINS_X = metrics.padX;
    const MARGINS_Y = metrics.padY;
    const MAX_WIDTH = Math.max(0, metrics.width - (MARGINS_X * 2));
    const MAX_HEIGHT = Math.max(0, metrics.height - (MARGINS_Y * 2));
    const OFFSET_STEP = 20;
    
    // Buscar posición sin solapamiento
    let newX = origX;
    let newY = origY;
    let foundPosition = false;
    
    // Intentar offset a la derecha y abajo en incrementos
    for (let attempt = 1; attempt <= 10; attempt++) {
        const testX = origX + (OFFSET_STEP * attempt);
        const testY = origY + (OFFSET_STEP * attempt);
        
        // Verificar que está dentro de los márgenes
        if (testX + origW <= MARGINS_X + MAX_WIDTH && testY + origH <= MARGINS_Y + MAX_HEIGHT) {
            // Verificar que no se solapa con otros elementos
            let overlaps = false;
            document.querySelectorAll(".draggable-element").forEach(el => {
                if (el === currentSelectedElement) return;
                const elX = parseFloat(el.getAttribute("data-x")) || 0;
                const elY = parseFloat(el.getAttribute("data-y")) || 0;
                const elW = parseFloat(el.style.width) || 140;
                const elH = parseFloat(el.style.height) || 140;
                
                // Comprobar colisión
                if (testX < elX + elW && testX + origW > elX &&
                    testY < elY + elH && testY + origH > elY) {
                    overlaps = true;
                }
            });
            
            if (!overlaps) {
                newX = testX;
                newY = testY;
                foundPosition = true;
                break;
            }
        }
    }
    
    // Si no encuentra posición sin solapar, usar offset simple con restricciones
    if (!foundPosition) {
        newX = Math.max(MARGINS_X, Math.min(origX + 30, MARGINS_X + MAX_WIDTH - origW));
        newY = Math.max(MARGINS_Y, Math.min(origY + 30, MARGINS_Y + MAX_HEIGHT - origH));
    }
    
    clone.setAttribute("data-x", newX);
    clone.setAttribute("data-y", newY);
    clone.style.transform = `translate(${newX}px, ${newY}px)`;
    
    // Preservar flip state si existe
    if (currentSelectedElement.dataset.flipX) clone.dataset.flipX = currentSelectedElement.dataset.flipX;
    if (currentSelectedElement.dataset.flipY) clone.dataset.flipY = currentSelectedElement.dataset.flipY;
    
    clone.style.zIndex = String(++nextZIndex);
    
    const canvas = document.getElementById("paper-viewport");
    canvas.appendChild(clone);
    // Preserve rotation: try to read angle from existing transformer
    let preservedAngle = 0;
    try {
      if (window.TRANSFORM_MANAGER) {
        const mgr = window.TRANSFORM_MANAGER;
        const oldTf = mgr.items.find(i => i.el === currentSelectedElement);
        if (oldTf && typeof oldTf.state.angle === 'number') preservedAngle = oldTf.state.angle;
      }
    } catch (e) { /* ignore */ }

    // Apply selection and then copy authoritative transform state from original
    selectElement(clone);
    try {
      if (window.TRANSFORM_MANAGER) {
        const mgr = window.TRANSFORM_MANAGER;
        const newTf = mgr.items.find(i => i.el === clone) || mgr.register(clone);
        const oldTf = mgr.items.find(i => i.el === currentSelectedElement) || null;
        if (newTf) {
          // Prefer copying full state from the original transformer when available
          if (oldTf && oldTf.state) {
            newTf.state.angle = typeof oldTf.state.angle === 'number' ? oldTf.state.angle : preservedAngle;
            newTf.state.w = typeof oldTf.state.w === 'number' ? oldTf.state.w : (parseFloat(clone.style.width) || newTf.state.w);
            newTf.state.h = typeof oldTf.state.h === 'number' ? oldTf.state.h : (parseFloat(clone.style.height) || newTf.state.h);
            newTf.state.pivotLocal = oldTf.state.pivotLocal ? { ...oldTf.state.pivotLocal } : newTf.state.pivotLocal;
          } else {
            // Fallback: set what we can
            newTf.state.angle = preservedAngle;
            newTf.state.w = parseFloat(clone.style.width) || newTf.state.w;
            newTf.state.h = parseFloat(clone.style.height) || newTf.state.h;
          }

          // Ensure position matches computed placement
          newTf.state.x = newX;
          newTf.state.y = newY;
          newTf.render();
        }
      }
    } catch (e) { /* ignore */ }
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

  // === RESPONSIVE SIDEBAR TOGGLES ===
  // Mostrar botones toggle en móvil
  const checkMobile = () => {
    const isMobile = window.innerWidth <= 1100;
    document.getElementById("btn-toggle-left-panel").style.display = isMobile ? "inline-flex" : "none";
    document.getElementById("btn-toggle-right-panel").style.display = isMobile ? "inline-flex" : "none";
  };
  
  checkMobile();
  window.addEventListener("resize", checkMobile);
  
  // Toggle left sidebar
  document.getElementById("btn-toggle-left-panel").addEventListener("click", () => {
    const sidebar = document.querySelector("aside.sidebar:not(.sidebar-right)");
    sidebar.classList.toggle("visible");
    // Cerrar right panel si está abierto
    document.querySelector("aside.sidebar-right").classList.remove("visible");
  });
  
  // Toggle right sidebar
  document.getElementById("btn-toggle-right-panel").addEventListener("click", () => {
    const sidebar = document.querySelector("aside.sidebar-right");
    sidebar.classList.toggle("visible");
    // Cerrar left panel si está abierto
    document.querySelector("aside.sidebar:not(.sidebar-right)").classList.remove("visible");
  });
  
  // Cerrar sidebars al hacer clic en el canvas
  document.getElementById("paper-viewport").addEventListener("pointerdown", () => {
    document.querySelector("aside.sidebar:not(.sidebar-right)").classList.remove("visible");
    document.querySelector("aside.sidebar-right").classList.remove("visible");
  });

  // Delete - borrar elemento seleccionado. Backspace is reserved for text editing.
  document.addEventListener("keydown", (e) => {
    const active = document.activeElement;
    const isEditing = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);

    if (e.key === "Delete") {
      if (currentSelectedElement) {
        e.preventDefault();
        currentSelectedElement.remove();
        clearSelectionState();
      }
    } else if (e.key === "Backspace") {
      // Allow normal backspace when editing text; otherwise prevent accidental deletion/navigation
      if (isEditing) return; // let focused editable handle it
      e.preventDefault();
    }
  });

  // Deseleccionar al hacer clic en fondo (solo clic izquierdo)
  document.getElementById("paper-viewport").addEventListener("pointerdown", (e) => {
    // Solo deseleccionar si es clic izquierdo en el fondo (no en el toolbar)
    if (e.button === 0 && !e.target.closest(".text-toolbar")) {
      clearSelectionState();
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
    clearSelectionState();
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
  document.getElementById("paper-viewport").addEventListener("pointerdown", (e) => {
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
      clearSelectionState();
    }
  });


  // === PANNING CON CLIC DERECHO / BOTÓN CENTRAL ===
  const canvasArea = document.querySelector(".canvas-area");
  let panPointerId = null;
  
  canvasArea.addEventListener("pointerdown", (e) => {
    const isMousePan = e.pointerType === 'mouse' && (e.button === 2 || e.button === 1);
    const isTouchPan = e.pointerType === 'touch' && e.target === document.getElementById("paper-viewport");
    if (isMousePan || isTouchPan) {
      isPanning = true;
      panPointerId = e.pointerId;
      panStartX = e.clientX;
      panStartY = e.clientY;
      panStartScrollX = canvasArea.scrollLeft;
      panStartScrollY = canvasArea.scrollTop;
      canvasArea.style.cursor = "grabbing";
      e.preventDefault();
      if (canvasArea.setPointerCapture) {
        try { canvasArea.setPointerCapture(panPointerId); } catch (err) { /* ignore */ }
      }
    }
  });

  document.addEventListener("pointermove", (e) => {
    if (isPanning && canvasArea && (panPointerId === null || e.pointerId === panPointerId)) {
      const deltaX = e.clientX - panStartX;
      const deltaY = e.clientY - panStartY;
      canvasArea.scrollLeft = panStartScrollX - deltaX;
      canvasArea.scrollTop = panStartScrollY - deltaY;
    }
  });

  const stopPan = (e) => {
    if (isPanning && (panPointerId === null || e.pointerId === panPointerId)) {
      isPanning = false;
      panPointerId = null;
      canvasArea.style.cursor = "auto";
      if (canvasArea.releasePointerCapture) {
        try { canvasArea.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      }
    }
  };

  document.addEventListener("pointerup", stopPan);
  document.addEventListener("pointercancel", stopPan);

  // Prevenir context menu durante panning
  canvasArea.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });

  // === TEXT TOOLBAR HANDLERS ===
  // Prevent deselection cuando se interactúa con la text toolbar
  const textToolbar = document.getElementById("text-toolbar");
  textToolbar.addEventListener("click", (e) => {
    e.stopPropagation();
  });
  textToolbar.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
  });

  const contextToolbar = document.getElementById("context-toolbar");
  contextToolbar.addEventListener("pointerdown", (e) => {
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
    clearSelectionState();
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
  const metrics = getCanvasMetrics();
  const MARGINS_X = metrics.padX;
  const MARGINS_Y = metrics.padY;
  const MAX_WIDTH = Math.max(0, metrics.width - (MARGINS_X * 2));
  const MAX_HEIGHT = Math.max(0, metrics.height - (MARGINS_Y * 2));
  // Small overlap in pixels will be computed per-piece (based on previous piece size)
  let OVERLAP = Math.min(12, Math.round(Math.min(width, height) * 0.06));

  // Place clones by continuing from the previous piece's actual transform
  let prevEl = el;
  for (let i = 1; i < times; i++) {
    const clone = prevEl.cloneNode(true);

    // Limpiar handles del clon (para que se regeneren)
    clone.querySelectorAll('.transform-handle, .h-rot-line').forEach(h => h.remove());

    clone.style.zIndex = String(++nextZIndex);

    // Attempt to use TRANSFORM_MANAGER to get accurate previous transform
    let prevTf = null;
    if (window.TRANSFORM_MANAGER) {
      prevTf = window.TRANSFORM_MANAGER.items.find(it => it.el === prevEl) || null;
    }

    // Determine previous piece size and angle
    let prevW = width;
    let prevH = height;
    let prevAngle = 0;
    let prevEnd = null; // in canvas-local coords

    if (prevTf) {
      prevW = prevTf.state.w || prevW;
      prevH = prevTf.state.h || prevH;
      prevAngle = prevTf.state.angle || 0;
      // endpoint: right-middle for horizontal, bottom-middle for vertical
      if (direction === 'horizontal') prevEnd = prevTf.getGlobalPoint(1, 0.5);
      else prevEnd = prevTf.getGlobalPoint(0.5, 1);
    } else {
      // fallback: compute from DOM bounding rect (may be page coords)
      const pImg = prevEl.querySelector('img');
      if (pImg) {
        const r = pImg.getBoundingClientRect();
        // approximate local canvas coords using element data-x/data-y
        const px = parseFloat(prevEl.getAttribute('data-x')) || 0;
        const py = parseFloat(prevEl.getAttribute('data-y')) || 0;
        if (direction === 'horizontal') prevEnd = { x: px + prevW, y: py + prevH/2 };
        else prevEnd = { x: px + prevW/2, y: py + prevH };
      } else {
        prevEnd = { x: x + width, y: y + height/2 };
      }
    }
    // Recompute overlap based on prior piece size so units match
    OVERLAP = Math.min(12, Math.round(Math.min(prevW, prevH) * 0.06));

    // Compute placement for the new clone so it continues seamlessly
    const theta = (prevAngle || 0) * Math.PI / 180;
    const cos = Math.cos(theta), sin = Math.sin(theta);
    // unit vector along local +X in global coords
    const ux = cos, uy = sin;

    // shift endpoint back by overlap along the direction of the piece
    const shiftX = ux * OVERLAP;
    const shiftY = uy * OVERLAP;
    const P = { x: prevEnd.x - shiftX, y: prevEnd.y - shiftY };

    // For horizontal: align clone's left-middle (local 0,0.5) to P
    // For vertical: align clone's top-middle (local 0.5,0) to P
    let newX, newY;
    if (direction === 'horizontal') {
      // state.x = P.x + 0.5 * h * sin
      newX = P.x + 0.5 * prevH * sin;
      // state.y = P.y - 0.5 * h * cos
      newY = P.y - 0.5 * prevH * cos;
    } else {
      // state.x = P.x - 0.5 * w * cos
      newX = P.x - 0.5 * prevW * cos;
      // state.y = P.y - 0.5 * w * sin
      newY = P.y - 0.5 * prevW * sin;
    }

    // Ensure clone stays inside canvas bounds
    newX = Math.max(MARGINS_X, Math.min(newX, MARGINS_X + MAX_WIDTH - prevW));
    newY = Math.max(MARGINS_Y, Math.min(newY, MARGINS_Y + MAX_HEIGHT - prevH));

    // Apply size and rotation to clone so it visually matches the chain
    clone.style.width = prevW + 'px';
    clone.style.height = prevH + 'px';
    clone.setAttribute('data-x', newX);
    clone.setAttribute('data-y', newY);
    clone.style.transform = `translate(${newX}px, ${newY}px) rotate(${prevAngle}deg)`;

    // Re-agregar listener de mousedown
    clone.addEventListener('pointerdown', (ev) => { ev.stopPropagation(); selectElement(clone); });

    canvas.appendChild(clone);

    // Register the clone with the TransformManager so future pieces can reference it
    if (window.TRANSFORM_MANAGER) {
      try {
        const mgr = window.TRANSFORM_MANAGER;
        const newTf = mgr.register(clone);
        if (newTf) {
          // Copy authoritative state into the new transformer
          newTf.state.angle = prevAngle;
          newTf.state.w = prevW;
          newTf.state.h = prevH;
          newTf.state.x = newX;
          newTf.state.y = newY;
          // copy pivot from previous if available
          if (prevTf && prevTf.state && prevTf.state.pivotLocal) newTf.state.pivotLocal = { ...prevTf.state.pivotLocal };
          newTf.render();
        }
      } catch (e) { /* ignore registration errors */ }
    }

    // next iteration will continue from this clone
    prevEl = clone;
  }
}

// === ZOOM CONTROL ===
let currentZoom = 1;
window.currentZoom = currentZoom;

// Zoom slider
document.getElementById("zoom-slider").addEventListener("input", (e) => {
  const zoomPercent = parseFloat(e.target.value);
  currentZoom = zoomPercent / 100;
  window.currentZoom = currentZoom;
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

// === TRANSFORM SYSTEM - Loaded from handles.js ===
// See handles.js for TechnicalTransformer, TransformManager classes
