/* ------------------------ Algoritmos ------------------------ */
function applyHighPass(ctx, w, h, intensity, radius){
    const tempC = document.createElement('canvas'); tempC.width=w; tempC.height=h;
    const tCtx = tempC.getContext('2d');
    const scale = 1/Math.max(1, radius/2);
    tCtx.drawImage(ctx.canvas, 0,0, w*scale, h*scale);
    tCtx.drawImage(tempC, 0,0, w*scale, h*scale, 0,0, w,h);

    const origData = ctx.getImageData(0,0,w,h);
    const blurData = tCtx.getImageData(0,0,w,h);
    const d = origData.data; const b = blurData.data;
    const factor = intensity/100;
    for (let i=0;i<d.length;i+=4){
        const hpR = (d[i]-b[i])+128;
        const hpG = (d[i+1]-b[i+1])+128;
        const hpB = (d[i+2]-b[i+2])+128;
        d[i]   = d[i]*(1-factor)+hpR*factor;
        d[i+1] = d[i+1]*(1-factor)+hpG*factor;
        d[i+2] = d[i+2]*(1-factor)+hpB*factor;
    }
    ctx.putImageData(origData,0,0);
}
function algoLinearBlend(src, blendAmt, useNoise){
    const w=src.width,h=src.height;
    const bx=Math.floor(w*blendAmt), by=Math.floor(h*blendAmt);
    const outW=w-bx, outH=h-by;

    const res=document.createElement('canvas'); res.width=outW; res.height=outH;
    const rCtx=res.getContext('2d');
    rCtx.drawImage(src,0,0,outW,outH,0,0,outW,outH);

    const createMask=(mw,mh,isVertical)=>{
        const m=document.createElement('canvas'); m.width=mw; m.height=mh;
        const mc=m.getContext('2d');
        const grad=isVertical? mc.createLinearGradient(0,0,0,mh): mc.createLinearGradient(0,0,mw,0);
        grad.addColorStop(0,'white'); grad.addColorStop(1,'transparent');
        mc.fillStyle=grad; mc.fillRect(0,0,mw,mh);
        if(useNoise){
            const noise=document.createElement('canvas'); noise.width=mw; noise.height=mh;
            const nc=noise.getContext('2d'); const id=nc.createImageData(mw,mh);
            for(let i=3;i<id.data.length;i+=4) id.data[i]=Math.random()*255;
            nc.putImageData(id,0,0);
            mc.globalCompositeOperation='multiply';
            mc.drawImage(noise,0,0);
        }
        return m;
    };

    // Horizontal strip
    const stripRight=document.createElement('canvas'); stripRight.width=bx; stripRight.height=outH;
    const srCtx=stripRight.getContext('2d');
    srCtx.drawImage(src, outW, 0, bx, outH, 0,0,bx,outH);
    const maskH=createMask(bx,outH,false);
    srCtx.globalCompositeOperation='destination-in'; srCtx.drawImage(maskH,0,0);
    rCtx.drawImage(stripRight,0,0);

    // Vertical strip
    const stripBottom=document.createElement('canvas'); stripBottom.width=outW; stripBottom.height=by;
    const sbCtx=stripBottom.getContext('2d');
    sbCtx.drawImage(src, 0, outH, outW, by, 0,0,outW,by);
    const maskV=createMask(outW,by,true);
    sbCtx.globalCompositeOperation='destination-in'; sbCtx.drawImage(maskV,0,0);
    rCtx.drawImage(stripBottom,0,0);

    // Corner
    const corner=document.createElement('canvas'); corner.width=bx; corner.height=by;
    const cCtx=corner.getContext('2d');
    cCtx.drawImage(src, outW, outH, bx,by, 0,0,bx,by);
    const cMask=document.createElement('canvas'); cMask.width=bx; cMask.height=by;
    const cmCtx=cMask.getContext('2d');
    cmCtx.drawImage(maskH,0,0,bx,by);
    cmCtx.globalCompositeOperation='destination-in';
    cmCtx.drawImage(maskV,0,0,bx,by);
    cCtx.globalCompositeOperation='destination-in';
    cCtx.drawImage(cMask,0,0);
    rCtx.drawImage(corner,0,0);

    return res;
}
function algoOffsetBlend(src, blendAmt){
    const w=src.width,h=src.height;
    const res=document.createElement('canvas'); res.width=w; res.height=h;
    const ctx=res.getContext('2d');

    const offset=document.createElement('canvas'); offset.width=w; offset.height=h;
    const oCtx=offset.getContext('2d');
    oCtx.drawImage(src, 0,0,w/2,h/2, w/2,h/2,w/2,h/2);
    oCtx.drawImage(src, w/2,0,w/2,h/2, 0,h/2,w/2,h/2);
    oCtx.drawImage(src, 0,h/2,w/2,h/2, w/2,0,w/2,h/2);
    oCtx.drawImage(src, w/2,h/2,w/2,h/2, 0,0,w/2,h/2);

    ctx.drawImage(offset,0,0);

    const center=document.createElement('canvas'); center.width=w; center.height=h;
    const cp=center.getContext('2d'); cp.drawImage(src,0,0);
    cp.globalCompositeOperation='destination-in';
    const g=cp.createRadialGradient(w/2,h/2,Math.min(w,h)*0.2, w/2,h/2,Math.min(w,h)*0.6);
    g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(1,'rgba(255,255,255,0)');
    cp.fillStyle=g; cp.fillRect(0,0,w,h);
    ctx.drawImage(center,0,0);
    return res;
}
function algoFrameSynthesis(src, blendAmt, type){
    const w=src.width,h=src.height;
    const res=document.createElement('canvas'); res.width=w; res.height=h;
    const ctx=res.getContext('2d');

    ctx.drawImage(src, 0,0,w/2,h/2, w/2,h/2,w/2,h/2);
    ctx.drawImage(src, w/2,0,w/2,h/2, 0,h/2,w/2,h/2);
    ctx.drawImage(src, 0,h/2,w/2,h/2, w/2,0,w/2,h/2);
    ctx.drawImage(src, 0+w/2, 0+h/2, w/2,h/2, 0,0,w/2,h/2);

    const overlay=document.createElement('canvas'); overlay.width=w; overlay.height=h;
    const oCtx=overlay.getContext('2d'); oCtx.drawImage(src,0,0);
    oCtx.globalCompositeOperation='destination-in';

    const m=document.createElement('canvas'); m.width=w; m.height=h;
    const mCtx=m.getContext('2d');
    const grd=mCtx.createRadialGradient(w/2,h/2,Math.min(w,h)*0.3, w/2,h/2,Math.min(w,h)*0.7);
    if(type==='hard'){ grd.addColorStop(0,'white'); grd.addColorStop(0.6,'white'); grd.addColorStop(1,'transparent'); }
    else { grd.addColorStop(0,'white'); grd.addColorStop(1,'transparent'); }

    mCtx.fillStyle=grd; mCtx.fillRect(0,0,w,h);

    if(type==='noise'){
        mCtx.globalCompositeOperation='source-atop';
        const noise=document.createElement('canvas'); noise.width=w; noise.height=h;
        const n=noise.getContext('2d'); const id=n.createImageData(w,h);
        for(let i=0;i<id.data.length;i+=4){
            const v=150+Math.random()*105;
            id.data[i]=v; id.data[i+1]=v; id.data[i+2]=v; id.data[i+3]=255;
        }
        n.putImageData(id,0,0);
        mCtx.drawImage(noise,0,0);
    }
    oCtx.drawImage(m,0,0);
    ctx.drawImage(overlay,0,0);
    return res;
}

