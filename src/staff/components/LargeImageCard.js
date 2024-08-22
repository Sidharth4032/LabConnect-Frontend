import React from "react";
import { Link } from "react-router-dom";

const LargeImageCard = ({ to, image, title }) => {
  return (
    <Link to={to} className="no-underline">
      <div className="lg-img-card border-2 border-gray-400 card hover:shadow-md hover:border-black duration-175">
        <figure>
          <img src={image} alt={title} />
        </figure>
        <div className="card-body">
          <h2 className="card-title">{title}</h2>
        </div>
      </div>
    </Link>
  );
};

export default LargeImageCard;
