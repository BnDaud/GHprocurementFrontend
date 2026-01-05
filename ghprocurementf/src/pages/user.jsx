import React, { useContext, useEffect, useState } from "react";
import SectionCard from "../component/sectioncard";
import API from "../endpoints/endpoints";
import useFetch from "../hooks/usefetch";
import { AiOutlineLoading } from "react-icons/ai";
import { globalContext } from "../App";

function User() {
  const url = API.users();
  const { data, loading, err, doFetch } = useFetch();

  const { setAllUsers, allusers } = useContext(globalContext);

  useEffect(() => {
    doFetch({
      url: url,
      method: "GET",
    });
  }, []);

  useEffect(() => {
    if (data) setAllUsers(data);
  }, [data]);

  //console.log(data);
  const loadingIcon = (
    <AiOutlineLoading className="text-amber-600 animate-spin" />
  );

  const [userdata, setUserdata] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "",
    dp: null,
    password: "",
  });

  const updateuserdata = (arg, newdata) =>
    setUserdata((prev) => ({ ...prev, [arg]: newdata }));

  const roles = ["Admin", "Viewer", "Editor"];

  const inputStyle =
    "bg-purple/20 px-3 py-2  rounded w-full focus:outline-none focus:ring-2 focus:ring-purple/50";

  const userFields = [
    <div className="w-full">
      <label className="font-semibold mb-1 block">Username</label>
      <input
        placeholder="Username"
        className={inputStyle}
        value={userdata.username}
        required
        onChange={(e) => updateuserdata("username", e.target.value)}
      />
    </div>,
    <div className="w-full">
      <label className="font-semibold mb-1 block">First Name</label>
      <input
        placeholder="First Name"
        className={inputStyle}
        value={userdata.first_name}
        required
        onChange={(e) => updateuserdata("first_name", e.target.value)}
      />
    </div>,
    <div className="w-full">
      <label className="font-semibold mb-1 block">Last Name</label>
      <input
        placeholder="Last Name"
        className={inputStyle}
        value={userdata.last_name}
        required
        onChange={(e) => updateuserdata("last_name", e.target.value)}
      />
    </div>,
    <div className="w-full">
      <label className="font-semibold mb-1 block">Email</label>
      <input
        type="email"
        placeholder="Email"
        className={inputStyle}
        value={userdata.email}
        required
        onChange={(e) => updateuserdata("email", e.target.value)}
      />
    </div>,
    <div className="w-full">
      <label className="font-semibold mb-1 block">Phone Number</label>
      <input
        placeholder="+1 000 999"
        className={inputStyle}
        value={userdata.phone}
        required
        onChange={(e) => updateuserdata("phone", e.target.value)}
      />
    </div>,
    <div className="w-full">
      <label className="font-semibold mb-1 block">Password</label>
      <input
        type="password"
        placeholder="Password"
        className={inputStyle}
        value={userdata.password}
        required
        onChange={(e) => updateuserdata("password", e.target.value)}
      />
    </div>,
    <div className="w-full">
      <label className="font-semibold mb-1 block">Role</label>
      <select
        className={inputStyle}
        value={userdata.role}
        required
        onChange={(e) => updateuserdata("role", e.target.value)}
      >
        <option value="" disabled>
          Select Role
        </option>
        {roles.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
    </div>,
    <div className="w-full">
      <label className="font-semibold mb-1 block">Image</label>
      <input
        type="file"
        accept=".jpg, .png, .jpeg"
        className={inputStyle}
        onChange={(e) => {
          if (e.target.files.length > 0) {
            updateuserdata("dp", e.target.files[0]);
          }
        }}
      />
      {userdata.dp && (
        <img
          src={
            typeof userdata.dp === "string"
              ? userdata.dp // existing image URL
              : URL.createObjectURL(userdata.dp) // newly selected file
          }
          alt="Preview"
          className="mt-2 w-24 h-24  object-cover border"
        />
      )}
    </div>,
  ];

  return (
    <>
      <div className=" bg-light rounded-2xl min-h-50 shadow-2xl p-6 ">
        <div>
          <SectionCard
            name={"Users"}
            button={"Add New User"}
            thead={{ username: "", email: "", phone: "", role: "" }} //
            tbody={allusers}
            fields={userFields}
            payload={userdata}
            url={API.users}
            updatepayload={setUserdata}
            updatedata={setAllUsers}
            incrementkey={"TotalUsers"}
          />
        </div>
      </div>
    </>
  );
}

export default User;
