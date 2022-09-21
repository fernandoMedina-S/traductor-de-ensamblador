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
      console.log(label);
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
    let relIdx = 0;
    let num = num1.substring(2);
    if(!num.startsWith("F") ){
      return num1;
    }else{
      while(canContinue){
        if(num.startsWith("F")){
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
    if(opInDec >= -127 && opInDec <= 127){
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

  const toMachine = (mnemonic, operator) => {
    let modOp = operator;
    const consulted = mnemonics[mnemonic];
    let opInHex = operatorToHex(operator);
    let dir = operatorToMode(opInHex);

    if (consulted["starting"]) {
      return opInHex;
    }
    if (consulted === undefined) {
      return "invalid";
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
    } else {
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

    if (consulted["starting"]) {
      return { value: "END", len: 0 };
    }
    if (consulted === undefined) {
      return { value: "invalid", len: 0 };
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
    return { pos: idx, label: line.substring(0, mnemIdx - 1) };
  };

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
        const prev = previousLength[previousLength.length - 1];
        const line = preLength(element["mnemonic"], element["operator"]);
        previousLength.push(sumAddressInHex(prev, line["len"]));
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
    //console.log(toMachine("ADCA", "#123"));
  };

  const secondRev = () => {
    const mnemAndOps = fileContent.map((element, idx) => {
      return getMnemonicFromLine(element);
    });

    let machineCodes = mnemAndOps.map((element) => {
      return toMachine(element["mnemonic"], element["operator"]);
    });
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
