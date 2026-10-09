import { useContext, useState, useEffect } from "react";
import SectionCard from "../component/sectioncard";
import { Field, inputClass, textareaClass } from "../component/ui";
import { globalContext } from "../App";
import API from "../endpoints/endpoints";
import useFetch from "../hooks/usefetch";
import useOpenNew from "../hooks/useopennew";

const Services = () => {
  const { allservices, setAllServices } = useContext(globalContext);
  const openNew = useOpenNew();

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

  const fields = [
    <Field full label="Title" htmlFor="service-title">
      <input
        id="service-title"
        placeholder="Title"
        className={inputClass}
        required
        value={servicesData.title}
        onChange={(e) => updateservicesData("title", e.target.value)}
      />
    </Field>,

    <Field full label="Description" htmlFor="service-description">
      <textarea
        id="service-description"
        placeholder="Description"
        className={`${textareaClass} h-32`}
        required
        value={servicesData.description}
        onChange={(e) => updateservicesData("description", e.target.value)}
      />
    </Field>,
  ];

  return (
    <SectionCard
      name="Services"
      singular="service"
      subtitle="What GH Procurement offers customers."
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
      loading={loading || (data === null && !err)}
      error={!!err}
      initialAddOpen={openNew}
    />
  );
};

export default Services;
