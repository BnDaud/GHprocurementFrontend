import { useRef, useState } from "react";
import Sidenav from "./component/sidenav";
import DashBoard from "./pages/dashboard";
import Blog from "./pages/blog";
import Settings from "./pages/settings";
import User from "./pages/user";
import Portfolio from "./pages/portfolio";
import useFetch from "./hooks/usefetch";

function App() {
  const homeRef = useRef(null); //Dashboard
  const blogRef = useRef(null);
  const portfolioRef = useRef(null);
  const userRef = useRef(null);
  const settingRef = useRef(null);
  useFetch({ url: "https://novyra.onrender.com/api/blogs/" });
  const sectionref = {
    1: homeRef,
    2: blogRef,
    3: portfolioRef,
    4: userRef,
    5: settingRef,
  };

  const onPagechange = (id) => {
    sectionref[id]?.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <div className="flex h-screen">
        <div className="md:w-62 w-20 ">
          {" "}
          <Sidenav onPagechange={onPagechange} />
        </div>
        <div className="flex-1 overflow-y-auto bg-bgcolor p-6 space-y-5">
          <section ref={homeRef}>
            <DashBoard />{" "}
          </section>
          <section ref={blogRef}>
            {" "}
            <Blog />
          </section>
          <section ref={portfolioRef}>
            <Portfolio />
          </section>
          <section ref={userRef}>
            {" "}
            <User />{" "}
          </section>
          <section ref={settingRef}>
            <Settings />{" "}
          </section>
        </div>
      </div>
    </>
  );
}

export default App;
