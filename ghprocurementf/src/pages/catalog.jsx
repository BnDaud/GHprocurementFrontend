import { useContext, useEffect, useState } from "react";
import { LuImage } from "react-icons/lu";
import SectionCard from "../component/sectioncard";
import ImagePicker from "../component/imagepicker";
import { Field, inputClass, textareaClass } from "../component/ui";
import { globalContext } from "../App";
import API from "../endpoints/endpoints";
import useFetch from "../hooks/usefetch";
import useOpenNew from "../hooks/useopennew";

export const categories = [
  { value: "OFFICE_AND_STATIONERY", label: "Office and Stationery" },
  { value: "IT_AND_ELECTRONICS", label: "IT and Electronics" },
  { value: "INDUSTRIAL_AND_MANUFACTURING", label: "Industrial and Manufacturing" },
  { value: "CONSTRUCTION_AND_BUILDING_MATERIALS", label: "Construction and Building Materials" },
  { value: "ELECTRICAL_AND_POWER", label: "Electrical and Power" },
  { value: "FURNITURE", label: "Furniture" },
  { value: "MEDICAL_AND_LABORATORY", label: "Medical and Laboratory" },
  { value: "FOOD_AND_CONSUMABLES", label: "Food and Consumables" },
];
export const categoryLabel = (v) =>
  categories.find((c) => c.value === v)?.label ?? v ?? "";

// Cloudinary hands back http:// urls; https pages must not load them as mixed content
export const secureUrl = (u) =>
  typeof u === "string" ? u.replace(/^http:\/\//, "https://") : u;

export const formatPrice = (v) =>
  v === null || v === undefined || v === ""
    ? ""
    : Number(v).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

const Catalog = () => {
  const { allcatalogs, setAllCatalogs } = useContext(globalContext);
  const openNew = useOpenNew();

  // pages are separate routes, so Catalog loads its own data
  const { data, loading, err, doFetch } = useFetch();
  useEffect(() => {
    doFetch({ url: API.catalogs(), method: "GET" });
  }, []);
  useEffect(() => {
    if (data) setAllCatalogs(data);
  }, [data]);

  // fields the API accepts for a catalog item
  const [item, setItem] = useState({
    name: "",
    description: "",
    featured_image: null,
    min_quantity: 10,
    category: "",
    price: "",
  });

  const update = (arg, value) => setItem((prev) => ({ ...prev, [arg]: value }));

  const fields = [
    <Field full label="Name" htmlFor="cat-name">
      <input
        id="cat-name"
        placeholder="Power Bank"
        className={inputClass}
        required
        value={item.name}
        onChange={(e) => update("name", e.target.value)}
      />
    </Field>,

    <Field label="Category" htmlFor="cat-category">
      <select
        id="cat-category"
        className={inputClass}
        required
        value={item.category ?? ""}
        onChange={(e) => update("category", e.target.value)}
      >
        <option value="" disabled>
          Select category
        </option>
        {categories.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
    </Field>,

    <Field label="Price" htmlFor="cat-price">
      <input
        id="cat-price"
        type="number"
        min="0"
        step="0.01"
        inputMode="decimal"
        placeholder="0.00"
        className={inputClass}
        required
        value={item.price}
        onChange={(e) => update("price", e.target.value)}
      />
    </Field>,

    <Field label="Minimum quantity" htmlFor="cat-min">
      <input
        id="cat-min"
        type="number"
        min="1"
        inputMode="numeric"
        className={inputClass}
        required
        value={item.min_quantity}
        onChange={(e) => update("min_quantity", e.target.value)}
      />
    </Field>,

    <Field label="Image (required)" htmlFor="cat-image">
      <ImagePicker
        id="cat-image"
        value={item.featured_image}
        onChange={(file) => update("featured_image", file)}
      />
    </Field>,

    <Field full label="Description" htmlFor="cat-description" hint="Up to 1000 characters.">
      <textarea
        id="cat-description"
        placeholder="What is this item, and who is it for?"
        maxLength={1000}
        className={`${textareaClass} h-36`}
        required
        value={item.description}
        onChange={(e) => update("description", e.target.value)}
      />
    </Field>,
  ];

  const formatters = {
    name: (v, row) => {
      const img = secureUrl(row.featured_image_url || row.featured_image);
      return (
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-10 shrink-0 rounded-lg bg-lilac overflow-hidden flex items-center justify-center text-purple">
            {typeof img === "string" && img ? (
              <img src={img} alt="" loading="lazy" className="size-full object-cover" />
            ) : (
              <LuImage />
            )}
          </div>
          <span className="truncate font-bold" title={v}>
            {v}
          </span>
        </div>
      );
    },
    category: (v) => categoryLabel(v),
    price: (v) => formatPrice(v),
  };

  return (
    <SectionCard
      name="Catalog"
      singular="item"
      subtitle="Products shown on the public catalog."
      button="Add catalog item"
      thead={{
        name: "Item",
        category: "Category",
        min_quantity: "Min qty",
        price: "Price",
        description: "Description",
      }}
      tbody={allcatalogs}
      fields={fields}
      payload={item}
      url={API.catalogs}
      updatepayload={setItem}
      updatedata={setAllCatalogs}
      incrementkey={"TotalBlogs"}
      loading={loading || (data === null && !err)}
      error={!!err}
      initialAddOpen={openNew}
      formatters={formatters}
      editMethod="PATCH"
    />
  );
};

export default Catalog;
