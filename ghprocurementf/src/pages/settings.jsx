import React, { useState } from "react";
import General from "../component/general";
import SEO from "../component/seo";
import SocialMedia from "../component/socialmedia";

function Settings() {
  const [activeTab, setActiveTab] = useState("General");

  const tabs = [
    { name: "General", component: <General /> },
    { name: "SEO", component: <SEO /> },
    { name: "SocialMedia", component: <SocialMedia /> },
  ];

  return (
    <div className="bg-light rounded-2xl min-h-50 shadow-2xl p-6">
      <div className="mt-2 mb-5 border-b pb-3 border-gray/30">
        <p className="text-3xl font-bold">Settings</p>
        <div className="flex gap-x-5 mt-5">
          {tabs.map((tab) => (
            <p
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`font-semibold px-2 py-1 cursor-pointer ${
                activeTab === tab.name ? "text-blue-700" : "text-gray"
              }`}
            >
              {tab.name}
            </p>
          ))}
        </div>
      </div>

      {/* Render active tab component */}
      <div className="mt-4">
        {tabs.find((tab) => tab.name === activeTab)?.component}
      </div>
    </div>
  );
}

export default Settings;
