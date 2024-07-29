import React from "react";
import { useParams } from "react-router";
import Breadcrumb from "../../shared/components/UIElements/Breadcrumb";
import CenterHero from "../components/CenterHero";
import CenterStaff from "../components/CenterStaff";
import { useState, useEffect } from "react";

const Center = ({ linkTree }) => {
  const { centerName } = useParams();

  const [data, setData] = useState(false);

  useEffect(() => {
    const url = `${process.env.REACT_APP_BACKEND_SERVER}/department/${centerName}`;

    fetch(url)
      .then((response) => response.json())
      .then((centerData) => {
        setData(centerData);
        data.error && setData("error");
      })
      .catch((error) => {
        setData("error");
      });
  }, []);

  return (
    <section className="center container-xl">
      <Breadcrumb
        tree={[
          {
            link: "/staff",
            title: "Staff",
          },
          {
            link: `/center/${centerName}`,
            title: centerName,
          },
        ]}
      />

      {!data && <p>Loading...</p>}
      {data === "error" && <p>Center Not Found</p>}
      {data != "error" && data && (
        <div>
          <CenterHero
            image={data.image}
            title={data.name}
            description={data.description}
          />
          <CenterStaff professors={data.professors} />
        </div>
      )}
    </section>
  );
};

export default Center;
