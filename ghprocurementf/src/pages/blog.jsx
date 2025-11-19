import SectionCard from "../component/sectioncard";

const Blog = () => {
  const dummyData = [
    {
      Title: "The Lost Kingdom",
      Author: "John Doe",
      Categories: "Fantasy, Adventure",
      Status: "Published",
      Date: "2024-03-12",
    },
    {
      Title: "Time and Tide",
      Author: "Emily Carter",
      Categories: "Drama",
      Status: "Draft",
      Date: "2024-01-08",
    },
    {
      Title: "Machines of Tomorrow",
      Author: "Alex Kim",
      Categories: "Sci-Fi, Technology",
      Status: "Draft",
      Date: "2023-11-20",
    },
    {
      Title: "Cooking on a Budget",
      Author: "Maria Lopez",
      Categories: "Cooking, Lifestyle",
      Status: "Published",
      Date: "2024-02-01",
    },
  ];

  return (
    <>
      <div className=" bg-light rounded-2xl min-h-50 shadow-2xl p-6 ">
        <div>
          <SectionCard
            name={"Blog Posts"}
            button={" Add New Post"}
            thead={dummyData[0]}
            tbody={dummyData}
          />
        </div>
      </div>
    </>
  );
};

export default Blog;
