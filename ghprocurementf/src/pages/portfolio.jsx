import React, { useContext, useEffect, useState } from "react";
import Card from "../component/card";
import useFetch from "../hooks/usefetch";
import { globalContext } from "../App";
import API from "../endpoints/endpoints";
import { AiOutlineLoading } from "react-icons/ai";
import Modal from "../component/modal";

function Portfolio() {
  const url = API.portfolio;
  const loadingIcon = (
    <AiOutlineLoading className="text-amber-600 text-4xl animate-spin" />
  );
  const containerstyle =
    "relative w-70 bg-white h-120 rounded-lg space-y-2 p-3 transition-all hover:-translate-y-1 duration-800 hover:shadow-2xl ease-in-out";

  const { data, loading, err, doFetch } = useFetch();
  const { portfolios, setPortfolios } = useContext(globalContext);
  useEffect(() => {
    doFetch({ url: url(), method: "GET" });
  }, []);

  useEffect(() => {
    if (data) setPortfolios(data);
  }, [data]);

  const [addNew, setAddNew] = useState(false);
  const toggleaddnew = () => {
    setAddNew(!addNew);
  };
  // Form field styles and options
  const [portfolioData, setPortfolioData] = useState({
    title: "",
    client_name: "",
    description: "",
    category: "",
    thumbnail: null,
    images: [],
    status: "",
    date_completed: "",
  });

  const updatePortfolioData = (arg, newdata) =>
    setPortfolioData((prev) => ({ ...prev, [arg]: newdata }));

  const inputStyle =
    "bg-purple/20 px-3 py-2  rounded w-full focus:outline-none focus:ring-2 focus:ring-purple/50";

  const categories = [
    "DIGITAL MARKETING",
    "SEO OPTIMIZATION",
    "AI MARKETING",
    "BRAND STRATEGY",
    "WEB DESIGN",
    "SOCIAL MEDIA",
    "EMAIL CAMPAIGNS",
    "INFLUENCER MARKETING",
    "CONTENT CREATION",
    "PAID ADVERTISING",
  ];

  const statusOptions = ["Draft", "Published"];

  const fields = [
    <div className="w-full">
      <label className="font-semibold mb-1 block">Title</label>
      <input
        placeholder="Title"
        className={inputStyle}
        required
        value={portfolioData.title}
        onChange={(e) => updatePortfolioData("title", e.target.value)}
      />
    </div>,

    <div className="w-full">
      <label className="font-semibold mb-1 block">Client Name</label>
      <input
        placeholder="Client Name"
        className={inputStyle}
        required
        value={portfolioData.client_name}
        onChange={(e) => updatePortfolioData("client_name", e.target.value)}
      />
    </div>,

    <div className="w-full">
      <label className="font-semibold mb-1 block">Description</label>
      <textarea
        placeholder="Description"
        className={`${inputStyle} h-24`}
        required
        value={portfolioData.description}
        onChange={(e) => updatePortfolioData("description", e.target.value)}
      />
    </div>,

    <div className="w-full">
      <label className="font-semibold mb-1 block">Category</label>
      <select
        className={inputStyle}
        required
        value={portfolioData.category}
        onChange={(e) => updatePortfolioData("category", e.target.value)}
      >
        <option value="" disabled>
          Select Category
        </option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>,

    <div className="w-full">
      <label className="font-semibold mb-1 block">Thumbnail</label>
      <input
        type="file"
        accept="image/*"
        className={inputStyle}
        onChange={(e) => updatePortfolioData("thumbnail", e.target.files[0])}
      />
    </div>,

    <div className="w-full">
      <label className="font-semibold mb-1 block">Portfolio Images</label>
      <input
        type="file"
        accept="image/*"
        multiple
        className={inputStyle}
        onChange={(e) => updatePortfolioData("images", [...e.target.files])}
      />
    </div>,

    <div className="w-full">
      <label className="font-semibold mb-1 block">Status</label>
      <select
        className={inputStyle}
        required
        value={portfolioData.status}
        onChange={(e) => updatePortfolioData("status", e.target.value)}
      >
        <option value="" disabled>
          Select Status
        </option>
        {statusOptions.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>,

    <div className="w-full">
      <label className="font-semibold mb-1 block">Date Completed</label>
      <input
        type="datetime-local"
        className={inputStyle}
        value={portfolioData.date_completed}
        onChange={(e) => updatePortfolioData("date_completed", e.target.value)}
      />
    </div>,
  ];

  return (
    <>
      {" "}
      {addNew ? (
        <Modal
          togglestate={toggleaddnew}
          fields={fields}
          payload={portfolioData} //data structure to be submit
          method={"POST"}
          url={url()}
          dataTobeUpdated={portfolios}
          updatedata={setPortfolios}
          buttonstyle={
            "bg-purple text-sidenav py-2 px-6 rounded-lg  hover:font-semibold transition duration-500 hover:-translate-y-0.5 ease-in-out w-full md:w-auto"
          }
          incrementkey={"TotalPortfolio"}
        />
      ) : null}
      <div className=" bg-light rounded-2xl min-h-50 shadow-2xl p-6 ">
        <div className="flex flex-wrap justify-between gap-6 mt-2 mb-5 border-b pb-5 border-gray/30">
          {" "}
          <p className="text-3xl font-bold text-purple">Portfolio</p>{" "}
          <div
            className="bg-purple text-sidenav hover:font-semibold p-2 rounded hover:cursor-pointer transition duration-500 ease-in-out hover:-translate-y-0.2  hover:shadow-2xl"
            onClick={toggleaddnew}
          >
            Add New Item
          </div>
        </div>
        <div
          className={`flex flex-wrap gap-4 items-center ${
            !data ? "h-100" : ""
          }  justify-center`}
        >
          {data
            ? portfolios.map((data, idx) => (
                <Card
                  key={idx}
                  logostyle={"rounded-lg w-full h-60 object-cover"}
                  description={data.description}
                  containerstyle={containerstyle}
                  topic={data.title}
                  category={data.category}
                  year={data.created_at}
                />
              ))
            : loadingIcon}
        </div>
      </div>
    </>
  );
}

export default Portfolio;
