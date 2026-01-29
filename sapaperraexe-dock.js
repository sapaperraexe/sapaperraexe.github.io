class SapaperraDock extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const isPlayground = this.hasAttribute('playground');
        this.render(isPlayground);
    }

    render(isPlayground) {
        this.shadowRoot.innerHTML = `
        <style>
            :host {
                --panel-bg: rgba(26, 26, 26, 0.95);
                --border: rgba(192, 192, 192, 0.15);
                --accent: #8a8ad4;
                --blur: blur(12px);
                --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                --text-color: #c0c0c0;
                --tooltip-bg: #1a1a1a;
                display: block;
                position: fixed;
                top: 30px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 10000;
                font-family: "Courier New", Courier, monospace;
            }

            #dock {
                background: var(--panel-bg);
                backdrop-filter: var(--blur);
                -webkit-backdrop-filter: var(--blur);
                border: 1px solid var(--border);
                border-radius: 30px;
                padding: 10px;
                display: flex;
                gap: 12px;
                align-items: center;
                transition: var(--transition);
                width: auto;
                overflow: hidden;
                justify-content: center;
                box-sizing: border-box;
            }

            .dock-item {
                width: 50px;
                height: 50px;
                min-width: 50px;
                border-radius: 14px;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                transition: var(--transition);
                background: rgba(255, 255, 255, 0.03);
                position: relative;
                border: 1px solid transparent;
            }

            @keyframes pulse-hint {
                0% { box-shadow: 0 0 0 0 rgba(138, 138, 212, 0.4); border-color: transparent; }
                50% { box-shadow: 0 0 15px 5px rgba(138, 138, 212, 0.2); border-color: var(--accent); }
                100% { box-shadow: 0 0 0 0 rgba(138, 138, 212, 0); border-color: transparent; }
            }

            .pulse-hint {
                animation: pulse-hint 2s infinite ease-in-out;
            }

            .dock-item:hover {
                background: rgba(255, 255, 255, 0.08);
                transform: translateY(3px);
                border-color: var(--border);
                animation: none;
            }

            .dock-item svg {
                width: 26px;
                height: 26px;
                fill: var(--text-color);
                transition: var(--transition);
            }

            .dock-item.active {
                background: rgba(138, 138, 212, 0.2);
                border-color: var(--accent);
                animation: none;
            }

            .dock-item.active svg { fill: var(--accent); }

            /* Tooltip styling */
            .dock-item .tooltip {
                position: absolute;
                top: 70px;
                background: var(--tooltip-bg);
                padding: 8px 14px;
                border-radius: 10px;
                opacity: 0;
                pointer-events: none;
                transition: var(--transition);
                border: 1px solid var(--border);
                color: var(--text-color);
                width: 180px;
                text-align: left;
                box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            }

            .dock-item:hover .tooltip {
                opacity: 1;
                top: 62px;
            }

            .tooltip-title {
                display: block;
                font-weight: bold;
                font-size: 11px;
                color: var(--accent);
                margin-bottom: 4px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            .tooltip-desc {
                display: block;
                font-size: 10px;
                line-height: 1.4;
                opacity: 0.8;
            }

            .separator {
                width: 1px;
                height: 24px;
                background: var(--border);
                margin: 0 5px;
            }

            .module-link { 
                display: ${isPlayground ? 'flex' : 'none'}; 
            }
        </style>

        <div id="dock">
            ${isPlayground ? `
                <div class="dock-item" id="back-home">
                    <svg viewBox="0 0 24 24"><path d="M20,11H7.83l5.59-5.59L12,4l-8,8l8,8l1.41-1.41L7.83,13H20V11z"/></svg>
                    <div class="tooltip">
                        <span class="tooltip-title">Terminate Session</span>
                        <span class="tooltip-desc">Eject from the playground and return to the primary OS interface.</span>
                    </div>
                </div>
                <div class="separator"></div>
            ` : `
                <div class="dock-item pulse-hint" id="goto-playground">
                    <svg viewBox="0 0 24 24"><path d="M18.5,10c-1,0-1.8,0.4-2.5,1.1L12,15.1l-4-4.1C7.3,10.4,6.5,10,5.5,10C3.6,10,2,11.6,2,13.5C2,15.4,3.6,17,5.5,17 c1,0,1.8-0.4,2.5-1.1l4-4.1l4,4.1c0.7,0.7,1.5,1.1,2.5,1.1c1.9,0,3.5-1.6,3.5-3.5C22,11.6,20.4,10,18.5,10z M5.5,15.5 C4.4,15.5,3.5,14.6,3.5,13.5c0-1.1,0.9-1.9,1.9-1.9c0.5,0,1,0.2,1.3,0.5l3.2,3.3C9.5,15.7,8.5,15.5,5.5,15.5z M18.5,15.5 c-0.6,0-1.1-0.2-1.4-0.6l-3.2-3.3c0.4-0.4,0.9-0.6,1.4-0.6c1.1,0,1.9,0.9,1.9,1.9C20.5,14.6,19.6,15.5,18.5,15.5z" /></svg>
                    <div class="tooltip">
                        <span class="tooltip-title">Enter Playground</span>
                        <span class="tooltip-desc">Access experimental tools and active sub-modules. Proceed with caution.</span>
                    </div>
                </div>
            `}

            <div class="dock-item module-link ${isPlayground ? 'pulse-hint' : ''}" data-module="continuum" data-url="continuum.html">
                <svg viewBox="0 0 24 24"><path d="M21,16.5L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5L11.43,2.18C11.59,2.06 11.79,2 12,2L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5Z" /></svg>
                <div class="tooltip">
                    <span class="tooltip-title">Continuum</span>
                    <span class="tooltip-desc">Seamless texture inspector with advanced tiling and ratio verification tools.</span>
                </div>
            </div>
            
            <div class="dock-item module-link" data-module="infinity" data-url="about:blank">
                <svg viewBox="0 0 24 24"><path d="M18.18,8.13c-1.31,0-2.58,0.58-3.48,1.52L12,12.5l-2.7,2.85c-0.9,0.94-2.17,1.52-3.48,1.52c-2.61,0-4.72-2.11-4.72-4.72 c0-2.61,2.11-4.72,4.72-4.72c1.31,0,2.58,0.58,3.48,1.52l1,1.06L11.5,8.73l-1.01-1.07C9.3,6.48,7.7,5.78,6.03,5.78 c-3.3,0-5.97,2.67-5.97,5.97s2.67,5.97,5.97,5.97c1.67,0,3.27-0.7,4.46-1.88L12,14.34l1.51,1.6c1.19,1.18,2.79,1.88,4.46,1.88 c3.3,0,5.97-2.67,5.97-5.97s-2.67-5.97-5.97-5.97c-1.67,0-3.27,0.7-4.46,1.88l-0.21,0.22l1.19,1.13l0.21-0.22 C15.42,8.65,16.74,8.13,18.18,8.13z M18.18,15.5c-1.31,0-2.58-0.58-3.48-1.52L12,11.5l2.7-2.85c0.9-0.94,2.17-1.52,3.48-1.52 c2.61,0,4.72,2.11,4.72,4.72S20.79,15.5,18.18,15.5z" /></svg>
                <div class="tooltip">
                    <span class="tooltip-title">Infinity</span>
                    <span class="tooltip-desc">
                        <!-- 
                        TODO: Finalize official description for Infinity Engine.
                        Placeholder: Recursive procedural logic and world-building engine.
                        -->
                        Procedural generation and recursive logic engine (Classification: Restricted).
                    </span>
                </div>
            </div>
        </div>
        `;

        this.setupEvents(isPlayground);
    }

    setupEvents(isPlayground) {
        if (!isPlayground) {
            const gotoPlayground = this.shadowRoot.getElementById('goto-playground');
            if (gotoPlayground) {
                gotoPlayground.addEventListener('click', () => {
                    gotoPlayground.classList.remove('pulse-hint');
                    window.location.href = 'playground.html';
                });
            }
        } else {
            const backHome = this.shadowRoot.getElementById('back-home');
            if (backHome) {
                backHome.addEventListener('click', () => {
                    window.location.href = 'index.html';
                });
            }

            const items = this.shadowRoot.querySelectorAll('.module-link');
            items.forEach(item => {
                item.addEventListener('click', () => {
                    const moduleName = item.dataset.module;
                    const moduleUrl = item.dataset.url;
                    
                    items.forEach(i => {
                        i.classList.remove('active');
                        i.classList.remove('pulse-hint');
                    });
                    item.classList.add('active');

                    window.dispatchEvent(new CustomEvent('module-change', { 
                        detail: { 
                            module: moduleName,
                            url: moduleUrl
                        } 
                    }));
                });
            });
        }
    }
}

customElements.define('sapaperra-dock', SapaperraDock);