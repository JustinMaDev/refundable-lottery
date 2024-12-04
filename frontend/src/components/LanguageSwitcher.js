import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = ({className}) => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;
    i18n.changeLanguage(selectedLanguage);
  };

  return (
    <div className={`w-30 ${ className }`} >
      <select
        onChange={handleLanguageChange}
        defaultValue={i18n.language}
        className="w-full h-10 px-3 border border-gray-300 rounded-md bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="en" className="text-black">English</option>
        <option value="zh" className="text-black">中文</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
