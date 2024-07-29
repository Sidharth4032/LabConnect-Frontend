import React from "react";
import usePageNavigation from "../../shared/hooks/page-navigation-hook";
import PageNavigation from "../../shared/components/Navigation/PageNavigation";
import BrowseItems from "../components/BrowseItems";
import { useEffect, useState } from "react";

// const FetchGetRequest = () => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchDataForPosts = async () => {
//       const response = await fetch(
//         `https://jsonplaceholder.typicode.com/posts?_limit=8`,
//       );
//       if (!response.ok) {
//         setData(null);
//         return <div></div>;
//       }
//       let postsData = await response.json();
//       setData(postsData);
//       setLoading(false);
//     };

//     fetchDataForPosts();
//   }, []);

//   return <div></div>;
// };

const DUMMY_DATA = {
  to: "/staff",
  items: [
    {
      id: "d1",
      title: "Computer Science",
      image:
        "https://www.stevens.edu/_next/image?url=https%3A%2F%2Fimages.ctfassets.net%2Fmviowpldu823%2F3DjsfDKUSWQBfdWMEbecCQ%2F24f09c374ddb299ee332352fd69e4042%2FSES-Computer-Science-1900862161.jpg%3Fw%3D1200%26h%3D675%26q%3D80%26fit%3Dfill&w=2400&q=80",
    },
    {
      id: "d2",
      title: "Physics",
      image:
        "https://www.stevens.edu/_next/image?url=https%3A%2F%2Fimages.ctfassets.net%2Fmviowpldu823%2F3DjsfDKUSWQBfdWMEbecCQ%2F24f09c374ddb299ee332352fd69e4042%2FSES-Computer-Science-1900862161.jpg%3Fw%3D1200%26h%3D675%26q%3D80%26fit%3Dfill&w=2400&q=80",
    },
    {
      id: "d3",
      title: "Biology",
      image:
        "https://www.stevens.edu/_next/image?url=https%3A%2F%2Fimages.ctfassets.net%2Fmviowpldu823%2F3DjsfDKUSWQBfdWMEbecCQ%2F24f09c374ddb299ee332352fd69e4042%2FSES-Computer-Science-1900862161.jpg%3Fw%3D1200%26h%3D675%26q%3D80%26fit%3Dfill&w=2400&q=80",
    },
    {
      id: "d4",
      title: "Engineering",
      image:
        "https://www.stevens.edu/_next/image?url=https%3A%2F%2Fimages.ctfassets.net%2Fmviowpldu823%2F3DjsfDKUSWQBfdWMEbecCQ%2F24f09c374ddb299ee332352fd69e4042%2FSES-Computer-Science-1900862161.jpg%3Fw%3D1200%26h%3D675%26q%3D80%26fit%3Dfill&w=2400&q=80",
    },
  ],
};

const Browse = () => {
  var [pages, switchPage] = usePageNavigation(
    ["Research Centers", "Departments"],
    "Research Centers",
  );

  var [data, setData] = useState(false);

  useEffect(() => {
    const url = `${process.env.REACT_APP_BACKEND_SERVER}/departments`;
    fetch(url)
      .then((response) => response.json())
      .then((departmentData) => {
        setData(departmentData);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <section className="flex2 gap-3">
      <PageNavigation
        title="Browse Staff"
        pages={pages}
        switchPage={switchPage}
      />

      {!data && <p>Loading...</p>}

      {pages.activePage === "Research Centers" && (
        <BrowseItems to="/staff" items={typeof data == "object" ? data : []} />
      )}

      {pages.activePage === "Departments" && (
        <BrowseItems to="/staff" items={typeof data == "object" ? data : []} />
      )}
      <br />
      <br />
    </section>
  );
};

export default Browse;
