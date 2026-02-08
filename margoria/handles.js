// ===== HANDLES & TRANSFORM SYSTEM =====
// Modular drag-and-drop, rotation, resize with pivot support

/**
 * TechnicalTransformer
 * Manages individual element transformation (move, rotate, resize)
 * Handles creation and management of transform handles
 */
class TechnicalTransformer {
  constructor(el, manager) {
    this.el = el;
    this.manager = manager;
    this.pivotEl = document.getElementById('pivot-point');

    // Create handles if missing
    if (!this.el.querySelector('.transform-handle')) {
      this._createHandles();
    }

    // Initialize state from element attributes
    const startX = parseFloat(this.el.getAttribute('data-x')) || (50 + Math.random()*200);
    const startY = parseFloat(this.el.getAttribute('data-y')) || (50 + Math.random()*200);
    const w = parseFloat(this.el.style.width) || (this.el.querySelector('img') ? this.el.querySelector('img').naturalWidth || 140 : 200);
    const h = parseFloat(this.el.style.height) || (this.el.querySelector('img') ? this.el.querySelector('img').naturalHeight || 140 : 40);

    this.state = { 
      x: startX, 
      y: startY, 
      w: w, 
      h: h, 
      angle: 0, 
      pivotLocal: { x: 0.5, y: 0.5 } 
    };

    this.init();
  }

  _createHandles() {
    // Create resize handles (8 directions)
    const dirs = ['nw','n','ne','e','se','s','sw','w'];
    dirs.forEach(d => {
      const h = document.createElement('div');
      h.className = `transform-handle h-${d}`;
      h.setAttribute('data-dir', d);
      this.el.appendChild(h);
    });

    // Create rotation handle
    const rot = document.createElement('div');
    rot.className = 'transform-handle h-rot';
    rot.setAttribute('data-dir','rot');
    this.el.appendChild(rot);

    // Create rotation line indicator
    const rotLine = document.createElement('div');
    rotLine.className = 'h-rot-line';
    this.el.appendChild(rotLine);
  }

