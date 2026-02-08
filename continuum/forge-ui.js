/* ------------------------ Estado ------------------------ */
const state = {
    originalImage: null,
    processedCanvas: document.createElement('canvas'),
    displayCanvas: document.getElementById('mainCanvas'),
    ctx: null,
    filename: 'texture',
    viewMode: 'inspector',             // 'inspector' | 'texture-only' | 'compare'
    compareAlpha: 1,                   // 0=original, 1=procesada
    zoom: 100,                         // Zoom % del inspector
    pan: { x: 0, y: 0 },               // Pan (inspector)
    panning: { active:false, sx:0, sy:0 }
};
state.ctx = state.displayCanvas.getContext('2d');

/* ------------------------ DOM ------------------------ */
const ui = {
    // Toolbars
    controls: document.getElementById('controls'),
    seamtools: document.getElementById('seamtools'),
    
    // -- Seamtools --
    btnLoad: document.getElementById('btnLoad'),
    fileInput: document.getElementById('fileInput'),
    crop: {
        menu: document.getElementById('menuCrop'),
        btn: document.getElementById('btnCropMenu'),
        presets: document.querySelectorAll('.chip[data-crop-preset]'),
        l: document.getElementById('cropLeft'), t: document.getElementById('cropTop'),
        r: document.getElementById('cropRight'), b: document.getElementById('cropBottom'),
        lockAll: document.getElementById('lockAll'),
        lockLR: document.getElementById('lockLR'),
        lockTB: document.getElementById('lockTB')
    },
    method: {
        menu: document.getElementById('menuMethod'),
        btn: document.getElementById('btnMethodMenu'),
        grid: document.getElementById('methodGrid'),
        select: document.getElementById('seamlessMethod'),
        blendAmt: document.getElementById('blendAmount'),
        blendVal: document.getElementById('blendVal'),
        eqInt: document.getElementById('eqIntensity'), rad: document.getElementById('eqRadius'),
        eqIntVal: document.getElementById('eqIntVal'), radVal: document.getElementById('eqRadVal')
    },
    btnTextureOnly: document.getElementById('btnTextureOnly'),
    btnAB: document.getElementById('btnAB'),
    btnExportTop: document.getElementById('btnExportTop'),

    // -- Controls --
    inspector: {
        menu: document.getElementById('menuInspector'),
        btn: document.getElementById('btnInspector'),
    },
    btnTheme: document.getElementById('btnTheme'),
    zoomSlider: document.getElementById('zoomSlider'),
    btnRotate: document.getElementById('btnRotate'),

    // Modal de Exportación
    export: {
        modal: document.getElementById('export-modal'),
        overlay: document.getElementById('modalOverlay'),
        preview: document.getElementById('exportPreviewCanvas'),
        doBtn: document.getElementById('btnDoExport'),
        cancelBtn: document.getElementById('btnCancelExport'),
        filename: document.getElementById('expFilename'),
        w: document.getElementById('expWidth'), h: document.getElementById('expHeight'),
        format: document.getElementById('expFormat'),
        jpgOpts: document.getElementById('expJpegOptions'),
        quality: document.getElementById('expQuality'),
        qVal: document.getElementById('expQVal'),
        aspectLockBtn: document.getElementById('aspectLock'),
        btnOrigSize: document.getElementById('btnOrigSize')
    },

    // Otros
    info: document.getElementById('info'),
    statBar: document.getElementById('statBar'),
    viewport: document.getElementById('viewport'),
    guides: {
        overlay: document.getElementById('guides-overlay'),
        pattern: document.getElementById('gridPattern')
    }
};
const loader = document.getElementById('loading-overlay');

function isLockActive(el){
    if (!el) return false;
    return Object.prototype.hasOwnProperty.call(el, 'checked') ? el.checked : el.classList.contains('active');
}
function setLockActive(el, value){
    if (!el) return;
    if (Object.prototype.hasOwnProperty.call(el, 'checked')) el.checked = value;
    el.classList.toggle('active', value);
}
function toggleLockActive(el){
    if (!el) return false;
    const next = !isLockActive(el);
    setLockActive(el, next);
    return next;
}

