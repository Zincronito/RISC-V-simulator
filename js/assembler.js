// ============================================
// ENSAMBLADOR RISC-V CON SOPORTE DE ETIQUETAS
// ============================================

class RISCVAssembler {
    constructor() {
        this.instructions = [];
    }

    /**
     * Ensambla el programa completo en dos pasadas
     * 1. Detecta etiquetas y calcula sus posiciones (PC)
     * 2. Genera el código máquina resolviendo las etiquetas
     */
    assembleProgram(code) {
        const rawLines = code.split('\n');
        this.instructions = [];
        const symbolTable = {}; // Mapa: "nombre_etiqueta" -> PC
        const cleanLines = [];  // Lista de instrucciones limpias

        // === PASADA 1: Identificar etiquetas y limpiar código ===
        let pc = 0;
        
        for (let line of rawLines) {
            // Limpiar espacios y comentarios
            let cleanLine = line.trim();
            const commentIndex = cleanLine.indexOf('#');
            if (commentIndex !== -1) {
                cleanLine = cleanLine.substring(0, commentIndex).trim();
            }

            if (!cleanLine) continue; // Saltar líneas vacías

            // Regex para detectar etiquetas (ej: "loop:", "start: addi...")
            // Grupo 1: Nombre etiqueta, Grupo 2: Resto de la línea
            const labelMatch = cleanLine.match(/^([a-zA-Z0-9_]+):\s*(.*)/);

            if (labelMatch) {
                const labelName = labelMatch[1];
                const restOfLine = labelMatch[2];

                // Guardamos la etiqueta apuntando al PC actual
                if (symbolTable.hasOwnProperty(labelName)) {
                    throw new Error(`Error: Etiqueta duplicada '${labelName}'`);
                }
                symbolTable[labelName] = pc;

                // Si hay instrucción después de la etiqueta (ej: "loop: addi..."), la guardamos
                if (restOfLine) {
                    cleanLines.push(restOfLine);
                    pc++;
                }
                // Si no hay nada (ej: línea solo con "loop:"), no incrementamos PC todavía
            } else {
                // Línea normal sin etiqueta
                cleanLines.push(cleanLine);
                pc++;
            }
        }

        // === PASADA 2: Ensamblar instrucciones ===
        for (let i = 0; i < cleanLines.length; i++) {
            try {
                // Pasamos la tabla de símbolos y el PC actual
                const instr = this.assembleLine(cleanLines[i], symbolTable, i);
                if (instr !== null) {
                    this.instructions.push(instr);
                }
            } catch (error) {
                console.error(`Error ensamblando línea ${i + 1}: "${cleanLines[i]}"`, error);
                throw error; // Re-lanzar para que la UI lo muestre
            }
        }

        return this.instructions;
    }

    // Ensambla una línea individual
    assembleLine(line, symbolTable, currentPC) {
        line = line.trim().toLowerCase();
        const parts = line.split(/[\s,()]+/).filter(p => p); // Tokenizar
        const opcode = parts[0];

        if (this.isTypeR(opcode)) {
            return this.assembleTypeR(parts);
        } else if (this.isTypeI(opcode)) {
            return this.assembleTypeI(parts);
        } else if (this.isTypeL(opcode)) {
            return this.assembleTypeL(parts);
        } else if (this.isTypeS(opcode)) {
            return this.assembleTypeS(parts);
        } else if (this.isTypeB(opcode)) {
            // Tipo B necesita tabla de símbolos y PC para calcular saltos
            return this.assembleTypeB(parts, symbolTable, currentPC);
        } else {
            throw new Error(`Instrucción no reconocida: ${opcode}`);
        }
    }

    // --- Funciones de Verificación de Tipo (Sin cambios) ---
    isTypeR(op) { return ['add', 'sub', 'and', 'or', 'xor', 'sll', 'srl', 'slt'].includes(op); }
    isTypeI(op) { return ['addi', 'xori', 'ori', 'andi', 'slti'].includes(op); }
    isTypeL(op) { return ['lw'].includes(op); }
    isTypeS(op) { return ['sw'].includes(op); }
    isTypeB(op) { return ['beq', 'bne', 'blt', 'bge'].includes(op); }

    // --- Utilitarios ---
    getReg(r) {
        if (!r.startsWith('x')) throw new Error(`Registro inválido: ${r}`);
        const val = parseInt(r.replace('x', ''));
        if (isNaN(val) || val < 0 || val > 31) throw new Error(`Registro fuera de rango: ${r}`);
        return val;
    }

    getImm(i) {
        const val = parseInt(i);
        if (isNaN(val)) throw new Error(`Inmediato inválido: ${i}`);
        return val;
    }

    // --- Ensambladores por Tipo ---

