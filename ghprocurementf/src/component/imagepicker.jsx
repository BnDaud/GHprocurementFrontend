import { useEffect, useMemo } from "react";
import { LuUpload } from "react-icons/lu";

// value is either a File (just picked) or a string URL (already on the server)
const ImagePicker = ({ id, value, onChange, accept = "image/*", size = "size-28" }) => {
  const preview = useMemo(() => {
    if (!value) return null;
    return typeof value === "string"
      ? value.replace(/^http:\/\//, "https://")
      : URL.createObjectURL(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (preview && typeof value !== "string") URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div className="flex items-center gap-4">
      <div
        className={`${size} shrink-0 rounded-xl border border-line bg-bgcolor overflow-hidden flex items-center justify-center text-muted`}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="size-full object-cover" />
        ) : (
          <LuUpload className="text-2xl" />
        )}
      </div>
      <label
        htmlFor={id}
        className="inline-flex items-center gap-2 h-11 px-4 rounded-xl border border-dashed border-[#b9a6c4] bg-lilac/50 text-purple text-sm font-bold cursor-pointer hover:bg-lilac focus-within:outline-2"
      >
        {preview ? "Change image" : "Choose image"}
        <input
          id={id}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            if (e.target.files.length > 0) onChange(e.target.files[0]);
          }}
        />
      </label>
    </div>
  );
};

export default ImagePicker;
