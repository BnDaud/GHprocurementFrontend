import React, { useContext, useEffect, useState } from "react";
import SectionCard from "../component/sectioncard";
import ImagePicker from "../component/imagepicker";
import { Field, inputClass } from "../component/ui";
import useOpenNew from "../hooks/useopennew";
import API from "../endpoints/endpoints";
import useFetch from "../hooks/usefetch";
import { globalContext } from "../App";

function User() {
  const url = API.users();
  const { data, loading, err, doFetch } = useFetch();
  const openNew = useOpenNew();

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

  const userFields = [
    <Field label="Username" htmlFor="user-username">
      <input
        id="user-username"
        placeholder="Username"
        className={inputClass}
        value={userdata.username}
        required
        onChange={(e) => updateuserdata("username", e.target.value)}
      />
    </Field>,
    <Field label="Role" htmlFor="user-role">
      <select
        id="user-role"
        className={inputClass}
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
    </Field>,
    <Field label="First Name" htmlFor="user-first">
      <input
        id="user-first"
        placeholder="First Name"
        className={inputClass}
        value={userdata.first_name}
        required
        onChange={(e) => updateuserdata("first_name", e.target.value)}
      />
    </Field>,
    <Field label="Last Name" htmlFor="user-last">
      <input
        id="user-last"
        placeholder="Last Name"
        className={inputClass}
        value={userdata.last_name}
        required
        onChange={(e) => updateuserdata("last_name", e.target.value)}
      />
    </Field>,
    <Field label="Email" htmlFor="user-email">
      <input
        id="user-email"
        type="email"
        placeholder="Email"
        className={inputClass}
        value={userdata.email}
        required
        onChange={(e) => updateuserdata("email", e.target.value)}
      />
    </Field>,
    <Field label="Phone Number" htmlFor="user-phone">
      <input
        id="user-phone"
        placeholder="+1 000 999"
        className={inputClass}
        value={userdata.phone}
        required
        onChange={(e) => updateuserdata("phone", e.target.value)}
      />
    </Field>,
    <Field full label="Password" htmlFor="user-password">
      <input
        id="user-password"
        type="password"
        placeholder="Password"
        className={inputClass}
        value={userdata.password}
        required
        onChange={(e) => updateuserdata("password", e.target.value)}
      />
    </Field>,
    <Field full label="Image" htmlFor="user-dp">
      <ImagePicker
        id="user-dp"
        accept=".jpg, .png, .jpeg"
        size="size-24"
        value={userdata.dp}
        onChange={(file) => updateuserdata("dp", file)}
      />
    </Field>,
  ];

  return (
    <SectionCard
      name={"Users"}
      singular="user"
      subtitle="People who can sign in to this dashboard."
      button={"Add New User"}
      thead={{ username: "", email: "", phone: "", role: "" }} //
      tbody={allusers}
      fields={userFields}
      payload={userdata}
      url={API.users}
      updatepayload={setUserdata}
      updatedata={setAllUsers}
      incrementkey={"TotalUsers"}
      loading={loading || (data === null && !err)}
      error={!!err}
      initialAddOpen={openNew}
    />
  );
}

export default User;
