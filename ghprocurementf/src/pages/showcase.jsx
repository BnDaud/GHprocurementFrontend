import { useEffect, useState } from "react";
import { LuImage, LuQuote } from "react-icons/lu";
import SectionCard from "../component/sectioncard";
import ImagePicker from "../component/imagepicker";
import { Field, StatusChip, inputClass, textareaClass } from "../component/ui";
import API from "../endpoints/endpoints";
import useFetch from "../hooks/usefetch";
import useOpenNew from "../hooks/useopennew";
import { secureUrl } from "./catalog";

const KINDS = [
  ["delivery", "Delivered order (photo)"],
  ["testimonial", "Customer testimonial"],
];

// Proof for the home page: photos of delivered orders and what customers said. Real entries only.
const Showcase = () => {
  const openNew = useOpenNew();
  const [all, setAll] = useState([]);
  const { data, loading, err, doFetch } = useFetch();

  useEffect(() => {
    doFetch({ url: API.showcase(), method: "GET" });
  }, []);
  useEffect(() => {
    if (data) setAll(data);
  }, [data]);

  const [item, setItem] = useState({
    kind: "delivery",
    title: "",
    quote: "",
    person: "",
    company: "",
    image: null,
    published: true,
  });
  const update = (key, value) => setItem((prev) => ({ ...prev, [key]: value }));
  const testimonial = item.kind === "testimonial";

  const fields = [
    <Field label="Type" htmlFor="show-kind">
      <select id="show-kind" className={inputClass} value={item.kind} onChange={(e) => update("kind", e.target.value)}>
        {KINDS.map(([v, label]) => (
          <option key={v} value={v}>{label}</option>
        ))}
      </select>
    </Field>,

    <Field label={testimonial ? "Headline (optional)" : "Caption"} htmlFor="show-title" hint={testimonial ? "A few words, such as the product or the result." : "For example: 500 power banks delivered to Lagos."}>
      <input id="show-title" className={inputClass} maxLength={120} value={item.title} onChange={(e) => update("title", e.target.value)} />
    </Field>,

    <Field full label={testimonial ? "What the customer said" : "Quote (optional)"} htmlFor="show-quote" hint="Use only words the customer agreed to share.">
      <textarea id="show-quote" className={`${textareaClass} h-28`} maxLength={600} required={testimonial} value={item.quote} onChange={(e) => update("quote", e.target.value)} />
    </Field>,

    <Field label="Customer name (optional)" htmlFor="show-person">
      <input id="show-person" className={inputClass} maxLength={120} value={item.person} onChange={(e) => update("person", e.target.value)} />
    </Field>,

    <Field label="Company (optional)" htmlFor="show-company">
      <input id="show-company" className={inputClass} maxLength={120} value={item.company} onChange={(e) => update("company", e.target.value)} />
    </Field>,

    <Field label={testimonial ? "Photo (optional)" : "Photo (required)"} htmlFor="show-image" hint="It is shrunk automatically before it is saved.">
      <ImagePicker id="show-image" value={item.image} onChange={(file) => update("image", file)} />
    </Field>,

    <Field label="On the website" htmlFor="show-published">
      <label className="flex min-h-11 items-center gap-3 text-sm font-semibold">
        <input id="show-published" type="checkbox" className="size-5 accent-purple" checked={!!item.published} onChange={(e) => update("published", e.target.checked)} />
        Show on the home page
      </label>
    </Field>,
  ];

  const formatters = {
    title: (v, row) => {
      const img = secureUrl(row.image_url);
      return (
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-10 shrink-0 rounded-lg bg-lilac overflow-hidden flex items-center justify-center text-purple">
            {img ? <img src={img} alt="" loading="lazy" className="size-full object-cover" /> : row.kind === "testimonial" ? <LuQuote /> : <LuImage />}
          </div>
          <span className="truncate font-bold" title={v || row.quote}>{v || row.person || (row.quote || "").slice(0, 50)}</span>
        </div>
      );
    },
    kind: (v) => KINDS.find(([k]) => k === v)?.[1] ?? v,
    published: (v) => <StatusChip value={v ? "published" : "draft"} />,
  };

  return (
    <SectionCard
      name="Showcase"
      singular="item"
      subtitle="Photos of delivered orders and customer testimonials, shown on the home page. The section stays hidden until you publish one."
      button="Add entry"
      thead={{ title: "Entry", kind: "Type", person: "Customer", published: "Status" }}
      tbody={all}
      fields={fields}
      payload={item}
      url={API.showcase}
      updatepayload={setItem}
      updatedata={setAll}
      incrementkey={"TotalShowcase"}
      loading={loading || (data === null && !err)}
      error={!!err}
      initialAddOpen={openNew}
      formatters={formatters}
      editMethod="PATCH"
    />
  );
};

export default Showcase;