/* ------------------------ Lógica de Menús Desplegables ------------------------ */
function setupDropdowns() {
    const menus = ['menuCrop', 'menuMethod'];
    menus.forEach(menuId => {
        const wrapper = document.getElementById(menuId);
        if (wrapper) {
            const button = wrapper.querySelector('.btn-icon');
            button.addEventListener('click', (e) => {
                const isActive = wrapper.classList.contains('active');
                document.querySelectorAll('.btn-wrapper').forEach(m => m.classList.remove('active'));
                if (!isActive) {
                    wrapper.classList.add('active');
                }
                e.stopPropagation();
            });
        }
    });
    if (ui.inspector.menu && ui.inspector.btn) {
        ui.inspector.btn.addEventListener('click', handleInspectorClick);
    }
    window.addEventListener('click', (e) => {
        if (!e.target.closest('.btn-wrapper')) {
            document.querySelectorAll('.btn-wrapper').forEach(m => m.classList.remove('active'));
        }
    });
}

function handleInspectorClick(e) {
    const wrapper = ui.inspector.menu;
    const isActive = wrapper.classList.contains('active');
    document.querySelectorAll('.btn-wrapper').forEach(m => m.classList.remove('active'));
    if (!isActive) {
        wrapper.classList.add('active');
    }
    if (state.viewMode !== 'inspector') {
        setViewMode('inspector');
    }
    e.stopPropagation();
}

/* ------------------------ CARGA ROBUSTA ------------------------ */
function setupFileHandlers() {
    ui.btnLoad.addEventListener("click", () => ui.fileInput.click());
    ui.fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length) {
            loadLocalFile(e.target.files[0]);
        }
    });

    // Click on canvas to load if empty
    ui.viewport.addEventListener('click', ()=>{
        if (!state.originalImage) {
            ui.fileInput.click();
        }
    });

    window.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        document.body.classList.add('dragover');
    });
    window.addEventListener('dragleave', (e) => {
        if (e.relatedTarget) return;
        document.body.classList.remove('dragover');
    });
    window.addEventListener('drop', (e) => {
        e.preventDefault();
        document.body.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files.length) {
            loadLocalFile(e.dataTransfer.files[0]);
            return;
        }
        const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
        if (url) loadFromURL(url);
    });
}

function loadLocalFile(file){
    if(!file || !file.type || !file.type.startsWith('image/')){
        alert('El archivo no es una imagen válida.');
        return;
    }
    const objectURL = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
        try { URL.revokeObjectURL(objectURL); } catch(e) {}
        applyLoadedImage(img, file.name);
    };
    img.onerror = () => {
        try { URL.revokeObjectURL(objectURL); } catch(e) {}
        alert('No se pudo decodificar la imagen. Prueba con otro archivo.');
    };
    img.src = objectURL;
}

function loadFromURL(url){
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => applyLoadedImage(img, url.split('/').pop());
    img.onerror = () => alert('No se pudo cargar la imagen desde la URL. ¿Permite CORS?');
    img.src = url;
}

function applyLoadedImage(img, filename){
    state.originalImage = img;
    state.filename = (filename || 'texture').split('.').slice(0,-1).join('.') || 'texture';
    state.zoom = 100;
    ui.zoomSlider.value = 100;
    state.pan = {x:0, y:0};
    updateLabels();
    runPipeline();
    updateInfo();

    const icon = document.getElementById('icon-original');
    if (icon){
        const r = img.width / img.height;
        if (r > 1) { icon.style.width='14px'; icon.style.height=(14/r)+'px'; }
        else { icon.style.height='12px'; icon.style.width=(12*r)+'px'; }
    }
}

