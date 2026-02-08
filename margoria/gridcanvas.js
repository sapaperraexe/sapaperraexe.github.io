// GridCanvas module - Grid overlay + Export functionality on paper-viewport
// Implements FULL gridsystem.html features with professional styling
(function(){
  const STATE = {
    grid: { visible: false, size: 50, color: '#978a4b', opacity: 0.3 },
    guides: { 
      visible: false, 
      top: 40, bottom: 40, left: 40, right: 40, 
      color: '#978a4b', 
      opacity: 0.5 
    },
    autosnap: false,
    locks: { vertical: true, horizontal: true },
    export: { filename: 'margoria_export', format: 'image/png', width: 1200, height: 900, ratio: 1200/900, lockRatio: true }
  };

  let gridPanel = null;
  let exportModal = null;
  let guideOverlay = null;

  function createGuideOverlay() {
    if (guideOverlay) return;
    
    const vp = document.getElementById('paper-viewport');
    if (!vp) return;

    guideOverlay = document.createElement('div');
    guideOverlay.id = 'guide-overlay';
    guideOverlay.style.cssText = `
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 5;
    `;
    
    vp.appendChild(guideOverlay);
  }

  function createGridPanel() {
    if (gridPanel) return;
    
    gridPanel = document.createElement('div');
    gridPanel.id = 'grid-panel';
    gridPanel.style.cssText = `
      position: fixed; top: 80px; right: 20px; width: 280px; z-index: 1100;
      background: var(--panel-bg); backdrop-filter: var(--backdrop-filter);
      border: 1px solid var(--accent-color); border-radius: var(--ui-radius);
      padding: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);
      color: var(--text-main); font-family: system-ui, sans-serif; font-size: 12px;
      display: none; max-height: 70vh; max-width: 90vw; overflow-y: auto;
    `;

    gridPanel.innerHTML = `
      <h3 style="margin:0 0 12px 0; font-size:13px; color:var(--accent-bright); letter-spacing:1px;">GRID</h3>
      
      <div style="margin-bottom:12px;">
        <label style="font-size:11px; display:flex; gap:8px; align-items:center;">
          Mostrar Grid
          <label class="toggle-switch" style="margin-left:auto;"><input id="gc-grid-toggle" type="checkbox"><span class="slider"></span></label>
        </label>
      </div>
      
      <div style="margin-bottom:12px;">
        <label style="font-size:11px; margin-bottom:4px; display:block;">Tamaño (px)</label>
        <div style="display:flex; gap:6px; align-items:center;">
          <input id="gc-grid-size-num" type="number" value="50" min="10" max="200" class="gc-scroll-input" style="flex:1; padding:4px; border-radius:var(--ui-radius); background:transparent; border:1px solid var(--accent-color); color:inherit; font-size:11px;">
          <input id="gc-grid-size-range" type="range" min="10" max="200" value="50" style="flex:2; accent-color:var(--accent-color);">
        </div>
      </div>

      <div style="margin-bottom:12px;">
        <label style="font-size:11px; margin-bottom:4px; display:flex; gap:8px; align-items:center;">Color Grid
          <input id="gc-grid-color" type="color" value="#978a4b" style="margin-left:auto; width:30px; height:24px; border-radius:4px;">
        </label>
        <div style="margin-top:6px; display:flex; gap:6px; align-items:center;">
          <label style="font-size:10px; flex:1;">Opacidad</label>
          <input id="gc-grid-opacity" type="range" min="0" max="100" value="30" style="flex:1; accent-color:var(--accent-color);">
        </div>
      </div>

      <h3 style="margin:15px 0 8px 0; font-size:13px; color:var(--accent-bright); letter-spacing:1px;">GUÍAS</h3>
      
      <div style="margin-bottom:12px;">
        <label style="font-size:11px; display:flex; gap:8px; align-items:center;">
          Mostrar Guías
          <label class="toggle-switch" style="margin-left:auto;"><input id="gc-guides-toggle" type="checkbox"><span class="slider"></span></label>
        </label>
      </div>

      <div style="margin-bottom:12px;">
        <label style="font-size:11px; margin-bottom:4px; display:flex; gap:8px; align-items:center;">Color
          <input id="gc-guides-color" type="color" value="#978a4b" style="margin-left:auto; width:30px; height:24px; border-radius:4px;">
        </label>
        <div style="margin-top:6px; display:flex; gap:6px; align-items:center;">
          <label style="font-size:10px; flex:1;">Opacidad</label>
          <input id="gc-guides-opacity" type="range" min="0" max="100" value="50" style="flex:1; accent-color:var(--accent-color);">
        </div>
      </div>

      <style>
        #grid-panel .toggle-switch { position: relative; display: inline-block; width: 34px; height: 18px; }
        #grid-panel .toggle-switch input { opacity: 0; width: 0; height: 0; }
        #grid-panel .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #444; transition: .3s; border-radius: 20px; }
        #grid-panel .slider:before { position: absolute; content: ""; height: 12px; width: 12px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
        #grid-panel input:checked + .slider { background-color: var(--accent-color); }
        #grid-panel input:checked + .slider:before { transform: translateX(16px); }
        #grid-panel .lock-btn { background: rgba(255,255,255,0.05); border: 1px solid transparent; cursor: pointer; padding: 6px; display: flex; align-items: center; justify-content: center; opacity: 0.4; transition: 0.2s; border-radius: 6px; width: 28px; height: 28px; }
        #grid-panel .lock-btn.active { opacity: 1; border-color: var(--accent-color); background: rgba(var(--accent-rgb, 155,108,75), 0.1); }
        #grid-panel .lock-btn svg { width: 14px; height: 14px; fill: var(--accent-color); }
        #grid-panel .input-with-icon { display: flex; align-items: center; gap: 6px; background: rgba(0,0,0,0.3); border-radius: 6px; padding: 4px 8px; border: 1px solid var(--accent-color); }
        #grid-panel .input-with-icon svg { width: 14px; height: 14px; fill: var(--accent-color); flex-shrink: 0; }
        #grid-panel .margin-item { display: flex; flex-direction: column; gap: 4px; }
        #grid-panel .margin-label-text { font-size: 8px; color: var(--text-main); font-weight: 800; letter-spacing: 0.5px; opacity: 0.7; }
      </style>

      <h3 style="margin:15px 0 8px 0; font-size:13px; color:var(--accent-bright); letter-spacing:1px;">MÁRGENES</h3>
      <div style="display:grid; grid-template-columns:1fr auto 1fr; gap:12px 8px; align-items:center; margin-bottom:12px;">
        <div class="margin-item">
          <span class="margin-label-text">TOP</span>
          <div class="input-with-icon">
            <svg viewBox="0 0 24 24"><path d="M3 3h18v2H3V3zm5 4h8v2H8V7z"/></svg>
            <input id="gc-margin-top" type="number" value="40" class="gc-scroll-input" style="flex:1; background:transparent; border:none; color:inherit; font-size:11px; padding:2px;">
          </div>
        </div>
        <button id="gc-lock-vert" class="lock-btn active" title="Sincronizar Vertical">
          <svg viewBox="0 0 24 24"><path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM8.9 6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2H8.9V6z"/></svg>
        </button>
        <div class="margin-item">
          <span class="margin-label-text">BOTTOM</span>
          <div class="input-with-icon">
            <svg viewBox="0 0 24 24"><path d="M3 19h18v2H3v-2zm5-4h8v2H8v-2z"/></svg>
            <input id="gc-margin-bottom" type="number" value="40" class="gc-scroll-input" style="flex:1; background:transparent; border:none; color:inherit; font-size:11px; padding:2px;">
          </div>
        </div>
        <div class="margin-item">
          <span class="margin-label-text">LEFT</span>
          <div class="input-with-icon">
            <svg viewBox="0 0 24 24"><path d="M3 3h2v18H3V3zm4 5h2v8H7V8z"/></svg>
            <input id="gc-margin-left" type="number" value="40" class="gc-scroll-input" style="flex:1; background:transparent; border:none; color:inherit; font-size:11px; padding:2px;">
          </div>
        </div>
        <button id="gc-lock-horiz" class="lock-btn active" title="Sincronizar Horizontal">
          <svg viewBox="0 0 24 24"><path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM8.9 6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2H8.9V6z"/></svg>
        </button>
        <div class="margin-item">
          <span class="margin-label-text">RIGHT</span>
          <div class="input-with-icon">
            <svg viewBox="0 0 24 24"><path d="M19 3h2v18h-2V3zm-4 5h2v8h-2V8z"/></svg>
            <input id="gc-margin-right" type="number" value="40" class="gc-scroll-input" style="flex:1; background:transparent; border:none; color:inherit; font-size:11px; padding:2px;">
          </div>
        </div>
      </div>

      <h3 style="margin:15px 0 8px 0; font-size:13px; color:var(--accent-bright); letter-spacing:1px;">AUTOSNAP</h3>
      <div style="margin-bottom:12px;">
        <label style="font-size:11px; display:flex; gap:8px; align-items:center;">
          Habilitar (experimental)
          <label class="toggle-switch" style="margin-left:auto;"><input id="gc-autosnap-toggle" type="checkbox"><span class="slider"></span></label>
        </label>
      </div>
    `;

    document.body.appendChild(gridPanel);
    wireGridPanel();
  }

  function wireGridPanel() {
    // Grid
    const gridToggle = gridPanel.querySelector('#gc-grid-toggle');
    const gridSizeNum = gridPanel.querySelector('#gc-grid-size-num');
    const gridSizeRange = gridPanel.querySelector('#gc-grid-size-range');
    const gridColor = gridPanel.querySelector('#gc-grid-color');
    
    gridToggle.addEventListener('change', e => { STATE.grid.visible = e.target.checked; updateGuideOverlay(); });
    gridSizeNum.addEventListener('input', e => { STATE.grid.size = parseInt(e.target.value) || 50; gridSizeRange.value = STATE.grid.size; updateGuideOverlay(); });
    gridSizeRange.addEventListener('input', e => { STATE.grid.size = parseInt(e.target.value); gridSizeNum.value = STATE.grid.size; updateGuideOverlay(); });
    gridColor.addEventListener('input', e => { STATE.grid.color = e.target.value; updateGuideOverlay(); });
    const gridOpacity = gridPanel.querySelector('#gc-grid-opacity');
    gridOpacity.addEventListener('input', e => { STATE.grid.opacity = parseInt(e.target.value) / 100; updateGuideOverlay(); });

    // Guides
    const guidesToggle = gridPanel.querySelector('#gc-guides-toggle');
    const guidesColor = gridPanel.querySelector('#gc-guides-color');
    const guidesOpacity = gridPanel.querySelector('#gc-guides-opacity');
    
    guidesToggle.addEventListener('change', e => { STATE.guides.visible = e.target.checked; updateGuideOverlay(); });
    guidesColor.addEventListener('input', e => { STATE.guides.color = e.target.value; updateGuideOverlay(); });
    guidesOpacity.addEventListener('input', e => { STATE.guides.opacity = parseInt(e.target.value) / 100; updateGuideOverlay(); });

    // Margins & Locks
    const marginTop = gridPanel.querySelector('#gc-margin-top');
    const marginBottom = gridPanel.querySelector('#gc-margin-bottom');
    const marginLeft = gridPanel.querySelector('#gc-margin-left');
    const marginRight = gridPanel.querySelector('#gc-margin-right');
    const lockVert = gridPanel.querySelector('#gc-lock-vert');
    const lockHoriz = gridPanel.querySelector('#gc-lock-horiz');
    
    marginTop.addEventListener('input', e => { STATE.guides.top = parseInt(e.target.value) || 40; if (STATE.locks.vertical) marginBottom.value = STATE.guides.top; STATE.guides.bottom = STATE.guides.top; updateGuideOverlay(); });
    marginBottom.addEventListener('input', e => { STATE.guides.bottom = parseInt(e.target.value) || 40; if (STATE.locks.vertical) marginTop.value = STATE.guides.bottom; STATE.guides.top = STATE.guides.bottom; updateGuideOverlay(); });
    marginLeft.addEventListener('input', e => { STATE.guides.left = parseInt(e.target.value) || 40; if (STATE.locks.horizontal) marginRight.value = STATE.guides.left; STATE.guides.right = STATE.guides.left; updateGuideOverlay(); });
    marginRight.addEventListener('input', e => { STATE.guides.right = parseInt(e.target.value) || 40; if (STATE.locks.horizontal) marginLeft.value = STATE.guides.right; STATE.guides.left = STATE.guides.right; updateGuideOverlay(); });
    
    lockVert.addEventListener('click', e => { STATE.locks.vertical = !STATE.locks.vertical; lockVert.classList.toggle('active', STATE.locks.vertical); });
    lockHoriz.addEventListener('click', e => { STATE.locks.horizontal = !STATE.locks.horizontal; lockHoriz.classList.toggle('active', STATE.locks.horizontal); });

    // Autosnap
    const autosnapToggle = gridPanel.querySelector('#gc-autosnap-toggle');
    autosnapToggle.addEventListener('change', e => { STATE.autosnap = e.target.checked; });

    // Add scroll wheel support to number inputs
    const scrollInputs = gridPanel.querySelectorAll('.gc-scroll-input');
    scrollInputs.forEach(input => {
      input.addEventListener('wheel', e => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 1 : -1;
        const step = parseInt(input.step) || 1;
        input.value = parseInt(input.value || 0) + (delta * step);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
    });
  }

  function toggleGridPanel() {
    if (!gridPanel) createGridPanel();
    gridPanel.style.display = gridPanel.style.display === 'none' ? 'block' : 'none';
  }

  function createExportModal() {
    if (exportModal) return;
    
    exportModal = document.createElement('div');
    exportModal.id = 'export-modal-overlay';
    exportModal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 2000;
      background: rgba(0,0,0,0.8); backdrop-filter: blur(4px); display: none;
      align-items: center; justify-content: center;
    `;

    const modalBox = document.createElement('div');
    modalBox.style.cssText = `
      background: var(--panel-bg); border: 1px solid var(--accent-color);
      border-radius: var(--ui-radius); padding: 24px; width: 360px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.6); color: var(--text-main);
      font-family: system-ui, sans-serif; max-width: 90vw; max-height: 80vh; overflow: auto;
    `;

    modalBox.innerHTML = `
      <style>
        #export-modal-overlay .exp-lock-btn { background: rgba(255,255,255,0.05); border: 1px solid transparent; cursor: pointer; padding: 6px; display: flex; align-items: center; justify-content: center; opacity: 0.4; transition: 0.2s; border-radius: 6px; width: 28px; height: 28px; }
        #export-modal-overlay .exp-lock-btn.active { opacity: 1; border-color: var(--accent-color); background: rgba(var(--accent-rgb, 155,108,75), 0.1); }
        #export-modal-overlay .exp-lock-btn svg { width: 14px; height: 14px; flex-shrink: 0; }
      </style>
      <h2 style="margin:0 0 16px 0; font-size:16px; color:var(--accent-bright); letter-spacing:1px;">EXPORTAR</h2>
      
      <div style="margin-bottom:12px;">
        <label style="font-size:11px; display:block; margin-bottom:4px;">Nombre del archivo</label>
        <input id="exp-filename" type="text" value="margoria_export" style="width:100%; padding:8px; border-radius:var(--ui-radius); background:transparent; border:1px solid var(--accent-color); color:inherit; font-size:12px;">
      </div>

      <div style="margin-bottom:12px;">
        <label style="font-size:11px; display:block; margin-bottom:4px;">Formato</label>
        <select id="exp-format" style="width:100%; padding:8px; border-radius:var(--ui-radius); background:transparent; border:1px solid var(--accent-color); color:inherit; font-size:12px;">
          <option value="image/png">PNG</option>
          <option value="image/jpeg">JPG</option>
        </select>
      </div>

      <div style="margin-bottom:12px;">
        <label style="font-size:11px; display:block; margin-bottom:4px;">Resolución (px)</label>
        <div style="display:grid; grid-template-columns:1fr auto 1fr; gap:8px;">
          <div>
            <label style="font-size:9px; display:block;">ANCHO</label>
            <input id="exp-width" type="number" value="1200" class="gc-scroll-input" style="width:100%; padding:6px; border-radius:var(--ui-radius); background:transparent; border:1px solid var(--accent-color); color:inherit; font-size:11px;">
          </div>
          <button id="exp-lock-ratio" class="exp-lock-btn active" title="Bloquear Relación de Aspecto" style="margin-top:12px; width:28px; height:28px; border-radius:6px; background:rgba(255,255,255,0.05); border:1px solid transparent; cursor:pointer; opacity:1;">
            <svg viewBox="0 0 24 24"><path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM8.9 6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2H8.9V6z" fill="var(--accent-color)"/></svg>
          </button>
          <div>
            <label style="font-size:9px; display:block;">ALTO</label>
            <input id="exp-height" type="number" value="900" class="gc-scroll-input" style="width:100%; padding:6px; border-radius:var(--ui-radius); background:transparent; border:1px solid var(--accent-color); color:inherit; font-size:11px;">
          </div>
        </div>
      </div>

      <div style="margin-top:20px; display:flex; gap:10px;">
        <button id="exp-download-btn" style="flex:1; padding:10px; border-radius:var(--ui-radius); background:rgba(149,108,75,0.3); border:1px solid var(--accent-color); color:var(--accent-bright); cursor:pointer; font-weight:bold; text-transform:uppercase; letter-spacing:0.5px;">Descargar</button>
        <button id="exp-close-btn" style="flex:1; padding:10px; border-radius:var(--ui-radius); background:transparent; border:1px solid var(--accent-color); color:var(--text-main); cursor:pointer; font-weight:bold; text-transform:uppercase; letter-spacing:0.5px;">Cerrar</button>
      </div>
    `;

    exportModal.appendChild(modalBox);
    document.body.appendChild(exportModal);

    // Wire modal
    const expDownloadBtn = exportModal.querySelector('#exp-download-btn');
    const expCloseBtn = exportModal.querySelector('#exp-close-btn');
    const expWidth = exportModal.querySelector('#exp-width');
    const expHeight = exportModal.querySelector('#exp-height');
    const expFilename = exportModal.querySelector('#exp-filename');
    const expFormat = exportModal.querySelector('#exp-format');
    const expLockRatio = exportModal.querySelector('#exp-lock-ratio');

    expDownloadBtn.addEventListener('click', processExport);
    expCloseBtn.addEventListener('click', closeExportModal);
    
    expFilename.addEventListener('input', e => { STATE.export.filename = e.target.value; });
    expFormat.addEventListener('change', e => { STATE.export.format = e.target.value; });
    
    expWidth.addEventListener('input', e => {
      STATE.export.width = parseInt(e.target.value) || 1200;
      if (STATE.export.lockRatio) {
        STATE.export.height = Math.round(STATE.export.width / STATE.export.ratio);
        expHeight.value = STATE.export.height;
      }
    });
    expHeight.addEventListener('input', e => {
      STATE.export.height = parseInt(e.target.value) || 900;
      if (STATE.export.lockRatio) {
        STATE.export.width = Math.round(STATE.export.height * STATE.export.ratio);
        expWidth.value = STATE.export.width;
      }
    });
    expLockRatio.addEventListener('click', e => {
      STATE.export.lockRatio = !STATE.export.lockRatio;
      e.target.classList.toggle('active', STATE.export.lockRatio);
    });

    // Add scroll wheel support to export modal number inputs
    [expWidth, expHeight].forEach(input => {
      input.addEventListener('wheel', e => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 1 : -1;
        const step = parseInt(input.step) || 1;
        input.value = parseInt(input.value || 0) + (delta * step);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
    });
  }

  function openExportModal() {
    if (!exportModal) createExportModal();
    exportModal.style.display = 'flex';
  }

  function closeExportModal() {
    if (exportModal) exportModal.style.display = 'none';
  }

  function updateGuideOverlay() {
    createGuideOverlay();
    if (!guideOverlay) return;

    const vp = document.getElementById('paper-viewport');
    if (!vp) return;

    const w = vp.clientWidth;
    const h = vp.clientHeight;

    let svg = `<svg width="${w}" height="${h}" style="position:absolute; top:0; left:0; pointer-events:none; z-index:5;">`;

    // Draw grid
    if (STATE.grid.visible) {
      const step = Math.max(8, STATE.grid.size);
      const color = STATE.grid.color;
      svg += `<defs><pattern id="grid-pattern" width="${step}" height="${step}" patternUnits="userSpaceOnUse">`;
      const gridOpacity = Number(STATE.grid.opacity) || 0.3;
      svg += `<path d="M ${step} 0 L 0 0 0 ${step}" fill="none" stroke="${color}" stroke-width="0.5" opacity="${gridOpacity}"/>`;
      svg += `</pattern></defs>`;
      svg += `<rect width="${w}" height="${h}" fill="url(#grid-pattern)" />`;
    }

    // Draw guides (safe area box)
    if (STATE.guides.visible) {
      const color = STATE.guides.color;
      const x = STATE.guides.left;
      const y = STATE.guides.top;
      const bw = w - STATE.guides.left - STATE.guides.right;
      const bh = h - STATE.guides.top - STATE.guides.bottom;
      svg += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="5,5" opacity="${STATE.guides.opacity}"/>`;
    }

    svg += `</svg>`;
    guideOverlay.innerHTML = svg;
  }

  function processExport() {
    const vp = document.getElementById('paper-viewport');
    if (!vp) return;

    const filename = exportModal.querySelector('#exp-filename').value || 'margoria_export';
    const format = exportModal.querySelector('#exp-format').value || 'image/png';
    const w = STATE.export.width || 1200;
    const h = STATE.export.height || 900;

    // Get viewport dimensions
    const vpRect = vp.getBoundingClientRect();
    const zoom = Number(window.currentZoom) || 1;
    const baseWidth = vpRect.width / zoom;
    const scale = w / baseWidth;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    // Draw static (non-draggable) images inside viewport
    function drawStaticImages() {
      const imgs = vp.querySelectorAll('img');
      imgs.forEach(img => {
        if (img.closest('.draggable-element')) return; // skip draggable images (drawn later)
        if (!img.complete) return;
        const r = img.getBoundingClientRect();
        const x = ((r.left - vpRect.left) / zoom) * scale;
        const y = ((r.top - vpRect.top) / zoom) * scale;
        const iw = (r.width / zoom) * scale;
        const ih = (r.height / zoom) * scale;
        try { ctx.drawImage(img, x, y, iw, ih); } catch (err) { /* ignore draw errors */ }
      });
    }

    // Draw guideOverlay SVG (grid/guides) if present
    function drawGuideOverlayThen(callback) {
      if (!guideOverlay || !guideOverlay.innerHTML) return callback();
      const svgStr = guideOverlay.innerHTML;
      const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => { try { ctx.drawImage(img, 0, 0, canvas.width, canvas.height); } catch (e) {} URL.revokeObjectURL(url); callback(); };
      img.onerror = () => { URL.revokeObjectURL(url); callback(); };
      img.src = url;
    }

    // Now create a sequence: background -> static images -> guide overlay -> draggable elements -> download
    function drawElementsAndDownload() {
      // Draw draggable elements scaled
      document.querySelectorAll('.draggable-element').forEach(el => {
        const rect = el.getBoundingClientRect();
        const vpOffsetX = rect.left - vpRect.left;
        const vpOffsetY = rect.top - vpRect.top;

        // Scale coordinates
        const x = (vpOffsetX / zoom) * scale;
        const y = (vpOffsetY / zoom) * scale;
        const ew = (rect.width / zoom) * scale;
        const eh = (rect.height / zoom) * scale;

        // Get element's transform (rotate)
        const transform = el.style.transform || '';

        // Draw element content
        const img = el.querySelector('img');
        if (img && img.complete) {
          ctx.save();
          ctx.translate(x + ew / 2, y + eh / 2);
          // Parse and apply transform rotation
          const match = transform.match(/rotate\(([-\d.]+)deg\)/);
          if (match) ctx.rotate(parseFloat(match[1]) * Math.PI / 180);
          ctx.drawImage(img, -ew / 2, -eh / 2, ew, eh);
          ctx.restore();
        } else {
          // Fallback: draw rectangle placeholder
          ctx.fillStyle = 'rgba(150,100,50,0.3)';
          ctx.fillRect(x, y, ew, eh);
        }

        // Draw text if present
        const textBlock = el.querySelector('.text-block');
        if (textBlock) {
          ctx.save();
          ctx.fillStyle = '#333';
          ctx.font = '14px serif';
          ctx.fillText(textBlock.textContent.slice(0, 200), x + 8, y + 20);
          ctx.restore();
        }
      });

      // Trigger download
      const link = document.createElement('a');
      link.download = filename + (format === 'image/png' ? '.png' : '.jpg');
      link.href = canvas.toDataURL(format);
      link.click();
    }

    // Try to draw background image if present on paper-viewport
    const bg = vp.style.backgroundImage || '';
    const urlMatch = bg.match(/url\(["']?(.+?)["']?\)/);
    function afterBackground() {
      // draw static images
      drawStaticImages();
      // draw guide overlay then draggable elements
      drawGuideOverlayThen(drawElementsAndDownload);
    }

    if (urlMatch && urlMatch[1]) {
      const bgUrl = urlMatch[1];
      const bimg = new Image();
      bimg.crossOrigin = 'anonymous';
      bimg.onload = () => {
        try { ctx.drawImage(bimg, 0, 0, canvas.width, canvas.height); } catch (e) { ctx.fillStyle = '#fff'; ctx.fillRect(0,0,w,h); }
        afterBackground();
      };
      bimg.onerror = () => {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, w, h);
        afterBackground();
      };
      bimg.src = bgUrl;
    } else {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, w, h);
      afterBackground();
    }
  }

  // Expose API
  window.GridCanvas = {
    init: createPanel,
    togglePanel: toggleGridPanel,
    updateGuideOverlay,
    getState: () => STATE,
    openExportModal,
    closeExportModal
  };

  function createPanel() {
    createGridPanel();
    createExportModal();
  }

  // Wire buttons
  window.addEventListener('load', () => {
    const btnGrid = document.getElementById('btn-grid');
    if (btnGrid) {
      btnGrid.addEventListener('click', toggleGridPanel);
    }
    const btnSave = document.getElementById('btn-save');
    if (btnSave) {
      btnSave.addEventListener('click', openExportModal);
    }
  });

})();