function resizeCanvas(srcCanvas, w, h){
    const c=document.createElement('canvas'); c.width=w; c.height=h;
    const cx=c.getContext('2d');
    cx.imageSmoothingEnabled=true; cx.imageSmoothingQuality='high';
    cx.drawImage(srcCanvas, 0,0, srcCanvas.width,srcCanvas.height, 0,0, w,h);
    return c;
}

function renderTileToCanvas(texture, ui){
    const rx=2, ry=2;
    const seamC=getSeamColor(ui);

    const c=document.createElement('canvas'); c.width=texture.width*rx; c.height=texture.height*ry;
    const cx=c.getContext('2d');
    for(let y=0;y<ry;y++) for(let x=0;x<rx;x++) cx.drawImage(texture, x*texture.width, y*texture.height);
    if (seamC!=='none'){
        cx.strokeStyle=seamC; cx.lineWidth=2; cx.beginPath();
        for(let i=1;i<rx;i++){ cx.moveTo(i*texture.width,0); cx.lineTo(i*texture.width,c.height); }
        for(let i=1;i<ry;i++){ cx.moveTo(0,i*texture.height); cx.lineTo(c.width,i*texture.height); }
        cx.stroke();
    }
    return c;
}
function renderInspectorToCanvas(texture, state, ui){
    const vpRect = ui.viewport.getBoundingClientRect();
    const w = Math.floor(vpRect.width*0.95), h=Math.floor(vpRect.height*0.90);
    const c=document.createElement('canvas'); c.width=w; c.height=h;
    const cx=c.getContext('2d');

    const p = cx.createPattern(texture,'repeat');
    if (p && p.setTransform){
        const s = state.zoom/100;
        const m = new DOMMatrix().scale(s,s).translate(state.pan.x / s, state.pan.y / s);
        p.setTransform(m);
    }
    cx.fillStyle = p;
    cx.fillRect(0,0,w,h);

    const seamC=getSeamColor(ui);
    if (seamC!=='none'){
        const s = state.zoom/100;
        const stepX = texture.width * s;
        const stepY = texture.height * s;
        const offX = ((state.pan.x % stepX)+stepX)%stepX;
        const offY = ((state.pan.y % stepY)+stepY)%stepY;

        cx.strokeStyle=seamC; cx.lineWidth=1; cx.beginPath();
        for (let x=offX; x<w; x+=stepX){ cx.moveTo(x,0); cx.lineTo(x,h); }
        for (let y=offY; y<h; y+=stepY){ cx.moveTo(0,y); cx.lineTo(w,y); }
        cx.stroke();
    }
    return c;
}

function getSeamColor(ui){
    if (!ui || !ui.seamColor || !ui.seamColor.value) return 'none';
    return ui.seamColor.value;
}
