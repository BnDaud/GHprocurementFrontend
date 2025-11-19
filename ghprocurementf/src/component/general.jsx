import React, { useState } from "react";

function General() {
  const [title, setTitle] = useState("hello");

  return (
    <div className="space-y-6">
      <div className="md:flex md:justify-between md:gap-4 w-full space-y-6">
        <div className="md:w-1/2 space-y-2">
          <p className="font-semibold text-lg"> Site Title </p>
          <input
            className="px-3 py-2 w-full focus:outline-1 border border-gray-300 focus:outline-gray-300  rounded-lg "
            value={title}
            placeholder="Novyra Marketing"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>{" "}
        <div className="md:w-1/2 space-y-2">
          <p className="font-semibold text-lg"> Tagline </p>
          <input
            className="px-3 py-2 w-full focus:outline-1 border border-gray-300 focus:outline-gray-300  rounded-lg "
            value={title}
            placeholder="Digital Marketing Agency"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <p className="font-semibold text-lg"> Site Description </p>
        <textarea
          className="px-3 py-2 w-full focus:outline-1 focus:outline-gray-300 border border-gray-300
          rounded-lg h-30"
          value={title}
          placeholder="We help businesses grow through strategic digital marketing, compelling branding, and results-driven campaigns."
          onChange={(e) => setTitle(e.target.value)}
        ></textarea>
      </div>
      <div className=" space-y-2">
        <p className="font-semibold text-lg"> Admin Email </p>
        <input
          type="email"
          className="px-3 py-2 w-full focus:outline-1 border border-gray-300 focus:outline-gray-300  rounded-lg "
          value={title}
          placeholder="admin@novyra.com"
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="bg-blue-700 w-30 text-center text-white p-2 rounded hover:cursor-pointer transition duration-500 ease-in-out hover:-translate-y-1  hover:shadow-2xl">
        Save Change
      </div>
    </div>
  );
}

export default General;
