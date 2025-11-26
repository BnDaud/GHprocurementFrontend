import React from "react";

function Card({
  total,
  logo,
  description,
  containerstyle,
  logostyle,
  topic,
  category,
  year,
}) {
  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const options = { day: "2-digit", month: "short" }; // "23 Oct"
    return date.toLocaleDateString("en-US", options);
  }

  return (
    <div className={containerstyle}>
      {!topic ? (
        <div className={logostyle}> {logo}</div>
      ) : (
        <img src={logo.url} alt="" className={logostyle} />
      )}
      <div>
        <div className="text-3xl font-bold"> {topic || total}</div>
        <div className="text-gray text-wrap mt-1">{description}</div>
      </div>
      <div
        className={`${
          total
            ? "hidden"
            : "absolute bottom-1 flex justify-between w-11/12 text-gray/60 "
        }`}
      >
        <p> {category}</p>
        <p>{formatDate(year)}</p>
      </div>
    </div>
  );
}

export default Card;
