import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface DepartmentHeadingProps {
  name: string;
  description: string;
  image: string;
  website?: string;
}

export default function DepartmentHeading({
  name,
  description,
  image,
  website,
}: DepartmentHeadingProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col md:flex-row gap-6 items-start md:items-center my-8"
    >
      <figure className="w-full md:w-1/3 lg:max-w-sm shadow-md">
        <img
          src={image}
          alt={`${name} department`}
          className="w-full h-auto object-cover rounded"
        />
      </figure>
      <div className="flex-1 space-y-4">
        <h1 className="text-3xl font-bold text-primary">{name}</h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
        {website && (
          <Link
            to={website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Visit Website
          </Link>
        )}
      </div>
    </motion.section>
  );
}
