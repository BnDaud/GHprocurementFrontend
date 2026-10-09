import { Field, inputClass, textareaClass } from "./ui";

// Homepage content: intro text and the headline numbers shown on the public site
function Metadata({ meta, updateMeta }) {
  return (
    <div className="flex flex-col gap-5">
      <Field label="Introduction" htmlFor="meta-intro">
        <input
          id="meta-intro"
          className={inputClass}
          value={meta.metaIntro ?? ""}
          placeholder="Gh Procurement"
          onChange={(e) => updateMeta("metaIntro", e.target.value)}
        />
      </Field>
      <Field label="Description" htmlFor="meta-description">
        <textarea
          id="meta-description"
          className={`${textareaClass} h-28`}
          value={meta.metaDescription ?? ""}
          placeholder="About your business"
          onChange={(e) => updateMeta("metaDescription", e.target.value)}
        />
      </Field>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-4">
        <Field label="Orders completed" htmlFor="meta-orders">
          <input
            id="meta-orders"
            type="number"
            inputMode="numeric"
            className={inputClass}
            value={meta.ordersCompleted ?? ""}
            placeholder="1250"
            onChange={(e) => updateMeta("ordersCompleted", e.target.value)}
          />
        </Field>
        <Field label="Suppliers" htmlFor="meta-suppliers">
          <input
            id="meta-suppliers"
            type="number"
            inputMode="numeric"
            className={inputClass}
            value={meta.suppliers ?? ""}
            placeholder="400"
            onChange={(e) => updateMeta("suppliers", e.target.value)}
          />
        </Field>
        <Field label="Years of experience" htmlFor="meta-experience">
          <input
            id="meta-experience"
            type="number"
            inputMode="numeric"
            className={inputClass}
            value={meta.experience ?? ""}
            placeholder="3"
            onChange={(e) => updateMeta("experience", e.target.value)}
          />
        </Field>
      </div>
    </div>
  );
}

export default Metadata;
