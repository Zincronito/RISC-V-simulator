// ============================================
// EJECUTOR RISC-V
// ============================================

class RISCVExecutor {
    constructor() {
        this.registers = new Array(32).fill(0);
        this.memory = new Array(64).fill(0);
        this.pc = 0;
    }

    reset() {
        this.registers = new Array(32).fill(0);
        this.memory = new Array(64).fill(0);
        this.pc = 0;
    }

    execute(decoded) {
        const { type, name, rd, rs1, rs2, imm } = decoded;

        switch (type) {
            case 'R':
                this.executeTypeR(name, rd, rs1, rs2);
                this.pc++;
                break;
            case 'I':
                this.executeTypeI(name, rd, rs1, imm);
                this.pc++;
                break;
            case 'L':
                this.executeTypeL(name, rd, rs1, imm);
                this.pc++;
                break;
            case 'S':
                this.executeTypeS(name, rs1, rs2, imm);
                this.pc++;
                break;
            case 'B':
                const branch = this.executeTypeB(name, rs1, rs2, imm);
                if (branch) {
                    this.pc += (imm >> 2);
                } else {
                    this.pc++;
                }
                break;
        }

        // x0 siempre es 0
        this.registers[0] = 0;
    }

    executeTypeR(name, rd, rs1, rs2) {
        const val1 = this.registers[rs1];
        const val2 = this.registers[rs2];

        switch (name) {
            case 'add':
                this.registers[rd] = (val1 + val2) | 0;
                break;
            case 'sub':
                this.registers[rd] = (val1 - val2) | 0;
                break;
            case 'and':
                this.registers[rd] = val1 & val2;
                break;
            case 'or':
                this.registers[rd] = val1 | val2;
                break;
            case 'xor':
                this.registers[rd] = val1 ^ val2;
                break;
            case 'sll':
                this.registers[rd] = val1 << (val2 & 0x1F);
                break;
            case 'srl':
                this.registers[rd] = val1 >>> (val2 & 0x1F);
                break;
            case 'slt':
                this.registers[rd] = val1 < val2 ? 1 : 0;
                break;
        }
    }

    executeTypeI(name, rd, rs1, imm) {
        const val = this.registers[rs1];

        switch (name) {
            case 'addi':
                this.registers[rd] = (val + imm) | 0;
                break;
            case 'xori':
                this.registers[rd] = val ^ imm;
                break;
            case 'ori':
                this.registers[rd] = val | imm;
                break;
            case 'andi':
                this.registers[rd] = val & imm;
                break;
            case 'slti':
                this.registers[rd] = val < imm ? 1 : 0;
                break;
        }
    }

    executeTypeL(name, rd, rs1, imm) {
        const addr = ((this.registers[rs1] + imm) | 0) & 0x3F;
        if (name === 'lw') {
            this.registers[rd] = this.memory[addr];
        }
    }

    executeTypeS(name, rs1, rs2, imm) {
        const addr = ((this.registers[rs1] + imm) | 0) & 0x3F;
        if (name === 'sw') {
            this.memory[addr] = this.registers[rs2];
        }
    }

    executeTypeB(name, rs1, rs2, imm) {
        const val1 = this.registers[rs1];
        const val2 = this.registers[rs2];

        switch (name) {
            case 'beq': return val1 === val2;
            case 'bne': return val1 !== val2;
            case 'blt': return val1 < val2;
            case 'bge': return val1 >= val2;
        }
        return false;
    }

    getState() {
        return {
            pc: this.pc,
            registers: [...this.registers],
            memory: [...this.memory]
        };
    }
}