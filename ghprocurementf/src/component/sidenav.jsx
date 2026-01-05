import { useState } from "react";
import { AiFillDashboard } from "react-icons/ai";
import { FaBlog } from "react-icons/fa";
import { FaBriefcase } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { FaQuestionCircle } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import Logo from "./../images/Logo.png";

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
      name: "Services",
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
      name: "FAQs ",
      logo: <FaQuestionCircle className={classes} />,
      active: true,
    },
    {
      id: 6,
      name: "Mail",
      logo: <IoMdMail className={classes} />,
      active: false,
    },
    {
      id: 7,
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
      <div className="flex flex-col h-screen bg-sidenav/70 md:w-62 w-20 pt-2">
        <div className="flex justify-center items-center h-15 py-5 px-1 text-center  border-b-2 text-purple">
          {" "}
          <img
            src={Logo}
            className="md:w-40 md:h-40 size-20  object-contain  "
          />
        </div>
        <div className="mt-3 space-y-2">
          {activescroll.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                changeactivescroll(item.id);
                onPagechange(item.id);
              }}
              className={`flex hover:text-purple text-black/40 hover:bg-gray/30 h-10 
         
              ${
                item.active
                  ? "border-purple border-l-[3px] font-semibold"
                  : "border-l-0"
              }`}
            >
              <div className="flex md:mx-10 mx-auto items-center gap-4">
                <div className={`${item.active ? "text-purple" : ""}`}>
                  {" "}
                  {item.logo}
                </div>
                <p
                  className={`hidden md:block ${
                    item.active ? "text-purple" : ""
                  }  `}
                >
                  {item.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidenav;