/* ------------------------ Eventos UI ------------------------ */
function setupUIEventListeners() {
    // Métodos
    ui.method.grid.querySelectorAll('.method-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const isActive = btn.classList.contains('active');
            ui.method.grid.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'));
            if (!isActive) {
                btn.classList.add('active');
                ui.method.select.value = btn.dataset.method;
                ui.method.blendAmt.disabled = false;
            } else {
                ui.method.select.value = '';
                ui.method.blendAmt.disabled = true;
            }
            debouncedProcess();
        });
    });
    ui.method.blendAmt.addEventListener('input', () => { updateLabels(); debouncedProcess(); });
    [ui.method.eqInt, ui.method.rad].forEach(el => el.addEventListener('input', () => { updateLabels(); debouncedProcess(); }));

    // Recorte
    ui.crop.presets.forEach(p => p.addEventListener('click', ()=>{
        setCropValues(p.dataset.cropPreset);
        debouncedProcess();
    }));
    [ui.crop.l, ui.crop.t, ui.crop.r, ui.crop.b].forEach(el => el.addEventListener('input', debouncedProcess));
    [ui.crop.lockAll, ui.crop.lockLR, ui.crop.lockTB].filter(Boolean).forEach(btn => {
        btn.addEventListener('click', () => {
            const isOn = toggleLockActive(btn);
            if (btn === ui.crop.lockAll && isOn) {
                setLockActive(ui.crop.lockLR, false);
                setLockActive(ui.crop.lockTB, false);
            } else if (isOn && (btn === ui.crop.lockLR || btn === ui.crop.lockTB)) {
                setLockActive(ui.crop.lockAll, false);
            }
            debouncedProcess();
        });
    });

    // Vistas
    ui.btnTextureOnly.addEventListener('click', () => {
        if (state.viewMode === 'texture-only') {
            setViewMode('inspector');
        } else {
            setViewMode('texture-only');
        }
    });
    ui.btnAB.addEventListener('click', () => {
        setViewMode('compare');
        state.compareAlpha = (state.compareAlpha === 1 ? 0 : 1);
        renderPreview(state.processedCanvas);
    });

    // Controles Generales
    ui.zoomSlider.addEventListener('input', (e) => { state.zoom = parseInt(e.target.value) || 100; renderPreview(state.processedCanvas); updateInfo(); });
    
    let isDark = true;
    ui.btnTheme.addEventListener('click', () => {
        isDark = !isDark;
        document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
        if(!isDark) {
            ui.btnTheme.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
        } else {
            ui.btnTheme.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>';
        }
    });

    const layouts = ['right', 'bottom', 'left', 'top'];
    let layoutIndex = 0;
    ui.btnRotate.addEventListener('click', () => {
        layoutIndex = (layoutIndex + 1) % layouts.length;
        const layout = layouts[layoutIndex];
        if (layout === 'right') {
            ui.controls.setAttribute('data-layout', 'right');
            ui.seamtools.setAttribute('data-layout', 'left');
        } else if (layout === 'left') {
            ui.controls.setAttribute('data-layout', 'left');
            ui.seamtools.setAttribute('data-layout', 'right');
        } else if (layout === 'top') {
            ui.controls.setAttribute('data-layout', 'top');
            ui.seamtools.setAttribute('data-layout', 'bottom');
        } else if (layout === 'bottom') {
            ui.controls.setAttribute('data-layout', 'bottom');
            ui.seamtools.setAttribute('data-layout', 'top');
        } else {
            ui.controls.setAttribute('data-layout', layout);
            ui.seamtools.setAttribute('data-layout', layout);
        }
    });

    // Panning y Zoom en Viewport
    ui.viewport.addEventListener('mousedown', (e) => {
        if (state.viewMode !== 'inspector') return;
        state.panning.active = true;
        state.panning.sx = e.clientX - state.pan.x;
        state.panning.sy = e.clientY - state.pan.y;
        ui.viewport.style.cursor = 'grabbing';
    });
    window.addEventListener('mousemove', (e) => {
        if (!state.panning.active) return;
        state.pan.x = e.clientX - state.panning.sx;
        state.pan.y = e.clientY - state.panning.sy;
        renderPreview(state.processedCanvas);
    });
    window.addEventListener('mouseup', () => {
        state.panning.active = false;
        if (state.viewMode === 'inspector') ui.viewport.style.cursor = 'grab';
    });
    document.addEventListener('wheel', (e) => {
        if (e.target.type === 'range' || e.target.type === 'number') return;
        if (state.viewMode !== 'inspector') return;
        const delta = Math.sign(e.deltaY) * -12;
        let next = Math.min(400, Math.max(25, state.zoom + delta));
        state.zoom = next; ui.zoomSlider.value = next;
        renderPreview(state.processedCanvas);
    }, { passive: false });

    window.addEventListener('resize', () => {
        if (!state.processedCanvas || !state.processedCanvas.width) return;
        renderPreview(state.processedCanvas);
        refreshGuidesBox();
    });

    // Exportación
    ui.btnExportTop.addEventListener('click', openExport);
    ui.export.overlay.addEventListener('click', closeExport);
    ui.export.cancelBtn.addEventListener('click', closeExport);
    document.querySelectorAll('.preset-btn').forEach(b => b.addEventListener('click', () => setExpSize(b.getAttribute('data-exp'))));
    ui.export.aspectLockBtn.addEventListener('click', toggleAspectLock);
    ui.export.w.addEventListener('input', () => handleDimensionInput('width'));
    ui.export.h.addEventListener('input', () => handleDimensionInput('height'));
    ui.export.doBtn.addEventListener('click', processExport);
    ui.export.format.addEventListener('change', () => {
        const isJpeg = ui.export.format.value === 'image/jpeg';
        ui.export.jpgOpts.style.display = isJpeg ? 'block' : 'none';
    });
    ui.export.quality.addEventListener('input', (e) => { ui.export.qVal.innerText = e.target.value; });
}

