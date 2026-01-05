import React, { useEffect, useRef, useState } from "react";
import useFetch from "../hooks/usefetch";
import API from "../endpoints/endpoints";
import { AiOutlineLoading } from "react-icons/ai";

function Mail() {
  const [email, setEmail] = useState({
    subject: "",
    recipient: "",
    body: "",
    title: "",
  });
  const [submit, setSubmit] = useState(false);
  const { data, success, loading, doFetch } = useFetch();
  const inputstyle =
    "bg-white/70 px-3 py-2  rounded w-full focus:outline-none focus:ring-2 focus:ring-purple/50";

  const updateEmail = (key, new_value) => {
    setEmail((prev) => ({ ...prev, [key]: new_value }));
  };

  const handlesubmit = (e) => {
    e.preventDefault();
    if (email.body.length === 0) alert("fill the body");
    else if (email.recipient.length === 0) alert("Input the reciever email ");
    else if (email.subject.length === 0) alert("Fill in the Subject");
    else {
      console.log(email);
      setSubmit(!submit);
    }
  };

  useEffect(() => {
    if (submit) {
      console.log("from useEffect", email);
      doFetch({ url: API.emails(), method: "POST", body: email });
    }
  }, [submit]);

  return (
    <div className=" bg-purple rounded-2xl min-h-50 shadow-2xl p-6 space-y-6 ">
      <p className="text-3xl font-bold text-sidenav">Email</p>
      <form>
        {" "}
        <div className="space-y-2 ">
          <p className="font-semibold text-lg text-white"> Subject</p>
          <input
            className={inputstyle}
            value={email.subject}
            required
            placeholder="What’s this email about ?"
            onChange={(e) => updateEmail("subject", e.target.value)}
          />
        </div>
        <div className="space-y-2 ">
          <p className="font-semibold text-lg text-white"> Title </p>
          <input
            className={inputstyle}
            value={email.title}
            placeholder="Topic of discussion"
            onChange={(e) => updateEmail("title", e.target.value)}
          />
        </div>
        <div className="space-y-2 ">
          <p className="font-semibold text-lg text-white"> Body</p>
          <textarea
            required
            className={`${inputstyle} h-50`}
            value={email.body}
            placeholder="Hello from gh procurement ............"
            onChange={(e) => updateEmail("body", e.target.value)}
          />
        </div>{" "}
        <div className="space-y-2 ">
          <p className="font-semibold text-lg text-white"> Recipient</p>
          <input
            type="email"
            className={inputstyle}
            value={email.recipient}
            placeholder="@email.com"
            required
            onChange={(e) => updateEmail("recipient", e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            onClick={handlesubmit}
            className={`flex items-center justify-center text-lg font-bold w-40 h-10 mt-5 p-2 rounded transition duration-500 ease-in-out bg-sidenav
      ${
        loading
          ? "cursor-not-allowed opacity-70"
          : "hover:shadow-2xl hover:-translate-y-1"
      }
      text-purple`}
          >
            {loading ? (
              <AiOutlineLoading className="animate-spin text-2xl" />
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Mail;
