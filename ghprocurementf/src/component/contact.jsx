import { Field, inputClass } from "./ui";

function Contact({ meta, updateMeta }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Email" htmlFor="contact-email">
          <input
            id="contact-email"
            type="email"
            className={inputClass}
            value={meta.email ?? ""}
            placeholder="name@email.com"
            onChange={(e) => updateMeta("email", e.target.value)}
          />
        </Field>
        <Field label="Phone" htmlFor="contact-phone">
          <input
            id="contact-phone"
            className={inputClass}
            value={meta.phone ?? ""}
            placeholder="+234 000 000 0000"
            onChange={(e) => updateMeta("phone", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Office address" htmlFor="contact-office">
        <input
          id="contact-office"
          className={inputClass}
          value={meta.office ?? ""}
          placeholder="No. 1, Street, City"
          onChange={(e) => updateMeta("office", e.target.value)}
        />
      </Field>
    </div>
  );
}

export default Contact;