/* ------------------------ Lógica de Modos de Vista ------------------------ */
function setViewMode(mode) {
    if (state.viewMode === mode && mode !== 'compare') {
         // If we click inspector button again, just toggle the dropdown.
        if (mode === 'inspector') {
            ui.inspector.menu.classList.toggle('active');
        }
        return;
    }

    state.viewMode = mode;
    
    if (mode !== 'compare') {
        state.compareAlpha = 1;
    }
    
    const isInspector = mode === 'inspector';
    ui.inspector.btn.classList.toggle('active', isInspector);
    ui.btnTextureOnly.classList.toggle('active', mode === 'texture-only');
    ui.btnAB.classList.toggle('active', mode === 'compare');
    ui.viewport.classList.toggle('inspector-mode', isInspector);

    if (!isInspector && ui.inspector.menu.classList.contains('active')) {
        ui.inspector.menu.classList.remove('active');
    }
    
    ui.viewport.style.cursor = isInspector ? 'grab' : 'default';

    renderPreview(state.processedCanvas);
    refreshGuidesBox();
    updateGuideButton();
}


/* ------------------------ Helpers UI ------------------------ */
function updateLabels(){
    if (ui.method.blendVal) ui.method.blendVal.innerText = ui.method.blendAmt.value + '%';
    if (ui.method.eqIntVal) ui.method.eqIntVal.innerText = ui.method.eqInt.value > 0 ? ui.method.eqInt.value : '0 (Off)';
    if (ui.method.radVal) ui.method.radVal.innerText = ui.method.rad.value + 'px';
}
let processTimeout;
function debouncedProcess(){
    if(!state.originalImage) return;
    loader.style.display = 'flex';
    clearTimeout(processTimeout);
    processTimeout = setTimeout(()=> requestAnimationFrame(runPipeline), 60);
}

