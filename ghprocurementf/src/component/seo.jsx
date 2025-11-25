import React from "react";
import { useState } from "react";
function SEO({ meta, updateMeta }) {
  const inputstyle =
    "bg-purple/20 px-3 py-2  rounded w-full focus:outline-none focus:ring-2 focus:ring-purple/50";
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="font-semibold text-lg"> Meta Title </p>
        <input
          className={inputstyle}
          value={meta.metaTitle}
          placeholder="Procurement"
          onChange={(e) => updateMeta("metaTitle", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <p className="font-semibold text-lg"> Meta Description </p>
        <textarea
          className={inputstyle}
          value={meta.metaDescription}
          placeholder="We help businesses ......."
          onChange={(e) => updateMeta("metaDescription", e.target.value)}
        ></textarea>
      </div>
      <div className="space-y-2">
        <p className="font-semibold text-lg"> Keywords </p>
        <input
          className={inputstyle}
          placeholder="Input , Export ...."
          onChange={(e) => updateMeta("keywords", e.target.value)}
        />
      </div>
    </div>
  );
}

export default SEO;
