import React, { useContext, useState } from "react";
import { globalContext } from "../App";

function General({ meta, updateMeta }) {
  return (
    <div className="space-y-6">
      <div className="md:flex md:justify-between md:gap-4 w-full space-y-6">
        <div className="md:w-1/2 space-y-2">
          <p className="font-semibold text-lg"> Site Title </p>
          <input
            className="px-3 py-2 w-full focus:outline-1 border border-gray-300 focus:outline-gray-300  rounded-lg "
            value={meta.sitename}
            placeholder="Novyra Marketing"
            onChange={(e) => updateMeta("sitename", e.target.value)}
          />
        </div>{" "}
        <div className="md:w-1/2 space-y-2">
          <p className="font-semibold text-lg"> Tagline </p>
          <input
            className="px-3 py-2 w-full focus:outline-1 border border-gray-300 focus:outline-gray-300  rounded-lg "
            value={meta.tagline}
            placeholder="Digital Marketing Agency"
            onChange={(e) => updateMeta("tagline", e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <p className="font-semibold text-lg"> Site Description </p>
        <textarea
          className="px-3 py-2 w-full focus:outline-1 focus:outline-gray-300 border border-gray-300
          rounded-lg h-30"
          value={meta.description}
          placeholder="We help businesses grow through strategic digital marketing, compelling branding, and results-driven campaigns."
          onChange={(e) => updateMeta("description", e.target.value)}
        ></textarea>
      </div>
      <div className=" space-y-2">
        <p className="font-semibold text-lg"> Admin Email </p>
        <input
          type="email"
          className="px-3 py-2 w-full focus:outline-1 border border-gray-300 focus:outline-gray-300  rounded-lg "
          value={meta.adminemail}
          placeholder="admin@novyra.com"
          onChange={(e) => updateMeta("adminemail", e.target.value)}
        />
      </div>
    </div>
  );
}

export default General;