  init() {
    // Setup handle event listeners
    this.el.querySelectorAll('.transform-handle').forEach(h => {
      h.addEventListener('pointerdown', e => {
        if (!this.manager.selection.has(this)) return;
        if (e.altKey) {
          this.setPivotFromHandle(h.dataset.dir);
        } else {
          this.manager.onStart(e, h.dataset.dir);
        }
      });
    });

    // Setup content element for move/selection
    const content = this.el.querySelector('.text-block') || 
                   this.el.querySelector('img') || 
                   this.el.querySelector('.content') || 
                   this.el;

    content.addEventListener('pointerdown', e => {
      // Don't interfere with text editing
      if (e.target.getAttribute && 
          e.target.getAttribute('contenteditable') === 'true' && 
          document.activeElement === e.target) return;

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

  /**
   * Set pivot point based on handle position
   * @param {string} dir - Direction code (nw, n, ne, e, se, s, sw, w, rot)
   */
  setPivotFromHandle(dir) {
    const map = { 
      nw:[0,0], n:[0.5,0], ne:[1,0], e:[1,0.5], 
      se:[1,1], s:[0.5,1], sw:[0,1], w:[0,0.5], 
      rot:[0.5,0.5] 
    };
    const [px, py] = map[dir] || [0.5, 0.5];
    this.state.pivotLocal = { x: px, y: py };
    this.render();
  }

  /**
   * Convert local coordinates to global (accounting for rotation)
   * @param {number} lx - Local X (0-1)
   * @param {number} ly - Local Y (0-1)
   * @returns {object} Global point {x, y}
   */
  getGlobalPoint(lx, ly) {
    const rad = this.state.angle * Math.PI / 180;
    const cos = Math.cos(rad), sin = Math.sin(rad);
    return {
      x: this.state.x + (lx * this.state.w * cos - ly * this.state.h * sin),
      y: this.state.y + (lx * this.state.w * sin + ly * this.state.h * cos)
    };
  }

  /**
   * Render element with current state
   */
  render() {
    const { x, y, w, h, angle } = this.state;
    this.el.style.width = `${w}px`;
    this.el.style.height = `${h}px`;
    this.el.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`;
    this.updateCursors();
  }

  /**
   * Update cursor rotation based on element angle
   */
  updateCursors() {
    const a = ((this.state.angle % 360) + 360) % 360;
    const hList = ['n','ne','e','se','s','sw','w','nw'];
    const rCursors = ['ns-resize','nesw-resize','ew-resize','nwse-resize'];
    
    hList.forEach((h, i) => {
      const el = this.el.querySelector(`[data-dir="${h}"]`);
      if (el) {
        const idx = Math.round((i*45 + a)/45) % 8;
        el.style.cursor = rCursors[idx % 4];
      }
    });
  }
}

/**
 * TransformManager
 * Orchestrates all element transformations
 * Manages selection, handles multi-element operations
 */
class TransformManager {
  constructor() {
    this.items = [];
    this.selection = new Set();
    this.isDragging = false;
    this.keys = { shift: false, ctrl: false };
    this.pivotEl = document.getElementById('pivot-point');
    this.init();
  }

  init() {
    // Register existing draggable elements
    document.querySelectorAll('.draggable-element').forEach(el => {
      const t = new TechnicalTransformer(el, this);
      this.items.push(t);
    });

    // Setup global event listeners
    window.addEventListener('pointermove', e => this.onMove(e));
    window.addEventListener('pointerup', e => this.onEnd(e));
    window.addEventListener('pointercancel', e => this.onEnd(e));
    
    window.addEventListener('keydown', e => {
      // Track modifier keys
      this.keys.shift = e.shiftKey;
      this.keys.ctrl = e.ctrlKey || e.metaKey;

      // Backspace should not delete canvas elements; only Delete key removes selection.
      const active = document.activeElement;
      const isEditing = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);

      if (e.key === 'Delete' || e.key === 'Del') {
        // Remove all selected elements
        this.selection.forEach(it => {
          try { it.el.remove(); } catch (err) { /* ignore */ }
        });
        this.clearSelection();
      } else if (e.key === 'Backspace') {
        // If focus is on editable area, allow normal Backspace; otherwise prevent navigation
        if (isEditing) return; 
        e.preventDefault();
      }
    });
    
    window.addEventListener('keyup', e => { 
      this.keys.shift = e.shiftKey; 
      this.keys.ctrl = e.ctrlKey || e.metaKey; 
    });

    // Double-click pivot to reset
    this.pivotEl.addEventListener('dblclick', () => {
      this.selection.forEach(item => { 
        item.state.pivotLocal = { x: 0.5, y: 0.5 }; 
        item.render(); 
      });
      this.updatePivotUI();
    });

    // Clear selection on canvas background click
    document.getElementById('paper-viewport').addEventListener('pointerdown', e => {
      if (e.target.id === 'paper-viewport') this.clearSelection();
    });
  }

  /**
   * Register a new element for transformation
   * @param {HTMLElement} el - Element to register
   * @returns {TechnicalTransformer} Transformer instance
   */
  register(el) {
    const existing = this.items.find(i => i.el === el);
    if (existing) return existing;
    
    const t = new TechnicalTransformer(el, this);
    this.items.push(t);
    
    // Apply flip state if present
    try { 
      if (typeof updateFlipOnElement === 'function') {
        updateFlipOnElement(el); 
      }
    } catch (e) { 
      // ignore if helper missing 
    }
    
    return t;
  }

  /**
   * Toggle element selection
   * @param {TechnicalTransformer} item - Item to toggle
   */
  toggleSelection(item) {
    if (this.selection.has(item)) { 
      this.selection.delete(item); 
      item.el.classList.remove('active'); 
    } else { 
      this.selection.add(item); 
      item.el.classList.add('active'); 
    }
    this.updatePivotUI();

    // Update global selected element and context toolbar
    if (this.selection.size === 1) {
      const single = this.selection.values().next().value;
      try { 
        if (typeof currentSelectedElement !== 'undefined') {
          currentSelectedElement = single.el;
        }
        if (typeof showContextToolbar === 'function') {
          showContextToolbar(single.el); 
        }
      } catch (e) { /* ignore */ }
    } else if (this.selection.size === 0) {
      try { 
        if (typeof hideContextToolbar === 'function') {
          hideContextToolbar(); 
        }
      } catch (e) { /* ignore */ }
    }
  }

  /**
   * Clear all selections
   */
  clearSelection() {
    this.selection.forEach(item => item.el.classList.remove('active'));
    this.selection.clear();
    this.updatePivotUI();
  }

  /**
   * Update pivot UI position based on selection
   */
  updatePivotUI() {
    if (this.selection.size === 0) { 
      this.pivotEl.classList.remove('visible'); 
      return; 
    }
    
    this.pivotEl.classList.add('visible');
    let gPivot;
    
    if (this.selection.size === 1) {
      const it = this.selection.values().next().value;
      gPivot = it.getGlobalPoint(it.state.pivotLocal.x, it.state.pivotLocal.y);
    } else {
      // Average pivot for multiple selections
      let tx = 0, ty = 0;
      this.selection.forEach(it => { 
        const p = it.getGlobalPoint(it.state.pivotLocal.x, it.state.pivotLocal.y); 
        tx += p.x; 
        ty += p.y; 
      });
      gPivot = { x: tx / this.selection.size, y: ty / this.selection.size };
    }
    
    this.pivotGlobal = gPivot;
    this.pivotEl.style.left = gPivot.x + 'px';
    this.pivotEl.style.top = gPivot.y + 'px';
  }

  /**
   * Start drag operation
   * @param {PointerEvent} e - Pointer event
   * @param {string} handleType - Handle type (move, rot, resize direction)
   */
  onStart(e, handleType) {
    e.stopPropagation(); 
    if (handleType !== 'move' || e.pointerType === 'touch') e.preventDefault();

    this.activePointerId = e.pointerId;
    this.captureTarget = e.currentTarget || e.target;
    if (this.captureTarget && this.captureTarget.setPointerCapture) {
      try {
        this.captureTarget.setPointerCapture(this.activePointerId);
      } catch (err) {
        // ignore if capture fails
      }
    }
    
    this.isDragging = true;
    this.handle = handleType;
    this.dragType = handleType === 'rot' ? 'rotate' : 
                    (handleType === 'move' ? 'move' : 'resize');

    this.selection.forEach(it => it.el.classList.add('is-dragging'));

    const pivotGlobal = this.pivotGlobal || { x: 0, y: 0 };
    this.pivotAnchor = pivotGlobal;

    this.mousePageStart = { x: e.clientX, y: e.clientY };

    // Snapshot current state for all selected items
    this.snapStates = new Map();
    this.selection.forEach(it => { 
      this.snapStates.set(it, { ...it.state }); 
    });
    
    if (this.dragType === 'rotate') {
      this.initialMouseAngle = Math.atan2(
        e.clientY - this.pivotAnchor.y, 
        e.clientX - this.pivotAnchor.x
      ) * 180 / Math.PI;
    }
  }

  /**
   * Handle drag movement
   * @param {PointerEvent} e - Pointer event
   */
  onMove(e) {
    if (!this.isDragging) return;
    if (this.activePointerId !== undefined && e.pointerId !== this.activePointerId) return;

    const dx = e.clientX - this.mousePageStart.x;
    const dy = e.clientY - this.mousePageStart.y;

    this.selection.forEach(it => {
      const snap = this.snapStates.get(it);
      if (!snap) return;

      if (this.dragType === 'move') {
        const newX = snap.x + dx;
        const newY = snap.y + dy;

        // Autosnap to grid if enabled in GridCanvas
        const gcState = window.GridCanvas && typeof window.GridCanvas.getState === 'function' ? window.GridCanvas.getState() : null;
        if (gcState && gcState.autosnap && gcState.grid && gcState.grid.size) {
          const g = Number(gcState.grid.size) || 50;
          it.state.x = Math.round(newX / g) * g;
          it.state.y = Math.round(newY / g) * g;
        } else {
          it.state.x = newX;
          it.state.y = newY;
        }
      } else if (this.dragType === 'rotate') {
        const currentMouseAngle = Math.atan2(
          e.clientY - this.pivotAnchor.y,
          e.clientX - this.pivotAnchor.x
        ) * 180 / Math.PI;
        const deltaAngle = currentMouseAngle - this.initialMouseAngle;

        it.state.angle = snap.angle + deltaAngle;

        // Rotate position around pivot
        const rad = deltaAngle * Math.PI / 180;
        const cos = Math.cos(rad), sin = Math.sin(rad);

        const rx = snap.x - this.pivotAnchor.x;
        const ry = snap.y - this.pivotAnchor.y;

        it.state.x = this.pivotAnchor.x + (rx * cos - ry * sin);
        it.state.y = this.pivotAnchor.y + (rx * sin + ry * cos);
      } else if (this.dragType === 'resize') {
        this.applyResize(it, snap, dx, dy);
      }

      it.render();
    });
    
    this.updatePivotUI();
  }

  onEnd(e) {
    if (this.activePointerId !== undefined && e.pointerId !== this.activePointerId) return;
    this.isDragging = false;
    this.selection.forEach(it => it.el.classList.remove('is-dragging'));
    if (this.captureTarget && this.captureTarget.releasePointerCapture) {
      try {
        this.captureTarget.releasePointerCapture(this.activePointerId);
      } catch (err) {
        // ignore if release fails
      }
    }
    this.activePointerId = undefined;
    this.captureTarget = null;
  }

  /**
   * Apply resize operation maintaining pivot point
   * @param {TechnicalTransformer} it - Item to resize
   * @param {object} snap - Snapshot of initial state
   * @param {number} pageDx - Delta X in page coordinates
   * @param {number} pageDy - Delta Y in page coordinates
   */
  applyResize(it, snap, pageDx, pageDy) {
    // Convert page delta to local element coordinates (accounting for rotation)
    const rad = -snap.angle * Math.PI / 180;
    const lx = pageDx * Math.cos(rad) - pageDy * Math.sin(rad);
    const ly = pageDx * Math.sin(rad) + pageDy * Math.cos(rad);
    
    const h = this.handle;
    const sx = h.includes('e') ? 1 : (h.includes('w') ? -1 : 0);
    const sy = h.includes('s') ? 1 : (h.includes('n') ? -1 : 0);
    
    // Calculate distance from pivot to edge
    const distXP = h.includes('e') ? (1 - snap.pivotLocal.x) : 
                   (h.includes('w') ? snap.pivotLocal.x : 0);
    const distYP = h.includes('s') ? (1 - snap.pivotLocal.y) : 
                   (h.includes('n') ? snap.pivotLocal.y : 0);
    
    let dw = distXP > 0 ? (lx * sx / distXP) : 0;
    let dh = distYP > 0 ? (ly * sy / distYP) : 0;
    
    // Maintain aspect ratio if not dragging diagonal (and not Shift held)
    if (!this.keys.shift && h.length === 2) {
      const ratio = snap.w / snap.h;
      if (Math.abs(dw) > Math.abs(dh * ratio)) dh = dw / ratio;
      else dw = dh * ratio;
    }
    
    const nw = Math.max(10, snap.w + dw);
    const nh = Math.max(10, snap.h + dh);
    
    it.state.w = nw;
    it.state.h = nh;
    
    // Recalculate position to keep pivot fixed
    const nRad = it.state.angle * Math.PI / 180;
    const pivotGlobal = snap.pivotLocal;
    
    const anchorX = snap.x + (pivotGlobal.x * snap.w * Math.cos(nRad) - 
                               pivotGlobal.y * snap.h * Math.sin(nRad));
    const anchorY = snap.y + (pivotGlobal.x * snap.w * Math.sin(nRad) + 
                               pivotGlobal.y * snap.h * Math.cos(nRad));
    
    it.state.x = anchorX - (pivotGlobal.x * nw * Math.cos(nRad) - 
                             pivotGlobal.y * nh * Math.sin(nRad));
    it.state.y = anchorY - (pivotGlobal.x * nw * Math.sin(nRad) + 
                             pivotGlobal.y * nh * Math.cos(nRad));
  }
}

// Create global manager instance and expose it
window.TRANSFORM_MANAGER = new TransformManager();
