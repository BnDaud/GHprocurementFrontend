import { Field, inputClass, textareaClass } from "./ui";

// keep in step with MetaData.CURRENCIES in the API
const CURRENCIES = [
  ["USD", "US dollar ($)"],
  ["NGN", "Nigerian naira (₦)"],
  ["GBP", "British pound (£)"],
  ["EUR", "Euro (€)"],
  ["CNY", "Chinese yuan (¥)"],
  ["GHS", "Ghanaian cedi (GH₵)"],
  ["ZAR", "South African rand (R)"],
  ["AED", "UAE dirham (AED)"],
];

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
        <Field label="Yrs of Exp" htmlFor="meta-experience">
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
      <p className="-mt-2 text-xs text-muted">
        Yrs of Exp goes up by one on 1 January by itself. Type a new number any time to reset it.
      </p>
      <Field
        label="Price currency"
        htmlFor="meta-currency"
        hint="Product prices on the public website are shown in this currency. Change it here if you price in something else."
      >
        <select
          id="meta-currency"
          className={inputClass}
          value={meta.currency ?? "USD"}
          onChange={(e) => updateMeta("currency", e.target.value)}
        >
          {CURRENCIES.map(([code, label]) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}

export default Metadata;
