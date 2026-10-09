import { useContext, useState, useEffect } from "react";
import SectionCard from "../component/sectioncard";
import { Field, inputClass, textareaClass } from "../component/ui";
import { globalContext } from "../App";
import API from "../endpoints/endpoints";
import useFetch from "../hooks/usefetch";
import useOpenNew from "../hooks/useopennew";

const Faqs = () => {
  const { allfaqs, setAllFaqs } = useContext(globalContext);
  const openNew = useOpenNew();

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

  const fields = [
    <Field full label="Question" htmlFor="faq-question">
      <input
        id="faq-question"
        placeholder="How long does shipping take?"
        className={inputClass}
        required
        value={faqsData.question}
        onChange={(e) => updateFaqsData("question", e.target.value)}
      />
    </Field>,

    <Field full label="Answer" htmlFor="faq-answer">
      <textarea
        id="faq-answer"
        placeholder="Shipping takes about 3 weeks..."
        className={`${textareaClass} h-32`}
        required
        value={faqsData.answer}
        onChange={(e) => updateFaqsData("answer", e.target.value)}
      />
    </Field>,
  ];

  return (
    <SectionCard
      name="FAQs"
      singular="FAQ"
      subtitle="Questions customers ask most."
      button="Add FAQ"
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
      incrementkey={"TotalFaq"}
      loading={loading || (data === null && !err)}
      error={!!err}
      initialAddOpen={openNew}
    />
  );
};

export default Faqs;
