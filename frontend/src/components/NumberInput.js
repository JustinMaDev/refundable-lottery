import React, { useState } from "react";

const NumberInput = ({onChange, maxNumber}) => {
  const [isHex, setIsHex] = useState(false);
  const [value, setValue] = useState("");

  const validateInput = (input, isHexMode) => {
    if(input === "") return true;
    if (isHexMode) {
      const hexRegex = /^[0-9A-Fa-f]{0,4}$/;
      if (!hexRegex.test(input)) return false;
      
      const num = parseInt(input, 16);
      return num >= 0x0000 && num <= maxNumber;
    } else {
      const num = parseInt(input, 10);
      return !isNaN(num) && num >= 0 && num <= maxNumber;
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

  function generateHexRangeString(max) {
    const maxNumber = Number(max).toString(16).toUpperCase();
    const minValue = "0".padStart(maxNumber.length, "0");
    const maxValue = "F".repeat(maxNumber.length);
    return `${minValue} ~ ${maxValue}`;
  }

  return (
    <div className="flex gap-4">
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={isHex ? `${generateHexRangeString(maxNumber)}` : `0 ~ ${maxNumber}`}
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
