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
  return (
    <div className={containerstyle}>
      {total ? (
        <div className={logostyle}> {logo}</div>
      ) : (
        <img src={logo} alt="" className={logostyle} />
      )}
      <div>
        <div className="text-3xl font-bold"> {total || topic}</div>
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
        <p>{year}</p>
      </div>
    </div>
  );
}

export default Card;
