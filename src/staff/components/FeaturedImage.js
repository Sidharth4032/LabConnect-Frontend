import React from "react";

const FeaturedImage = ({ className, image, label }) => {
  return (
    <figure className={`${className} featimage lg:min-w-96`}>
      <img src={image} alt={label} />
    </figure>
  );
};

export default FeaturedImage;
