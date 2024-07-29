import React from "react";
import FeaturedImage from "./FeaturedImage";
import ProfileDescription from "./ProfileDescription";

const CenterHero = ({ title, description, image }) => {
  return (
    <div className="flex">
      <div className="flex2 lg:flex-row gap-5">
        <FeaturedImage image={image} label={title} />
        <ProfileDescription name={title} description={description} />
      </div>
    </div>
  );
};

export default CenterHero;
