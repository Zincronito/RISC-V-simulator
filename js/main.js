// ============================================
// APLICACIÓN PRINCIPAL - SIMULADOR RISC-V
// ============================================

class RISCVSimulator {
    constructor() {
        // Inicializar componentes
        this.assembler = new RISCVAssembler();
        this.decoder = new RISCVDecoder();
        this.executor = new RISCVExecutor();
        this.datapath = new DatapathVisualizer('datapath');

        // Estado de la aplicación
        this.program = [];
        this.isRunning = false;
        this.runInterval = null;
        this.currentStage = 'IDLE';
        this.previousRegisters = new Array(32).fill(0);
        this.previousMemory = new Array(64).fill(0);

        this.init();
    }

    init() {
        console.log('🚀 Inicializando Simulador RISC-V...');

        // Renderizar datapath
        this.datapath.render();

        // Cargar programa inicial
        const defaultCode = document.getElementById('codeEditor').value;
        this.loadProgram(defaultCode);

        // Configurar event listeners
        this.setupEventListeners();

        // Actualizar UI inicial
        this.updateUI();

        console.log('✅ Simulador listo!');
    }

    setupEventListeners() {
        // Botones de control
        document.getElementById('btnStep').addEventListener('click', () => this.step());
        document.getElementById('btnRun').addEventListener('click', () => this.run());
        document.getElementById('btnPause').addEventListener('click', () => this.pause());
        document.getElementById('btnReset').addEventListener('click', () => this.reset());

        // Botones de edición
        document.getElementById('btnEdit').addEventListener('click', () => this.toggleEditor());
        document.getElementById('btnCloseEditor').addEventListener('click', () => this.toggleEditor());
        document.getElementById('btnAssemble').addEventListener('click', () => this.assemble());

        // Atajos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.step();
                } else if (e.key === 'r') {
                    e.preventDefault();
                    this.reset();
                }
            }
        });
    }

    loadProgram(code) {
        try {
            this.program = this.assembler.assembleProgram(code);
            this.updateProgramView();
            console.log(`📝 Programa cargado: ${this.program.length} instrucciones`);
        } catch (error) {
            console.error('❌ Error cargando programa:', error);
            alert('Error al cargar el programa: ' + error.message);
        }
    }

    assemble() {
        const code = document.getElementById('codeEditor').value;
        try {
            this.program = this.assembler.assembleProgram(code);
            this.reset();
            this.toggleEditor();
            this.showNotification('✅ Programa ensamblado exitosamente!', 'success');
            this.updateProgramView();
        } catch (error) {
            console.error('❌ Error al ensamblar:', error);
            this.showNotification('❌ Error al ensamblar: ' + error.message, 'error');
        }
    }

    async step() {
        if (this.executor.pc >= this.program.length) {
            this.showNotification('🏁 Programa terminado', 'info');
            this.pause();
            return;
        }

        // Guardar estado anterior para resaltar cambios
        this.previousRegisters = [...this.executor.registers];
        this.previousMemory = [...this.executor.memory];

        const instruction = this.program[this.executor.pc];
        const decoded = this.decoder.decode(instruction);

        console.log(`⚙️ Ejecutando PC=${this.executor.pc}: ${this.decoder.formatInstruction(decoded)}`);

        // Simular etapas del pipeline
        await this.simulateStages(decoded);
    }

    async simulateStages(decoded) {
        // FETCH - Buscar instrucción
        await this.setStage('FETCH', ['pc', 'imem']);

        // DECODE - Decodificar y leer registros
        await this.setStage('DECODE', ['regfile', 'control']);
        this.updateInstructionDisplay(decoded);

        // EXECUTE - Ejecutar en ALU
        await this.setStage('EXECUTE', ['alu']);
        this.executor.execute(decoded);

        // MEMORY - Acceso a memoria (solo para load/store)
        if (decoded.type === 'L' || decoded.type === 'S') {
            await this.setStage('MEMORY', ['dmem']);
        }

        // WRITEBACK - Escribir resultado
        if (decoded.type !== 'S' && decoded.type !== 'B') {
            await this.setStage('WRITEBACK', ['regfile']);
        }

        // Limpiar y actualizar UI
        await this.setStage('IDLE', []);
        this.updateUI();
    }

    setStage(stageName, modules) {
        return new Promise(resolve => {
            this.currentStage = stageName;
            document.getElementById('stageValue').textContent = stageName;

            // Limpiar módulos anteriores
            this.datapath.reset();

            // Activar módulos actuales
            modules.forEach(mod => this.datapath.highlightModule(mod, true));

            // Esperar animación
            setTimeout(resolve, 500);
        });
    }

    run() {
        if (this.executor.pc >= this.program.length) {
            this.showNotification('🏁 Programa ya terminó', 'info');
            return;
        }

        this.isRunning = true;
        document.getElementById('btnRun').classList.add('hidden');
        document.getElementById('btnPause').classList.remove('hidden');
        document.getElementById('btnStep').disabled = true;

        console.log('▶️ Modo ejecución automática');

        const executeNext = async () => {
            if (!this.isRunning) return;

            if (this.executor.pc >= this.program.length) {
                this.pause();
                this.showNotification('🏁 Programa terminado', 'success');
                return;
            }

            await this.step();

            if (this.isRunning) {
                this.runInterval = setTimeout(executeNext, 2500);
            }
        };

        executeNext();
    }

    pause() {
        this.isRunning = false;
        document.getElementById('btnRun').classList.remove('hidden');
        document.getElementById('btnPause').classList.add('hidden');
        document.getElementById('btnStep').disabled = false;

        if (this.runInterval) {
            clearTimeout(this.runInterval);
            this.runInterval = null;
        }

        console.log('⏸️ Ejecución pausada');
    }

    reset() {
        console.log('🔄 Reiniciando simulador...');

        this.pause();
        this.executor.reset();
        this.datapath.reset();
        this.currentStage = 'IDLE';
        this.previousRegisters = new Array(32).fill(0);
        this.previousMemory = new Array(64).fill(0);

        document.getElementById('currentInstruction').classList.add('hidden');
        document.getElementById('stageValue').textContent = 'IDLE';

        this.updateUI();
        this.showNotification('🔄 Simulador reiniciado', 'info');
    }

    toggleEditor() {
        const editor = document.getElementById('editorPanel');
        const isHidden = editor.classList.contains('hidden');
        editor.classList.toggle('hidden');

        if (!isHidden) {
            console.log('📝 Editor cerrado');
        } else {
            console.log('📝 Editor abierto');
            document.getElementById('codeEditor').focus();
        }
    }

    updateInstructionDisplay(decoded) {
        const instrPanel = document.getElementById('currentInstruction');
        instrPanel.classList.remove('hidden');

        const instrText = this.decoder.formatInstruction(decoded);
        const instrCode = '0x' + this.program[this.executor.pc].toString(16).padStart(8, '0').toUpperCase();

        document.getElementById('instrText').textContent = instrText;
        document.getElementById('instrType').textContent = decoded.type;
        document.getElementById('instrCode').textContent = instrCode;
    }

    updateUI() {
        // Actualizar PC
        document.getElementById('pcValue').textContent = this.executor.pc;
        this.datapath.updatePC(this.executor.pc);

        // Actualizar registros
        this.updateRegisters();

        // Actualizar memoria
        this.updateMemory();

        // Actualizar vista del programa
        this.updateProgramView();
    }

    updateRegisters() {
        const container = document.getElementById('registers');
        container.innerHTML = '';

        for (let i = 0; i < 16; i++) {
            const div = document.createElement('div');
            const changed = this.previousRegisters[i] !== this.executor.registers[i];
            div.className = `reg-card ${changed ? 'modified' : ''}`;

            div.innerHTML = `
                <div class="flex justify-between items-center">
                    <span class="text-gray-400 font-semibold">x${i}:</span>
                    <span class="text-yellow-400 font-mono font-bold text-lg">${this.executor.registers[i]}</span>
                </div>
            `;

            container.appendChild(div);
        }
    }

    updateMemory() {
        const container = document.getElementById('memory');
        container.innerHTML = '';

        for (let i = 0; i < 16; i++) {
            const div = document.createElement('div');
            const changed = this.previousMemory[i] !== this.executor.memory[i];
            div.className = `mem-card ${changed ? 'modified' : ''}`;

            div.innerHTML = `
                <div class="flex justify-between items-center">
                    <span class="text-gray-400 font-semibold">[${i}]:</span>
                    <span class="text-cyan-400 font-mono font-bold text-lg">${this.executor.memory[i]}</span>
                </div>
            `;

            container.appendChild(div);
        }
    }

    updateProgramView() {
        const container = document.getElementById('program');
        container.innerHTML = '';

        if (this.program.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">No hay programa cargado</p>';
            return;
        }

        this.program.forEach((instr, i) => {
            const decoded = this.decoder.decode(instr);
            const div = document.createElement('div');
            const isActive = i === this.executor.pc;
            div.className = `program-line ${isActive ? 'active' : ''}`;

            div.innerHTML = `
                <div class="flex items-center gap-4 flex-wrap">
                    <span class="text-gray-500 font-mono text-sm min-w-[2rem]">${i}:</span>
                    <span class="text-yellow-400 font-mono text-sm min-w-[7rem]">0x${instr.toString(16).padStart(8, '0').toUpperCase()}</span>
                    <span class="text-green-400 font-mono flex-1 min-w-[10rem]">${this.decoder.formatInstruction(decoded)}</span>
                    <span class="text-purple-400 text-sm font-semibold px-2 py-1 bg-purple-900 bg-opacity-30 rounded">${decoded.type}</span>
                </div>
            `;

            container.appendChild(div);
        });
    }

    showNotification(message, type = 'info') {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-0`;

        // Colores según tipo
        const colors = {
            success: 'bg-green-600 text-white',
            error: 'bg-red-600 text-white',
            info: 'bg-blue-600 text-white',
            warning: 'bg-yellow-600 text-black'
        };

        notification.className += ` ${colors[type] || colors.info}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Eliminar después de 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// ============================================
// INICIALIZAR APLICACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Iniciando Simulador RISC-V...');
    window.simulator = new RISCVSimulator();
    console.log('✨ Simulador iniciado correctamente');
});