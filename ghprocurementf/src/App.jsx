import { createContext, useEffect, useRef, useState } from "react";
import Sidenav from "./component/sidenav";
import DashBoard from "./pages/dashboard";
import Blog from "./pages/blog";
import Settings from "./pages/settings";
import User from "./pages/user";

import Services from "./pages/services";
import Faqs from "./pages/faq";
import Mail from "./pages/mail";

export const globalContext = createContext();

function App() {
  const homeRef = useRef(null); //Dashboard
  const blogRef = useRef(null);
  const servicesRef = useRef(null);
  const userRef = useRef(null);
  const settingRef = useRef(null);
  const faqsRef = useRef(null);
  const mailRef = useRef(null);
  //useFetch({ url: "https://novyra.onrender.com/api/blogs/?format=json" });
  //  useFetch({ url: "http://localhost:8000/api/gettotal?format=json" });
  //  useFetch({ url: API.portfolio() });
  const sectionref = {
    1: homeRef,
    2: blogRef,
    3: servicesRef,
    4: userRef,
    5: faqsRef,
    6: mailRef,
    7: settingRef,
  };

  const onPagechange = (id) => {
    sectionref[id]?.current.scrollIntoView({ behavior: "smooth" });
  };

  const [allblogs, setAllBlogs] = useState([]);
  const [allservices, setAllServices] = useState([]);
  const [total, setTotals] = useState({
    TotalBlogs: 0,
    TotalPortfolio: 0,
    TotalUsers: 0,
    TotalServices: 0,
    TotalFaq: 0,
  });
  const [allusers, setAllUsers] = useState([]);
  const [allfaqs, setAllFaqs] = useState([]);
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
          allfaqs,
          setAllFaqs,
          meta,
          setMeta,
          setAllServices,
          allservices,
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
            <section ref={servicesRef}>
              <Services />
            </section>
            <section ref={userRef}>
              {" "}
              <User />{" "}
            </section>
            <section ref={faqsRef}>
              <Faqs />
            </section>
            <section ref={mailRef}>
              <Mail />
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
