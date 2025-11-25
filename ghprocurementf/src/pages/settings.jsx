import React, { useContext, useEffect, useState } from "react";
import General from "../component/general";
import SEO from "../component/seo";
import SocialMedia from "../component/socialmedia";
import useFetch from "../hooks/usefetch";
import API from "../endpoints/endpoints";
import { globalContext } from "../App";
import { AiOutlineLoading } from "react-icons/ai";

function Settings() {
  const { meta, setMeta } = useContext(globalContext);
  const [oldmeta, setOldmeta] = useState({});
  const url = API.metadata;

  const { data, err, loading, doFetch } = useFetch();
  const [activeTab, setActiveTab] = useState("General");
  const [submit, setSubmit] = useState(false);

  const updateMeta = (name, newvalue) => {
    setMeta((prev) => ({ ...prev, [name]: newvalue }));
  };

  const handlepost = () => {
    if (JSON.stringify(oldmeta) != JSON.stringify(meta)) setSubmit(!submit);
  };

  useEffect(() => {
    if (submit) {
      doFetch({ url: url(2), method: "PUT", body: meta });
      console.log(meta);
      console.log("data from BE", data);
      setOldmeta(meta);
    }
  }, [submit]);
  const tabs = [
    {
      name: "General",
      component: (
        <General meta={meta} updateMeta={updateMeta} handlepost={handlepost} />
      ),
    },
    {
      name: "SEO",
      component: (
        <SEO meta={meta} updateMeta={updateMeta} handlepost={handlepost} />
      ),
    },
    {
      name: "SocialMedia",
      component: (
        <SocialMedia
          meta={meta}
          updateMeta={updateMeta}
          handlepost={handlepost}
        />
      ),
    },
  ];

  useEffect(() => {
    doFetch({
      url: url(2),
      method: "GET",
    });
  }, []);

  useEffect(() => {
    if (data) {
      setMeta(data);
      setOldmeta(data);
    }
  }, [data]);

  return (
    <div className="bg-sidenav rounded-2xl min-h-50 shadow-2xl p-6">
      <div className="mt-2 mb-5 border-b pb-3 border-gray/30">
        <p className="text-3xl font-bold text-purple">Settings</p>
        <div className="flex md:gap-x-5 mt-5">
          {tabs.map((tab) => (
            <p
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`font-semibold px-2 py-1 cursor-pointer ${
                activeTab === tab.name ? "text-purple" : "text-gray"
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
      <div
        className={`flex ${
          JSON.stringify(oldmeta) === JSON.stringify(meta)
            ? "bg-purple"
            : "bg-red-700  hover:-translate-y-1 hover:cursor-pointer"
        } gap-5 w-40 h-10 mt-5 justify-center items-center text-sidenav p-2 rounded  transition duration-500 ease-in-out  hover:shadow-2xl`}
        onClick={handlepost}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <AiOutlineLoading className="animate-spin text-white" />
            Updating...
          </div>
        ) : JSON.stringify(oldmeta) !== JSON.stringify(meta) ? (
          "Save Changes"
        ) : (
          "Updated"
        )}
      </div>
    </div>
  );
}

export default Settings;
