// ============================================
// VISUALIZADOR DE DATAPATH RISC-V - REORGANIZADO
// Con líneas que se iluminan al transmitir datos
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
            <svg width="100%" height="1100" viewBox="0 0 2000 1100" class="mx-auto" style="background: #0a0e1a;">
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
                <text x="1000" y="40" text-anchor="middle" fill="white" font-size="24" font-weight="bold">
                    RISC-V Single-Cycle Datapath - Esquemático Completo
                </text>

                <!-- ========== FILA 1: PC + MUX + SUMADOR ========== -->
                
                <!-- MUX Branch (selecciona próximo PC) - ARRIBA -->
                <g id="mux-branch-module" class="module" opacity="0.4">
                    <polygon points="100,100 100,200 180,150" fill="#1e3a5f" stroke="#60a5fa" stroke-width="2" />
                    <text x="130" y="153" text-anchor="middle" fill="white" font-size="13" font-weight="bold">MUX</text>
                    <text x="130" y="168" text-anchor="middle" fill="#a78bfa" font-size="10">PCSrc</text>
                    <circle cx="100" cy="125" r="4" fill="#60a5fa"/>
                    <circle cx="100" cy="175" r="4" fill="#60a5fa"/>
                    <circle cx="180" cy="150" r="4" fill="#60a5fa"/>
                    <circle cx="140" cy="100" r="3" fill="#f87171"/>
                </g>

                <!-- PC (Program Counter) -->
                <g id="pc-module" class="module" opacity="0.4">
                    <rect x="220" y="110" width="120" height="80" fill="#1e293b" stroke="#60a5fa" stroke-width="3" rx="8" />
                    <text x="280" y="140" text-anchor="middle" fill="white" font-size="16" font-weight="bold">PC</text>
                    <text x="280" y="165" text-anchor="middle" fill="#fbbf24" font-size="20" font-weight="bold" id="pc-value">0</text>
                    <circle cx="220" cy="150" r="4" fill="#60a5fa"/>
                    <circle cx="340" cy="150" r="4" fill="#60a5fa"/>
                </g>

                <!-- Sumador PC+4 -->
                <g id="adder4-module" class="module" opacity="0.4">
                    <circle cx="280" cy="260" r="35" fill="#1e293b" stroke="#60a5fa" stroke-width="3" />
                    <text x="280" y="270" text-anchor="middle" fill="white" font-size="18" font-weight="bold">+4</text>
                    <circle cx="280" cy="225" r="4" fill="#60a5fa"/>
                    <circle cx="280" cy="295" r="4" fill="#60a5fa"/>
                </g>

                <!-- ========== FILA 2: IMEM + CONTROL + DECODE ========== -->

                <!-- Memoria de Instrucciones -->
                <g id="imem-module" class="module" opacity="0.4">
                    <rect x="450" y="100" width="200" height="140" fill="#1e293b" stroke="#60a5fa" stroke-width="3" rx="8" />
                    <text x="550" y="140" text-anchor="middle" fill="white" font-size="17" font-weight="bold">Instruction</text>
                    <text x="550" y="165" text-anchor="middle" fill="white" font-size="17" font-weight="bold">Memory</text>
                    <text x="550" y="195" text-anchor="middle" fill="#60a5fa" font-size="13">IMEM</text>
                    <text x="550" y="225" text-anchor="middle" fill="#9ca3af" font-size="11" id="imem-instr">0x00000000</text>
                    <circle cx="450" cy="170" r="4" fill="#60a5fa"/>
                    <circle cx="650" cy="170" r="4" fill="#60a5fa"/>
                </g>

                <!-- Unidad de Control -->
                <g id="control-module" class="module" opacity="0.4">
                    <rect x="750" y="80" width="220" height="90" fill="#1e293b" stroke="#a78bfa" stroke-width="4" rx="8" />
                    <text x="860" y="115" text-anchor="middle" fill="white" font-size="18" font-weight="bold">Control Unit</text>
                    <text x="860" y="140" text-anchor="middle" fill="#a78bfa" font-size="12">ALUOp | MemRd | MemWr</text>
                    <text x="860" y="158" text-anchor="middle" fill="#a78bfa" font-size="12">RegWr | ALUSrc | MemToReg</text>
                </g>

                <!-- Decodificador de Instrucción -->
                <g id="decode-module" class="module" opacity="0.4">
                    <rect x="720" y="200" width="160" height="80" fill="#1e293b" stroke="#9ca3af" stroke-width="2" rx="8"/>
                    <text x="800" y="230" text-anchor="middle" fill="#a78bfa" font-size="14" font-weight="bold">Instruction</text>
                    <text x="800" y="250" text-anchor="middle" fill="#a78bfa" font-size="14" font-weight="bold">Decode</text>
                    <text x="800" y="270" text-anchor="middle" fill="#9ca3af" font-size="10">rs1 | rs2 | rd | imm</text>
                </g>

                <!-- ========== FILA 3: REGFILE + IMMGEN ========== -->

                <!-- Banco de Registros -->
                <g id="regfile-module" class="module" opacity="0.4">
                    <rect x="350" y="400" width="260" height="220" fill="#1e293b" stroke="#34d399" stroke-width="4" rx="8" />
                    <text x="480" y="440" text-anchor="middle" fill="white" font-size="18" font-weight="bold">Register File</text>
                    <text x="480" y="465" text-anchor="middle" fill="#9ca3af" font-size="12">32 x 32-bit registers</text>
                    
                    <text x="365" y="505" fill="#fbbf24" font-size="13" font-weight="bold">Read Reg 1 (rs1)</text>
                    <text x="365" y="540" fill="#fbbf24" font-size="13" font-weight="bold">Read Reg 2 (rs2)</text>
                    <text x="365" y="580" fill="#34d399" font-size="13" font-weight="bold">Write Reg (rd)</text>
                    <text x="365" y="608" fill="#34d399" font-size="13" font-weight="bold">Write Data</text>
                    
                    <circle cx="350" cy="500" r="4" fill="#a78bfa"/>
                    <circle cx="350" cy="535" r="4" fill="#a78bfa"/>
                    <circle cx="350" cy="575" r="4" fill="#34d399"/>
                    <circle cx="350" cy="603" r="4" fill="#34d399"/>
                    <circle cx="610" cy="500" r="4" fill="#34d399"/>
                    <circle cx="610" cy="535" r="4" fill="#34d399"/>
                </g>

                <!-- Generador de Inmediatos -->
                <g id="immgen-module" class="module" opacity="0.4">
                    <rect x="730" y="480" width="160" height="90" fill="#1e293b" stroke="#60a5fa" stroke-width="3" rx="8" />
                    <text x="810" y="515" text-anchor="middle" fill="white" font-size="15" font-weight="bold">Immediate</text>
                    <text x="810" y="540" text-anchor="middle" fill="white" font-size="15" font-weight="bold">Generator</text>
                    <text x="810" y="560" text-anchor="middle" fill="#9ca3af" font-size="11">Sign Extend</text>
                    <circle cx="730" cy="525" r="4" fill="#60a5fa"/>
                    <circle cx="890" cy="525" r="4" fill="#60a5fa"/>
                </g>

                <!-- ========== FILA 4: MUX ALUSRC + ALU ========== -->

                <!-- MUX ALUSrc -->
                <g id="mux-alusrc-module" class="module" opacity="0.4">
                    <polygon points="970,480 970,590 1050,535" fill="#1e3a5f" stroke="#60a5fa" stroke-width="3" />
                    <text x="1010" y="538" text-anchor="middle" fill="white" font-size="14" font-weight="bold">MUX</text>
                    <text x="1010" y="556" text-anchor="middle" fill="#a78bfa" font-size="11">ALUSrc</text>
                    <circle cx="970" cy="510" r="4" fill="#34d399"/>
                    <circle cx="970" cy="560" r="4" fill="#60a5fa"/>
                    <circle cx="1050" cy="535" r="4" fill="#34d399"/>
                    <circle cx="1010" cy="480" r="3" fill="#a78bfa"/>
                </g>

                <!-- ALU -->
                <g id="alu-module" class="module" opacity="0.4">
                    <polygon points="1150,450 1150,620 1370,570 1370,500" fill="#1e293b" stroke="#fbbf24" stroke-width="4" />
                    <text x="1250" y="545" text-anchor="middle" fill="white" font-size="22" font-weight="bold">ALU</text>
                    <text x="1250" y="575" text-anchor="middle" fill="#9ca3af" font-size="12">Arithmetic Logic Unit</text>
                    
                    <circle cx="1150" cy="495" r="4" fill="#34d399"/>
                    <circle cx="1150" cy="575" r="4" fill="#34d399"/>
                    <circle cx="1260" cy="450" r="4" fill="#a78bfa"/>
                    <circle cx="1370" cy="535" r="4" fill="#fbbf24"/>
                    <circle cx="1370" cy="500" r="3" fill="#f87171"/>
                    <text x="1395" y="505" fill="#f87171" font-size="11">Zero</text>
                </g>

                <!-- ========== FILA 5: MEMORIA DE DATOS + MUX MEMTOREG ========== -->

                <!-- Memoria de Datos -->
                <g id="dmem-module" class="module" opacity="0.4">
                    <rect x="1480" y="470" width="220" height="150" fill="#1e293b" stroke="#22d3ee" stroke-width="4" rx="8" />
                    <text x="1590" y="515" text-anchor="middle" fill="white" font-size="18" font-weight="bold">Data Memory</text>
                    <text x="1590" y="545" text-anchor="middle" fill="#9ca3af" font-size="12">Load/Store</text>
                    
                    <text x="1495" y="575" fill="#fbbf24" font-size="12">Address</text>
                    <text x="1495" y="605" fill="#34d399" font-size="12">Write Data</text>
                    <text x="1650" y="575" fill="#22d3ee" font-size="12">Read →</text>
                    
                    <circle cx="1480" cy="570" r="4" fill="#fbbf24"/>
                    <circle cx="1480" cy="600" r="4" fill="#34d399"/>
                    <circle cx="1700" cy="545" r="4" fill="#22d3ee"/>
                    <circle cx="1590" cy="470" r="4" fill="#a78bfa"/>
                </g>

                <!-- MUX MemToReg -->
                <g id="mux-memtoreg-module" class="module" opacity="0.4">
                    <polygon points="1770,500 1770,610 1850,555" fill="#1e3a5f" stroke="#34d399" stroke-width="3" />
                    <text x="1810" y="558" text-anchor="middle" fill="white" font-size="14" font-weight="bold">MUX</text>
                    <text x="1810" y="576" text-anchor="middle" fill="#a78bfa" font-size="11">MemToReg</text>
                    <circle cx="1770" cy="530" r="4" fill="#fbbf24"/>
                    <circle cx="1770" cy="580" r="4" fill="#22d3ee"/>
                    <circle cx="1850" cy="555" r="4" fill="#34d399"/>
                    <circle cx="1810" cy="500" r="3" fill="#a78bfa"/>
                </g>

                <!-- ========== SUMADOR BRANCH (ABAJO) ========== -->

                <!-- Sumador Branch -->
                <g id="adder-branch-module" class="module" opacity="0.4">
                    <circle cx="450" cy="800" r="38" fill="#1e293b" stroke="#60a5fa" stroke-width="3" />
                    <text x="450" y="810" text-anchor="middle" fill="white" font-size="16" font-weight="bold">ADD</text>
                    <circle cx="420" cy="785" r="4" fill="#60a5fa"/>
                    <circle cx="420" cy="815" r="4" fill="#60a5fa"/>
                    <circle cx="488" cy="800" r="4" fill="#60a5fa"/>
                </g>

                <!-- ========== CONEXIONES (WIRES) - LÍNEAS SÓLIDAS QUE SE ILUMINAN ========== -->
                
                <!-- MUX Branch a PC -->
                <path id="wire-mux-pc" class="wire" d="M 180 150 L 220 150" 
                      stroke="#60a5fa" stroke-width="3" fill="none" opacity="0.25"/>
                
                <!-- PC a IMEM -->
                <path id="wire-pc-imem" class="wire" d="M 340 150 L 390 150 L 390 170 L 450 170" 
                      stroke="#60a5fa" stroke-width="3" fill="none" opacity="0.25"/>
                <text x="395" y="145" fill="#60a5fa" font-size="10" opacity="0.6">PC[31:0]</text>
                
                <!-- PC a Sumador +4 -->
                <path id="wire-pc-adder4" class="wire" d="M 280 190 L 280 225" 
                      stroke="#60a5fa" stroke-width="3" fill="none" opacity="0.25"/>
                
                <!-- Sumador +4 a MUX Branch (input superior) -->
                <path id="wire-adder4-mux" class="wire" d="M 280 295 L 280 340 L 50 340 L 50 125 L 100 125" 
                      stroke="#60a5fa" stroke-width="3" fill="none" opacity="0.25"/>
                <text x="30" y="125" fill="#60a5fa" font-size="9" opacity="0.6">PC+4</text>
                
                <!-- IMEM a Control Unit (opcode) -->
                <path id="wire-imem-ctrl" class="wire" d="M 550 100 L 550 80 L 750 80 L 750 125" 
                      stroke="#a78bfa" stroke-width="2" fill="none" opacity="0.25"/>
                <text x="630" y="75" fill="#a78bfa" font-size="9" opacity="0.6">opcode[6:0]</text>
                
                <!-- IMEM a Decoder -->
                <path id="wire-imem-decode" class="wire" d="M 650 170 L 700 170 L 700 240 L 720 240" 
                      stroke="#60a5fa" stroke-width="3" fill="none" opacity="0.25"/>
                
                <!-- Decoder a RegFile (rs1) -->
                <path id="wire-decode-rs1" class="wire" d="M 720 220 L 320 220 L 320 500 L 350 500" 
                      stroke="#a78bfa" stroke-width="2" fill="none" opacity="0.25"/>
                <text x="500" y="215" fill="#a78bfa" font-size="9" opacity="0.6">rs1[4:0]</text>
                
                <!-- Decoder a RegFile (rs2) -->
                <path id="wire-decode-rs2" class="wire" d="M 720 250 L 300 250 L 300 535 L 350 535" 
                      stroke="#a78bfa" stroke-width="2" fill="none" opacity="0.25"/>
                <text x="500" y="245" fill="#a78bfa" font-size="9" opacity="0.6">rs2[4:0]</text>
                
                <!-- Decoder a RegFile (rd) -->
                <path id="wire-decode-rd" class="wire" d="M 720 270 L 280 270 L 280 575 L 350 575" 
                      stroke="#a78bfa" stroke-width="2" fill="none" opacity="0.25"/>
                <text x="500" y="265" fill="#a78bfa" font-size="9" opacity="0.6">rd[4:0]</text>
                
                <!-- Control a RegFile Write Enable -->
                <path id="wire-ctrl-regwr" class="wire" d="M 750 140 L 240 140 L 240 400" 
                      stroke="#a78bfa" stroke-width="2" fill="none" opacity="0.25"/>
                <text x="480" y="135" fill="#a78bfa" font-size="9" opacity="0.6">RegWrite</text>
                
                <!-- RegFile RD1 a ALU -->
                <path id="wire-rd1-alu" class="wire" d="M 610 500 L 1120 500 L 1120 495 L 1150 495" 
                      stroke="#34d399" stroke-width="4" fill="none" opacity="0.25"/>
                <text x="850" y="493" fill="#34d399" font-size="11" opacity="0.6" font-weight="bold">RD1[31:0]</text>
                
                <!-- RegFile RD2 a MUX ALUSrc -->
                <path id="wire-rd2-mux" class="wire" d="M 610 535 L 850 535 L 850 510 L 970 510" 
                      stroke="#34d399" stroke-width="4" fill="none" opacity="0.25"/>
                <text x="770" y="528" fill="#34d399" font-size="11" opacity="0.6" font-weight="bold">RD2[31:0]</text>
                
                <!-- RD2 también va a DMEM para Store -->
                <path id="wire-rd2-dmem" class="wire" d="M 850 535 L 850 600 L 1480 600" 
                      stroke="#34d399" stroke-width="3" fill="none" opacity="0.25"/>
                
                <!-- IMEM a ImmGen -->
                <path id="wire-imem-immgen" class="wire" d="M 650 200 L 690 200 L 690 525 L 730 525" 
                      stroke="#60a5fa" stroke-width="3" fill="none" opacity="0.25"/>
                <text x="690" y="360" fill="#60a5fa" font-size="9" opacity="0.6">imm[31:0]</text>
                
                <!-- ImmGen a MUX ALUSrc -->
                <path id="wire-imm-mux" class="wire" d="M 890 525 L 930 525 L 930 560 L 970 560" 
                      stroke="#60a5fa" stroke-width="3" fill="none" opacity="0.25"/>
                <text x="900" y="555" fill="#60a5fa" font-size="10" opacity="0.6">Imm</text>
                
                <!-- MUX ALUSrc a ALU -->
                <path id="wire-mux-alu" class="wire" d="M 1050 535 L 1110 535 L 1110 575 L 1150 575" 
                      stroke="#34d399" stroke-width="4" fill="none" opacity="0.25"/>
                
                <!-- Control a ALU (ALUOp) -->
                <path id="wire-ctrl-alu" class="wire" d="M 860 170 L 860 380 L 1260 380 L 1260 450" 
                      stroke="#a78bfa" stroke-width="2" fill="none" opacity="0.25"/>
                <text x="1050" y="375" fill="#a78bfa" font-size="9" opacity="0.6">ALUOp</text>
                
                <!-- Control a MUX ALUSrc -->
                <path id="wire-ctrl-muxalu" class="wire" d="M 970 120 L 1010 120 L 1010 480" 
                      stroke="#a78bfa" stroke-width="2" fill="none" opacity="0.25"/>
                <text x="1020" y="300" fill="#a78bfa" font-size="9" opacity="0.6">ALUSrc</text>
                
                <!-- Control a DMEM -->
                <path id="wire-ctrl-dmem" class="wire" d="M 970 100 L 1450 100 L 1450 470 L 1590 470" 
                      stroke="#a78bfa" stroke-width="2" fill="none" opacity="0.25"/>
                <text x="1180" y="95" fill="#a78bfa" font-size="9" opacity="0.6">MemRd | MemWr</text>
                
                <!-- ALU resultado a DMEM -->
                <path id="wire-alu-dmem" class="wire" d="M 1370 535 L 1420 535 L 1420 570 L 1480 570" 
                      stroke="#fbbf24" stroke-width="4" fill="none" opacity="0.25"/>
                <text x="1400" y="528" fill="#fbbf24" font-size="11" opacity="0.6" font-weight="bold">ALU Result</text>
                
                <!-- ALU resultado a MUX MemToReg -->
                <path id="wire-alu-muxmem" class="wire" d="M 1420 535 L 1420 530 L 1770 530" 
                      stroke="#fbbf24" stroke-width="3" fill="none" opacity="0.25"/>
                
                <!-- DMEM Read Data a MUX MemToReg -->
                <path id="wire-dmem-mux" class="wire" d="M 1700 545 L 1740 545 L 1740 580 L 1770 580" 
                      stroke="#22d3ee" stroke-width="4" fill="none" opacity="0.25"/>
                <text x="1710" y="538" fill="#22d3ee" font-size="10" opacity="0.6">MemData</text>
                
                <!-- Control a MUX MemToReg -->
                <path id="wire-ctrl-muxmem" class="wire" d="M 970 140 L 1810 140 L 1810 500" 
                      stroke="#a78bfa" stroke-width="2" fill="none" opacity="0.25"/>
                <text x="1400" y="135" fill="#a78bfa" font-size="9" opacity="0.6">MemToReg</text>
                
                <!-- MUX MemToReg a RegFile Write Data (WRITEBACK PATH) -->
                <path id="wire-writeback" class="wire" d="M 1850 555 L 1920 555 L 1920 950 L 220 950 L 220 603 L 350 603" 
                      stroke="#34d399" stroke-width="4" fill="none" opacity="0.25"/>
                <text x="1930" y="560" fill="#34d399" font-size="11" opacity="0.6" font-weight="bold">WB Data</text>
                <text x="900" y="975" fill="#34d399" font-size="13" opacity="0.6" font-weight="bold">← WRITEBACK PATH (datos de vuelta a registros)</text>
                
                <!-- PC a Branch Adder -->
                <path id="wire-pc-branch" class="wire" d="M 280 190 L 360 190 L 360 785 L 420 785" 
                      stroke="#60a5fa" stroke-width="3" fill="none" opacity="0.25"/>
                
                <!-- ImmGen a Branch Adder -->
                <path id="wire-imm-branch" class="wire" d="M 810 570 L 810 815 L 420 815" 
                      stroke="#60a5fa" stroke-width="3" fill="none" opacity="0.25"/>
                <text x="610" y="830" fill="#60a5fa" font-size="10" opacity="0.6">Imm(offset)</text>
                
                <!-- Branch Adder a MUX Branch -->
                <path id="wire-branchadd-mux" class="wire" d="M 488 800 L 540 800 L 540 175 L 100 175" 
                      stroke="#60a5fa" stroke-width="3" fill="none" opacity="0.25"/>
                <text x="490" y="795" fill="#60a5fa" font-size="9" opacity="0.6">PC+offset</text>
                
                <!-- ALU Zero a Branch Logic -->
                <path id="wire-zero-branch" class="wire" d="M 1370 500 L 1410 500 L 1410 60 L 140 60 L 140 100" 
                      stroke="#f87171" stroke-width="2" fill="none" opacity="0.25"/>
                <text x="770" y="55" fill="#f87171" font-size="9" opacity="0.6">Zero (Branch)</text>
                
                <!-- ========== LEYENDA ========== -->
                <g transform="translate(50, 1020)">
                    <text x="0" y="0" fill="white" font-size="15" font-weight="bold">Leyenda de Señales:</text>
                    
                    <line x1="0" y1="20" x2="60" y2="20" stroke="#60a5fa" stroke-width="4"/>
                    <text x="70" y="24" fill="#9ca3af" font-size="12">Instrucciones/Direcciones</text>
                    
                    <line x1="280" y1="20" x2="340" y2="20" stroke="#34d399" stroke-width="4"/>
                    <text x="350" y="24" fill="#9ca3af" font-size="12">Datos (32 bits)</text>
                    
                    <line x1="500" y1="20" x2="560" y2="20" stroke="#fbbf24" stroke-width="4"/>
                    <text x="570" y="24" fill="#9ca3af" font-size="12">Resultado ALU</text>
                    
                    <line x1="720" y1="20" x2="780" y2="20" stroke="#22d3ee" stroke-width="4"/>
                    <text x="790" y="24" fill="#9ca3af" font-size="12">Datos de Memoria</text>
                    
                    <line x1="970" y1="20" x2="1030" y2="20" stroke="#a78bfa" stroke-width="2"/>
                    <text x="1040" y="24" fill="#9ca3af" font-size="12">Señales de Control</text>
                    
                    <line x1="1220" y1="20" x2="1280" y2="20" stroke="#f87171" stroke-width="2"/>
                    <text x="1290" y="24" fill="#9ca3af" font-size="12">Señal Zero/Branch</text>
                    
                    <text x="1480" y="24" fill="#60a5fa" font-size="11">★ Las líneas se iluminan al transmitir datos</text>
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
                    const circles = module.querySelectorAll('circle[r="35"], circle[r="38"]');
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
                } else if (shape.tagName === 'circle' && (shape.getAttribute('r') === '35' || shape.getAttribute('r') === '38')) {
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

// Agregar estilos CSS para animación de flujo
const style = document.createElement('style');
style.textContent = `
    @keyframes wire-flow {
        0% {
            stroke-dashoffset: 0;
        }
        100% {
            stroke-dashoffset: -30;
        }
    }
    
    .module {
        transition: opacity 0.3s ease, filter 0.3s ease;
    }
`;
document.head.appendChild(style);