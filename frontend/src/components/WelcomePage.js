import React, {useState} from "react";
import { useTranslation } from "react-i18next";

const WelcomePage = () => {
  const { t } = useTranslation();
  const [showWelcome, setShowWelcome] = useState(true);
  
  const features = [
    {
      title: t("fair_randomness"),
      description: t("fair_randomness_description"),
      img: "/welcome/Chainlink-Logo-Blue.svg",
    },
    {
      title: t("walletconnect_compatible"),
      description: t("walletconnect_compatible_description"),
      img:"/welcome/reown.svg",
    },
    {
      title: t("flexible_purchases"),
      description: t("flexible_purchases_description"),
      img: "/welcome/chips-and-eth.svg",
    },
    {
      title: t("refundable_mechanism"),
      description: t("refundable_mechanism_description"),
      img: "/welcome/refund.svg",
      size: "w-20 h-10",
    },
    {
      title: t("open-access_process"),
      description: t("open-access_process_description"),
      img: "/welcome/access-process.svg",
    },
    {
      title: t("reward_mechanism"),
      description: t("reward_mechanism_description"),
      img: "/welcome/reward.svg",
      size: "w-20 h-10",
    },
  ];

  return (
    <>
    {showWelcome && (
    <div className="absolute inset-0 bg-gray-900 text-white flex flex-col items-center justify-center z-50">
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold">{t("welcome")}</h1>
        <p className="text-xl mt-4">{t("subheading")}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-gray-200 rounded-lg shadow-lg p-6 flex flex-col items-start space-y-4"
          >
            <div className="flex items-center space-x-2">
              <img src={feature.img} alt={feature.title} className={feature.size ? feature.size : "w-40 h-10"} />
              {feature.tag && (
                <span className="bg-blue-600 text-xs px-2 py-1 rounded-full font-semibold uppercase">
                  {feature.tag}
                </span>
              )}
            </div>
            <h2 className="text-xl text-gray-700 font-semibold">{feature.title}</h2>
            <p className="text-gray-700">{feature.description}</p>
          </div>
        ))}
      </div>
      <div className="text-center mt-12">
        <button
          className="bg-blue-600 text-white px-8 py-4 rounded-xl text-xl"
          onClick={() => setShowWelcome(false)}
        >
          {t("play")}
        </button>
      </div>
    </div>
    </div>)}
    </>
  );
};

export default WelcomePage;
