import { parse } from "postcss";
import React, { useState } from "react";

const NumberInput = ({onChange}) => {
  const [isHex, setIsHex] = useState(false);
  const [value, setValue] = useState("");

  const validateInput = (input, isHexMode) => {
    if(input === "") return true;
    if (isHexMode) {
      const hexRegex = /^[0-9A-Fa-f]{0,4}$/;
      if (!hexRegex.test(input)) return false;
      
      const num = parseInt(input, 16);
      return num >= 0x0000 && num <= 0xFFFF;
    } else {
      const num = parseInt(input, 10);
      return !isNaN(num) && num >= 0 && num <= 65535;
    }
  };

  const handleInputChange = (e) => {
    const input = e.target.value;
    if (validateInput(input, isHex)) {
      setValue(input.toUpperCase());
      if(isHex) {
        onChange(parseInt(input, 16) || 0);
      }else{
        onChange(parseInt(input, 10) || 0);
      }
    }
  };

  const toggleMode = () => {
    if (isHex && value !== "") {
      const decimalValue = parseInt(value, 16) || 0;
      setValue(decimalValue.toString(10));
    } else if(value !== "") {
      const hexValue = parseInt(value, 10).toString(16).toUpperCase();
      setValue(`${hexValue}`);
    }
    setIsHex(!isHex);
  };

  return (
    <div className="flex gap-4">
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={isHex ? "0000 ~ FFFF" : "0 ~ 65535"}
        className="flex-1 border border-gray-500 rounded px-4 py-2 text-lg text-white bg-black"
      />
      <label className="flex items-center gap-2 text-white">
        <input
          type="checkbox"
          checked={isHex}
          onChange={toggleMode}
          className="h-4 w-4"
        />
        <span className="text-sm">Hex</span>
      </label>
    </div>
  );
};

export default NumberInput;
