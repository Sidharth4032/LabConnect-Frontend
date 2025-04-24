import React from "react";
import PropTypes from "prop-types";
import LargeImageCard from "./LargeImageCard";
import { motion } from "framer-motion";

const DepartmentItems = ({ items }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.15 } },
      }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {items.map((item) => (
        <motion.div
          key={item.department_id}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        >
          <LargeImageCard
            to={`/staff/department/${item.department_id}`}
            title={item.title}
            image={item.image}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

DepartmentItems.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      department_id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default DepartmentItems;
