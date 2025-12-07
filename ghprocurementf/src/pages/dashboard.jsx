import { useContext, useEffect, useState } from "react";
import Card from "../component/card";
import SectionCard from "../component/sectioncard";

import { AiOutlineLoading } from "react-icons/ai";
import {
  FaBlog,
  FaBriefcase,
  FaUsers,
  FaEye,
  FaQuestionCircle,
} from "react-icons/fa";

import useFetch from "../hooks/usefetch";
import API from "../endpoints/endpoints";
import { globalContext } from "../App";

const DashBoard = () => {
  const { total, setTotals, allblogs, setAllBlogs } = useContext(globalContext);
  // Fetch totals
  const {
    data: totalData,
    loading: totalLoading,
    err: totalErr,
    doFetch: fetchTotal,
  } = useFetch();

  // Fetch blogs
  const {
    data: blogs,
    loading: blogsLoading,
    err: blogsErr,
    doFetch: fetchBlogs,
  } = useFetch();

  // Trigger fetches on component mount
  useEffect(() => {
    fetchTotal({ url: API.gettotal(), method: "GET" });
    fetchBlogs({ url: API.blogs(), method: "GET" });
  }, []);

  const isLoading = totalLoading || blogsLoading;

  const loadingIcon = <AiOutlineLoading className="text-purple animate-spin" />;

  const [card, setCard] = useState([
    {
      name: "TotalBlogs",
      logo: <FaBlog className="text-2xl text-purple" />,
      logostyle:
        "flex items-center justify-center bg-purple/10 size-15 rounded-2xl ",
      total: 0,
      description: "Blog Posts",
    },
    {
      name: "TotalServices",
      logo: <FaBriefcase className="text-2xl text-green-600" />,
      logostyle:
        "flex items-center justify-center bg-green-100 size-15 rounded-2xl ",
      total: 0,
      description: "Services",
    },
    {
      name: "TotalUsers",
      logo: <FaUsers className="text-2xl text-amber-600" />,
      logostyle:
        "flex items-center justify-center bg-amber-100 size-15 rounded-2xl ",
      total: 0,
      description: "Users",
    },
    {
      name: "TotalFaq",
      logo: <FaQuestionCircle className="text-2xl text-red-600" />,
      logostyle:
        "flex items-center justify-center bg-red-100 size-15 rounded-2xl ",
      total: 0, // static for now
      description: "FAQs",
    },
  ]);

  // Update totals when data changes
  useEffect(() => {
    if (totalData) {
      setTotals(totalData); // update totals

      const newTotal = { ...totalData }; // use the latest totals
      setCard((prev) =>
        prev.map((p) => ({
          ...p,
          total: newTotal[p.name] ?? p.total, // use newTotal instead of stale total
        }))
      );
    }
  }, [totalData]);

  useEffect(() => {
    setTotals(total);
    console.log(total);
    const newTotal = { ...total }; // use the latest totals
    setCard((prev) =>
      prev.map((p) => ({
        ...p,
        total: newTotal[p.name] ?? p.total, // use newTotal instead of stale total
      }))
    );
  }, [total]);

  // Set dummy blog data

  useEffect(() => {
    if (blogs) setAllBlogs(blogs);
  }, [blogs]);

  // Form field styles and options
  const [blogData, setBlogData] = useState({
    title: "",
    author: "",
    content: "",
    excerpt: "",
    featured_image: null,
    category: "",
    status: "",
    views_count: 0,
  });

  const updateBlogData = (arg, newdata) =>
    setBlogData((prev) => ({ ...prev, [arg]: newdata }));

  const inputStyle =
    "bg-purple/20 px-3 py-2  rounded w-full focus:outline-none focus:ring-2 focus:ring-purple/50";

  const categories = ["FURNITURE", "ELECTRONICS"];
  const statusOptions = ["Draft", "Published"];

  const fields = [
    <div className="w-full">
      <label className="font-semibold mb-1 block">Title</label>
      <input
        placeholder="Title"
        className={inputStyle}
        required
        value={blogData.title}
        onChange={(e) => updateBlogData("title", e.target.value)}
      />
    </div>,

    <div className="w-full">
      <label className="font-semibold mb-1 block">Author</label>
      <input
        placeholder="Author"
        className={inputStyle}
        required
        value={blogData.author}
        onChange={(e) => updateBlogData("author", e.target.value)}
      />
    </div>,

    <div className="w-full">
      <label className="font-semibold mb-1 block">Content</label>
      <textarea
        placeholder="Content"
        className={`${inputStyle} h-24`}
        required
        value={blogData.content}
        onChange={(e) => updateBlogData("content", e.target.value)}
      />
    </div>,

    <div className="w-full">
      <label className="font-semibold mb-1 block">Excerpt</label>
      <textarea
        placeholder="Excerpt"
        className={`${inputStyle} h-16`}
        required
        value={blogData.excerpt}
        onChange={(e) => updateBlogData("excerpt", e.target.value)}
      />
    </div>,

    <div className="w-full">
      <label className="font-semibold mb-1 block">Image</label>
      <input
        type="file"
        accept="image/*"
        className={inputStyle}
        required
        onChange={(e) => updateBlogData("featured_image", e.target.files[0])}
      />
    </div>,

    <div className="w-full">
      <label className="font-semibold mb-1 block">Category</label>
      <select
        className={inputStyle}
        required
        value={blogData.category}
        onChange={(e) => updateBlogData("category", e.target.value)}
      >
        <option value="" disabled>
          Select Category
        </option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>,

    <div className="w-full">
      <label className="font-semibold mb-1 block">Status</label>
      <select
        className={inputStyle}
        required
        value={blogData.status}
        onChange={(e) => updateBlogData("status", e.target.value)}
      >
        <option value="" disabled>
          Select Status
        </option>
        {statusOptions.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>,
  ];

  return (
    <div className="bg-light rounded-2xl min-h-50 shadow-2xl p-6">
      <p className="text-4xl font-bold mb-4 text-purple ">Dashboard</p>

      <div className="flex flex-wrap gap-4 justify-center-safe">
        {card.map((item) => (
          <Card
            key={item.name}
            logo={item.logo}
            logostyle={item.logostyle}
            containerstyle="flex gap-4 h-35 w-57 items-center transition duration-500 ease-in-out hover:-translate-y-1 hover:shadow-2xl bg-white p-6 rounded-2xl mb-2"
            total={isLoading ? loadingIcon : item.total}
            description={item.description}
          />
        ))}
      </div>

      <div>
        <SectionCard
          name="Recent Blog Posts"
          button="Add New Blog"
          thead={{
            title: "",
            author: "",
            excerpt: "",
            category: "",
            status: "",
            views_count: "",
          }}
          tbody={allblogs}
          fields={fields}
          payload={blogData}
          url={API.blogs}
          updatepayload={setBlogData}
          updatedata={setAllBlogs}
          incrementkey={"TotalBlogs"}
        />
      </div>
    </div>
  );
};

export default DashBoard;
