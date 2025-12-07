import { useContext, useState, useEffect } from "react";
import SectionCard from "../component/sectioncard";
import { globalContext } from "../App";
import API from "../endpoints/endpoints";
import useFetch from "../hooks/usefetch";

const Services = () => {
  const { allservices, setAllServices } = useContext(globalContext);

  const url = API.services();
  const { data, loading, err, doFetch } = useFetch();

  useEffect(() => {
    doFetch({
      url: url,
      method: "GET",
    });
  }, []);

  useEffect(() => {
    if (data) setAllServices(data);
  }, [data]);

  // Form field styles and options
  const [servicesData, setservicesData] = useState({
    title: "",
    description: "",
  });

  const updateservicesData = (arg, newdata) =>
    setservicesData((prev) => ({ ...prev, [arg]: newdata }));

  const inputStyle =
    "bg-purple/20 px-3 py-2  rounded w-full focus:outline-none focus:ring-2 focus:ring-purple/50";

  const fields = [
    <div className="w-full">
      <label className="font-semibold mb-1 block">Title</label>
      <input
        placeholder="Title"
        className={inputStyle}
        required
        value={servicesData.title}
        onChange={(e) => updateservicesData("title", e.target.value)}
      />
    </div>,

    <div className="w-full">
      <label className="font-semibold mb-1 block">Description</label>
      <textarea
        placeholder="Description"
        className={`${inputStyle} h-24`}
        required
        value={servicesData.description}
        onChange={(e) => updateservicesData("description", e.target.value)}
      />
    </div>,
  ];

  return (
    <>
      <div className=" bg-light rounded-2xl min-h-50 shadow-2xl p-6 ">
        <div>
          <SectionCard
            name="Services"
            button="Add New Service"
            thead={{
              title: "",
              description: "",
            }}
            tbody={allservices}
            fields={fields}
            payload={servicesData}
            url={API.services}
            updatepayload={setservicesData}
            updatedata={setAllServices}
            incrementkey={"TotalServices"}
          />
        </div>
      </div>
    </>
  );
};

export default Services;
