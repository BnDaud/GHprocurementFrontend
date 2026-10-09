import React, { useContext, useEffect, useState } from "react";
import Metadata from "../component/metadata";
import Contact from "../component/contact";
import SecurityCard from "../component/securitycard";
import TwoStepCard from "../component/twostepcard";
import AdminsCard from "../component/adminscard";
import useFetch from "../hooks/usefetch";
import API from "../endpoints/endpoints";
import { globalContext } from "../App";
import {
  PageHeader,
  Spinner,
  ErrorBanner,
  btnPrimary,
  btnSecondary,
} from "../component/ui";

const Section = ({ id, title, description, children }) => (
  <section
    aria-labelledby={id}
    className="rounded-2xl border border-line bg-white p-5 md:p-6 flex flex-col gap-5"
  >
    <div>
      <h2 id={id} className="text-lg font-extrabold">
        {title}
      </h2>
      <p className="mt-1 text-[13px] text-muted">{description}</p>
    </div>
    {children}
  </section>
);

function Settings() {
  const { meta, setMeta } = useContext(globalContext);
  const [oldmeta, setOldmeta] = useState(meta);
  const url = API.metadata;

  const { data, err, loading, doFetch } = useFetch();
  const [saved, setSaved] = useState(false);

  const dirty = JSON.stringify(oldmeta) !== JSON.stringify(meta);

  const updateMeta = (name, newvalue) => {
    setSaved(false);
    setMeta((prev) => ({ ...prev, [name]: newvalue }));
  };

  const handlepost = (e) => {
    e?.preventDefault();
    if (dirty) doFetch({ url: url(1), method: "PUT", body: meta });
  };

  const discard = () => {
    setMeta(oldmeta);
    setSaved(false);
  };

  useEffect(() => {
    doFetch({
      url: url(1),
      method: "GET",
    });
  }, []);

  // both the first load and a successful save return the current metadata
  const [lastMethodWasSave, setLastMethodWasSave] = useState(false);
  useEffect(() => {
    if (data) {
      setMeta(data);
      setOldmeta(data);
      if (lastMethodWasSave) setSaved(true);
    }
  }, [data]);

  const save = (e) => {
    setLastMethodWasSave(true);
    handlepost(e);
  };

  return (
    <div className="space-y-6 pb-24">
    <form id="settings-form" onSubmit={save} noValidate className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Homepage details and contact information."
      />

      {err && (
        <ErrorBanner>
          Something went wrong talking to the server. Your changes are still
          here; try again.
        </ErrorBanner>
      )}

      <div className="flex flex-wrap items-start gap-5">
        <div className="flex-[1_1_420px] min-w-0">
          <Section
            id="s-home"
            title="Homepage"
            description="Intro text and the numbers shown on the public site."
          >
            <Metadata meta={meta} updateMeta={updateMeta} />
          </Section>
        </div>
        <div className="flex-[1_1_420px] min-w-0">
          <Section
            id="s-contact"
            title="Contact"
            description="How customers reach you."
          >
            <Contact meta={meta} updateMeta={updateMeta} />
          </Section>
        </div>
      </div>

    </form>

    <AdminsCard />

    <SecurityCard />

    <TwoStepCard />

      <div className="sticky -bottom-4 md:-bottom-8 -mx-4 md:-mx-10 -mb-4 md:-mb-8 px-4 md:px-10 py-3.5 bg-white border-t border-line flex flex-wrap items-center justify-between gap-3">
        <div
          role="status"
          className={`flex items-center gap-2.5 text-sm font-semibold ${
            dirty ? "text-[#7a4b00]" : "text-muted"
          }`}
        >
          <span
            className={`size-2 rounded-full ${
              dirty ? "bg-[#b77a00]" : "bg-[#12633a]"
            }`}
          />
          {dirty
            ? "You have unsaved changes"
            : saved
            ? "Saved"
            : "All changes saved"}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={discard}
            disabled={!dirty || loading}
            className={`${btnSecondary} disabled:opacity-50`}
          >
            Discard
          </button>
          <button
            type="submit"
            form="settings-form"
            disabled={!dirty || loading}
            className={btnPrimary}
          >
            {loading ? (
              <>
                <Spinner className="text-peach" /> Saving...
              </>
            ) : (
              "Save changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
