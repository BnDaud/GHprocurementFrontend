import React from "react";
import { useState } from "react";
function Contact({ meta, updateMeta }) {
  const inputstyle =
    "bg-purple/20 px-3 py-2  rounded w-full focus:outline-none focus:ring-2 focus:ring-purple/50";
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="font-semibold text-lg"> Email</p>
        <input
          type="email"
          className={inputstyle}
          value={meta.email}
          placeholder="@email.com"
          onChange={(e) => updateMeta("email", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <p className="font-semibold text-lg"> Phone </p>
        <input
          className={inputstyle}
          value={meta.phone}
          placeholder="+234 ....."
          onChange={(e) => updateMeta("phone", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <p className="font-semibold text-lg"> Office </p>
        <input
          className={inputstyle}
          value={meta.office}
          placeholder="No. ........"
          onChange={(e) => updateMeta("office", e.target.value)}
        />
      </div>
    </div>
  );
}

export default Contact;
