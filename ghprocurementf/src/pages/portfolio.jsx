import React from "react";
import Card from "../component/card";

function Portfolio() {
  const containerstyle =
    "relative w-70 bg-white h-120 rounded-lg space-y-2 p-3 transition-all hover:-translate-y-1 duration-800 hover:shadow-2xl ease-in-out";
  const dummyDate = [
    {
      topic: "TechSolutions Website",
      containerstyle: containerstyle,
      logostyle: "rounded-lg w-full h-60 object-cover",
      description:
        "Complete website redesign and digital marketing strategy for a tech startup.",
      category: "Web Design",
      year: "Oct 2023",
      logo: "https://img.freepik.com/premium-psd/simple-lake-16-bit-pixel-with-waves-reflections-geom-y2k-shape-neon-color-art-collections_1142283-95680.jpg?semt=ais_incoming&w=740&q=80",
    },
    {
      topic: "GreenLeaf App",
      containerstyle: containerstyle,
      logostyle: "rounded-lg w-full h-60 object-cover",
      description:
        "Mobile app development and UI/UX design for a sustainable living platform.",
      category: "App Design",
      year: "Jan 2024",
      logo: "https://img.freepik.com/free-vector/green-leaf-logo-design_53876-113488.jpg?w=740&t=st=1700292467~exp=1700293067~hmac=ce9d246c6d3cf1d9de2c21e42de3c67a29003c165f2ed2c2f27c5d1267f42a73",
    },
    {
      topic: "CryptoVault Dashboard",
      containerstyle: containerstyle,
      logostyle: "rounded-lg w-full h-60 object-cover",
      description:
        "Dashboard interface for cryptocurrency portfolio tracking with real-time analytics.",
      category: "Web App",
      year: "Mar 2024",
      logo: "https://img.freepik.com/free-vector/cryptocurrency-dashboard-illustration_23-2148897898.jpg?w=740&t=st=1700292502~exp=1700293102~hmac=b7fa18e8f08c23f3b77c3e9fa7c6c7e07f89a464c7c1b5a5a7a1238fbc60d49c",
    },
    {
      topic: "PixelArt Portfolio",
      containerstyle: containerstyle,
      logostyle: "rounded-lg w-full h-60 object-cover",
      description:
        "Portfolio showcase for a digital artist with pixel-art creations.",
      category: "Portfolio",
      year: "Jun 2023",
      logo: "https://img.freepik.com/free-vector/pixel-art-background_52683-43949.jpg?w=740&t=st=1700292541~exp=1700293141~hmac=2f81e7e5b5e7a5f1b6bb1b0b1c7c09b0d8421fa57b6f8a1e7f2df9aaf1b48d1d",
    },
  ];

  return (
    <div className=" bg-light rounded-2xl min-h-50 shadow-2xl p-6 ">
      <div className="flex flex-wrap justify-between gap-6 mt-2 mb-5 border-b pb-5 border-gray/30">
        {" "}
        <p className="text-3xl font-bold">Portfolio</p>{" "}
        <div className="bg-blue-700 text-white p-2 rounded hover:cursor-pointer transition duration-500 ease-in-out hover:-translate-y-1  hover:shadow-2xl">
          Add New Item
        </div>
      </div>
      <div className="flex flex-wrap gap-4   justify-center">
        {dummyDate.map((data, idx) => (
          <Card key={idx} {...data} />
        ))}
      </div>
    </div>
  );
}

export default Portfolio;
