import React from "react";
import { useState } from "react";
function SEO({ meta, updateMeta }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="font-semibold text-lg"> Meta Title </p>
        <input
          className="px-3 py-2 w-full focus:outline-1 border border-gray-300 focus:outline-gray-300  rounded-lg "
          value={meta.metaTitle}
          placeholder="Novyra Marketing"
          onChange={(e) => updateMeta("metaTitle", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <p className="font-semibold text-lg"> Meta Description </p>
        <textarea
          className="px-3 py-2 w-full focus:outline-1 focus:outline-gray-300 border border-gray-300
          rounded-lg h-30"
          value={meta.metaDescription}
          placeholder="We help businesses grow through strategic digital marketing, compelling branding, and results-driven campaigns."
          onChange={(e) => updateMeta("metaDescription", e.target.value)}
        ></textarea>
      </div>
      <div className="space-y-2">
        <p className="font-semibold text-lg"> Keywords </p>
        <input
          className="px-3 py-2 w-full focus:outline-1 border border-gray-300 focus:outline-gray-300  rounded-lg "
          value={meta.keywords}
          placeholder="Novyra Marketing"
          onChange={(e) => updateMeta("keywords", e.target.value)}
        />
      </div>
    </div>
  );
}

export default SEO;
