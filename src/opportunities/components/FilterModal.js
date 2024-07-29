import React, { useState, useEffect } from "react";
import {
  Modal,
  Fade,
  Typography,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";

const FormHeader = ({ handleClose }) => {
  return (
    <div
      style={{
        backgroundColor: "white",
        position: "sticky",
        top: 0,
        zIndex: 1,
        height: 80,
        padding: "25px 20px",
        borderBottom: "1px solid #ccc",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Typography variant="h5" gutterBottom style={{ fontWeight: "bold" }}>
          Filter Options
        </Typography>
        <Button onClick={handleClose} style={{ fontWeight: "bold" }}>
          X
        </Button>
      </div>
    </div>
  );
};

const FormFooter = ({ handleClear, handleShowResults }) => {
  return (
    <div
      style={{
        backgroundColor: "white",
        borderTop: "1px solid #ccc",
        padding: "10px 20px",
        boxShadow:
          "0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button onClick={handleClear} variant="outlined" color="error">
          Clear
        </Button>
        <Button onClick={handleShowResults} variant="contained" color="primary">
          Show Results
        </Button>
      </div>
    </div>
  );
};

const FormContent = ({ checkedItems, setCheckedItems, departments }) => {
  return (
    <div
      style={{
        overflowY: "auto",
        maxHeight: "calc(80vh - 172px)",
        padding: "20px",
        paddingRight: "20px",
      }}
    >
      {/* <div>
        <Typography variant="h6" gutterBottom>
          Pay
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={checkedItems.paid}
              onChange={() =>
                setCheckedItems({ ...checkedItems, paid: !checkedItems.paid })
              }
            />
          }
          label="Paid"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={checkedItems.credit}
              onChange={() =>
                setCheckedItems({
                  ...checkedItems,
                  credit: !checkedItems.credit,
                })
              }
            />
          }
          label="Credit"
        />
      </div> */}
      <div>
        <Typography variant="h6" gutterBottom>
          Onsite/Remote
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={checkedItems.onsite}
              onChange={() =>
                setCheckedItems({
                  ...checkedItems,
                  onsite: !checkedItems.onsite,
                })
              }
            />
          }
          label="Onsite"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={checkedItems.remote}
              onChange={() =>
                setCheckedItems({
                  ...checkedItems,
                  remote: !checkedItems.remote,
                })
              }
            />
          }
          label="Remote"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={checkedItems.hybrid}
              onChange={() =>
                setCheckedItems({
                  ...checkedItems,
                  hybrid: !checkedItems.hybrid,
                })
              }
            />
          }
          label="Hybrid"
        />
      </div>
      <div>
        <Typography variant="h6" gutterBottom>
          Majors
        </Typography>
        <Select
          multiple
          value={checkedItems.majors}
          onChange={(event) =>
            setCheckedItems({
              ...checkedItems,
              majors: event.target.value,
            })
          }
          style={{ width: 300 }}
          MenuProps={{
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "left",
            },
            transformOrigin: {
              vertical: "top",
              horizontal: "left",
            },
            getContentAnchorEl: null,
            PaperProps: {
              style: {
                marginTop: 8,
                marginLeft: 0,
              },
            },
          }}
        >
          {departments.map((department) => (
            <MenuItem key={department.code} value={department.code}>
              {department.name}
            </MenuItem>
          ))}
        </Select>
      </div>
      <div>
        <Typography variant="h6" gutterBottom>
          Departments
        </Typography>
        <Select
          multiple
          value={checkedItems.majors}
          onChange={(event) =>
            setCheckedItems({
              ...checkedItems,
              departments: event.target.value,
            })
          }
          style={{ width: 300 }}
          MenuProps={{
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "left",
            },
            transformOrigin: {
              vertical: "top",
              horizontal: "left",
            },
            getContentAnchorEl: null,
            PaperProps: {
              style: {
                marginTop: 8,
                marginLeft: 0,
              },
            },
          }}
        >
          {departments.map((department) => (
            <MenuItem key={department.code} value={department.name}>
              {department.name}
            </MenuItem>
          ))}
        </Select>
      </div>
      {/* <div>
        <Typography variant="h6" gutterBottom>
          Salary Range
        </Typography>
        <Select
          style={{ width: 300 }}
          value={selectedSalaryRange}
          onChange={(event) => setSelectedSalaryRange(event.target.value)}
        >
          <MenuItem value="<15">&lt; $15</MenuItem>
          <MenuItem value="15-18">$15 - $18</MenuItem>
          <MenuItem value="18">$18</MenuItem>
        </Select>
      </div> */}
    </div>
  );
};

const FilterModal = ({ open, handleClose }) => {
  const [checkedItems, setCheckedItems] = useState({
    paid: false,
    credit: false,
    onsite: false,
    remote: false,
    hybrid: false,
    minSalary: 0,
    departments: [],
    majors: [],
  });

  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/quacs/quacs-data/master/semester_data/202409/schools.json",
    )
      .then((response) => response.json())
      .then((data) => {
        const extractedDepartments = data.flatMap((school) => school.depts);
        setDepartments(extractedDepartments);
      })
      .catch((error) => console.error("Error fetching departments:", error));
  }, []);

  const handleClear = () => {
    setCheckedItems({
      departments: [],
      majors: [],
      paid: false,
      credit: false,
      onsite: false,
      remote: false,
      hybrid: false,
      minSalary: 0,
    });
  };

  const formatFilterJson = () => {
    let jsonData = { filters: [] };

    let singleFilter = { field: "majors", value: [] };

    // start by adding departments
    checkedItems.majors.forEach((value) => {
      singleFilter.value.push(value);
    });

    jsonData.filters.push({ ...singleFilter });

    // reset to reuse this variable for departments
    singleFilter.field = "departments";
    singleFilter.value = [];

    checkedItems.departments.forEach((value) => {
      singleFilter.value.push(value);
    });

    jsonData.filters.push({ ...singleFilter });

    // set for pay
    singleFilter.field = "pay";
    singleFilter.value = { min: checkedItems.minSalary, max: 100000 };
    jsonData.filters.push({ ...singleFilter });

    // set up for remote or onsite
    if (checkedItems.remote) {
      singleFilter.value = "Remote";
    }

    if (checkedItems.onsite) {
      singleFilter.value = "In-Person";
    }

    if (typeof singleFilter.value === "string") {
      singleFilter.field = "location";
      jsonData.filters.push({ ...singleFilter });
    }

    return jsonData;
  };

  const handleShowResults = () => {
    // need to add code to show results here
    // console.log(checkedItems);

    const jsonData = formatFilterJson();
    console.log(jsonData);

    // fetch from backend with filters applied

    const url = `${process.env.REACT_APP_BACKEND_SERVER}/opportunity/filter`;
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => console.error("Error filtering opportunities:", error));

    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      closeAfterTransition
    >
      <Fade in={open}>
        <div
          style={{
            backgroundColor: "white",
            width: 400,
            maxWidth: "100%",
            maxHeight: "80%",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            outline: "none",
            borderRadius: 8,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <FormHeader handleClose={handleClose} />
          <FormContent
            checkedItems={checkedItems}
            setCheckedItems={setCheckedItems}
            departments={departments}
          />
          <div style={{ flex: 1 }}></div>
          <FormFooter
            handleClear={handleClear}
            handleShowResults={handleShowResults}
          />
        </div>
      </Fade>
    </Modal>
  );
};

export default FilterModal;
