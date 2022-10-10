import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import mnemonics, { bases } from "../../util/mnemonics";

import Button from "@mui/material/Button";

const Home = () => {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone();
  const [selectedFile, setSelectedFile] = useState(false);
  const [fileContent, setFileContent] = useState([]);
  const [tabsim, setTabsim] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [machineValues, setMachineValues] = useState([]);

  const hexToDec = (num) =>{
    let newNum = parseInt(num, 16);
    if ((newNum & 0x8000) > 0) {
      newNum = newNum - 0x10000;
   }
   return newNum;
  }

  const findInTabsim = (label) => {
    let finalValue = "NANs";
    tabsim.forEach((element) => {
      if (element["name"] === label) {
        finalValue = element["value"];
      }
    });
    return finalValue;
  };

  const operatorToHex = (operator) => {
    const label = findInTabsim(operator);
    if (label !== "NANs") {
      return label;
    }

    const symbol = bases[operator[0]];
    if (symbol === undefined) {
      let num = Number(operator);
      if (num < 0) {
        num = 0xffff + num + 1;
      }
      return num.toString(16).toUpperCase();
    } else {
      let num = operator.substring(1);
      num = parseInt(num, symbol);
      if (num < 0) {
        num = 0xffff + num + 1;
      }
      return num.toString(16).toUpperCase();
    }
  };

  const deleteFToShow = (num1) => {
    let canContinue = true;
    let num = num1.substring(2);
    if(!num.startsWith("F") || num.length <= 2){
      if(num.length === 1){
        return num1.substring(0, 2) + "0" + num;
      }else{
        return num1;
      }
    }else{
      while(canContinue){
        if(num.startsWith("F") && num.length > 2){
          num = num.substring(1);
        }else{
          canContinue = false;
        }
      }

      return num1.substring(0, 2) + num;
    }
  }

  //TODO: Función que reciba el operador en hexadecimal y devuelva su modo de direccionamiento
  const operatorToMode = (operator) => {
    const opInDec = hexToDec(operator)
    if(opInDec >= -256 && opInDec <= 255){
      return "8";
    }else if(opInDec >= -32767 && opInDec <= 32767){
      return "16";
    }else{
      return "Fuera de rango";
    }
  };
  const concatMnemonic = (mnemonic, mode, operator) => {
    let original = mnemonic[mode].substring(0, 2);
    if (mnemonic[mode].length === 6 && operator.length < 4) {
      const diff = 4 - operator.length;
      for (let i = 0; i < diff; i += 1) {
        original += "0";
      }
    }
    return original + operator;
  };

  const lengthToMachine = (mnemonic, operator, mLength, mode) => {
    switch (mode) {
      case "immediate":
        if (mLength <= 8 && mnemonic["immediate"]) {
          return concatMnemonic(mnemonic, "immediate", operator);
        } else {
          return "Fuera de rango";
        }
      case "direct":
        return concatMnemonic(mnemonic, "direct", operator);
      case "extended":
        return concatMnemonic(mnemonic, "extended", operator);
      case "relative":
        return concatMnemonic(mnemonic, "relative", operator);
      default:
        return "Error on mode";
    }
  };

  function ConvertStringToHex(str) {
    var arr = [];
    for (var i = 0; i < 1; i++) {
           arr[i] = (str.charCodeAt(i).toString(16)).slice(-4);
    }
    return arr;
  }

  const listToDC = (ls, type) => {
    let str = "";
    const formType = type === "W" ? 4 : 2;
    ls.forEach((element)=>{
      str += formatTo4Bits(operatorToHex(element), formType) + " ";
    })
    return str.substring(0, str.length-1);
  }

  const toMachine = (mnemonic, operator) => {
    let consulted = {};
    if(mnemonic === "DC.B" || mnemonic === "DC.W"){
      consulted = mnemonics["DC"];
    }else{
      consulted = mnemonics[mnemonic];
    }
    let modOp = operator;
    let opInHex = operatorToHex(operator);
    let dir = operatorToMode(opInHex);

    if (consulted === undefined) {
      return "invalid";
    }
    if (consulted["starting"] !== undefined && consulted["starting"]) {
      return opInHex;
    }
    if (consulted["inherit"]) {
      return consulted["inherit"];
    }
    if (operator.startsWith("#")) {
      modOp = modOp.substring(1);
      opInHex = operatorToHex(modOp);
      dir = operatorToMode(opInHex);
      return lengthToMachine(consulted, opInHex, dir, "immediate");
    } else if (dir <= 8 && consulted["direct"]) {
      return lengthToMachine(consulted, opInHex, dir, "direct");
    } else if (dir <= 16 && consulted["extended"]) {
      return lengthToMachine(consulted, opInHex, dir, "extended");
    } else if (dir <= 16 && consulted["relative"]) {
      return lengthToMachine(consulted, opInHex, dir, "relative");
    }else if(mnemonic.startsWith("DC")){
      const dcType = mnemonic.substring(3, 4);
      if(operator === ""){
        return consulted[dcType];
      }else{
        const ops = dcOperator(operator);
        return listToDC(ops, dcType);
      }
    }else if(mnemonic === "BSZ"){
      const zerosB = "00 ";
      let repeated = zerosB.repeat(parseInt(operator))
      return repeated.substring(0, repeated.length-1);
    } else if(mnemonic === "FILL"){
      const ops = dcOperator(operator);
      let fValue = formatTo4Bits(ops[0], 2) + " ";
      let sValue = ops[1];
      let repeated = fValue.repeat(parseInt(sValue));
      return repeated.substring(0, repeated.length-1);
    }else if(mnemonic === "FCC"){
      let arg = operator.substring(1, operator.length-1);
      let str = "";
      for (let i = 0; i<arg.length; i++){
        console.log(arg.length)
        str+= ConvertStringToHex(arg[i])[0] + " ";
      }
      return str.toUpperCase();
    }else if(mnemonic === "START" || mnemonic === "EQU"){
      return "00";
    }else if(mnemonic === "FCB"){
      return formatTo4Bits(operatorToHex(operator), 2);
    }
    else{
      return "Fuera de Rango";
    }
  };

  const findMode = (mnemonic) => {
    if (mnemonic["inherit"]) {
      return "inherit";
    } else if (mnemonic["direct"]) {
      return "direct";
    } else if (mnemonic["extended"]) {
      return "extended";
    } else if (mnemonic["relative"]) {
      return "relative";
    }
  };

  const preLength = (mnemonic, operator) => {
    const consulted = mnemonics[mnemonic];
    let operatorOriginal = operator;
    let immediate = false;

    if (operator.startsWith("#")) {
      operatorOriginal = operator.substring(1);
      immediate = true;
    }

    const opMod = operatorToHex(operatorOriginal);
    
    if (consulted === undefined) {
      return { value: "invalid", len: 0 };
    }
    if (consulted["starting"] !== undefined && consulted["starting"]) {
      return { value: "END", len: 0 };
    }

    if (consulted["inherit"]) {
      const value = consulted["inherit"];
      return { value, len: value.length / 2 };
    }
    if (immediate && consulted["immediate"]) {
      const value = consulted["immediate"];
      return { value, len: value.length / 2 };
    } else if (opMod.length <= 2 && consulted["direct"]) {
      const value = consulted["direct"];
      return { value, len: value.length / 2 };
    } else if (opMod.length <= 4 && consulted["extended"]) {
      const value = consulted["extended"];
      return { value, len: value.length / 2 };
    } else if (opMod.length <= 4 && consulted["relative"]) {
      const value = consulted["relative"];
      return { value, len: value.length / 2 };
    } else if(consulted["save"]){
      const value = consulted["save"];
      return { value,  len: 0}
    } else if(consulted["direction"]){
      const value = consulted["direction"]
      return { value, len: 0 }
    } else if (immediate) {
      const value = findMode(consulted);
      return { value, len: value.length / 2 };
    } else {
      return "Fuera de Rango";
    }
    //return 4Bxxxx - 3
  };

  const files = acceptedFiles.map((file) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  const sumAddressInHex = (num1, num2) => {
    const dec1 = parseInt(num1, 16);
    const dec2 = parseInt(num2, 16);
    return (dec1 + dec2).toString(16).toUpperCase();
  };

  const readFile = async () => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      setFileContent(() => text.split("\n"));
    };
    reader.readAsText(acceptedFiles[0]);
    setSelectedFile(() => true);
  };

  const getMnemonicFromLine = (line) => {
    const mnemIdx = line.indexOf("\t");
    let opIdx = line.indexOf(" ", mnemIdx + 1);

    let mnemonic;
    let operator;

    if (opIdx < 0) {
      opIdx = line.length;
      operator = "";
    } else {
      operator = line
        .substring(opIdx + 1)
        .replace("\t", "")
        .replace("\r", "");
    }

    mnemonic = line
      .substring(mnemIdx + 1, opIdx)
      .replace("\t", "")
      .replace("\r", "");
    return { mnemonic, operator };
  };

  const getLabelFromLine = (line, idx) => {
    const mnemIdx = line.indexOf("\t");
    const complete  = getMnemonicFromLine(line);
    if(complete["mnemonic"] === "EQU"){
      console.log({ pos: complete["operator"], label: line.substring(0, mnemIdx) })
      return { pos: complete["operator"], label: line.substring(0, mnemIdx) }
    }
    return { pos: idx, label: line.substring(0, mnemIdx) };
  };

  const formatTo4Bits = (num, type=4) => {
    let original = num;
    const numLen = original.length;
    const diff = type - numLen;
      for (let i = 0; i < diff; i += 1) {
        original = "0" + original;
      }
    return original;
  }

  const dcOperator = (operator) => {
    let ops = [];
    let str = operator;

    while(str.length > 0){
      let subs = str.substring(0, 2);
      if(subs.includes(",")){
        subs = subs.substring(0, 1);
      }
      ops.push(subs);
      str = str.substring(2, str.length);
      if(str.startsWith(",")){
        str = str.substring(1);
      }
    }
    return ops;
  }

  const ASCIItoBytes = (operator) => {
    return operator.substring(1, operator.length-1).length;
  }

  const onRenderFile = () => {
    let previousLength = [];
    let labels = [];
    const mnemAndOps = fileContent.map((element, idx) => {
      if (!element.startsWith("\t")) {
        labels.push(getLabelFromLine(element, idx));
      }
      return getMnemonicFromLine(element);
    });

    mnemAndOps.map((element) => {
      if (element["mnemonic"] === "ORG") {
        previousLength.push(operatorToHex(element["operator"]));
      } else {
        
        if(element["mnemonic"] === "START"){
          previousLength.push("0000");
        }else{
          if(element["mnemonic"].substring(0, 2) === "DC"){
            let bitLen = mnemonics[element["mnemonic"].substring(0, 2)];
            bitLen = bitLen[element["mnemonic"].substring(3, 4)]
            if(element["operator"] === ""){
              const prev = previousLength[previousLength.length - 1];
              previousLength.push(formatTo4Bits(sumAddressInHex(prev, (bitLen.length/2))))
            }else{
              const prev = previousLength[previousLength.length - 1];
              const ops = dcOperator(element["operator"]);
              previousLength.push(formatTo4Bits(sumAddressInHex(prev, (ops.length * bitLen.length / 2))))
            }
          }else if(element["mnemonic"] === "BSZ"){
            const prev = previousLength[previousLength.length - 1];
            previousLength.push(formatTo4Bits(sumAddressInHex(prev, operatorToHex(element["operator"]))));
          }else if(element["mnemonic"] === "FILL"){
            const prev = previousLength[previousLength.length - 1];
            const ops = dcOperator(element["operator"]);
            previousLength.push(formatTo4Bits(sumAddressInHex(prev, operatorToHex(ops[1]))));
          }else if(element["mnemonic"] === "FCC"){
            const prev = previousLength[previousLength.length - 1];
            previousLength.push(formatTo4Bits(sumAddressInHex(prev, ASCIItoBytes(element["operator"]))));
          }else if(element["mnemonic"] === "FCB"){
            const prev = previousLength[previousLength.length - 1];
            previousLength.push(formatTo4Bits(sumAddressInHex(prev, "1")));
          }else{
            const prev = previousLength[previousLength.length - 1];
            let line = preLength(element["mnemonic"], element["operator"]);
            let num = sumAddressInHex(prev, line["len"]);
            if(num === "NAN"){
              previousLength.push("0000");
            }else{
              previousLength.push(formatTo4Bits(num));
            }
          }
          
        }
      }
    });
    labels = labels.map((element) => {
      return {
        name: element["label"],
        value: previousLength[Number(element["pos"]-1)],
      };
    });
    previousLength.pop();
    setAddresses(previousLength);
    setTabsim(labels);
    
  };

  const secondRev = () => {
    const mnemAndOps = fileContent.map((element, idx) => {
      return getMnemonicFromLine(element);
    });

    let machineCodes = mnemAndOps.map((element) => {
      return toMachine(element["mnemonic"], element["operator"]);
    });
    console.log(machineCodes)
    machineCodes.shift();
    const corrected = machineCodes.map((element)=>{
      return deleteFToShow(element);
    })
    setMachineValues(corrected);
  };

  return (
    <>
      <div className="home__main-container">
        <h1 className="home__title">Programa traductor</h1>
        {acceptedFiles.length === 0 && (
          <section className="home__upload-box">
            <div {...getRootProps({ className: "dropzone" })}>
              <input {...getInputProps()} />
              <p>Selecciona un archivo</p>
            </div>
            <aside>
              <ul>{files}</ul>
            </aside>
          </section>
        )}
        {acceptedFiles.length !== 0 && !selectedFile && (
          <div className="home__translate-button">
            <Button variant="contained" onClick={readFile}>
              Mostrar archivo
            </Button>
          </div>
        )}
        {selectedFile && fileContent.length !== 0 && (
          <>
            <section className="home__file-content">
              <span className="home__text-area">
                <span className="home__addresses">
                  {addresses.map((element, idx) => {
                    return (
                      <p key={idx} className="home__line">
                        {element}
                      </p>
                    );
                  })}
                </span>
                <span className="home__machine">
                  {machineValues.map((element, idx) => {
                    return (
                      <p key={idx} className="home__line">
                        {element}
                      </p>
                    );
                  })}
                </span>
                <span className="home__file-content">
                  {fileContent.map((element, idx) => {
                    return (
                      <p key={idx} className="home__line">
                        {element.startsWith("\t") ? "\t" + element : element}
                      </p>
                    );
                  })}
                </span>
              </span>
              <span className="home__tabsim-area">
                <h2>TABSIM</h2>
                {
                  <Button variant="contained" onClick={onRenderFile}>
                    Mostrar Tabsim
                  </Button>
                }
                {tabsim.map((element, idx) => {
                  return (
                    <p key={idx}>
                      {element["name"]} - {element["value"]}
                    </p>
                  );
                })}
              </span>
            </section>
            <section className="home__translated-button">
              <Button variant="contained" onClick={secondRev}>
                Traducir
              </Button>
            </section>
          </>
        )}
      </div>
    </>
  );
};

export default Home;
