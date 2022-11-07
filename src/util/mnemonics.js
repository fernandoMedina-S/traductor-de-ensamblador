const mnemonics = {
    ORG: {starting: true, inherit: false},
    ABA: {starting: false, name: "Add Accumulator B to Accumulator A", inherit: "1806"},
    ADCA: {starting: false, name: "Add with Carry to A", inherit: false, immediate: "89xx", direct: "99xx", extended: "B9xxxx"},
    ADCB: {starting: false, name: "Add with Carry to B", inherit: false, immediate: "C9xx", direct: "D9xx", extended: "F9xxxx"},
    ADDA: {starting: false, name: "Add without Carry to A", inherit: false, immediate: "8Bxx", direct: "9Bxx", extended: "BBxxxx"},
    LDAA: {starting: false, name: "Load Accumulator A", inherit: false, immediate: "86xx", direct: "96xx", extended: "B6xxxx", indexed: "A6"},
    ASL: {starting: false, name: "Arithmetic Shift Left Memory", inherit: false, immediate: false, direct: false, extended: "78xxxx", indexed: "68"},
    CLR: {starting: false, name: "Branch if Carry Cleared", inherit: false, immediate: false, direct: false, extended: "79xxxx", relative: false},
    CMPA: {starting: false, name: "Compare A", inherit: false, immediate: "81xx", direct: "91xx", extended: "B1xxxx", relative: false, indexed: "A1"},
    BCC: {starting: false, name: "Clear Memory", inherit: false, immediate: false, direct: false, extended: false, relative: "24xxxx"},
    BGND: {starting: false, name: "Enter Background Debug Mode", inherit: "00", immediate: false, direct: false, extended: false},
    EQU: {starting: false, name: "Save memory for variable", save: true, inherit: false, immediate: false, direct: false, extended: false},
    START: {starting: false, name: "Line start", direction: "00", inherit: false, immediate: false, direct: false, extended: false},
    ADDD: {starting: false, name: "Add Double Accumulator", inherit: false, immediate: "C3xxxx", direct: "D3xx", extended: "F3xxxx"},
    DC: {starting: false, B: "00", W: "0000", inherit: false, immediate: false, direct: false, extended: false},
    BSZ: {starting: false, name: "BLOCK STORAGE OF ZEROS", value: "00", inherit: false, immediate: false, direct: false, extended: false},
    FILL: {starting: false, name: "FILL MEMORY", value: "xx", inherit: false, immediate: false, direct: false, extended: false},
    FCC: {starting: false, name: "FORM CONSTANT CHARACTER STRING", one_argument: true, inherit: false, immediate: false, direct: false, extended: false},
    FCB: {starting: false, name: "FORM CONSTANT BYTE", value: "xx", inherit: false, immediate: false, direct: false, extended: false},
    JMP: {starting: false, name: "Jump", inherit: false, immediate: false, direct: false, extended: "06xxxx", relative: false, indexed: "05"},
    BNE: {starting: false, name: "Branch if Not Equal to Zero", inherit: false, immediate: false, direct: false, extended: false, relative: "26xx"},
    LBNE: {starting: false, name: "Long Branch if Not Equal to Zero", inherit: false, immediate: false, direct: false, extended: false, relative: "1826xxxx"},
    IBNE: {starting: false, name: "Increment and Branch if Not Equal to Zero", inherit: false, immediate: false, direct: false, extended: false, relative: false},
    BCS: {starting: false, name: "Branch if Carry Set", inherit: false, immediate: false, direct: false, extended: false, relative: "25xx"},
    IBEQ: {starting: false, name: "Increment and Branch if Equal to Zero", inherit: false, immediate: false, direct: false, extended: false, relative: "04xxxx"},
    END: {starting: true},
}

export const bases = {
    "%": 2,
    "@": 8,
    "$": 16,
}

export const registerIBEQ = {
    A: {positive: "80", negative: "90"},
    B: {positive: "81", negative: "91"},
    D: {positive: "84", negative: "94"},
    X: {positive: "85", negative: "95"},
    Y: {positive: "86", negative: "96"},
    SP: {positive: "87", negative: "97"},
}

export const registerIBNE = {
    A: {positive: "04A0", negative: "04B0"},
    B: {positive: "04A1", negative: "04B1"},
    D: {positive: "04A4", negative: "04B4"},
    X: {positive: "04A5", negative: "04B5"},
    Y: {positive: "04A6", negative: "04B6"},
    SP: {positive: "04A7", negative: "04B7"},
}

export const registerIDX = {
    X: "00",
    Y: "01",
    SP: "10",
    PC: "11",
}

export const registerArgIDX = {
    A: "00",
    B: "01",
    D: "10"
}

export default mnemonics;