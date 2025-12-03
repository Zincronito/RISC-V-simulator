// ============================================
// ENSAMBLADOR RISC-V
// ============================================

class RISCVAssembler {
    constructor() {
        this.instructions = [];
    }

    // Ensambla una línea de código
    assembleLine(line) {
        line = line.trim().toLowerCase();

        // Ignorar líneas vacías y comentarios
        if (!line || line.startsWith('#')) {
            return null;
        }

        // Separar instrucción y operandos
        const parts = line.split(/[\s,()]+/).filter(p => p);
        const opcode = parts[0];

        try {
            if (this.isTypeR(opcode)) {
                return this.assembleTypeR(parts);
            } else if (this.isTypeI(opcode)) {
                return this.assembleTypeI(parts);
            } else if (this.isTypeL(opcode)) {
                return this.assembleTypeL(parts);
            } else if (this.isTypeS(opcode)) {
                return this.assembleTypeS(parts);
            } else if (this.isTypeB(opcode)) {
                return this.assembleTypeB(parts);
            } else {
                throw new Error(`Instrucción no reconocida: ${opcode}`);
            }
        } catch (error) {
            console.error(`Error ensamblando: ${line}`, error);
            return null;
        }
    }

    // Verifica si es tipo R
    isTypeR(op) {
        return ['add', 'sub', 'and', 'or', 'xor', 'sll', 'srl', 'slt'].includes(op);
    }

    // Verifica si es tipo I
    isTypeI(op) {
        return ['addi', 'xori', 'ori', 'andi', 'slti'].includes(op);
    }

    // Verifica si es tipo L
    isTypeL(op) {
        return ['lw'].includes(op);
    }

    // Verifica si es tipo S
    isTypeS(op) {
        return ['sw'].includes(op);
    }

    // Verifica si es tipo B
    isTypeB(op) {
        return ['beq', 'bne', 'blt', 'bge'].includes(op);
    }

    // Extrae número de registro
    getReg(r) {
        return parseInt(r.replace('x', ''));
    }

    // Extrae inmediato
    getImm(i) {
        return parseInt(i);
    }

    // Ensambla tipo R
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
            case 'or': funct3 = 0x6; funct7 = 0x00; break;
            case 'xor': funct3 = 0x4; funct7 = 0x00; break;
            case 'sll': funct3 = 0x1; funct7 = 0x00; break;
            case 'srl': funct3 = 0x5; funct7 = 0x00; break;
            case 'slt': funct3 = 0x2; funct7 = 0x00; break;
        }

        return 0x33 | (rdNum << 7) | (funct3 << 12) | (rs1Num << 15) | (rs2Num << 20) | (funct7 << 25);
    }

    // Ensambla tipo I
    assembleTypeI(parts) {
        const [op, rd, rs1, imm] = parts;
        const rdNum = this.getReg(rd);
        const rs1Num = this.getReg(rs1);
        const immNum = this.getImm(imm) & 0xFFF;

        let funct3 = 0;

        switch (op) {
            case 'addi': funct3 = 0x0; break;
            case 'xori': funct3 = 0x4; break;
            case 'ori': funct3 = 0x6; break;
            case 'andi': funct3 = 0x7; break;
            case 'slti': funct3 = 0x2; break;
        }

        return 0x13 | (rdNum << 7) | (funct3 << 12) | (rs1Num << 15) | (immNum << 20);
    }

    // Ensambla tipo L (Load)
    assembleTypeL(parts) {
        const [op, rd, imm, rs1] = parts;
        const rdNum = this.getReg(rd);
        const rs1Num = this.getReg(rs1);
        const immNum = this.getImm(imm) & 0xFFF;

        return 0x03 | (rdNum << 7) | (0x2 << 12) | (rs1Num << 15) | (immNum << 20);
    }

    // Ensambla tipo S (Store)
    assembleTypeS(parts) {
        const [op, rs2, imm, rs1] = parts;
        const rs2Num = this.getReg(rs2);
        const rs1Num = this.getReg(rs1);
        const immNum = this.getImm(imm);

        const imm_11_5 = (immNum >> 5) & 0x7F;
        const imm_4_0 = immNum & 0x1F;

        return 0x23 | (imm_4_0 << 7) | (0x2 << 12) | (rs1Num << 15) | (rs2Num << 20) | (imm_11_5 << 25);
    }

    // Ensambla tipo B (Branch)
    assembleTypeB(parts) {
        const [op, rs1, rs2, offset] = parts;
        const rs1Num = this.getReg(rs1);
        const rs2Num = this.getReg(rs2);
        const imm = this.getImm(offset) << 2;

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

    // Ensambla programa completo
    assembleProgram(code) {
        const lines = code.split('\n');
        this.instructions = [];

        for (let line of lines) {
            const instr = this.assembleLine(line);
            if (instr !== null) {
                this.instructions.push(instr);
            }
        }

        return this.instructions;
    }
}