    assembleTypeR(parts) {
        const [op, rd, rs1, rs2] = parts;
        const rdNum = this.getReg(rd);
        const rs1Num = this.getReg(rs1);
        const rs2Num = this.getReg(rs2);

        let funct3 = 0, funct7 = 0;
        switch (op) {
            case 'add': funct3 = 0x0; funct7 = 0x00; break;
            case 'sub': funct3 = 0x0; funct7 = 0x20; break;
            case 'and': funct3 = 0x7; funct7 = 0x00; break;
            case 'or':  funct3 = 0x6; funct7 = 0x00; break;
            case 'xor': funct3 = 0x4; funct7 = 0x00; break;
            case 'sll': funct3 = 0x1; funct7 = 0x00; break;
            case 'srl': funct3 = 0x5; funct7 = 0x00; break;
            case 'slt': funct3 = 0x2; funct7 = 0x00; break;
        }

        return 0x33 | (rdNum << 7) | (funct3 << 12) | (rs1Num << 15) | (rs2Num << 20) | (funct7 << 25);
    }

    assembleTypeI(parts) {
        const [op, rd, rs1, imm] = parts;
        const rdNum = this.getReg(rd);
        const rs1Num = this.getReg(rs1);
        const immNum = this.getImm(imm) & 0xFFF;

        let funct3 = 0;
        switch (op) {
            case 'addi': funct3 = 0x0; break;
            case 'xori': funct3 = 0x4; break;
            case 'ori':  funct3 = 0x6; break;
            case 'andi': funct3 = 0x7; break;
            case 'slti': funct3 = 0x2; break;
        }

        return 0x13 | (rdNum << 7) | (funct3 << 12) | (rs1Num << 15) | (immNum << 20);
    }

    assembleTypeL(parts) {
        const [op, rd, imm, rs1] = parts;
        const rdNum = this.getReg(rd);
        const rs1Num = this.getReg(rs1);
        const immNum = this.getImm(imm) & 0xFFF;

        return 0x03 | (rdNum << 7) | (0x2 << 12) | (rs1Num << 15) | (immNum << 20);
    }

    assembleTypeS(parts) {
        const [op, rs2, imm, rs1] = parts;
        const rs2Num = this.getReg(rs2);
        const rs1Num = this.getReg(rs1);
        const immNum = this.getImm(imm);

        const imm_11_5 = (immNum >> 5) & 0x7F;
        const imm_4_0 = immNum & 0x1F;

        return 0x23 | (imm_4_0 << 7) | (0x2 << 12) | (rs1Num << 15) | (rs2Num << 20) | (imm_11_5 << 25);
    }

    // MODIFICADO: Ahora acepta symbolTable y currentPC para calcular offsets
    assembleTypeB(parts, symbolTable, currentPC) {
        const [op, rs1, rs2, labelOrImm] = parts;
        const rs1Num = this.getReg(rs1);
        const rs2Num = this.getReg(rs2);
        
        let offsetInWords = 0;

        // ¿Es un número directo o una etiqueta?
        if (!isNaN(parseInt(labelOrImm))) {
            offsetInWords = this.getImm(labelOrImm);
        } else {
            // Es una etiqueta: Buscar en la tabla
            // NOTA: Las etiquetas en assembly RISC-V son case-sensitive, 
            // pero tu código usa .toLowerCase(), así que buscamos en minúsculas.
            const labelKey = labelOrImm.toLowerCase(); 
            if (symbolTable.hasOwnProperty(labelKey)) {
                const targetPC = symbolTable[labelKey];
                // El offset es la diferencia de instrucciones (Target - PC Actual)
                offsetInWords = targetPC - currentPC;
            } else {
                throw new Error(`Etiqueta no encontrada: "${labelOrImm}"`);
            }
        }

        // Convertir offset de palabras a formato RISC-V
        // El simulador espera que el inmediato codificado sea bytes, 
        // pero ejecuta (imm >> 2). Por tanto, multiplicamos por 4 (<< 2).
        const imm = offsetInWords << 2;

        // Distribución de bits para Tipo B (Standard RISC-V)
        const imm_12 = (imm >> 12) & 0x1;
        const imm_10_5 = (imm >> 5) & 0x3F;
        const imm_4_1 = (imm >> 1) & 0xF;
        const imm_11 = (imm >> 11) & 0x1;

        let funct3 = 0;
        switch (op) {
            case 'beq': funct3 = 0x0; break;
            case 'bne': funct3 = 0x1; break;
            case 'blt': funct3 = 0x4; break;
            case 'bge': funct3 = 0x5; break;
        }

        return 0x63 | (imm_11 << 7) | (imm_4_1 << 8) | (funct3 << 12) |
            (rs1Num << 15) | (rs2Num << 20) | (imm_10_5 << 25) | (imm_12 << 31);
    }
}