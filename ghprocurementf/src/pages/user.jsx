import React from "react";
import SectionCard from "../component/sectioncard";

function User() {
  const dummyData = [
    {
      Name: "John Doe",
      Email: "john.doe@example.com",
      Role: "Admin",
      Status: "Active",
      "Last Login": "2025-01-14 09:22",
    },
    {
      Name: "Sarah Adams",
      Email: "sarah.adams@example.com",
      Role: "Editor",
      Status: "Inactive",
      "Last Login": "2025-01-10 14:55",
    },
    {
      Name: "Michael Brown",
      Email: "michael.brown@example.com",
      Role: "Viewer",
      Status: "Active",
      "Last Login": "2025-01-17 11:08",
    },
    {
      Name: "Emily Carter",
      Email: "emily.carter@example.com",
      Role: "Editor",
      Status: "Dormant",
      "Last Login": "2024-12-28 18:42",
    },
  ];

  return (
    <>
      <div className=" bg-light rounded-2xl min-h-50 shadow-2xl p-6 ">
        <div>
          <SectionCard
            name={"Users"}
            button={"Add New User"}
            thead={dummyData[0]}
            tbody={dummyData}
          />
        </div>
      </div>
    </>
  );
}

export default User;
