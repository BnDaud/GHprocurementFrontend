import React from "react";
import { useState } from "react";
function SocialMedia({ meta, updateMeta }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="font-semibold text-lg"> Facebook URL </p>
        <input
          className="px-3 py-2 w-full focus:outline-1 border border-gray-300 focus:outline-gray-300  rounded-lg "
          value={meta.facebook}
          placeholder="https://"
          onChange={(e) => updateMeta("facebook", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <p className="font-semibold text-lg"> X URL </p>
        <input
          className="px-3 py-2 w-full focus:outline-1 border border-gray-300 focus:outline-gray-300  rounded-lg "
          value={meta.x}
          placeholder="https://"
          onChange={(e) => updateMeta("x", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <p className="font-semibold text-lg"> Instagram URL </p>
        <input
          className="px-3 py-2 w-full focus:outline-1 border border-gray-300 focus:outline-gray-300  rounded-lg "
          value={meta.instag}
          placeholder="https://"
          onChange={(e) => updateMeta("instag", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <p className="font-semibold text-lg"> Linkedin URL </p>
        <input
          className="px-3 py-2 w-full focus:outline-1 border border-gray-300 focus:outline-gray-300  rounded-lg "
          value={meta.linkedin}
          placeholder="https://"
          onChange={(e) => updateMeta("linkedin", e.target.value)}
        />
      </div>{" "}
    </div>
  );
}

export default SocialMedia;
