import { useState } from "react";
import Card from "../component/card";

import { FaBlog } from "react-icons/fa";
import { FaBriefcase } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import SectionCard from "../component/sectioncard";

const DashBoard = () => {
  const [content, setContent] = useState([
    {
      logo: <FaBlog className="text-2xl text-blue-600" />,
      logostyle:
        "flex items-center justify-center bg-blue-100 size-15 rounded-2xl ",
      total: 24,
      description: "Blog Posts",
    },
    {
      logo: <FaBriefcase className="text-2xl text-green-600" />,
      logostyle:
        "flex items-center justify-center bg-green-100 size-15 rounded-2xl ",
      total: 24,
      description: "Portfolio Items",
    },
    {
      logo: <FaUsers className="text-2xl text-amber-600" />,
      logostyle:
        "flex items-center justify-center bg-amber-100 size-15 rounded-2xl ",
      total: 24,
      description: "Users",
    },
    {
      logo: <FaEye className="text-2xl text-red-600" />,
      logostyle:
        "flex items-center justify-center bg-red-100 size-15 rounded-2xl ",
      total: 24,
      description: "Monthly Views",
    },
  ]);
  const dummyData = [
    {
      Title: "Example Title 1",
      Author: "Author A",
      Categories: "Category 1, Category 2",
      Date: "2025-01-10",
      Status: "Published",
    },
    {
      Title: "Example Title 2",
      Author: "Author B",
      Categories: "Category 3",
      Date: "2025-02-04",
      Status: "Draft",
    },
    {
      Title: "Example Title 3",
      Author: "Author C",
      Categories: "Category 1",
      Date: "2025-03-20",
      Status: "Draft",
    },
  ];

  return (
    <>
      <div className=" bg-light rounded-2xl min-h-50 shadow-2xl p-6 ">
        <p className="text-4xl font-bold mb-4 "> Dashboard</p>
        <div className="flex flex-wrap gap-4   justify-center-safe">
          {content.map((item) => (
            <Card
              logo={item.logo}
              logostyle={item.logostyle}
              containerstyle={
                "flex gap-4 h-35 w-57 items-center transition  duration-500 ease-in-out hover:-translate-y-1 hover:shadow-2xl bg-white p-6 rounded-2xl mb-2"
              }
              total={item.total}
              description={item.description}
            />
          ))}
        </div>
        <div>
          <SectionCard
            name={"Recents Blog Posts"}
            button={" Add New Post"}
            thead={dummyData[0]}
            tbody={dummyData}
          />
        </div>
      </div>
    </>
  );
};

export default DashBoard;