/* ------------------------ Core Pipeline ------------------------ */
function runPipeline(){
    if(!state.originalImage){ loader.style.display='none'; return; }
    
    const img = state.originalImage;
    let cL = parseInt(ui.crop.l.value)||0, cT = parseInt(ui.crop.t.value)||0, cR = parseInt(ui.crop.r.value)||0, cB = parseInt(ui.crop.b.value)||0;

    const lockAll = isLockActive(ui.crop.lockAll);
    const lockLR = isLockActive(ui.crop.lockLR);
    const lockTB = isLockActive(ui.crop.lockTB);

    if (lockAll){
        const ref = (document.activeElement && ['cropLeft','cropTop','cropRight','cropBottom'].includes(document.activeElement.id)) ? parseInt(document.activeElement.value)||0 : cL;
        cL=cT=cR=cB=ref;
        ui.crop.l.value=ref; ui.crop.t.value=ref; ui.crop.r.value=ref; ui.crop.b.value=ref;
    } else {
        if (lockLR){
            const lr = (document.activeElement && ['cropLeft','cropRight'].includes(document.activeElement.id)) ? parseInt(document.activeElement.value)||0 : cL;
            cL=cR=lr; ui.crop.l.value=lr; ui.crop.r.value=lr;
        }
        if (lockTB){
            const tb = (document.activeElement && ['cropTop','cropBottom'].includes(document.activeElement.id)) ? parseInt(document.activeElement.value)||0 : cT;
            cT=cB=tb; ui.crop.t.value=tb; ui.crop.b.value=tb;
        }
    }

    const w = img.width - cL - cR, h = img.height - cT - cB;
    if (w<32 || h<32){ alert("El recorte deja la imagen demasiado pequeña."); loader.style.display='none'; return; }

    const workCanvas = document.createElement('canvas');
    workCanvas.width = w; workCanvas.height = h;
    const ctx = workCanvas.getContext('2d');
    ctx.drawImage(img, cL, cT, w, h, 0, 0, w, h);

    const eqInt = parseInt(ui.method.eqInt.value);
    if (eqInt > 0){
        applyHighPass(ctx, w, h, eqInt, parseInt(ui.method.rad.value));
    }

    const method = ui.method.select.value;
    const blendPct = parseInt(ui.method.blendAmt.value)/100;
    let seamlessResult;
    if (method==='1')      seamlessResult = algoLinearBlend(workCanvas, blendPct, false);
    else if (method==='2') seamlessResult = algoLinearBlend(workCanvas, blendPct, true);
    else if (method==='6') seamlessResult = algoOffsetBlend(workCanvas, blendPct);
    else if (method==='3') seamlessResult = algoFrameSynthesis(workCanvas, blendPct, 'soft');
    else if (method==='4') seamlessResult = algoFrameSynthesis(workCanvas, blendPct, 'hard');
    else if (method==='5') seamlessResult = algoFrameSynthesis(workCanvas, blendPct, 'noise');
    else                   seamlessResult = workCanvas;

    state.processedCanvas = seamlessResult;
    renderPreview(seamlessResult);
    ui.statBar.innerHTML = `Original: <b>${img.width}x${img.height}</b> → Actual: <b>${seamlessResult.width}x${seamlessResult.height}</b>`;
    updateInfo();
    refreshGuidesBox();
    loader.style.display='none';
}

/* ------------------------ Render / Preview ------------------------ */
function renderPreview(texture){
    const dCanvas=state.displayCanvas, dCtx=state.ctx;
    dCtx.clearRect(0,0,dCanvas.width,dCanvas.height);
    
    if (state.viewMode==='texture-only' || state.viewMode==='compare'){
        dCanvas.width = texture.width;
        dCanvas.height= texture.height;
        if (state.viewMode==='compare' && state.originalImage){
            dCtx.globalAlpha = 1 - state.compareAlpha;
            dCtx.drawImage(state.originalImage, 0, 0, state.originalImage.width, state.originalImage.height, 0, 0, texture.width, texture.height);
            dCtx.globalAlpha = state.compareAlpha;
        }
        dCtx.drawImage(texture, 0, 0);
        dCtx.globalAlpha = 1;
        return;
    }

    if(state.viewMode==='inspector'){
        const vpRect = ui.viewport.getBoundingClientRect();
        dCanvas.width = vpRect.width;
        dCanvas.height = vpRect.height;
        dCanvas.style.width = '100%';
        dCanvas.style.height = '100%';

        const p = dCtx.createPattern(texture, 'repeat');
        if (p && p.setTransform){
            const s = state.zoom/100;
            const m = new DOMMatrix().scale(s, s).translate(state.pan.x / s, state.pan.y / s);
            p.setTransform(m);
        }
        dCtx.fillStyle = p;
        dCtx.fillRect(0,0,dCanvas.width,dCanvas.height);

        if (guidesActive) {
            const s = state.zoom / 100;
            const stepX = texture.width * s;
            const stepY = texture.height * s;
            const offX = ((state.pan.x % stepX) + stepX) % stepX;
            const offY = ((state.pan.y % stepY) + stepY) % stepY;

            dCtx.save();
            dCtx.strokeStyle = activeColor;
            dCtx.lineWidth = 1;
            dCtx.beginPath();
            for (let x = offX; x < dCanvas.width; x += stepX) {
                dCtx.moveTo(x, 0);
                dCtx.lineTo(x, dCanvas.height);
            }
            for (let y = offY; y < dCanvas.height; y += stepY) {
                dCtx.moveTo(0, y);
                dCtx.lineTo(dCanvas.width, y);
            }
            dCtx.stroke();
            dCtx.restore();
        }
    }

    if (state.viewMode !== 'inspector') {
        dCanvas.style.width = '';
        dCanvas.style.height = '';
    }

    if (state.viewMode === 'inspector' && guidesActive) {
        refreshGuidesBox();
    }
}

