const mnemonics = {
    ORG: {starting: true, inherit: false},
    ABA: {starting: false, name: "Add Accumulator B to Accumulator A", inherit: "1806"},
    ADCA: {starting: false, name: "Add with Carry to A", inherit: false, immediate: "89xx", direct: "99xx", extended: "B9xxxx"},
    ADCB: {starting: false, name: "Add with Carry to B", inherit: false, immediate: "C9xx", direct: "D9xx", extended: "F9xxxx"},
    ADDA: {starting: false, name: "Add without Carry to A", inherit: false, immediate: "8Bxx", direct: "9Bxx", extended: "BBxxxx"},
    ASL: {starting: false, name: "Arithmetic Shift Left Memory", inherit: false, immediate: false, direct: false, extended: "78xxxx"},
    BCC: {starting: false, name: "Branch if Carry Cleared", inherit: false, immediate: false, direct: false, extended: false, relative: "24xxxx"},
    BGND: {starting: false, name: "Enter Background Debug Mode", inherit: "00", immediate: false, direct: false, extended: false},
    EQU: {starting: false, name: "Save memory for variable", save: true, inherit: false, immediate: false, direct: false, extended: false},
    START: {starting: false, name: "Line start", direction: "00", inherit: false, immediate: false, direct: false, extended: false},
    ADDD: {starting: false, name: "Add Double Accumulator", inherit: false, immediate: "C3xxxx", direct: "D3xx", extended: "F3xxxx"},
    DC: {starting: false, B: "00", W: "0000", inherit: false, immediate: false, direct: false, extended: false},
    BSZ: {starting: false, name: "BLOCK STORAGE OF ZEROS", value: "00", inherit: false, immediate: false, direct: false, extended: false},
    FILL: {starting: false, name: "FILL MEMORY", value: "xx", inherit: false, immediate: false, direct: false, extended: false},
    FCC: {starting: false, name: "FORM CONSTANT CHARACTER STRING", one_argument: true, inherit: false, immediate: false, direct: false, extended: false},
    FCB: {starting: false, name: "FORM CONSTANT BYTE", value: "xx", inherit: false, immediate: false, direct: false, extended: false},
    END: {starting: true},
}

export const bases = {
    "%": 2,
    "@": 8,
    "$": 16,
}

export default mnemonics;