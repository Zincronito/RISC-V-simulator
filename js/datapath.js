// ============================================
// VISUALIZADOR DE DATAPATH RISC-V - REORGANIZADO
// Layout mejorado sin superposiciones
// ============================================

class DatapathVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.activeModules = new Set();
        this.activeWires = new Set();
        this.signalValues = new Map();
    }

    render() {
        this.container.innerHTML = `
            <svg width="100%" height="1200" viewBox="0 0 2200 1200" class="mx-auto" style="background: #0a0e1a;">
                <defs>
                    <filter id="glow-strong">
                        <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    
                    <filter id="glow-module">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>

                <!-- Título -->
                <text x="1100" y="40" text-anchor="middle" fill="white" font-size="26" font-weight="bold">
                    RISC-V Single-Cycle Datapath - Reorganizado
                </text>

                <!-- ==================== NIVEL SUPERIOR: CONTROL UNIT ==================== -->
                
                <!-- Unidad de Control - ARRIBA CENTRADA -->
                <g id="control-module" class="module" opacity="0.4">
                    <rect x="800" y="80" width="280" height="100" fill="#1e293b" stroke="#a78bfa" stroke-width="4" rx="8" />
                    <text x="940" y="115" text-anchor="middle" fill="white" font-size="20" font-weight="bold">Control Unit</text>
                    <text x="940" y="142" text-anchor="middle" fill="#a78bfa" font-size="13">ALUOp | MemRd | MemWr | RegWr</text>
                    <text x="940" y="163" text-anchor="middle" fill="#a78bfa" font-size="13">ALUSrc | MemToReg | Branch</text>
                    <circle cx="800" cy="130" r="4" fill="#a78bfa"/>
                </g>

                <!-- ==================== FILA 1: PC + IMEM ==================== -->
                
                <!-- MUX Branch - Izquierda -->
                <g id="mux-branch-module" class="module" opacity="0.4">
                    <polygon points="80,240 80,360 170,300" fill="#1e3a5f" stroke="#60a5fa" stroke-width="3" />
                    <text x="120" y="303" text-anchor="middle" fill="white" font-size="14" font-weight="bold">MUX</text>
                    <text x="120" y="320" text-anchor="middle" fill="#a78bfa" font-size="11">PCSrc</text>
                    <circle cx="80" cy="270" r="4" fill="#60a5fa"/>
                    <circle cx="80" cy="330" r="4" fill="#60a5fa"/>
                    <circle cx="170" cy="300" r="4" fill="#60a5fa"/>
                    <circle cx="125" cy="240" r="3" fill="#f87171"/>
                </g>

                <!-- PC -->
                <g id="pc-module" class="module" opacity="0.4">
                    <rect x="220" y="260" width="140" height="90" fill="#1e293b" stroke="#60a5fa" stroke-width="4" rx="8" />
                    <text x="290" y="295" text-anchor="middle" fill="white" font-size="18" font-weight="bold">PC</text>
                    <text x="290" y="325" text-anchor="middle" fill="#fbbf24" font-size="24" font-weight="bold" id="pc-value">0</text>
                    <circle cx="220" cy="305" r="4" fill="#60a5fa"/>
                    <circle cx="360" cy="305" r="4" fill="#60a5fa"/>
                </g>

                <!-- Sumador +4 -->
                <g id="adder4-module" class="module" opacity="0.4">
                    <circle cx="290" cy="420" r="40" fill="#1e293b" stroke="#60a5fa" stroke-width="3" />
                    <text x="290" y="432" text-anchor="middle" fill="white" font-size="20" font-weight="bold">+4</text>
                    <circle cx="290" cy="380" r="4" fill="#60a5fa"/>
                    <circle cx="290" cy="460" r="4" fill="#60a5fa"/>
                </g>

                <!-- Instruction Memory -->
                <g id="imem-module" class="module" opacity="0.4">
                    <rect x="450" y="240" width="240" height="160" fill="#1e293b" stroke="#60a5fa" stroke-width="4" rx="8" />
                    <text x="570" y="290" text-anchor="middle" fill="white" font-size="20" font-weight="bold">Instruction</text>
                    <text x="570" y="320" text-anchor="middle" fill="white" font-size="20" font-weight="bold">Memory</text>
                    <text x="570" y="350" text-anchor="middle" fill="#60a5fa" font-size="14">IMEM</text>
                    <text x="570" y="380" text-anchor="middle" fill="#9ca3af" font-size="12" id="imem-instr">0x00000000</text>
                    <circle cx="450" cy="305" r="4" fill="#60a5fa"/>
                    <circle cx="690" cy="305" r="4" fill="#60a5fa"/>
                </g>

                <!-- Instruction Decode - Abajo de IMEM -->
                <g id="decode-module" class="module" opacity="0.4">
                    <rect x="490" y="440" width="160" height="80" fill="#1e293b" stroke="#9ca3af" stroke-width="3" rx="8"/>
                    <text x="570" y="472" text-anchor="middle" fill="#a78bfa" font-size="15" font-weight="bold">Instruction</text>
                    <text x="570" y="495" text-anchor="middle" fill="#a78bfa" font-size="15" font-weight="bold">Decode</text>
                    <text x="570" y="513" text-anchor="middle" fill="#9ca3af" font-size="11">rs1 | rs2 | rd | imm</text>
                </g>

                <!-- ==================== FILA 2: REGISTER FILE + IMMGEN ==================== -->

                <!-- Register File - Más abajo y centrado -->
<g id="regfile-module" class="module" opacity="0.4">
    <rect x="200" y="600" width="300" height="240" fill="#1e293b" stroke="#34d399" stroke-width="4" rx="8" />
    <text x="350" y="645" text-anchor="middle" fill="white" font-size="20" font-weight="bold">Register File</text>
    <text x="350" y="672" text-anchor="middle" fill="#9ca3af" font-size="13">32 x 32-bit registers</text>
    
    <!-- AGREGAR ESTA LÍNEA: Write Enable -->
    <text x="220" y="625" fill="#a78bfa" font-size="14" font-weight="bold">Write Enable (WE)</text>
    
    <text x="220" y="715" fill="#fbbf24" font-size="14" font-weight="bold">Read Reg 1 (rs1)</text>
    <text x="220" y="755" fill="#fbbf24" font-size="14" font-weight="bold">Read Reg 2 (rs2)</text>
    <text x="220" y="795" fill="#34d399" font-size="14" font-weight="bold">Write Reg (rd)</text>
    <text x="220" y="825" fill="#34d399" font-size="14" font-weight="bold">Write Data</text>
    
    <!-- AGREGAR ESTE CÍRCULO: punto de conexión WE -->
    <circle cx="200" cy="620" r="4" fill="#a78bfa"/>
    
    <circle cx="200" cy="710" r="4" fill="#a78bfa"/>
    <circle cx="200" cy="750" r="4" fill="#a78bfa"/>
    <circle cx="200" cy="790" r="4" fill="#34d399"/>
    <circle cx="200" cy="820" r="4" fill="#34d399"/>
    <circle cx="500" cy="710" r="4" fill="#34d399"/>
    <circle cx="500" cy="750" r="4" fill="#34d399"/>
</g>

                <!-- Immediate Generator - Separado a la derecha -->
                <g id="immgen-module" class="module" opacity="0.4">
                    <rect x="600" y="550" width="180" height="110" fill="#1e293b" stroke="#60a5fa" stroke-width="3" rx="8" />
                    <text x="690" y="580" text-anchor="middle" fill="white" font-size="17" font-weight="bold">Immediate</text>
                    <text x="690" y="605" text-anchor="middle" fill="white" font-size="17" font-weight="bold">Generator</text>
                    <text x="690" y="630" text-anchor="middle" fill="#9ca3af" font-size="12">Sign Extend</text>
                    <circle cx="600" cy="705" r="4" fill="#60a5fa"/>
                    <circle cx="780" cy="705" r="4" fill="#60a5fa"/>
                </g>

                <!-- ==================== FILA 3: MUX + ALU ==================== -->

                <!-- MUX ALUSrc - Bien separado -->
                <g id="mux-alusrc-module" class="module" opacity="0.4">
                    <polygon points="880,650 880,780 970,715" fill="#1e3a5f" stroke="#60a5fa" stroke-width="3" />
                    <text x="920" y="718" text-anchor="middle" fill="white" font-size="15" font-weight="bold">MUX</text>
                    <text x="920" y="738" text-anchor="middle" fill="#a78bfa" font-size="12">ALUSrc</text>
                    <circle cx="880" cy="685" r="4" fill="#34d399"/>
                    <circle cx="880" cy="745" r="4" fill="#60a5fa"/>
                    <circle cx="970" cy="715" r="4" fill="#34d399"/>
                    <circle cx="925" cy="650" r="3" fill="#a78bfa"/>
                </g>

                <!-- ALU - Más grande y centrada -->
                <g id="alu-module" class="module" opacity="0.4">
                    <polygon points="1060,630 1060,800 1320,750 1320,680" fill="#1e293b" stroke="#fbbf24" stroke-width="5" />
                    <text x="1180" y="710" text-anchor="middle" fill="white" font-size="24" font-weight="bold">ALU</text>
                    <text x="1180" y="740" text-anchor="middle" fill="#9ca3af" font-size="13">Arithmetic Logic Unit</text>
                    
                    <circle cx="1060" cy="680" r="4" fill="#34d399"/>
                    <circle cx="1060" cy="750" r="4" fill="#34d399"/>
                    <circle cx="1190" cy="630" r="4" fill="#a78bfa"/>
                    <circle cx="1320" cy="715" r="4" fill="#fbbf24"/>
                    <circle cx="1320" cy="680" r="3" fill="#f87171"/>
                    <text x="1350" y="685" fill="#f87171" font-size="12">Zero</text>
                </g>

                <!-- ==================== FILA 4: DATA MEMORY + MUX ==================== -->

                <!-- Data Memory - Derecha -->
                <g id="dmem-module" class="module" opacity="0.4">
                    <rect x="1420" y="650" width="250" height="170" fill="#1e293b" stroke="#22d3ee" stroke-width="4" rx="8" />
                    <text x="1545" y="700" text-anchor="middle" fill="white" font-size="20" font-weight="bold">Data Memory</text>
                    <text x="1545" y="730" text-anchor="middle" fill="#9ca3af" font-size="13">Load/Store</text>
                    
                    <text x="1440" y="765" fill="#fbbf24" font-size="13">Address</text>
                    <text x="1440" y="800" fill="#34d399" font-size="13">Write Data</text>
                    <text x="1595" y="765" fill="#22d3ee" font-size="13">Read →</text>
                    
                    <circle cx="1420" cy="760" r="4" fill="#fbbf24"/>
                    <circle cx="1420" cy="795" r="4" fill="#34d399"/>
                    <circle cx="1670" cy="730" r="4" fill="#22d3ee"/>
                    <circle cx="1545" cy="650" r="4" fill="#a78bfa"/>
                </g>

                <!-- MUX MemToReg -->
                <g id="mux-memtoreg-module" class="module" opacity="0.4">
                    <polygon points="1750,680 1750,810 1840,745" fill="#1e3a5f" stroke="#34d399" stroke-width="3" />
                    <text x="1795" y="748" text-anchor="middle" fill="white" font-size="15" font-weight="bold">MUX</text>
                    <text x="1795" y="768" text-anchor="middle" fill="#a78bfa" font-size="12">MemToReg</text>
                    <circle cx="1750" cy="715" r="4" fill="#fbbf24"/>
                    <circle cx="1750" cy="775" r="4" fill="#22d3ee"/>
                    <circle cx="1840" cy="745" r="4" fill="#34d399"/>
                    <circle cx="1795" cy="680" r="3" fill="#a78bfa"/>
                </g>

                <!-- ==================== SUMADOR BRANCH (ABAJO) ==================== -->

                <!-- Branch Adder -->
                <g id="adder-branch-module" class="module" opacity="0.4">
                    <circle cx="290" cy="970" r="42" fill="#1e293b" stroke="#60a5fa" stroke-width="3" />
                    <text x="290" y="982" text-anchor="middle" fill="white" font-size="18" font-weight="bold">ADD</text>
                    <circle cx="258" cy="952" r="4" fill="#60a5fa"/>
                    <circle cx="258" cy="988" r="4" fill="#60a5fa"/>
                    <circle cx="332" cy="970" r="4" fill="#60a5fa"/>
                </g>

                <!-- ==================== CABLES (WIRES) ==================== -->
                
                <!-- MUX Branch → PC -->
                <path id="wire-mux-pc" class="wire" d="M 170 300 L 220 300 L 220 305" 
                      stroke="#60a5fa" stroke-width="3" fill="none" opacity="0.25"/>
                
                <!-- PC → IMEM -->
                <path id="wire-pc-imem" class="wire" d="M 360 305 L 450 305" 
                      stroke="#60a5fa" stroke-width="4" fill="none" opacity="0.25"/>
                <text x="395 280" fill="#60a5fa" font-size="11" opacity="0.6">PC[31:0]</text>
                
                <!-- PC → Adder +4 -->
                <path id="wire-pc-adder4" class="wire" d="M 290 350 L 290 380" 
                      stroke="#60a5fa" stroke-width="3" fill="none" opacity="0.25"/>
                
                <!-- Adder +4 → MUX Branch (superior) -->
                <path id="wire-adder4-mux" class="wire" d="M 290 460 L 290 520 L 40 520 L 40 270 L 80 270" 
                      stroke="#60a5fa" stroke-width="3" fill="none" opacity="0.25"/>
                <text x="20" y="270" fill="#60a5fa" font-size="10" opacity="0.6">PC+4</text>
                
                <!-- IMEM → Control -->
                <path id="wire-imem-ctrl" class="wire" d="M 570 240 L 570 200 L 800 200 L 800 130" 
                      stroke="#a78bfa" stroke-width="2" fill="none" opacity="0.25"/>
                <text x="670" y="195" fill="#a78bfa" font-size="10" opacity="0.6">opcode[6:0]</text>
                
                <!-- IMEM → Decode -->
                <path id="wire-imem-decode" class="wire" d="M 570 400 L 570 440" 
                      stroke="#60a5fa" stroke-width="3" fill="none" opacity="0.25"/>
                
                <!-- Decode → RegFile (rs1) -->
                <path id="wire-decode-rs1" class="wire" d="M 490 460 L 180 460 L 180 710 L 200 710" 
                      stroke="#a78bfa" stroke-width="2" fill="none" opacity="0.25"/>
                <text x="330" y="455" fill="#a78bfa" font-size="10" opacity="0.6">rs1[4:0]</text>
                
                <!-- Decode → RegFile (rs2) -->
                <path id="wire-decode-rs2" class="wire" d="M 490 480 L 160 480 L 160 750 L 200 750" 
                      stroke="#a78bfa" stroke-width="2" fill="none" opacity="0.25"/>
                <text x="330" y="475" fill="#a78bfa" font-size="10" opacity="0.6">rs2[4:0]</text>
                
                <!-- Decode → RegFile (rd) -->
                <path id="wire-decode-rd" class="wire" d="M 490 500 L 140 500 L 140 790 L 200 790" 
                      stroke="#a78bfa" stroke-width="2" fill="none" opacity="0.25"/>
                <text x="330" y="495" fill="#a78bfa" font-size="10" opacity="0.6">rd[4:0]</text>
                
                <!-- Control → RegFile Write Enable -->
                <path id="wire-ctrl-regwr" class="wire" d="M 800 150 L 120 150 L 120 600" 
                      stroke="#a78bfa" stroke-width="2" fill="none" opacity="0.25"/>
                <text x="450" y="145" fill="#a78bfa" font-size="10" opacity="0.6">RegWrite</text>
                
                <!-- RegFile RD1 → ALU -->
                <path id="wire-rd1-alu" class="wire" d="M 500 710 L 520 710 L 520 535 L 1020 535 L 1020 680 L 1060 680" 
                      stroke="#34d399" stroke-width="5" fill="none" opacity="0.25"/>
                <text x="740" y="703" fill="#34d399" font-size="12" opacity="0.6" font-weight="bold">RD1[31:0]</text>
                
                <!-- RegFile RD2 → MUX ALUSrc -->
                <path id="wire-rd2-mux" class="wire" d="M 500 750 L 730 750 L 730 685 L 880 685" 
                      stroke="#34d399" stroke-width="5" fill="none" opacity="0.25"/>
                <text x="640" y="743" fill="#34d399" font-size="12" opacity="0.6" font-weight="bold">RD2[31:0]</text>
                
                <!-- RD2 → DMEM (para Store) -->
                <path id="wire-rd2-dmem" class="wire" d="M 730 750 L 730 810 L 1420 810" 
                      stroke="#34d399" stroke-width="3" fill="none" opacity="0.25"/>
                
                <!-- IMEM → ImmGen -->
                <path id="wire-imem-immgen" class="wire" d="M 680 400 L 680 550" 
                      stroke="#60a5fa" stroke-width="3" fill="none" opacity="0.25"/>
                
                <!-- ImmGen → MUX ALUSrc -->
                <path id="wire-imm-mux" class="wire" d="M 715 656 L 715 730 L 879 730" 
                      stroke="#60a5fa" stroke-width="3" fill="none" opacity="0.25"/>
                <text x="800" y="738" fill="#60a5fa" font-size="11" opacity="0.6">Imm</text>
                
                <!-- MUX ALUSrc → ALU -->
                <path id="wire-mux-alu" class="wire" d="M 970 715 L 1010 715 L 1010 750 L 1060 750" 
                      stroke="#34d399" stroke-width="5" fill="none" opacity="0.25"/>
                
                <!-- Control → ALU (ALUOp) -->
                <path id="wire-ctrl-alu" class="wire" d="M 1000 175 L 1190 175 L 1190 653" 
                      stroke="#a78bfa" stroke-width="2" fill="none" opacity="0.25"/>
                <text x="1090" y="175" fill="#a78bfa" font-size="10" opacity="0.6">ALUOp</text>
                
                <!-- Control → MUX ALUSrc -->
                <path id="wire-ctrl-muxalu" class="wire" d="M 900 180 L 925 180 L 925 678" 
                      stroke="#a78bfa" stroke-width="2" fill="none" opacity="0.25"/>
                <text x="935" y="410" fill="#a78bfa" font-size="10" opacity="0.6">ALUSrc</text>
                
                <!-- Control → DMEM -->
                <path id="wire-ctrl-dmem" class="wire" d="M 1080 130 L 1545 130 L 1545 650" 
                      stroke="#a78bfa" stroke-width="2" fill="none" opacity="0.25"/>
                <text x="1270" y="125" fill="#a78bfa" font-size="10" opacity="0.6">MemRd | MemWr</text>
                
                <!-- ALU → DMEM -->
                <path id="wire-alu-dmem" class="wire" d="M 1320 715 L 1380 715 L 1380 760 L 1420 760" 
                      stroke="#fbbf24" stroke-width="5" fill="none" opacity="0.25"/>
                <text x="1330" y="708" fill="#fbbf24" font-size="12" opacity="0.6" font-weight="bold">ALU Result</text>
                
                <!-- ALU → MUX MemToReg -->
                <path id="wire-alu-muxmem" class="wire" d="M 1380 715 L 1380 625 L 1720 625 L 1720 715 L 1750 715" 
                      stroke="#fbbf24" stroke-width="4" fill="none" opacity="0.25"/>
                
                <!-- DMEM → MUX MemToReg -->
                <path id="wire-dmem-mux" class="wire" d="M 1670 730 L 1710 730 L 1710 775 L 1750 775" 
                      stroke="#22d3ee" stroke-width="5" fill="none" opacity="0.25"/>
                <text x="1680" y="723" fill="#22d3ee" font-size="11" opacity="0.6">MemData</text>
                
                <!-- Control → MUX MemToReg -->
                <path id="wire-ctrl-muxmem" class="wire" d="M 1080 150 L 1795 150 L 1795 717" 
                      stroke="#a78bfa" stroke-width="2" fill="none" opacity="0.25"/>
                <text x="1500" y="145" fill="#a78bfa" font-size="10" opacity="0.6">MemToReg</text>
                
                <!-- MUX MemToReg → RegFile (WRITEBACK) -->
                <path id="wire-writeback" class="wire" d="M 1840 745 L 1950 745 L 1950 1080 L 120 1080 L 120 820 L 200 820" 
                      stroke="#34d399" stroke-width="5" fill="none" opacity="0.25"/>
                <text x="1960" y="750" fill="#34d399" font-size="12" opacity="0.6" font-weight="bold">WB Data</text>
                <text x="800" y="1105" fill="#34d399" font-size="14" opacity="0.6" font-weight="bold">← WRITEBACK PATH (datos de vuelta a registros)</text>
                
                <!-- PC → Branch Adder -->
                <path id="wire-pc-branch" class="wire" d="M 290 350 L 200 350 L 200 952 L 258 952" 
                      stroke="#60a5fa" stroke-width="3" fill="none" opacity="0.25"/>
                
                <!-- ImmGen → Branch Adder -->
                <path id="wire-imm-branch" class="wire" d="M 690 657 L 690 988 L 325 988" 
                      stroke="#60a5fa" stroke-width="3" fill="none" opacity="0.25"/>
                <text x="460" y="1003" fill="#60a5fa" font-size="11" opacity="0.6">Imm(offset)</text>
                
                <!-- Branch Adder → MUX Branch -->
                <path id="wire-branchadd-mux" class="wire" d="M 249 970 L 10 970 L 10 330 L 80 330" 
                      stroke="#60a5fa" stroke-width="3" fill="none" opacity="0.25"/>
                <text x="340" y="965" fill="#60a5fa" font-size="10" opacity="0.6">PC+offset</text>
                
                <!-- ALU Zero → Branch Logic -->
                <path id="wire-zero-branch" class="wire" d="M 1320 690 L 1360 690 L 1360 60 L 125 60 L 125 268" 
                      stroke="#f87171" stroke-width="2" fill="none" opacity="0.25"/>
                <text x="700" y="55" fill="#f87171" font-size="10" opacity="0.6">Zero (Branch)</text>
                
                <!-- ==================== LEYENDA ==================== -->
                <g transform="translate(50, 1130)">
                    <text x="0" y="0" fill="white" font-size="16" font-weight="bold">Leyenda de Señales:</text>
                    
                    <line x1="0" y1="25" x2="70" y2="25" stroke="#60a5fa" stroke-width="4"/>
                    <text x="80" y="29" fill="#9ca3af" font-size="13">Instrucciones/Direcciones</text>
                    
                    <line x1="320" y1="25" x2="390" y2="25" stroke="#34d399" stroke-width="4"/>
                    <text x="400" y="29" fill="#9ca3af" font-size="13">Datos (32 bits)</text>
                    
                    <line x1="560" y1="25" x2="630" y2="25" stroke="#fbbf24" stroke-width="4"/>
                    <text x="640" y="29" fill="#9ca3af" font-size="13">Resultado ALU</text>
                    
                    <line x1="800" y1="25" x2="870" y2="25" stroke="#22d3ee" stroke-width="4"/>
                    <text x="880" y="29" fill="#9ca3af" font-size="13">Datos de Memoria</text>
                    
                    <line x1="1080" y1="25" x2="1150" y2="25" stroke="#a78bfa" stroke-width="2"/>
                    <text x="1160" y="29" fill="#9ca3af" font-size="13">Señales de Control</text>
                    
                    <line x1="1380" y1="25" x2="1450" y2="25" stroke="#f87171" stroke-width="2"/>
                    <text x="1460" y="29" fill="#9ca3af" font-size="13">Señal Zero/Branch</text>
                    
                    <text x="1650" y="29" fill="#60a5fa" font-size="12">★ Las líneas se iluminan al transmitir datos</text>
                </g>
            </svg>
        `;
    }

    // Método principal para activar cables - usa el nombre SIN prefijo "wire-"
    activateWire(wireName) {
        const wireId = `wire-${wireName}`;
        this.highlightWire(wireId, true);
    }

    highlightModule(moduleName, active) {
        const module = document.getElementById(`${moduleName}-module`);
        if (!module) return;

        if (active) {
            this.activeModules.add(moduleName);
            module.setAttribute('opacity', '1');
            module.style.filter = 'url(#glow-module)';

            const shapes = module.querySelectorAll('rect, polygon, circle');
            shapes.forEach(shape => {
                const currentStroke = shape.getAttribute('stroke');
                shape.setAttribute('data-original-stroke', currentStroke);
                shape.setAttribute('stroke-width', '5');

                // Colores brillantes para componentes activos
                if (moduleName === 'pc' || moduleName === 'imem' || moduleName === 'dmem') {
                    const rects = module.querySelectorAll('rect');
                    rects.forEach(r => r.setAttribute('fill', '#2563eb'));
                } else if (moduleName === 'regfile') {
                    const rects = module.querySelectorAll('rect');
                    rects.forEach(r => r.setAttribute('fill', '#059669'));
                } else if (moduleName === 'control') {
                    const rects = module.querySelectorAll('rect');
                    rects.forEach(r => r.setAttribute('fill', '#7c3aed'));
                } else if (moduleName === 'alu') {
                    const polys = module.querySelectorAll('polygon');
                    polys.forEach(p => p.setAttribute('fill', '#d97706'));
                } else if (moduleName.includes('mux')) {
                    const polys = module.querySelectorAll('polygon');
                    polys.forEach(p => p.setAttribute('fill', '#2563eb'));
                } else if (moduleName.includes('adder')) {
                    const circles = module.querySelectorAll('circle[r="40"], circle[r="42"]');
                    circles.forEach(c => c.setAttribute('fill', '#2563eb'));
                } else {
                    const rects = module.querySelectorAll('rect');
                    rects.forEach(r => r.setAttribute('fill', '#1e40af'));
                }
            });
        } else {
            this.activeModules.delete(moduleName);
            module.setAttribute('opacity', '0.4');
            module.style.filter = '';

            const shapes = module.querySelectorAll('rect, polygon, circle');
            shapes.forEach(shape => {
                shape.setAttribute('stroke-width', '3');
                const originalStroke = shape.getAttribute('data-original-stroke');
                if (originalStroke) {
                    shape.setAttribute('stroke', originalStroke);
                }

                // Restaurar color oscuro
                if (shape.tagName === 'rect') {
                    shape.setAttribute('fill', '#1e293b');
                } else if (shape.tagName === 'polygon') {
                    shape.setAttribute('fill', '#1e3a5f');
                } else if (shape.tagName === 'circle' && (shape.getAttribute('r') === '40' || shape.getAttribute('r') === '42')) {
                    shape.setAttribute('fill', '#1e293b');
                }
            });
        }
    }

    highlightWire(wireId, active) {
        const wire = document.getElementById(wireId);
        if (!wire) {
            console.warn(`⚠️ Wire no encontrado: ${wireId}`);
            return;
        }

        if (active) {
            this.activeWires.add(wireId);
            wire.setAttribute('opacity', '1');
            wire.style.filter = 'url(#glow-strong)';

            const currentWidth = wire.getAttribute('stroke-width');
            wire.setAttribute('data-original-width', currentWidth);
            wire.setAttribute('stroke-width', parseFloat(currentWidth) * 2.5);

            // Agregar animación de pulso de luz
            wire.style.strokeDasharray = '20,10';
            wire.style.strokeDashoffset = '0';
            wire.style.animation = 'wire-flow 0.6s linear infinite';
        } else {
            this.activeWires.delete(wireId);
            wire.setAttribute('opacity', '0.25');
            wire.style.filter = '';
            wire.style.animation = '';
            wire.style.strokeDasharray = 'none';

            const originalWidth = wire.getAttribute('data-original-width');
            if (originalWidth) {
                wire.setAttribute('stroke-width', originalWidth);
            }
        }
    }

    updatePC(value) {
        const pcText = document.getElementById('pc-value');
        if (pcText) {
            pcText.textContent = value;
        }
    }

    updateInstructionDisplay(instrHex) {
        const instrText = document.getElementById('imem-instr');
        if (instrText) {
            instrText.textContent = '0x' + instrHex.toString(16).padStart(8, '0').toUpperCase();
        }
    }

    reset() {
        // Limpiar todos los módulos
        const modules = ['pc', 'imem', 'control', 'regfile', 'alu', 'dmem',
            'adder4', 'adder-branch', 'decode', 'immgen',
            'mux-alusrc', 'mux-branch', 'mux-memtoreg'];

        modules.forEach(module => {
            this.highlightModule(module, false);
        });

        // Limpiar todos los wires
        const wires = [
            'wire-pc-imem', 'wire-pc-adder4', 'wire-adder4-mux', 'wire-mux-pc',
            'wire-imem-ctrl', 'wire-imem-decode', 'wire-decode-rs1', 'wire-decode-rs2',
            'wire-rd1-alu', 'wire-rd2-mux', 'wire-rd2-dmem', 'wire-imem-immgen',
            'wire-imm-mux', 'wire-mux-alu', 'wire-ctrl-alu', 'wire-ctrl-muxalu',
            'wire-ctrl-dmem', 'wire-alu-dmem', 'wire-alu-muxmem', 'wire-dmem-mux',
            'wire-ctrl-muxmem', 'wire-writeback', 'wire-decode-rd', 'wire-ctrl-regwr',
            'wire-pc-branch', 'wire-imm-branch', 'wire-branchadd-mux', 'wire-zero-branch'
        ];

        wires.forEach(wire => {
            this.highlightWire(wire, false);
        });

        this.activeModules.clear();
        this.activeWires.clear();
        this.signalValues.clear();
        this.updatePC(0);
    }

    // Método para animar flujo de datos en una secuencia de wires
    animateDataFlow(wireSequence, duration = 300) {
        return new Promise((resolve) => {
            let index = 0;

            const animateNext = () => {
                if (index > 0) {
                    this.highlightWire(wireSequence[index - 1], false);
                }

                if (index < wireSequence.length) {
                    this.highlightWire(wireSequence[index], true);
                    index++;
                    setTimeout(animateNext, duration);
                } else {
                    resolve();
                }
            };

            animateNext();
        });
    }
}

// Los estilos CSS ahora están en css/styles.css