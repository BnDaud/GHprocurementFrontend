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
      <Field
        label="WhatsApp number"
        htmlFor="contact-whatsapp"
        hint="The chat buttons on the website open this number. Leave empty to use the phone number above."
      >
        <input
          id="contact-whatsapp"
          className={inputClass}
          value={meta.whatsapp_number ?? ""}
          placeholder="+234 000 000 0000"
          onChange={(e) => updateMeta("whatsapp_number", e.target.value)}
        />
      </Field>
      <Field label="Office address" htmlFor="contact-office">
        <input
          id="contact-office"
          className={inputClass}
          value={meta.office ?? ""}
          placeholder="No. 1, Street, City"
          onChange={(e) => updateMeta("office", e.target.value)}
        />
      </Field>
      <Field
        label="How-to video for the website"
        htmlFor="contact-site-video"
        hint="A YouTube link. When filled, a &quot;How to use this site&quot; link appears on the public website and opens the video. Leave empty to hide it."
      >
        <input
          id="contact-site-video"
          type="url"
          className={inputClass}
          value={meta.site_video_url ?? ""}
          placeholder="https://www.youtube.com/watch?v=..."
          onChange={(e) => updateMeta("site_video_url", e.target.value)}
        />
      </Field>
      <Field
        label="How-to video for this CMS"
        htmlFor="contact-cms-video"
        hint="A YouTube link. Only people signed in here see it: a &quot;How to use the CMS&quot; button in the side menu opens it."
      >
        <input
          id="contact-cms-video"
          type="url"
          className={inputClass}
          value={meta.cms_video_url ?? ""}
          placeholder="https://www.youtube.com/watch?v=..."
          onChange={(e) => updateMeta("cms_video_url", e.target.value)}
        />
      </Field>
    </div>
  );
}

export default Contact;
