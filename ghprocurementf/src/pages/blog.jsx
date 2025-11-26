import { useContext, useState } from "react";
import SectionCard from "../component/sectioncard";
import { globalContext } from "../App";
import API from "../endpoints/endpoints";
const Blog = () => {
  const { allblogs, setAllBlogs } = useContext(globalContext);

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
    <>
      <div className=" bg-light rounded-2xl min-h-50 shadow-2xl p-6 ">
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
    </>
  );
};

export default Blog;
