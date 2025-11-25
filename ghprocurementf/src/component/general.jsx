import React, { useContext, useState } from "react";
import { globalContext } from "../App";

function General({ meta, updateMeta }) {
  const inputstyle =
    "bg-purple/20 px-3 py-2  rounded w-full focus:outline-none focus:ring-2 focus:ring-purple/50";

  return (
    <div className="space-y-6">
      <div className="md:flex md:justify-between md:gap-4 w-full space-y-6">
        <div className="md:w-1/2 space-y-2">
          <p className="font-semibold text-lg"> Site Title </p>
          <input
            className={inputstyle}
            value={meta.sitename}
            placeholder="Gh Procurement"
            onChange={(e) => updateMeta("sitename", e.target.value)}
          />
        </div>{" "}
        <div className="md:w-1/2 space-y-2">
          <p className="font-semibold text-lg"> Tagline </p>
          <input
            className={inputstyle}
            value={meta.tagline}
            placeholder="Procurement"
            onChange={(e) => updateMeta("tagline", e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <p className="font-semibold text-lg"> Site Description </p>
        <textarea
          className={inputstyle}
          value={meta.description}
          placeholder="We help businesses grow through strategic digital marketing, compelling branding, and results-driven campaigns."
          onChange={(e) => updateMeta("description", e.target.value)}
        ></textarea>
      </div>
      <div className=" space-y-2">
        <p className="font-semibold text-lg"> Admin Email </p>
        <input
          type="email"
          className={inputstyle}
          value={meta.adminemail}
          placeholder="admin@ghpro.com"
          onChange={(e) => updateMeta("adminemail", e.target.value)}
        />
      </div>
    </div>
  );
}

export default General;