/* ------------------------ Guías / Grid (Continuum-like) ------------------------ */
let guidesActive = false, activeRatio = 'auto', activeColor = 'rgba(138, 138, 212, 0.6)';

function updateGuideButton() {
    const txt = document.getElementById('txtGuideStatus'), icon = document.getElementById('iconGuideStatus');
    if (!txt || !icon) return;
    if(guidesActive){
        txt.innerText = "HIDE GUIDES"; txt.style.color = "var(--accent)";
        icon.innerHTML = '<rect x="1" y="5" width="22" height="14" rx="7" ry="7" fill="var(--accent)"></rect><circle cx="16" cy="12" r="3" fill="#000"></circle>';
    } else {
        txt.innerText = "SHOW GUIDES"; txt.style.color = "inherit";
        icon.innerHTML = '<rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect><circle cx="8" cy="12" r="3"></circle>';
    }
}

function refreshGuidesBox(){
    ui.guides.overlay.style.display = 'none';
}
function getGridRatioNumeric(val, img){
    if (!val || val==='auto'){
        if (img) return img.width/img.height;
        return 'auto';
    }
    const v = String(val).trim();
    if (v.includes(':')){
        const [a,b] = v.split(':').map(parseFloat);
        return (a>0 && b>0) ? a/b : 'auto';
    }
    const r = parseFloat(v);
    return r>0 ? r : 'auto';
}
function toggleGuides(){
    if (state.viewMode !== 'inspector') {
        setViewMode('inspector');
    }
    guidesActive = !guidesActive;
    updateGuideButton();
    refreshGuidesBox();
    if (state.processedCanvas && state.processedCanvas.width) {
        renderPreview(state.processedCanvas);
    }
}
function setRatio(val){ activeRatio = val; if(!guidesActive) toggleGuides(); else refreshGuidesBox(); }
function setColor(color){
    activeColor = color;
    const picker = document.getElementById('colorPicker');
    if (picker) picker.value = colorToHex(color);
    if (guidesActive && state.processedCanvas && state.processedCanvas.width) {
        renderPreview(state.processedCanvas);
    }
}
function colorToHex(rgba){
    if (rgba.startsWith('#')) return rgba;
    const m = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!m) return '#8a8ad4';
    return `#${(+m[1]).toString(16).padStart(2,'0')}${(+m[2]).toString(16).padStart(2,'0')}${(+m[3]).toString(16).padStart(2,'0')}`;
}

