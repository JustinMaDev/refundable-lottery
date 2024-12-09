import React, { useState } from "react";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";

const RulePortal = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        className="btn btn-outline"
        onClick={() => setIsOpen(true)}
      >
        {t("what_is_the_role")}
      </button>
      {isOpen &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-gray-800 text-white rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-center">{t("refundable_lottery_rules")}</h2>
                <div className="space-y-4">
                  <p>{t("rule_0")}</p>
                  <p>{t("rule_1")}</p>
                  <p>{t("rule_2")}</p>
                  <p>{t("rule_3")}</p>
                  <p>{t("rule_4")}</p>
                  <p>{t("rule_5")}</p>
                  <p>{t("rule_6")}</p>
                  <p>{t("rule_7")}</p>
                  <h2>{t("note")}</h2>
                  <p>{t("note_1")}</p>
                  <p>{t("note_2")}</p>
                  {/*<p>{t("how_to_get_chips")}</p>
                  <p>
                    <a 
                      href="http://localhost:3001/" 
                      className="text-yellow-500"
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {t("buy_chips")}
                    </a>
                  </p>*/}
                </div>
              <button
                className="btn btn-primary mt-4"
                onClick={() => setIsOpen(false)}
              >
                {t("close")}
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default RulePortal;
