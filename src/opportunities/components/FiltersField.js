import React from "react";
import SmallTextButton from "./SmallTextButton";
import SearchBar from "./SearchBar";
import GroupedComponents from "../../shared/components/UIElements/GroupedComponents";
import HorizontalIconButton from "./HorizontalIconButton";
import { PiSlidersHorizontal } from "react-icons/pi";
import { MdCancel } from "react-icons/md";
import { useState } from "react";
import FilterModal from "./FilterModal";

const FiltersField = ({ deleteFilter, filters }) => {
  const [showModal, setShowModal] = useState(false);

  // Function to open the modal
  const openModal = () => {
    setShowModal(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div>
      <hr />
      <div className="filters-template">
        <div className="filters-search">
          <SearchBar />

          <GroupedComponents gap={2}>
            {filters.map((filter) => {
              return (
                <HorizontalIconButton
                  onClick={deleteFilter}
                  icon={<MdCancel />}
                  key={filter}
                >
                  {filter}
                </HorizontalIconButton>
              );
            })}
          </GroupedComponents>
        </div>

        <SmallTextButton
          className="all-filters-btn"
          special={true}
          onClick={openModal}
        >
          <PiSlidersHorizontal />
          All Filters
        </SmallTextButton>
      </div>
      <hr />
      {/* Render the FilterModal component and pass open/close functions */}
      <FilterModal open={showModal} handleClose={closeModal} />
    </div>
  );
};

export default FiltersField;
