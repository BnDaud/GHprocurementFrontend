import React, { useEffect, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import Modal from "./modal";
import { v4 as uuidv4 } from "uuid";
function SectionCard({
  name,
  thead,
  button,
  tbody,
  fields,
  payload = {},
  url = "",
  updatepayload,
  incrementkey,
  updatedata = null, // a function that update the overall data
}) {
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

  const [addNew, setAddNew] = useState(false);
  const [editdata, setEditData] = useState(false);
  const [deletedata, setDeleteData] = useState(false);
  const [id, setId] = useState(0);

  const toggleaddnew = () => {
    setAddNew(!addNew);
  };

  const handledit = (id_, obj) => {
    // const selected = tbody.find((item) => item.id === id_);
    //setEditPayload(obj);
    updatepayload((prev) => ({ ...prev, ...obj }));
    setId(id_);
    setEditData(!editdata);
  };
  const toggledit = () => {
    setEditData(!editdata);
  };

  const handledelete = (id_) => {
    setId(id_);
    setDeleteData(!deletedata);
  };
  const toggleDelete = () => setDeleteData(!deletedata);

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
    return keys.map((key) => obj[key]); //Object.values(obj);
  };
  return (
    <>
      {addNew ? (
        <Modal
          togglestate={toggleaddnew}
          fields={fields}
          payload={payload} //data structure to be submit
          method={"POST"}
          url={url()}
          dataTobeUpdated={tbody}
          updatedata={updatedata}
          buttonstyle={
            "bg-purple text-sidenav py-2 px-6 rounded-lg  hover:font-semibold transition duration-500 hover:-translate-y-0.5 ease-in-out w-full md:w-auto"
          }
          incrementkey={incrementkey}
        />
      ) : null}
      {editdata ? (
        <Modal
          togglestate={toggledit}
          fields={fields}
          payload={payload} //data structure to be submit
          method={"PUT"}
          url={url(id)}
          id={id} //
          updatedata={updatedata}
          dataTobeUpdated={tbody}
          buttonstyle={
            "bg-blue-500 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-600 transition w-full md:w-auto"
          }
          incrementkey={incrementkey}
        />
      ) : null}
      {deletedata ? (
        <Modal
          togglestate={toggleDelete}
          fields={[
            <div className="w-full text-center text-xl capitalize">
              {" "}
              Are You Sure you want To continue this action ?{" "}
            </div>,
          ]}
          buttonstyle={
            "bg-red-400 text-white py-2 px-6 rounded-lg font-semibold hover:bg-red-600 transition w-full md:w-auto"
          }
          url={url(id)}
          id={id}
          updatedata={updatedata}
          dataTobeUpdated={tbody}
          method="DELETE"
          incrementkey={incrementkey}
        />
      ) : null}
      <div className="flex flex-wrap justify-between gap-6 mt-2 mb-5 border-b pb-5 border-gray/30">
        {" "}
        <p className="text-3xl font-bold text-purple">{name}</p>{" "}
        <div
          className="bg-purple text-sidenav p-2 rounded hover:cursor-pointer hover:font-semibold transition duration-300 ease-in-out hover:-translate-y-0.2  hover:shadow-2xl"
          onClick={toggleaddnew}
        >
          {button}
        </div>
      </div>
      <div className="w-full h-60 overflow-auto">
        {tbody.length > 0 ? (
          <table className="table-auto min-w-max md:w-full">
            <thead className="bg-gray/5 h-12">
              <tr key={uuidv4()} className="mx-2">
                {keys.map((p) => (
                  <th key={uuidv4()} className="capitalize">
                    {p}
                  </th>
                ))}
                <th> Actions</th>
              </tr>
            </thead>
            <tbody>
              {tbody.map((obj, rowIndex) => (
                <tr
                  key={uuidv4()}
                  className="hover:bg-gray-50 border-b border-gray-200 h-15"
                >
                  {pullValues(obj).map((content, index) => (
                    <td
                      key={uuidv4()}
                      className="px-4 py-2 max-w-xs capitalize" // fixed or max width required for truncate
                    >
                      <div
                        className={`truncate overflow-hidden whitespace-nowrap ${
                          index === indexStatus ? statusStyle[content] : ""
                        }`}
                        title={content} // shows full text on hover
                      >
                        {content}
                      </div>
                    </td>
                  ))}

                  {/* Action buttons */}
                  <td className="flex items-center gap-2 px-4 py-2">
                    <div
                      className="border px-3 py-1 font-bold text-blue-700 text-sm border-blue-700 hover:cursor-pointer hover:text-white hover:bg-blue-700 rounded transition-all duration-200"
                      onClick={() => handledit(obj.id, obj)}
                    >
                      Edit
                    </div>
                    <div
                      className="border px-3 py-1 font-bold text-white bg-red-700 text-sm border-red-700 hover:cursor-pointer rounded transition-all hover:-translate-y-0.5 duration-300 hover:shadow-2xl"
                      onClick={() => handledelete(obj.id)}
                    >
                      Delete
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex justify-center items-center h-full w-full  ">
            {" "}
            <AiOutlineLoading className="text-3xl text-amber-600 animate-spin" />{" "}
          </div>
        )}
      </div>
    </>
  );
}

export default SectionCard;
