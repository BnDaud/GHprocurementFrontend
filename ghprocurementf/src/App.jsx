import { createContext, useEffect, useRef, useState } from "react";
import Sidenav from "./component/sidenav";
import DashBoard from "./pages/dashboard";
import Blog from "./pages/blog";
import Settings from "./pages/settings";
import User from "./pages/user";
import Portfolio from "./pages/portfolio";
import useFetch from "./hooks/usefetch";

export const globalContext = createContext();

function App() {
  const homeRef = useRef(null); //Dashboard
  const blogRef = useRef(null);
  const portfolioRef = useRef(null);
  const userRef = useRef(null);
  const settingRef = useRef(null);
  //useFetch({ url: "https://novyra.onrender.com/api/blogs/?format=json" });
  //  useFetch({ url: "http://localhost:8000/api/gettotal?format=json" });
  //  useFetch({ url: API.portfolio() });
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

  const [allblogs, setAllBlogs] = useState([]);
  const [total, setTotals] = useState({
    TotalBlogs: 0,
    TotalPortfolio: 0,
    TotalUsers: 0,
  });
  const [allusers, setAllUsers] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [meta, setMeta] = useState({});

  return (
    <>
      <globalContext.Provider
        value={{
          allblogs,
          setAllBlogs,
          total,
          setTotals,
          allusers,
          setAllUsers,
          portfolios,
          setPortfolios,
          meta,
          setMeta,
        }}
      >
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
      </globalContext.Provider>
    </>
  );
}

export default App;
