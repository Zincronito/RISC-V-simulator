// ============================================
// VISUALIZADOR DEL DATAPATH
// ============================================

class DatapathVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.activeModules = {};
    }

    render() {
        this.container.innerHTML = `
            <svg width="100%" height="550" viewBox="0 0 1100 550" class="mx-auto">
                <!-- Definiciones -->
                <defs>
                    <marker id="arrowblue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="#60a5fa" />
                    </marker>
                    <marker id="arrowgreen" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="#34d399" />
                    </marker>
                    <marker id="arrowyellow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="#fbbf24" />
                    </marker>
                </defs>

                <!-- PC (Program Counter) -->
                <g id="pc-module">
                    <rect x="30" y="60" width="70" height="50" fill="#1f2937" stroke="#60a5fa" stroke-width="3" rx="5" />
                    <text x="65" y="82" text-anchor="middle" fill="white" font-size="16" font-weight="bold">PC</text>
                    <text x="65" y="100" text-anchor="middle" fill="#fbbf24" font-size="14" font-weight="bold" id="pc-value">0</text>
                </g>

                <!-- Sumador +4 -->
                <g id="adder-module">
                    <circle cx="65" cy="150" r="20" fill="#374151" stroke="#9ca3af" stroke-width="2" />
                    <text x="65" y="155" text-anchor="middle" fill="white" font-size="14" font-weight="bold">+4</text>
                </g>

                <!-- Conexión PC a +4 -->
                <line x1="65" y1="110" x2="65" y2="130" stroke="#60a5fa" stroke-width="2" />

                <!-- Memoria de Instrucciones -->
                <g id="imem-module">
                    <rect x="150" y="40" width="100" height="90" fill="#1f2937" stroke="#60a5fa" stroke-width="3" rx="5" />
                    <text x="200" y="65" text-anchor="middle" fill="white" font-size="14" font-weight="bold">Memoria de</text>
                    <text x="200" y="85" text-anchor="middle" fill="white" font-size="14" font-weight="bold">Instrucciones</text>
                    <text x="200" y="115" text-anchor="middle" fill="#60a5fa" font-size="10">IMEM</text>
                </g>

                <!-- Conexión PC a IMEM -->
                <line x1="100" y1="85" x2="150" y2="85" stroke="#60a5fa" stroke-width="3" marker-end="url(#arrowblue)" />

                <!-- Unidad de Control -->
                <g id="control-module">
                    <rect x="300" y="30" width="120" height="70" fill="#1f2937" stroke="#a78bfa" stroke-width="3" rx="5" />
                    <text x="360" y="55" text-anchor="middle" fill="white" font-size="16" font-weight="bold">Unidad de</text>
                    <text x="360" y="75" text-anchor="middle" fill="white" font-size="16" font-weight="bold">Control</text>
                    <text x="360" y="92" text-anchor="middle" fill="#a78bfa" font-size="10">CU</text>
                </g>

                <!-- Conexión IMEM a Control -->
                <line x1="250" y1="85" x2="300" y2="60" stroke="#60a5fa" stroke-width="2" stroke-dasharray="4,4" />

                <!-- Banco de Registros -->
                <g id="regfile-module">
                    <rect x="150" y="200" width="120" height="140" fill="#1f2937" stroke="#34d399" stroke-width="3" rx="5" />
                    <text x="210" y="225" text-anchor="middle" fill="white" font-size="16" font-weight="bold">Banco de</text>
                    <text x="210" y="245" text-anchor="middle" fill="white" font-size="16" font-weight="bold">Registros</text>
                    <text x="160" y="270" fill="#fbbf24" font-size="12">rs1 →</text>
                    <text x="160" y="290" fill="#fbbf24" font-size="12">rs2 →</text>
                    <text x="160" y="325" fill="#34d399" font-size="12">rd ←</text>
                </g>

                <!-- Conexión IMEM a RegFile -->
                <line x1="230" y1="130" x2="230" y2="200" stroke="#60a5fa" stroke-width="3" />

                <!-- Sign Extend -->
                <g id="signext-module">
                    <rect x="300" y="140" width="100" height="50" fill="#374151" stroke="#9ca3af" stroke-width="2" rx="5" />
                    <text x="350" y="165" text-anchor="middle" fill="white" font-size="13">Sign</text>
                    <text x="350" y="180" text-anchor="middle" fill="white" font-size="13">Extend</text>
                </g>

                <!-- Conexión IMEM a Sign Extend -->
                <line x1="230" y1="130" x2="280" y2="165" stroke="#60a5fa" stroke-width="2" stroke-dasharray="4,4" />

                <!-- MUX antes de ALU -->
                <g id="mux-module">
                    <polygon points="350,280 350,340 400,310" fill="#6b7280" stroke="#9ca3af" stroke-width="2" />
                    <text x="370" y="313" text-anchor="middle" fill="white" font-size="11">MUX</text>
                </g>

                <!-- Conexión RegFile a ALU (rs1) -->
                <line x1="270" y1="260" x2="420" y2="260" stroke="#34d399" stroke-width="3" marker-end="url(#arrowgreen)" />

                <!-- Conexión RegFile a MUX (rs2) -->
                <line x1="270" y1="280" x2="350" y2="310" stroke="#34d399" stroke-width="3" />

                <!-- Conexión Sign Extend a MUX -->
                <line x1="400" y1="165" x2="370" y2="280" stroke="#60a5fa" stroke-width="2" stroke-dasharray="4,4" />

                <!-- Conexión MUX a ALU -->
                <line x1="400" y1="310" x2="420" y2="310" stroke="#34d399" stroke-width="3" />

                <!-- ALU -->
                <g id="alu-module">
                    <polygon points="420,220 420,350 570,320 570,250" fill="#1f2937" stroke="#fbbf24" stroke-width="3" />
                    <text x="485" y="290" text-anchor="middle" fill="white" font-size="22" font-weight="bold">ALU</text>
                </g>

                <!-- Memoria de Datos -->
                <g id="dmem-module">
                    <rect x="640" y="230" width="120" height="110" fill="#1f2937" stroke="#60a5fa" stroke-width="3" rx="5" />
                    <text x="700" y="265" text-anchor="middle" fill="white" font-size="16" font-weight="bold">Memoria</text>
                    <text x="700" y="285" text-anchor="middle" fill="white" font-size="16" font-weight="bold">de Datos</text>
                    <text x="700" y="325" text-anchor="middle" fill="#60a5fa" font-size="10">DMEM</text>
                </g>

                <!-- Conexión ALU a DMEM -->
                <line x1="570" y1="285" x2="640" y2="285" stroke="#fbbf24" stroke-width="3" marker-end="url(#arrowyellow)" />

                <!-- MUX Writeback -->
                <g id="mux-wb-module">
                    <polygon points="820,250 820,320 870,285" fill="#6b7280" stroke="#9ca3af" stroke-width="2" />
                    <text x="845" y="288" text-anchor="middle" fill="white" font-size="11">MUX</text>
                </g>

                <!-- Conexión DMEM a MUX WB -->
                <line x1="760" y1="285" x2="820" y2="285" stroke="#10b981" stroke-width="3" />

                <!-- Conexión ALU directa a MUX WB -->
                <line x1="570" y1="270" x2="600" y2="270" stroke="#fbbf24" stroke-width="2" />
                <line x1="600" y1="270" x2="600" y2="250" stroke="#fbbf24" stroke-width="2" />
                <line x1="600" y1="250" x2="820" y2="250" stroke="#fbbf24" stroke-width="2" stroke-dasharray="4,4" />

                <!-- Path Writeback -->
                <line id="conn-wb-right" x1="870" y1="285" x2="930" y2="285" stroke="#10b981" stroke-width="3" />
                <line id="conn-wb-down" x1="930" y1="285" x2="930" y2="450" stroke="#10b981" stroke-width="3" />
                <line id="conn-wb-left" x1="930" y1="450" x2="210" y2="450" stroke="#10b981" stroke-width="3" />
                <line id="conn-wb-up" x1="210" y1="450" x2="210" y2="340" stroke="#10b981" stroke-width="3" marker-end="url(#arrowgreen)" />

                <!-- Señales de control desde CU -->
                <line x1="360" y1="100" x2="360" y2="180" stroke="#a78bfa" stroke-width="2" stroke-dasharray="4,4" />
                <line x1="360" y1="180" x2="240" y2="210" stroke="#a78bfa" stroke-width="2" stroke-dasharray="4,4" />
                <line x1="360" y1="180" x2="485" y2="220" stroke="#a78bfa" stroke-width="2" stroke-dasharray="4,4" />
                <line x1="360" y1="180" x2="700" y2="230" stroke="#a78bfa" stroke-width="2" stroke-dasharray="4,4" />

                <!-- Etiquetas de señales -->
                <text x="110" y="75" fill="#60a5fa" font-size="10">PC</text>
                <text x="290" y="255" fill="#34d399" font-size="10">RD1</text>
                <text x="290" y="295" fill="#34d399" font-size="10">RD2</text>
                <text x="600" y="275" fill="#fbbf24" font-size="10">ALU out</text>
                <text x="950" y="280" fill="#10b981" font-size="10">WB</text>

                <!-- Leyenda -->
                <g transform="translate(20, 450)">
                    <text x="0" y="0" fill="white" font-size="12" font-weight="bold">Leyenda:</text>
                    <line x1="0" y1="15" x2="30" y2="15" stroke="#60a5fa" stroke-width="3" />
                    <text x="35" y="18" fill="#9ca3af" font-size="10">Instrucciones</text>
                    
                    <line x1="120" y1="15" x2="150" y2="15" stroke="#34d399" stroke-width="3" />
                    <text x="155" y="18" fill="#9ca3af" font-size="10">Datos</text>
                    
                    <line x1="210" y1="15" x2="240" y2="15" stroke="#fbbf24" stroke-width="3" />
                    <text x="245" y="18" fill="#9ca3af" font-size="10">ALU</text>
                    
                    <line x1="290" y1="15" x2="320" y2="15" stroke="#a78bfa" stroke-width="2" stroke-dasharray="4,4" />
                    <text x="325" y="18" fill="#9ca3af" font-size="10">Control</text>
                </g>
            </svg>
        `;
    }

    highlightModule(moduleName, active) {
        const module = document.getElementById(`${moduleName}-module`);
        if (module) {
            const shapes = module.querySelectorAll('rect, polygon, circle');
            shapes.forEach(shape => {
                if (active) {
                    const currentFill = shape.getAttribute('fill');
                    // Cambiar a color más brillante
                    if (moduleName === 'pc' || moduleName === 'imem' || moduleName === 'dmem') {
                        shape.setAttribute('fill', '#3b82f6');
                    } else if (moduleName === 'regfile') {
                        shape.setAttribute('fill', '#10b981');
                    } else if (moduleName === 'control') {
                        shape.setAttribute('fill', '#8b5cf6');
                    } else if (moduleName === 'alu') {
                        shape.setAttribute('fill', '#f59e0b');
                    }
                    shape.classList.add('module-active');
                } else {
                    shape.setAttribute('fill', '#1f2937');
                    shape.classList.remove('module-active');
                }
            });
        }
    }

    updatePC(value) {
        const pcText = document.getElementById('pc-value');
        if (pcText) {
            pcText.textContent = value;
        }
    }

    reset() {
        // Limpiar todos los módulos
        const modules = ['pc', 'imem', 'control', 'regfile', 'alu', 'dmem', 'mux', 'signext', 'adder', 'mux-wb'];
        modules.forEach(module => {
            this.highlightModule(module, false);
        });
        this.updatePC(0);
    }
}