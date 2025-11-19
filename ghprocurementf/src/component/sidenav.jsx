import { useState } from "react";
import { AiFillDashboard } from "react-icons/ai";
import { FaBlog } from "react-icons/fa";
import { FaBriefcase } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import Logo from "../images/Logo.png";

const Sidenav = ({ onPagechange }) => {
  const classes = "  text-xl";
  const navcontent = [
    {
      id: 1,
      name: "DashBoard ",
      logo: <AiFillDashboard className={classes} />,
      active: true,
    },
    {
      id: 2,
      name: "Blog",
      logo: <FaBlog className={classes} />,
      active: false,
    },
    {
      id: 3,
      name: "Portfolio",
      logo: <FaBriefcase className={classes} />,
      active: false,
    },
    {
      id: 4,
      name: "User",
      logo: <FaUsers className={classes} />,
      active: false,
    },
    {
      id: 5,
      name: "Settings",
      logo: <IoMdSettings className={classes} />,
      active: false,
    },
  ];

  const [activescroll, setActivescroll] = useState(navcontent);

  const changeactivescroll = (id) => {
    setActivescroll((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, active: true } : { ...p, active: false }
      )
    );
  };

  return (
    <>
      <div className="flex flex-col h-screen bg-darkblue md:w-62 w-20 ">
        <div className="py-5 px-2 text-center border border-darkblue border-b-gray text-white">
          <img src={Logo} className="h-9 w-40  object-cover " />
        </div>
        <div className="mt-3 space-y-2">
          {activescroll.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                changeactivescroll(item.id);
                onPagechange(item.id);
              }}
              className={`flex hover:text-white text-gray-300 hover:bg-gray/30 h-10 
         
              ${item.active ? "border-blue-600 border-l-[3px]" : "border-l-0"}`}
            >
              <div className="flex md:mx-10 mx-auto items-center gap-4">
                <div className={`${item.active ? "text-blue-600" : ""}`}>
                  {" "}
                  {item.logo}
                </div>
                <p className="hidden md:block">{item.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidenav;
