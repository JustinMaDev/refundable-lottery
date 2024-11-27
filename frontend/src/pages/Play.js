import React from "react";

function Play() {
  return (
    <div className="play-page min-h-full p-4 bg-green-100 text-green-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Buy a ticket</h2>
      <form>
        <div className="form-control mb-4 flex">
          <label className="label" htmlFor="inputName">
            <span className="label-text font-semibold">Choose you lucky number from [0,65535]</span>
          </label>
          <input
            type="number"
            id="luckyNumber"
            name="name"
            placeholder=""
            className="input input-bordered w-full"
          />
        </div>

        <button className="btn btn-primary w-full">Buy</button>
      </form>
    </div>
  );
}

export default Play;