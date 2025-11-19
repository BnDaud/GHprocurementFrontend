import React, { useEffect, useState } from "react";

function SectionCard({ name, thead, button, tbody }) {
  const [indexStatus, setIndexStatus] = useState();
  const statusStyle = {
    Published:
      "rounded-2xl bg-green-100 text-green-600 px-2 text-center text-sm font-bold py-0.5",
    Draft:
      "rounded-2xl bg-amber-100 text-amber-600 px-2 text-center text-sm font-bold py-0.5",
    Inactive:
      "rounded-2xl bg-amber-100 text-amber-600 px-2 text-center text-sm font-bold py-0.5",
    Active:
      "rounded-2xl bg-green-100 text-green-600 px-2 text-center text-sm font-bold py-0.5",
  };

  const [keys, setKeys] = useState([]);

  useEffect(() => {
    if (thead) {
      const k = Object.keys(thead);
      const index = k.findIndex((p) => p.toLowerCase() === "status");
      setIndexStatus(index);
      setKeys(k);
    }
  }, [thead]);

  const pullValues = (obj) => {
    return Object.values(obj);
  };
  return (
    <>
      {" "}
      <div className="flex flex-wrap justify-between gap-6 mt-2 mb-5 border-b pb-5 border-gray/30">
        {" "}
        <p className="text-3xl font-bold">{name}</p>{" "}
        <div className="bg-blue-700 text-white p-2 rounded hover:cursor-pointer transition duration-500 ease-in-out hover:-translate-y-1  hover:shadow-2xl">
          {button}
        </div>
      </div>
      <div className="w-full h-60 overflow-auto">
        <table className="table-auto min-w-max md:w-full">
          <thead className="bg-gray/5 h-12">
            <tr className="mx-2">
              {keys.map((p) => (
                <th>{p}</th>
              ))}
              <th> Actions</th>
            </tr>
          </thead>
          <tbody>
            {tbody.map((obj) => (
              <tr className="hover:bg-gray/5 border-b border-gray/10 h-15">
                {pullValues(obj).map((content, index) => (
                  <td className={`px-4 py-2 `}>
                    <div
                      className={`${
                        index === indexStatus ? statusStyle[content] : ""
                      }`}
                    >
                      {" "}
                      {content}
                    </div>
                  </td>
                ))}
                <td className="flex items-center h-15 gap-2 px-4 py-2">
                  <div className="border px-3 py-1 font-bold text-blue-700 text-sm  border-blue-700 hover:cursor-pointer hover:text-white hover:bg-blue-700 rounded">
                    Edit
                  </div>
                  <div className="border px-3 py-1 font-bold text-white bg-red-700 text-sm  border-red-700 hover:cursor-pointer rounded transition-all hover:-translate-y-0.5 duration-300 hover:shadow-2xl">
                    {" "}
                    Delete
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default SectionCard;
