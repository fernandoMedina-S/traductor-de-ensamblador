const mnemonics = {
    ORG: {starting: true, inherit: false},
    ABA: {starting: false, name: "Add Accumulator B to Accumulator A", inherit: "1806"},
    ADCA: {starting: false, name: "Add with Carry to A", inherit: false, immediate: "89xx", direct: "99xx", extended: "B9xxxx"},
    ADCB: {starting: false, name: "Add with Carry to B", inherit: false, immediate: "C9xx", direct: "D9xx", extended: "F9xxxx"},
    ADDA: {starting: false, name: "Add without Carry to A", inherit: false, immediate: "8Bxx", direct: "9Bxx", extended: "BBxxxx"},
    ASL: {starting: false, name: "Arithmetic Shift Left Memory", inherit: false, immediate: false, direct: false, extended: "78xxxx"},
    BCC: {starting: false, name: "Branch if Carry Cleared", inherit: false, immediate: false, direct: false, extended: false, relative: "24xxxx"},
    BGND: {starting: false, name: "Enter Background Debug Mode", inherit: "00", immediate: false, direct: false, extended: false},
    END: {starting: true},
}

export const bases = {
    "%": 2,
    "@": 8,
    "$": 16,
}

export default mnemonics;