/* ------------------------ Exportación ------------------------ */
let isAspectLocked = true, originalW=0, originalH=0, originalFilename='texture';
function openExport(){
    if(!state.processedCanvas || !state.processedCanvas.width){ return; }
    originalW = state.processedCanvas.width; originalH = state.processedCanvas.height;
    originalFilename = state.filename || 'texture';
    ui.export.overlay.style.display='block'; ui.export.modal.style.display='block';
    ui.export.filename.value = originalFilename;
    ui.export.w.value = originalW; ui.export.h.value = originalH;
    isAspectLocked=true;
    ui.export.aspectLockBtn.classList.add('locked');
    ui.export.jpgOpts.style.display = ui.export.format.value === 'image/jpeg' ? 'block' : 'none';
    updateExportPreview();
}
function closeExport(){ ui.export.overlay.style.display='none'; ui.export.modal.style.display='none'; }
function setExpSize(size){
    if (size==='orig'){ ui.export.w.value = originalW; ui.export.h.value = originalH; return; }
    const s = parseInt(size)||512;
    ui.export.w.value = s;
    if (isAspectLocked){ handleDimensionInput('width'); }
    else { ui.export.h.value = s; }
    updateExportPreview();
}
function toggleAspectLock(){
    isAspectLocked = !isAspectLocked;
    ui.export.aspectLockBtn.classList.toggle('locked', isAspectLocked);
    if (isAspectLocked){ handleDimensionInput('width'); }
    updateExportPreview();
}
function handleDimensionInput(changed){
    if (!isAspectLocked){
        updateExportPreview();
        return;
    }
    const wInput=ui.export.w, hInput=ui.export.h;
    const ratio = (originalW/originalH);
    if (ratio==='auto'){
        const texR = originalW/originalH;
        if (changed==='width'){ hInput.value = Math.round(wInput.value/texR); }
        else { wInput.value = Math.round(hInput.value*texR); }
    } else {
        if (changed==='width'){ hInput.value = Math.round(wInput.value/ratio); }
        else { wInput.value = Math.round(hInput.value*ratio); }
    }
    updateExportPreview();
}
function processExport(){
    const targetW = parseInt(ui.export.w.value)||originalW, targetH = parseInt(ui.export.h.value)||originalH;
    const format  = ui.export.format.value, quality = parseInt(ui.export.quality.value) || 92;
    const baseName= (ui.export.filename.value.trim() || originalFilename);
    triggerDownload(resizeCanvas(state.processedCanvas, targetW, targetH), format, `${baseName}_seamless`, quality);
    closeExport();
}

function updateExportPreview(){
    if (!ui.export.preview || !state.processedCanvas || !state.processedCanvas.width) return;
    const targetW = parseInt(ui.export.w.value)||originalW;
    const targetH = parseInt(ui.export.h.value)||originalH;
    const canvas = ui.export.preview;
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(state.processedCanvas, 0,0, state.processedCanvas.width, state.processedCanvas.height, 0,0, targetW, targetH);
}
function triggerDownload(canvas, mime, name, quality){
    const link=document.createElement('a');
    link.download = `${name}.${mime==='image/png'?'png':'jpg'}`;
    link.href = canvas.toDataURL(mime, mime==='image/jpeg' ? quality/100 : undefined);
    link.click();
}

/* ------------------------ Otras utilidades ------------------------ */
function setCropValues(v){ ui.crop.l.value=v; ui.crop.t.value=v; ui.crop.r.value=v; ui.crop.b.value=v; }
function updateInfo(){
    const img = state.originalImage;
    if (!img) { ui.info.textContent = 'UPLOAD AN IMAGE TO START'; return; }
    ui.info.textContent = `${img.width}×${img.height} PX • ${Math.round(state.zoom)}%`;
}

function setupScrollInputs() {
    document.querySelectorAll('.gc-scroll-input').forEach(input => {
        input.addEventListener('wheel', event => {
            event.preventDefault();
            event.stopPropagation();
            const step = event.deltaY < 0 ? 1 : -1;
            input.value = parseInt(input.value, 10) + step;
            // Manually trigger the input event to force the pipeline to run
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
    });
}

/* ------------------------ Inicialización ------------------------ */
document.addEventListener('DOMContentLoaded', () => {
    updateLabels();
    setupDropdowns();
    setupFileHandlers();
    setupUIEventListeners();
    setupScrollInputs();
    setViewMode('inspector'); // Modo inicial
    guidesActive = false;
    updateGuideButton();
    refreshGuidesBox();
    if (ui.inspector.menu) ui.inspector.menu.classList.remove('active');
    ui.method.blendAmt.disabled = true;
    const picker = document.getElementById('colorPicker');
    if (picker) picker.addEventListener('input', (e)=> setColor(e.target.value));
});