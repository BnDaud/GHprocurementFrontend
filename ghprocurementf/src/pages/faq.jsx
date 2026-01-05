import { useContext, useState, useEffect } from "react";
import SectionCard from "../component/sectioncard";
import { globalContext } from "../App";
import API from "../endpoints/endpoints";
import useFetch from "../hooks/usefetch";

const Faqs = () => {
  const { allfaqs, setAllFaqs } = useContext(globalContext);

  const url = API.faq();
  const { data, loading, err, doFetch } = useFetch();

  useEffect(() => {
    doFetch({
      url: url,
      method: "GET",
    });
  }, []);

  useEffect(() => {
    if (data) setAllFaqs(data);
  }, [data]);

  // Form field styles and options
  const [faqsData, setFaqsData] = useState({
    question: "",
    answer: "",
  });

  const updateFaqsData = (arg, newdata) =>
    setFaqsData((prev) => ({ ...prev, [arg]: newdata }));

  const inputStyle =
    "bg-purple/20 px-3 py-2  rounded w-full focus:outline-none focus:ring-2 focus:ring-purple/50";

  const fields = [
    <div className="w-full">
      <label className="font-semibold mb-1 block">Question</label>
      <input
        placeholder="how long does  ....?"
        className={inputStyle}
        required
        value={faqsData.question}
        onChange={(e) => updateFaqsData("question", e.target.value)}
      />
    </div>,

    <div className="w-full">
      <label className="font-semibold mb-1 block">Answer</label>
      <textarea
        placeholder="3 months of  ..... "
        className={`${inputStyle} h-24`}
        required
        value={faqsData.answer}
        onChange={(e) => updateFaqsData("answer", e.target.value)}
      />
    </div>,
  ];

  return (
    <>
      <div className=" bg-light rounded-2xl min-h-50 shadow-2xl p-6 ">
        <div>
          <SectionCard
            name="FAQs"
            button="Add FAQs"
            thead={{
              question: "",
              answer: "",
            }}
            tbody={allfaqs}
            fields={fields}
            payload={faqsData}
            url={API.faq}
            updatepayload={setFaqsData}
            updatedata={setAllFaqs}
            incrementkey={"Totalfaq"}
          />
        </div>
      </div>
    </>
  );
};

export default Faqs;
