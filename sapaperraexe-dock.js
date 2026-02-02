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
                z-index: 10001;
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

            <!-- Margoria Notarium Module -->
            <div class="dock-item module-link" data-module="margoria" data-url="https://sapaperraexe.github.io/margoria/Margoria-notarium.html">
                <svg viewBox="0 0 239 215">
                    <defs><clipPath id="margoria-clip"><rect x="1275" y="1736" width="239" height="215"/></clipPath></defs>
                    <g clip-path="url(#margoria-clip)" transform="translate(-1275 -1736)">
                        <path d="M1481.91 1846.84C1491.14 1846.84 1499.27 1867.09 1492.68 1873.67 1491.02 1875.33 1487.87 1875.56 1485.53 1874.19 1484.68 1873.7 1483.69 1871.7 1483.32 1869.74 1482.96 1867.79 1481.63 1863.76 1480.38 1860.79 1476.79 1852.28 1477.39 1846.84 1481.91 1846.84ZM1307.31 1846.41C1308.51 1846.05 1309.6 1846.15 1310.43 1846.84 1313.26 1849.18 1311.35 1862.34 1306.74 1872.32 1305.27 1875.5 1300.45 1876.04 1297.74 1873.32 1295.49 1871.08 1295.08 1864.29 1296.89 1859.02 1299.02 1852.78 1303.69 1847.49 1307.31 1846.41ZM1500.68 1828.91C1499.09 1828.91 1494.27 1831.19 1491.47 1833.26 1491.29 1833.39 1491.42 1833.96 1491.76 1834.51 1492.88 1836.31 1500.31 1835.71 1502.16 1833.66 1504.22 1831.4 1503.45 1828.91 1500.68 1828.91ZM1290.25 1828.91C1287.66 1828.91 1287.69 1830.57 1290.33 1833.38 1292.54 1835.72 1297.66 1836.1 1298.36 1833.97 1298.81 1832.6 1292.9 1828.91 1290.25 1828.91ZM1295.9 1819.99C1300.48 1821.38 1305.18 1824.17 1309.37 1828.18 1315.32 1833.88 1315.14 1838.49 1308.81 1841.76 1305.31 1843.57 1291.99 1844.4 1287.76 1843.08 1280.11 1840.68 1275.93 1833.31 1277.94 1825.77 1278.75 1822.73 1279.6 1821.85 1283.2 1820.25 1286.88 1818.63 1291.33 1818.6 1295.9 1819.99ZM1499 1818.92C1504.38 1818.28 1509.06 1819.96 1511.84 1824.1 1515.89 1830.1 1513.46 1839.43 1507.06 1842.47 1503.22 1844.29 1494.68 1844.4 1488.44 1842.72 1482.83 1841.21 1478.27 1837.91 1477.49 1834.8 1476.95 1832.66 1477.57 1831.68 1481.97 1827.63 1487.55 1822.51 1493.63 1819.56 1499 1818.92ZM1306.24 1793.49C1304.69 1794.45 1305.05 1797.47 1307.24 1801.82 1311.33 1809.92 1312.5 1809.72 1311.42 1801.11 1310.79 1796.02 1308.23 1792.26 1306.24 1793.49ZM1484.01 1793.31C1482.62 1792.82 1479.05 1800.56 1479.05 1804.06 1479.05 1806.92 1480.6 1806.6 1483.13 1803.22 1485.23 1800.42 1485.8 1793.94 1484.01 1793.31ZM1483.03 1781.83C1484.83 1781.88 1486.63 1782.56 1488.59 1783.87 1498.36 1790.39 1496.58 1804.7 1484.56 1816.32 1479.75 1820.96 1472.83 1826.15 1471.6 1826.02 1471.28 1825.99 1470.06 1825.58 1468.9 1825.11 1466.53 1824.16 1466.31 1822.59 1467.78 1817.3 1468.33 1815.33 1469.32 1808.46 1469.99 1802.03 1471.3 1789.33 1472.38 1786.66 1477.45 1783.58 1479.43 1782.37 1481.24 1781.79 1483.03 1781.83ZM1308.19 1781.82C1309.58 1781.76 1310.92 1782.18 1312.61 1783.05 1318.84 1786.29 1321.3 1791.69 1321.3 1802.1 1321.3 1805.88 1321.94 1812.04 1322.73 1815.78 1324.05 1822.05 1324.04 1822.73 1322.58 1824.34 1319.7 1827.52 1317.42 1826.42 1308.79 1817.67 1304.19 1813 1299.67 1807.45 1298.64 1805.17 1294.8 1796.72 1296.95 1786.91 1303.41 1783.45 1305.34 1782.42 1306.8 1781.88 1308.19 1781.82ZM1391.75 1778.74C1390.79 1779.2 1389.69 1780.23 1388.29 1781.69 1383.96 1786.24 1377.88 1798.37 1371.93 1814.35 1367.09 1827.35 1362.37 1845.15 1363.2 1847.3 1363.69 1848.58 1367.08 1848.73 1389.99 1848.51L1416.23 1848.26 1415.95 1845.6C1415.63 1842.58 1407.54 1815.62 1400.53 1794.24 1396.26 1781.19 1394.64 1777.37 1391.75 1778.74ZM1394.91 1768.52C1399.52 1768.52 1400.93 1768.9 1402.5 1770.59 1405.49 1773.79 1431.56 1855.01 1430.49 1857.79 1430.07 1858.89 1423.17 1859.11 1388.87 1859.11 1366.25 1859.11 1347.75 1858.94 1347.75 1858.74 1347.75 1858.53 1348.57 1855.67 1349.59 1852.37 1350.6 1849.07 1352.77 1841.06 1354.41 1834.57 1360.22 1811.57 1372.19 1783.22 1379.49 1775.14 1384.07 1770.07 1387.67 1768.52 1394.91 1768.52ZM1476.75 1746.01C1475.21 1746.08 1473.29 1746.84 1470.35 1748.33 1461.45 1752.84 1447.71 1757.25 1436.15 1759.3 1426.16 1761.08 1421.13 1761.34 1395.92 1761.39 1371.83 1761.43 1365.49 1761.15 1357.19 1759.68 1344.93 1757.51 1334.84 1754.39 1324.45 1749.57 1315.57 1745.46 1314.15 1745.22 1311.12 1747.33 1305.99 1750.93 1306.59 1755.94 1312.52 1758.91 1317.55 1761.43 1318.5 1761.6 1342.37 1764.26 1354.11 1765.57 1364.83 1767.07 1366.19 1767.58 1369.26 1768.75 1369.41 1768.18 1360.47 1788.81 1352.49 1807.21 1346.65 1822.27 1336.88 1849.67 1326.58 1878.53 1316.39 1904.8 1311.91 1913.98 1307.11 1923.84 1300.68 1930.63 1292.21 1934.8 1288.95 1936.41 1286.05 1938.09 1285.78 1938.53 1284.69 1940.29 1288.83 1940.45 1297.98 1938.99 1315.04 1936.27 1318.97 1936.19 1333.54 1938.35 1346.81 1940.31 1351.53 1940.3 1351.53 1938.33 1351.53 1937.81 1350.78 1937.13 1349.87 1936.83 1343.07 1934.59 1338.52 1931.55 1336.36 1927.78 1334.24 1924.08 1334.05 1922.78 1334.09 1911.96 1334.14 1897.72 1336.48 1887.08 1342.14 1875.39L1345.91 1867.6 1389.68 1867.6 1433.45 1867.6 1435.85 1873.03C1442.14 1887.24 1446.08 1902.57 1446.31 1913.7 1446.58 1926.8 1444.24 1931.65 1435.48 1936.08 1432.94 1937.36 1430.87 1938.83 1430.87 1939.34 1430.87 1940.53 1429.94 1940.58 1448.98 1938.3 1467.15 1936.11 1476.08 1936.32 1491.33 1939.28 1496.27 1940.24 1500.38 1941.06 1500.46 1941.11 1500.55 1941.17 1501.3 1940.95 1502.12 1940.64 1504.66 1939.66 1503.8 1938.61 1498.49 1936.17 1489.76 1932.18 1485.05 1927 1479.47 1915.26 1472.91 1901.45 1453.19 1840.88 1440.15 1794.47 1438.16 1787.37 1434.65 1771.06 1434.65 1768.86 1434.65 1766.76 1438.68 1765.69 1455.91 1763.23 1475.35 1760.46 1482.16 1757.8 1482.65 1752.8 1482.85 1750.67 1482.33 1749.25 1480.81 1747.84 1479.43 1746.56 1478.29 1745.94 1476.75 1746.01ZM1314.69 1736C1318.81 1735.97 1321.62 1736.77 1328.38 1739.87 1344.96 1747.47 1360.03 1750.45 1386.01 1751.24 1418.31 1752.22 1443.1 1748.76 1461.69 1740.69 1477.58 1733.78 1485.64 1734.52 1490.82 1743.36 1495.38 1751.13 1493.46 1760.62 1486.29 1765.81 1481.16 1769.52 1473.36 1771.76 1458.51 1773.78 1451.62 1774.72 1445.99 1775.78 1445.99 1776.14 1445.99 1779.85 1467.54 1849.47 1480.73 1888.36 1490.14 1916.09 1495.83 1925.94 1503.39 1927.59 1511.36 1929.32 1514.01 1932.3 1514 1939.51 1514 1944.9 1511.23 1949.34 1507.17 1950.45 1503.62 1951.43 1501.49 1951.24 1487.74 1948.68 1475.95 1946.49 1460.95 1946.33 1451.54 1948.31 1447.77 1949.1 1441.53 1950.09 1437.69 1950.5 1431.67 1951.15 1430.2 1951 1427.24 1949.43 1420.98 1946.13 1419.54 1944.2 1419.54 1939.09 1419.54 1932.95 1420.74 1931.02 1426 1928.74 1428.42 1927.69 1431.57 1925.74 1433 1924.41 1435.24 1922.31 1435.6 1921.25 1435.6 1916.62 1435.6 1909.38 1433.37 1897.25 1430.15 1886.95L1427.5 1878.45 1390.06 1878.21 1352.62 1877.96 1350.66 1880.46C1348.15 1883.64 1347.18 1887.47 1345.81 1899.51 1344.4 1911.83 1344.9 1920.66 1347.13 1923.12 1348.04 1924.13 1351.35 1925.88 1354.49 1927.02 1359.27 1928.77 1360.41 1929.63 1361.56 1932.37 1364.01 1938.22 1360.95 1946.31 1355.17 1949.3 1351.83 1951.02 1348.47 1950.86 1334.99 1948.35 1324.48 1946.38 1312.2 1946.53 1300.72 1948.76 1288.93 1951.05 1285.25 1951.11 1281.01 1949.1 1275.39 1946.43 1273.41 1939.3 1276.36 1932.26 1277.51 1929.5 1278.48 1928.81 1283 1927.5 1291.08 1925.15 1295.53 1921.19 1300.42 1911.99 1305.34 1902.71 1315.32 1877.63 1323.16 1854.86 1330.24 1834.29 1348.06 1789.31 1351.62 1783.03 1353.13 1780.37 1354.36 1777.76 1354.36 1777.22 1354.36 1776.66 1350.46 1775.97 1345.15 1775.61 1332.54 1774.74 1317.43 1772.51 1312.58 1770.8 1302.7 1767.33 1297.68 1761.13 1297.68 1752.41 1297.68 1742.65 1304.51 1736.06 1314.69 1736Z" fill-rule="evenodd" /></g>
                </svg>
                <div class="tooltip">
                    <span class="tooltip-title">Margoria Notarium</span>
                    <span class="tooltip-desc">Registro y notación de sistemas.</span>
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