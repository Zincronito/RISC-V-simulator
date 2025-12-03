// ============================================
// DECODIFICADOR RISC-V
// ============================================

class RISCVDecoder {
    decode(instruction) {
        const opcode = instruction & 0x7F;
        const rd = (instruction >> 7) & 0x1F;
        const funct3 = (instruction >> 12) & 0x7;
        const rs1 = (instruction >> 15) & 0x1F;
        const rs2 = (instruction >> 20) & 0x1F;
        const funct7 = (instruction >> 25) & 0x7F;

        let type = '';
        let name = '';
        let imm = 0;

        // Tipo R (0x33)
        if (opcode === 0x33) {
            type = 'R';
            name = this.decodeTypeR(funct3, funct7);
        }
        // Tipo I (0x13)
        else if (opcode === 0x13) {
            type = 'I';
            imm = this.signExtend((instruction >> 20) & 0xFFF, 12);
            name = this.decodeTypeI(funct3);
        }
        // Tipo L (0x03)
        else if (opcode === 0x03) {
            type = 'L';
            imm = this.signExtend((instruction >> 20) & 0xFFF, 12);
            name = this.decodeTypeL(funct3);
        }
        // Tipo S (0x23)
        else if (opcode === 0x23) {
            type = 'S';
            imm = this.signExtend(((instruction >> 7) & 0x1F) | (((instruction >> 25) & 0x7F) << 5), 12);
            name = this.decodeTypeS(funct3);
        }
        // Tipo B (0x63)
        else if (opcode === 0x63) {
            type = 'B';
            imm = this.signExtend(
                (((instruction >> 8) & 0xF) << 1) |
                (((instruction >> 25) & 0x3F) << 5) |
                (((instruction >> 7) & 0x1) << 11) |
                (((instruction >> 31) & 0x1) << 12),
                13
            );
            name = this.decodeTypeB(funct3);
        }

        return { type, name, opcode, rd, rs1, rs2, funct3, funct7, imm };
    }

    decodeTypeR(funct3, funct7) {
        if (funct3 === 0x0 && funct7 === 0x00) return 'add';
        if (funct3 === 0x0 && funct7 === 0x20) return 'sub';
        if (funct3 === 0x7) return 'and';
        if (funct3 === 0x6) return 'or';
        if (funct3 === 0x4) return 'xor';
        if (funct3 === 0x1) return 'sll';
        if (funct3 === 0x5) return 'srl';
        if (funct3 === 0x2) return 'slt';
        return 'unknown';
    }

    decodeTypeI(funct3) {
        if (funct3 === 0x0) return 'addi';
        if (funct3 === 0x4) return 'xori';
        if (funct3 === 0x6) return 'ori';
        if (funct3 === 0x7) return 'andi';
        if (funct3 === 0x2) return 'slti';
        return 'unknown';
    }

    decodeTypeL(funct3) {
        if (funct3 === 0x2) return 'lw';
        return 'unknown';
    }

    decodeTypeS(funct3) {
        if (funct3 === 0x2) return 'sw';
        return 'unknown';
    }

    decodeTypeB(funct3) {
        if (funct3 === 0x0) return 'beq';
        if (funct3 === 0x1) return 'bne';
        if (funct3 === 0x4) return 'blt';
        if (funct3 === 0x5) return 'bge';
        return 'unknown';
    }

    signExtend(value, bits) {
        const sign = 1 << (bits - 1);
        return (value & (sign - 1)) - (value & sign);
    }

    formatInstruction(decoded) {
        const { type, name, rd, rs1, rs2, imm } = decoded;

        switch (type) {
            case 'R':
                return `${name} x${rd}, x${rs1}, x${rs2}`;
            case 'I':
                return `${name} x${rd}, x${rs1}, ${imm}`;
            case 'L':
                return `${name} x${rd}, ${imm}(x${rs1})`;
            case 'S':
                return `${name} x${rs2}, ${imm}(x${rs1})`;
            case 'B':
                return `${name} x${rs1}, x${rs2}, ${imm >> 2}`;
            default:
                return 'unknown';
        }
    }
}