import React, {useState} from "react";
import { useTranslation } from "react-i18next";

const WelcomePage = () => {
  const { t } = useTranslation();
  const [showWelcome, setShowWelcome] = useState(true);

  const features = [
    {
      title: "Fair Randomness",
      description: "To ensure fairness, transparency, and impartiality, the contract leverages Chainlink VRF (Verifiable Random Function) for randomness generation.",
      img: "/welcome/Chainlink-Logo-Blue.svg",
    },
    {
      title: "WalletConnect Compatible",
      description:
        "Powered by reown-appkit, this game support any wallet that compatible with WalletConnect. You can play with metamask extension or mobile wallet like TrustWallet, etc.",
      img:"/welcome/reown.svg",
    },
    {
      title: "Flexible Purchases",
      description: "You can purchase tickets with ETH or ChipsTokens. 1 eth can buy 1000 chips and if you purchase ticket with chips, you will get 50% discount.",
      img: "/welcome/chips-and-eth.svg",
    },
    {
      title: "Open-access Process",
      description: "This game allows any player to participate in key phases of the game, ensuring decentralization and inclusivity. Any player can trigger the dice-rolling process or the lottery drawing process.",
      img: "/welcome/access-process.svg",
    },
    {
      title: "Reward Mechanism",
      description: "Players who trigger critical actions like rolling the dice or drawing lottery are incentivized with small rewards, enhancing engagement and active participation.",
      img: "/welcome/reward.svg",
    },
    {
      title: "Immutable Rules",
      description: "All rules are programmed into the blockchain contract, making them immutable, even the contract owner cannot modify them. The only benefit the owner receives is a 1% management fee.",
      img: "/welcome/blockchain.svg",
    },
  ];

  return (
    <>
    {showWelcome && (
    <div className="absolute inset-0 bg-gray-900 text-white flex flex-col items-center justify-center z-50">
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold">{t("welcome")}</h1>
        <p className="text-xl mt-4">A fair and refundable blockchain lottery game</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-gray-200 rounded-lg shadow-lg p-6 flex flex-col items-start space-y-4"
          >
            <div className="flex items-center space-x-2">
              <img src={feature.img} alt={feature.title} className="w-40 h-10" />
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
