import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = ({className}) => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  console.log("i18n.language", i18n.language);
  return (
    <div className={`w-30 ${ className }`} >
      <select
        onChange={handleLanguageChange}
        defaultValue={i18n.language}
        className="w-full h-10 px-3 border border-gray-300 rounded-md bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="ar" className="text-black">العربية</option>
        <option value="de" className="text-black">Deutsch</option>
        <option value="en" className="text-black">English</option>
        <option value="fr" className="text-black">Français</option>
        <option value="ja" className="text-black">日本語</option>
        <option value="ko" className="text-black">한국어</option>
        <option value="ru" className="text-black">Русский</option>
        <option value="zh" className="text-black">中文</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
