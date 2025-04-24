import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import AvatarCard from "../../shared/components/UIElements/AvatarCard";
import { motion } from "framer-motion";

const DepartmentStaff = ({ staff }) => {
  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.1 },
        },
      }}
    >
      {staff.map((member) => (
        <motion.div
          key={member.id}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        >
          <Link to={`/staff/${member.id}`} className="no-underline block">
            <AvatarCard name={member.name} img={member.image} />
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
};

DepartmentStaff.propTypes = {
  staff: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default DepartmentStaff;
