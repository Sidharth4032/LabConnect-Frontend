import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

const CheckBox = ({
  formHook,
  errors,
  errorMessage,
  name,
  label,
  options,
  type,
}) => {
  const error = errors && errors[name];

  return (
    <div className="mb-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="check-input"
      >
        <label className="block mb-2 font-medium text-lg">{label}</label>
        {error && <p className="text-red-500 text-sm mb-2">{errorMessage}</p>}

        <div className="grid grid-cols-2 gap-2">
          {options?.map((item) => (
            <div key={item} className="form-control flex items-center gap-2">
              <label className="inline-flex items-center space-x-3 cursor-pointer">
                <input
                  type={type === "radio" ? "radio" : "checkbox"}
                  value={item}
                  id={`${name}-${item}`}
                  {...formHook}
                  className={`${
                    type === "radio" ? "radio" : "checkbox"
                  } checked:bg-blue-600`}
                />
                <span>{item}</span>
              </label>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

CheckBox.propTypes = {
  formHook: PropTypes.object,
  errors: PropTypes.object,
  errorMessage: PropTypes.string,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.string),
  type: PropTypes.string,
};

export default CheckBox;
