import React from "react";
import { useState } from "react";
function SocialMedia() {
  const [title, setTitle] = useState("hello");
  return (
    <div className="space-y-6">
      <div className="md:flex md:justify-between md:gap-4 w-full space-y-6">
        <div className="md:w-1/2 space-y-2">
          <p className="font-semibold text-lg"> Facebook URL </p>
          <input
            className="px-3 py-2 w-full focus:outline-1 border border-gray-300 focus:outline-gray-300  rounded-lg "
            value={title}
            placeholder="Novyra Marketing"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>{" "}
        <div className="md:w-1/2 space-y-2">
          <p className="font-semibold text-lg"> Key </p>
          <input
            className="px-3 py-2 w-full focus:outline-1 border border-gray-300 focus:outline-gray-300  rounded-lg "
            value={title}
            placeholder="Digital Marketing Agency"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>
      <div className="md:flex md:justify-between md:gap-4 w-full space-y-6">
        <div className="md:w-1/2 space-y-2">
          <p className="font-semibold text-lg"> X URL</p>
          <input
            className="px-3 py-2 w-full focus:outline-1 border border-gray-300 focus:outline-gray-300  rounded-lg "
            value={title}
            placeholder="Novyra Marketing"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>{" "}
        <div className="md:w-1/2 space-y-2">
          <p className="font-semibold text-lg"> Key </p>
          <input
            className="px-3 py-2 w-full focus:outline-1 border border-gray-300 focus:outline-gray-300  rounded-lg "
            value={title}
            placeholder="Digital Marketing Agency"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-blue-700 w-30 text-center text-white p-2 rounded hover:cursor-pointer transition duration-500 ease-in-out hover:-translate-y-1  hover:shadow-2xl">
        Save Change
      </div>
    </div>
  );
}

export default SocialMedia;
