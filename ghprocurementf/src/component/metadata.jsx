import React, { useContext, useState } from "react";
import { globalContext } from "../App";

function Metadata({ meta, updateMeta }) {
  const inputstyle =
    "bg-purple/20 px-3 py-2  rounded w-full focus:outline-none focus:ring-2 focus:ring-purple/50";

  return (
    <div className="space-y-6">
      <div className="md:flex md:justify-between md:gap-4 w-full space-y-6">
        <div className="md:w-1/2 space-y-2">
          <p className="font-semibold text-lg"> Meta Introduction </p>
          <input
            className={inputstyle}
            value={meta.metaIntro}
            placeholder="Gh Procurement"
            onChange={(e) => updateMeta("metaIntro", e.target.value)}
          />
        </div>{" "}
      </div>
      <div className="space-y-2">
        <p className="font-semibold text-lg"> Meta Description </p>
        <textarea
          className={inputstyle}
          value={meta.metaDescription}
          placeholder="About your business"
          onChange={(e) => updateMeta("metaDescription", e.target.value)}
        ></textarea>
      </div>
      <div className=" space-y-2">
        <p className="font-semibold text-lg"> Orders Completed </p>
        <input
          type="number"
          pattern="\d*"
          inputMode="numeric"
          className={inputstyle}
          value={meta.ordersCompleted}
          placeholder="1250"
          onChange={(e) => updateMeta("ordersCompleted", e.target.value)}
        />
      </div>{" "}
      <div className=" space-y-2">
        <p className="font-semibold text-lg"> Suppliers </p>
        <input
          type="number"
          pattern="\d*"
          inputMode="numeric"
          className={inputstyle}
          value={meta.suppliers}
          placeholder="400"
          onChange={(e) => updateMeta("suppliers", e.target.value)}
        />
      </div>{" "}
      <div className=" space-y-2">
        <p className="font-semibold text-lg"> Yrs of Experience </p>
        <input
          type="number"
          pattern="\d*"
          inputMode="numeric"
          className={inputstyle}
          value={meta.experience}
          placeholder="3"
          onChange={(e) => updateMeta("experience", e.target.value)}
        />
      </div>
    </div>
  );
}

export default Metadata;
