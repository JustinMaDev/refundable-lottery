import React from "react";

function Rules() {
  return (
    <div className="rule-page min-h-full p-4 bg-red-100 text-red-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Game rules</h2>
      <ul className="list-decimal list-inside">
        <li>Players can buy tickets with ether or ChipsToken.</li>
        <br />
        <li>Players can specify a lucky number between [0, 65535] as their ticket number.</li>
        <br />
        <li>The winner is chosen by blockhash every 1000 blocks</li>
        <br />
        <li>Winner(s) get(s) all the prize pool in the current round.</li>
        <br />
        <li>If there is no winner in the current round, then all players in THIS round can refund 99% of their ether(or chips).</li>
        <br />
        <li>When refunding ether, the player will get equivalent ChipsToken as the management fee they spend.</li>
        <br />
        <li>When players purchase tickets using ChipsToken, they will receive a 50% discount compared to paying with Ether.</li>
        <br />
        <li>The number of players using ChipsToken should be less than 50% of the total players in a round.</li>
        <br />
        <li>NOTE: If there's a winner in a round, she/he will get all the prize pool so other players can't refund their tickets any more. </li>
      </ul>
    </div>
  );
}

export default Rules;